import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { FileText, Download, FileImage, Stethoscope, Plus } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import UploadReportModal from '../../components/patient/UploadReportModal';
import { resolveMediaUrl } from '../../utils/media';

const PatientRecords = () => {
  const { profile } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchRecords = async () => {
    if (!profile?._id) return;
    setLoading(true);
    try {
      const res = await api.get(`/records/${profile._id}`);
      setRecords(res.data.data);
    } catch (e) {
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [profile?._id]);

  const getIconForType = (type) => {
    switch (type) {
      case 'Lab Result':
        return <FileText className="text-blue-500" />;
      case 'Scan':
        return <FileImage className="text-purple-500" />;
      case 'Diagnosis':
        return <Stethoscope className="text-emerald-500" />;
      default:
        return <FileText className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Medical Records</h2>
          <p className="text-slate-500 text-sm">Lab results, scans, and reports from you or your doctors.</p>
        </div>
        <button type="button" className="btn-primary shrink-0" onClick={() => setUploadOpen(true)}>
          <Plus size={18} /> Upload report
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[400px]">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading records...</div>
        ) : records.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No medical records found"
            message="Upload your test reports or wait for your doctor to add records."
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {records.map((r) => (
              <div
                key={r._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-4 hover:bg-slate-50 transition-colors px-4 -mx-4 rounded-xl gap-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center shrink-0">
                    {getIconForType(r.recordType)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 text-lg">{r.title}</h4>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                        {r.recordType}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{r.description}</p>
                    <p className="text-xs font-semibold text-[#1db1d7] mt-2">
                      {r.uploadedBy === 'Patient'
                        ? 'Uploaded by you'
                        : `Dr. ${r.doctorId?.lastName || '—'}`}{' '}
                      • {new Date(r.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {r.fileUrl && (
                  <div className="shrink-0">
                    <a
                      href={resolveMediaUrl(r.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                    >
                      <Download size={16} className="mr-2" /> Download PDF
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <UploadReportModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} onSuccess={fetchRecords} />
    </div>
  );
};

export default PatientRecords;
