import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import { App } from './App';

// Apply saved theme before first paint to prevent flash
const savedTheme = localStorage.getItem('haseen-theme');
const prefersDark = savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
if (prefersDark) document.body.classList.add('dark');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
