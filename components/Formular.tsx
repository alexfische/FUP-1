import React, { useState, useEffect, useRef } from 'react';
import { SteinformatData } from '../types';
import { SaveIcon, CancelIcon, CameraIcon, XMarkIcon } from './Icons';

interface FormularProps {
  initialData: SteinformatData | null;
  onSave: (form: SteinformatData) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

const createEmptyForm = (): Omit<SteinformatData, 'id'> => ({
    espNr: '', formatBezeichnung: '', beschriftungAufDemStein: '', material: '', datum: new Date().toISOString().split('T')[0], abmessungen: '',
    mundstueckNr: '', presskopf: '', sonstigeEinstellungen: '', pressprogramm: '', hilfsmittelFotos: [],
    // Vortrieb
    vortriebOben1: '', vortriebOben2: '', vortriebOben3: '',
    vortriebUnten1: '', vortriebUnten2: '', vortriebUnten3: '',
    vortriebLinks1: '', vortriebLinks2: '', vortriebLinks3: '',
    vortriebRechts1: '', vortriebRechts2: '', vortriebRechts3: '',
    vortriebZentrum: '',
    // Presse
    austrag: '', schnittlaengeNass: '',
    siebmischer: '', wasserSiebmischer: '', dampfSiebmischer: '',
    gewichtNass: '',
    mischer: '', wasserMischer: '', dampfMischer: '',
    pressendruck: '',
    presse: '', tonreiniger: '', schnecke: '', rostkorb: '', styropor: '',
    // Abschneider
    abschneidetisch: 'Normal', freimatikProduktname: '', hubhoehe: '', schnittlaenge: '',
    vorschub: '', drehvorrichtung: 'Aus', anzahlSchneidedraehte: '', offsetDrehvorr: '', drahtabstand: '',
    geschwLinglBandbruecke: '', abziehblechNr: '', drahtreiniger: 'Aus', schabloneNr: '', abfallAuswerfer: 'Aus',
    drahtdurchmesser: '', drahtnachzug: 'Aus', geschwFuerNachfBand: ''
});

const InputField = ({ label, name, defaultValue, readOnly, type = "text", step }: { label: string, name: string, defaultValue: any, readOnly: boolean, type?: string, step?: string }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      step={step}
      defaultValue={defaultValue}
      readOnly={readOnly}
      disabled={readOnly}
      className={`bg-white text-black border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 transition-colors ${readOnly ? 'cursor-not-allowed' : ''}`}
    />
  </div>
);

const VortriebInput = ({ name, defaultValue, readOnly, className }: { name: string, defaultValue: any, readOnly: boolean, className?: string }) => (
    <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        readOnly={readOnly}
        disabled={readOnly}
        className={`w-12 h-8 bg-white text-black text-center border border-gray-400 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${className || ''}`}
        title={name}
    />
);

const BooleanSelect = ({ label, name, defaultValue, readOnly }: { label: string, name: string, defaultValue: string, readOnly: boolean }) => (
    <div className="flex flex-col">
        <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-700">{label}</label>
        <select
            id={name}
            name={name}
            defaultValue={defaultValue}
            disabled={readOnly}
            className={`bg-white text-black border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 ${readOnly ? 'cursor-not-allowed' : ''}`}
        >
            <option value="Ein">Ein</option>
            <option value="Aus">Aus</option>
        </select>
    </div>
);

const Formular: React.FC<FormularProps> = ({ initialData, onSave, onCancel, readOnly = false }) => {
  const [defaultValues, setDefaultValues] = useState<Omit<SteinformatData, 'id'> & { id?: string }>(
    initialData || createEmptyForm()
  );
  const [images, setImages] = useState<string[]>([]);
  const [pressProgramm, setPressProgramm] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const empty = createEmptyForm();
    const data = initialData ? { ...empty, ...initialData } : empty;
    setDefaultValues(data);
    setImages(data.hilfsmittelFotos || []);
    setPressProgramm(data.pressprogramm || '');
  }, [initialData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
             setImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file as Blob);
      });
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    if (readOnly) return;
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleOpenImage = (imgSrc: string) => {
      const win = window.open();
      if (win) {
          win.document.write(`<img src="${imgSrc}" style="max-width:100%;" />`);
          win.document.title = "Bildansicht";
      }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (readOnly) return;

    const formData = new FormData(e.currentTarget);
    const data: any = { id: initialData?.id || crypto.randomUUID(), ...defaultValues };

    // Helper to update data from formData
    formData.forEach((value, key) => {
        if (typeof value === 'string') {
            data[key] = value;
        }
    });

    // Explicitly set fields that might be controlled by state or arrays
    data.hilfsmittelFotos = images;
    data.pressprogramm = pressProgramm; // Ensure state value is saved

    onSave(data as SteinformatData);
  };

  // Conditional Logic
  const hideSiebmischerGroup = pressProgramm === 'Presse ohne Siebmischer,Tonreiniger';
  const hideTonreinigerGroup = pressProgramm === 'Presse ohne Siebmischer,Tonreiniger' || pressProgramm === 'Presse+Siebmischer';

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-8">
      {/* Header Section */}
      <div className="border-b pb-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="md:col-span-1">
                <InputField label="ESP №" name="espNr" defaultValue={defaultValues.espNr} readOnly={readOnly} />
            </div>
            <div className="md:col-span-2">
                <InputField label="Format-Bezeichnung" name="formatBezeichnung" defaultValue={defaultValues.formatBezeichnung} readOnly={readOnly} />
            </div>
            <div className="md:col-span-2">
                <InputField label="Beschriftung auf dem Stein" name="beschriftungAufDemStein" defaultValue={defaultValues.beschriftungAufDemStein} readOnly={readOnly} />
            </div>
            <div className="grid grid-cols-2 gap-4 md:col-span-1">
                <InputField label="Material" name="material" defaultValue={defaultValues.material} readOnly={readOnly} />
                <InputField label="Datum" name="datum" type="date" defaultValue={defaultValues.datum} readOnly={readOnly} />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="flex flex-col">
                <InputField label="Abmessungen (L x B x H)" name="abmessungen" defaultValue={defaultValues.abmessungen} readOnly={readOnly} />
                <div className="mt-4">
                    <label className="mb-1 text-sm font-medium text-gray-700">Pressprogramm wählen</label>
                    <select
                        name="pressprogramm"
                        value={pressProgramm}
                        onChange={(e) => setPressProgramm(e.target.value)}
                        disabled={readOnly}
                        className={`w-full bg-white text-black border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? 'cursor-not-allowed disabled:bg-gray-100' : ''}`}
                    >
                        <option value="">Bitte wählen...</option>
                        <option value="Presse ohne Siebmischer,Tonreiniger">Presse ohne Siebmischer,Tonreiniger</option>
                        <option value="Presse+Siebmischer">Presse+Siebmischer</option>
                        <option value="Presse+Siebmischer+Tonreiniger">Presse+Siebmischer+Tonreiniger</option>
                    </select>
                </div>
            </div>
            <InputField label="Mundstück - Nr." name="mundstueckNr" defaultValue={defaultValues.mundstueckNr} readOnly={readOnly} />
            <InputField label="Presskopf" name="presskopf" defaultValue={defaultValues.presskopf} readOnly={readOnly} />
        </div>
      </div>

      {/* Main Layout: Vortrieb, Sonstige, Presse */}
      <div className="space-y-8">
        
        {/* Grundeinstellung Vortrieb - Flexbox Layout */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
            <legend className="text-lg font-semibold text-gray-700 px-2">Grundeinstellung Vortrieb</legend>
            <div className="flex justify-center mt-4">
                 <div className="flex flex-col items-center gap-4 bg-gray-100 p-6 rounded-lg border border-gray-200">
                    {/* Top Row - Horizontal */}
                    <div className="flex gap-4">
                        <VortriebInput name="vortriebOben1" defaultValue={defaultValues.vortriebOben1} readOnly={readOnly} />
                        <VortriebInput name="vortriebOben2" defaultValue={defaultValues.vortriebOben2} readOnly={readOnly} />
                        <VortriebInput name="vortriebOben3" defaultValue={defaultValues.vortriebOben3} readOnly={readOnly} />
                    </div>

                    <div className="flex gap-4 items-center">
                        {/* Left Column - Vertical */}
                        <div className="flex flex-col gap-4">
                            <VortriebInput name="vortriebLinks1" defaultValue={defaultValues.vortriebLinks1} readOnly={readOnly} />
                            <VortriebInput name="vortriebLinks2" defaultValue={defaultValues.vortriebLinks2} readOnly={readOnly} />
                            <VortriebInput name="vortriebLinks3" defaultValue={defaultValues.vortriebLinks3} readOnly={readOnly} />
                        </div>

                        {/* Center - Larger */}
                        <VortriebInput 
                            name="vortriebZentrum" 
                            defaultValue={defaultValues.vortriebZentrum} 
                            readOnly={readOnly} 
                            className="w-40 h-24 border-blue-500 border-2 font-bold text-xl" 
                        />

                        {/* Right Column - Vertical */}
                        <div className="flex flex-col gap-4">
                            <VortriebInput name="vortriebRechts1" defaultValue={defaultValues.vortriebRechts1} readOnly={readOnly} />
                            <VortriebInput name="vortriebRechts2" defaultValue={defaultValues.vortriebRechts2} readOnly={readOnly} />
                            <VortriebInput name="vortriebRechts3" defaultValue={defaultValues.vortriebRechts3} readOnly={readOnly} />
                        </div>
                    </div>

                    {/* Bottom Row - Horizontal */}
                    <div className="flex gap-4">
                        <VortriebInput name="vortriebUnten1" defaultValue={defaultValues.vortriebUnten1} readOnly={readOnly} />
                        <VortriebInput name="vortriebUnten2" defaultValue={defaultValues.vortriebUnten2} readOnly={readOnly} />
                        <VortriebInput name="vortriebUnten3" defaultValue={defaultValues.vortriebUnten3} readOnly={readOnly} />
                    </div>
                 </div>
            </div>
        </fieldset>

        {/* Sonstige Einstellungen und Hilfsmittel */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
            <legend className="text-lg font-semibold text-gray-700 px-2">Sonstige Einstellungen und Hilfsmittel</legend>
            <div className="space-y-4">
                <textarea
                    name="sonstigeEinstellungen"
                    defaultValue={defaultValues.sonstigeEinstellungen}
                    disabled={readOnly}
                    rows={4}
                    className={`w-full bg-white text-black border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                />
                
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Fotos von Hilfsmitteln</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {images.map((img, index) => (
                            <div key={index} className="relative group w-full h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                <img 
                                    src={img} 
                                    alt={`Hilfsmittel ${index + 1}`} 
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-150 group-hover:z-50 group-hover:shadow-xl origin-center relative z-10"
                                />
                                <div className="absolute inset-0 z-20 flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                     <button
                                        type="button"
                                        onClick={() => handleOpenImage(img)}
                                        className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded pointer-events-auto"
                                     >
                                        öffnen
                                     </button>
                                </div>
                                {!readOnly && (
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 focus:outline-none z-50"
                                    >
                                        <XMarkIcon />
                                    </button>
                                )}
                            </div>
                        ))}
                        {!readOnly && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                            >
                                <CameraIcon />
                                <span className="text-xs mt-1 text-center px-1">Foto von Hilfsmitteln hinzufügen</span>
                            </button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                            multiple
                        />
                    </div>
                </div>
            </div>
        </fieldset>

        {/* Presse */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
            <legend className="text-lg font-semibold text-gray-700 px-2">Presse</legend>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InputField label="Austrag" name="austrag" defaultValue={defaultValues.austrag} readOnly={readOnly} />
                <InputField label="Schnittlänge (nass)" name="schnittlaengeNass" defaultValue={defaultValues.schnittlaengeNass} readOnly={readOnly} />
                
                {!hideSiebmischerGroup ? (
                    <>
                        <InputField label="Siebmischer" name="siebmischer" defaultValue={defaultValues.siebmischer} readOnly={readOnly} />
                        <InputField label="Wasser Siebmischer" name="wasserSiebmischer" defaultValue={defaultValues.wasserSiebmischer} readOnly={readOnly} />
                        <InputField label="Dampf Siebmischer" name="dampfSiebmischer" defaultValue={defaultValues.dampfSiebmischer} readOnly={readOnly} />
                    </>
                ) : (
                    // Placeholders to keep grid structure if needed, or leave empty to reflow
                    <>
                        <div className="hidden md:block"></div>
                        <div className="hidden md:block"></div>
                        <div className="hidden md:block"></div>
                    </>
                )}

                <InputField label="Gewicht (nass)" name="gewichtNass" defaultValue={defaultValues.gewichtNass} readOnly={readOnly} />
                
                <InputField label="Mischer" name="mischer" defaultValue={defaultValues.mischer} readOnly={readOnly} />
                <InputField label="Wasser Mischer" name="wasserMischer" defaultValue={defaultValues.wasserMischer} readOnly={readOnly} />
                <InputField label="Dampf Mischer" name="dampfMischer" defaultValue={defaultValues.dampfMischer} readOnly={readOnly} />

                <InputField label="Pressendruck" name="pressendruck" defaultValue={defaultValues.pressendruck} readOnly={readOnly} />
                <InputField label="Presse" name="presse" defaultValue={defaultValues.presse} readOnly={readOnly} />
                
                {!hideTonreinigerGroup ? (
                    <>
                         <InputField label="Tonreiniger" name="tonreiniger" defaultValue={defaultValues.tonreiniger} readOnly={readOnly} />
                         <InputField label="Schnecke" name="schnecke" defaultValue={defaultValues.schnecke} readOnly={readOnly} />
                         <InputField label="Rostkorb" name="rostkorb" defaultValue={defaultValues.rostkorb} readOnly={readOnly} />
                    </>
                ) : (
                     <>
                         <div className="hidden md:block"></div>
                         <div className="hidden md:block"></div>
                         <div className="hidden md:block"></div>
                     </>
                )}

                <InputField label="Styropor" name="styropor" defaultValue={defaultValues.styropor} readOnly={readOnly} />
            </div>
        </fieldset>

        {/* Abschneider */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
             <legend className="text-lg font-semibold text-gray-700 px-2">Abschneider</legend>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">Abschneidetisch</label>
                    <select
                        name="abschneidetisch"
                        defaultValue={defaultValues.abschneidetisch}
                        disabled={readOnly}
                        className={`bg-white text-black border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? 'cursor-not-allowed disabled:bg-gray-100' : ''}`}
                    >
                        <option value="Normal">Normal</option>
                        <option value="Deckenziegel">Deckenziegel</option>
                        <option value="Juwö">Juwö</option>
                    </select>
                </div>

                <InputField label="Freimatik-Produktname" name="freimatikProduktname" defaultValue={defaultValues.freimatikProduktname} readOnly={readOnly} />
                <InputField label="Hubhöhe" name="hubhoehe" defaultValue={defaultValues.hubhoehe} readOnly={readOnly} />
                <InputField label="Schnittlänge" name="schnittlaenge" defaultValue={defaultValues.schnittlaenge} readOnly={readOnly} />
                <InputField label="Vorschub" name="vorschub" defaultValue={defaultValues.vorschub} readOnly={readOnly} />
                
                <BooleanSelect label="Drehvorrichtung" name="drehvorrichtung" defaultValue={defaultValues.drehvorrichtung} readOnly={readOnly} />
                
                <InputField label="Anzahl Schneidedrähte" name="anzahlSchneidedraehte" defaultValue={defaultValues.anzahlSchneidedraehte} readOnly={readOnly} />
                <InputField label="Offset Drehvorr." name="offsetDrehvorr" defaultValue={defaultValues.offsetDrehvorr} readOnly={readOnly} />
                <InputField label="Drahtabstand" name="drahtabstand" defaultValue={defaultValues.drahtabstand} readOnly={readOnly} />
                <InputField label="Geschwin. Lingl Bandbrücke" name="geschwLinglBandbruecke" defaultValue={defaultValues.geschwLinglBandbruecke} readOnly={readOnly} />
                <InputField label="Abziehblech Nr." name="abziehblechNr" defaultValue={defaultValues.abziehblechNr} readOnly={readOnly} />
                
                <BooleanSelect label="Drahtreiniger" name="drahtreiniger" defaultValue={defaultValues.drahtreiniger} readOnly={readOnly} />
                
                <InputField label="Schablone Nr." name="schabloneNr" defaultValue={defaultValues.schabloneNr} readOnly={readOnly} />
                
                <BooleanSelect label="Abfall-Auswerfer" name="abfallAuswerfer" defaultValue={defaultValues.abfallAuswerfer} readOnly={readOnly} />
                
                <InputField label="Drahtdurchmesser" name="drahtdurchmesser" defaultValue={defaultValues.drahtdurchmesser} readOnly={readOnly} />
                
                <BooleanSelect label="Drahtnachzug" name="drahtnachzug" defaultValue={defaultValues.drahtnachzug} readOnly={readOnly} />
                
                <InputField label="Geschw. für nachf. Band" name="geschwFuerNachfBand" defaultValue={defaultValues.geschwFuerNachfBand} readOnly={readOnly} />
             </div>
        </fieldset>
      </div>

      {/* Actions */}
      {!readOnly && (
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 px-6 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            >
              <CancelIcon />
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
            >
              <SaveIcon />
              Speichern
            </button>
          </div>
      )}
      {readOnly && (
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                  type="button"
                  onClick={onCancel}
                  className="flex items-center gap-2 px-6 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
              >
                  Zurück zur Liste
              </button>
          </div>
      )}
    </form>
  );
};

export default Formular;