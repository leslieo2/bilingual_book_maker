import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Settings, Info, FileText, Code, Zap, Brain } from 'lucide-react';

const AdvancedSettings = ({ settings, onSettingsChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const updateSetting = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'prompt', label: 'Prompt', icon: FileText },
    { id: 'processing', label: 'Processing', icon: Code },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'ai', label: 'AI Settings', icon: Brain }
  ];

  const TabIcon = tabs.find(tab => tab.id === activeTab)?.icon || Settings;

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
      >
        <div className="flex items-center">
          <Settings className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium text-gray-900">Advanced Settings</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Test Mode</label>
                    <p className="text-sm text-gray-500">Translate only first few paragraphs for testing</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.test || false}
                    onChange={(e) => updateSetting('test', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>

                {settings.test && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Paragraphs Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={settings.testNum || 10}
                      onChange={(e) => updateSetting('testNum', parseInt(e.target.value))}
                      className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Resume Translation</label>
                    <p className="text-sm text-gray-500">Resume from where it left off if interrupted</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.resume || false}
                    onChange={(e) => updateSetting('resume', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Single Translation</label>
                    <p className="text-sm text-gray-500">Output only translated version (no bilingual)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.singleTranslate || false}
                    onChange={(e) => updateSetting('singleTranslate', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proxy Server
                  </label>
                  <input
                    type="url"
                    value={settings.proxy || ''}
                    onChange={(e) => updateSetting('proxy', e.target.value)}
                    placeholder="http://127.0.0.1:7890"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Optional proxy server for API requests
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom API Base URL
                  </label>
                  <input
                    type="url"
                    value={settings.apiBase || ''}
                    onChange={(e) => updateSetting('apiBase', e.target.value)}
                    placeholder="https://api.example.com/v1"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Override default API endpoint
                  </p>
                </div>
              </div>
            )}

            {/* Prompt Settings */}
            {activeTab === 'prompt' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Prompt
                  </label>
                  <textarea
                    value={settings.systemPrompt || ''}
                    onChange={(e) => updateSetting('systemPrompt', e.target.value)}
                    placeholder="You are a professional translator who specializes in accurate and fluent translations..."
                    rows={4}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    System message to guide the AI's behavior
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Prompt Template
                  </label>
                  <textarea
                    value={settings.userPrompt || ''}
                    onChange={(e) => updateSetting('userPrompt', e.target.value)}
                    placeholder="Please translate the following text into {language}:\n\n{text}"
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Template for translation requests. Use {'{text}'} and {'{language}'} placeholders.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Prompt Tips</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use specific instructions for better results</li>
                    <li>• Mention the source material type (book, subtitle, etc.)</li>
                    <li>• Include style preferences (formal, casual, literary)</li>
                    <li>• {'{text}'} placeholder is required in user prompt</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Processing Settings */}
            {activeTab === 'processing' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Translation Tags (for EPUB)
                  </label>
                  <input
                    type="text"
                    value={settings.translateTags || 'p'}
                    onChange={(e) => updateSetting('translateTags', e.target.value)}
                    placeholder="p,h1,h2,h3,div"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    HTML tags to translate (comma-separated)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exclude Tags (for EPUB)
                  </label>
                  <input
                    type="text"
                    value={settings.excludeTranslateTags || 'sup'}
                    onChange={(e) => updateSetting('excludeTranslateTags', e.target.value)}
                    placeholder="sup,sub,code"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    HTML tags to skip (comma-separated)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exclude Files (for EPUB)
                  </label>
                  <input
                    type="text"
                    value={settings.excludeFilelist || ''}
                    onChange={(e) => updateSetting('excludeFilelist', e.target.value)}
                    placeholder="nav.xhtml,cover.xhtml"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Files to skip (comma-separated)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Only Files (for EPUB)
                  </label>
                  <input
                    type="text"
                    value={settings.onlyFilelist || ''}
                    onChange={(e) => updateSetting('onlyFilelist', e.target.value)}
                    placeholder="chapter1.xhtml,chapter2.xhtml"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Only translate these files (comma-separated)
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Allow Navigable Strings</label>
                    <p className="text-sm text-gray-500">Translate text not wrapped in HTML tags</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allowNavigableStrings || false}
                    onChange={(e) => updateSetting('allowNavigableStrings', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Translation Style (CSS)
                  </label>
                  <input
                    type="text"
                    value={settings.translationStyle || ''}
                    onChange={(e) => updateSetting('translationStyle', e.target.value)}
                    placeholder="color: #808080; font-style: italic;"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    CSS styling for translated text
                  </p>
                </div>
              </div>
            )}

            {/* Performance Settings */}
            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Size (for TXT files)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.batchSize || 10}
                    onChange={(e) => updateSetting('batchSize', parseInt(e.target.value))}
                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Number of lines to process together
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accumulated Tokens
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="4000"
                    value={settings.accumulatedNum || 1}
                    onChange={(e) => updateSetting('accumulatedNum', parseInt(e.target.value))}
                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Wait for this many tokens before starting translation
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Block Size
                  </label>
                  <input
                    type="number"
                    min="-1"
                    max="50"
                    value={settings.blockSize || -1}
                    onChange={(e) => updateSetting('blockSize', parseInt(e.target.value))}
                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Merge paragraphs (-1 to disable, requires single translation)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Interval (seconds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    step="0.1"
                    value={settings.interval || 0.01}
                    onChange={(e) => updateSetting('interval', parseFloat(e.target.value))}
                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Delay between API requests (for Gemini)
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Enable Batch API</label>
                    <p className="text-sm text-gray-500">Use ChatGPT batch API for efficiency</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.batchFlag || false}
                    onChange={(e) => updateSetting('batchFlag', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            )}

            {/* AI Settings */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.temperature || 1.0}
                    onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Controls randomness (0 = consistent, 2 = creative)
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Use Context</label>
                    <p className="text-sm text-gray-500">Add story context for consistency (~200 tokens)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.useContext || false}
                    onChange={(e) => updateSetting('useContext', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>

                {settings.useContext && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Context Paragraph Limit
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={settings.contextParagraphLimit || 0}
                      onChange={(e) => updateSetting('contextParagraphLimit', parseInt(e.target.value))}
                      className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Maximum context paragraphs (0 = unlimited)
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deployment ID (Azure OpenAI)
                  </label>
                  <input
                    type="text"
                    value={settings.deploymentId || ''}
                    onChange={(e) => updateSetting('deploymentId', e.target.value)}
                    placeholder="your-deployment-name"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Azure OpenAI deployment name
                  </p>
                </div>

                <div className="bg-amber-50 p-4 rounded-md">
                  <div className="flex">
                    <Info className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-800">AI Settings Guide</h4>
                      <div className="mt-2 text-sm text-amber-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li><strong>Temperature:</strong> Lower values = more consistent, higher = more creative</li>
                          <li><strong>Context:</strong> Improves narrative consistency but uses more tokens</li>
                          <li><strong>Block Size:</strong> Merging paragraphs can improve accuracy but changes format</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSettings;