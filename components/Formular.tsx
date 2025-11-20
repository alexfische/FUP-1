import React, { useState, useEffect, useRef } from 'react';
import { SteinformatData } from '../types';
import { SaveIcon, CancelIcon, CameraIcon, XMarkIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface FormularProps {
  initialData: SteinformatData | null;
  onSave: (form: SteinformatData) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

const createEmptyForm = (): Omit<SteinformatData, 'id'> => ({
    artNr: '', formatBezeichnung: '', material: '', datum: new Date().toISOString().split('T')[0], abmessungen: '',
    // Beschriftung
    beschriftungSchlagmann: '', beschriftungCE: '', beschriftungRO: '', beschriftungT: '',
    druckfestigkeit: '', beschriftungSchicht: '', beschriftungSchichtzeitraum: '', beschriftungDatum: '',
    // Rest
    mundstueckNr: '', presskopf: '', sonstigeEinstellungen: '', pressprogramm: '', zahnradAbschneider: '', hilfsmittelFotos: [],
    // Vortrieb
    vortriebOben1: '', vortriebOben2: '', vortriebOben3: '',
    vortriebUnten1: '', vortriebUnten2: '', vortriebUnten3: '',
    vortriebLinks1: '', vortriebLinks2: '', vortriebLinks3: '',
    vortriebRechts1: '', vortriebRechts2: '', vortriebRechts3: '',
    vortriebZentrum: 'Mitte', presskopfLeiste: 'unten', mundstueckFoto: null,
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
    geschwLinglBandbruecke: '', abziehblechNr: '', drahtreiniger: 'Aus', schablone: '', schabloneninfo: '', abfallAuswerfer: 'Aus',
    drahtdurchmesser: '', drahtnachzug: 'Aus', geschwFuerNachfBand: '', parameterFuerDrehteller: ''
});

const InputField = ({ label, name, defaultValue, readOnly, type = "text", step, small }: { label: string, name: string, defaultValue: any, readOnly: boolean, type?: string, step?: string, small?: boolean }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className={`mb-1 text-sm font-medium text-gray-700 ${small ? 'text-xs' : ''}`}>{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      step={step}
      defaultValue={defaultValue}
      readOnly={readOnly}
      disabled={readOnly}
      className={`bg-white text-black border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 transition-colors ${readOnly ? 'cursor-not-allowed' : ''} ${small ? 'py-1 px-2 text-sm' : ''}`}
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

const BooleanSelect = ({ label, name, defaultValue, readOnly, t }: { label: string, name: string, defaultValue: string, readOnly: boolean, t: (key: any) => string }) => (
    <div className="flex flex-col">
        <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-700">{label}</label>
        <select
            id={name}
            name={name}
            defaultValue={defaultValue}
            disabled={readOnly}
            className={`bg-white text-black border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 ${readOnly ? 'cursor-not-allowed' : ''}`}
        >
            <option value="Ein">{t('ein')}</option>
            <option value="Aus">{t('aus')}</option>
        </select>
    </div>
);

const BeschriftungSelect = ({ label, name, defaultValue, readOnly, t }: { label: string, name: string, defaultValue: any, readOnly: boolean, t: (key: any) => string }) => (
    <div className="flex flex-col">
        <label htmlFor={name} className="mb-1 text-xs font-medium text-gray-700">{label}</label>
        <select
            id={name}
            name={name}
            defaultValue={defaultValue}
            disabled={readOnly}
            className={`bg-white text-black border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 ${readOnly ? 'cursor-not-allowed' : ''}`}
        >
            <option value="">{t('bitteWaehlen')}</option>
            <option value="mit">{t('mitOption')}</option>
            <option value="ohne">{t('ohneOption')}</option>
        </select>
    </div>
);


const Formular: React.FC<FormularProps> = ({ initialData, onSave, onCancel, readOnly = false }) => {
  const { t } = useLanguage();
  const [defaultValues, setDefaultValues] = useState<Omit<SteinformatData, 'id'> & { id?: string }>(
    initialData || createEmptyForm()
  );
  const [images, setImages] = useState<string[]>([]);
  const [mundstueckFoto, setMundstueckFoto] = useState<string | null>(null);
  const [pressProgramm, setPressProgramm] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mundstueckFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const empty = createEmptyForm();
    const data = initialData ? { ...empty, ...initialData } : empty;
    setDefaultValues(data);
    setImages(data.hilfsmittelFotos || []);
    setMundstueckFoto(data.mundstueckFoto || null);
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
  
  const handleMundstueckFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                setMundstueckFoto(reader.result as string);
            }
        };
        reader.readAsDataURL(file as Blob);
    }
    e.target.value = '';
  };

  const removeMundstueckFoto = () => {
    if (readOnly) return;
    setMundstueckFoto(null);
  };


  const handleOpenImage = (imgSrc: string) => {
      const win = window.open();
      if (win) {
          win.document.write(`<img src="${imgSrc}" style="max-width:100%;" />`);
          win.document.title = t('imagePreviewTitle');
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
    data.mundstueckFoto = mundstueckFoto;
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
                <InputField label={t('artNrLabel')} name="artNr" defaultValue={defaultValues.artNr} readOnly={readOnly} />
            </div>
            <div className="md:col-span-2">
                <InputField label={t('formatBezeichnung')} name="formatBezeichnung" defaultValue={defaultValues.formatBezeichnung} readOnly={readOnly} />
            </div>
            <div className="grid grid-cols-2 gap-4 md:col-span-1">
                <InputField label={t('materialLabel')} name="material" defaultValue={defaultValues.material} readOnly={readOnly} />
                <InputField label={t('datumLabel')} name="datum" type="date" defaultValue={defaultValues.datum} readOnly={readOnly} />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <InputField label={t('abmessungen')} name="abmessungen" defaultValue={defaultValues.abmessungen} readOnly={readOnly} />
            <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">{t('pressprogrammWaehlen')}</label>
                <select
                    name="pressprogramm"
                    value={pressProgramm}
                    onChange={(e) => setPressProgramm(e.target.value)}
                    disabled={readOnly}
                    className={`w-full bg-white text-black border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? 'cursor-not-allowed disabled:bg-gray-100' : ''}`}
                >
                    <option value="">{t('bitteWaehlen')}</option>
                    <option value="Presse ohne Siebmischer,Tonreiniger">{t('presseOhne')}</option>
                    <option value="Presse+Siebmischer">{t('presseMitSiebmischer')}</option>
                    <option value="Presse+Siebmischer+Tonreiniger">{t('presseMitSiebmischerTonreiniger')}</option>
                </select>
            </div>
            <InputField label={t('mundstueckNr')} name="mundstueckNr" defaultValue={defaultValues.mundstueckNr} readOnly={readOnly} />
        </div>
      </div>

      {/* Main Layout: Vortrieb, Sonstige, Presse */}
      <div className="space-y-8">
        
        {/* Grundeinstellung Vortrieb - Flexbox Layout */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
            <legend className="text-lg font-semibold text-gray-700 px-2">{t('grundeinstellungVortrieb')}</legend>
            <div className="flex flex-col items-center gap-4">
                 <div className="flex flex-col items-center gap-4 bg-gray-100 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-md font-semibold text-gray-600 text-center">{t('bremsschieber')}</h3>
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
                        
                        {/* Center Column with Label */}
                        <div className="flex flex-col items-center">
                            <label className="mb-1 text-sm font-medium text-gray-700">{t('mundstueckstellung')}</label>
                            <select
                                name="vortriebZentrum"
                                defaultValue={defaultValues.vortriebZentrum}
                                disabled={readOnly}
                                className="w-28 h-10 bg-white text-black text-center border-blue-500 border-2 font-semibold text-base rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                <option value="Mitte">{t('mitte')}</option>
                                <option value="Nach Rechts">{t('nachRechts')}</option>
                                <option value="Nach Links">{t('nachLinks')}</option>
                            </select>
                        </div>

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
                 <div className="flex flex-col pt-4 items-center w-full">
                    <div className="flex flex-col items-center">
                        <label className="mb-1 text-sm font-medium text-gray-700">{t('presskopfLeiste')}</label>
                        <select
                            name="presskopfLeiste"
                            defaultValue={defaultValues.presskopfLeiste}
                            disabled={readOnly}
                            className={`w-32 bg-white text-black border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? 'cursor-not-allowed disabled:bg-gray-100' : ''}`}
                        >
                            <option value="unten">{t('unten')}</option>
                            <option value="oben">{t('oben')}</option>
                        </select>
                    </div>

                    <div className="w-full border-t border-gray-200 mt-6 pt-4">
                      <div className="flex justify-center">
                          {mundstueckFoto ? (
                              <div className="relative group w-48 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                  <img 
                                      src={mundstueckFoto} 
                                      alt={t('mundstueckFotoAlt')}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-150 group-hover:z-50 group-hover:shadow-xl origin-center relative z-10"
                                  />
                                  <div className="absolute inset-0 z-20 flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                       <button
                                          type="button"
                                          onClick={() => handleOpenImage(mundstueckFoto)}
                                          className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded pointer-events-auto"
                                       >
                                          {t('oeffnen')}
                                       </button>
                                  </div>
                                  {!readOnly && (
                                      <button
                                          type="button"
                                          onClick={removeMundstueckFoto}
                                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 focus:outline-none z-50"
                                      >
                                          <XMarkIcon />
                                      </button>
                                  )}
                              </div>
                          ) : !readOnly ? (
                              <button
                                  type="button"
                                  onClick={() => mundstueckFileInputRef.current?.click()}
                                  className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                              >
                                  <CameraIcon />
                                  <span className="text-xs mt-1 text-center px-1">{t('fotoDesMundstuecksHinzufuegen')}</span>
                              </button>
                          ) : (
                               <div className="flex items-center justify-center w-48 h-32 text-gray-400 text-sm">
                                  {/* Placeholder for read-only empty state, can be styled or have text */}
                               </div>
                          )}
                          <input
                              type="file"
                              ref={mundstueckFileInputRef}
                              onChange={handleMundstueckFotoUpload}
                              accept="image/*"
                              className="hidden"
                          />
                      </div>
                    </div>
                </div>
            </div>
        </fieldset>

        {/* Beschriftung auf dem Stein - Moved and in-line */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
            <legend className="text-lg font-semibold text-gray-700 px-2">{t('beschriftungAufDemStein')}</legend>
            <div className="flex flex-row flex-wrap items-end gap-x-6 gap-y-4 pt-2">
                <BeschriftungSelect label={t('schlagmannLabel')} name="beschriftungSchlagmann" defaultValue={defaultValues.beschriftungSchlagmann} readOnly={readOnly} t={t} />
                <BeschriftungSelect label={t('ceLabel')} name="beschriftungCE" defaultValue={defaultValues.beschriftungCE} readOnly={readOnly} t={t} />
                <BeschriftungSelect label={t('roLabel')} name="beschriftungRO" defaultValue={defaultValues.beschriftungRO} readOnly={readOnly} t={t} />
                <BeschriftungSelect label={t('tLabel')} name="beschriftungT" defaultValue={defaultValues.beschriftungT} readOnly={readOnly} t={t} />
                <InputField label={t('druckfestigkeitLabel')} name="druckfestigkeit" defaultValue={defaultValues.druckfestigkeit} readOnly={readOnly} type="number" step="0.01" small />
                <BeschriftungSelect label={t('schichtLabel')} name="beschriftungSchicht" defaultValue={defaultValues.beschriftungSchicht} readOnly={readOnly} t={t} />
                <BeschriftungSelect label={t('schichtzeitraumLabel')} name="beschriftungSchichtzeitraum" defaultValue={defaultValues.beschriftungSchichtzeitraum} readOnly={readOnly} t={t} />
                <BeschriftungSelect label={t('datumBeschriftungLabel')} name="beschriftungDatum" defaultValue={defaultValues.beschriftungDatum} readOnly={readOnly} t={t} />
            </div>
        </fieldset>

        {/* Sonstige Einstellungen und Hilfsmittel */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
            <legend className="text-lg font-semibold text-gray-700 px-2">{t('sonstigeEinstellungen')}</legend>
            <div className="space-y-4">
                <textarea
                    name="sonstigeEinstellungen"
                    defaultValue={defaultValues.sonstigeEinstellungen}
                    disabled={readOnly}
                    rows={4}
                    className={`w-full bg-white text-black border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                />
                
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{t('fotosVonHilfsmitteln')}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {images.map((img, index) => (
                            <div key={index} className="relative group w-full h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                <img 
                                    src={img} 
                                    alt={`${t('fotosVonHilfsmitteln')} ${index + 1}`} 
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-150 group-hover:z-50 group-hover:shadow-xl origin-center relative z-10"
                                />
                                <div className="absolute inset-0 z-20 flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                     <button
                                        type="button"
                                        onClick={() => handleOpenImage(img)}
                                        className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded pointer-events-auto"
                                     >
                                        {t('oeffnen')}
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
                                <span className="text-xs mt-1 text-center px-1">{t('fotoHinzufuegen')}</span>
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
            <legend className="text-lg font-semibold text-gray-700 px-2">{t('presse')}</legend>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InputField label={t('austrag')} name="austrag" defaultValue={defaultValues.austrag} readOnly={readOnly} />
                <InputField label={t('schnittlaengeNass')} name="schnittlaengeNass" defaultValue={defaultValues.schnittlaengeNass} readOnly={readOnly} />
                
                {!hideSiebmischerGroup ? (
                    <>
                        <InputField label={t('siebmischer')} name="siebmischer" defaultValue={defaultValues.siebmischer} readOnly={readOnly} />
                        <InputField label={t('wasserSiebmischer')} name="wasserSiebmischer" defaultValue={defaultValues.wasserSiebmischer} readOnly={readOnly} />
                        <InputField label={t('dampfSiebmischer')} name="dampfSiebmischer" defaultValue={defaultValues.dampfSiebmischer} readOnly={readOnly} />
                    </>
                ) : (
                    <>
                        <div className="hidden md:block"></div>
                        <div className="hidden md:block"></div>
                        <div className="hidden md:block"></div>
                    </>
                )}

                <InputField label={t('gewichtNass')} name="gewichtNass" defaultValue={defaultValues.gewichtNass} readOnly={readOnly} />
                
                <InputField label={t('mischer')} name="mischer" defaultValue={defaultValues.mischer} readOnly={readOnly} />
                <InputField label={t('wasserMischer')} name="wasserMischer" defaultValue={defaultValues.wasserMischer} readOnly={readOnly} />
                <InputField label={t('dampfMischer')} name="dampfMischer" defaultValue={defaultValues.dampfMischer} readOnly={readOnly} />

                <InputField label={t('pressendruck')} name="pressendruck" defaultValue={defaultValues.pressendruck} readOnly={readOnly} />
                <InputField label={t('presseField')} name="presse" defaultValue={defaultValues.presse} readOnly={readOnly} />
                
                {!hideTonreinigerGroup ? (
                    <>
                         <InputField label={t('tonreiniger')} name="tonreiniger" defaultValue={defaultValues.tonreiniger} readOnly={readOnly} />
                         <InputField label={t('schnecke')} name="schnecke" defaultValue={defaultValues.schnecke} readOnly={readOnly} />
                         <InputField label={t('rostkorb')} name="rostkorb" defaultValue={defaultValues.rostkorb} readOnly={readOnly} />
                    </>
                ) : (
                     <>
                         <div className="hidden md:block"></div>
                         <div className="hidden md:block"></div>
                         <div className="hidden md:block"></div>
                     </>
                )}

                <InputField label={t('styropor')} name="styropor" defaultValue={defaultValues.styropor} readOnly={readOnly} />
            </div>
        </fieldset>

        {/* Abschneider */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
             <legend className="text-lg font-semibold text-gray-700 px-2">{t('abschneider')}</legend>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">{t('abschneidetisch')}</label>
                    <select
                        name="abschneidetisch"
                        defaultValue={defaultValues.abschneidetisch}
                        disabled={readOnly}
                        className={`bg-white text-black border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? 'cursor-not-allowed disabled:bg-gray-100' : ''}`}
                    >
                        <option value="Normal">{t('normal')}</option>
                        <option value="Deckenziegel">{t('deckenziegel')}</option>
                        <option value="Juwö">{t('juwo')}</option>
                    </select>
                </div>

                <InputField label={t('freimatikProduktname')} name="freimatikProduktname" defaultValue={defaultValues.freimatikProduktname} readOnly={readOnly} />
                <InputField label={t('hubhoehe')} name="hubhoehe" defaultValue={defaultValues.hubhoehe} readOnly={readOnly} />
                <InputField label={t('schnittlaenge')} name="schnittlaenge" defaultValue={defaultValues.schnittlaenge} readOnly={readOnly} />
                <InputField label={t('vorschub')} name="vorschub" defaultValue={defaultValues.vorschub} readOnly={readOnly} />
                
                <BooleanSelect label={t('drehvorrichtung')} name="drehvorrichtung" defaultValue={defaultValues.drehvorrichtung} readOnly={readOnly} t={t} />
                
                <InputField label={t('anzahlSchneidedraehte')} name="anzahlSchneidedraehte" defaultValue={defaultValues.anzahlSchneidedraehte} readOnly={readOnly} />
                <InputField label={t('offsetDrehvorr')} name="offsetDrehvorr" defaultValue={defaultValues.offsetDrehvorr} readOnly={readOnly} />
                <InputField label={t('drahtabstand')} name="drahtabstand" defaultValue={defaultValues.drahtabstand} readOnly={readOnly} />
                <InputField label={t('geschwLinglBandbruecke')} name="geschwLinglBandbruecke" defaultValue={defaultValues.geschwLinglBandbruecke} readOnly={readOnly} />
                <InputField label={t('abziehblechNr')} name="abziehblechNr" defaultValue={defaultValues.abziehblechNr} readOnly={readOnly} />
                
                <BooleanSelect label={t('drahtreiniger')} name="drahtreiniger" defaultValue={defaultValues.drahtreiniger} readOnly={readOnly} t={t} />
                
                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">{t('schablone')}</label>
                    <select
                        name="schablone"
                        defaultValue={defaultValues.schablone}
                        disabled={readOnly}
                        className={`bg-white text-black border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? 'cursor-not-allowed disabled:bg-gray-100' : ''}`}
                    >
                        <option value="">{t('bitteWaehlen')}</option>
                        <option value="DZ80">DZ80</option>
                        <option value="DZ120">DZ120</option>
                        <option value="DZ170">DZ170</option>
                        <option value="DZ265">DZ265</option>
                        <option value="Juwö19">Juwö19</option>
                        <option value="Juwö215">Juwö215</option>
                        <option value="Juwö240">Juwö240</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">{t('schabloneninfo')}</label>
                    <select
                        name="schabloneninfo"
                        defaultValue={defaultValues.schabloneninfo}
                        disabled={readOnly}
                        className={`bg-white text-black border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? 'cursor-not-allowed disabled:bg-gray-100' : ''}`}
                    >
                        <option value="">{t('bitteWaehlen')}</option>
                        <option value="DZ 80 : gerade">DZ 80 : gerade</option>
                        <option value="DZ 120 : 0mm bündig">DZ 120 : 0mm bündig</option>
                        <option value="DZ 170 : 0mm bündig">DZ 170 : 0mm bündig</option>
                        <option value="DZ 265 : 7mm tiefer">DZ 265 : 7mm tiefer</option>
                        <option value="Juwö 190 : 25mm tiefer">Juwö 190 : 25mm tiefer</option>
                        <option value="Juwö 215 : 7mm tiefer">Juwö 215 : 7mm tiefer</option>
                        <option value="Juwö 240 : 7mm tiefer">Juwö 240 : 7mm tiefer</option>
                    </select>
                </div>
                
                <BooleanSelect label={t('abfallAuswerfer')} name="abfallAuswerfer" defaultValue={defaultValues.abfallAuswerfer} readOnly={readOnly} t={t} />
                
                <InputField label={t('drahtdurchmesser')} name="drahtdurchmesser" defaultValue={defaultValues.drahtdurchmesser} readOnly={readOnly} />
                
                <BooleanSelect label={t('drahtnachzug')} name="drahtnachzug" defaultValue={defaultValues.drahtnachzug} readOnly={readOnly} t={t} />
                
                <InputField label={t('geschwFuerNachfBand')} name="geschwFuerNachfBand" defaultValue={defaultValues.geschwFuerNachfBand} readOnly={readOnly} />

                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">{t('zahnradAbschneider')}</label>
                    <select
                        name="zahnradAbschneider"
                        defaultValue={defaultValues.zahnradAbschneider}
                        disabled={readOnly}
                        className={`bg-white text-black border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? 'cursor-not-allowed disabled:bg-gray-100' : ''}`}
                    >
                        <option value="">{t('bitteWaehlen')}</option>
                        <option value="23">23</option>
                        <option value="24">24</option>
                        <option value="25">25</option>
                        <option value="26">26</option>
                        <option value="27">27</option>
                        <option value="28">28</option>
                        <option value="31">31</option>
                        <option value="35">35</option>
                    </select>
                </div>
                
                <div className="flex flex-col md:col-span-4 mt-2">
                    <label className="mb-1 text-sm font-medium text-gray-700">{t('parameterFuerDrehteller')}</label>
                    <select
                        name="parameterFuerDrehteller"
                        defaultValue={defaultValues.parameterFuerDrehteller}
                        disabled={readOnly}
                        className={`bg-white text-black border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? 'cursor-not-allowed disabled:bg-gray-100' : ''}`}
                    >
                        <option value="">{t('bitteWaehlen')}</option>
                        <option value="[3 Drehteller] Haus, Brille, Werkzeug, Passwort, 97116, Haus, Datenblatt, PAR.CH, CH06, 0615, neu 80, speichern, log Out">
                            [3 Drehteller] Haus, Brille, Werkzeug, Passwort, 97116, Haus, Datenblatt, PAR.CH, CH06, 0615, neu 80, speichern, log Out
                        </option>
                        <option value="[6 Drehteller]Haus, Brille, Werkzeug, Passwort, 97116, Haus, Datenblatt, PAR.CH, CH06, 0615, neu 40, speichern, log Out">
                            [6 Drehteller]Haus, Brille, Werkzeug, Passwort, 97116, Haus, Datenblatt, PAR.CH, CH06, 0615, neu 40, speichern, log Out
                        </option>
                    </select>
                </div>
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
              {t('abbrechen')}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
            >
              <SaveIcon />
              {t('speichern')}
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
                  {t('zurueckZurListe')}
              </button>
          </div>
      )}
    </form>
  );
};

export default Formular;