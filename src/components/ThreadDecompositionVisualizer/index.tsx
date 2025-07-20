import React from 'react';
import { 
  Card, 
  Title, 
  Text, 
  FlexBox, 
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems
} from '@ui5/webcomponents-react';
import Badge from '../Badge';
import { IssueThread, SkillType } from '../../models/types';
import './styles.css';

interface ThreadDecompositionVisualizerProps {
  threads: IssueThread[];
  isAnimating?: boolean;
}

/**
 * Component for visualizing the thread decomposition process
 */
const ThreadDecompositionVisualizer: React.FC<ThreadDecompositionVisualizerProps> = ({
  threads,
  isAnimating = false
}) => {
  // Get skill color based on skill type
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
  
  return (
    <Card className="thread-decomposition-visualizer">
      <div className="thread-decomposition-content">
        <Title level="H4">Thread Decomposition</Title>
        
        <Text className="thread-decomposition-description">
          The AI engine has decomposed the ticket into {threads.length} specialized threads based on required skills and complexity analysis.
        </Text>
        
        <div className="thread-flow-diagram">
          <div className="thread-parent-node">
            <Title level="H5">Parent Ticket</Title>
          </div>
          
          <div className="thread-connections">
            {threads.map((_, index) => (
              <div 
                key={index} 
                className={`thread-connection ${isAnimating ? 'animating' : ''}`}
                style={{ 
                  animationDelay: `${index * 0.2}s`,
                  height: `${100 + index * 20}px`
                }}
              ></div>
            ))}
          </div>
          
          <div className="thread-nodes">
            {threads.map((thread, index) => (
              <div 
                key={thread.id} 
                className={`thread-node ${isAnimating ? 'animating' : ''}`}
                style={{ animationDelay: `${index * 0.3}s` }}
              >
                <Title level="H6" className="thread-node-title">
                  {thread.title}
                </Title>
                <div className="thread-node-skills">
                  {thread.requiredSkills.map(skill => (
                    <Badge
                      key={skill}
                      colorScheme={getSkillColor(skill)}
                      className="thread-skill-badge"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="thread-details-grid">
          {threads.map((thread) => (
            <Card key={thread.id} className="thread-detail-card">
              <div className="thread-detail-content">
                <Title level="H5">{thread.title}</Title>
                
                <Text className="thread-description">
                  {thread.description}
                </Text>
                
                <FlexBox 
                  direction={FlexBoxDirection.Row}
                  justifyContent={FlexBoxJustifyContent.SpaceBetween}
                  alignItems={FlexBoxAlignItems.Center}
                  className="thread-detail-footer"
                >
                  <div className="thread-skills">
                    {thread.requiredSkills.map(skill => (
                      <Badge
                        key={skill}
                        colorScheme={getSkillColor(skill)}
                        className="thread-skill-badge"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <Badge
                    colorScheme={thread.priority >= 8 ? '5' : thread.priority >= 5 ? '4' : '1'}
                    className="thread-priority-badge"
                  >
                    Priority: {thread.priority}
                  </Badge>
                </FlexBox>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ThreadDecompositionVisualizer;