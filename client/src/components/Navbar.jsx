import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser, openAuthModal } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import {
  Car,
  User,
  LogOut,
  PlusCircle,
  CalendarCheck,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  ShieldAlert,
} from 'lucide-react';

export default function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const isSuperAdmin =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'Role_SuperAdmin' ||
    user?.role?.toUpperCase()?.includes('ADMIN') ||
    user?.email === 'superadmin@carrental.com';
  const isCarOwner = !isSuperAdmin && (user?.role === 'CarOwner' || user?.role === 'CAR_OWNER');
  const isCustomer = user?.role === 'Customer' || user?.role === 'CUSTOMER';

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(showToast('Logged out and tokens revoked successfully'));
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-2xl bg-slate-950/80 border-b border-slate-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Car className="w-6 h-6 text-indigo-400 group-hover:text-emerald-400 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Drive<span className="text-indigo-400">Prime</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-medium text-slate-400">
                Premium Fleet & Rentals
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/60">
            <Link
              to="/"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive('/')
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Explore Fleet
            </Link>

            {isCustomer && (
              <Link
                to="/my-bookings"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive('/my-bookings')
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                My Trips
              </Link>
            )}

            {isCarOwner && (
              <>
                <Link
                  to="/owner-dashboard"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive('/owner-dashboard')
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Owner Portal
                </Link>
                <Link
                  to="/add-car"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive('/add-car')
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-500/25'
                      : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  List a Car
                </Link>
              </>
            )}

            {isSuperAdmin && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive('/admin')
                    ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-md shadow-purple-500/25'
                    : 'text-purple-300 hover:text-white hover:bg-purple-500/10'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                Super Admin
              </Link>
            )}
          </div>

          {/* Desktop Right User Controls */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-inner border border-white/10 ${
                      isSuperAdmin
                        ? 'bg-gradient-to-br from-rose-500 to-purple-600'
                        : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                    }`}
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white leading-snug">
                      {user.name || 'User'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-400">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      {isSuperAdmin ? 'Super Admin' : isCarOwner ? 'Car Owner' : 'Customer'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-2"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => dispatch(openAuthModal('login'))}
                  className="px-5 py-2.5 rounded-full text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/80 transition-all border border-slate-800"
                >
                  Sign In
                </button>
                <button
                  onClick={() => dispatch(openAuthModal('register'))}
                  className="px-5 py-2.5 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-900"
          >
            Explore Fleet
          </Link>

          {isCustomer && (
            <Link
              to="/my-bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-900"
            >
              My Trips
            </Link>
          )}

          {isCarOwner && (
            <>
              <Link
                to="/owner-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-900"
              >
                Owner Portal
              </Link>
              <Link
                to="/add-car"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-base font-medium text-emerald-400 hover:bg-emerald-500/10"
              >
                + List a Car
              </Link>
            </>
          )}

          {isSuperAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-base font-medium text-purple-300 hover:bg-purple-900/20"
            >
              🛡️ Super Admin Center
            </Link>
          )}

          <div className="pt-4 border-t border-slate-800">
            {user ? (
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{user.name}</div>
                    <div className="text-xs text-indigo-400">
                      {isSuperAdmin ? 'Super Admin' : isCarOwner ? 'Car Owner' : 'Customer'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 text-rose-400"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    dispatch(openAuthModal('login'));
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white font-medium text-center border border-slate-800"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    dispatch(openAuthModal('register'));
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium text-center shadow-lg shadow-indigo-600/30"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
