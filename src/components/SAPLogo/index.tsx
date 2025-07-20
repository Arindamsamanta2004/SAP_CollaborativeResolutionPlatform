import React from 'react';
import './styles.css';

const SAPLogo: React.FC = () => {
  return (
    <div className="sap-logo-container">
      <svg 
        className="sap-logo" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 92 45"
        aria-label="SAP Logo"
      >
        <path 
          fill="currentColor" 
          d="M0 0v45h91.97V0H0zm76.58 30.86c-3.64 0-5.25-1.69-5.25-4.62V11.79h2.61v14.45c0 1.54.64 2.34 2.64 2.34h3.3v2.28h-3.3zm-12.96-8.37c0-3.39-1.69-5.02-5.64-5.02h-5.1v15.39h2.61V25.4h2.49c3.95 0 5.64-1.62 5.64-5.02v-2.11zm-2.61 2.11c0 1.85-.77 2.74-3.03 2.74h-2.49v-7.6h2.49c2.26 0 3.03.9 3.03 2.74v2.11zm-15.99 6.26h-7.8V11.79h7.8v2.28h-5.18v5.02h4.93v2.28h-4.93v7.08h5.18v2.28zm-12.06 0h-2.61V14.07h-4.16v-2.28h10.93v2.28h-4.16v16.79zm-11.12 0h-2.61V11.79h2.61v19.07zm-5.33 0h-2.61V14.07h-4.16v-2.28h10.93v2.28h-4.16v16.79z"
        />
      </svg>
    </div>
  );
};

export default SAPLogo;