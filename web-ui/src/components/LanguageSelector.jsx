import React from 'react';
import Select from 'react-select';
import { LANGUAGES } from '../constants/models';
import { Globe } from 'lucide-react';

const LanguageSelector = ({ selectedLanguage, onLanguageChange }) => {
  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      padding: '8px 12px',
      fontSize: '14px',
    }),
    control: (provided) => ({
      ...provided,
      minHeight: '40px',
    }),
  };

  return (
    <div>
      <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
        <div className="flex items-center">
          <Globe className="h-4 w-4 mr-1" />
          Target Language
        </div>
      </label>
      <Select
        id="language-select"
        value={LANGUAGES.find(lang => lang.value === selectedLanguage)}
        onChange={(option) => onLanguageChange(option.value)}
        options={LANGUAGES}
        styles={customStyles}
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder="Select target language..."
        isSearchable
        menuPortalTarget={document.body}
        menuPosition="fixed"
      />
      <p className="mt-1 text-sm text-gray-500">
        Choose the language to translate your content into
      </p>
    </div>
  );
};

export default LanguageSelector;