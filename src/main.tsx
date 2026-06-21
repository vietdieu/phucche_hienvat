import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { Buffer } from 'buffer';

// Polyfill Buffer in browser environment
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import { BookmarksProvider } from './context/BookmarksContext.tsx';
import { ThemePreferencesProvider } from './context/ThemePreferencesContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import './index.css';

// Silence benign sandbox/iframe WebSocket connection and Vite HMR errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason?.message || String(reason || '');
    if (
      message.includes('WebSocket') || 
      message.includes('websocket') || 
      message.includes('closed without opened') ||
      message.includes('vite')
    ) {
      event.preventDefault();
      console.debug('Silenced benign WebSocket preview connection closure:', message);
    }
  });

  window.addEventListener('error', (event) => {
    const message = event.message || '';
    if (
      message.includes('WebSocket') || 
      message.includes('websocket') || 
      message.includes('closed without opened') ||
      message.includes('vite')
    ) {
      event.preventDefault();
      console.debug('Silenced benign WebSocket preview connection error:', message);
    }
  });
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "dummy-client-id";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemePreferencesProvider>
        <ThemeProvider>
          <BookmarksProvider>
            <App />
          </BookmarksProvider>
        </ThemeProvider>
      </ThemePreferencesProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);

