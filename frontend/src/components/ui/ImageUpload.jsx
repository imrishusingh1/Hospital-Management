import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { resolveMediaUrl } from '../../utils/media';
import toast from 'react-hot-toast';
import Avatar from './Avatar';

const ImageUpload = ({ value, onChange, name = 'User', size = 'xl', label = 'Profile photo' }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/uploads/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Upload failed');
      
      onChange(data.url);
      toast.success('Photo uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const preview = resolveMediaUrl(value);

  return (
    <div className="flex items-center gap-6">
      <Avatar src={preview} name={name} size={size} className="border-4 border-white shadow-lg" />
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-2">{label}</p>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? 'Uploading…' : 'Upload image'}
        </button>
        <p className="text-xs text-slate-500 mt-2">JPEG, PNG, GIF or WebP — max 5MB</p>
      </div>
    </div>
  );
};

export default ImageUpload;
