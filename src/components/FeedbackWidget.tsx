import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface FeedbackData {
  name: string;
  email: string;
  phone: string;
  feedback: string;
}

const FeedbackWidget: React.FC = () => {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [formData, setFormData] = useState<FeedbackData>({
    name: profile?.full_name || '',
    email: user?.email || '',
    phone: '',
    feedback: ''
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (profile?.full_name) {
      setFormData(prev => ({ ...prev, name: profile.full_name }));
    }
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.feedback) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Store feedback in database
      const { error: dbError } = await supabase
        .from('feedback')
        .insert({
          user_id: user?.id || null,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          feedback: formData.feedback,
          created_at: new Date().toISOString()
        });

      if (dbError) throw dbError;

      // Send email notification (you can implement this with a Supabase Edge Function)
      // For now, we'll just show success
      setSuccess(true);
      setFormData({
        name: profile?.full_name || '',
        email: user?.email || '',
        phone: '',
        feedback: ''
      });

      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
      }, 3000);

    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
    setError('');
    setSuccess(false);
  };

  const minimizeWidget = () => {
    setIsMinimized(true);
  };

  const restoreWidget = () => {
    setIsMinimized(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={toggleWidget}
          className="fixed bottom-6 right-6 bg-[#F7941D] text-white p-4 rounded-full shadow-lg hover:bg-[#e68a1c] transition-all duration-300 hover:scale-110 z-50"
          style={{
            transform: `translateY(${Math.min(scrollPosition * 0.1, 20)}px)`,
          }}
          aria-label="Open feedback form"
        >
          <MessageCircle size={24} />
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </button>
      )}

      {/* Feedback Widget */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${
            isMinimized ? 'w-80 h-16' : 'w-80 h-auto max-h-[80vh]'
          }`}
          style={{
            transform: `translateY(${Math.min(scrollPosition * 0.05, 10)}px)`,
          }}
        >
          {/* Header */}
          <div className="bg-[#4A0E67] text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle size={20} />
              <h3 className="font-semibold">Feedback & Support</h3>
            </div>
            <div className="flex items-center space-x-2">
              {!isMinimized && (
                <button
                  onClick={minimizeWidget}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label="Minimize"
                >
                  <div className="w-4 h-0.5 bg-white"></div>
                </button>
              )}
              {isMinimized && (
                <button
                  onClick={restoreWidget}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label="Restore"
                >
                  <div className="w-3 h-3 border border-white"></div>
                </button>
              )}
              <button
                onClick={toggleWidget}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="p-4 max-h-96 overflow-y-auto">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-green-700 mb-2">Thank You!</h4>
                  <p className="text-sm text-gray-600">
                    Your feedback has been submitted successfully. We'll get back to you soon!
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      We'd love to hear from you! Share your feedback, suggestions, or report any issues.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <User size={14} className="inline mr-1" />
                        Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#4A0E67] text-sm"
                        placeholder="Your full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Mail size={14} className="inline mr-1" />
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#4A0E67] text-sm"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Phone size={14} className="inline mr-1" />
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#4A0E67] text-sm"
                        placeholder="+234 xxx xxx xxxx"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MessageSquare size={14} className="inline mr-1" />
                        Feedback *
                      </label>
                      <textarea
                        value={formData.feedback}
                        onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#4A0E67] text-sm h-20 resize-none"
                        placeholder="Share your thoughts, suggestions, or report issues..."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#F7941D] text-white py-2 px-4 rounded hover:bg-[#e68a1c] transition-colors disabled:opacity-50 flex items-center justify-center text-sm font-medium"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <Send size={16} className="mr-2" />
                      )}
                      {loading ? 'Sending...' : 'Send Feedback'}
                    </button>
                  </form>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      Need immediate help? Email us at{' '}
                      <a href="mailto:lizexpressorg@gmail.com" className="text-[#4A0E67] hover:underline">
                        lizexpressorg@gmail.com
                      </a>
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;