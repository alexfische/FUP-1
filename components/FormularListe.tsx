import React from 'react';
import { SteinformatData } from '../types';
import { EditIcon, TrashIcon, SearchIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface FormularListeProps {
  forms: SteinformatData[];
  onSelect: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const FormularListe: React.FC<FormularListeProps> = ({ forms, onSelect, onView, onDelete, searchTerm, setSearchTerm }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
        <div className="flex justify-between items-baseline">
            <h2 className="text-xl font-bold text-gray-800">{t('savedForms')}</h2>
            <span className="text-xs text-gray-400 hidden sm:inline">{t('rightClickHint')}</span>
        </div>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon />
            </span>
            <input
                type="text"
                placeholder={t('searchPlaceholder')}
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
                            title={t('clickHint')}
                        >
                            <div className="flex-grow mb-2 sm:mb-0" onClick={() => onSelect(form.id)}>
                                <p className="font-semibold text-blue-600">{form.formatBezeichnung}</p>
                                <p className="text-sm text-gray-500">
                                    <span className="font-medium">{t('espNrLabel')}: {form.espNr || 'N/A'}</span> | {t('beschriftungLabel')}: {form.beschriftungAufDemStein || 'N/A'} | {t('materialLabel')}: {form.material || 'N/A'} | {t('datumLabel')}: {form.datum || 'N/A'}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onSelect(form.id); }}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors duration-200"
                                    aria-label={t('edit')}
                                >
                                    <EditIcon />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(form.id); }}
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors duration-200"
                                    aria-label={t('delete')}
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500">{t('noFormsFound')}</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchTerm ? t('tryAnotherSearch') : t('clickCreateNew')}
                    </p>
                </div>
            )}
        </div>
    </div>
  );
};

export default FormularListe;