# Bilingual Book Maker - Project Documentation

## Overview

Bilingual Book Maker is an AI-powered translation tool that creates multi-language versions of EPUB, TXT, SRT, and Markdown files using various AI translation services. The project supports 10+ translation services including OpenAI GPT models, Claude, Gemini, DeepL, and others, with support for 107 languages.

## Project Structure

```
bilingual_book_maker/
├── book_maker/                    # Main package
│   ├── __init__.py
│   ├── __main__.py               # Package entry point
│   ├── cli.py                    # Command-line interface
│   ├── config.py                 # Configuration management
│   ├── utils.py                  # Shared utilities and language support
│   ├── obok.py                   # Kobo e-reader support
│   ├── loader/                   # File format handlers
│   │   ├── __init__.py           # Loader factory
│   │   ├── base_loader.py        # Abstract base loader
│   │   ├── epub_loader.py        # EPUB file handler
│   │   ├── txt_loader.py         # Plain text handler
│   │   ├── srt_loader.py         # Subtitle file handler
│   │   ├── md_loader.py          # Markdown handler
│   │   └── helper.py             # Loader utilities
│   └── translator/               # Translation service integrations
│       ├── __init__.py           # Translator factory
│       ├── base_translator.py    # Abstract base translator
│       ├── chatgptapi_translator.py  # OpenAI integration
│       ├── claude_translator.py      # Anthropic Claude
│       ├── gemini_translator.py      # Google Gemini
│       ├── groq_translator.py        # Groq integration
│       ├── deepl_translator.py       # DeepL Pro
│       ├── deepl_free_translator.py  # DeepL Free
│       ├── google_translator.py      # Google Translate
│       ├── caiyun_translator.py      # Caiyun Translate
│       ├── tencent_transmart_translator.py  # Tencent TranSmart
│       ├── xai_translator.py         # xAI integration
│       ├── litellm_translator.py     # LiteLLM wrapper
│       └── custom_api_translator.py  # Custom API support
├── docs/                         # Documentation
├── test_books/                   # Sample files for testing
├── tests/                        # Test suite
├── make_book.py                  # Alternative entry point
├── pyproject.toml                # Project configuration
├── requirements.txt              # Dependencies
└── README.md                     # Main documentation
```

## Architecture

### Core Design Patterns

#### Factory Pattern
- **Loaders**: `BOOK_LOADER_DICT` in `loader/__init__.py` maps file extensions to loader classes
- **Translators**: `MODEL_DICT` in `translator/__init__.py` maps model names to translator classes
- Enables easy addition of new file formats and translation services

#### Strategy Pattern
- All translators implement `BaseTranslator` interface but use different translation strategies
- Allows runtime selection of translation service based on user configuration

#### Template Method Pattern
- `BaseBookLoader` defines the translation workflow
- Subclasses implement format-specific details while maintaining consistent processing flow

### Key Components

#### 1. Entry Points

**CLI Interface (`cli.py`)**
- Comprehensive argument parsing with 40+ command-line options
- Supports multiple input formats and translation services
- Advanced features: resume, retranslation, batch processing, context awareness
- Configuration via CLI args, environment variables, and config files

**Main Entry (`__main__.py`, `make_book.py`)**
- Simple delegation to CLI module
- Provides both package-style (`python -m book_maker`) and script-style entry points

#### 2. File Format Handlers (Loaders)

**Base Loader (`base_loader.py`)**
- Abstract class defining common translation workflow
- State management for resume functionality
- Progress tracking and error handling
- Template methods: `_make_new_book()`, `_make_new_file()`

**EPUB Loader (`epub_loader.py`)**
- Complex HTML parsing using BeautifulSoup
- Tag-based translation filtering
- Preserves book structure and formatting
- Resume capability with pickle state serialization

**Text Loaders (`txt_loader.py`, `md_loader.py`)**
- Line-by-line processing
- Batch translation support for efficiency
- Simple state management

**SRT Loader (`srt_loader.py`)**
- Preserves subtitle timing and formatting
- Specialized prompts for subtitle context
- Block-based processing

#### 3. Translation Services (Translators)

**Base Translator (`base_translator.py`)**
- Common interface for all translation services
- API key rotation for rate limiting
- Error handling and retry logic

**OpenAI Integration (`chatgptapi_translator.py`)**
- Support for multiple OpenAI models (GPT-3.5, GPT-4, O1 series)
- Context-aware translation
- Batch API support for efficiency
- Token counting and management

**Claude Integration (`claude_translator.py`)**
- Anthropic Claude model support
- Custom prompt template handling
- Safety and content filtering

**Gemini Integration (`gemini_translator.py`)**
- Google Gemini Pro and Flash models
- Safety settings configuration
- Request interval management

**Other Services**
- DeepL (Pro and Free versions)
- Groq, xAI, Caiyun, Tencent TranSmart
- Custom API support for OpenAI-compatible services
- LiteLLM wrapper for unified API access

#### 4. Configuration and Utilities

**Configuration (`config.py`)**
- Service-specific settings
- Model configuration and defaults
- API endpoint configurations

**Utilities (`utils.py`)**
- Language support (107 languages with code mappings)
- Token counting utilities
- Prompt configuration parsing
- Helper functions for text processing

## Key Features

### Multi-Format Support
- **EPUB**: Complete book translation with structure preservation
- **TXT**: Plain text with batch processing
- **SRT**: Subtitle translation with timing preservation
- **Markdown**: Format-aware translation

### Translation Services
- **OpenAI**: GPT-3.5, GPT-4, O1 models with context awareness
- **Anthropic**: Claude models with safety features
- **Google**: Gemini Pro/Flash with configurable safety
- **DeepL**: Professional and free tiers
- **Others**: Groq, xAI, Caiyun, Tencent TranSmart
- **Custom**: Support for OpenAI-compatible APIs

### Advanced Features
- **Resume Functionality**: Interrupt and resume translations
- **Retranslation**: Re-translate specific sections
- **Context-Aware**: Maintain narrative flow across translations
- **Batch Processing**: Efficient handling of large texts
- **Rate Limiting**: API key rotation and request management
- **Single Translation**: Output only translated version
- **Custom Prompts**: Support for JSON, text, and PromptDown formats

### Language Support
- 107 supported languages
- Automatic language detection
- Flexible language code handling

## Usage Patterns

### Basic Translation
```bash
python make_book.py --book_name book.epub --openai_key YOUR_KEY
```

### Advanced Usage
```bash
python make_book.py --book_name book.epub \
  --model gpt4 \
  --use_context \
  --language ja \
  --temperature 0.7 \
  --batch_size 10
```

### Resume Translation
```bash
python make_book.py --book_name book.epub --resume
```

### Custom Prompts
```bash
python make_book.py --book_name book.epub \
  --prompt "Translate {text} to {language} with literary style"
```

## Configuration Options

### Environment Variables
- `BBM_OPENAI_API_KEY`: OpenAI API key
- `BBM_CAIYUN_API_KEY`: Caiyun API key
- `BBM_CHATGPTAPI_USER_MSG_TEMPLATE`: Custom user message template
- `BBM_CHATGPTAPI_SYS_MSG`: Custom system message

### Key Parameters
- `--model`: Translation service selection
- `--language`: Target language (default: Simplified Chinese)
- `--test`: Preview mode with limited translation
- `--batch_size`: Lines per batch for text files
- `--temperature`: Model creativity setting
- `--use_context`: Enable context-aware translation
- `--single_translate`: Output only translated version
- `--proxy`: HTTP proxy configuration

## Development

### Adding New File Formats
1. Create new loader class inheriting from `BaseBookLoader`
2. Implement abstract methods: `_make_new_book()`, `_make_new_file()`
3. Add mapping in `loader/__init__.py`

### Adding New Translation Services
1. Create translator class inheriting from `BaseTranslator`
2. Implement `translate()` method
3. Add mapping in `translator/__init__.py`
4. Add CLI arguments in `cli.py`

### Testing
- Sample files in `test_books/`
- Integration tests in `tests/`
- Use `--test` flag for safe testing

## Dependencies

### Core Dependencies
- `openai>=1.1.1`: OpenAI API client
- `anthropic`: Claude API client
- `google-generativeai`: Gemini API client
- `ebooklib`: EPUB processing
- `bs4`: HTML parsing
- `tiktoken`: Token counting
- `rich`: Terminal output formatting
- `tqdm`: Progress bars
- `backoff`: Retry logic
- `promptdown>=0.9.0`: Advanced prompt management

### Optional Dependencies
- `groq>=0.5.0`: Groq API client
- `PyDeepLX`: DeepL free translation
- `langdetect`: Language detection

## License

MIT License - See LICENSE file for details.

## Contributing

1. Follow existing code patterns
2. Add tests for new features
3. Run `black` for code formatting
4. Update documentation for new features
5. Submit pull requests with clear descriptions

## Support

- GitHub Issues: https://github.com/yihong0618/bilingual_book_maker/issues
- Documentation: See `docs/` directory
- Examples: See `test_books/` directory