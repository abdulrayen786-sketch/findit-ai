import React, { useState } from 'react';
import { X, UserCheck, Shield, GraduationCap, Building2, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { availableUsers, switchUser, login, register } = useAuth();

  const [mode, setMode] = useState<'signin' | 'register'>(
    availableUsers.length > 0 ? 'signin' : 'register'
  );
  const [loginEmail, setLoginEmail] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student' | 'staff' | 'admin'>('student');
  const [studentOrStaffId, setStudentOrStaffId] = useState('');
  const [department, setDepartment] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setError('Please provide your registered college email.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await login(loginEmail.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'No registered account found with this email. Please register below.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !studentOrStaffId.trim()) {
      setError('Please provide name, email, and university ID');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await register({
        name: name.trim(),
        email: email.trim(),
        role,
        studentOrStaffId: studentOrStaffId.trim(),
        department: department.trim() || 'General Studies',
        phoneNumber: phoneNumber.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">University Authentication Portal</h3>
            <p className="text-xs text-slate-400">FINDIT AI Campus Identity Access</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => {
              setMode('signin');
              setError('');
            }}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center space-x-1.5 ${
              mode === 'signin'
                ? 'bg-white text-blue-900 border-b-2 border-blue-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center space-x-1.5 ${
              mode === 'register'
                ? 'bg-white text-blue-900 border-b-2 border-blue-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Account</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="p-2.5 mb-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <p className="text-xs text-slate-600">
                Enter your registered college email address to access your campus dashboard:
              </p>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">College Email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="student.id@campus.edu"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:border-blue-600 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white transition-colors disabled:opacity-50"
              >
                {submitting ? 'Authenticating...' : 'Sign In to Portal'}
              </button>

              {availableUsers.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    Or select an active registered user:
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {availableUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          switchUser(u.id);
                          onClose();
                        }}
                        className="w-full text-left p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="truncate">
                          <span className="font-bold text-slate-900 block truncate">{u.name}</span>
                          <span className="text-[10px] text-slate-400 truncate block">{u.email}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                          {u.role}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-center text-xs text-slate-500 pt-2">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-blue-600 hover:underline font-bold"
                >
                  Register here
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Alex Johnson"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:border-blue-600 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">College Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.j@campus.edu"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:border-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white focus:border-blue-600 outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="staff">Faculty / Staff</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {role === 'student' ? 'Student Enrollment ID' : 'Staff / Admin ID'}
                  </label>
                  <input
                    type="text"
                    required
                    value={studentOrStaffId}
                    onChange={(e) => setStudentOrStaffId(e.target.value)}
                    placeholder="e.g., ENR-2026-042"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., Computer Science & Engineering"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:border-blue-600 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-2.5 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating Profile...' : 'Complete Registration'}
              </button>

              <p className="text-center text-xs text-slate-500 pt-1">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-blue-600 hover:underline font-bold"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
