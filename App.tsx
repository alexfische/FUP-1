
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { SteinformatData } from './types';
import Formular from './components/Formular';
import FormularListe from './components/FormularListe';
import { PlusIcon, ScanIcon, ImportIcon, ExportIcon } from './components/Icons';

const App: React.FC = () => {
  const [forms, setForms] = useState<SteinformatData[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scannedInitialData, setScannedInitialData] = useState<SteinformatData | null>(null);
  const scanFileInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const storedForms = localStorage.getItem('steinformat-forms');
      if (storedForms) {
        setForms(JSON.parse(storedForms));
      }
    } catch (error) {
      console.error("Fehler beim Laden der Formulardaten:", error);
      setForms([]);
    }
  }, []);

  const saveFormsToLocalStorage = useCallback((updatedForms: SteinformatData[]) => {
     try {
        localStorage.setItem('steinformat-forms', JSON.stringify(updatedForms));
     } catch (error) {
        console.error("Fehler beim Speichern der Formulardaten:", error);
     }
  }, []);

  const handleSave = (form: SteinformatData) => {
    let updatedForms;
    const existingIndex = forms.findIndex(f => f.id === form.id);
    if (existingIndex > -1) {
      updatedForms = forms.map(f => f.id === form.id ? form : f);
    } else {
      updatedForms = [...forms, form];
    }
    setForms(updatedForms);
    saveFormsToLocalStorage(updatedForms);
    handleBackToList();
  };

  const handleSelectForm = (id: string) => {
    setSelectedFormId(id);
    setIsReadOnly(false);
    setView('form');
  };

  const handleViewForm = (id: string) => {
    setSelectedFormId(id);
    setIsReadOnly(true);
    setView('form');
  };

  const handleCreateNew = () => {
    setSelectedFormId(null);
    setIsReadOnly(false);
    setView('form');
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie dieses Formular löschen möchten?')) {
        const updatedForms = forms.filter(f => f.id !== id);
        setForms(updatedForms);
        saveFormsToLocalStorage(updatedForms);
        if(selectedFormId === id) {
            handleBackToList();
        }
    }
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedFormId(null);
    setIsReadOnly(false);
    setScannedInitialData(null); // Clear any scanned data
  };
  
  const processImageWithGemini = async (base64Image: string) => {
      setIsLoading(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const responseSchema = {
              type: Type.OBJECT,
              properties: {
                  espNr: { type: Type.STRING }, formatBezeichnung: { type: Type.STRING }, beschriftungAufDemStein: { type: Type.STRING },
                  material: { type: Type.STRING }, datum: { type: Type.STRING }, abmessungen: { type: Type.STRING },
                  mundstueckNr: { type: Type.STRING }, presskopf: { type: Type.STRING }, pressprogramm: { type: Type.STRING },
                  sonstigeEinstellungen: { type: Type.STRING },
                  vortriebOben1: { type: Type.STRING }, vortriebOben2: { type: Type.STRING }, vortriebOben3: { type: Type.STRING },
                  vortriebUnten1: { type: Type.STRING }, vortriebUnten2: { type: Type.STRING }, vortriebUnten3: { type: Type.STRING },
                  vortriebLinks1: { type: Type.STRING }, vortriebLinks2: { type: Type.STRING }, vortriebLinks3: { type: Type.STRING },
                  vortriebRechts1: { type: Type.STRING }, vortriebRechts2: { type: Type.STRING }, vortriebRechts3: { type: Type.STRING },
                  vortriebZentrum: { type: Type.STRING },
                  austrag: { type: Type.STRING }, schnittlaengeNass: { type: Type.STRING }, siebmischer: { type: Type.STRING },
                  wasserSiebmischer: { type: Type.STRING }, dampfSiebmischer: { type: Type.STRING }, gewichtNass: { type: Type.STRING },
                  mischer: { type: Type.STRING }, wasserMischer: { type: Type.STRING }, dampfMischer: { type: Type.STRING },
                  pressendruck: { type: Type.STRING }, presse: { type: Type.STRING }, tonreiniger: { type: Type.STRING },
                  schnecke: { type: Type.STRING }, rostkorb: { type: Type.STRING }, styropor: { type: Type.STRING },
                  abschneidetisch: { type: Type.STRING }, freimatikProduktname: { type: Type.STRING }, hubhoehe: { type: Type.STRING },
                  schnittlaenge: { type: Type.STRING }, vorschub: { type: Type.STRING }, drehvorrichtung: { type: Type.STRING },
                  anzahlSchneidedraehte: { type: Type.STRING }, offsetDrehvorr: { type: Type.STRING }, drahtabstand: { type: Type.STRING },
                  geschwLinglBandbruecke: { type: Type.STRING }, abziehblechNr: { type: Type.STRING }, drahtreiniger: { type: Type.STRING },
                  schabloneNr: { type: Type.STRING }, abfallAuswerfer: { type: Type.STRING }, drahtdurchmesser: { type: Type.STRING },
                  drahtnachzug: { type: Type.STRING }, geschwFuerNachfBand: { type: Type.STRING },
              }
          };

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: {
                  parts: [
                      {
                          inlineData: { mimeType: 'image/jpeg', data: base64Image }
                      },
                      {
                          text: `Analysieren Sie dieses Bild eines deutschen technischen Formulars mit dem Titel "Maschinen-Einstellparameter für Steinformate". Extrahieren Sie alle Werte aus den Eingabefeldern und geben Sie sie als JSON-Objekt zurück. Die JSON-Schlüssel müssen mit dem bereitgestellten Schema übereinstimmen. Bei Dropdown-Feldern wie 'Abschneidetisch' versuchen Sie, den Wert einer der Optionen zuzuordnen ('Normal', 'Deckenziegel', 'Juwö'). Bei 'Ein/Aus'-Feldern geben Sie 'Ein' oder 'Aus' zurück. Wenn ein Feld leer ist, geben Sie einen leeren String zurück. Die Ausgabe darf nur ein gültiges JSON-Objekt sein.`
                      }
                  ]
              },
              config: {
                  responseMimeType: 'application/json',
                  responseSchema: responseSchema,
              }
          });

          const extractedData = JSON.parse(response.text.trim());
          setScannedInitialData({ ...extractedData, id: '', hilfsmittelFotos: [] });
          setIsReadOnly(false);
          setView('form');

      } catch (error) {
          console.error("Fehler bei der Analyse des Formulars:", error);
          alert("Das Formular konnte nicht automatisch ausgelesen werden. Bitte füllen Sie es manuell aus.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleFileSelectedForScan = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = (reader.result as string).split(',')[1];
              processImageWithGemini(base64String);
          };
          reader.readAsDataURL(file);
      }
      // Reset file input to allow scanning the same file again
      event.target.value = '';
  };

  const handleExport = () => {
    if (forms.length === 0) {
      alert("Es gibt keine Formulare zum Exportieren.");
      return;
    }
    const jsonString = JSON.stringify(forms, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `steinplan-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("Dateiinhalt ist ungültig.");
        
        const importedForms: SteinformatData[] = JSON.parse(text);

        if (!Array.isArray(importedForms)) {
            throw new Error("Die JSON-Datei muss ein Array von Formularen enthalten.");
        }

        const existingIds = new Set(forms.map(f => f.id));
        const newForms = importedForms.filter(f => f.id && !existingIds.has(f.id));

        if (newForms.length === 0) {
            alert("Keine neuen Formulare zum Importieren gefunden. Alle Formulare in der Datei existieren bereits.");
            return;
        }

        const updatedForms = [...forms, ...newForms];
        setForms(updatedForms);
        saveFormsToLocalStorage(updatedForms);
        alert(`${newForms.length} neue(s) Formular(e) erfolgreich importiert.`);

      } catch (error) {
        console.error("Fehler beim Importieren der Datei:", error);
        alert(`Fehler beim Importieren: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      } finally {
        if (event.target) {
          event.target.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const selectedForm = useMemo(() => {
    return forms.find(f => f.id === selectedFormId) || null;
  }, [forms, selectedFormId]);

  const filteredForms = useMemo(() => {
    return forms.filter(form =>
      form.formatBezeichnung.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [forms, searchTerm]);

  const logoSvg = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' rx='80' fill='%23EA5A00'/%3E%3Ctext x='50%25' y='220' text-anchor='middle' fill='white' font-family='Arial, sans-serif' font-weight='bold' font-size='52' letter-spacing='2'%3ESCHLAGMANN%3C/text%3E%3Ctext x='50%25' y='310' text-anchor='middle' fill='black' font-family='Arial, sans-serif' font-weight='900' font-size='85'%3EPOROTON%3C/text%3E%3C/svg%3E";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-700 font-semibold">Formular wird analysiert...</p>
          </div>
        </div>
      )}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-700">Steinplan-Formular</h1>
          {view === 'list' && (
             <div className="flex items-center gap-2 flex-wrap justify-end">
                <input
                  type="file"
                  ref={importFileInputRef}
                  onChange={handleImport}
                  accept=".json"
                  className="hidden"
                />
                 <input
                  type="file"
                  ref={scanFileInputRef}
                  onChange={handleFileSelectedForScan}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />
                <button
                    onClick={() => importFileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                >
                    <ImportIcon />
                    Daten Importieren
                </button>
                 <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                >
                    <ExportIcon />
                    Daten Exportieren
                </button>
                <button
                    onClick={() => scanFileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                >
                    <ScanIcon />
                    Formular einscannen
                </button>
                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                >
                    <PlusIcon />
                    Neu Anlegen
                </button>
             </div>
          )}
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
        {view === 'list' ? (
          <FormularListe
            forms={filteredForms}
            onSelect={handleSelectForm}
            onView={handleViewForm}
            onDelete={handleDelete}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        ) : (
          <Formular
            initialData={scannedInitialData || selectedForm}
            readOnly={isReadOnly}
            onSave={handleSave}
            onCancel={handleBackToList}
          />
        )}
      </main>

      <footer className="py-8 mt-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-center items-center px-4">
              <img 
                  src={logoSvg} 
                  alt="Schlagmann Poroton" 
                  className="h-24 rounded-xl shadow-sm"
              />
          </div>
      </footer>
    </div>
  );
};

export default App;
