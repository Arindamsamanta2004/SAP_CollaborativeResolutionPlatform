import React, { useState } from 'react';
import {
  Panel,
  Title,
  Text,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Button,
  MessageStrip,
  List,
  Icon
} from '@ui5/webcomponents-react';
import './styles.css';
import '@ui5/webcomponents-icons/dist/document-text.js';
import '@ui5/webcomponents-icons/dist/checklist.js';
import '@ui5/webcomponents-icons/dist/workflow-tasks.js';

interface DemoDocumentationProps {
  showTitle?: boolean;
}

const DemoDocumentation: React.FC<DemoDocumentationProps> = ({ showTitle = true }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'overview': true,
    'steps': false,
    'scenarios': false
  });
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  return (
    <div className="demo-documentation">
      {showTitle && (
        <FlexBox
          direction={FlexBoxDirection.Row}
          justifyContent={FlexBoxJustifyContent.SpaceBetween}
          alignItems={FlexBoxAlignItems.Center}
          className="doc-header"
        >
          <Title level="H2">
            <Icon name="document-text" className="doc-icon" /> Demo Workflow Documentation
          </Title>
        </FlexBox>
      )}
      
      <MessageStrip
        design="Information"
        hideCloseButton
        className="doc-info-strip"
      >
        This documentation outlines the comprehensive end-to-end demo workflow for the SAP Collaborative Resolution Platform (CRP).
      </MessageStrip>
      
      <Panel
        headerText="Demo Workflow Overview"
        collapsed={!expandedSections['overview']}
        onToggle={() => toggleSection('overview')}
        className="doc-panel"
      >
        <Text className="doc-text">
          The demo workflow consists of four main stages:
        </Text>
        
        <List className="doc-list">
          <li className="ui5-list-item">
            <Icon name="workflow-tasks" />
            <span><strong>Customer Ticket Submission</strong> - Submit a new support ticket through the Customer Portal</span>
          </li>
          <li className="ui5-list-item">
            <Icon name="workflow-tasks" />
            <span><strong>Lead Engineer Classification</strong> - Review AI-classified ticket and trigger CRP for complex issues</span>
          </li>
          <li className="ui5-list-item">
            <Icon name="workflow-tasks" />
            <span><strong>Collaborative Resolution</strong> - Work on decomposed issue threads in the CRP</span>
          </li>
          <li className="ui5-list-item">
            <Icon name="workflow-tasks" />
            <span><strong>Verification & Testing</strong> - Verify the end-to-end workflow and test all components</span>
          </li>
        </List>
      </Panel>
      
      <Panel
        headerText="Detailed Workflow Steps"
        collapsed={!expandedSections['steps']}
        onToggle={() => toggleSection('steps')}
        className="doc-panel"
      >
        <Title level="H3" className="doc-subsection-title">Stage 1: Customer Ticket Submission</Title>
        <List className="doc-list">
          <li className="ui5-list-item">Navigate to the Customer Portal (/customer-portal)</li>
          <li className="ui5-list-item">Fill out the ticket submission form with subject, description, urgency, and affected system</li>
          <li className="ui5-list-item">Upload any relevant attachments (optional)</li>
          <li className="ui5-list-item">Submit the ticket</li>
          <li className="ui5-list-item">Observe the confirmation message with the generated ticket ID</li>
        </List>
        
        <Title level="H3" className="doc-subsection-title">Stage 2: Lead Engineer Classification</Title>
        <List className="doc-list">
          <li className="ui5-list-item">Navigate to the Lead Engineer Dashboard (/lead-dashboard)</li>
          <li className="ui5-list-item">Review the incoming ticket with AI-generated metadata</li>
          <li className="ui5-list-item">Select the ticket to view lead engineer assignment based on the 70% skill dominance rule</li>
          <li className="ui5-list-item">Click "Trigger CRP" for complex tickets or "Route to Standard" for simpler issues</li>
          <li className="ui5-list-item">Observe the AI processing animation and status updates</li>
        </List>
        
        <Title level="H3" className="doc-subsection-title">Stage 3: Collaborative Resolution</Title>
        <List className="doc-list">
          <li className="ui5-list-item">Navigate to the CRP for the specific ticket (/crp/{'{ticketId}'})</li>
          <li className="ui5-list-item">Review the parent ticket header with original details</li>
          <li className="ui5-list-item">Examine the AI-generated issue threads</li>
          <li className="ui5-list-item">Observe engineer availability in the sidebar</li>
          <li className="ui5-list-item">Click "Pull Thread" on various threads to simulate engineer assignment</li>
          <li className="ui5-list-item">Update thread statuses from "Open" to "In Progress" to "Resolved"</li>
          <li className="ui5-list-item">Use the merge solution functionality when all threads are resolved</li>
          <li className="ui5-list-item">Complete the parent ticket resolution</li>
        </List>
        
        <Title level="H3" className="doc-subsection-title">Stage 4: Verification & Testing</Title>
        <List className="doc-list">
          <li className="ui5-list-item">Navigate to the "Demo Workflow Testing" tab in the Lead Engineer Dashboard</li>
          <li className="ui5-list-item">Run the comprehensive tests to verify all aspects of the workflow</li>
          <li className="ui5-list-item">Review test results and address any failures</li>
          <li className="ui5-list-item">Verify that all requirements have been demonstrated</li>
        </List>
      </Panel>
      
      <Panel
        headerText="Demo Scenarios"
        collapsed={!expandedSections['scenarios']}
        onToggle={() => toggleSection('scenarios')}
        className="doc-panel"
      >
        <Text className="doc-text">
          The demo includes multiple pre-defined scenarios with varying complexity levels:
        </Text>
        
        <div className="scenario-cards">
          <div className="scenario-card high-complexity">
            <div className="scenario-header">
              <Title level="H3">Data Migration Failure</Title>
              <span className="complexity-badge">High Complexity</span>
            </div>
            <Text>Critical data migration failure with data integrity issues</Text>
            <Text className="scenario-skills">Skills: Database, Backend, Integration, Analytics</Text>
          </div>
          
          <div className="scenario-card high-complexity">
            <div className="scenario-header">
              <Title level="H3">Security Compliance Audit</Title>
              <span className="complexity-badge">High Complexity</span>
            </div>
            <Text>Critical security compliance issues from external audit</Text>
            <Text className="scenario-skills">Skills: Security, Network, Backend, DevOps</Text>
          </div>
          
          <div className="scenario-card medium-complexity">
            <div className="scenario-header">
              <Title level="H3">Integration Breakdown</Title>
              <span className="complexity-badge">Medium Complexity</span>
            </div>
            <Text>Integration failure between SAP and third-party systems</Text>
            <Text className="scenario-skills">Skills: Integration, Backend, Network</Text>
          </div>
          
          <div className="scenario-card medium-complexity">
            <div className="scenario-header">
              <Title level="H3">Performance Degradation</Title>
              <span className="complexity-badge">Medium Complexity</span>
            </div>
            <Text>Gradual performance degradation across multiple modules</Text>
            <Text className="scenario-skills">Skills: Database, Backend, Analytics</Text>
          </div>
          
          <div className="scenario-card low-complexity">
            <div className="scenario-header">
              <Title level="H3">Mobile App Crash</Title>
              <span className="complexity-badge">Low Complexity</span>
            </div>
            <Text>Mobile application crashes when accessing specific functionality</Text>
            <Text className="scenario-skills">Skills: Mobile, Frontend, Backend</Text>
          </div>
        </div>
      </Panel>
      
      <Panel
        headerText="Testing Verification Checklist"
        className="doc-panel"
      >
        <List className="doc-checklist">
          <li className="ui5-list-item">
            <Icon name="checklist" />
            <span>Customer Portal was visited during the workflow</span>
          </li>
          <li className="ui5-list-item">
            <Icon name="checklist" />
            <span>Lead Engineer Dashboard was visited during the workflow</span>
          </li>
          <li className="ui5-list-item">
            <Icon name="checklist" />
            <span>CRP was visited during the workflow</span>
          </li>
          <li className="ui5-list-item">
            <Icon name="checklist" />
            <span>All workflow stages were properly transitioned</span>
          </li>
          <li className="ui5-list-item">
            <Icon name="checklist" />
            <span>Threads were created for the ticket</span>
          </li>
          <li className="ui5-list-item">
            <Icon name="checklist" />
            <span>Threads have appropriate skill requirements</span>
          </li>
          <li className="ui5-list-item">
            <Icon name="checklist" />
            <span>Threads can be assigned to engineers</span>
          </li>
          <li className="ui5-list-item">
            <Icon name="checklist" />
            <span>Lead engineer was assigned to the ticket</span>
          </li>
          <li className="ui5-list-item">
            <Icon name="checklist" />
            <span>CRP was triggered for the ticket</span>
          </li>
          <li className="ui5-list-item">
            <Icon name="checklist" />
            <span>SAP branding elements are present across the application</span>
          </li>
          <li className="ui5-list-item">
            <Icon name="checklist" />
            <span>Responsive design elements are implemented</span>
          </li>
          <li className="ui5-list-item">
            <Icon name="checklist" />
            <span>Accessibility features are implemented</span>
          </li>
        </List>
      </Panel>
    </div>
  );
};

export default DemoDocumentation;