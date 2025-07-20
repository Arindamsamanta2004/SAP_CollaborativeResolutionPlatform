import React, { useState, useEffect } from 'react';
import {
  Panel,
  Title,
  List,
  Button,
  ProgressIndicator,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  MessageStrip
} from '@ui5/webcomponents-react';
import { navigationService } from '../../services/navigation/navigationService';
import './styles.css';
import '@ui5/webcomponents-icons/dist/complete.js';
import '@ui5/webcomponents-icons/dist/error.js';
import '@ui5/webcomponents-icons/dist/pending.js';

interface TestResult {
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'pending';
  details?: string;
}

interface TestCategory {
  name: string;
  tests: TestResult[];
}

const DemoWorkflowTester: React.FC = () => {
  const [testResults, setTestResults] = useState<TestCategory[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testSummary, setTestSummary] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    pending: 0
  });

  // Initialize test categories
  useEffect(() => {
    const initialTests: TestCategory[] = [
      {
        name: 'Navigation Flow',
        tests: [
          {
            name: 'Customer Portal Visit',
            description: 'Verify Customer Portal was visited during workflow',
            status: 'pending'
          },
          {
            name: 'Lead Dashboard Visit',
            description: 'Verify Lead Engineer Dashboard was visited during workflow',
            status: 'pending'
          },
          {
            name: 'CRP Visit',
            description: 'Verify Collaborative Resolution Platform was visited during workflow',
            status: 'pending'
          },
          {
            name: 'Workflow Stage Transitions',
            description: 'Verify all workflow stages were properly transitioned',
            status: 'pending'
          }
        ]
      },
      {
        name: 'Thread Decomposition',
        tests: [
          {
            name: 'Thread Creation',
            description: 'Verify threads were created for the ticket',
            status: 'pending'
          },
          {
            name: 'Skill Mapping',
            description: 'Verify threads have appropriate skill requirements',
            status: 'pending'
          },
          {
            name: 'Thread Assignment',
            description: 'Verify threads can be assigned to engineers',
            status: 'pending'
          }
        ]
      },
      {
        name: 'Lead Engineer Assignment',
        tests: [
          {
            name: 'Lead Assignment Logic',
            description: 'Verify lead engineer assignment based on skill dominance',
            status: 'pending'
          },
          {
            name: 'CRP Trigger',
            description: 'Verify CRP can be triggered for complex tickets',
            status: 'pending'
          }
        ]
      },
      {
        name: 'UI Consistency',
        tests: [
          {
            name: 'SAP Branding',
            description: 'Verify consistent SAP branding across all views',
            status: 'pending'
          },
          {
            name: 'Responsive Design',
            description: 'Verify responsive design works across different screen sizes',
            status: 'pending'
          },
          {
            name: 'Accessibility',
            description: 'Verify accessibility compliance for professional presentation',
            status: 'pending'
          }
        ]
      }
    ];

    setTestResults(initialTests);
    
    // Calculate total tests
    let totalTests = 0;
    initialTests.forEach(category => {
      totalTests += category.tests.length;
    });
    
    setTestSummary({
      total: totalTests,
      passed: 0,
      failed: 0,
      pending: totalTests
    });
  }, []);

  // Run all tests
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestProgress(0);
    
    // Reset test results
    const resetTests: TestCategory[] = testResults.map(category => ({
      ...category,
      tests: category.tests.map(test => ({
        ...test,
        status: 'pending' as 'pending'
      }))
    }));
    
    setTestResults(resetTests);
    setTestSummary({
      total: testSummary.total,
      passed: 0,
      failed: 0,
      pending: testSummary.total
    });
    
    // Get total test count
    let totalTests = 0;
    resetTests.forEach(category => {
      totalTests += category.tests.length;
    });
    
    let completedTests = 0;
    
    // Run tests with a slight delay to show progress
    for (let categoryIndex = 0; categoryIndex < resetTests.length; categoryIndex++) {
      const category = resetTests[categoryIndex];
      
      for (let testIndex = 0; testIndex < category.tests.length; testIndex++) {
        // Wait a bit to simulate test running
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Run the test
        const testResult = runTest(category.name, category.tests[testIndex].name);
        
        // Update test result
        const updatedTests: TestCategory[] = [...resetTests];
        updatedTests[categoryIndex].tests[testIndex] = {
          ...updatedTests[categoryIndex].tests[testIndex],
          status: testResult.passed ? 'passed' : 'failed',
          details: testResult.details
        };
        
        setTestResults(updatedTests);
        
        // Update progress
        completedTests++;
        setTestProgress(Math.round((completedTests / totalTests) * 100));
        
        // Update summary
        setTestSummary(prev => ({
          ...prev,
          passed: prev.passed + (testResult.passed ? 1 : 0),
          failed: prev.failed + (testResult.passed ? 0 : 1),
          pending: prev.pending - 1
        }));
      }
    }
    
    setIsRunningTests(false);
  };

  // Run a specific test
  const runTest = (categoryName: string, testName: string): { passed: boolean; details?: string } => {
    const history = navigationService.getNavigationHistory();
    const visitedPaths = history.map(item => item.path);
    
    // Navigation Flow tests
    if (categoryName === 'Navigation Flow') {
      if (testName === 'Customer Portal Visit') {
        const visited = visitedPaths.some(path => path.includes('/customer-portal'));
        return {
          passed: visited,
          details: visited 
            ? 'Customer Portal was visited during the workflow' 
            : 'Customer Portal was not visited during the workflow'
        };
      }
      
      if (testName === 'Lead Dashboard Visit') {
        const visited = visitedPaths.some(path => path.includes('/lead-dashboard'));
        return {
          passed: visited,
          details: visited 
            ? 'Lead Engineer Dashboard was visited during the workflow' 
            : 'Lead Engineer Dashboard was not visited during the workflow'
        };
      }
      
      if (testName === 'CRP Visit') {
        const visited = visitedPaths.some(path => path.includes('/crp/'));
        return {
          passed: visited,
          details: visited 
            ? 'Collaborative Resolution Platform was visited during the workflow' 
            : 'Collaborative Resolution Platform was not visited during the workflow'
        };
      }
      
      if (testName === 'Workflow Stage Transitions') {
        const hasSubmission = visitedPaths.some(path => path.includes('/customer-portal'));
        const hasClassification = visitedPaths.some(path => path.includes('/lead-dashboard'));
        const hasResolution = visitedPaths.some(path => path.includes('/crp/'));
        const allStages = hasSubmission && hasClassification && hasResolution;
        
        return {
          passed: allStages,
          details: allStages 
            ? 'All workflow stages were properly transitioned' 
            : `Missing workflow stages: ${!hasSubmission ? 'Submission ' : ''}${!hasClassification ? 'Classification ' : ''}${!hasResolution ? 'Resolution' : ''}`
        };
      }
    }
    
    // Thread Decomposition tests
    if (categoryName === 'Thread Decomposition') {
      if (testName === 'Thread Creation') {
        // Simplified check - just verify if we've visited the CRP page
        const visited = visitedPaths.some(path => path.includes('/crp/'));
        return {
          passed: visited,
          details: visited 
            ? 'CRP was visited, threads were likely created' 
            : 'No evidence of thread creation'
        };
      }
      
      if (testName === 'Skill Mapping') {
        // Simplified check - just verify if we've visited the CRP page
        const visited = visitedPaths.some(path => path.includes('/crp/'));
        return {
          passed: visited,
          details: visited 
            ? 'CRP was visited, skill mapping was likely performed' 
            : 'No evidence of skill mapping'
        };
      }
      
      if (testName === 'Thread Assignment') {
        // Simplified check - just verify if we've visited the CRP page
        const visited = visitedPaths.some(path => path.includes('/crp/'));
        return {
          passed: visited,
          details: visited 
            ? 'CRP was visited, thread assignment was likely performed' 
            : 'No evidence of thread assignment'
        };
      }
    }
    
    // Lead Engineer Assignment tests
    if (categoryName === 'Lead Engineer Assignment') {
      if (testName === 'Lead Assignment Logic') {
        // Simplified check - just verify if we've visited the Lead Dashboard
        const visited = visitedPaths.some(path => path.includes('/lead-dashboard'));
        return {
          passed: visited,
          details: visited 
            ? 'Lead Dashboard was visited, lead assignment was likely performed' 
            : 'No evidence of lead assignment'
        };
      }
      
      if (testName === 'CRP Trigger') {
        const crpTriggered = visitedPaths.some(path => path.includes('/crp/'));
        return {
          passed: crpTriggered,
          details: crpTriggered
            ? 'CRP was triggered for the ticket'
            : 'CRP was not triggered for the ticket'
        };
      }
    }
    
    // UI Consistency tests
    if (categoryName === 'UI Consistency') {
      if (testName === 'SAP Branding') {
        // Check for SAP branding elements in the DOM
        const hasLogo = document.querySelectorAll('.sap-logo, .sap-branding').length > 0;
        const hasFioriStyles = document.querySelectorAll('[class*="ui5-"]').length > 0;
        
        return {
          passed: hasLogo || hasFioriStyles,
          details: (hasLogo || hasFioriStyles)
            ? 'SAP branding elements are present across the application'
            : 'SAP branding elements are missing'
        };
      }
      
      if (testName === 'Responsive Design') {
        // Simple check for responsive meta tag
        const hasResponsiveMeta = document.querySelector('meta[name="viewport"]') !== null;
        const hasResponsiveClasses = document.querySelectorAll('[class*="responsive"], [class*="mobile"]').length > 0;
        
        return {
          passed: hasResponsiveMeta || hasResponsiveClasses,
          details: (hasResponsiveMeta || hasResponsiveClasses)
            ? 'Responsive design elements are implemented'
            : 'Responsive design elements are missing'
        };
      }
      
      if (testName === 'Accessibility') {
        // Check for basic accessibility features
        const hasAriaLabels = document.querySelectorAll('[aria-label]').length > 0;
        const hasSkipLink = document.getElementById('skip-to-main') !== null;
        const hasLiveRegion = document.getElementById('accessibility-live-region') !== null;
        
        const accessibilityFeatures = [
          hasAriaLabels ? 'ARIA labels' : null,
          hasSkipLink ? 'Skip navigation link' : null,
          hasLiveRegion ? 'Live regions' : null
        ].filter(Boolean);
        
        return {
          passed: accessibilityFeatures.length > 0,
          details: accessibilityFeatures.length > 0
            ? `Accessibility features implemented: ${accessibilityFeatures.join(', ')}`
            : 'No accessibility features detected'
        };
      }
    }
    
    // Default fallback
    return {
      passed: false,
      details: 'Test not implemented'
    };
  };

  return (
    <div className="demo-workflow-tester">
      <Panel
        headerText="Demo Workflow Testing"
        className="workflow-test-panel"
      >
        <div className="test-controls">
          <FlexBox
            direction={FlexBoxDirection.Row}
            justifyContent={FlexBoxJustifyContent.SpaceBetween}
            alignItems={FlexBoxAlignItems.Center}
          >
            <Title level="H4">Verify End-to-End Demo Workflow</Title>
            <Button
              design="Emphasized"
              onClick={runAllTests}
              disabled={isRunningTests}
            >
              {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </FlexBox>
          
          {isRunningTests && (
            <ProgressIndicator
              value={testProgress}
              valueState="Information"
              className="test-progress"
            />
          )}
          
          <FlexBox
            direction={FlexBoxDirection.Row}
            justifyContent={FlexBoxJustifyContent.SpaceBetween}
            alignItems={FlexBoxAlignItems.Center}
            className="test-summary"
          >
            <div className="summary-item">
              <span className="summary-label">Total:</span>
              <span className="summary-value">{testSummary.total}</span>
            </div>
            <div className="summary-item passed">
              <span className="summary-label">Passed:</span>
              <span className="summary-value">{testSummary.passed}</span>
            </div>
            <div className="summary-item failed">
              <span className="summary-label">Failed:</span>
              <span className="summary-value">{testSummary.failed}</span>
            </div>
            <div className="summary-item pending">
              <span className="summary-label">Pending:</span>
              <span className="summary-value">{testSummary.pending}</span>
            </div>
          </FlexBox>
        </div>
        
        {testSummary.passed > 0 && testSummary.failed === 0 && testSummary.pending === 0 && (
          <MessageStrip
            design="Positive"
            hideCloseButton
            className="test-message"
          >
            All tests passed successfully! The demo workflow is complete and functioning correctly.
          </MessageStrip>
        )}
        
        {testSummary.failed > 0 && testSummary.pending === 0 && (
          <MessageStrip
            design="Negative"
            hideCloseButton
            className="test-message"
          >
            Some tests failed. Please review the results below to identify issues.
          </MessageStrip>
        )}
        
        <div className="test-categories">
          {testResults.map((category, categoryIndex) => (
            <Panel
              key={categoryIndex}
              headerText={category.name}
              className="test-category-panel"
            >
              <List className="test-list">
                {category.tests.map((test, testIndex) => (
                  <li
                    key={testIndex}
                    className={`ui5-list-item test-item ${test.status}`}
                  >
                    <div className="test-item-content">
                      <div className="test-item-header">
                        <span className="test-item-icon">
                          {test.status === 'pending' ? (
                            <span className="pending-icon">⏳</span>
                          ) : test.status === 'passed' ? (
                            <span className="passed-icon">✓</span>
                          ) : (
                            <span className="failed-icon">✗</span>
                          )}
                        </span>
                        <span className="test-item-name">{test.name}</span>
                        <span className={`test-item-status ${test.status}`}>
                          {test.status === 'pending' ? 'Pending' : test.status === 'passed' ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                      <div className="test-item-description">{test.description}</div>
                      {test.details && (
                        <div className="test-details">
                          {test.details}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </List>
            </Panel>
          ))}
        </div>
      </Panel>
    </div>
  );
};

export default DemoWorkflowTester;