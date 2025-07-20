import React, { useState } from 'react';
import {
  Button,
  Dialog,
  Title,
  Text,
  Card,
  CardHeader,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Icon
} from '@ui5/webcomponents-react';
import Badge from '../Badge';
import { UrgencyLevel, AffectedSystem } from '../../models/types';
import './styles.css';

interface DemoScenario {
  id: string;
  name: string;
  subject: string;
  description: string;
  urgency: UrgencyLevel;
  affectedSystem: AffectedSystem;
  complexity: 'Low' | 'Medium' | 'High';
  skillTags: string[];
  expectedCRPLaunch: boolean;
}

interface DemoScenarioLoaderProps {
  onScenarioLoad: (scenario: DemoScenario) => void;
}

const demoScenarios: DemoScenario[] = [
  {
    id: 'email-db-failure',
    name: 'Email System with Database Issues',
    subject: 'Email system failure with database connection errors',
    description: 'Our SAP S/4HANA email notification system has stopped working. Users report that they are not receiving any email notifications for purchase orders, invoices, or workflow approvals. The system logs show database connection timeouts and SMTP server configuration errors. This is affecting our entire procurement process and multiple departments are unable to complete their daily operations.',
    urgency: 'Critical',
    affectedSystem: 'SAP S/4HANA',
    complexity: 'High',
    skillTags: ['Database', 'Email', 'Backend', 'Network'],
    expectedCRPLaunch: true
  },
  {
    id: 'performance-slowdown',
    name: 'System Performance Degradation',
    subject: 'Severe performance degradation across multiple SAP modules',
    description: 'We are experiencing significant performance issues across SAP ERP modules including FI, CO, and MM. Report generation is taking 10x longer than usual, and users are experiencing frequent timeouts. The issue started after the recent system update and is affecting productivity across all departments. Database queries are running slowly and the application server seems to be under heavy load.',
    urgency: 'High',
    affectedSystem: 'SAP ERP',
    complexity: 'High',
    skillTags: ['Performance', 'Database', 'Backend', 'Infrastructure'],
    expectedCRPLaunch: true
  },
  {
    id: 'user-access-issue',
    name: 'User Access and Authentication',
    subject: 'Multiple users unable to access SuccessFactors portal',
    description: 'Several employees from the HR department are unable to log into the SuccessFactors portal. They receive authentication errors and password reset attempts are not working. This is preventing them from accessing employee records and completing performance reviews that are due this week.',
    urgency: 'Medium',
    affectedSystem: 'SAP SuccessFactors',
    complexity: 'Medium',
    skillTags: ['Authentication', 'Frontend'],
    expectedCRPLaunch: false
  },
  {
    id: 'integration-failure',
    name: 'Third-party Integration Failure',
    subject: 'Integration between SAP Ariba and external vendor portal failing',
    description: 'The integration between our SAP Ariba procurement system and our main vendor portal has stopped working. Purchase orders are not being transmitted to vendors, and vendor responses are not being received in Ariba. This is causing delays in our procurement process and vendors are calling to inquire about missing orders. The API endpoints seem to be returning authentication errors.',
    urgency: 'High',
    affectedSystem: 'SAP Ariba',
    complexity: 'High',
    skillTags: ['Integration', 'API', 'Backend', 'Security'],
    expectedCRPLaunch: true
  },
  {
    id: 'simple-report-issue',
    name: 'Simple Report Generation Issue',
    subject: 'Monthly financial report not generating correctly',
    description: 'The monthly financial summary report in SAP ERP is showing incorrect totals for the current month. The data appears to be missing some transactions from the last week. This is a recurring report that usually works fine, but this month the numbers don\'t match our manual calculations.',
    urgency: 'Low',
    affectedSystem: 'SAP ERP',
    complexity: 'Low',
    skillTags: ['Reporting'],
    expectedCRPLaunch: false
  }
];

const DemoScenarioLoader: React.FC<DemoScenarioLoaderProps> = ({ onScenarioLoad }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleScenarioSelect = (scenario: DemoScenario) => {
    onScenarioLoad(scenario);
    setIsOpen(false);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'High': return '5';
      case 'Medium': return '4';
      case 'Low': return '3';
      default: return '1';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return '5';
      case 'High': return '4';
      case 'Medium': return '3';
      case 'Low': return '2';
      default: return '1';
    }
  };

  return (
    <>
      <Button
        design="Emphasized"
        icon="simulate"
        onClick={() => setIsOpen(true)}
        className="demo-scenario-trigger"
      >
        Load Demo Scenario
      </Button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="demo-scenario-dialog"
        headerText="🎭 Demo Scenario Loader"
      >
        <div className="demo-scenario-content">
          <div className="demo-scenario-header">
            <Title level="H3">Choose a Demo Scenario</Title>
            <Text className="demo-scenario-subtitle">
              Select a pre-configured scenario to demonstrate the CRP workflow
            </Text>
          </div>

          <div className="demo-scenarios-list">
            {demoScenarios.map((scenario) => (
              <Card
                key={scenario.id}
                className="demo-scenario-card"
                onClick={() => handleScenarioSelect(scenario)}
              >
                <CardHeader
                  titleText={scenario.name}
                  subtitleText={scenario.subject}
                />
                
                <div className="demo-scenario-details">
                  <FlexBox direction={FlexBoxDirection.Row} className="scenario-metadata">
                    <Badge colorScheme={getUrgencyColor(scenario.urgency)}>
                      {scenario.urgency}
                    </Badge>
                    <Badge colorScheme={getComplexityColor(scenario.complexity)}>
                      {scenario.complexity} Complexity
                    </Badge>
                    <Badge colorScheme="1">
                      {scenario.affectedSystem}
                    </Badge>
                  </FlexBox>

                  <div className="scenario-skills">
                    <Text className="skills-label">Required Skills:</Text>
                    <div className="skills-tags">
                      {scenario.skillTags.map((skill, index) => (
                        <Badge key={skill} colorScheme={`${(index % 10) + 1}`}>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="scenario-prediction">
                    <FlexBox direction={FlexBoxDirection.Row} alignItems={FlexBoxAlignItems.Center}>
                      <Icon 
                        name={scenario.expectedCRPLaunch ? "collaborate" : "inbox"} 
                        className={`prediction-icon ${scenario.expectedCRPLaunch ? 'crp-launch' : 'standard-queue'}`}
                      />
                      <Text className="prediction-text">
                        Expected: {scenario.expectedCRPLaunch ? 'CRP Auto-Launch' : 'Standard Queue'}
                      </Text>
                    </FlexBox>
                  </div>

                  <Text className="scenario-description">
                    {scenario.description.substring(0, 120)}...
                  </Text>
                </div>
              </Card>
            ))}
          </div>

          <FlexBox 
            direction={FlexBoxDirection.Row} 
            justifyContent={FlexBoxJustifyContent.End}
            className="demo-scenario-actions"
          >
            <Button design="Default" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </FlexBox>
        </div>
      </Dialog>
    </>
  );
};

export default DemoScenarioLoader;