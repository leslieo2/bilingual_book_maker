#!/usr/bin/env python3
"""
Flask API Server for Bilingual Book Maker Web UI
Integrates with existing translation services and provides REST endpoints
"""

import os
import json
import uuid
import threading
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import tempfile

# Import existing book_maker modules
from book_maker.loader import BOOK_LOADER_DICT
from book_maker.translator import MODEL_DICT
from book_maker.utils import LANGUAGES, TO_LANGUAGE_CODE
from book_maker.cli import parse_prompt_arg

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
UPLOAD_FOLDER = tempfile.mkdtemp(prefix='bbm_uploads_')
OUTPUT_FOLDER = tempfile.mkdtemp(prefix='bbm_outputs_')
MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Global state for tracking translations
active_translations: Dict[str, Dict[str, Any]] = {}
translation_results: Dict[str, Dict[str, Any]] = {}

class TranslationProgress:
    """Thread-safe progress tracking for translations"""
    
    def __init__(self, translation_id: str):
        self.translation_id = translation_id
        self.current = 0
        self.total = 0
        self.status = 'pending'  # pending, running, paused, completed, error
        self.current_item = ''
        self.errors = 0
        self.tokens_used = 0
        self.start_time = None
        self.error_message = None
        self.output_file = None
        self.logs = []
        self._lock = threading.Lock()
    
    def update(self, **kwargs):
        with self._lock:
            for key, value in kwargs.items():
                if hasattr(self, key):
                    setattr(self, key, value)
    
    def add_log(self, message: str, level: str = 'info'):
        with self._lock:
            self.logs.append({
                'timestamp': datetime.now().isoformat(),
                'message': message,
                'level': level
            })
    
    def to_dict(self):
        with self._lock:
            return {
                'current': self.current,
                'total': self.total,
                'status': self.status,
                'current_item': self.current_item,
                'errors': self.errors,
                'tokens_used': self.tokens_used,
                'start_time': self.start_time,
                'error_message': self.error_message,
                'output_file': self.output_file,
                'logs': self.logs[-50:]  # Keep last 50 logs
            }

def create_book_loader(book_path: str, settings: Dict[str, Any], progress: TranslationProgress):
    """Create and configure book loader based on settings"""
    
    # Get file extension
    book_type = book_path.split('.')[-1].lower()
    if book_type not in BOOK_LOADER_DICT:
        raise ValueError(f"Unsupported file type: {book_type}")
    
    # Get translator model
    model_name = settings.get('model', 'chatgptapi')
    if model_name not in MODEL_DICT:
        raise ValueError(f"Unsupported model: {model_name}")
    
    translate_model = MODEL_DICT[model_name]
    
    # Get API key
    api_key = settings.get('api_keys', {}).get(get_required_api_key(model_name), '')
    if not api_key and requires_api_key(model_name):
        raise ValueError(f"API key required for model: {model_name}")
    
    # Parse language
    language = settings.get('language', 'zh-hans')
    if language in LANGUAGES:
        language = LANGUAGES.get(language, language)
    
    # Parse prompt configuration
    prompt_config = None
    if settings.get('system_prompt') or settings.get('user_prompt'):
        prompt_config = {}
        if settings.get('system_prompt'):
            prompt_config['system'] = settings['system_prompt']
        if settings.get('user_prompt'):
            prompt_config['user'] = settings['user_prompt']
        else:
            prompt_config['user'] = "Please translate the following text into {language}:\n\n{text}"
    
    # Create book loader
    book_loader_class = BOOK_LOADER_DICT[book_type]
    loader = book_loader_class(
        book_path,
        translate_model,
        api_key,
        settings.get('resume', False),
        language=language,
        model_api_base=settings.get('api_base'),
        is_test=settings.get('test', False),
        test_num=settings.get('test_num', 10),
        prompt_config=prompt_config,
        single_translate=settings.get('single_translate', False),
        context_flag=settings.get('use_context', False),
        context_paragraph_limit=settings.get('context_paragraph_limit', 0),
        temperature=settings.get('temperature', 1.0),
        parallel_workers=settings.get('parallel_workers', 1)
    )
    
    # Apply additional settings
    if settings.get('translate_tags'):
        loader.translate_tags = settings['translate_tags']
    if settings.get('exclude_translate_tags'):
        loader.exclude_translate_tags = settings['exclude_translate_tags']
    if settings.get('exclude_filelist'):
        loader.exclude_filelist = settings['exclude_filelist']
    if settings.get('only_filelist'):
        loader.only_filelist = settings['only_filelist']
    if settings.get('allow_navigable_strings'):
        loader.allow_navigable_strings = True
    if settings.get('accumulated_num', 1) > 1:
        loader.accumulated_num = settings['accumulated_num']
    if settings.get('translation_style'):
        loader.translation_style = settings['translation_style']
    if settings.get('batch_size'):
        loader.batch_size = settings['batch_size']
    if settings.get('block_size', -1) > 0:
        loader.block_size = settings['block_size']
    
    # Configure model-specific settings
    configure_model_settings(loader, settings)
    
    return loader

def configure_model_settings(loader, settings):
    """Configure model-specific settings"""
    model_name = settings.get('model', 'chatgptapi')
    
    # Set deployment ID for Azure OpenAI
    if settings.get('deployment_id') and hasattr(loader.translate_model, 'set_deployment_id'):
        loader.translate_model.set_deployment_id(settings['deployment_id'])
    
    # Set custom model list
    if settings.get('custom_model_list') and hasattr(loader.translate_model, 'set_model_list'):
        models = settings['custom_model_list'].split(',')
        loader.translate_model.set_model_list([m.strip() for m in models])
    
    # Configure specific models
    if model_name == 'chatgptapi':
        loader.translate_model.set_gpt35_models()
    elif model_name == 'gpt4':
        loader.translate_model.set_gpt4_models()
    elif model_name == 'gpt4omini':
        loader.translate_model.set_gpt4omini_models()
    elif model_name == 'gpt4o':
        loader.translate_model.set_gpt4o_models()
    elif model_name == 'o1preview':
        loader.translate_model.set_o1preview_models()
    elif model_name == 'o1':
        loader.translate_model.set_o1_models()
    elif model_name == 'o1mini':
        loader.translate_model.set_o1mini_models()
    elif model_name == 'o3mini':
        loader.translate_model.set_o3mini_models()
    elif model_name.startswith('claude-'):
        loader.translate_model.set_claude_model(model_name)
    elif model_name == 'gemini':
        if settings.get('custom_model_list'):
            models = settings['custom_model_list'].split(',')
            loader.translate_model.set_model_list([m.strip() for m in models])
        else:
            loader.translate_model.set_geminiflash_models()
        if settings.get('interval'):
            loader.translate_model.set_interval(settings['interval'])
    elif model_name == 'geminipro':
        loader.translate_model.set_geminipro_models()
        if settings.get('interval'):
            loader.translate_model.set_interval(settings['interval'])

def get_required_api_key(model_name: str) -> Optional[str]:
    """Get the required API key type for a model"""
    key_map = {
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
    }
    return key_map.get(model_name)

def requires_api_key(model_name: str) -> bool:
    """Check if model requires an API key"""
    no_key_models = ['google', 'deeplfree', 'tencentransmart']
    return model_name not in no_key_models

def translation_worker(translation_id: str, book_path: str, settings: Dict[str, Any]):
    """Background worker for translation"""
    progress = active_translations[translation_id]
    
    try:
        progress.add_log("Starting translation process...", "info")
        progress.update(status='running', start_time=datetime.now().isoformat())
        
        # Set proxy if provided
        if settings.get('proxy'):
            os.environ['http_proxy'] = settings['proxy']
            os.environ['https_proxy'] = settings['proxy']
        
        # Create book loader
        loader = create_book_loader(book_path, settings, progress)
        
        # Monkey patch loader to report progress
        original_method = loader._process_paragraph if hasattr(loader, '_process_paragraph') else None
        
        def progress_wrapper(*args, **kwargs):
            if original_method:
                result = original_method(*args, **kwargs)
                progress.update(current=progress.current + 1)
                if len(args) > 0:
                    progress.update(current_item=str(args[0])[:100])
                return result
        
        if original_method:
            loader._process_paragraph = progress_wrapper
        
        # Start translation
        progress.add_log(f"Processing file: {book_path}", "info")
        loader.make_bilingual_book()
        
        # Find output file
        book_name = Path(book_path).stem
        if settings.get('single_translate'):
            output_file = f"{book_name}_translated.{Path(book_path).suffix[1:]}"
        else:
            output_file = f"{book_name}_bilingual.{Path(book_path).suffix[1:]}"
        
        output_path = Path(book_path).parent / output_file
        
        if output_path.exists():
            # Move to output folder
            final_output = Path(app.config['OUTPUT_FOLDER']) / f"{translation_id}_{output_file}"
            output_path.rename(final_output)
            progress.update(output_file=str(final_output))
            progress.add_log("Translation completed successfully!", "success")
        else:
            progress.add_log("Warning: Output file not found", "warning")
        
        progress.update(status='completed')
        
    except Exception as e:
        error_msg = str(e)
        progress.update(status='error', error_message=error_msg)
        progress.add_log(f"Translation failed: {error_msg}", "error")
    
    finally:
        # Move to results
        translation_results[translation_id] = active_translations.pop(translation_id)

@app.route('/api/models', methods=['GET'])
def get_models():
    """Get available translation models"""
    models = []
    for model_name in MODEL_DICT.keys():
        models.append({
            'value': model_name,
            'label': model_name.replace('_', ' ').title(),
            'requires_api_key': requires_api_key(model_name),
            'api_key_type': get_required_api_key(model_name)
        })
    return jsonify(models)

@app.route('/api/languages', methods=['GET'])
def get_languages():
    """Get available target languages"""
    languages = []
    for code, name in LANGUAGES.items():
        languages.append({'value': code, 'label': name})
    return jsonify(languages)

@app.route('/api/translate', methods=['POST'])
def start_translation():
    """Start a new translation job"""
    
    # Check if file was uploaded
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Get settings from form data
    settings = {}
    try:
        settings_json = request.form.get('settings', '{}')
        settings = json.loads(settings_json)
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid settings JSON'}), 400
    
    # Validate file type
    filename = secure_filename(file.filename)
    file_ext = filename.split('.')[-1].lower()
    if file_ext not in BOOK_LOADER_DICT:
        return jsonify({'error': f'Unsupported file type: {file_ext}'}), 400
    
    # Save uploaded file
    translation_id = str(uuid.uuid4())
    upload_path = Path(app.config['UPLOAD_FOLDER']) / f"{translation_id}_{filename}"
    file.save(upload_path)
    
    try:
        # Create progress tracker
        progress = TranslationProgress(translation_id)
        active_translations[translation_id] = progress
        
        # Start translation in background thread
        thread = threading.Thread(
            target=translation_worker,
            args=(translation_id, str(upload_path), settings)
        )
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'translation_id': translation_id,
            'status': 'started',
            'message': 'Translation job started successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/translate/<translation_id>', methods=['GET'])
def get_translation_status(translation_id):
    """Get translation progress and status"""
    
    # Check active translations
    if translation_id in active_translations:
        progress = active_translations[translation_id]
        return jsonify(progress.to_dict())
    
    # Check completed translations
    if translation_id in translation_results:
        progress = translation_results[translation_id]
        return jsonify(progress.to_dict())
    
    return jsonify({'error': 'Translation not found'}), 404

@app.route('/api/translate/<translation_id>/pause', methods=['POST'])
def pause_translation(translation_id):
    """Pause a running translation"""
    if translation_id not in active_translations:
        return jsonify({'error': 'Translation not found'}), 404
    
    progress = active_translations[translation_id]
    progress.update(status='paused')
    progress.add_log("Translation paused by user", "warning")
    
    return jsonify({'status': 'paused'})

@app.route('/api/translate/<translation_id>/resume', methods=['POST'])
def resume_translation(translation_id):
    """Resume a paused translation"""
    if translation_id not in active_translations:
        return jsonify({'error': 'Translation not found'}), 404
    
    progress = active_translations[translation_id]
    progress.update(status='running')
    progress.add_log("Translation resumed by user", "info")
    
    return jsonify({'status': 'resumed'})

@app.route('/api/translate/<translation_id>/cancel', methods=['DELETE'])
def cancel_translation(translation_id):
    """Cancel a running translation"""
    if translation_id in active_translations:
        progress = active_translations[translation_id]
        progress.update(status='cancelled')
        progress.add_log("Translation cancelled by user", "warning")
        translation_results[translation_id] = active_translations.pop(translation_id)
        return jsonify({'status': 'cancelled'})
    
    return jsonify({'error': 'Translation not found'}), 404

@app.route('/api/download/<translation_id>', methods=['GET'])
def download_result(translation_id):
    """Download translation result"""
    
    # Check results
    if translation_id not in translation_results:
        return jsonify({'error': 'Translation result not found'}), 404
    
    progress = translation_results[translation_id]
    if not progress.output_file or not Path(progress.output_file).exists():
        return jsonify({'error': 'Output file not found'}), 404
    
    return send_file(
        progress.output_file,
        as_attachment=True,
        download_name=Path(progress.output_file).name.split('_', 1)[1]  # Remove translation_id prefix
    )

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'active_translations': len(active_translations),
        'completed_translations': len(translation_results)
    })

@app.errorhandler(413)
def file_too_large(e):
    return jsonify({'error': 'File too large. Maximum size is 100MB.'}), 413

if __name__ == '__main__':
    # Create upload and output directories
    Path(UPLOAD_FOLDER).mkdir(exist_ok=True)
    Path(OUTPUT_FOLDER).mkdir(exist_ok=True)
    
    print(f"Starting Bilingual Book Maker API Server...")
    print(f"Upload folder: {UPLOAD_FOLDER}")
    print(f"Output folder: {OUTPUT_FOLDER}")
    
    app.run(debug=True, host='0.0.0.0', port=8002)