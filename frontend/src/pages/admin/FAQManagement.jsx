import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, HelpCircle, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const FAQManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const res = await api.get('/faqs/all');
      setFaqs(res.data.data);
    } catch (err) {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (faq = null) => {
    if (faq) {
      setEditingFAQ(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        order: faq.order || 0,
        isActive: faq.isActive !== false,
      });
    } else {
      setEditingFAQ(null);
      setFormData({ question: '', answer: '', order: faqs.length, isActive: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFAQ(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingFAQ) {
        await api.put(`/faqs/${editingFAQ._id}`, formData);
        toast.success('FAQ updated successfully');
      } else {
        await api.post('/faqs', formData);
        toast.success('FAQ created successfully');
      }
      fetchFAQs();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save FAQ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/faqs/${deleteConfirm.id}`);
      toast.success('FAQ deleted successfully');
      fetchFAQs();
    } catch (err) {
      toast.error('Failed to delete FAQ');
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const toggleActive = async (faq) => {
    try {
      await api.put(`/faqs/${faq._id}`, { ...faq, isActive: !faq.isActive });
      toast.success(`FAQ ${!faq.isActive ? 'activated' : 'deactivated'}`);
      fetchFAQs();
    } catch (err) {
      toast.error('Failed to update FAQ status');
    }
  };

  const columns = [
    {
      header: '#',
      accessor: 'order',
      render: (row) => (
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-slate-300" />
          <span className="text-sm text-slate-500 font-mono">{row.order}</span>
        </div>
      )
    },
    {
      header: 'Question',
      accessor: 'question',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900 max-w-md">{row.question}</p>
          <p className="text-xs text-slate-500 mt-1 truncate max-w-md">{row.answer}</p>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (row) => (
        <button onClick={() => toggleActive(row)} className="flex items-center gap-2 group">
          {row.isActive ? (
            <>
              <ToggleRight size={22} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Active</span>
            </>
          ) : (
            <>
              <ToggleLeft size={22} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Inactive</span>
            </>
          )}
        </button>
      )
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">FAQ Management</h2>
          <p className="text-slate-500 text-sm">Manage the FAQ section shown on the public landing page.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add FAQ
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <HelpCircle size={18} className="text-blue-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Live on Landing Page</p>
          <p className="text-xs text-blue-600 mt-0.5">Only <strong>Active</strong> FAQs are shown to public visitors. Use the toggle to show/hide individual questions instantly. Use <strong>Order</strong> to control display sequence.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {faqs.length > 0 ? (
          <Table columns={columns} data={faqs} />
        ) : (
          <EmptyState
            icon={HelpCircle}
            title="No FAQs yet"
            description="Add your first FAQ to display it on the landing page for patients."
            action={{ label: 'Add FAQ', onClick: () => openModal() }}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Question</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="e.g. Do you accept insurance?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Answer</label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none"
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              placeholder="Provide a clear and helpful answer..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-slate-400 mt-1">Lower number = shown first</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`w-full px-4 py-2 rounded-xl font-medium border transition-colors flex items-center justify-center gap-2 ${
                  formData.isActive
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {formData.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                {formData.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
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
              {submitting ? 'Saving...' : (editingFAQ ? 'Update FAQ' : 'Create FAQ')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ? It will be immediately removed from the landing page."
        confirmText="Delete"
      />
    </div>
  );
};

export default FAQManagement;
