import React, { createContext, useContext, useEffect, useState } from 'react';

interface RealtimeEvent {
  type: string;
  order?: any;
  message?: string;
  timestamp: string;
}

interface RealtimeContextType {
  isConnected: boolean;
  lastEvent: RealtimeEvent | null;
  notifications: string[];
  clearNotifications: () => void;
  eventCounter: number;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [eventCounter, setEventCounter] = useState(0);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/orders/realtime-stream');

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.type === 'CONNECTED') {
              setIsConnected(true);
              return;
            }

            if (data.type === 'ORDER_CREATED' || data.type === 'ORDER_STATUS_UPDATED') {
              const evt: RealtimeEvent = {
                type: data.type,
                order: data.order,
                message: data.message,
                timestamp: new Date().toLocaleTimeString('vi-VN'),
              };
              setLastEvent(evt);
              setEventCounter(c => c + 1);

              if (data.message) {
                setNotifications(prev => [data.message, ...prev.slice(0, 4)]);
              }
            }
          } catch (err) {
            console.error('Error parsing SSE event:', err);
          }
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();
          // Thu ket noi lai sau 5 giay
          reconnectTimeout = setTimeout(connectSSE, 5000);
        };
      } catch (err) {
        console.error('Failed to initialize SSE:', err);
        setIsConnected(false);
      }
    };

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        lastEvent,
        notifications,
        clearNotifications,
        eventCounter,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
