import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, registerUser, closeAuthModal, openAuthModal } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import { X, Mail, Lock, User, Phone, MapPin, FileCheck, Shield, Sparkles, LogIn, AlertCircle } from 'lucide-react';

export default function AuthModal() {
  const dispatch = useDispatch();
  const { isAuthModalOpen, authModalMode, loading, error } = useSelector((state) => state.auth);

  const [role, setRole] = useState('Customer'); // 'Customer' | 'CarOwner'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    licenseNumber: ''
  });

  if (!isAuthModalOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (authModalMode === 'login') {
      const res = await dispatch(
        loginUser({
          credentials: { email: formData.email, password: formData.password },
          role
        })
      );

      if (loginUser.fulfilled.match(res)) {
        dispatch(showToast(`Welcome back, ${res.payload.user.name}!`));
      } else {
        dispatch(showToast(res.payload || 'Login failed', { type: 'error' }));
      }
    } else {
      const res = await dispatch(
        registerUser({
          userData: formData,
          role
        })
      );

      if (registerUser.fulfilled.match(res)) {
        dispatch(showToast(`Registered successfully as ${role === 'CarOwner' ? 'Car Owner' : 'Customer'}!`));
      } else {
        dispatch(showToast(res.payload || 'Registration failed', { type: 'error' }));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800">
          <button
            onClick={() => dispatch(closeAuthModal())}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">
              DrivePrime Portal
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-white">
            {authModalMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {authModalMode === 'login' 
              ? 'Select your role and sign in to continue' 
              : 'Join as a Customer or list your vehicles as a Car Owner'}
          </p>
        </div>

        {/* Tab & Role Selector */}
        <div className="p-6 pb-2 space-y-4">
          
          {/* Mode Switch (Login / Register) */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => dispatch(openAuthModal('login'))}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                authModalMode === 'login'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => dispatch(openAuthModal('register'))}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                authModalMode === 'register'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Role Switcher (Customer / CarOwner) */}
          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1.5">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('Customer')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  role === 'Customer'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <User className="w-4 h-4" />
                Customer
              </button>

              <button
                type="button"
                onClick={() => setRole('CarOwner')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  role === 'CarOwner'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Shield className="w-4 h-4" />
                Car Owner
              </button>
            </div>
          </div>

        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="mx-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-3.5">
          
          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {authModalMode === 'register' && (
            <>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    name="phoneNumber"
                    required
                    placeholder="9876543210"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Address / City</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="Gurugram, Haryana"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {role === 'CarOwner' && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Driver License Number</label>
                  <div className="relative">
                    <FileCheck className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      name="licenseNumber"
                      required
                      placeholder="DL123456789"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating with Backend...</span>
            ) : authModalMode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                Sign In as {role === 'CarOwner' ? 'Owner' : 'Customer'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                Complete {role === 'CarOwner' ? 'Owner' : 'Customer'} Registration
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
