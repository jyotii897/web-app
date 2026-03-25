import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Plus, Search, LogOut, Sun, Moon, Filter, 
  CheckCircle, Clock, List, Trash2, Edit3, 
  LayoutDashboard, Folder, Users, Calendar, 
  BarChart3, Settings, MoreHorizontal, AlertCircle
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend 
} from 'recharts';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
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
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks', { 
        params: { search, status: statusFilter } 
      });
      setTasks(res.data.tasks);
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
  }, [search, statusFilter]);

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

  const chartData = [
    { name: 'Completed', value: stats.completed, color: '#10b981' },
    { name: 'Pending', value: stats.pending, color: '#3b82f6' },
    { name: 'Overdue', value: Math.max(0, stats.total - stats.completed - stats.pending), color: '#f43f5e' }
  ];

  const SidebarItem = ({ icon: Icon, label, active = false }) => (
    <div className={`sidebar-item ${active ? 'active' : ''}`}>
      <Icon className="w-5 h-5" />
      <span className="hidden lg:block">{label}</span>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#050510] font-sans">
      {/* SIDEBAR */}
      <aside className="w-20 lg:w-64 border-r border-slate-200 dark:border-white/5 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold hidden lg:block tracking-tight text-slate-800 dark:text-white">PlanIt.AI</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
          <SidebarItem icon={List} label="My Tasks" />
          <SidebarItem icon={Folder} label="Projects" />
          <SidebarItem icon={Users} label="Team" />
          <SidebarItem icon={Calendar} label="Calendar" />
          <SidebarItem icon={BarChart3} label="Reports" />
          <SidebarItem icon={Settings} label="Settings" />
        </nav>

        <div className="mt-auto p-4 glass rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-primary-500/20 flex items-center justify-center overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=Siya&background=0ea5e9&color=fff" alt="User" />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-bold truncate max-w-[120px]">Siya</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Active</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              Welcome Back, <span className="text-primary-500">Siya!</span>
            </h2>
            <p className="text-slate-400 mt-2 font-medium">{user.email}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={toggleTheme} className="p-3 glass rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
              {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <button onClick={logout} className="p-3 glass rounded-2xl text-red-500 hover:bg-red-500/10 transition-all">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* TOP SECTION: STATS + CHART */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Tasks', value: stats.total, color: 'text-primary-500', trend: '+5' },
              { label: 'Completed', value: stats.completed, color: 'text-green-500', trend: `${Math.round(stats.percentage)}%` },
              { label: 'Upcoming', value: stats.pending, color: 'text-blue-400', trend: '-2' },
            ].map((stat, i) => (
              <div key={i} className="glass-card relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest">{stat.label}</p>
                  <MoreHorizontal className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-5xl font-black">{stat.value}</h3>
                  <span className={`text-xs font-bold ${stat.trend.includes('+') ? 'text-green-400' : 'text-slate-500'}`}>{stat.trend}</span>
                </div>
                <div className="mt-6 h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full bg-current ${stat.color}`} style={{ width: `${Math.min(100, (stat.value/Math.max(1, stats.total))*100)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card flex flex-col items-center">
            <h4 className="self-start text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Task Overview</h4>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', background: 'rgba(0,0,0,0.8)', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-4">
              {chartData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[10px] font-bold text-slate-500">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <h3 className="text-2xl font-bold tracking-tight self-start">Current Tasks</h3>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="text" placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-3 glass rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" 
                value={search} onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setEditId(null); setIsModalOpen(true); }}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" /> New Task
            </button>
          </div>
        </div>

        {/* TASK GRID (Replacement for Table) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <div key={task._id} className={`glass-card group ${
              task.priority === 'High' ? 'glow-high' : 
              task.priority === 'Medium' ? 'glow-medium' : 'glow-low'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                  task.priority === 'High' ? 'bg-purple-500/20 text-purple-400' :
                  task.priority === 'Medium' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {task.priority + ' Priority'}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(task)} className="text-slate-400 hover:text-white p-1">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(task._id)} className="text-slate-400 hover:text-red-500 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="text-xl font-bold mb-2 group-hover:text-primary-400 transition-colors uppercase tracking-tight">{task.title}</h4>
              <p className="text-slate-400 text-sm line-clamp-2 mb-6 font-medium leading-relaxed">
                {task.description || "No description provided for this task."}
              </p>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No Due Date'}
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase ${
                   task.status === 'Done' ? 'bg-green-500/20 text-green-400' :
                   task.status === 'In-Progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'
                }`}>
                  {task.status}
                </div>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="col-span-full p-24 text-center glass rounded-3xl border-dashed border-2 border-slate-200 dark:border-white/5">
              <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <h5 className="text-xl font-bold mb-2">No active tasks</h5>
              <p className="text-slate-500">Simplify your workflow by creating your first task today.</p>
            </div>
          )}
        </div>
      </main>

      {/* MODAL (Unchanged Logic, Styled for Preview) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <div className="glass-card w-full max-w-xl border border-white/10">
            <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">{editId ? 'Modify Task' : 'Draft New Task'}</h2>
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
                  placeholder="Tell us more about this task..." value={currentTask.description} rows={4}
                  onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})}
                />
              </div>
              <select 
                className="p-4 glass rounded-2xl outline-none"
                value={currentTask.status} onChange={(e) => setCurrentTask({...currentTask, status: e.target.value})}
              >
                <option value="Todo">Todo Status</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Done">Completed</option>
              </select>
              <select 
                className="p-4 glass rounded-2xl outline-none"
                value={currentTask.priority} onChange={(e) => setCurrentTask({...currentTask, priority: e.target.value})}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
              <input 
                type="date" className="p-4 glass rounded-2xl outline-none col-span-2"
                value={currentTask.dueDate} onChange={(e) => setCurrentTask({...currentTask, dueDate: e.target.value})}
              />
              <div className="flex gap-4 col-span-2 mt-8">
                <button type="submit" className="flex-1 btn-primary py-4">Confirm Changes</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 glass rounded-2xl font-bold">Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
