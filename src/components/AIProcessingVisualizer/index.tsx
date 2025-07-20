import React from 'react';
import { 
  Card, 
  Title, 
  Text, 
  ProgressIndicator, 
  FlexBox, 
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems
} from '@ui5/webcomponents-react';
import Badge from '../Badge';
import './styles.css';

interface AIProcessingVisualizerProps {
  progress: number;
  stage: string;
  processingStages?: string[];
  complexityIndicator?: number;
  estimatedTime?: number;
}

/**
 * Component for visualizing AI processing with animated feedback
 */
const AIProcessingVisualizer: React.FC<AIProcessingVisualizerProps> = ({
  progress,
  stage,
  processingStages = [],
  complexityIndicator = 50,
  estimatedTime = 3000
}) => {
  // Calculate which stages are complete based on progress
  const stageProgress = processingStages.map((stageText, index) => {
    const stageThreshold = ((index + 1) / processingStages.length) * 100;
    return {
      text: stageText,
      complete: progress >= stageThreshold,
      active: progress < stageThreshold && 
              progress >= (index / processingStages.length) * 100
    };
  });
  
  // Determine complexity label
  const getComplexityLabel = () => {
    if (complexityIndicator >= 70) return 'High';
    if (complexityIndicator >= 40) return 'Medium';
    return 'Low';
  };

  // Get complexity badge color
  const getComplexityBadgeColor = () => {
    if (complexityIndicator >= 70) return '5';
    if (complexityIndicator >= 40) return '4';
    return '3';
  };

  // Get progress indicator state
  const getProgressState = () => {
    if (progress >= 80) return 'Positive';
    if (progress >= 40) return 'Information';
    return 'Critical';
  };
  
  return (
    <Card className="ai-processing-visualizer">
      <div className="ai-processing-content">
        <Title level="H4">AI Processing</Title>
        
        <div className="ai-processing-stage">
          <Text className="ai-stage-text">{stage}</Text>
          <ProgressIndicator 
            value={progress} 
            valueState={getProgressState()}
            className="ai-progress-bar"
            displayValue={`${progress}%`}
          />
        </div>
        
        <FlexBox direction={FlexBoxDirection.Row} className="ai-processing-details">
          <div className="ai-stages-section">
            <Title level="H5">Processing Stages</Title>
            <div className="ai-stages-container">
              {stageProgress.map((stageItem, index) => (
                <div 
                  key={index}
                  className={`ai-stage ${stageItem.complete ? 'complete' : ''} ${stageItem.active ? 'active' : ''}`}
                >
                  <div className="ai-stage-indicator"></div>
                  <Text>{stageItem.text}</Text>
                </div>
              ))}
            </div>
          </div>
          
          <div className="ai-metrics-section">
            <div className="ai-complexity-section">
              <Title level="H5">Complexity Analysis</Title>
              <FlexBox 
                direction={FlexBoxDirection.Row} 
                alignItems={FlexBoxAlignItems.Center}
                className="ai-complexity-display"
              >
                <ProgressIndicator
                  value={complexityIndicator}
                  className="ai-complexity-indicator"
                  valueState={complexityIndicator >= 70 ? 'Negative' : complexityIndicator >= 40 ? 'Critical' : 'Positive'}
                />
                <Badge colorScheme={getComplexityBadgeColor()}>
                  {getComplexityLabel()}
                </Badge>
              </FlexBox>
            </div>
            
            <div className="ai-metrics">
              <Title level="H5">Processing Metrics</Title>
              <div className="ai-metrics-grid">
                <div className="ai-metric">
                  <Text className="ai-metric-label">Est. Time</Text>
                  <Text className="ai-metric-value">
                    {(estimatedTime / 1000).toFixed(1)}s
                  </Text>
                </div>
                <div className="ai-metric">
                  <Text className="ai-metric-label">Confidence</Text>
                  <Text className="ai-metric-value">
                    {Math.max(60, 100 - complexityIndicator / 2)}%
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </FlexBox>
        
        <div className="ai-processing-animation">
          <div className="ai-processing-pulse"></div>
        </div>
      </div>
    </Card>
  );
};

export default AIProcessingVisualizer;