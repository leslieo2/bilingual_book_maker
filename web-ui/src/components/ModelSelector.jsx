import React from 'react';
import Select from 'react-select';
import { TRANSLATION_MODELS, MODEL_API_REQUIREMENTS } from '../constants/models';
import { Key, Info } from 'lucide-react';

const ModelSelector = ({ 
  selectedModel, 
  onModelChange, 
  apiKeys, 
  onApiKeyChange,
  customModelList,
  onCustomModelListChange 
}) => {
  // Group models by category
  const groupedOptions = TRANSLATION_MODELS.reduce((acc, model) => {
    const category = model.category;
    if (!acc[category]) {
      acc[category] = { label: category, options: [] };
    }
    acc[category].options.push(model);
    return acc;
  }, {});

  const formatGroupLabel = (data) => (
    <div className="flex items-center">
      <span className="font-medium text-gray-700">{data.label}</span>
    </div>
  );

  const requiredApiKey = MODEL_API_REQUIREMENTS[selectedModel];
  const currentApiKey = apiKeys[requiredApiKey] || '';

  const showCustomModelList = selectedModel === 'openai' || selectedModel === 'groq' || selectedModel === 'gemini';

  const getApiKeyLabel = (keyType) => {
    const labels = {
      openai_key: 'OpenAI API Key',
      claude_key: 'Claude API Key',
      gemini_key: 'Gemini API Key',
      groq_key: 'Groq API Key',
      xai_key: 'xAI API Key',
      deepl_key: 'DeepL API Key',
      caiyun_key: 'Caiyun API Key',
      custom_api: 'Custom API Endpoint'
    };
    return labels[keyType] || 'API Key';
  };

  const getApiKeyPlaceholder = (keyType) => {
    const placeholders = {
      openai_key: 'sk-...',
      claude_key: 'sk-ant-...',
      gemini_key: 'AIzaSy...',
      groq_key: 'gsk_...',
      xai_key: 'xai-...',
      deepl_key: 'Enter DeepL API key',
      caiyun_key: 'Enter Caiyun API key',
      custom_api: 'https://api.example.com/v1'
    };
    return placeholders[keyType] || 'Enter API key';
  };

  const getApiKeyHelp = (keyType) => {
    const helpTexts = {
      openai_key: 'Get your API key from https://platform.openai.com/api-keys. You can use multiple keys separated by commas.',
      claude_key: 'Get your API key from https://console.anthropic.com/account/keys',
      gemini_key: 'Get your API key from https://makersuite.google.com/app/apikey',
      groq_key: 'Get your API key from https://console.groq.com/keys',
      xai_key: 'Get your API key from https://console.x.ai/',
      deepl_key: 'Get your API key from https://rapidapi.com/splintPRO/api/dpl-translator',
      caiyun_key: 'Get your API key from https://dashboard.caiyunapp.com/user/sign_in/',
      custom_api: 'Enter your custom API endpoint URL'
    };
    return helpTexts[keyType] || '';
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-2">
          Translation Model
        </label>
        <Select
          id="model-select"
          value={TRANSLATION_MODELS.find(m => m.value === selectedModel)}
          onChange={(option) => onModelChange(option.value)}
          options={Object.values(groupedOptions)}
          formatGroupLabel={formatGroupLabel}
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder="Select a translation model..."
          isSearchable
        />
        <p className="mt-1 text-sm text-gray-500">
          Choose the AI model or service for translation
        </p>
      </div>

      {requiredApiKey && (
        <div>
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <Key className="h-4 w-4 mr-1" />
              {getApiKeyLabel(requiredApiKey)}
            </div>
          </label>
          <input
            type="password"
            id="api-key"
            value={currentApiKey}
            onChange={(e) => onApiKeyChange(requiredApiKey, e.target.value)}
            placeholder={getApiKeyPlaceholder(requiredApiKey)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
          {getApiKeyHelp(requiredApiKey) && (
            <div className="mt-2 flex items-start space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{getApiKeyHelp(requiredApiKey)}</p>
            </div>
          )}
        </div>
      )}

      {showCustomModelList && (
        <div>
          <label htmlFor="model-list" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Model List
          </label>
          <input
            type="text"
            id="model-list"
            value={customModelList}
            onChange={(e) => onCustomModelListChange(e.target.value)}
            placeholder={
              selectedModel === 'openai' 
                ? 'gpt-4-1106-preview,gpt-3.5-turbo-0125'
                : selectedModel === 'groq'
                ? 'llama3-8b-8192,mixtral-8x7b-32768'
                : 'gemini-1.5-flash-002,gemini-1.5-flash-8b-exp-0924'
            }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">
            Comma-separated list of specific model names (required for {selectedModel === 'openai' ? 'OpenAI' : selectedModel === 'groq' ? 'Groq' : 'Gemini'} custom models)
          </p>
        </div>
      )}

      <div className="bg-yellow-50 p-4 rounded-md">
        <div className="flex">
          <Info className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Model Selection Tips</h4>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>GPT-4:</strong> Highest quality but more expensive</li>
                <li><strong>GPT-3.5:</strong> Good balance of quality and cost</li>
                <li><strong>Claude:</strong> Excellent for literary translations</li>
                <li><strong>Gemini:</strong> Fast and cost-effective</li>
                <li><strong>DeepL:</strong> Best for European languages</li>
                <li><strong>Google Translate:</strong> Free but basic quality</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSelector;