import React, { useContext } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Home, Users, Calendar, Activity, Settings } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

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
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-dark-border">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-500">HealthFlow</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role} Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-gray-800 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-dark-border">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border py-4 px-8 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Welcome, {user?.email}</h2>
          {/* Add theme toggle or user profile dropdown here if needed */}
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
