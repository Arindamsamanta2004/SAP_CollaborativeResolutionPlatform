import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/sap-fiori-tokens.css'; // Import SAP Fiori design tokens
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import UI5 WebComponents
import '@ui5/webcomponents/dist/Assets.js';
import '@ui5/webcomponents-fiori/dist/Assets.js';
import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme.js';

// Set the default theme to SAP Horizon (latest SAP Fiori design language)
setTheme('sap_horizon');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();