import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Home, Users, Calendar, Activity, Settings, Plus } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const getNavItems = () => {
    switch (user?.role) {
      case 'Admin':
        return [
          { name: 'Analytics', path: '/admin', icon: Activity },
          { name: 'Users', path: '/admin/users', icon: Users },
          { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
        ];
      case 'Doctor':
        return [
          { name: 'Dashboard', path: '/doctor', icon: Home },
          { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
          { name: 'Patients', path: '/doctor/patients', icon: Users },
        ];
      case 'Patient':
        return [
          { name: 'Dashboard', path: '/patient', icon: Home },
          { name: 'Book Appointment', path: '/patient/book', icon: Calendar },
          { name: 'Profile', path: '/patient/profile', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-[#FAFBFC] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#073c52] to-[#107c9f] text-white flex flex-col shadow-2xl relative z-20">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#1db1d7] shrink-0">
              <Plus strokeWidth={4} size={16} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">MediCareX</span>
          </div>
          <p className="text-sm text-white/60 capitalize ml-10">{user?.role} Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/10' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 px-8 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">Welcome back, {user?.email.split('@')[0]}</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-900">{user?.email.split('@')[0]}</p>
              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-[#1db1d7] overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1594824436951-7f12678cecea?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
