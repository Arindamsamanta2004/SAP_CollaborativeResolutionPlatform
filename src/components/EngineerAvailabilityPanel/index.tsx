import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Avatar,
  ProgressIndicator,
  Title,
  Text,
  Button,
  Dialog,
  Bar,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Icon
} from '@ui5/webcomponents-react';
import Badge from '../Badge';
import { Engineer, SkillType, IssueThread } from '../../models/types';
import { getThreadsByEngineer } from '../../models/mockData/threads';
import { useAppState } from '../../contexts/AppStateContext';
import './styles.css';

interface EngineerAvailabilityPanelProps {
  engineers?: Engineer[];
}

const EngineerAvailabilityPanel: React.FC<EngineerAvailabilityPanelProps> = ({ engineers: propEngineers }) => {
  const { appState, updateEngineerAvailability, updateEngineerWorkload } = useAppState();
  const engineers = propEngineers || appState.engineers;
  
  // State for engineer details dialog
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  const [engineerThreads, setEngineerThreads] = useState<IssueThread[]>([]);
  const [showEngineerDialog, setShowEngineerDialog] = useState<boolean>(false);
  
  // Effect to update selected engineer when appState changes
  useEffect(() => {
    if (selectedEngineer) {
      const updatedEngineer = appState.engineers.find(eng => eng.id === selectedEngineer.id);
      if (updatedEngineer) {
        setSelectedEngineer(updatedEngineer);
      }
    }
  }, [appState.engineers, selectedEngineer]);

  // Sort engineers by availability and then by workload
  const sortedEngineers = [...engineers].sort((a, b) => {
    // First sort by availability
    if (a.availability === 'Available' && b.availability !== 'Available') return -1;
    if (a.availability !== 'Available' && b.availability === 'Available') return 1;
    
    // Then sort by workload (lower workload first)
    return a.currentWorkload - b.currentWorkload;
  });

  // Get workload state
  const getWorkloadState = (workload: number): "Negative" | "Critical" | "Positive" | "Information" | "None" => {
    if (workload >= 80) return "Negative";
    if (workload >= 50) return "Critical";
    return "Positive";
  };

  // Get availability state
  const getAvailabilityState = (availability: string): string => {
    switch (availability) {
      case 'Available': return "3";
      case 'Busy': return "4";
      case 'Offline': return "5";
      default: return "1";
    }
  };

  // Get primary skill
  const getPrimarySkill = (engineer: Engineer): SkillType | null => {
    if (!engineer.skills || engineer.skills.length === 0) return null;
    
    // Find skill with highest expertise
    return engineer.skills.reduce((highest, current) => {
      const highestExpertise = engineer.expertise[highest] || 0;
      const currentExpertise = engineer.expertise[current] || 0;
      return currentExpertise > highestExpertise ? current : highest;
    }, engineer.skills[0]);
  };

  // Handle opening engineer details
  const handleOpenEngineerDetails = (engineer: Engineer) => {
    setSelectedEngineer(engineer);
    
    // Get threads assigned to this engineer
    const threads = getThreadsByEngineer(engineer.id);
    setEngineerThreads(threads);
    
    setShowEngineerDialog(true);
  };

  // Handle updating engineer availability
  const handleUpdateAvailability = (engineerId: string, availability: 'Available' | 'Busy' | 'Offline') => {
    // Use the AppState context function to update availability
    updateEngineerAvailability(engineerId, availability);
    
    // Close dialog without page refresh (real-time updates will handle the UI)
    setShowEngineerDialog(false);
  };

  // Get skill expertise level
  const getExpertiseLevel = (engineer: Engineer, skill: SkillType): number => {
    return engineer.expertise[skill] || 0;
  };

  return (
    <>
      <Card className="engineer-availability-panel">
        <div className="engineer-panel-header">
          <Title level="H3">Available Engineers</Title>
          <Text>Real-time workload and availability status</Text>
        </div>
        
        {engineers.length === 0 ? (
          <div className="engineer-empty-state">
            <Text>No engineers available at the moment</Text>
          </div>
        ) : (
          <List className="engineer-list">
            {sortedEngineers.map(engineer => {
              const primarySkill = getPrimarySkill(engineer);
              
              return (
                <li
                  key={engineer.id}
                  className="ui5-list-item engineer-list-item"
                  onClick={() => handleOpenEngineerDetails(engineer)}
                >
                  <div className="engineer-list-item-content">
                    <Avatar 
                      size="S"
                      className={`engineer-avatar ${engineer.availability.toLowerCase()}`}
                    >
                      {engineer.avatar && <img src={engineer.avatar} alt={engineer.name} />}
                    </Avatar>
                    <div className="engineer-list-content">
                      <div className="engineer-name">{engineer.name}</div>
                      <div className="engineer-workload">
                        <Text className="engineer-workload-label">Workload:</Text>
                        <ProgressIndicator
                          value={engineer.currentWorkload}
                          valueState={getWorkloadState(engineer.currentWorkload)}
                          className="engineer-workload-indicator"
                        />
                        <Text className="engineer-workload-value">{engineer.currentWorkload}%</Text>
                      </div>
                      <div className="engineer-metadata">
                        <Badge colorScheme={getAvailabilityState(engineer.availability)}>
                          {engineer.availability}
                        </Badge>
                        {primarySkill && (
                          <Badge colorScheme="1" className="engineer-primary-skill">
                            {primarySkill}
                          </Badge>
                        )}
                        {engineer.isLeadEngineer && (
                          <Badge colorScheme="8" className="engineer-lead-badge">
                            Lead
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </List>
        )}
      </Card>
      
      {/* Engineer Details Dialog */}
      {selectedEngineer && (
        <Dialog
          open={showEngineerDialog}
          onClose={() => setShowEngineerDialog(false)}
          className="engineer-details-dialog"
          headerText="Engineer Details"
        >
          <div className="engineer-details-content">
            <div className="engineer-details-header">
              <Avatar 
                size="L"
                className={`engineer-avatar ${selectedEngineer.availability.toLowerCase()}`}
              >
                {selectedEngineer.avatar && <img src={selectedEngineer.avatar} alt={selectedEngineer.name} />}
              </Avatar>
              <div className="engineer-details-info">
                <Title level="H3">{selectedEngineer.name}</Title>
                <Text>{selectedEngineer.department}</Text>
                <Text>{selectedEngineer.email}</Text>
                <div className="engineer-details-badges">
                  <Badge colorScheme={getAvailabilityState(selectedEngineer.availability)}>
                    {selectedEngineer.availability}
                  </Badge>
                  {selectedEngineer.isLeadEngineer && (
                    <Badge colorScheme="8">Lead Engineer</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="engineer-details-section">
              <Title level="H4">Skills & Expertise</Title>
              <div className="engineer-details-skills">
                {selectedEngineer.skills.map(skill => (
                  <div key={skill} className="engineer-details-skill">
                    <Badge colorScheme="1">{skill}</Badge>
                    <div className="engineer-details-expertise">
                      <div 
                        className="engineer-details-expertise-bar"
                        style={{ width: `${getExpertiseLevel(selectedEngineer, skill)}%` }}
                      ></div>
                      <span>{getExpertiseLevel(selectedEngineer, skill)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="engineer-details-section">
              <Title level="H4">Current Workload</Title>
              <div className="engineer-details-workload">
                <ProgressIndicator
                  value={selectedEngineer.currentWorkload}
                  valueState={getWorkloadState(selectedEngineer.currentWorkload)}
                  className="engineer-details-workload-indicator"
                />
                <Text className="engineer-details-workload-value">{selectedEngineer.currentWorkload}%</Text>
              </div>
            </div>
            
            <div className="engineer-details-section">
              <Title level="H4">Assigned Threads</Title>
              {engineerThreads.length === 0 ? (
                <div className="engineer-details-no-threads">
                  <Icon name="document" className="engineer-details-no-threads-icon" />
                  <Text>No threads currently assigned</Text>
                </div>
              ) : (
                <List className="engineer-details-threads">
                  {engineerThreads.map(thread => (
                    <li
                      key={thread.id}
                      className="ui5-list-item engineer-details-thread-item"
                    >
                      <div className="engineer-details-thread-title">
                        {thread.title}
                      </div>
                      <div className="ui5-list-item-description">
                        Priority: {thread.priority} • Status: {thread.status}
                      </div>
                    </li>
                  ))}
                </List>
              )}
            </div>
            
            <div className="engineer-details-section">
              <Title level="H4">Update Availability</Title>
              <FlexBox 
                direction={FlexBoxDirection.Row} 
                justifyContent={FlexBoxJustifyContent.SpaceBetween}
                alignItems={FlexBoxAlignItems.Center}
                className="engineer-details-availability-actions"
              >
                <Button 
                  design={selectedEngineer.availability === 'Available' ? 'Emphasized' : 'Default'}
                  onClick={() => handleUpdateAvailability(selectedEngineer.id, 'Available')}
                  icon="status-positive"
                  disabled={selectedEngineer.availability === 'Available'}
                >
                  Available
                </Button>
                <Button 
                  design={selectedEngineer.availability === 'Busy' ? 'Emphasized' : 'Default'}
                  onClick={() => handleUpdateAvailability(selectedEngineer.id, 'Busy')}
                  icon="status-critical"
                  disabled={selectedEngineer.availability === 'Busy'}
                >
                  Busy
                </Button>
                <Button 
                  design={selectedEngineer.availability === 'Offline' ? 'Emphasized' : 'Default'}
                  onClick={() => handleUpdateAvailability(selectedEngineer.id, 'Offline')}
                  icon="status-negative"
                  disabled={selectedEngineer.availability === 'Offline'}
                >
                  Offline
                </Button>
              </FlexBox>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default EngineerAvailabilityPanel;