import React from 'react';
import {
  Card,
  CardHeader,
  FlexBox,
  Title,
  Text,
  ProgressIndicator,
  IllustratedMessage,

  List,


  Icon
} from '@ui5/webcomponents-react';
import Badge from '../Badge';
import { Ticket } from '../../models/types';
import './styles.css';

interface TicketStatisticsProps {
  tickets: Ticket[];
}

const TicketStatistics: React.FC<TicketStatisticsProps> = ({ tickets }) => {
  // Calculate statistics
  const totalTickets = tickets.length;
  
  // Count tickets by complexity
  const complexityCount = {
    High: 0,
    Medium: 0,
    Low: 0
  };
  
  // Count tickets by recommended action
  const actionCount = {
    CRP: 0,
    Standard: 0
  };
  
  // Count tickets by urgency
  const urgencyCount = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0
  };
  
  // Count skill requirements
  const skillCount: Record<string, number> = {};
  
  tickets.forEach(ticket => {
    if (ticket.aiClassification) {
      // Count by complexity
      const complexity = ticket.aiClassification.complexityEstimate;
      complexityCount[complexity]++;
      
      // Count by recommended action
      const action = ticket.aiClassification.recommendedAction;
      actionCount[action]++;
      
      // Count skills
      ticket.aiClassification.skillTags.forEach(skill => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    }
    
    // Count by urgency
    urgencyCount[ticket.urgency]++;
  });
  
  // Sort skills by frequency
  const topSkills = Object.entries(skillCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Calculate CRP percentage
  const crpPercentage = totalTickets > 0 
    ? Math.round((actionCount.CRP / totalTickets) * 100) 
    : 0;
  
  if (totalTickets === 0) {
    return (
      <Card className="statistics-card">
        <CardHeader titleText="Ticket Statistics" />
        <div className="statistics-empty">
          <IllustratedMessage
            name="NoData"
            titleText="No tickets available"
            subtitleText="Statistics will appear when tickets are loaded"
          />
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="statistics-card">
      <CardHeader titleText="Ticket Statistics" />
      
      <div className="statistics-content">
        <div className="statistics-summary">
          <div className="stat-item">
            <Text className="stat-label">Total Tickets</Text>
            <Title level="H2">{totalTickets}</Title>
          </div>
          
          <div className="stat-item">
            <Text className="stat-label">CRP Recommended</Text>
            <FlexBox alignItems="Center" justifyContent="SpaceBetween">
              <Title level="H2">{actionCount.CRP}</Title>
              <Badge>{crpPercentage}%</Badge>
            </FlexBox>
          </div>
        </div>
        
        <div className="statistics-detail">
          <Title level="H5">Complexity Distribution</Title>
          <div className="complexity-bars">
            <div className="complexity-bar">
              <FlexBox alignItems="Center" justifyContent="SpaceBetween">
                <Text>High</Text>
                <Badge className="complexity-badge complexity-high">{complexityCount.High}</Badge>
              </FlexBox>
              <ProgressIndicator 
                value={totalTickets > 0 ? (complexityCount.High / totalTickets) * 100 : 0} 
                valueState="Negative"
              />
            </div>
            
            <div className="complexity-bar">
              <FlexBox alignItems="Center" justifyContent="SpaceBetween">
                <Text>Medium</Text>
                <Badge className="complexity-badge complexity-medium">{complexityCount.Medium}</Badge>
              </FlexBox>
              <ProgressIndicator 
                value={totalTickets > 0 ? (complexityCount.Medium / totalTickets) * 100 : 0} 
                valueState="Critical"
              />
            </div>
            
            <div className="complexity-bar">
              <FlexBox alignItems="Center" justifyContent="SpaceBetween">
                <Text>Low</Text>
                <Badge className="complexity-badge complexity-low">{complexityCount.Low}</Badge>
              </FlexBox>
              <ProgressIndicator 
                value={totalTickets > 0 ? (complexityCount.Low / totalTickets) * 100 : 0} 
                valueState="Positive"
              />
            </div>
          </div>
          
          <Title level="H5" className="top-skills-title">Top Required Skills</Title>
          <List className="top-skills-list">
            {topSkills.map(([skill, count]) => (
              <li key={skill} className="ui5-list-item">
                <FlexBox alignItems="Center" justifyContent="SpaceBetween">
                  <Badge className={`skill-badge skill-${skill.toLowerCase()}`}>{skill}</Badge>
                  <Text>{count} tickets</Text>
                </FlexBox>
              </li>
            ))}
          </List>
        </div>
      </div>
    </Card>
  );
};



export default TicketStatistics;