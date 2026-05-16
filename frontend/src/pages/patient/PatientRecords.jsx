import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { FileText, Download, FileImage, Stethoscope } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';

const PatientRecords = () => {
  const { profile } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchRecords();
  }, [profile?._id]);

  const getIconForType = (type) => {
    switch(type) {
      case 'Lab Result': return <FileText className="text-blue-500" />;
      case 'Scan': return <FileImage className="text-purple-500" />;
      case 'Diagnosis': return <Stethoscope className="text-emerald-500" />;
      default: return <FileText className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Medical Records</h2>
        <p className="text-slate-500 text-sm">Lab results, scans, and diagnosis reports uploaded by your doctors.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[400px]">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading records...</div>
        ) : records.length === 0 ? (
          <EmptyState 
            icon={FileText}
            title="No medical records found"
            message="You don't have any medical records uploaded yet. Records will appear here once your doctor uploads them."
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {records.map((r) => (
              <div key={r._id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 hover:bg-slate-50 transition-colors px-4 -mx-4 rounded-xl gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center shrink-0">
                    {getIconForType(r.recordType)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 text-lg">{r.title}</h4>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">{r.recordType}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{r.description}</p>
                    <p className="text-xs font-semibold text-[#1db1d7] mt-2 flex items-center">
                      Dr. {r.doctorId?.lastName} • {new Date(r.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <a 
                    href={r.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                  >
                    <Download size={16} className="mr-2" /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientRecords;
