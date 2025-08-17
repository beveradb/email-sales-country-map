import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Type declarations for diagnostic functions added to window
declare global {
  interface Window {
    updateLoadingStatus?: (message: string) => void;
    loadingErrors?: Array<{
      type: string;
      message?: string;
      stack?: string;
      timestamp: number;
    }>;
  }
}

// Enhanced error handling and loading feedback
try {
  // Update loading status
  if (window.updateLoadingStatus) {
    window.updateLoadingStatus('React modules loaded, initializing app...');
  }
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  // Create root and render app
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  // Success callback
  if (window.updateLoadingStatus) {
    window.updateLoadingStatus('Application rendered successfully');
  }
  
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  console.error('🚨 Failed to initialize React app:', error);
  
  if (window.updateLoadingStatus) {
    window.updateLoadingStatus('Failed to initialize: ' + errorMessage);
  }
  
  // Add error to global tracking
  if (window.loadingErrors) {
    window.loadingErrors.push({
      type: 'react_init_error',
      message: errorMessage,
      stack: errorStack,
      timestamp: Date.now()
    });
  }
  
  throw error; // Re-throw to trigger global error handlers
}
