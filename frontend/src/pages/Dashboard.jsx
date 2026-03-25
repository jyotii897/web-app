import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Plus, Search, LogOut, Sun, Moon, Filter, 
  CheckCircle, Clock, List, Trash2, Edit3, 
  ChevronLeft, ChevronRight, MoreVertical 
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  
  // Filters and Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState({ title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: '' });
  const [editId, setEditId] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks', { 
        params: { page, search, status: statusFilter, priority: priorityFilter } 
      });
      setTasks(res.data.tasks);
      setTotalPages(res.data.pages);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/tasks/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [page, search, statusFilter, priorityFilter]);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/tasks/${editId}`, currentTask);
      } else {
        await api.post('/tasks', currentTask);
      }
      setIsModalOpen(false);
      setEditId(null);
      setCurrentTask({ title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: '' });
      fetchTasks();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (task) => {
    setEditId(task._id);
    setCurrentTask({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8">
      {/* Navbar */}
      <nav className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">PlanIt.AI</h1>
          <div className="flex items-center gap-2">
            <p className="text-slate-500 font-medium">Hello, <span className="text-primary-500 font-bold">Siya</span></p>
            <span className="text-slate-300">|</span>
            <p className="text-slate-400 text-sm">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={toggleTheme} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={logout} className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Tasks', value: stats.total, icon: List, color: 'text-primary-500' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-500' },
          { label: 'Success Rate', value: `${Math.round(stats.percentage)}%`, icon: Filter, color: 'text-purple-500' }
        ].map((stat, i) => (
          <div key={i} className="glass-card flex items-center justify-between p-6">
            <div>
              <p className="text-slate-500 text-sm font-semibold">{stat.label}</p>
              <h3 className="text-3xl font-bold mt-1Value">{stat.value}</h3>
            </div>
            <div className={`p-4 rounded-2xl bg-opacity-10 bg-current ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Task Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-3 glass rounded-2xl outline-none focus:ring-2 focus:ring-primary-500" 
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="glass rounded-2xl px-4 outline-none" 
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Status</option>
            <option value="Todo">Todo</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
        <button 
          onClick={() => { setEditId(null); setIsModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Create Task
        </button>
      </div>

      {/* Task List */}
      <div className="glass rounded-3xl overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Task</th>
                <th className="p-4">Status</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tasks.map(task => (
                <tr key={task._id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-lg">{task.title}</p>
                    <p className="text-slate-500 text-sm line-clamp-1">{task.description}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      task.status === 'Done' ? 'bg-green-100 text-green-600' :
                      task.status === 'In-Progress' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      task.priority === 'High' ? 'bg-red-100 text-red-600' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sm">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                  </td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => openEditModal(task)} className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg">
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(task._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && (
            <div className="p-20 text-center text-slate-500">
              <List className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p>No tasks found. Try a different search or create one!</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4">
        <button 
          disabled={page === 1} onClick={() => setPage(p => p - 1)}
          className="p-2 glass rounded-xl disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold">Page {page} of {totalPages}</span>
        <button 
          disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
          className="p-2 glass rounded-xl disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6">{editId ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <input 
                  className="w-full p-4 glass rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Task Title" value={currentTask.title} required
                  onChange={(e) => setCurrentTask({...currentTask, title: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <textarea 
                  className="w-full p-4 glass rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Description..." value={currentTask.description} rows={3}
                  onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})}
                />
              </div>
              <select 
                className="p-4 glass rounded-2xl outline-none"
                value={currentTask.status} onChange={(e) => setCurrentTask({...currentTask, status: e.target.value})}
              >
                <option value="Todo">Todo</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Done">Done</option>
              </select>
              <select 
                className="p-4 glass rounded-2xl outline-none"
                value={currentTask.priority} onChange={(e) => setCurrentTask({...currentTask, priority: e.target.value})}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <input 
                type="date" className="p-4 glass rounded-2xl outline-none col-span-2"
                value={currentTask.dueDate} onChange={(e) => setCurrentTask({...currentTask, dueDate: e.target.value})}
              />
              <div className="flex gap-4 col-span-2 mt-4">
                <button type="submit" className="flex-1 btn-primary py-4">Save Task</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 glass rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
