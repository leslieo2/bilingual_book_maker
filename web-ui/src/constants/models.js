// Translation models and their configurations
export const TRANSLATION_MODELS = [
  { value: 'chatgptapi', label: 'ChatGPT API (GPT-3.5)', category: 'OpenAI' },
  { value: 'gpt4', label: 'GPT-4', category: 'OpenAI' },
  { value: 'gpt4omini', label: 'GPT-4o Mini', category: 'OpenAI' },
  { value: 'gpt4o', label: 'GPT-4o', category: 'OpenAI' },
  { value: 'o1preview', label: 'O1 Preview', category: 'OpenAI' },
  { value: 'o1', label: 'O1', category: 'OpenAI' },
  { value: 'o1mini', label: 'O1 Mini', category: 'OpenAI' },
  { value: 'o3mini', label: 'O3 Mini', category: 'OpenAI' },
  { value: 'openai', label: 'Custom OpenAI Model', category: 'OpenAI' },
  { value: 'claude', label: 'Claude', category: 'Anthropic' },
  { value: 'claude-2', label: 'Claude 2', category: 'Anthropic' },
  { value: 'claude-3', label: 'Claude 3', category: 'Anthropic' },
  { value: 'gemini', label: 'Gemini Flash', category: 'Google' },
  { value: 'geminipro', label: 'Gemini Pro', category: 'Google' },
  { value: 'groq', label: 'Groq', category: 'Groq' },
  { value: 'xai', label: 'xAI Grok', category: 'xAI' },
  { value: 'deepl', label: 'DeepL Pro', category: 'DeepL' },
  { value: 'deeplfree', label: 'DeepL Free', category: 'DeepL' },
  { value: 'google', label: 'Google Translate', category: 'Google' },
  { value: 'caiyun', label: 'Caiyun Translate', category: 'Caiyun' },
  { value: 'tencentransmart', label: 'Tencent TranSmart', category: 'Tencent' },
  { value: 'customapi', label: 'Custom API', category: 'Custom' },
  { value: 'litellm', label: 'LiteLLM', category: 'LiteLLM' }
];

// Supported languages - simplified version for UI
export const LANGUAGES = [
  { value: 'zh-hans', label: '简体中文 (Simplified Chinese)' },
  { value: 'zh-hant', label: '繁體中文 (Traditional Chinese)' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語 (Japanese)' },
  { value: 'ko', label: '한국어 (Korean)' },
  { value: 'fr', label: 'Français (French)' },
  { value: 'de', label: 'Deutsch (German)' },
  { value: 'es', label: 'Español (Spanish)' },
  { value: 'it', label: 'Italiano (Italian)' },
  { value: 'pt', label: 'Português (Portuguese)' },
  { value: 'ru', label: 'Русский (Russian)' },
  { value: 'ar', label: 'العربية (Arabic)' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'th', label: 'ไทย (Thai)' },
  { value: 'vi', label: 'Tiếng Việt (Vietnamese)' },
  { value: 'nl', label: 'Nederlands (Dutch)' },
  { value: 'sv', label: 'Svenska (Swedish)' },
  { value: 'da', label: 'Dansk (Danish)' },
  { value: 'no', label: 'Norsk (Norwegian)' },
  { value: 'fi', label: 'Suomi (Finnish)' },
  { value: 'pl', label: 'Polski (Polish)' },
  { value: 'tr', label: 'Türkçe (Turkish)' },
  { value: 'he', label: 'עברית (Hebrew)' },
  { value: 'cs', label: 'Čeština (Czech)' },
  { value: 'hu', label: 'Magyar (Hungarian)' },
  { value: 'ro', label: 'Română (Romanian)' },
  { value: 'bg', label: 'Български (Bulgarian)' },
  { value: 'hr', label: 'Hrvatski (Croatian)' },
  { value: 'sk', label: 'Slovenčina (Slovak)' },
  { value: 'sl', label: 'Slovenščina (Slovenian)' },
  { value: 'et', label: 'Eesti (Estonian)' },
  { value: 'lv', label: 'Latviešu (Latvian)' },
  { value: 'lt', label: 'Lietuvių (Lithuanian)' }
];

// Supported file formats
export const SUPPORTED_FORMATS = [
  { extension: 'epub', label: 'EPUB Books', accept: '.epub' },
  { extension: 'txt', label: 'Text Files', accept: '.txt' },
  { extension: 'srt', label: 'Subtitle Files', accept: '.srt' },
  { extension: 'md', label: 'Markdown Files', accept: '.md' }
];

// Model requirements for API keys
export const MODEL_API_REQUIREMENTS = {
  chatgptapi: 'openai_key',
  gpt4: 'openai_key',
  gpt4omini: 'openai_key',
  gpt4o: 'openai_key',
  o1preview: 'openai_key',
  o1: 'openai_key',
  o1mini: 'openai_key',
  o3mini: 'openai_key',
  openai: 'openai_key',
  claude: 'claude_key',
  'claude-2': 'claude_key',
  'claude-3': 'claude_key',
  gemini: 'gemini_key',
  geminipro: 'gemini_key',
  groq: 'groq_key',
  xai: 'xai_key',
  deepl: 'deepl_key',
  caiyun: 'caiyun_key',
  customapi: 'custom_api'
};

// Default prompt templates
export const DEFAULT_PROMPTS = {
  system: "You are a professional translator who specializes in accurate and fluent translations while preserving the original meaning and style.",
  user: "Please translate the following text into {language}:\n\n{text}"
};