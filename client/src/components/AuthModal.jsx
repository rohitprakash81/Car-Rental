import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, registerUser, closeAuthModal, openAuthModal } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  FileCheck,
  Shield,
  Sparkles,
  LogIn,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export default function AuthModal() {
  const dispatch = useDispatch();
  const { isAuthModalOpen, authModalMode, loading, error } = useSelector((state) => state.auth);

  const [role, setRole] = useState('Customer'); // 'Customer' | 'CarOwner' | 'SUPER_ADMIN'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    licenseNumber: '',
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
          role,
        })
      );

      if (loginUser.fulfilled.match(res)) {
        dispatch(showToast(`Welcome back, ${res.payload.user?.name || 'User'}!`));
      } else {
        dispatch(showToast({ message: res.payload || 'Login failed', type: 'error' }));
      }
    } else {
      if (!formData.name || formData.name.trim().length < 2) {
        dispatch(showToast({ message: 'Name must be at least 2 characters long', type: 'error' }));
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        dispatch(showToast({ message: 'Please enter a valid email address', type: 'error' }));
        return;
      }
      if (!formData.password || formData.password.length < 8) {
        dispatch(
          showToast({ message: 'Password must be at least 8 characters long', type: 'error' })
        );
        return;
      }
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        dispatch(
          showToast({
            message: 'Please enter a valid 10-digit Indian phone number starting with 6-9',
            type: 'error',
          })
        );
        return;
      }
      if (!formData.address || !formData.address.trim()) {
        dispatch(showToast({ message: 'Address is required', type: 'error' }));
        return;
      }
      if (role === 'CarOwner') {
        const licenseRegex = /^[A-Za-z0-9-]{5,30}$/;
        if (!licenseRegex.test(formData.licenseNumber)) {
          dispatch(
            showToast({
              message: 'Driving license must be between 5 and 30 alphanumeric characters',
              type: 'error',
            })
          );
          return;
        }
      }

      const res = await dispatch(
        registerUser({
          userData: formData,
          role,
        })
      );

      if (registerUser.fulfilled.match(res)) {
        dispatch(
          showToast(`Registered successfully as ${role === 'CarOwner' ? 'Car Owner' : 'Customer'}!`)
        );
      } else {
        dispatch(showToast({ message: res.payload || 'Registration failed', type: 'error' }));
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
              ? 'Select your role and sign in with secure HttpOnly cookies'
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
              onClick={() => {
                dispatch(openAuthModal('register'));
                if (role === 'SUPER_ADMIN') setRole('Customer');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                authModalMode === 'register'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Role Switcher */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] uppercase font-bold text-slate-400">Account Role</label>
            </div>

            <div
              className={`grid gap-2 ${authModalMode === 'login' ? 'grid-cols-3' : 'grid-cols-2'}`}
            >
              <button
                type="button"
                onClick={() => setRole('Customer')}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  role === 'Customer'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Customer
              </button>

              <button
                type="button"
                onClick={() => setRole('CarOwner')}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  role === 'CarOwner'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Car Owner
              </button>

              {authModalMode === 'login' && (
                <button
                  type="button"
                  onClick={() => setRole('SUPER_ADMIN')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    role === 'SUPER_ADMIN'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Admin
                </button>
              )}
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
                  minLength={2}
                  maxLength={50}
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
            <label className="block text-xs text-slate-400 mb-1">
              Password {authModalMode === 'register' && '(min 8 characters)'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="password"
                name="password"
                required
                minLength={authModalMode === 'register' ? 8 : 1}
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
                <label className="block text-xs text-slate-400 mb-1">
                  Phone Number (10-digit Indian Mobile)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    required
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    title="10-digit Indian mobile number starting with 6, 7, 8, or 9"
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
                    maxLength={255}
                    placeholder="Gurugram, Haryana"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {role === 'CarOwner' && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Driver License Number (5-30 characters)
                  </label>
                  <div className="relative">
                    <FileCheck className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      name="licenseNumber"
                      required
                      minLength={5}
                      maxLength={30}
                      pattern="[A-Za-z0-9-]{5,30}"
                      title="5 to 30 alphanumeric characters or hyphens"
                      placeholder="DL123456789"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 uppercase font-mono"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 py-3 rounded-xl font-bold text-sm shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-white ${
              role === 'SUPER_ADMIN'
                ? 'bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 shadow-purple-500/25 hover:shadow-purple-500/40'
                : 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 shadow-indigo-500/25 hover:shadow-indigo-500/40'
            }`}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : authModalMode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                Sign In as{' '}
                {role === 'SUPER_ADMIN'
                  ? 'Super Admin'
                  : role === 'CarOwner'
                    ? 'Owner'
                    : 'Customer'}
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
