import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Loader2, Calendar, Clock, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Alert } from './ui/alert';

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    fetchSchedules();
    const interval = setInterval(fetchSchedules, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/schedules');
      setSchedules(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch schedules');
      console.error('Error fetching schedules:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:3001/api/schedules', {
        name,
        date,
        startTime,
        duration: parseInt(duration)
      });
      setName('');
      setDate('');
      setStartTime('');
      setDuration(1);
      fetchSchedules();
      setError(null);
    } catch (err) {
      setError('Failed to create schedule');
      console.error('Error creating schedule:', err);
    }
    setLoading(false);
  };

  const deleteSchedule = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/schedules/${id}`);
      fetchSchedules();
      setError(null);
    } catch (err) {
      setError('Failed to delete schedule');
      console.error('Error deleting schedule:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {error && <Alert variant="error">{error}</Alert>}
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Recording Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Recording Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  max="480"
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : 'Create Schedule'}
            </button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className="relative group">
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">{schedule.name}</h3>
              <div className="text-zinc-400 space-y-2">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  {format(new Date(schedule.date), 'MMMM d, yyyy')}
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2" />
                  {schedule.startTime} ({schedule.duration}m)
                </div>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => deleteSchedule(schedule.id)}
                  className="p-1 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-2 pt-2 border-t border-zinc-800">
                <span className={`text-sm ${
                  schedule.status === 'completed' ? 'text-green-500' :
                  schedule.status === 'recording' ? 'text-red-500' :
                  'text-zinc-400'
                }`}>
                  {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScheduleManagement;
