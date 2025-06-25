import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { SUPPORTED_FORMATS } from '../constants/models';

const FileUpload = ({ onFileSelect, selectedFile, error }) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setDragActive(false);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      let errorMessage = 'File upload failed: ';
      
      if (rejection.errors.find(e => e.code === 'file-too-large')) {
        errorMessage += 'File is too large (max 100MB)';
      } else if (rejection.errors.find(e => e.code === 'file-invalid-type')) {
        errorMessage += 'File type not supported';
      } else {
        errorMessage += rejection.errors[0]?.message || 'Unknown error';
      }
      
      onFileSelect(null, errorMessage);
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onFileSelect(file, null);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    accept: {
      'application/epub+zip': ['.epub'],
      'text/plain': ['.txt'],
      'application/x-subrip': ['.srt'],
      'text/markdown': ['.md']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false
  });

  const removeFile = () => {
    onFileSelect(null, null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeLabel = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    const format = SUPPORTED_FORMATS.find(f => f.extension === extension);
    return format ? format.label : 'Unknown File Type';
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select File to Translate</h3>
        <p className="text-sm text-gray-500">
          Supported formats: EPUB, TXT, SRT, MD (Max size: 100MB)
        </p>
      </div>

      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`
            drop-zone border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${isDragActive || dragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <Upload className={`h-12 w-12 mb-4 ${isDragActive ? 'text-primary-500' : 'text-gray-400'}`} />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Drop your file here' : 'Choose a file or drag it here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              EPUB, TXT, SRT, or MD files up to 100MB
            </p>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Select File
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <File className="h-8 w-8 text-primary-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {getFileTypeLabel(selectedFile.name)} • {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="flex-shrink-0 ml-4 p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-blue-800 mb-2">File Format Support</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li><strong>EPUB:</strong> Complete e-book translation with structure preservation</li>
          <li><strong>TXT:</strong> Plain text files with batch processing support</li>
          <li><strong>SRT:</strong> Subtitle files with timing preservation</li>
          <li><strong>MD:</strong> Markdown files with format-aware translation</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;