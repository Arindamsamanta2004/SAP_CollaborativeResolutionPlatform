import React, { useState, useEffect } from 'react';
import { useAppState } from '../../contexts/AppStateContext';
import { Engineer } from '../../models/types';
import './styles.css';

/**
 * EngineerAvailabilityMonitor component displays real-time engineer availability
 * and workload updates with visual indicators.
 */
const EngineerAvailabilityMonitor: React.FC = () => {
  const { appState } = useAppState();
  const [recentUpdates, setRecentUpdates] = useState<{
    engineerId: string;
    timestamp: Date;
    type: 'availability' | 'workload';
    oldValue: string | number;
    newValue: string | number;
  }[]>([]);

  // Track engineer changes for visual indicators
  useEffect(() => {
    const engineerMap = new Map<string, Engineer>();
    
    // Initialize map with current engineers
    appState.engineers.forEach(eng => {
      engineerMap.set(eng.id, eng);
    });
    
    // Set up interval to check for changes
    const intervalId = setInterval(() => {
      let updates: {
        engineerId: string;
        timestamp: Date;
        type: 'availability' | 'workload';
        oldValue: string | number;
        newValue: string | number;
      }[] = [];
      
      // Check for changes in engineers
      appState.engineers.forEach(eng => {
        const oldEngineer = engineerMap.get(eng.id);
        
        if (oldEngineer) {
          // Check for availability change
          if (oldEngineer.availability !== eng.availability) {
            updates.push({
              engineerId: eng.id,
              timestamp: new Date(),
              type: 'availability',
              oldValue: oldEngineer.availability,
              newValue: eng.availability
            });
          }
          
          // Check for workload change
          if (oldEngineer.currentWorkload !== eng.currentWorkload) {
            updates.push({
              engineerId: eng.id,
              timestamp: new Date(),
              type: 'workload',
              oldValue: oldEngineer.currentWorkload,
              newValue: eng.currentWorkload
            });
          }
        }
        
        // Update map with current engineer
        engineerMap.set(eng.id, { ...eng });
      });
      
      // Add new updates to the list
      if (updates.length > 0) {
        setRecentUpdates(prev => {
          const newUpdates = [...updates, ...prev].slice(0, 5); // Keep only the 5 most recent updates
          return newUpdates;
        });
      }
    }, 1000); // Check every second
    
    return () => clearInterval(intervalId);
  }, [appState.engineers]);

  // Get availability color
  const getAvailabilityColor = (availability: string): string => {
    switch (availability) {
      case 'Available':
        return '#2ecc71';
      case 'Busy':
        return '#f39c12';
      case 'Offline':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  // Get workload color
  const getWorkloadColor = (workload: number): string => {
    if (workload < 30) return '#2ecc71';
    if (workload < 70) return '#f39c12';
    return '#e74c3c';
  };

  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="engineer-availability-monitor">
      <h3>Engineer Availability Monitor</h3>
      
      <div className="engineer-list">
        {appState.engineers.map(engineer => (
          <div key={engineer.id} className="engineer-item">
            <div className="engineer-avatar">
              <img src={engineer.avatar || 'https://i.pravatar.cc/150?img=0'} alt={engineer.name} />
              <span 
                className="availability-indicator" 
                style={{ backgroundColor: getAvailabilityColor(engineer.availability) }}
              ></span>
            </div>
            <div className="engineer-info">
              <div className="engineer-name">{engineer.name}</div>
              <div className="engineer-status">{engineer.availability}</div>
              <div className="workload-bar-container">
                <div 
                  className="workload-bar" 
                  style={{ 
                    width: `${engineer.currentWorkload}%`,
                    backgroundColor: getWorkloadColor(engineer.currentWorkload)
                  }}
                ></div>
                <span className="workload-text">{engineer.currentWorkload}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="recent-updates">
        <h4>Recent Updates</h4>
        {recentUpdates.length === 0 ? (
          <div className="no-updates">No recent updates</div>
        ) : (
          <ul className="update-list">
            {recentUpdates.map((update, index) => {
              const engineer = appState.engineers.find(eng => eng.id === update.engineerId);
              return (
                <li key={index} className="update-item">
                  <span className="update-time">{formatTimestamp(update.timestamp)}</span>
                  <span className="update-engineer">{engineer?.name}</span>
                  <span className="update-type">
                    {update.type === 'availability' ? 'availability' : 'workload'}
                  </span>
                  <span className="update-change">
                    {update.type === 'availability' ? (
                      <>
                        <span className="old-value" style={{ color: getAvailabilityColor(update.oldValue as string) }}>
                          {update.oldValue}
                        </span>
                        {' → '}
                        <span className="new-value" style={{ color: getAvailabilityColor(update.newValue as string) }}>
                          {update.newValue}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="old-value" style={{ color: getWorkloadColor(update.oldValue as number) }}>
                          {update.oldValue}%
                        </span>
                        {' → '}
                        <span className="new-value" style={{ color: getWorkloadColor(update.newValue as number) }}>
                          {update.newValue}%
                        </span>
                      </>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EngineerAvailabilityMonitor;