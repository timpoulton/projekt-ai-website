import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LogViewer from '../components/LogViewer';
import './Dashboard.css';

const Dashboard = () => {
  const [status, setStatus] = useState('idle');
  const [lastProcessed, setLastProcessed] = useState(null);
  const [stats, setStats] = useState({
    totalProcessed: 0,
    successCount: 0,
    errorCount: 0
  });
  const [logs, setLogs] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    date: getTodayString(),
    hour: 12,
    minute: 0,
    durationMinutes: 60
  });

  useEffect(() => {
    Promise.all([
      fetchStatus(),
      fetchLogs(),
      fetchSchedules()
    ]).finally(() => setLoading(false));
    
    // Set up polling for status and logs
    const statusInterval = setInterval(fetchStatus, 5000);
    const logsInterval = setInterval(fetchLogs, 5000);
    
    return () => {
      clearInterval(statusInterval);
      clearInterval(logsInterval);
    };
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status');
      if (!response.ok) throw new Error('Failed to fetch status');
      const data = await response.json();
      setStatus(data.status || 'idle');
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs?limit=50');
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedules');
      if (!response.ok) throw new Error('Failed to fetch schedules');
      const data = await response.json();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to fetch schedules');
    }
  };
  
  const handleRecordingAction = async (action) => {
    try {
      const response = await fetch(`/api/recording/${action}`, { method: 'POST' });
      if (!response.ok) throw new Error(`Failed to ${action} recording`);
      fetchStatus();
      fetchLogs();
    } catch (err) {
      console.error(`Error ${action} recording:`, err);
      alert(`Failed to ${action} recording: ${err.message}`);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule(prev => ({
      ...prev,
      [name]: name === 'name' || name === 'date' ? value : parseInt(value, 10)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSchedule)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create schedule');
      }
      
      // Reset form
      setNewSchedule({
        name: '',
        date: getTodayString(),
        hour: 12,
        minute: 0,
        durationMinutes: 60
      });
      
      // Refresh schedules
      fetchSchedules();
    } catch (err) {
      console.error('Error creating schedule:', err);
      alert('Failed to create schedule: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }
      
      fetchSchedules();
    } catch (err) {
      console.error('Error deleting schedule:', err);
      alert('Failed to delete schedule: ' + err.message);
    }
  };

  // Group schedules by date
  const schedulesByDate = schedules.reduce((groups, schedule) => {
    const date = schedule.date || 'Unknown';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(schedule);
    return groups;
  }, {});

  // Add new handlers for manual actions
  const handleProcessRecordings = async () => {
    try {
      const response = await fetch('/api/recordings/process', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to process recordings');
      }
      
      // Refresh status and logs after processing
      await Promise.all([
        fetchStatus(),
        fetchLogs()
      ]);
      
    } catch (err) {
      console.error('Error processing recordings:', err);
      alert('Failed to process recordings: ' + err.message);
    }
  };

  const handleSyncGoogleSheet = async () => {
    try {
      const response = await fetch('/api/sheets/sync', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync Google Sheet');
      }
      
      // Refresh logs after sync
      await fetchLogs();
      
    } catch (err) {
      console.error('Error syncing Google Sheet:', err);
      alert('Failed to sync Google Sheet: ' + err.message);
    }
  };

  return (
    <div className="container dashboard">
      <section className="status-section">
        <h1>Recording Management Dashboard</h1>
        
        <div className="status-cards">
          <div className="card status-card">
            <h2>System Status</h2>
            <div className={`status-indicator ${status}`}>
              {status === 'processing' ? 'Processing' : 
               status === 'idle' ? 'Idle' : 
               status === 'error' ? 'Error' : 'Unknown'}
            </div>
            {lastProcessed && (
              <p className="last-processed">
                Last processed: <span>{lastProcessed}</span>
              </p>
            )}
          </div>
          
          <div className="card stats-card">
            <h2>Statistics</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{stats.totalProcessed}</span>
                <span className="stat-label">Total Processed</span>
              </div>
              <div className="stat-item">
                <span className="stat-value success">{stats.successCount}</span>
                <span className="stat-label">Successful</span>
              </div>
              <div className="stat-item">
                <span className="stat-value error">{stats.errorCount}</span>
                <span className="stat-label">Errors</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="actions-section">
        <div className="card">
          <h2>Manual Actions</h2>
          <div className="button-group">
            <button 
              className="button primary" 
              onClick={handleProcessRecordings}
            >
              Process New Recordings
            </button>
            <button 
              className="button secondary" 
              onClick={handleSyncGoogleSheet}
            >
              Sync Google Sheet
            </button>
          </div>
        </div>
      </section>
      
      <section className="logs-section">
        <LogViewer />
      </section>
    </div>
  );
};

// Helper functions
function getTodayString() {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

function formatTime(hour, minute) {
  return `${hour?.toString().padStart(2, '0') || '00'}:${minute?.toString().padStart(2, '0') || '00'}`;
}

function formatDateHeader(dateString) {
  if (!dateString || dateString === 'Unknown') return 'Unknown Date';
  
  const date = new Date(dateString);
  
  // Check if date is today
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  // Check if date is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  
  // Otherwise, format as "Tuesday, July 23"
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export default Dashboard;