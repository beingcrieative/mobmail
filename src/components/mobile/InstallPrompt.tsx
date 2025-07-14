/**
 * Secure Install Prompt Component for VoicemailAI Mobile PWA
 * Provides context-aware install prompts with platform-specific instructions
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstallPrompt } from '@/lib/hooks/useInstallPrompt';

interface InstallPromptProps {
  variant?: 'banner' | 'modal' | 'inline';
  showMetrics?: boolean;
  autoShow?: boolean;
  onInstallAttempt?: (success: boolean) => void;
  onDismiss?: () => void;
}

export function InstallPrompt({ 
  variant = 'banner',
  showMetrics = false,
  autoShow = true,
  onInstallAttempt,
  onDismiss
}: InstallPromptProps) {
  const {
    isInstallReady,
    isAppMode,
    shouldShowInstallButton,
    shouldShowInstallHint,
    platform,
    isLoading,
    error,
    showInstallPrompt,
    getInstallInstructions,
    getInstallStatusMessage,
    getInstallButtonText,
    getInstallProgress,
    getFormattedMetrics,
    clearError
  } = useInstallPrompt();

  const [isVisible, setIsVisible] = useState(autoShow);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Don't show if app is already installed or loading
  if (isLoading || isAppMode || (!shouldShowInstallButton && !shouldShowInstallHint)) {
    return null;
  }

  // Don't show if explicitly hidden
  if (!isVisible) {
    return null;
  }

  const instructions = getInstallInstructions();

  const handleInstallClick = async () => {
    if (isInstallReady) {
      setIsInstalling(true);
      clearError();
      
      try {
        const success = await showInstallPrompt();
        onInstallAttempt?.(success);
        
        if (success) {
          setIsVisible(false);
        }
      } catch (error) {
        console.error('Install prompt failed:', error);
        onInstallAttempt?.(false);
      } finally {
        setIsInstalling(false);
      }
    } else {
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const renderBanner = () => (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-16 left-4 right-4 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg"
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 pr-4">
            <h4 className="font-semibold text-sm">Installeer VoicemailAI</h4>
            <p className="text-xs opacity-90 mt-1">
              Snelle toegang vanaf uw startscherm
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="px-3 py-1.5 bg-white text-blue-600 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isInstalling ? 'Bezig...' : getInstallButtonText()}
            </button>
            
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-black/10 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-3 bg-black/10 rounded-full h-1">
          <div 
            className="bg-white rounded-full h-1 transition-all duration-300"
            style={{ width: `${getInstallProgress()}%` }}
          />
        </div>
      </div>
    </motion.div>
  );

  const renderModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4"
      onClick={handleDismiss}
    >
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-2xl w-full max-w-md mx-auto overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Installeer VoicemailAI
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {getInstallStatusMessage()}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Benefits */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Voordelen van installeren:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Snelle toegang vanaf startscherm
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Offline functionaliteit
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Native app-ervaring
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Push notificaties
              </li>
            </ul>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Install button or instructions */}
          {!showInstructions ? (
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInstalling ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Installeren...
                </div>
              ) : (
                getInstallButtonText()
              )}
            </button>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">
                Installatie-instructies voor {instructions.platform}:
              </h4>
              <ol className="space-y-2 text-sm text-gray-600">
                {instructions.instructions.map((instruction, index) => (
                  <li key={index} className="flex">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    {instruction}
                  </li>
                ))}
              </ol>
              <button
                onClick={() => setShowInstructions(false)}
                className="w-full bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
              >
                Terug
              </button>
            </div>
          )}
        </div>

        {/* Metrics (if enabled) */}
        {showMetrics && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer font-medium">Installatie statistieken</summary>
              <div className="mt-2 space-y-1">
                {Object.entries(getFormattedMetrics()).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  const renderInline = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900">Installeer als app</h4>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            Krijg de beste ervaring met snelle toegang en offline functionaliteit.
          </p>
          
          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isInstalling ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Installeren...
              </>
            ) : (
              getInstallButtonText()
            )}
          </button>
        </div>
        
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-gray-200 rounded transition-colors ml-4"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {variant === 'banner' && renderBanner()}
          {variant === 'modal' && renderModal()}
          {variant === 'inline' && renderInline()}
        </>
      )}
    </AnimatePresence>
  );
}