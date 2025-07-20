import React from 'react';
import { Bar, Label } from '@ui5/webcomponents-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Bar design="Footer" style={{ padding: '0 1rem' }}>
      <Label>© {currentYear} SAP CRP Demo Application</Label>
    </Bar>
  );
};

export default Footer;