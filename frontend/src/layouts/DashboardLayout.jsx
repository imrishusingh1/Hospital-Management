import React, { useContext, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Home, Users, Calendar, Activity, Settings, Plus, Menu, X, FileText, FileClock } from 'lucide-react';
import Notifications from '../components/Notifications';
import Avatar from '../components/ui/Avatar';

const DashboardLayout = () => {
  const { user, profile, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
          { name: 'My Appointments', path: '/patient/appointments', icon: Calendar },
          { name: 'Book Appointment', path: '/patient/book', icon: Plus },
          { name: 'My Prescriptions', path: '/patient/prescriptions', icon: FileText },
          { name: 'Medical Records', path: '/patient/records', icon: FileClock },
          { name: 'Profile', path: '/patient/profile', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-[#FAFBFC] font-sans overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-gradient-to-b from-[#073c52] to-[#107c9f] text-white flex flex-col shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#1db1d7] shrink-0">
              <Plus strokeWidth={4} size={16} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">hospitalflow</span>
          </div>
          <button className="md:hidden text-white/70 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <p className="text-sm text-white/60 capitalize ml-16 -mt-4 mb-4">{user?.role} Portal</p>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
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
      <main className="flex-1 overflow-y-auto relative flex flex-col h-screen w-full">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 px-4 md:px-8 flex justify-between items-center sticky top-0 z-10 shadow-sm shrink-0">
          <div className="flex items-center">
            <button className="md:hidden mr-4 text-slate-500 hover:text-slate-800" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-slate-800">Welcome back, {user?.name || user?.email.split('@')[0]}</h2>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <Notifications />
            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900">{user?.name || user?.email.split('@')[0]}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
              <Avatar src={user?.avatar} name={user?.name || user?.email} size="md" className="border-2 border-[#1db1d7] shadow-sm" />
            </div>
          </div>
        </header>
        <div className="p-4 md:p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
