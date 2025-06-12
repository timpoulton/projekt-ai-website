import { useState, useEffect, useRef } from 'react';
import './LogViewer.css';

const LogViewer = () => {
  const [logs, setLogs] = useState([
    {
      level: 'info',
      message: 'Application started',
      timestamp: new Date().toISOString()
    }
  ]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [wsDisabled, setWsDisabled] = useState(false);
  const logContainerRef = useRef(null);
  
  useEffect(() => {
    // Only try to connect if not disabled
    if (wsDisabled) return;
    
    // Connect to WebSocket
    let ws;
    try {
      ws = new WebSocket(`ws://${window.location.hostname}:3001`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        setError(null);
      };
      
      ws.onmessage = (event) => {
        try {
          const log = JSON.parse(event.data);
          setLogs(prevLogs => [...prevLogs, log]);
        } catch (err) {
          console.error('Failed to parse log message:', err);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection failed. Using static logs instead.');
        setConnected(false);
        setWsDisabled(true);
        
        // Add a fallback log message when WebSocket fails
        setLogs(prevLogs => [
          ...prevLogs,
          {
            level: 'warning',
            message: 'WebSocket connection failed. Showing static logs only.',
            timestamp: new Date().toISOString()
          }
        ]);
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setWsDisabled(true);
    }
    
    return () => {
      if (ws) ws.close();
    };
  }, [wsDisabled]);
  
  // Simulate some example logs if WebSocket is disabled
  useEffect(() => {
    if (wsDisabled) {
      const timer = setInterval(() => {
        // Add a new fake log entry every 5 seconds
        const levels = ['info', 'warning', 'error'];
        const level = levels[Math.floor(Math.random() * levels.length)];
        const messages = [
          'Processing recording file',
          'User logged in',
          'Sync completed successfully',
          'Connection established',
          'File upload completed'
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        setLogs(prevLogs => [
          ...prevLogs,
          {
            level,
            message: message + ' (simulated log)',
            timestamp: new Date().toISOString()
          }
        ]);
      }, 5000);
      
      return () => clearInterval(timer);
    }
  }, [wsDisabled]);
  
  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="log-viewer-card">
      <div className="log-header">
        <h2>System Logs</h2>
        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? 'Connected' : wsDisabled ? 'Static Logs' : 'Disconnected'}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="log-container" ref={logContainerRef}>
        {logs.length === 0 ? (
          <p className="no-logs">No logs available. Waiting for events...</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`log-entry ${log.level}`}>
              <span className="log-timestamp">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className="log-level">{log.level.toUpperCase()}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogViewer; 