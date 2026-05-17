import React, { useContext, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Home, Users, Calendar, Activity, Settings, Plus, Menu, X, FileText, FileClock, Briefcase, HelpCircle, MessageCircle } from 'lucide-react';
import Notifications from '../components/Notifications';
import Avatar from '../components/ui/Avatar';

const DashboardLayout = () => {
  const { user, profile, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getNavItems = () => {
    switch (user?.role) {
      case 'Admin':
        return [
          { name: 'Analytics', path: '/admin', icon: Activity },
          { name: 'Users', path: '/admin/users', icon: Users },
          { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
          { name: 'Services', path: '/admin/services', icon: Briefcase },
          { name: 'FAQs', path: '/admin/faqs', icon: HelpCircle },
        ];
      case 'Doctor':
        return [
          { name: 'Dashboard', path: '/doctor', icon: Home },
          { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
          { name: 'Patients', path: '/doctor/patients', icon: Users },
          { name: 'Chat', path: '/doctor/chat', icon: MessageCircle },
          { name: 'Profile', path: '/doctor/profile', icon: Settings },
        ];
      case 'Patient':
        return [
          { name: 'Dashboard', path: '/patient', icon: Home },
          { name: 'My Appointments', path: '/patient/appointments', icon: Calendar },
          { name: 'Book Appointment', path: '/patient/book', icon: Plus },
          { name: 'Chat', path: '/patient/chat', icon: MessageCircle },
          { name: 'Prescriptions', path: '/patient/prescriptions', icon: FileText },
          { name: 'Medical Records', path: '/patient/records', icon: FileClock },
          { name: 'Profile', path: '/patient/profile', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : user?.email?.split('@')[0];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-gradient-to-b from-brand-800 to-brand-600 text-white flex flex-col shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-brand-600 shrink-0 shadow-sm">
              <Plus strokeWidth={3} size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight">hospitalflow</span>
          </div>
          <button
            type="button"
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={22} />
          </button>
        </div>
        <p className="text-xs text-white/60 capitalize px-6 -mt-2 mb-2">{user?.role} portal</p>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive ? 'nav-active' : 'nav-inactive'
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-rose-200 hover:bg-rose-500/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        <header className="glass-header py-4 px-4 md:px-8 flex justify-between items-center sticky top-0 z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="md:hidden text-slate-500 hover:text-slate-800"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 truncate">
                Welcome, {displayName}
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block">Manage your healthcare workflow</p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-5 shrink-0">
            <Notifications />
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
              <Avatar
                src={user?.avatar || profile?.avatar}
                name={displayName}
                size="md"
                className="border-2 border-brand-500 shadow-sm"
              />
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
