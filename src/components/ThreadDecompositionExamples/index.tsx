import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  List,

  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Title,
  Label,

  Icon,
  Button,
  Dialog,
  Bar,

  TabContainer,
  Tab,
  TabSeparator
} from '@ui5/webcomponents-react';
import { demoScenarios } from '../../models/mockData/demoScenarios';
import { aiProcessingService } from '../../services/ai/aiProcessingService';
import LoadingState from '../LoadingState';
import Badge from '../Badge';
import '@ui5/webcomponents-icons/dist/workflow-tasks.js';
import '@ui5/webcomponents-icons/dist/split.js';
import '@ui5/webcomponents-icons/dist/detail-view.js';
import './styles.css';

interface ThreadDecompositionExamplesProps {
  onScenarioSelected?: (scenarioId: string) => void;
}

const ThreadDecompositionExamples: React.FC<ThreadDecompositionExamplesProps> = ({
  onScenarioSelected
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [activeTab, setActiveTab] = useState('scenarios');
  
  // Get available scenarios
  const scenarios = demoScenarios.getAvailableScenarios();
  
  // Handle scenario selection
  const handleScenarioSelect = async (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setLoading(true);
    setProgress(0);
    setStage('Loading scenario data...');
    
    try {
      // Simulate AI processing with progress updates
      await aiProcessingService.processTicket(
        { id: scenarioId } as any, // Just need the ID for demo
        (progress, stage) => {
          setProgress(progress);
          setStage(stage);
        }
      );
      
      // Notify parent component
      if (onScenarioSelected) {
        onScenarioSelected(scenarioId);
      }
      
      // Close dialog after processing completes
      setTimeout(() => {
        setDialogOpen(false);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error processing scenario:', error);
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
  
  // Render scenarios tab
  const renderScenariosTab = () => (
    <div className="scenarios-tab">
      <Label className="tab-description">
        Select a pre-defined scenario to see how complex tickets are decomposed into skill-based threads:
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
  );
  
  // Render decomposition examples tab
  const renderDecompositionTab = () => (
    <div className="decomposition-tab">
      <Label className="tab-description">
        Examples of how different types of issues are decomposed into threads:
      </Label>
      
      <div className="decomposition-examples">
        <Card className="decomposition-example">
          <CardHeader
            titleText="Security Breach"
            subtitleText="Critical complexity with multiple affected systems"
          />
          <div className="example-content">
            <div className="example-threads">
              <div className="thread-item">
                <Badge colorScheme="3">Security</Badge>
                <span>Security log analysis and threat identification</span>
              </div>
              <div className="thread-item">
                <Badge colorScheme="1">Network</Badge>
                <span>Network traffic analysis and firewall configuration</span>
              </div>
              <div className="thread-item">
                <Badge colorScheme="8">Backend</Badge>
                <span>User authentication system review</span>
              </div>
              <div className="thread-item">
                <Badge colorScheme="6">DevOps</Badge>
                <span>Implement emergency access controls</span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="decomposition-example">
          <CardHeader
            titleText="Performance Degradation"
            subtitleText="Medium complexity across multiple modules"
          />
          <div className="example-content">
            <div className="example-threads">
              <div className="thread-item">
                <Badge colorScheme="3">Database</Badge>
                <span>Database performance analysis</span>
              </div>
              <div className="thread-item">
                <Badge colorScheme="1">Backend</Badge>
                <span>Application code review</span>
              </div>
              <div className="thread-item">
                <Badge colorScheme="8">Analytics</Badge>
                <span>System resource utilization investigation</span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="decomposition-example">
          <CardHeader
            titleText="Integration Failure"
            subtitleText="Medium complexity with third-party systems"
          />
          <div className="example-content">
            <div className="example-threads">
              <div className="thread-item">
                <Badge colorScheme="3">Integration</Badge>
                <span>Integration middleware investigation</span>
              </div>
              <div className="thread-item">
                <Badge colorScheme="1">Backend</Badge>
                <span>Data format and mapping analysis</span>
              </div>
              <div className="thread-item">
                <Badge colorScheme="8">Network</Badge>
                <span>Network connectivity troubleshooting</span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="decomposition-example">
          <CardHeader
            titleText="Mobile App Crash"
            subtitleText="Low complexity with specific functionality"
          />
          <div className="example-content">
            <div className="example-threads">
              <div className="thread-item">
                <Badge colorScheme="3">Mobile</Badge>
                <span>Mobile application crash analysis</span>
              </div>
              <div className="thread-item">
                <Badge colorScheme="1">Backend</Badge>
                <span>API and data validation</span>
              </div>
              <div className="thread-item">
                <Badge colorScheme="8">Frontend</Badge>
                <span>UI component troubleshooting</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
  
  return (
    <div className="thread-decomposition-examples">
      <Button
        icon="split"
        onClick={() => setDialogOpen(true)}
        className="examples-button"
      >
        Thread Decomposition Examples
      </Button>
      
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        header={
          <Bar design="Header">
            <Title>Thread Decomposition Examples</Title>
          </Bar>
        }
        footer={
          <Bar design="Footer" endContent={
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          } />
        }
        className="examples-dialog"
      >
        <LoadingState 
          loading={loading} 
          text="Processing Scenario"
          progress={progress}
          progressText={stage}
        >
          <div className="examples-content">
            <TabContainer
              onTabSelect={(e) => setActiveTab(e.detail.tab.getAttribute('data-tab') || 'scenarios')}
              className="examples-tabs"
            >
              <Tab 
                text="Demo Scenarios" 
                selected={activeTab === 'scenarios'} 
                data-tab="scenarios"
              />
              <TabSeparator />
              <Tab 
                text="Decomposition Examples" 
                selected={activeTab === 'examples'} 
                data-tab="examples"
              />
            </TabContainer>
            
            <div className="tab-content">
              {activeTab === 'scenarios' ? renderScenariosTab() : renderDecompositionTab()}
            </div>
          </div>
        </LoadingState>
      </Dialog>
    </div>
  );
};

export default ThreadDecompositionExamples;