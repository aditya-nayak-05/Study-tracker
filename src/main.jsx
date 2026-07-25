import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { StudyProvider } from './context/StudyContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <StudyProvider>
        <App />
      </StudyProvider>
    </HashRouter>
  </React.StrictMode>
);
