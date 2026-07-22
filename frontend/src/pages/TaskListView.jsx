import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';



export const TaskListView = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
 
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssignee, setNewAssignee] = useState('Unassigned');
  const [newTags, setNewTags] = useState('');

  const [selectedTask, setSelectedTask] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/tasks?search=${search}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setTasks(data);
    } catch (err) {
      setError('Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, token]);

  useEffect(() => {
    if (taskId) {
      const task = tasks.find(t => t._id === taskId);
      if (task) {
        setSelectedTask({ ...task });
      } else if (tasks.length > 0) {
        navigate('/dashboard');
      }
    } else {
      setSelectedTask(null);
    }
  }, [taskId, tasks, navigate]);

  const toggleStatus = async (task, e) => {
    e.stopPropagation();
    const nextStatus = task.status === 'Done' ? 'To Do' : 'Done';
    try {
      const res = await fetch(`${API_BASE}/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setTasks(tasks.map(t => t._id === task._id ? { ...t, status: nextStatus } : t));
      }
    } catch (err) {
      console.error('Status sync failed.');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const tagsArray = newTags ? newTags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          priority: newPriority,
          dueDate: newDueDate || undefined,
          assignee: newAssignee,
          tags: tagsArray
        })
      });
      const data = await res.json();
      if (res.ok) {
        setTasks([data, ...tasks]);
        setNewTitle('');
        setNewDesc('');
        setNewPriority('Medium');
        setNewDueDate('');
        setNewAssignee('Unassigned');
        setNewTags('');
        setShowAddForm(false);
      }
    } catch (err) {
      setError('Error saving task record.');
    }
  };

  const handleUpdateDrawerTask = async (updatedFields) => {
    try {
      const updatedTaskData = { ...selectedTask, ...updatedFields };
      const res = await fetch(`${API_BASE}/tasks/${selectedTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedTaskData)
      });
      if (res.ok) {
        setSelectedTask(updatedTaskData);
        setTasks(tasks.map(t => t._id === selectedTask._id ? updatedTaskData : t));
      }
    } catch (err) {
      console.error('Error modifying task configs.');
    }
  };

  const handleDeleteTask = async (id, e) => {
    if (e) e.stopPropagation(); 
    if (!window.confirm('Are you sure you want to delete this task record?')) return;
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTasks(tasks.filter(t => t._id !== id));
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error wiping document reference.');
    }
  };

  const checkOverdue = (dueDate, status) => {
    if (!dueDate || status === 'Done') return false;
    return new Date() > new Date(dueDate);
  };

  
  const getInitials = (name) => {
    if (!name || name === 'Unassigned') return '👤';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-slate-50">
      
    
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 mb-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-blue-500">TaskCraft Workspace</h1>
            <p className="text-indigo-200 text-xs mt-1 font-medium">Manage, schedule, and track assignees seamlessly.</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className={`shadow-md font-bold py-2.5 px-5 rounded-xl text-xs tracking-wide transition transform hover:-translate-y-0.5 active:translate-y-0 ${
              showAddForm 
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20' 
                : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/30'
            }`}
          >
            {showAddForm ? '✕ Close Form' : '＋ Add New Task'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select 
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value=""> All Statuses</option>
              <option value="To Do"> To Do</option>
              <option value="In Progress">⏳ In Progress</option>
              <option value="Done">✅ Done</option>
            </select>
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-md">
          Total Metrics: <span className="text-slate-800 font-bold">{tasks.length}</span>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateTask} className="bg-white border border-slate-200 rounded-xl p-6 shadow-md mb-8 max-w-2xl border-l-4 border-indigo-500 animate-fadeIn">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Create Workspace Document</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Task Title</label>
              <input type="text" required className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none" placeholder="e.g. Set up production pipeline hooks"
                value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
              <textarea className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none" placeholder="Task execution metrics..." rows="2"
                value={newDesc} onChange={(e) => setNewDesc(e.target.value)}></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Assignee Name</label>
              <input type="text" className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none" placeholder="e.g. John Doe"
                value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tags (Comma-separated)</label>
              <input type="text" className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none" placeholder="e.g. frontend, bug, api"
                value={newTags} onChange={(e) => setNewTags(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Priority Config</label>
              <select className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none" value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                <option value="Low">🟢 Low Priority</option>
                <option value="Medium">🟡 Medium Priority</option>
                <option value="High">🔴 High Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Due Date Deadline</label>
              <input type="date" className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-5 rounded-lg shadow-md shadow-emerald-600/10 transition">
            Save Task Into Registry
          </button>
        </form>
      )}

      
      {loading ? (
        <div className="text-slate-400 text-xs py-16 text-center font-bold tracking-wider animate-pulse">Syncing TaskCraft enterprise database structures...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-50/70 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200">
                  <th className="p-4 w-12 text-center">Done</th>
                  <th className="p-4">Task Spec Details</th>
                  <th className="p-4 w-40">Tags</th>
                  <th className="p-4 w-40">Assignee</th>
                  <th className="p-4 w-32">Status</th>
                  <th className="p-4 w-32">Priority</th>
                  <th className="p-4 w-40">Deadline</th>
                  <th className="p-4 w-28 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-12 text-center text-slate-400 font-bold tracking-wide">No active workspace documents detected. Open a card to start!</td>
                  </tr>
                ) : (
                  tasks.map((task) => {
                    const isOverdue = checkOverdue(task.dueDate, task.status);
                    return (
                      <tr 
                        key={task._id} 
                        onClick={() => navigate(`/dashboard/${task._id}`)}
                        className={`group transition hover:bg-slate-50/60 cursor-pointer ${taskId === task._id ? 'bg-indigo-50/50 hover:bg-indigo-50/80' : ''}`}
                      >

                        <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer transition"
                            checked={task.status === 'Done'}
                            onChange={(e) => toggleStatus(task, e)}
                          />
                        </td>
                        

                        <td className="p-4 max-w-xs">
                          <p className={`font-bold text-slate-700 tracking-tight group-hover:text-indigo-950 transition ${task.status === 'Done' ? 'line-through text-slate-400 group-hover:text-slate-400' : ''}`}>{task.title}</p>
                          {task.description && <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-xs">{task.description}</p>}
                        </td>

                        
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {task.tags && task.tags.length > 0 ? (
                              task.tags.map((tag, i) => (
                                <span key={i} className="px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase bg-slate-100 border border-slate-200 text-slate-600 rounded">
                                  #{tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-300 text-[11px] font-medium italic">no tags</span>
                            )}
                          </div>
                        </td>

                      
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                              {getInitials(task.assignee)}
                            </div>
                            <span className="font-bold text-slate-600 text-[11px] truncate max-w-[100px]">
                              {task.assignee || 'Unassigned'}
                            </span>
                          </div>
                        </td>

                      
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide rounded-full border ${
                            task.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            task.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-indigo-50 text-indigo-700 border-indigo-100'
                          }`}>
                            <span className={`w-1 h-1 rounded-full mr-1.5 ${
                              task.status === 'Done' ? 'bg-emerald-500' :
                              task.status === 'In Progress' ? 'bg-amber-500' : 'bg-indigo-500'
                            }`}></span>
                            {task.status}
                          </span>
                        </td>

                    
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold rounded ${
                            task.priority === 'High' ? 'bg-rose-100 text-rose-700 font-bold' :
                            task.priority === 'Medium' ? 'bg-amber-100 text-amber-700 font-bold' :
                            'bg-slate-100 text-slate-600 font-bold'
                          }`}>
                            {task.priority === 'High' ? '🔺 High' : task.priority === 'Medium' ? '🔸 Med' : '🔹 Low'}
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap font-medium text-slate-500">
                          <span>
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Deadline'}
                          </span>
                          {isOverdue && (
                            <span className="ml-2 px-1.5 py-0.5 text-[9px] uppercase font-black bg-rose-600 text-white rounded tracking-widest animate-pulse shadow-xs">
                              Overdue
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => navigate(`/dashboard/${task._id}`)}
                              className="px-2 py-1 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 bg-white shadow-xs rounded text-[11px] font-bold transition"
                            >
                              ⚙️ Edit
                            </button>
                            <button 
                              onClick={(e) => handleDeleteTask(task._id, e)}
                              className="px-2 py-1 border border-rose-100 text-rose-500 hover:bg-rose-50 rounded text-[11px] font-bold transition"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

     
      {selectedTask && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end animate-fadeIn"
          onClick={() => navigate('/dashboard')}
        >
          <div 
            className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col transform transition-transform duration-300 border-l border-slate-200 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Workspace Parameters</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">ID: {selectedTask._id}</p>
              </div>
              <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-slate-700 text-xl font-bold transition">&times;</button>
            </div>

            
            <div className="space-y-5 flex-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Edit Title String</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  value={selectedTask.title}
                  onChange={(e) => handleUpdateDrawerTask({ title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assignee</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  value={selectedTask.assignee || ''}
                  placeholder="Assign to user..."
                  onChange={(e) => handleUpdateDrawerTask({ assignee: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tags (Comma-separated)</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  value={selectedTask.tags ? selectedTask.tags.join(', ') : ''}
                  placeholder="frontend, api, core"
                  onChange={(e) => {
                    const arrayVal = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                    handleUpdateDrawerTask({ tags: arrayVal });
                  }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Edit Description Specifications</label>
                <textarea 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  rows="2"
                  value={selectedTask.description || ''}
                  onChange={(e) => handleUpdateDrawerTask({ description: e.target.value })}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">State Transition</label>
                  <select 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none cursor-pointer"
                    value={selectedTask.status}
                    onChange={(e) => handleUpdateDrawerTask({ status: e.target.value })}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Priority Rule</label>
                  <select 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none cursor-pointer"
                    value={selectedTask.priority}
                    onChange={(e) => handleUpdateDrawerTask({ priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>


              <div className="border-t border-slate-100 pt-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Checklist Milestone Targets</label>
                <div className="space-y-2">
                  {selectedTask.subtasks && selectedTask.subtasks.map((sub, idx) => (
                    <div key={sub._id || idx} className="flex items-center gap-2 bg-slate-50 border border-slate-150 p-2.5 rounded-lg">
                      <input 
                        type="checkbox"
                        checked={sub.isCompleted}
                        onChange={(e) => {
                          const updatedSubs = selectedTask.subtasks.map((s, i) => i === idx ? { ...s, isCompleted: e.target.checked } : s);
                          handleUpdateDrawerTask({ subtasks: updatedSubs });
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500 transition cursor-pointer"
                      />
                      <span className={`text-xs font-semibold text-slate-700 ${sub.isCompleted ? 'line-through text-slate-400' : ''}`}>{sub.text}</span>
                    </div>
                  ))}
                  
                  {(!selectedTask.subtasks || selectedTask.subtasks.length === 0) && (
                    <button 
                      type="button"
                      onClick={() => handleUpdateDrawerTask({
                        subtasks: [
                          { text: 'Verify application build processes', isCompleted: true },
                          { text: 'Confirm zero-downtime router parameters', isCompleted: false },
                          { text: 'Complete production presentation ', isCompleted: false }
                        ]
                      })}
                      className="inline-block mt-1 text-xs text-indigo-600 hover:text-indigo-700 font-bold tracking-tight hover:underline bg-indigo-50 px-3 py-1.5 rounded-md transition"
                    >
                      ＋ Bootstrap Professional Subtasks
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Wiping Control Footer */}
            <div className="border-t border-slate-100 pt-4 mt-4">
              <button 
                onClick={(e) => handleDeleteTask(selectedTask._id, e)}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold py-2.5 px-4 rounded-xl transition text-center"
              >
                🗑️ Wipe Workspace Record Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};