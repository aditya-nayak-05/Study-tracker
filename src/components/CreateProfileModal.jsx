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

  const inputClass = "w-full px-4 py-3 rounded-xl bg-[#1a1a30] border border-[rgba(255,255,255,0.12)] text-white placeholder-[#6b6b99] focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[rgba(99,102,241,0.2)] transition-all text-sm";

  return (
    <div ref={modalRef} className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(3,3,8,0.95)' }}>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="rounded-2xl p-8 w-full max-w-lg space-y-5 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(145deg, rgba(16,16,30,0.98), rgba(12,12,24,0.99))',
          border: '1px solid rgba(99,102,241,0.25)',
          boxShadow: '0 0 80px rgba(99,102,241,0.12), 0 25px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gradient mb-2">Welcome to StudyFlow</h1>
          <p className="text-[#8888aa] text-sm">Set up your profile to get started</p>
        </div>

        {/* Avatar */}
        <div className="flex justify-center">
          <label className="relative w-24 h-24 rounded-full bg-[#1a1a30] border-2 border-dashed border-[#3d3d65] hover:border-[#6366f1] transition-colors flex items-center justify-center cursor-pointer overflow-hidden group">
            {form.avatar ? (
              <img src={form.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-[#5a5a88] group-hover:text-[#818cf8] transition-colors" />
            )}
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </label>
        </div>

        {/* Name */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-[#aaaac8] mb-2">
            <User className="w-4 h-4 text-[#818cf8]" />Name <span className="text-[#fb7185]">*</span>
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
          <label className="block text-sm font-medium text-[#aaaac8] mb-2">Username</label>
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
          <label className="block text-sm font-medium text-[#aaaac8] mb-2">Email (optional)</label>
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
          <label className="block text-sm font-medium text-[#aaaac8] mb-2">Bio</label>
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
          <label className="flex items-center gap-1.5 text-sm font-medium text-[#aaaac8] mb-2">
            <Target className="w-4 h-4 text-[#34d399]" />Daily Study Goal (hours)
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
          <label className="flex items-center gap-1.5 text-sm font-medium text-[#aaaac8] mb-2">
            <BookOpen className="w-4 h-4 text-[#a78bfa]" />Learning Goal
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
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold text-sm hover:shadow-lg hover:shadow-[rgba(99,102,241,0.3)] transition-all active:scale-[0.98] cursor-pointer mt-2"
        >
          Get Started →
        </button>
      </form>
    </div>
  );
}
