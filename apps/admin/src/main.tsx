import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// @ts-ignore TypeScript does not have declarations for CSS side-effect imports.
import './index.css'; // <-- Required for Tailwind to load

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);