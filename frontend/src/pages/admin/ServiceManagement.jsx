import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield, Heart, Asterisk, Stethoscope, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ImageUpload from '../../components/ui/ImageUpload';
import { resolveMediaUrl } from '../../utils/media';

const ICONS = ['Stethoscope', 'Heart', 'Asterisk', 'Shield', 'Briefcase'];

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    image: '',
    iconName: 'Stethoscope'
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data.data);
    } catch (err) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        title: service.title,
        description: service.description,
        tags: service.tags.join(', '),
        image: service.image || '',
        iconName: service.iconName || 'Stethoscope'
      });
    } else {
      setEditingService(null);
      setFormData({ title: '', description: '', tags: '', image: '', iconName: 'Stethoscope' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      if (editingService) {
        await api.put(`/services/${editingService._id}`, payload);
        toast.success('Service updated successfully');
      } else {
        await api.post('/services', payload);
        toast.success('Service created successfully');
      }
      fetchServices();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/services/${deleteConfirm.id}`);
      toast.success('Service deleted successfully');
      fetchServices();
    } catch (err) {
      toast.error('Failed to delete service');
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const columns = [
    {
      header: 'Service',
      accessor: 'title',
      render: (row) => (
        <div className="flex items-center">
          {row.image ? (
            <img src={resolveMediaUrl(row.image)} alt={row.title} className="w-10 h-10 rounded-lg object-cover mr-3 border border-gray-100" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mr-3 text-slate-400">
              <Asterisk size={18} />
            </div>
          )}
          <div>
            <div className="font-semibold text-slate-900">{row.title}</div>
            <div className="text-xs text-slate-500 truncate w-48">{row.description}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Tags',
      accessor: 'tags',
      render: (row) => (
        <div className="flex gap-1 flex-wrap w-48">
          {row.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] rounded-md font-medium">
              {tag}
            </span>
          ))}
          {row.tags.length > 3 && <span className="text-xs text-slate-400">+{row.tags.length - 3}</span>}
        </div>
      )
    },
    {
      header: 'Icon',
      accessor: 'iconName',
      render: (row) => <span className="text-sm text-slate-600 bg-slate-50 px-2 py-1 rounded border">{row.iconName}</span>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openModal(row)} className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
            <Edit2 size={16} />
          </button>
          <button onClick={() => setDeleteConfirm({ isOpen: true, id: row._id })} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Services Management</h2>
          <p className="text-slate-500 text-sm">Manage landing page services, texts, and images.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Service
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {services.length > 0 ? (
          <Table columns={columns} data={services} />
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No services found"
            description="Get started by creating a new service for the landing page."
            action={{ label: 'Add Service', onClick: () => openModal() }}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingService ? 'Edit Service' : 'Add New Service'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image</label>
            <ImageUpload 
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Title</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Primary Care"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              required
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Your first stop for everyday health..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Check-ups, Prevention, Care"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Icon Shape</label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-white"
              value={formData.iconName}
              onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
            >
              {ICONS.map(icon => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-slate-700 bg-slate-100 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-white bg-brand-600 rounded-xl font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : (editingService ? 'Update Service' : 'Create Service')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Service"
        message="Are you sure you want to delete this service? This will immediately remove it from the landing page."
        confirmText="Delete"
      />
    </div>
  );
};

export default ServiceManagement;
