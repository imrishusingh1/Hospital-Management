import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const ReviewModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please provide a comment');
      return;
    }

    setLoading(true);
    try {
      await api.post('/reviews', {
        doctorId: appointment.doctorId._id,
        appointmentId: appointment._id,
        rating,
        comment,
      });
      toast.success('Review submitted successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Leave a Review</h2>
          <p className="text-sm text-slate-500 mb-6">
            Share your experience with Dr. {appointment.doctorId?.firstName} {appointment.doctorId?.lastName}.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none transition-transform hover:scale-110"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(rating)}
                  >
                    <Star
                      size={32}
                      className={(hover || rating) >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm font-medium text-slate-500 mt-2">
                {rating === 0 ? 'Select a rating' : `${rating} out of 5 stars`}
              </span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Your Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was your visit?"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1db1d7]/50 focus:border-[#1db1d7] transition-all resize-none h-32 text-sm"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 text-sm font-bold text-white bg-[#0a3d52] hover:bg-[#104764] rounded-full transition-colors shadow-lg disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
