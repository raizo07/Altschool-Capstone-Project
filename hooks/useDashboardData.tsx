import { useState, useEffect } from 'react'; // Import useState and useEffect hooks from React for state and side effects management
import { useSocket } from '@/components/layout/socket-provider'; // Import custom hook to manage WebSocket connections
import { DashboardData } from "@/types/dashboard"; // Import type definition for DashboardData

/**
 * Custom hook to fetch and manage dashboard data.
 * Utilizes WebSocket for real-time data updates and manages loading and error states.
 *
 * @returns {Object} - Returns the dashboard data, loading state, and any error encountered.
 */
export const useDashboardData = () => {
  // State to store the fetched dashboard data
  const [data, setData] = useState<DashboardData | null>(null);

  // State to manage the loading state of the data fetching process
  const [isLoading, setIsLoading] = useState(true);

  // State to store any errors that occur during data fetching
  const [error, setError] = useState<Error | null>(null);

  // Destructure socket instance and connection status from the custom socket hook
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (isConnected && socket) {
      // Emit an event to request the initial dashboard data once connected
      socket.emit('getDashboardData');

      // Listen for incoming dashboard data and update the state
      socket.on('dashboardData', (newData: DashboardData) => {
        setData(newData);
        setIsLoading(false);
      });

      // Listen for any errors and update the error state
      socket.on('dashboardError', (err: string) => {
        setError(new Error(err));
        setIsLoading(false);
      });
    }

    // Cleanup function to remove socket event listeners when the component unmounts or dependencies change
    return () => {
      if (socket) {
        socket.off('dashboardData');
        socket.off('dashboardError');
      }
    };
  }, [socket, isConnected]); // Dependency array ensures effect runs when socket or connection status changes

  // Return the current state of the data, loading status, and any errors encountered
  return { data, isLoading, error };
};
