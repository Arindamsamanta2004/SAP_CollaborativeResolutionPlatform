import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  Bar,
  Title,
  Button,
  List,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  MessageStrip,
  Icon
} from '@ui5/webcomponents-react';
import { demoScenarios } from '../../models/mockData/demoScenarios';
import { navigationService, WorkflowStage } from '../../services/navigation/navigationService';

import './styles.css';
import '@ui5/webcomponents-icons/dist/navigation-right-arrow.js';
import '@ui5/webcomponents-icons/dist/navigation-down-arrow.js';
import '@ui5/webcomponents-icons/dist/checklist.js';
import '@ui5/webcomponents-icons/dist/complete.js';
import '@ui5/webcomponents-icons/dist/workflow-tasks.js';

interface DemoWorkflowGuideProps {
  open: boolean;
  onClose: () => void;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  stage: WorkflowStage;
  path: string;
  completed: boolean;
  active: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    design?: string;
  }>;
}

const DemoWorkflowGuide: React.FC<DemoWorkflowGuideProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showScenarioSelector, setShowScenarioSelector] = useState(true);
  const [testResults, setTestResults] = useState<{
    passed: string[];
    failed: string[];
  }>({
    passed: [],
    failed: []
  });

  // Initialize workflow steps based on selected scenario
  useEffect(() => {
    if (selectedScenario) {
      const workflowState = navigationService.getWorkflowState();
      const currentStage = workflowState?.currentStage || 'submission';
      
      const steps: WorkflowStep[] = [
        {
          id: 'customer-submission',
          title: 'Customer Ticket Submission',
          description: 'Submit a new support ticket through the Customer Portal',
          stage: 'submission',
          path: '/customer-portal',
          completed: currentStage !== 'submission',
          active: currentStage === 'submission',
          actions: [
            {
              label: 'Go to Customer Portal',
              action: () => navigate('/customer-portal'),
              design: 'Emphasized'
            }
          ]
        },
        {
          id: 'lead-classification',
          title: 'Lead Engineer Classification',
          description: 'Review AI-classified ticket and trigger CRP for complex issues',
          stage: 'classification',
          path: '/lead-dashboard',
          completed: currentStage === 'resolution' || currentStage === 'completion',
          active: currentStage === 'classification',
          actions: [
            {
              label: 'Go to Lead Dashboard',
              action: () => navigate('/lead-dashboard'),
              design: 'Emphasized'
            }
          ]
        },
        {
          id: 'crp-resolution',
          title: 'Collaborative Resolution',
          description: 'Work on decomposed issue threads in the Collaborative Resolution Platform',
          stage: 'resolution',
          path: workflowState?.ticketId ? `/crp/${workflowState.ticketId}` : '/crp',
          completed: currentStage === 'completion',
          active: currentStage === 'resolution',
          actions: [
            {
              label: 'Go to CRP',
              action: () => {
                if (workflowState?.ticketId) {
                  navigate(`/crp/${workflowState.ticketId}`);
                } else {
                  navigate('/lead-dashboard');
                }
              },
              design: 'Emphasized'
            }
          ]
        },
        {
          id: 'verification',
          title: 'Verification & Testing',
          description: 'Verify the end-to-end workflow and test all components',
          stage: 'completion',
          path: '/lead-dashboard',
          completed: false,
          active: currentStage === 'completion',
          actions: [
            {
              label: 'Run Tests',
              action: runWorkflowTests,
              design: 'Emphasized'
            }
          ]
        }
      ];
      
      setWorkflowSteps(steps);
      
      // Set current step based on workflow state
      const currentIndex = steps.findIndex(step => step.stage === currentStage);
      if (currentIndex >= 0) {
        setCurrentStepIndex(currentIndex);
      }
      
      setShowScenarioSelector(false);
    }
  }, [selectedScenario, navigate]);

  // Handle scenario selection
  const handleScenarioSelected = (scenarioId: string) => {
    // Load the selected scenario
    const scenarioData = demoScenarios.loadScenario(scenarioId);
    
    if (scenarioData) {
      setSelectedScenario(scenarioId);
      
      // Reset workflow state
      navigationService.clearWorkflowState();
      navigationService.updateWorkflowStage('submission', scenarioData.ticket);
    }
  };

  // Run workflow tests
  function runWorkflowTests() {
    const workflowState = navigationService.getWorkflowState();
    const passed: string[] = [];
    const failed: string[] = [];
    
    // Test 1: Check if workflow state exists
    if (workflowState) {
      passed.push('Workflow state exists');
    } else {
      failed.push('Workflow state is missing');
    }
    
    // Test 2: Check if ticket ID exists in workflow state
    if (workflowState?.ticketId) {
      passed.push('Ticket ID is present in workflow state');
    } else {
      failed.push('Ticket ID is missing from workflow state');
    }
    
    // Test 3: Check if all workflow stages were visited
    const history = navigationService.getNavigationHistory();
    const visitedPaths = history.map(item => item.path);
    
    if (visitedPaths.some(path => path.includes('/customer-portal'))) {
      passed.push('Customer Portal was visited');
    } else {
      failed.push('Customer Portal was not visited');
    }
    
    if (visitedPaths.some(path => path.includes('/lead-dashboard'))) {
      passed.push('Lead Engineer Dashboard was visited');
    } else {
      failed.push('Lead Engineer Dashboard was not visited');
    }
    
    if (visitedPaths.some(path => path.includes('/crp/'))) {
      passed.push('CRP was visited');
    } else {
      failed.push('CRP was not visited');
    }
    
    // Test 4: Check if scenario was loaded
    if (selectedScenario) {
      passed.push(`Demo scenario "${selectedScenario}" was loaded`);
    } else {
      failed.push('No demo scenario was loaded');
    }
    
    setTestResults({ passed, failed });
  }

  // Navigate to next step
  const goToNextStep = () => {
    if (currentStepIndex < workflowSteps.length - 1) {
      const nextStep = workflowSteps[currentStepIndex + 1];
      navigate(nextStep.path);
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      const prevStep = workflowSteps[currentStepIndex - 1];
      navigate(prevStep.path);
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Reset workflow
  const resetWorkflow = () => {
    navigationService.clearWorkflowState();
    setSelectedScenario(null);
    setShowScenarioSelector(true);
    setTestResults({ passed: [], failed: [] });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      header={
        <Bar>
          <Title>Demo Workflow Guide</Title>
        </Bar>
      }
      footer={
        <Bar>
          <FlexBox
            direction={FlexBoxDirection.Row}
            justifyContent={FlexBoxJustifyContent.SpaceBetween}
            alignItems={FlexBoxAlignItems.Center}
            style={{ width: '100%' }}
          >
            <Button 
              onClick={resetWorkflow}
              design="Transparent"
            >
              Reset Workflow
            </Button>
            <div>
              {!showScenarioSelector && (
                <>
                  <Button
                    onClick={goToPreviousStep}
                    design="Transparent"
                    disabled={currentStepIndex === 0}
                    style={{ marginRight: '8px' }}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={goToNextStep}
                    design="Emphasized"
                    disabled={currentStepIndex === workflowSteps.length - 1}
                  >
                    Next
                  </Button>
                </>
              )}
              <Button
                onClick={onClose}
                design="Transparent"
                style={{ marginLeft: '8px' }}
              >
                Close
              </Button>
            </div>
          </FlexBox>
        </Bar>
      }
      className="demo-workflow-guide-dialog"
    >
      <div className="demo-workflow-guide-content">
        {showScenarioSelector ? (
          <div className="scenario-selector-container">
            <Title level="H4">Select a Demo Scenario</Title>
            <p className="scenario-description">
              Choose a pre-defined scenario to start the end-to-end demo workflow:
            </p>
            <List className="scenario-list">
              {demoScenarios.getAvailableScenarios().map(scenario => (
                <li 
                  key={scenario.id}
                  className="ui5-list-item"
                  onClick={() => handleScenarioSelected(scenario.id)}
                >
                  <span className="ui5-list-item-title">{scenario.name}</span>
                  <span className="ui5-list-item-description">{scenario.description}</span>
                  <span className={`ui5-list-item-info ${scenario.complexity.toLowerCase()}-complexity`}>
                    Complexity: {scenario.complexity}
                  </span>
                </li>
              ))}
            </List>
          </div>
        ) : (
          <div className="workflow-steps-container">
            <Title level="H4">Demo Workflow Steps</Title>
            <p className="workflow-description">
              Follow these steps to demonstrate the end-to-end SAP CRP workflow:
            </p>
            
            <div className="workflow-steps">
              {workflowSteps.map((step, index) => (
                <div 
                  key={step.id} 
                  className={`workflow-step ${step.active ? 'active' : ''} ${step.completed ? 'completed' : ''}`}
                >
                  <div className="step-header">
                    <div className="step-indicator">
                      {step.completed ? (
                        <Icon name="complete" />
                      ) : (
                        <span className="step-number">{index + 1}</span>
                      )}
                    </div>
                    <div className="step-title">
                      <h3>{step.title}</h3>
                      {step.active && <span className="active-indicator">Current</span>}
                    </div>
                  </div>
                  
                  <div className="step-content">
                    <p>{step.description}</p>
                    
                    {step.active && step.actions && (
                      <div className="step-actions">
                        {step.actions.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            onClick={action.action}
                            design={action.design as any}
                            style={{ marginRight: '8px' }}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    {step.id === 'verification' && testResults.passed.length > 0 && (
                      <div className="test-results">
                        <MessageStrip
                          design={testResults.failed.length === 0 ? "Positive" : "Information"}
                          hideCloseButton
                        >
                          {testResults.passed.length} tests passed
                        </MessageStrip>
                        
                        <List className="test-result-list">
                          {testResults.passed.map((test, testIndex) => (
                            <li key={`pass-${testIndex}`} className="ui5-list-item">
                              <Icon name="complete" />
                              <span>{test}</span>
                            </li>
                          ))}
                        </List>
                        
                        {testResults.failed.length > 0 && (
                          <>
                            <MessageStrip
                              design="Negative"
                              hideCloseButton
                            >
                              {testResults.failed.length} tests failed
                            </MessageStrip>
                            
                            <List className="test-result-list">
                              {testResults.failed.map((test, testIndex) => (
                                <li key={`fail-${testIndex}`} className="ui5-list-item">
                                  <Icon name="error" />
                                  <span>{test}</span>
                                </li>
                              ))}
                            </List>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default DemoWorkflowGuide;