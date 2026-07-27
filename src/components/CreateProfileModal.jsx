import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import { Camera, User, Target, BookOpen } from 'lucide-react';

export default function CreateProfileModal() {
  const { dispatch, showToast } = useStudy();
  const modalRef = useRef(null);
  const formRef = useRef(null);
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    bio: '',
    avatar: '',
    dailyGoal: 6,
    learningGoal: '',
  });

  useEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    }
    if (formRef.current) {
      gsap.fromTo(formRef.current, { y: 40, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, delay: 0.1, ease: 'back.out(1.2)' });
    }
  }, []);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm((f) => ({ ...f, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    dispatch({ type: 'SET_PROFILE', payload: form });
    dispatch({
      type: 'ADD_GLOBAL_ACTIVITY',
      payload: { type: 'profile', message: 'Profile created' },
    });
    showToast('Welcome to StudyFlow! 🚀', 'success');
  };

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const inputClass = "w-full px-4 py-3 rounded-xl bg-[#e6ebf2] border border-[rgba(255,255,255,0.7)] text-[#1a202c] placeholder-[#718096] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[#ed8936]/30 transition-all text-sm inset-field shadow-[inset_3px_3px_6px_rgba(163,177,198,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]";

  return (
    <div ref={modalRef} className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'rgba(26, 32, 44, 0.6)' }}>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="rounded-2xl p-8 w-full max-w-lg space-y-5 max-h-[90vh] overflow-y-auto leather-card"
        style={{
          background: '#e6ebf2',
          border: '1px solid rgba(255,255,255,0.7)',
          boxShadow: '10px 10px 24px rgba(163, 177, 198, 0.65), -10px -10px 24px rgba(255, 255, 255, 0.9)',
        }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1a202c] mb-2" style={{textShadow: 'none'}}>Welcome to StudyFlow</h1>
          <p className="text-[#718096] text-sm">Set up your profile to get started</p>
        </div>

        {/* Avatar */}
        <div className="flex justify-center">
          <label className="relative w-24 h-24 rounded-full bg-[#e6ebf2] border-2 border-dashed border-[rgba(163,177,198,0.5)] hover:border-[var(--accent-orange)] transition-colors flex items-center justify-center cursor-pointer overflow-hidden group inset-field shadow-[inset_3px_3px_6px_rgba(163,177,198,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]">
            {form.avatar ? (
              <img src={form.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-[#718096] group-hover:text-accent-primary transition-colors" />
            )}
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-[#1a202c]" />
            </div>
          </label>
        </div>

        {/* Name */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-[#2d3748] mb-2" style={{textShadow: 'none'}}>
            <User className="w-4 h-4 text-accent-primary" />Name <span className="text-[#e53e3e]">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Enter your name"
            required
            className={inputClass}
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-semibold text-[#2d3748] mb-2" style={{textShadow: 'none'}}>Username</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => updateField('username', e.target.value)}
            placeholder="@username"
            className={inputClass}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-[#2d3748] mb-2" style={{textShadow: 'none'}}>Email (optional)</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="you@email.com"
            className={inputClass}
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold text-[#2d3748] mb-2" style={{textShadow: 'none'}}>Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            rows={2}
            className={inputClass + " resize-none"}
          />
        </div>

        {/* Daily Goal */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-[#2d3748] mb-2" style={{textShadow: 'none'}}>
            <Target className="w-4 h-4 text-[#38a169]" />Daily Study Goal (hours)
          </label>
          <input
            type="number"
            min={1}
            max={24}
            value={form.dailyGoal}
            onChange={(e) => updateField('dailyGoal', parseInt(e.target.value) || 1)}
            className={inputClass}
          />
        </div>

        {/* Learning Goal */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-[#2d3748] mb-2" style={{textShadow: 'none'}}>
            <BookOpen className="w-4 h-4 text-accent-primary" />Learning Goal
          </label>
          <input
            type="text"
            value={form.learningGoal}
            onChange={(e) => updateField('learningGoal', e.target.value)}
            placeholder="e.g., Master React in 3 months"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ed8936] to-[#dd6b20] text-white font-bold text-sm transition-all active:scale-[0.98] cursor-pointer mt-2 border border-white/40 brass-btn"
          style={{
            boxShadow: '5px 5px 12px rgba(163,177,198,0.6), -5px -5px 12px rgba(255,255,255,0.8)',
            textShadow: 'none'
          }}
        >
          Get Started →
        </button>
      </form>
    </div>
  );
}
