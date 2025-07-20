import React from 'react';
import { Grid } from '@ui5/webcomponents-react';
import { IssueThread } from '../../models/types';
import ThreadCard from '../ThreadCard';
import './styles.css';

interface ThreadCardListProps {
  threads: IssueThread[];
}

const ThreadCardList: React.FC<ThreadCardListProps> = ({ threads }) => {
  // Group threads by status for visual organization
  const openThreads = threads.filter(thread => thread.status === 'Open');
  const inProgressThreads = threads.filter(thread => thread.status === 'In Progress');
  const resolvedThreads = threads.filter(thread => thread.status === 'Resolved');

  return (
    <div className="thread-card-list">
      {/* Open Threads Section */}
      {openThreads.length > 0 && (
        <div className="thread-status-section">
          <div className="thread-status-header">
            <div className="thread-status-indicator open"></div>
            <span className="thread-status-title">Open Threads</span>
            <span className="thread-status-count">{openThreads.length}</span>
          </div>
          <Grid defaultSpan="XL6 L6 M12 S12" className="thread-grid">
            {openThreads.map(thread => (
              <ThreadCard key={thread.id} thread={thread} />
            ))}
          </Grid>
        </div>
      )}

      {/* In Progress Threads Section */}
      {inProgressThreads.length > 0 && (
        <div className="thread-status-section">
          <div className="thread-status-header">
            <div className="thread-status-indicator in-progress"></div>
            <span className="thread-status-title">In Progress</span>
            <span className="thread-status-count">{inProgressThreads.length}</span>
          </div>
          <Grid defaultSpan="XL6 L6 M12 S12" className="thread-grid">
            {inProgressThreads.map(thread => (
              <ThreadCard key={thread.id} thread={thread} />
            ))}
          </Grid>
        </div>
      )}

      {/* Resolved Threads Section */}
      {resolvedThreads.length > 0 && (
        <div className="thread-status-section">
          <div className="thread-status-header">
            <div className="thread-status-indicator resolved"></div>
            <span className="thread-status-title">Resolved</span>
            <span className="thread-status-count">{resolvedThreads.length}</span>
          </div>
          <Grid defaultSpan="XL6 L6 M12 S12" className="thread-grid">
            {resolvedThreads.map(thread => (
              <ThreadCard key={thread.id} thread={thread} />
            ))}
          </Grid>
        </div>
      )}

      {/* Empty State */}
      {threads.length === 0 && (
        <div className="thread-empty-state">
          <div className="thread-empty-icon">📋</div>
          <h3>No threads available</h3>
          <p>This ticket has not been decomposed into threads yet.</p>
        </div>
      )}
    </div>
  );
};

export default ThreadCardList;