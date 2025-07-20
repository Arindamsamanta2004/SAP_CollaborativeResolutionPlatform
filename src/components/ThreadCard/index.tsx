import React, { useState } from 'react';
import {
  Card,
  Title,
  Text,
  Button,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Avatar,
  Icon,
  Dialog,
  Bar,
  List,

  MessageStrip,
  BusyIndicator,
  TextArea
} from '@ui5/webcomponents-react';
import Badge from '../Badge';
import { IssueThread, SkillType, Engineer } from '../../models/types';
import { getEngineerById } from '../../models/mockData/engineers';
import { useAppState } from '../../contexts/AppStateContext';
import './styles.css';

interface ThreadCardProps {
  thread: IssueThread;
}

const ThreadCard: React.FC<ThreadCardProps> = ({ thread }) => {
  const { appState, assignThreadToEngineer, completeThread } = useAppState();
  
  // State for dialog
  const [showAssignDialog, setShowAssignDialog] = useState<boolean>(false);
  const [showChatDialog, setShowChatDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [assignmentSuccess, setAssignmentSuccess] = useState<boolean>(false);
  
  // Get available engineers from app state
  const availableEngineers = appState.engineers.filter(eng => 
    eng.availability === 'Available' && 
    thread.requiredSkills.some(skill => eng.skills.includes(skill))
  );

  // Get assigned engineer if any
  const assignedEngineer = thread.assignedEngineerId 
    ? getEngineerById(thread.assignedEngineerId) 
    : null;

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return '1';
      case 'In Progress': return '6';
      case 'Resolved': return '8';
      default: return '1';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return '8';
    if (priority >= 5) return '6';
    return '1';
  };

  // Get skill color
  const getSkillColor = (skill: SkillType): string => {
    const skillColors: Record<SkillType, string> = {
      'Database': '10',
      'Frontend': '8',
      'Backend': '6',
      'Network': '3',
      'Security': '2',
      'DevOps': '9',
      'Integration': '7',
      'Analytics': '5',
      'Mobile': '4',
      'Cloud': '11',
      'UX': '1'
    };
    
    return skillColors[skill] || '1';
  };

  // Handle opening the assignment dialog
  const handleOpenAssignDialog = () => {
    setIsLoading(true);
    setAssignmentError(null);
    setAssignmentSuccess(false);
    
    // We're already filtering available engineers in the component
    setIsLoading(false);
    setShowAssignDialog(true);
  };

  // Handle engineer selection and thread assignment
  const handleAssignToEngineer = (engineerId: string) => {
    setIsLoading(true);
    setAssignmentError(null);
    
    try {
      // Find the engineer in our app state
      const engineer = appState.engineers.find(eng => eng.id === engineerId);
      
      if (!engineer) {
        setAssignmentError("Engineer not found.");
        setIsLoading(false);
        return;
      }
      
      if (engineer.availability !== 'Available') {
        setAssignmentError(`${engineer.name} is currently ${engineer.availability.toLowerCase()}.`);
        setIsLoading(false);
        return;
      }
      
      if (engineer.currentWorkload >= 80) {
        setAssignmentError(`${engineer.name} has a high workload (${engineer.currentWorkload}%).`);
        setIsLoading(false);
        return;
      }
      
      // Assign thread to engineer using our AppState context function
      assignThreadToEngineer(thread.id, engineerId);
      
      setAssignmentSuccess(true);
      
      // Close dialog after a short delay to show success message
      setTimeout(() => {
        setShowAssignDialog(false);
      }, 1500);
    } catch (error) {
      setAssignmentError("An error occurred during assignment.");
      console.error("Assignment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle auto-assignment based on best skill match
  const handleAutoAssign = () => {
    setIsLoading(true);
    setAssignmentError(null);
    
    try {
      // Find the primary required skill (first in the list)
      const primarySkill = thread.requiredSkills[0];
      
      // Find best engineer for this skill from available engineers
      const bestEngineer = availableEngineers
        .filter(eng => eng.skills.includes(primarySkill))
        .reduce((best, current) => {
          const bestExpertise = best?.expertise[primarySkill] || 0;
          const currentExpertise = current.expertise[primarySkill] || 0;
          return currentExpertise > bestExpertise ? current : best;
        }, null as Engineer | null);
      
      if (!bestEngineer) {
        setAssignmentError(`No available engineers with ${primarySkill} skills.`);
        setIsLoading(false);
        return;
      }
      
      // Assign thread to best engineer using our AppState context function
      assignThreadToEngineer(thread.id, bestEngineer.id);
      
      setAssignmentSuccess(true);
      
      // Close dialog after a short delay
      setTimeout(() => {
        setShowAssignDialog(false);
      }, 1500);
    } catch (error) {
      setAssignmentError("An error occurred during auto-assignment.");
      console.error("Auto-assignment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // State for solution input
  const [showResolutionDialog, setShowResolutionDialog] = useState<boolean>(false);
  const [solution, setSolution] = useState<string>('');
  
  // Handle opening resolution dialog
  const handleOpenResolutionDialog = () => {
    setSolution('');
    setShowResolutionDialog(true);
  };
  
  // Handle mark as resolved action
  const handleMarkResolved = () => {
    if (!solution.trim()) {
      return; // Don't proceed if solution is empty
    }
    
    try {
      // Update thread status and add solution using our AppState context function
      completeThread(thread.id, solution);
      
      // Reset solution and close dialog
      setSolution('');
      setShowResolutionDialog(false);
      
      console.log(`Thread ${thread.id} marked as resolved with solution: ${solution}`);
    } catch (error) {
      console.error('Error marking thread as resolved:', error);
    }
  };

  // Handle opening chat dialog
  const handleOpenChat = () => {
    setShowChatDialog(true);
  };

  // Calculate skill match percentage for an engineer
  const calculateSkillMatch = (engineer: Engineer): number => {
    const matchingSkills = thread.requiredSkills.filter(skill => 
      engineer.skills.includes(skill)
    );
    
    return Math.round((matchingSkills.length / thread.requiredSkills.length) * 100);
  };

  // Get expertise level for a specific skill
  const getExpertiseLevel = (engineer: Engineer, skill: SkillType): number => {
    return engineer.expertise[skill] || 0;
  };

  return (
    <>
      <Card className={`thread-card thread-status-${thread.status.toLowerCase().replace(' ', '-')} ${assignedEngineer ? 'thread-assigned' : ''}`}>
        <div className="thread-card-header">
          <Badge colorScheme={getStatusColor(thread.status)}>{thread.status}</Badge>
          <Badge colorScheme={getPriorityColor(thread.priority)}>Priority: {thread.priority}</Badge>
        </div>
        
        <Title level="H3" className="thread-card-title">{thread.title}</Title>
        
        <Text className="thread-card-description">{thread.description}</Text>
        
        <div className="thread-card-skills">
          <Text className="thread-card-section-title">Required Skills:</Text>
          <div className="thread-card-skill-tags">
            {thread.requiredSkills.map(skill => (
              <Badge key={skill} colorScheme={getSkillColor(skill)}>{skill}</Badge>
            ))}
          </div>
        </div>
        
        {assignedEngineer ? (
          <div className="thread-card-assignment">
            <Text className="thread-card-section-title">Assigned Engineer:</Text>
            <FlexBox 
              direction={FlexBoxDirection.Row} 
              alignItems={FlexBoxAlignItems.Center}
              className="thread-card-engineer"
            >
              <Avatar size="XS">
                {assignedEngineer.avatar && <img src={assignedEngineer.avatar} alt={assignedEngineer.name} />}
              </Avatar>
              <div className="thread-card-engineer-info">
                <Text className="thread-card-engineer-name">{assignedEngineer.name}</Text>
                <Text className="thread-card-engineer-department">{assignedEngineer.department}</Text>
              </div>
              <div className={`thread-card-engineer-status ${assignedEngineer.availability.toLowerCase()}`}>
                {assignedEngineer.availability}
              </div>
            </FlexBox>
          </div>
        ) : (
          <div className="thread-card-unassigned">
            <Text className="thread-card-section-title">Status:</Text>
            <Text>Waiting for engineer assignment</Text>
          </div>
        )}
        
        <FlexBox 
          direction={FlexBoxDirection.Row} 
          justifyContent={FlexBoxJustifyContent.SpaceBetween}
          className="thread-card-actions"
        >
          {thread.status === 'Open' && (
            <Button 
              design="Emphasized" 
              icon="personnel-view"
              onClick={handleOpenAssignDialog}
            >
              Pull Thread
            </Button>
          )}
          
          {thread.status === 'In Progress' && (
            <Button 
              design="Positive" 
              icon="complete"
              onClick={handleOpenResolutionDialog}
            >
              Mark Resolved
            </Button>
          )}
          
          {thread.chatEnabled && (
            <Button 
              design="Transparent" 
              icon="discussion"
              tooltip="Open chat room"
              onClick={handleOpenChat}
              disabled={!assignedEngineer}
            >
              Chat
            </Button>
          )}
        </FlexBox>
        
        {thread.status === 'Resolved' && (
          <div className="thread-card-resolution">
            <Icon name="complete" className="thread-card-resolution-icon" />
            <Text>This thread has been resolved</Text>
          </div>
        )}
        
        {/* Collaboration indicator */}
        {thread.chatEnabled && thread.status === 'In Progress' && (
          <div className="thread-card-collaboration-indicator">
            <Icon name="group" className="thread-card-collaboration-icon" />
            <Text>Collaboration enabled</Text>
          </div>
        )}
      </Card>
      
      {/* Engineer Assignment Dialog */}
      <Dialog
        open={showAssignDialog}
        onClose={() => setShowAssignDialog(false)}
        className="thread-assignment-dialog"
        headerText="Assign Thread to Engineer"
      >
        <Bar
          design="Header"
          endContent={
            <Button 
              design="Emphasized" 
              icon="auto" 
              onClick={handleAutoAssign}
              disabled={isLoading || assignmentSuccess}
            >
              Auto-Assign
            </Button>
          }
        />
        
        {assignmentError && (
          <MessageStrip 
            design="Negative" 
            hideCloseButton={false}
            onClose={() => setAssignmentError(null)}
          >
            {assignmentError}
          </MessageStrip>
        )}
        
        {assignmentSuccess && (
          <MessageStrip 
            design="Positive" 
            hideCloseButton={true}
          >
            Thread assigned successfully!
          </MessageStrip>
        )}
        
        {isLoading ? (
          <div className="thread-assignment-loading">
            <BusyIndicator size="M" />
            <Text>Processing assignment...</Text>
          </div>
        ) : (
          <>
            {availableEngineers.length === 0 ? (
              <div className="thread-assignment-empty">
                <Icon name="employee-rejections" className="thread-assignment-empty-icon" />
                <Text>No available engineers with matching skills.</Text>
              </div>
            ) : (
              <List className="thread-assignment-list">
                {availableEngineers.map(engineer => {
                  const skillMatch = calculateSkillMatch(engineer);
                  
                  return (
                    <li
                      key={engineer.id}
                      onClick={() => handleAssignToEngineer(engineer.id)}
                      className="ui5-list-item thread-assignment-item"
                    >
                      <div className="thread-assignment-content">
                        <Avatar 
                          size="S"
                          className={`engineer-avatar ${engineer.availability.toLowerCase()}`}
                        >
                          {engineer.avatar && <img src={engineer.avatar} alt={engineer.name} />}
                        </Avatar>
                        <div className="thread-assignment-details">
                          <div className="thread-assignment-header">
                            <span className="thread-assignment-name">{engineer.name}</span>
                            <Badge colorScheme={skillMatch >= 75 ? '8' : skillMatch >= 50 ? '6' : '1'}>
                              {skillMatch}% match
                            </Badge>
                          </div>
                          <div className="thread-assignment-skills">
                            {thread.requiredSkills.map(skill => (
                              engineer.skills.includes(skill) ? (
                                <div key={skill} className="thread-assignment-skill">
                                  <Badge colorScheme={getSkillColor(skill)}>{skill}</Badge>
                                  <div className="thread-assignment-expertise">
                                    <div 
                                      className="thread-assignment-expertise-bar"
                                      style={{ width: `${getExpertiseLevel(engineer, skill)}%` }}
                                    ></div>
                                    <span>{getExpertiseLevel(engineer, skill)}%</span>
                                  </div>
                                </div>
                              ) : null
                            ))}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </List>
            )}
          </>
        )}
      </Dialog>
      
      {/* Resolution Dialog */}
      <Dialog
        open={showResolutionDialog}
        onClose={() => setShowResolutionDialog(false)}
        className="thread-resolution-dialog"
        headerText="Mark Thread as Resolved"
      >
        <div className="thread-resolution-content" style={{ padding: '1rem' }}>
          <MessageStrip
            design="Information"
            hideCloseButton
            style={{ marginBottom: '1rem' }}
          >
            Please provide a solution summary before marking this thread as resolved.
          </MessageStrip>
          
          <Title level="H4">Thread: {thread.title}</Title>
          <Text style={{ marginBottom: '1rem' }}>{thread.description}</Text>
          
          <div style={{ marginBottom: '1rem' }}>
            <Text style={{ marginBottom: '0.5rem' }}>Solution Summary:</Text>
            <TextArea
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Describe the solution you implemented for this thread..."
              rows={5}
              style={{ width: '100%' }}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem', borderTop: '1px solid #e5e5e5' }}>
          <Button 
            design="Transparent" 
            onClick={() => setShowResolutionDialog(false)}
          >
            Cancel
          </Button>
          <Button 
            design="Emphasized" 
            icon="complete"
            onClick={handleMarkResolved}
            disabled={!solution.trim()}
          >
            Mark as Resolved
          </Button>
        </div>
      </Dialog>
      
      {/* Chat Dialog */}
      <Dialog
        open={showChatDialog}
        onClose={() => setShowChatDialog(false)}
        className="thread-chat-dialog"
        headerText={`Thread Chat: ${thread.title}`}
      >
        <div className="thread-chat-content">
          <div className="thread-chat-messages">
            <div className="thread-chat-system-message">
              <Text>This is a simulated chat room for thread collaboration.</Text>
              <Text>In a real implementation, engineers would communicate here.</Text>
            </div>
            
            {assignedEngineer && (
              <div className="thread-chat-user-message">
                <Avatar size="XS">
                  {assignedEngineer.avatar && <img src={assignedEngineer.avatar} alt={assignedEngineer.name} />}
                </Avatar>
                <div className="thread-chat-message-content">
                  <div className="thread-chat-message-header">
                    <span className="thread-chat-message-name">{assignedEngineer.name}</span>
                    <span className="thread-chat-message-time">Just now</span>
                  </div>
                  <div className="thread-chat-message-text">
                    I've started working on this thread. Will update with progress soon.
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="thread-chat-input">
            <Text>Chat functionality is simulated for demo purposes.</Text>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ThreadCard;