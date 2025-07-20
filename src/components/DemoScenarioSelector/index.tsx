import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Button,
  List,

  Title,
  Label,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  Bar,

} from '@ui5/webcomponents-react';
import { demoScenarios } from '../../models/mockData/demoScenarios';
import LoadingState from '../LoadingState';
import Badge from '../Badge';
import '@ui5/webcomponents-icons/dist/lab.js';
import '@ui5/webcomponents-icons/dist/simulate.js';
import './styles.css';

interface DemoScenarioSelectorProps {
  onScenarioSelected: (scenarioId: string) => void;
}

const DemoScenarioSelector: React.FC<DemoScenarioSelectorProps> = ({
  onScenarioSelected
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState<Array<{
    id: string;
    name: string;
    description: string;
    complexity: 'Low' | 'Medium' | 'High';
  }>>([]);
  
  // Load available scenarios
  useEffect(() => {
    setScenarios(demoScenarios.getAvailableScenarios());
  }, []);
  
  // Handle scenario selection
  const handleScenarioSelect = async (scenarioId: string) => {
    setLoading(true);
    
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Close dialog
      setDialogOpen(false);
      
      // Call onScenarioSelected callback
      onScenarioSelected(scenarioId);
    } catch (error) {
      console.error('Error loading scenario:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Get badge design based on complexity
  const getBadgeDesign = (complexity: 'Low' | 'Medium' | 'High') => {
    switch (complexity) {
      case 'Low':
        return '8';
      case 'Medium':
        return '1';
      case 'High':
        return '3';
      default:
        return '8';
    }
  };
  
  return (
    <>
      <Button
        icon="simulate"
        onClick={() => setDialogOpen(true)}
        className="demo-scenario-button"
      >
        Load Demo Scenario
      </Button>
      
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        className="demo-scenario-dialog"
        header={
          <Bar design="Header">
            <Title>Select Demo Scenario</Title>
          </Bar>
        }
        footer={
          <Bar design="Footer" endContent={
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          } />
        }
      >
        <LoadingState loading={loading} text="Loading scenario...">
          <div className="demo-scenario-content">
            <Label>
              Select a pre-defined scenario to demonstrate the SAP CRP platform capabilities:
            </Label>
            
            <List className="scenario-list">
              {scenarios.map(scenario => (
                <li
                  key={scenario.id}
                  onClick={() => handleScenarioSelect(scenario.id)}
                  className="ui5-list-item scenario-list-item"
                >
                  <FlexBox
                    direction={FlexBoxDirection.Row}
                    justifyContent={FlexBoxJustifyContent.SpaceBetween}
                    className="scenario-item-content"
                  >
                    <div>
                      <span className="ui5-list-item-title">{scenario.name}</span>
                      <span className="ui5-list-item-description">{scenario.description}</span>
                    </div>
                    <Badge colorScheme={getBadgeDesign(scenario.complexity)}>
                      {scenario.complexity} Complexity
                    </Badge>
                  </FlexBox>
                </li>
              ))}
            </List>
          </div>
        </LoadingState>
      </Dialog>
    </>
  );
};

export default DemoScenarioSelector;