import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import AddDoctorModal from './AddDoctorModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, userId: null });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { search, page, limit: 10 } });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await api.put(`/users/${id}/status`, { status: newStatus });
      toast.success(`User marked as ${newStatus}`);
      fetchUsers();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.userId) return;
    try {
      await api.delete(`/users/${deleteDialog.userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (e) {
      toast.error('Failed to delete user');
    }
  };

  const columns = [
    {
      header: 'User',
      accessor: 'email',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <Avatar src={row.avatar} name={row.name || row.email} size="sm" />
          <div>
            <div className="font-semibold text-slate-800">{row.name || row.email.split('@')[0]}</div>
            <div className="text-xs text-slate-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => <Badge variant={row.role === 'Admin' ? 'info' : row.role === 'Doctor' ? 'default' : 'warning'}>{row.role}</Badge>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <button onClick={() => toggleStatus(row._id, row.status)}>
          <Badge variant={row.status}>{row.status}</Badge>
        </button>
      )
    },
    {
      header: 'Joined',
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <div className="flex space-x-2">
          {row.role !== 'Admin' && (
            <button 
              onClick={() => setDeleteDialog({ isOpen: true, userId: row._id })}
              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-500 text-sm">Manage patients, doctors, and admins.</p>
        </div>
        <button 
          onClick={() => setIsAddDoctorOpen(true)}
          className="flex items-center bg-[#1db1d7] hover:bg-[#1db1d7]/90 text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={18} className="mr-2" />
          Add Doctor
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
        <div className="flex justify-between items-center">
          <SearchBar value={search} onChange={(val) => { setSearch(val); setPage(1); }} placeholder="Search users by email..." />
        </div>
        
        {loading && users.length === 0 ? (
          <div className="py-12 text-center text-slate-500">Loading users...</div>
        ) : (
          <>
            <Table columns={columns} data={users} keyField="_id" />
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>

      <AddDoctorModal isOpen={isAddDoctorOpen} onClose={() => setIsAddDoctorOpen(false)} onAdded={fetchUsers} />
      
      <ConfirmDialog 
        isOpen={deleteDialog.isOpen} 
        onClose={() => setDeleteDialog({ isOpen: false, userId: null })}
        onConfirm={handleDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This will also remove their profile and cannot be undone."
        isDestructive={true}
        confirmText="Delete"
      />
    </div>
  );
};

export default UserManagement;
