import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

 export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      <header className="bg-white border-b border-slate-200 h-16 flex items-center 
      justify-between px-6 shadow-sm sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-black text-sky-600 
          tracking-tight">Task Manangement System</span>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <button onClick={handleLogout} className="bg-slate-100
             hover:bg-rose-50 hover:text-rose-600 text-slate-600 px-3 py-1.5 rounded-lg 
             text-sm font-medium transition duration-150">
              Logout
            </button>
          </div>
        )}
      </header>

     
      <main className="flex-1 max-w-7xl w-full mx-auto">
        <Outlet /> 
      </main>
    </div>
  );
};
