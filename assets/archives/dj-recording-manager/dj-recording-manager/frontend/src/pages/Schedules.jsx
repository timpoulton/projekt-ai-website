import React, { useState, useEffect } from 'react';

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state for one-time recordings
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    date: getTodayString(),
    hour: 12,
    minute: 0,
    durationMinutes: 60
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  // React fetch function
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/schedules');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch schedules: ${response.status}`);
      }
      
      const data = await response.json();
      setSchedules(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to fetch schedules: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // React event handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule(prev => ({
      ...prev,
      [name]: name === 'name' || name === 'date' ? value : parseInt(value, 10)
    }));
  };
  
  // React form submission handler
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
      
      // Reset form using React state
      setNewSchedule({
        name: '',
        date: getTodayString(),
        hour: 12,
        minute: 0,
        durationMinutes: 60
      });
      
      // Refresh the schedules
      fetchSchedules();
    } catch (err) {
      console.error('Error creating schedule:', err);
      alert('Failed to create schedule: ' + err.message);
    }
  };

  // React handler for delete
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
      
      // Refresh the schedules using React state
      fetchSchedules();
    } catch (err) {
      console.error('Error deleting schedule:', err);
      alert('Failed to delete schedule: ' + err.message);
    }
  };

  // React data transformation
  const schedulesByDate = schedules.reduce((groups, schedule) => {
    const date = schedule.date || 'Unknown';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(schedule);
    return groups;
  }, {});

  // React JSX render
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Recording Schedules</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-xl font-semibold">Add New Recording</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Recording Name
              </label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={newSchedule.name}
                onChange={handleInputChange}
                required
                placeholder="Enter a name for this recording"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={newSchedule.date}
                onChange={handleInputChange}
                required
                min={getTodayString()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="hour" className="block text-sm font-medium text-gray-700 mb-1">
                  Hour
                </label>
                <select
                  id="hour"
                  name="hour"
                  value={newSchedule.hour}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="minute" className="block text-sm font-medium text-gray-700 mb-1">
                  Minute
                </label>
                <select
                  id="minute"
                  name="minute"
                  value={newSchedule.minute}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                id="durationMinutes"
                name="durationMinutes"
                value={newSchedule.durationMinutes}
                onChange={handleInputChange}
                min="1"
                max="1440"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="text-center">
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium transition-colors"
              >
                Add Recording
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-xl font-semibold">Upcoming Recordings</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">Loading schedules...</p>
            </div>
          ) : Object.keys(schedulesByDate).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No recordings scheduled</p>
              <p className="text-gray-400 text-sm mt-1">Create your first recording above</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(schedulesByDate)
                .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                .map(([date, dateSchedules]) => (
                  <div key={date} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center bg-gray-50 px-4 py-3">
                      <h3 className="font-medium">{formatDateHeader(date)}</h3>
                      {dateSchedules.length > 1 && (
                        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                          {dateSchedules.length} recordings
                        </span>
                      )}
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {dateSchedules.map((schedule, index) => (
                        <div key={schedule.id || index} className="p-4 flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-lg mb-2">
                              {schedule.name || 'Unnamed Recording'}
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Time:</span>{' '}
                                {formatTime(schedule.hour, schedule.minute)}
                              </div>
                              <div>
                                <span className="font-medium">Duration:</span>{' '}
                                {schedule.durationMinutes} minutes
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDelete(schedule.id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
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

export default Schedules; 