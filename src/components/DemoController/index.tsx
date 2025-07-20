import React, { useState } from 'react';
import {
  Button,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Title,
  Panel,
  Bar,
  Dialog,
  List
} from '@ui5/webcomponents-react';
import { demoScenarios } from '../../models/mockData/demoScenarios';
import { systemStatusService } from '../../services/system/systemStatusService';
import DemoScenarioSelector from '../DemoScenarioSelector';
import SystemStatusBanner from '../SystemStatusBanner';
import DemoWorkflowGuide from '../DemoWorkflowGuide';
import '@ui5/webcomponents-icons/dist/settings.js';
import '@ui5/webcomponents-icons/dist/simulate.js';
import '@ui5/webcomponents-icons/dist/reset.js';
import '@ui5/webcomponents-icons/dist/error.js';
import '@ui5/webcomponents-icons/dist/workflow-tasks.js';
import './styles.css';

interface DemoControllerProps {
  onScenarioLoaded?: (scenarioId: string) => void;
}

const DemoController: React.FC<DemoControllerProps> = ({ onScenarioLoaded }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [errorSimulationOpen, setErrorSimulationOpen] = useState(false);
  const [workflowGuideOpen, setWorkflowGuideOpen] = useState(false);
  
  // Handle scenario selection
  const handleScenarioSelected = (scenarioId: string) => {
    // Load the selected scenario
    const scenarioData = demoScenarios.loadScenario(scenarioId);
    
    if (scenarioData && onScenarioLoaded) {
      onScenarioLoaded(scenarioId);
    }
  };
  
  // Simulate system degradation
  const simulateDegradation = (featureId: string, duration: number = 30000) => {
    systemStatusService.simulateDegradation(featureId, duration);
    setErrorSimulationOpen(false);
  };
  
  // Reset system status
  const resetSystemStatus = () => {
    systemStatusService.updateStatus({
      networkConnected: true,
      serverAvailable: true,
      features: {
        ticketSubmission: true,
        ticketClassification: true,
        threadDecomposition: true,
        engineerAssignment: true,
        fileUpload: true,
        realTimeUpdates: true
      }
    });
    setSettingsOpen(false);
  };
  
  return (
    <div className="demo-controller">
      <SystemStatusBanner onRetry={resetSystemStatus} />
      
      <FlexBox
        direction={FlexBoxDirection.Row}
        justifyContent={FlexBoxJustifyContent.End}
        alignItems={FlexBoxAlignItems.Center}
        className="demo-controls"
      >
        <DemoScenarioSelector onScenarioSelected={handleScenarioSelected} />
        
        <Button
          icon="workflow-tasks"
          design="Transparent"
          onClick={() => setWorkflowGuideOpen(true)}
          tooltip="Demo Workflow Guide"
        />
        
        <Button
          icon="error"
          design="Transparent"
          onClick={() => setErrorSimulationOpen(true)}
          tooltip="Simulate Errors"
        />
        
        <Button
          icon="settings"
          design="Transparent"
          onClick={() => setSettingsOpen(true)}
          tooltip="Demo Settings"
        />
      </FlexBox>
      
      {/* Error Simulation Dialog */}
      <Dialog
        open={errorSimulationOpen}
        onClose={() => setErrorSimulationOpen(false)}
        header={
          <Bar>
            <Title>Simulate System Errors</Title>
          </Bar>
        }
        footer={
          <Bar endContent={
            <Button onClick={() => setErrorSimulationOpen(false)}>Close</Button>
          } />
        }
        className="error-simulation-dialog"
      >
        <div className="error-simulation-content">
          <Title level="H4">Select a feature to simulate degradation:</Title>
          <List className="error-simulation-list">
            <li 
              className="ui5-list-item"
              onClick={() => simulateDegradation('ticketSubmission')}
            >
              <span className="ui5-list-item-title">Ticket Submission</span>
              <span className="ui5-list-item-description">Simulate ticket submission feature being unavailable</span>
            </li>
            
            <li 
              className="ui5-list-item"
              onClick={() => simulateDegradation('ticketClassification')}
            >
              <span className="ui5-list-item-title">AI Classification</span>
              <span className="ui5-list-item-description">Simulate AI classification feature being unavailable</span>
            </li>
            
            <li 
              className="ui5-list-item"
              onClick={() => simulateDegradation('threadDecomposition')}
            >
              <span className="ui5-list-item-title">Thread Decomposition</span>
              <span className="ui5-list-item-description">Simulate thread decomposition feature being unavailable</span>
            </li>
            
            <li 
              className="ui5-list-item"
              onClick={() => simulateDegradation('engineerAssignment')}
            >
              <span className="ui5-list-item-title">Engineer Assignment</span>
              <span className="ui5-list-item-description">Simulate engineer assignment feature being unavailable</span>
            </li>
            
            <li 
              className="ui5-list-item"
              onClick={() => simulateDegradation('fileUpload')}
            >
              <span className="ui5-list-item-title">File Upload</span>
              <span className="ui5-list-item-description">Simulate file upload feature being unavailable</span>
            </li>
            
            <li 
              className="ui5-list-item"
              onClick={() => simulateDegradation('realTimeUpdates')}
            >
              <span className="ui5-list-item-title">Real-time Updates</span>
              <span className="ui5-list-item-description">Simulate real-time updates being unavailable</span>
            </li>
            
            <li 
              className="ui5-list-item"
              onClick={() => {
                systemStatusService.updateStatus({ networkConnected: false });
                setErrorSimulationOpen(false);
              }}
            >
              <span className="ui5-list-item-title">Network Connectivity</span>
              <span className="ui5-list-item-description">Simulate network connectivity issues</span>
            </li>
            
            <li 
              className="ui5-list-item"
              onClick={() => {
                systemStatusService.updateStatus({ serverAvailable: false });
                setErrorSimulationOpen(false);
              }}
            >
              <span className="ui5-list-item-title">Server Availability</span>
              <span className="ui5-list-item-description">Simulate server availability issues</span>
            </li>
          </List>
        </div>
      </Dialog>
      
      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        header={
          <Bar>
            <Title>Demo Settings</Title>
          </Bar>
        }
        footer={
          <Bar endContent={
            <Button onClick={() => setSettingsOpen(false)}>Close</Button>
          } />
        }
        className="settings-dialog"
      >
        <div className="settings-content">
          <Panel
            headerText="System Status"
            className="settings-panel"
          >
            <Button
              icon="reset"
              design="Emphasized"
              onClick={resetSystemStatus}
              className="reset-button"
            >
              Reset System Status
            </Button>
            <p className="settings-description">
              Resets all simulated errors and system degradations to normal operation.
            </p>
          </Panel>
          
          <Panel
            headerText="Demo Information"
            className="settings-panel"
          >
            <p className="settings-info">
              This demo application showcases the SAP CRP (Collaborative Resolution Platform) 
              with pre-defined scenarios and error handling capabilities.
            </p>
            <p className="settings-info">
              Use the controls above to load different ticket scenarios or simulate 
              system errors to demonstrate graceful degradation and error handling.
            </p>
          </Panel>
        </div>
      </Dialog>
      
      {/* Demo Workflow Guide Dialog */}
      <DemoWorkflowGuide 
        open={workflowGuideOpen}
        onClose={() => setWorkflowGuideOpen(false)}
      />
    </div>
  );
};

export default DemoController;