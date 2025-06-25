# Bilingual Book Maker Web UI

A modern React web interface for the Bilingual Book Maker CLI tool, providing an intuitive way to translate EPUB, TXT, SRT, and Markdown files using various AI translation services.

## Features

### 🎯 Complete CLI Feature Parity
- **File Upload**: Drag & drop support for EPUB, TXT, SRT, MD files
- **Multi-Model Support**: 10+ AI services (OpenAI, Claude, Gemini, DeepL, etc.)
- **Language Selection**: 30+ supported languages with native names
- **Advanced Settings**: All CLI options available through tabbed interface

### 🚀 Enhanced User Experience
- **Real-time Progress**: Live translation progress with ETA and statistics
- **Pause/Resume**: Control translation process with pause/resume functionality
- **Error Handling**: Comprehensive error messages and recovery options
- **Download Management**: Direct download links for completed translations

### ⚙️ Advanced Configuration
- **Prompt Customization**: Custom system and user prompts with template support
- **Processing Options**: Tag filtering, file exclusion, batch settings
- **Performance Tuning**: Token limits, request intervals, batch processing
- **AI Settings**: Temperature, context awareness, model-specific options

## Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Backend API server (for actual translation functionality)

### Installation

```bash
# Navigate to web-ui directory
cd web-ui

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

### Production Build

```bash
# Create production build
npm run build

# Serve static files
npx serve -s build
```

## Project Structure

```
web-ui/
├── public/
│   ├── index.html              # Main HTML template
│   └── manifest.json           # PWA manifest
├── src/
│   ├── components/             # React components
│   │   ├── FileUpload.jsx      # File upload with drag & drop
│   │   ├── ModelSelector.jsx   # AI model selection
│   │   ├── LanguageSelector.jsx # Target language picker
│   │   ├── AdvancedSettings.jsx # Tabbed advanced options
│   │   └── ProgressTracker.jsx # Translation progress display
│   ├── constants/
│   │   └── models.js           # Model definitions and constants
│   ├── App.jsx                 # Main application component
│   ├── index.js               # React entry point
│   └── index.css              # Global styles with Tailwind
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind CSS configuration
└── README.md                  # This file
```

## Component Overview

### 📁 FileUpload
- Drag & drop file upload interface
- File type validation and size limits
- Visual file preview with metadata
- Support for EPUB, TXT, SRT, MD formats

### 🤖 ModelSelector
- Grouped model selection (OpenAI, Anthropic, Google, etc.)
- Secure API key input with masked display
- Model-specific configuration options
- Custom model list support for advanced users

### 🌍 LanguageSelector
- Searchable language dropdown
- Native language names with English translations
- 30+ supported languages
- ISO language code mapping

### ⚙️ AdvancedSettings
Tabbed interface with five categories:

1. **General**: Test mode, resume, proxy, API base
2. **Prompt**: Custom system and user prompts
3. **Processing**: Tag filtering, file exclusion, styling
4. **Performance**: Batch settings, token limits, intervals
5. **AI Settings**: Temperature, context, deployment options

### 📊 ProgressTracker
- Real-time progress bar with percentage
- Elapsed time and ETA calculation
- Current item being processed
- Translation statistics (tokens, errors)
- Pause/resume/cancel controls
- Scrollable log display
- Download link for completed files

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```bash
# API endpoints
REACT_APP_API_BASE_URL=http://localhost:8000

# Optional: Enable features
REACT_APP_ENABLE_BATCH_API=true
REACT_APP_MAX_FILE_SIZE=100
```

### Tailwind CSS
The UI uses Tailwind CSS for styling with custom configurations:

- **Primary Color**: Blue theme with custom shades
- **Form Styling**: Enhanced form controls with focus states
- **Responsive Design**: Mobile-first responsive layout
- **Dark Mode**: Ready for dark mode implementation

## Backend Integration

The UI is designed to work with a REST API backend. Expected endpoints:

```bash
POST /api/translate          # Start translation
GET  /api/translate/:id      # Get translation status
POST /api/translate/:id/pause # Pause translation
POST /api/translate/:id/resume # Resume translation
DELETE /api/translate/:id    # Cancel translation
GET  /api/download/:id       # Download result
```

### Example API Integration

```javascript
// Start translation
const response = await fetch('/api/translate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    file: fileData,
    model: selectedModel,
    language: selectedLanguage,
    settings: advancedSettings,
    apiKeys: apiKeys
  })
});
```

## Development

### Available Scripts

```bash
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
npm run eject      # Eject from Create React App
```

### Customization

#### Adding New Models
1. Update `src/constants/models.js`
2. Add model to `TRANSLATION_MODELS` array
3. Update `MODEL_API_REQUIREMENTS` if API key needed

#### Adding New Languages
1. Update `LANGUAGES` array in `src/constants/models.js`
2. Use standard ISO language codes

#### Styling Changes
1. Modify `tailwind.config.js` for theme changes
2. Update component classes for UI modifications
3. Add custom CSS to `src/index.css` if needed

## Deployment

### Static Hosting
Build and deploy to any static hosting service:

```bash
npm run build
# Deploy 'build' folder to Netlify, Vercel, etc.
```

### Docker Deployment

```dockerfile
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Production Considerations

1. **API Security**: Implement proper authentication for API endpoints
2. **File Storage**: Set up secure file upload and download handling
3. **Rate Limiting**: Implement rate limiting for translation requests
4. **Monitoring**: Add error tracking and analytics
5. **CDN**: Use CDN for static assets in production

## Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Mobile**: iOS Safari 14+, Chrome Android 88+
- **Features**: ES2020, CSS Grid, Flexbox, File API, Drag & Drop

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Use ESLint and Prettier for code formatting
- Follow React functional component patterns
- Use hooks for state management
- Implement proper TypeScript types (if converting)

## License

This project follows the same license as the main Bilingual Book Maker project (MIT License).

## Support

- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: See main project documentation
- **Community**: Join discussions in the main repository

---

**Note**: This is a frontend-only implementation. You'll need to implement the backend API to handle actual file processing and translation services integration.