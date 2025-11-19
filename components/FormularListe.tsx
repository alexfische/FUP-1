import React from 'react';
import { SteinformatData } from '../types';
import { EditIcon, TrashIcon, SearchIcon } from './Icons';

interface FormularListeProps {
  forms: SteinformatData[];
  onSelect: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const FormularListe: React.FC<FormularListeProps> = ({ forms, onSelect, onView, onDelete, searchTerm, setSearchTerm }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
        <div className="flex justify-between items-baseline">
            <h2 className="text-xl font-bold text-gray-800">Gespeicherte Formulare</h2>
            <span className="text-xs text-gray-400 hidden sm:inline">Rechtsklick für Vorschau</span>
        </div>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon />
            </span>
            <input
                type="text"
                placeholder="Suche nach Format-Bezeichnung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-black"
            />
        </div>
        <div className="overflow-x-auto">
            {forms.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                    {forms.map(form => (
                        <li 
                            key={form.id} 
                            className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-50 transition-colors duration-200 rounded-md cursor-pointer"
                            onContextMenu={(e) => {
                                e.preventDefault();
                                onView(form.id);
                            }}
                            title="Linksklick zum Bearbeiten, Rechtsklick für Vorschau"
                        >
                            <div className="flex-grow mb-2 sm:mb-0" onClick={() => onSelect(form.id)}>
                                <p className="font-semibold text-blue-600">{form.formatBezeichnung}</p>
                                <p className="text-sm text-gray-500">
                                    <span className="font-medium">ESP №: {form.espNr || 'N/A'}</span> | Beschriftung: {form.beschriftungAufDemStein || 'N/A'} | Material: {form.material || 'N/A'} | Datum: {form.datum || 'N/A'}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onSelect(form.id); }}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors duration-200"
                                    aria-label="Bearbeiten"
                                >
                                    <EditIcon />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(form.id); }}
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors duration-200"
                                    aria-label="Löschen"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500">Keine Formulare gefunden.</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchTerm ? 'Versuchen Sie einen anderen Suchbegriff.' : 'Klicken Sie auf "Neu Anlegen", um zu beginnen.'}
                    </p>
                </div>
            )}
        </div>
    </div>
  );
};

export default FormularListe;