import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOwnerPendingBookings, updateBookingStatusThunk } from '../store/slices/bookingsSlice';
import { fetchOwnerCars } from '../store/slices/carsSlice';
import { openAuthModal } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import { 
  Car, 
  PlusCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  LayoutDashboard,
  Layers,
  Sparkles
} from 'lucide-react';
import CarCard from '../components/CarCard';

export default function OwnerDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { ownerPendingBookings: pendingBookings, actionLoadingId } = useSelector((state) => state.bookings);
  const { ownerCars, loading } = useSelector((state) => state.cars);

  useEffect(() => {
    if (user) {
      dispatch(fetchOwnerPendingBookings());
      dispatch(fetchOwnerCars());
    }
  }, [user, dispatch]);

  const handleBookingAction = async (bookingId, status) => {
    const res = await dispatch(updateBookingStatusThunk({ bookingId, status }));
    if (updateBookingStatusThunk.fulfilled.match(res)) {
      dispatch(showToast(`Booking request ${status.toLowerCase()} on backend!`));
      dispatch(fetchOwnerPendingBookings());
    } else {
      dispatch(showToast({ message: res.payload || 'Failed to update status', type: 'error' }));
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
          <LayoutDashboard className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Car Owner Portal</h2>
        <p className="text-xs text-slate-400">
          Please sign in with your Car Owner account to manage your listings and approve customer bookings on the Spring Boot backend.
        </p>
        <button
          onClick={() => dispatch(openAuthModal('login'))}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30"
        >
          Sign In as Car Owner
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            Verified Car Owner Portal (Backend Synced)
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Welcome, {user.name || 'Owner'}
          </h1>
        </div>

        <Link
          to="/add-car"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Register New Vehicle
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{ownerCars.length}</div>
            <div className="text-xs text-slate-400">Total Listed Vehicles</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">{pendingBookings.length}</div>
            <div className="text-xs text-slate-400">Pending Requests</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400">Live API</div>
            <div className="text-xs text-slate-400">Spring Boot Sync</div>
          </div>
        </div>
      </div>

      {/* Pending Customer Requests Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Pending Booking Approvals
            {pendingBookings.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingBookings.length}
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="h-24 bg-slate-900/50 rounded-2xl animate-pulse flex items-center justify-center text-xs text-slate-500">
            Fetching pending bookings from backend...
          </div>
        ) : pendingBookings.length === 0 ? (
          <div className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800 text-center text-xs text-slate-400">
            No pending booking requests returned from Spring Boot API. New customer requests will show up here.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingBookings.map(req => (
              <div
                key={req.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Vehicle: {req.vehicleNumber || req.carName || `Car #${req.carId}`}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {req.customerName || 'Customer Request'}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-slate-300 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span>Date: <strong>{req.journeyDate}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>Route: <strong>{req.source}</strong> → <strong>{req.destination}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Approve / Reject Actions */}
                <div className="flex items-center gap-3 self-end md:self-auto">
                  <button
                    onClick={() => handleBookingAction(req.id, 'REJECTED')}
                    disabled={actionLoadingId === req.id}
                    className="px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>

                  <button
                    onClick={() => handleBookingAction(req.id, 'ACCEPTED')}
                    disabled={actionLoadingId === req.id}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept Booking
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Owner Vehicles Section */}
      <section className="space-y-6 pt-6 border-t border-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Your Listed Vehicles
          </h2>
          <Link
            to="/add-car"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            + Add Another Car
          </Link>
        </div>

        {ownerCars.length === 0 ? (
          <div className="bg-slate-900/40 p-12 rounded-3xl border border-slate-800 text-center space-y-3">
            <Car className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Vehicles Listed Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start listing your car on backend endpoint `/carOwner/registerCar`.
            </p>
            <Link
              to="/add-car"
              className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
            >
              Register Your Car Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownerCars.map(car => (
              <CarCard
                key={car.id || car.vehicleNumber}
                car={car}
                isOwnerView={true}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
