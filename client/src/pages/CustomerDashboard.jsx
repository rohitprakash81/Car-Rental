import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCustomerBookings } from '../store/slices/bookingsSlice';
import { openAuthModal } from '../store/slices/authSlice';
import { 
  CalendarCheck, 
  MapPin, 
  Car, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles
} from 'lucide-react';

export default function CustomerDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { customerBookings: bookings, loading, error } = useSelector((state) => state.bookings);

  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'

  useEffect(() => {
    if (user) {
      dispatch(fetchCustomerBookings());
    }
  }, [user, dispatch]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
          <CalendarCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Sign In Required</h2>
        <p className="text-xs text-slate-400">
          Please sign in with your Customer account to view your trip bookings and status directly from the Spring Boot backend.
        </p>
        <button
          onClick={() => dispatch(openAuthModal('login'))}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30"
        >
          Sign In as Customer
        </button>
      </div>
    );
  }

  const filteredBookings = bookings.filter(b => {
    if (filter === 'ALL') return true;
    return b.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Accepted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            Declined
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Pending Approval
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Customer Portal (Backend Synced)
          </div>
          <h1 className="text-3xl font-extrabold text-white">My Trips & Bookings</h1>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
          {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === type
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {type === 'ALL' ? 'All Bookings' : type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          Backend API Error: {error}
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-32 bg-slate-900/40 rounded-2xl border border-slate-800 animate-pulse flex items-center justify-center text-xs text-slate-500">
              Loading customer bookings from backend...
            </div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-3">
          <Car className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Bookings Returned from Backend</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filter === 'ALL' 
              ? 'You haven’t booked any cars yet. Browse available cars and schedule your trip!' 
              : `No bookings found matching status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map(booking => (
            <div
              key={booking.id || Math.random()}
              className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Car className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-bold text-white">
                      {booking.carName || 'Vehicle Booking'}
                    </h3>
                    <span className="text-xs font-mono bg-slate-950 px-2.5 py-1 rounded-lg text-slate-400 border border-slate-800">
                      {booking.vehicleNumber || `Booking #${booking.id}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-slate-300 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span>Date: <strong>{booking.journeyDate}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>
                        Route: <strong>{booking.source}</strong> → <strong>{booking.destination}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                {getStatusBadge(booking.status)}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
