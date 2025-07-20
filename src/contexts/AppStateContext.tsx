import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Engineer, Ticket, IssueThread } from '../models/types';
import { mockEngineers } from '../models/mockData/engineers';
import { mockTickets } from '../models/mockData/tickets';
import { WebSocketService } from '../services/websocket/WebSocketService';

// Define the shape of our global application state
interface AppState {
  engineers: Engineer[];
  activeTickets: Ticket[];
  resolvedTickets: Ticket[];
  activeThreads: IssueThread[];
  lastActivity: Date;
  isConnected: boolean;
}

// Define the context type
interface AppStateContextType {
  appState: AppState;
  updateEngineerAvailability: (engineerId: string, availability: 'Available' | 'Busy' | 'Offline') => void;
  updateEngineerWorkload: (engineerId: string, workload: number) => void;
  assignThreadToEngineer: (threadId: string, engineerId: string) => void;
  completeThread: (threadId: string, solution: string) => void;
  refreshAppState: () => void;
  isConnected: boolean;
  reconnect: () => void;
}

// Create the context
const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// WebSocket service instance
const wsService = new WebSocketService();

// Provider component
interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  // Initialize state from localStorage or with default values
  const [appState, setAppState] = useState<AppState>(() => {
    const savedState = localStorage.getItem('sap_crp_app_state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Convert string dates back to Date objects
        return {
          ...parsedState,
          lastActivity: new Date(parsedState.lastActivity)
        };
      } catch (error) {
        console.error('Error parsing saved app state:', error);
      }
    }

    // Default initial state - start with no resolved tickets for clean demo
    return {
      engineers: [...mockEngineers],
      activeTickets: mockTickets.filter(ticket => ticket.status !== 'Resolved'),
      resolvedTickets: [], // Start with no resolved tickets on first launch
      activeThreads: mockTickets
        .filter(ticket => ticket.threads)
        .flatMap(ticket => ticket.threads || []),
      lastActivity: new Date(),
      isConnected: false
    };
  });

  // Track connection state
  const [isConnected, setIsConnected] = useState(false);

  // Effect to initialize WebSocket connection
  useEffect(() => {
    // Set up WebSocket event handlers
    wsService.onConnect(() => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    wsService.onDisconnect(() => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    wsService.onMessage((message) => {
      console.log('WebSocket message received:', message);
      handleWebSocketMessage(message);
    });

    // Connect to WebSocket
    wsService.connect();

    // Clean up on unmount
    return () => {
      wsService.disconnect();
    };
  }, []);

  // Effect to persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sap_crp_app_state', JSON.stringify(appState));
  }, [appState]);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'ENGINEER_UPDATE':
        setAppState(prevState => ({
          ...prevState,
          engineers: prevState.engineers.map(eng =>
            eng.id === message.data.id ? { ...eng, ...message.data } : eng
          ),
          lastActivity: new Date()
        }));
        break;

      case 'TICKET_UPDATE':
        setAppState(prevState => {
          const updatedActiveTickets = prevState.activeTickets.map(ticket =>
            ticket.id === message.data.id ? { ...ticket, ...message.data } : ticket
          );

          // If ticket status changed to Resolved, move it to resolvedTickets
          if (message.data.status === 'Resolved') {
            const ticketToMove = updatedActiveTickets.find(t => t.id === message.data.id);
            if (ticketToMove) {
              return {
                ...prevState,
                activeTickets: updatedActiveTickets.filter(t => t.id !== message.data.id),
                resolvedTickets: [...prevState.resolvedTickets, { ...ticketToMove, ...message.data }],
                lastActivity: new Date()
              };
            }
          }

          return {
            ...prevState,
            activeTickets: updatedActiveTickets,
            lastActivity: new Date()
          };
        });
        break;

      case 'THREAD_UPDATE':
        setAppState(prevState => ({
          ...prevState,
          activeThreads: prevState.activeThreads.map(thread =>
            thread.id === message.data.id ? { ...thread, ...message.data } : thread
          ),
          lastActivity: new Date()
        }));
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  };

  // Update engineer availability
  const updateEngineerAvailability = (engineerId: string, availability: 'Available' | 'Busy' | 'Offline') => {
    setAppState(prevState => ({
      ...prevState,
      engineers: prevState.engineers.map(eng =>
        eng.id === engineerId ? { ...eng, availability } : eng
      ),
      lastActivity: new Date()
    }));

    // Broadcast the change via WebSocket
    wsService.send({
      type: 'ENGINEER_UPDATE',
      data: {
        id: engineerId,
        availability
      }
    });
  };

  // Update engineer workload
  const updateEngineerWorkload = (engineerId: string, workload: number) => {
    setAppState(prevState => ({
      ...prevState,
      engineers: prevState.engineers.map(eng =>
        eng.id === engineerId ? { ...eng, currentWorkload: workload } : eng
      ),
      lastActivity: new Date()
    }));

    // Broadcast the change via WebSocket
    wsService.send({
      type: 'ENGINEER_UPDATE',
      data: {
        id: engineerId,
        currentWorkload: workload
      }
    });
  };

  // Assign thread to engineer
  const assignThreadToEngineer = (threadId: string, engineerId: string) => {
    // Update the thread
    setAppState(prevState => {
      const updatedThreads = prevState.activeThreads.map(thread =>
        thread.id === threadId
          ? {
            ...thread,
            assignedEngineerId: engineerId,
            status: 'In Progress' as const,
            updatedAt: new Date()
          }
          : thread
      );

      // Find the engineer and update workload
      const engineer = prevState.engineers.find(eng => eng.id === engineerId);
      let updatedEngineers = [...prevState.engineers];

      if (engineer) {
        // Increase workload by 10-20% when taking a new thread
        const workloadIncrease = Math.floor(Math.random() * 11) + 10; // 10-20
        const newWorkload = Math.min(100, engineer.currentWorkload + workloadIncrease);

        updatedEngineers = prevState.engineers.map(eng =>
          eng.id === engineerId
            ? {
              ...eng,
              currentWorkload: newWorkload,
              availability: newWorkload >= 80 ? 'Busy' : 'Available'
            }
            : eng
        );
      }

      return {
        ...prevState,
        activeThreads: updatedThreads,
        engineers: updatedEngineers,
        lastActivity: new Date()
      };
    });

    // Broadcast the thread assignment via WebSocket
    wsService.send({
      type: 'THREAD_UPDATE',
      data: {
        id: threadId,
        assignedEngineerId: engineerId,
        status: 'In Progress'
      }
    });
  };

  // Complete a thread with solution
  const completeThread = (threadId: string, solution: string) => {
    setAppState(prevState => {
      // Update the thread
      const updatedThreads = prevState.activeThreads.map(thread =>
        thread.id === threadId
          ? {
            ...thread,
            status: 'Resolved' as const,
            solution,
            updatedAt: new Date()
          }
          : thread
      );

      // Find the engineer and update workload
      const thread = prevState.activeThreads.find(t => t.id === threadId);
      let updatedEngineers = [...prevState.engineers];

      if (thread && thread.assignedEngineerId) {
        const engineer = prevState.engineers.find(eng => eng.id === thread.assignedEngineerId);

        if (engineer) {
          // Decrease workload by 10-20% when completing a thread
          const workloadDecrease = Math.floor(Math.random() * 11) + 10; // 10-20
          const newWorkload = Math.max(0, engineer.currentWorkload - workloadDecrease);

          updatedEngineers = prevState.engineers.map(eng =>
            eng.id === thread.assignedEngineerId
              ? {
                ...eng,
                currentWorkload: newWorkload,
                availability: newWorkload < 80 ? 'Available' : 'Busy'
              }
              : eng
          );
        }
      }

      // Check if all threads for a ticket are resolved
      const completedThread = prevState.activeThreads.find(t => t.id === threadId);
      if (completedThread) {
        const parentTicketId = completedThread.parentTicketId;
        const allThreadsForTicket = updatedThreads.filter(t => t.parentTicketId === parentTicketId);
        const allThreadsResolved = allThreadsForTicket.every(t => t.status === 'Resolved');

        // If all threads are resolved, update the parent ticket status
        if (allThreadsResolved) {
          const updatedActiveTickets = prevState.activeTickets.map(ticket =>
            ticket.id === parentTicketId
              ? {
                ...ticket,
                status: 'Resolved' as const,
                updatedAt: new Date(),
                resolvedAt: new Date()
              }
              : ticket
          );

          // Move the ticket to resolved tickets
          const ticketToMove = updatedActiveTickets.find(t => t.id === parentTicketId);

          if (ticketToMove) {
            return {
              ...prevState,
              activeTickets: updatedActiveTickets.filter(t => t.id !== parentTicketId),
              resolvedTickets: [...prevState.resolvedTickets, ticketToMove],
              activeThreads: updatedThreads,
              engineers: updatedEngineers,
              lastActivity: new Date()
            };
          }
        }
      }

      return {
        ...prevState,
        activeThreads: updatedThreads,
        engineers: updatedEngineers,
        lastActivity: new Date()
      };
    });

    // Broadcast the thread completion via WebSocket
    wsService.send({
      type: 'THREAD_UPDATE',
      data: {
        id: threadId,
        status: 'Resolved',
        solution
      }
    });
  };

  // Refresh app state (useful after major changes or for demo reset)
  const refreshAppState = () => {
    setAppState({
      engineers: [...mockEngineers],
      activeTickets: mockTickets.filter(ticket => ticket.status !== 'Resolved'),
      resolvedTickets: [], // Reset to no resolved tickets for clean demo restart
      activeThreads: mockTickets
        .filter(ticket => ticket.threads)
        .flatMap(ticket => ticket.threads || []),
      lastActivity: new Date(),
      isConnected
    });
  };

  // Reconnect to WebSocket
  const reconnect = () => {
    wsService.reconnect();
  };

  // Context value
  const value = {
    appState,
    updateEngineerAvailability,
    updateEngineerWorkload,
    assignThreadToEngineer,
    completeThread,
    refreshAppState,
    isConnected,
    reconnect
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

// Custom hook to use the app state context
export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};