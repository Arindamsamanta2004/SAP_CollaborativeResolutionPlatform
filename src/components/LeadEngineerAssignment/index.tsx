import React, { useState, useEffect } from 'react';
import { 
  FlexBox, 
  Title, 
  Text, 
  Avatar, 
  ProgressIndicator,
  Card,
  CardHeader,
  List,

} from '@ui5/webcomponents-react';
import Badge from '../Badge';
import { Ticket, Engineer } from '../../models/types';
import { findLeadEngineerForTicket } from '../../utils/dataUtils';
import { mockEngineers } from '../../models/mockData/engineers';
import './styles.css';

interface LeadEngineerAssignmentProps {
  ticket: Ticket;
}

interface EngineerMatch {
  engineer: Engineer;
  dominanceScore: number;
  primarySkill: string | null;
}

const LeadEngineerAssignment: React.FC<LeadEngineerAssignmentProps> = ({ ticket }) => {
  const [loading, setLoading] = useState(true);
  const [engineerMatches, setEngineerMatches] = useState<EngineerMatch[]>([]);
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);

  useEffect(() => {
    // Simulate AI processing to find the best lead engineer
    const findBestMatch = async () => {
      setLoading(true);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!ticket.aiClassification?.skillTags || ticket.aiClassification.skillTags.length === 0) {
        setLoading(false);
        return;
      }
      
      // Get lead engineers who are available
      const availableLeads = mockEngineers.filter(
        engineer => engineer.isLeadEngineer && engineer.availability === 'Available'
      );
      
      if (availableLeads.length === 0) {
        setLoading(false);
        return;
      }
      
      // Calculate dominance score for each lead engineer
      const matches = availableLeads.map(lead => {
        let dominanceScore = 0;
        let primarySkill: string | null = null;
        let highestExpertise = 0;
        
        // Find the lead's primary skill among the required skills
        ticket.aiClassification!.skillTags.forEach(skill => {
          const expertiseLevel = lead.expertise[skill] || 0;
          if (expertiseLevel > highestExpertise) {
            highestExpertise = expertiseLevel;
            primarySkill = skill;
          }
        });
        
        // Calculate dominance percentage (primary skill expertise vs. total expertise)
        if (primarySkill) {
          const totalExpertise = ticket.aiClassification!.skillTags.reduce(
            (sum, skill) => sum + (lead.expertise[skill] || 0), 
            0
          );
          
          dominanceScore = totalExpertise > 0 
            ? (lead.expertise[primarySkill] || 0) / totalExpertise 
            : 0;
        }
        
        return {
          engineer: lead,
          dominanceScore,
          primarySkill
        };
      });
      
      // Filter leads with at least 70% dominance in one skill
      const qualifiedMatches = matches.filter(item => item.dominanceScore >= 0.7);
      
      // Sort by dominance score (descending)
      qualifiedMatches.sort((a, b) => b.dominanceScore - a.dominanceScore);
      
      setEngineerMatches(qualifiedMatches);
      setSelectedEngineer(qualifiedMatches.length > 0 ? qualifiedMatches[0].engineer : null);
      setLoading(false);
    };
    
    findBestMatch();
  }, [ticket]);

  if (loading) {
    return (
      <Card className="lead-assignment-card">
        <CardHeader titleText="Lead Engineer Assignment" />
        <div className="lead-assignment-loading">
          <Text>Analyzing skill dominance...</Text>
          <ProgressIndicator value={50} />
        </div>
      </Card>
    );
  }

  if (!selectedEngineer) {
    return (
      <Card className="lead-assignment-card">
        <CardHeader titleText="Lead Engineer Assignment" />
        <div className="lead-assignment-empty">
          <Text>No qualified lead engineer found with 70% skill dominance.</Text>
        </div>
      </Card>
    );
  }

  const bestMatch = engineerMatches.find(match => match.engineer.id === selectedEngineer.id);

  return (
    <Card className="lead-assignment-card">
      <CardHeader titleText="Lead Engineer Assignment" />
      
      <div className="lead-assignment-content">
        <div className="lead-engineer-info">
          <Avatar 
            shape="Circle"
            size="L"
          >
            {selectedEngineer.avatar && <img src={selectedEngineer.avatar} alt={selectedEngineer.name} />}
          </Avatar>
          <div className="lead-engineer-details">
            <Title level="H5">{selectedEngineer.name}</Title>
            <Badge className={`availability-badge availability-${selectedEngineer.availability.toLowerCase()}`}>
              {selectedEngineer.availability}
            </Badge>
            <Text>{selectedEngineer.department}</Text>
          </div>
        </div>
        
        {bestMatch && (
          <div className="dominance-info">
            <Text>Primary Skill: <Badge className={`skill-badge skill-${bestMatch.primarySkill?.toLowerCase()}`}>{bestMatch.primarySkill}</Badge></Text>
            <Text>Skill Dominance: {Math.round(bestMatch.dominanceScore * 100)}%</Text>
            <ProgressIndicator 
              value={bestMatch.dominanceScore * 100} 
              valueState={bestMatch.dominanceScore >= 0.7 ? "Positive" : "Critical"}
            />
            <Text className="dominance-rule">70% Rule: {bestMatch.dominanceScore >= 0.7 ? "✓ Qualified" : "✗ Not Qualified"}</Text>
          </div>
        )}
        
        <div className="skill-expertise">
          <Title level="H6">Expertise Breakdown</Title>
          <List>
            {ticket.aiClassification?.skillTags.map(skill => (
              <li key={skill} className="ui5-list-item">
                <FlexBox alignItems="Center" justifyContent="SpaceBetween">
                  <Badge className={`skill-badge skill-${skill.toLowerCase()}`}>{skill}</Badge>
                  <Text>{selectedEngineer.expertise[skill] || 0}%</Text>
                </FlexBox>
              </li>
            ))}
          </List>
        </div>
      </div>
    </Card>
  );
};

export default LeadEngineerAssignment;