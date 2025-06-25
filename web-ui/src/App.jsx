import React, { useState, useCallback, useEffect } from 'react';
import { BookOpen, Github, ExternalLink } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ModelSelector from './components/ModelSelector';
import LanguageSelector from './components/LanguageSelector';
import AdvancedSettings from './components/AdvancedSettings';
import ProgressTracker from './components/ProgressTracker';
import { DEFAULT_PROMPTS } from './constants/models';
import { apiService, TranslationPoller } from './services/api';

function App() {
  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);

  // Model and language state
  const [selectedModel, setSelectedModel] = useState('chatgptapi');
  const [selectedLanguage, setSelectedLanguage] = useState('zh-hans');
  const [apiKeys, setApiKeys] = useState({});
  const [customModelList, setCustomModelList] = useState('');

  // Advanced settings state
  const [advancedSettings, setAdvancedSettings] = useState({
    test: false,
    testNum: 10,
    resume: false,
    singleTranslate: false,
    proxy: '',
    apiBase: '',
    systemPrompt: DEFAULT_PROMPTS.system,
    userPrompt: DEFAULT_PROMPTS.user,
    translateTags: 'p',
    excludeTranslateTags: 'sup',
    excludeFilelist: '',
    onlyFilelist: '',
    allowNavigableStrings: false,
    translationStyle: '',
    batchSize: 10,
    accumulatedNum: 1,
    blockSize: -1,
    parallelWorkers: 1,
    interval: 0.01,
    batchFlag: false,
    temperature: 1.0,
    useContext: false,
    contextParagraphLimit: 0,
    deploymentId: ''
  });

  // Translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [translationId, setTranslationId] = useState(null);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    status: 'pending',
    currentItem: '',
    errors: 0,
    tokensUsed: 0,
    outputFile: null,
    logs: []
  });
  const [translationError, setTranslationError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [poller, setPoller] = useState(null);
  const [serverHealth, setServerHealth] = useState(null);

  // Check server health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await apiService.healthCheck();
        setServerHealth(health);
      } catch (error) {
        console.warn('Server health check failed:', error.message);
        setServerHealth({ status: 'unhealthy', error: error.message });
      }
    };
    
    checkHealth();
  }, []);

  // Cleanup poller on unmount
  useEffect(() => {
    return () => {
      if (poller) {
        poller.stop();
      }
    };
  }, [poller]);

  // Handlers
  const handleFileSelect = useCallback((file, error) => {
    setSelectedFile(file);
    setFileError(error);
    // Reset translation state when new file is selected
    if (file) {
      setProgress({
        current: 0,
        total: 0,
        status: 'pending',
        currentItem: '',
        errors: 0,
        tokensUsed: 0,
        outputFile: null,
        logs: []
      });
      setTranslationError(null);
      setDownloadUrl(null);
      setTranslationId(null);
      if (poller) {
        poller.stop();
        setPoller(null);
      }
    }
  }, [poller]);

  const handleApiKeyChange = useCallback((keyType, value) => {
    setApiKeys(prev => ({ ...prev, [keyType]: value }));
  }, []);

  const handleStartTranslation = async () => {
    if (!selectedFile) {
      setFileError('Please select a file to translate');
      return;
    }

    // Check server health
    if (!serverHealth || serverHealth.status !== 'healthy') {
      setTranslationError('API server is not available. Please check if the server is running.');
      return;
    }

    // Validate required API key
    const requiredKey = getRequiredApiKey(selectedModel);
    if (requiredKey && !apiKeys[requiredKey]) {
      setTranslationError(`Please provide ${getApiKeyLabel(requiredKey)}`);
      return;
    }

    setIsTranslating(true);
    setIsPaused(false);
    setTranslationError(null);
    setProgress({
      current: 0,
      total: 0,
      status: 'pending',
      currentItem: selectedFile.name,
      errors: 0,
      tokensUsed: 0,
      outputFile: null,
      logs: []
    });

    try {
      // Prepare settings for API
      const settings = {
        model: selectedModel,
        language: selectedLanguage,
        api_keys: apiKeys,
        custom_model_list: customModelList,
        ...advancedSettings
      };

      // Start translation via API
      const result = await apiService.startTranslation(selectedFile, settings);
      const newTranslationId = result.translation_id;
      setTranslationId(newTranslationId);

      // Start polling for progress updates
      const newPoller = new TranslationPoller(
        newTranslationId,
        handleProgressUpdate,
        handleTranslationComplete,
        handleTranslationError
      );
      
      setPoller(newPoller);
      newPoller.start(2000); // Poll every 2 seconds

    } catch (error) {
      setTranslationError(error.message);
      setIsTranslating(false);
    }
  };

  const handleProgressUpdate = useCallback((status) => {
    setProgress(status);
    setIsPaused(status.status === 'paused');
    
    // Update download URL when translation completes
    if (status.status === 'completed' && status.outputFile) {
      setDownloadUrl(apiService.getDownloadUrl(translationId));
    }
  }, [translationId]);

  const handleTranslationComplete = useCallback((status) => {
    setIsTranslating(false);
    setIsPaused(false);
    
    if (status.status === 'completed' && status.outputFile) {
      setDownloadUrl(apiService.getDownloadUrl(translationId));
    }
  }, [translationId]);

  const handleTranslationError = useCallback((error) => {
    setTranslationError(error.message);
    setIsTranslating(false);
    setIsPaused(false);
  }, []);

  const handlePauseTranslation = async () => {
    if (!translationId) return;
    
    try {
      await apiService.pauseTranslation(translationId);
      setIsPaused(true);
    } catch (error) {
      setTranslationError(`Failed to pause translation: ${error.message}`);
    }
  };

  const handleResumeTranslation = async () => {
    if (!translationId) return;
    
    try {
      await apiService.resumeTranslation(translationId);
      setIsPaused(false);
    } catch (error) {
      setTranslationError(`Failed to resume translation: ${error.message}`);
    }
  };

  const handleCancelTranslation = async () => {
    if (!translationId) return;
    
    try {
      await apiService.cancelTranslation(translationId);
      setIsTranslating(false);
      setIsPaused(false);
      
      if (poller) {
        poller.stop();
        setPoller(null);
      }
    } catch (error) {
      setTranslationError(`Failed to cancel translation: ${error.message}`);
    }
  };

  const handleDownload = async () => {
    if (!translationId || !progress.outputFile) return;
    
    try {
      const filename = selectedFile.name.replace(/\.[^/.]+$/, '') + 
        (advancedSettings.singleTranslate ? '_translated.' : '_bilingual.') + 
        selectedFile.name.split('.').pop();
        
      await apiService.downloadFile(translationId, filename);
    } catch (error) {
      setTranslationError(`Download failed: ${error.message}`);
    }
  };

  const getRequiredApiKey = (model) => {
    const keyMap = {
      'chatgptapi': 'openai_key',
      'gpt4': 'openai_key',
      'gpt4omini': 'openai_key',
      'gpt4o': 'openai_key',
      'o1preview': 'openai_key',
      'o1': 'openai_key',
      'o1mini': 'openai_key',
      'o3mini': 'openai_key',
      'openai': 'openai_key',
      'claude': 'claude_key',
      'claude-2': 'claude_key',
      'claude-3': 'claude_key',
      'gemini': 'gemini_key',
      'geminipro': 'gemini_key',
      'groq': 'groq_key',
      'xai': 'xai_key',
      'deepl': 'deepl_key',
      'caiyun': 'caiyun_key',
      'customapi': 'custom_api'
    };
    return keyMap[model];
  };

  const getApiKeyLabel = (keyType) => {
    const labels = {
      'openai_key': 'OpenAI API Key',
      'claude_key': 'Claude API Key',
      'gemini_key': 'Gemini API Key',
      'groq_key': 'Groq API Key',
      'xai_key': 'xAI API Key',
      'deepl_key': 'DeepL API Key',
      'caiyun_key': 'Caiyun API Key',
      'custom_api': 'Custom API Key'
    };
    return labels[keyType] || 'API Key';
  };

  const canStartTranslation = () => {
    if (!selectedFile || isTranslating) return false;
    if (!serverHealth || serverHealth.status !== 'healthy') return false;
    const requiredKey = getRequiredApiKey(selectedModel);
    return !requiredKey || apiKeys[requiredKey];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bilingual Book Maker</h1>
                <p className="text-sm text-gray-500">AI-powered book translation tool</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/yihong0618/bilingual_book_maker"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <Github className="h-5 w-5 mr-1" />
                <span className="text-sm">GitHub</span>
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-2 space-y-8">
            {/* File Upload */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                error={fileError}
              />
            </div>

            {/* Model Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                apiKeys={apiKeys}
                onApiKeyChange={handleApiKeyChange}
                customModelList={customModelList}
                onCustomModelListChange={setCustomModelList}
              />
            </div>

            {/* Language Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
              />
            </div>

            {/* Advanced Settings */}
            <div className="bg-white rounded-lg shadow-sm">
              <AdvancedSettings
                settings={advancedSettings}
                onSettingsChange={setAdvancedSettings}
              />
            </div>
          </div>

          {/* Right Column - Action & Progress */}
          <div className="space-y-6">
            {/* Translation Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Translation Control</h3>
              
              {!isTranslating && !progress.completed && (
                <button
                  onClick={handleStartTranslation}
                  disabled={!canStartTranslation()}
                  className={`w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                    canStartTranslation()
                      ? 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Start Translation
                </button>
              )}

              {(isTranslating || progress.status === 'completed' || translationError) && (
                <ProgressTracker
                  isTranslating={isTranslating}
                  progress={progress}
                  error={translationError}
                  onCancel={handleCancelTranslation}
                  onPause={handlePauseTranslation}
                  onResume={handleResumeTranslation}
                  isPaused={isPaused}
                  logs={progress.logs || []}
                  downloadUrl={downloadUrl}
                  onDownload={handleDownload}
                />
              )}

              {/* Prerequisites */}
              {!canStartTranslation() && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Requirements</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {!selectedFile && <li>• Select a file to translate</li>}
                    {(!serverHealth || serverHealth.status !== 'healthy') && (
                      <li>• API server is not available. Please start the server with: python api_server.py</li>
                    )}
                    {selectedFile && getRequiredApiKey(selectedModel) && !apiKeys[getRequiredApiKey(selectedModel)] && (
                      <li>• Provide {getApiKeyLabel(getRequiredApiKey(selectedModel))}</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Tips</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  Use test mode for quick previews before full translation
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  GPT-4 provides highest quality but costs more
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  Enable context for better narrative consistency
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  You can pause and resume translations anytime
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  EPUB files preserve original formatting
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>
              Bilingual Book Maker Web UI - Open source AI translation tool
            </p>
            <p className="mt-1">
              Built with React • Powered by multiple AI models
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;