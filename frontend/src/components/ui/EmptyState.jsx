import React from 'react';
import { FileQuestion } from 'lucide-react';

const EmptyState = ({ icon: Icon = FileQuestion, title, message, actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-6">
        <Icon size={40} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mx-auto mb-8">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-gradient-to-r from-[#073c52] to-[#107c9f] text-white font-bold rounded-xl hover:shadow-lg transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
