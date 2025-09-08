import { useState, useEffect } from 'react';

export const useBusSearch = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchBuses = async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = new URLSearchParams();
      if (filters.from) searchParams.append('from', filters.from);
      if (filters.to) searchParams.append('to', filters.to);
      if (filters.searchQuery) searchParams.append('searchQuery', filters.searchQuery);

      const url = searchParams.toString() 
        ? `http://localhost:4000/buses/search?${searchParams}`
        : 'http://localhost:4000/buses';

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to search buses');
      
      const data = await response.json();
      setBuses(data.buses || data);
      
      return data;
    } catch (err) {
      setError(err.message);
      setBuses([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAllBuses = async () => {
    return searchBuses();
  };

  return {
    buses,
    loading,
    error,
    searchBuses,
    getAllBuses
  };
};

export const useBusDetails = (busId) => {
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBusDetails = async () => {
    if (!busId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:4000/buses/${busId}`);
      if (!response.ok) throw new Error('Failed to fetch bus details');
      
      const data = await response.json();
      setBus(data);
      return data;
    } catch (err) {
      setError(err.message);
      setBus(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBusDetailsEffect = async () => {
      if (!busId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:4000/buses/${busId}`);
        if (!response.ok) throw new Error('Failed to fetch bus details');
        
        const data = await response.json();
        setBus(data);
        return data;
      } catch (err) {
        setError(err.message);
        setBus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBusDetailsEffect();
    
    // Auto-refresh bus details every 2 seconds
    const interval = setInterval(fetchBusDetailsEffect, 2000);
    return () => clearInterval(interval);
  }, [busId]);

  return {
    bus,
    loading,
    error,
    refetch: fetchBusDetails
  };
};

export const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [liveStatus, setLiveStatus] = useState({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setConnected(true);
      setSocket(ws);
      ws.send(JSON.stringify({ type: "hello", text: "client connected" }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "snapshot") {
          const statusMap = {};
          message.payload.forEach((p) => {
            statusMap[p.id] = { 
              currentIndex: p.currentIndex, 
              currentStop: p.currentStop?.name,
              progress: p.progress 
            };
          });
          setLiveStatus(statusMap);
        } else if (message.type === "bus_update") {
          const p = message.payload;
          setLiveStatus((prev) => ({
            ...prev,
            [p.id]: { 
              currentIndex: p.currentIndex, 
              currentStop: p.currentStop?.name,
              progress: p.progress 
            },
          }));
        }
      } catch (error) {
        console.warn('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [url]);

  return {
    socket,
    liveStatus,
    connected
  };
};
