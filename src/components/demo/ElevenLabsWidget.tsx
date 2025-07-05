'use client';

import { useEffect, useRef } from 'react';

export default function ElevenLabsWidget() {
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Create script element
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    script.type = 'text/javascript';
    
    // Get agent ID from environment variables
    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || '';
    
    // Append script to document
    document.body.appendChild(script);
    
    // Create the widget element
    if (widgetContainerRef.current) {
      const widgetElement = document.createElement('elevenlabs-convai');
      widgetElement.setAttribute('agent-id', agentId);
      widgetContainerRef.current.appendChild(widgetElement);
    }
    
    // Cleanup function to remove script when component unmounts
    return () => {
      document.body.removeChild(script);
      if (widgetContainerRef.current && widgetContainerRef.current.firstChild) {
        widgetContainerRef.current.removeChild(widgetContainerRef.current.firstChild);
      }
    };
  }, []);
  
  return (
    <div className="my-8">
      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
        Probeer onze AI-assistent
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Stel vragen over onze voicemail service en krijg direct antwoord van onze AI-assistent.
      </p>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div ref={widgetContainerRef} className="elevenlabs-widget-container"></div>
      </div>
    </div>
  );
} 