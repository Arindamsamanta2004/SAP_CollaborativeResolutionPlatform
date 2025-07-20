import React from 'react';
import { Bar, Text, FlexBox, FlexBoxDirection, FlexBoxJustifyContent } from '@ui5/webcomponents-react';
import { useAppState } from '../../contexts/AppStateContext';
import ConnectionStatus from '../ConnectionStatus';
import './styles.css';

const Footer: React.FC = () => {
  const { isConnected, appState } = useAppState();
  
  return (
    <footer className="app-footer">
      <Bar design="Footer" className="footer-bar">
        <FlexBox direction={FlexBoxDirection.Row} justifyContent={FlexBoxJustifyContent.SpaceBetween} style={{ width: '100%' }}>
          <FlexBox direction={FlexBoxDirection.Row} style={{ alignItems: 'center' }}>
            <img src="/assets/sap-logo.svg" alt="SAP Logo" />
            <Text>SAP CRP Demo - Collaborative Resolution Platform</Text>
          </FlexBox>
          <FlexBox direction={FlexBoxDirection.Row} style={{ alignItems: 'center', gap: '20px' }}>
            <ConnectionStatus />
            <Text>Last activity: {new Date(appState.lastActivity).toLocaleTimeString()}</Text>
            <Text>© {new Date().getFullYear()} SAP SE or an SAP affiliate company. All rights reserved.</Text>
          </FlexBox>
        </FlexBox>
      </Bar>
    </footer>
  );
};

export default Footer;