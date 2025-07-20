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
      
      // Get all available engineers (not just leads) for experience-based assignment
      const allAvailableEngineers = mockEngineers.filter(
        engineer => engineer.availability === 'Available'
      );

      // Calculate experience score for each engineer
      const matches = allAvailableEngineers.map(engineer => {
        let experienceScore = 0;
        let primarySkill: string | null = null;
        let highestExpertise = 0;
        let totalExpertise = 0;
        let skillCount = 0;
        
        // Calculate total expertise and find primary skill
        ticket.aiClassification!.skillTags.forEach(skill => {
          const expertiseLevel = engineer.expertise[skill] || 0;
          if (expertiseLevel > 0) {
            totalExpertise += expertiseLevel;
            skillCount++;
            
            if (expertiseLevel > highestExpertise) {
              highestExpertise = expertiseLevel;
              primarySkill = skill;
            }
          }
        });
        
        // Calculate experience score based on:
        // 1. Average expertise across required skills (60%)
        // 2. Skill coverage (how many required skills they have) (25%)
        // 3. Lead engineer bonus (15%)
        const averageExpertise = skillCount > 0 ? totalExpertise / skillCount : 0;
        const skillCoverage = skillCount / ticket.aiClassification!.skillTags.length;
        const leadBonus = engineer.isLeadEngineer ? 20 : 0;
        
        experienceScore = (averageExpertise * 0.6) + (skillCoverage * 100 * 0.25) + leadBonus;
        
        return {
          engineer,
          dominanceScore: experienceScore / 100, // Keep for compatibility
          primarySkill
        };
      });
      
      // Filter engineers with some relevant experience
      const qualifiedMatches = matches.filter(item => item.dominanceScore > 0);
      
      // Sort by experience score (descending) and prefer lead engineers
      qualifiedMatches.sort((a, b) => {
        if (b.dominanceScore !== a.dominanceScore) {
          return b.dominanceScore - a.dominanceScore;
        }
        // Prefer lead engineers
        if (a.engineer.isLeadEngineer && !b.engineer.isLeadEngineer) return -1;
        if (!a.engineer.isLeadEngineer && b.engineer.isLeadEngineer) return 1;
        // Prefer lower workload
        return a.engineer.currentWorkload - b.engineer.currentWorkload;
      });
      
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
          <Text>Finding most experienced engineer...</Text>
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
          <Text>No qualified engineers available with relevant experience.</Text>
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
          <div className="experience-info">
            <Text>Primary Skill: <Badge className={`skill-badge skill-${bestMatch.primarySkill?.toLowerCase()}`}>{bestMatch.primarySkill}</Badge></Text>
            <Text>Experience Score: {Math.round(bestMatch.dominanceScore * 100)}%</Text>
            <ProgressIndicator 
              value={bestMatch.dominanceScore * 100} 
              valueState="Positive"
            />
            <Text className="assignment-reason">
              {selectedEngineer.isLeadEngineer ? "✓ Lead Engineer with Most Relevant Experience" : "✓ Most Experienced Available Engineer"}
            </Text>
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