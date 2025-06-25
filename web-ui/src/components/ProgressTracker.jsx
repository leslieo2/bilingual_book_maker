import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Download, Pause, Play, Square } from 'lucide-react';

const ProgressTracker = ({ 
  isTranslating, 
  progress, 
  error, 
  onCancel, 
  onPause, 
  onResume,
  isPaused,
  logs,
  downloadUrl,
  onDownload
}) => {
  const getStatusIcon = () => {
    if (error) return <XCircle className="h-5 w-5 text-red-500" />;
    if (progress.status === 'completed') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (isPaused || progress.status === 'paused') return <Pause className="h-5 w-5 text-yellow-500" />;
    if (isTranslating || progress.status === 'running') return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
    return <AlertCircle className="h-5 w-5 text-gray-400" />;
  };

  const getStatusText = () => {
    if (error) return 'Translation Failed';
    if (progress.status === 'completed') return 'Translation Completed';
    if (isPaused || progress.status === 'paused') return 'Translation Paused';
    if (isTranslating || progress.status === 'running') return 'Translating...';
    if (progress.status === 'cancelled') return 'Translation Cancelled';
    return 'Ready to Translate';
  };

  const getProgressPercentage = () => {
    if (!progress.total || progress.total === 0) return 0;
    return Math.round((progress.current / progress.total) * 100);
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const estimatedTimeRemaining = () => {
    if (!progress.current || !progress.total || !progress.startTime) return null;
    
    const elapsed = (Date.now() - progress.startTime) / 1000;
    const rate = progress.current / elapsed;
    const remaining = (progress.total - progress.current) / rate;
    
    return Math.round(remaining);
  };

  if (!isTranslating && progress.status !== 'completed' && !error && !isPaused && progress.status !== 'cancelled') {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {getStatusText()}
            </h3>
            {progress.current && progress.total && (
              <p className="text-sm text-gray-500">
                {progress.current} of {progress.total} items processed
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isTranslating && !isPaused && (
            <>
              <button
                onClick={onPause}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </button>
              <button
                onClick={onCancel}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Square className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </>
          )}

          {isPaused && (
            <>
              <button
                onClick={onResume}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Play className="h-4 w-4 mr-1" />
                Resume
              </button>
              <button
                onClick={onCancel}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Square className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </>
          )}

          {progress.status === 'completed' && (downloadUrl || onDownload) && (
            <button
              onClick={onDownload || (() => window.open(downloadUrl, '_blank'))}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {(isTranslating || isPaused || progress.status === 'completed') && progress.total > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress: {getProgressPercentage()}%</span>
            {progress.startTime && (
              <span>
                Elapsed: {formatTime(Math.round((Date.now() - progress.startTime) / 1000))}
                {estimatedTimeRemaining() && !progress.completed && (
                  <span className="ml-2">
                    • ETA: {formatTime(estimatedTimeRemaining())}
                  </span>
                )}
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                error 
                  ? 'bg-red-500' 
                  : progress.status === 'completed'
                  ? 'bg-green-500' 
                  : isPaused || progress.status === 'paused'
                  ? 'bg-yellow-500' 
                  : 'bg-primary-500'
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      )}

      {/* Current Status */}
      {progress.currentItem && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm font-medium text-gray-700">Currently processing:</p>
          <p className="text-sm text-gray-600 truncate">{progress.currentItem}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Translation Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {(progress.status === 'completed' || isTranslating) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-md">
            <p className="text-2xl font-bold text-gray-900">{progress.current || 0}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-md">
            <p className="text-2xl font-bold text-gray-900">{progress.total || 0}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-md">
            <p className="text-2xl font-bold text-gray-900">{progress.errors || 0}</p>
            <p className="text-sm text-gray-500">Errors</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-md">
            <p className="text-2xl font-bold text-gray-900">
              {progress.tokensUsed ? progress.tokensUsed.toLocaleString() : '0'}
            </p>
            <p className="text-sm text-gray-500">Tokens</p>
          </div>
        </div>
      )}

      {/* Logs */}
      {logs && logs.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Translation Log</h4>
          <div className="bg-gray-900 text-gray-100 p-3 rounded-md max-h-40 overflow-y-auto custom-scrollbar text-xs font-mono">
            {logs.slice(-50).map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className={`ml-2 ${
                  log.level === 'error' ? 'text-red-400' :
                  log.level === 'warning' ? 'text-yellow-400' :
                  log.level === 'success' ? 'text-green-400' :
                  'text-gray-100'
                }`}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {progress.status === 'completed' && !error && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-800">Translation Completed Successfully!</h4>
              <p className="text-sm text-green-700 mt-1">
                Your bilingual book has been generated and is ready for download.
                {progress.outputFileName && (
                  <span className="block mt-1 font-medium">
                    Output file: {progress.outputFileName}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;