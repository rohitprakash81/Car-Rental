import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store from './store';
import { checkAuth, setUser } from './store/slices/authSlice';
import { hideToast, showToast } from './store/slices/toastSlice';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import CustomerDashboard from './pages/CustomerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AddCarPage from './pages/AddCarPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

function ToastContainer() {
  const toastMessage = useSelector((state) => state.toast);
  const dispatch = useDispatch();

  useEffect(() => {
    if (toastMessage && toastMessage.message) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, dispatch]);

  if (!toastMessage || !toastMessage.message) return null;

  const isError = toastMessage.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div
        className={`px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center gap-3 text-sm font-medium ${
          isError
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
        }`}
      >
        {isError ? (
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        )}
        <span>{toastMessage.message}</span>
        <button
          onClick={() => dispatch(hideToast())}
          className="ml-2 hover:opacity-75 transition-opacity"
          aria-label="Close notification"
        >
          <X className="w-4 h-4 opacity-70 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
}

function MainLayout() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Attempt silent cookie session restoration on initial page load
    dispatch(checkAuth());

    const handleUnauthorized = () => {
      // Clear user state when refresh token is revoked or session expired (NO loop)
      dispatch(setUser(null));
    };

    const handleRateLimit = (event) => {
      dispatch(
        showToast({
          message: event.detail?.message || 'Rate limit reached. Please wait before retrying.',
          type: 'error',
        })
      );
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    window.addEventListener('rate-limit:exceeded', handleRateLimit);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      window.removeEventListener('rate-limit:exceeded', handleRateLimit);
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/my-bookings" element={<CustomerDashboard />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/add-car" element={<AddCarPage />} />
          <Route path="/admin" element={<SuperAdminDashboard />} />
        </Routes>
      </main>
      <Footer />
      <AuthModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <MainLayout />
      </Router>
    </Provider>
  );
}
