import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Title,
  Text,
  ProgressIndicator,
  Button,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Icon,
  Card
} from '@ui5/webcomponents-react';
import { Ticket, Engineer, IssueThread } from '../../models/types';
import { autoLaunchService, CRPLaunchResult } from '../../services/crp/autoLaunchService';
import Badge from '../Badge';
import './styles.css';

interface CRPAutoLaunchProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  onLaunchComplete: (result: CRPLaunchResult) => void;
}

const CRPAutoLaunch: React.FC<CRPAutoLaunchProps> = ({
  ticket,
  isOpen,
  onClose,
  onLaunchComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchResult, setLaunchResult] = useState<CRPLaunchResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Auto-start launch when dialog opens
  useEffect(() => {
    if (isOpen && !isLaunching && !showResults) {
      startCRPLaunch();
    }
  }, [isOpen]);

  const startCRPLaunch = async () => {
    setIsLaunching(true);
    setProgress(0);
    setCurrentStage('Initializing CRP Auto-Launch...');

    try {
      const result = await autoLaunchService.executeCRPLaunch(
        ticket,
        (progressValue, stage) => {
          setProgress(progressValue);
          setCurrentStage(stage);
        }
      );

      setLaunchResult(result);
      
      // Show results after a brief delay
      setTimeout(() => {
        setShowResults(true);
        setIsLaunching(false);
      }, 500);

    } catch (error) {
      console.error('CRP launch failed:', error);
      setCurrentStage('CRP launch failed. Please try again.');
      setIsLaunching(false);
    }
  };

  const handleComplete = () => {
    if (launchResult) {
      onLaunchComplete(launchResult);
    }
    onClose();
  };

  const getProgressState = () => {
    if (progress >= 90) return 'Positive';
    if (progress >= 50) return 'Information';
    return 'Critical';
  };

  const getComplexityBadgeColor = (complexity: string) => {
    switch (complexity) {
      case 'High': return '5';
      case 'Medium': return '4';
      case 'Low': return '3';
      default: return '1';
    }
  };

  const getSkillBadgeColor = (index: number) => {
    const colors = ['10', '8', '6', '3', '2', '9', '7', '5', '4', '11'];
    return colors[index % colors.length];
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="crp-auto-launch-dialog"
      headerText="🚀 CRP Auto-Launch"
    >
      <div className="crp-launch-content">
        {!showResults ? (
          // Launch Progress View
          <div className="crp-launch-progress">
            <div className="crp-launch-header">
              <Icon name="collaborate" className="crp-launch-icon" />
              <Title level="H3">Collaborative Resolution Platform</Title>
              <Text className="crp-launch-subtitle">
                Auto-launching based on ticket complexity analysis
              </Text>
            </div>

            <Card className="crp-ticket-summary">
              <Title level="H4">{ticket.subject}</Title>
              <Text className="crp-ticket-description">{ticket.description}</Text>
              
              <FlexBox direction={FlexBoxDirection.Row} className="crp-ticket-metadata">
                <Badge colorScheme="1">ID: {ticket.id}</Badge>
                <Badge colorScheme="2">{ticket.urgency}</Badge>
                {ticket.aiClassification && (
                  <Badge colorScheme={getComplexityBadgeColor(ticket.aiClassification.complexityEstimate)}>
                    {ticket.aiClassification.complexityEstimate} Complexity
                  </Badge>
                )}
              </FlexBox>

              {ticket.aiClassification && (
                <div className="crp-required-skills">
                  <Text className="crp-skills-label">Required Skills:</Text>
                  <div className="crp-skills-tags">
                    {ticket.aiClassification.skillTags.map((skill, index) => (
                      <Badge key={skill} colorScheme={getSkillBadgeColor(index)}>
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <div className="crp-progress-section">
              <ProgressIndicator
                value={progress}
                valueState={getProgressState()}
                displayValue={`${progress}%`}
                className="crp-progress-bar"
              />
              
              <div className="crp-stage-indicator">
                <div className={`crp-stage-pulse ${isLaunching ? 'active' : ''}`}></div>
                <Text className="crp-current-stage">{currentStage}</Text>
              </div>
            </div>

            <div className="crp-launch-animation">
              <div className={`crp-launch-rings ${isLaunching ? 'active' : ''}`}>
                <div className="crp-ring crp-ring-1"></div>
                <div className="crp-ring crp-ring-2"></div>
                <div className="crp-ring crp-ring-3"></div>
              </div>
            </div>
          </div>
        ) : (
          // Launch Results View
          <div className="crp-launch-results">
            {launchResult?.shouldLaunch ? (
              <div className="crp-success-results">
                <div className="crp-success-header">
                  <Icon name="accept" className="crp-success-icon" />
                  <Title level="H3">CRP Successfully Launched!</Title>
                  <Text className="crp-success-reason">{launchResult.reason}</Text>
                </div>

                {launchResult.leadEngineer && (
                  <Card className="crp-lead-engineer-card">
                    <Title level="H4">Lead Engineer Assigned</Title>
                    <FlexBox direction={FlexBoxDirection.Row} alignItems={FlexBoxAlignItems.Center}>
                      <div className="crp-engineer-info">
                        <Text className="crp-engineer-name">{launchResult.leadEngineer.name}</Text>
                        <Text className="crp-engineer-department">{launchResult.leadEngineer.department}</Text>
                        <Badge colorScheme="8">Most Experienced</Badge>
                      </div>
                    </FlexBox>
                  </Card>
                )}

                <Card className="crp-threads-summary">
                  <Title level="H4">Issue Threads Created</Title>
                  <Text className="crp-threads-count">
                    {launchResult.threads.length} specialized threads ready for collaborative resolution
                  </Text>
                  
                  <div className="crp-threads-preview">
                    {launchResult.threads.slice(0, 3).map((thread, index) => (
                      <div key={thread.id} className="crp-thread-preview">
                        <Text className="crp-thread-title">{thread.title}</Text>
                        <div className="crp-thread-skills">
                          {thread.requiredSkills.map(skill => (
                            <Badge key={skill} colorScheme={getSkillBadgeColor(index)}>
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                    {launchResult.threads.length > 3 && (
                      <Text className="crp-more-threads">
                        +{launchResult.threads.length - 3} more threads...
                      </Text>
                    )}
                  </div>
                </Card>

                <FlexBox 
                  direction={FlexBoxDirection.Row} 
                  justifyContent={FlexBoxJustifyContent.End}
                  className="crp-action-buttons"
                >
                  <Button design="Emphasized" onClick={handleComplete}>
                    Open CRP Dashboard
                  </Button>
                </FlexBox>
              </div>
            ) : (
              <div className="crp-no-launch">
                <Icon name="information" className="crp-info-icon" />
                <Title level="H3">CRP Not Required</Title>
                <Text>{launchResult?.reason}</Text>
                <Button design="Default" onClick={onClose}>
                  Continue with Standard Processing
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default CRPAutoLaunch;