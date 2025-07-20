import React from 'react';
import { 
  FlexBox, 
  FlexBoxDirection, 
  FlexBoxJustifyContent, 
  FlexBoxAlignItems,
  Icon,
  Text
} from '@ui5/webcomponents-react';
import './styles.css';

export type WorkflowStage = 'submission' | 'classification' | 'resolution' | 'completion';

interface WorkflowIndicatorProps {
  currentStage: WorkflowStage;
}

interface StageInfo {
  label: string;
  icon: string;
  description: string;
}

const WorkflowIndicator: React.FC<WorkflowIndicatorProps> = ({ currentStage }) => {
  // Define workflow stages
  const stages: Record<WorkflowStage, StageInfo> = {
    submission: {
      label: 'Ticket Submission',
      icon: 'create-form',
      description: 'Customer submits support ticket'
    },
    classification: {
      label: 'AI Classification',
      icon: 'decision',
      description: 'Ticket is analyzed and classified'
    },
    resolution: {
      label: 'Collaborative Resolution',
      icon: 'collaborate',
      description: 'Engineers work on issue threads'
    },
    completion: {
      label: 'Resolution Complete',
      icon: 'complete',
      description: 'All threads resolved and merged'
    }
  };
  
  // Define the order of stages
  const stageOrder: WorkflowStage[] = ['submission', 'classification', 'resolution', 'completion'];
  
  // Find the index of the current stage
  const currentStageIndex = stageOrder.indexOf(currentStage);
  
  return (
    <div className="workflow-indicator">
      <FlexBox
        direction={FlexBoxDirection.Row}
        justifyContent={FlexBoxJustifyContent.SpaceBetween}
        alignItems={FlexBoxAlignItems.Center}
        className="workflow-stages"
      >
        {stageOrder.map((stage, index) => {
          const stageInfo = stages[stage];
          const isActive = index <= currentStageIndex;
          const isCurrent = index === currentStageIndex;
          
          return (
            <div 
              key={stage} 
              className={`workflow-stage ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div className="stage-icon-container">
                <Icon name={stageInfo.icon} className="stage-icon" />
                {index < stageOrder.length - 1 && (
                  <div className={`stage-connector ${isActive ? 'active' : ''}`} />
                )}
              </div>
              <div className="stage-label">{stageInfo.label}</div>
              <Text className="stage-description">{stageInfo.description}</Text>
            </div>
          );
        })}
      </FlexBox>
    </div>
  );
};

export default WorkflowIndicator;