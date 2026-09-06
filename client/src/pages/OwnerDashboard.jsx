import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOwnerPendingBookings, updateBookingStatusThunk } from '../store/slices/bookingsSlice';
import { fetchOwnerCars } from '../store/slices/carsSlice';
import { openAuthModal } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import Pagination from '../components/Pagination';
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
  Sparkles,
  AlertTriangle,
  Info,
} from 'lucide-react';
import CarCard from '../components/CarCard';

export default function OwnerDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { ownerPendingBookings: pendingBookings, actionLoadingId } = useSelector(
    (state) => state.bookings
  );
  const { ownerCars, ownerPagination, loading } = useSelector((state) => state.cars);
  const [page, setPage] = useState(0);

  const isVerified = user?.isVerified || user?.verificationStatus === 'APPROVED';
  const isPending = user?.verificationStatus === 'PENDING';
  const isRejected = user?.verificationStatus === 'REJECTED';

  useEffect(() => {
    if (user) {
      dispatch(fetchOwnerPendingBookings());
      dispatch(fetchOwnerCars({ page, size: 6 }));
    }
  }, [user, dispatch, page]);

  const handleBookingAction = async (bookingId, status) => {
    if (!bookingId || bookingId === 'undefined') {
      dispatch(showToast({ message: 'Invalid booking identifier', type: 'error' }));
      return;
    }
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
          Please sign in with your Car Owner account to manage your listings and approve customer
          bookings on the Spring Boot backend.
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Verification Status Banner */}
      {isPending && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4 text-amber-200">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">
              Owner Account Pending Super Admin Verification
            </h3>
            <p className="text-xs text-amber-300/80 leading-relaxed">
              Your driving license and owner profile have been submitted for review. Super Admin
              will verify your documents shortly. You can list vehicles once your profile is
              approved.
            </p>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-4 text-rose-200">
          <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Owner Account Verification Declined</h3>
            <p className="text-xs text-rose-300/80 leading-relaxed">
              Super Admin did not approve your profile documentation. Please contact support or
              update your license credentials.
            </p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>{isVerified ? 'Verified Car Owner' : 'Car Owner Portal'}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Welcome back, {user.name || 'Owner'}
          </h1>
        </div>

        {isVerified ? (
          <Link
            to="/add-car"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Register New Vehicle
          </Link>
        ) : (
          <div className="text-xs text-slate-400 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400" />
            <span>Registration locked until verified</span>
          </div>
        )}
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
            <div className="text-xs text-slate-400">Pending Trip Requests</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400">
              {isVerified ? 'Verified' : 'Pending'}
            </div>
            <div className="text-xs text-slate-400">Super Admin Status</div>
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
            No pending booking requests right now. When a passenger reserves one of your cars, it
            will appear here for 1-click confirmation.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingBookings.map((req, index) => {
              const bookingId = req.id || req.bookingId || req.booking?.id;
              const carPlate =
                req.vehicleNumber ||
                req.car?.vehicleNumber ||
                req.booking?.car?.vehicleNumber ||
                (req.carId ? `Car #${req.carId}` : '');
              const carTitle =
                req.carName ||
                (req.car ? `${req.car.brand || ''} ${req.car.model || ''}`.trim() : '') ||
                (req.booking?.car
                  ? `${req.booking.car.brand || ''} ${req.booking.car.model || ''}`.trim()
                  : '') ||
                'Vehicle';
              const customerName =
                req.customerName ||
                req.customer?.name ||
                req.booking?.customer?.name ||
                req.customerEmail ||
                'Customer Request';
              const journeyDate = req.journeyDate || req.booking?.journeyDate || 'Not specified';
              const source = req.source || req.booking?.source || 'Pickup';
              const destination = req.destination || req.booking?.destination || 'Drop';

              const keyProp = bookingId ? `booking-${bookingId}` : `pending-req-${index}`;

              return (
                <div
                  key={keyProp}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {carPlate ? `${carPlate} • ` : ''}
                        {carTitle}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {customerName}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-slate-300 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        <span>
                          Date: <strong>{journeyDate}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>
                          Route: <strong>{source}</strong> → <strong>{destination}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Approve / Reject Actions */}
                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <button
                      onClick={() => handleBookingAction(bookingId, 'REJECTED')}
                      disabled={actionLoadingId === bookingId || !bookingId}
                      className="px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>

                    <button
                      onClick={() => handleBookingAction(bookingId, 'ACCEPTED')}
                      disabled={actionLoadingId === bookingId || !bookingId}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept Booking
                    </button>
                  </div>
                </div>
              );
            })}
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
          {isVerified && (
            <Link
              to="/add-car"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              + Add Another Car
            </Link>
          )}
        </div>

        {ownerCars.length === 0 ? (
          <div className="bg-slate-900/40 p-12 rounded-3xl border border-slate-800 text-center space-y-3">
            <Car className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Vehicles Listed Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isVerified
                ? 'Start listing your vehicle to earn from passenger rentals.'
                : 'Vehicle registration will unlock after Super Admin verifies your account.'}
            </p>
            {isVerified && (
              <Link
                to="/add-car"
                className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
              >
                Register Your Car Now
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownerCars.map((car) => (
                <CarCard key={car.id || car.vehicleNumber} car={car} isOwnerView={true} />
              ))}
            </div>

            {ownerPagination && (
              <Pagination
                currentPage={ownerPagination.pageNumber}
                totalPages={ownerPagination.totalPages}
                totalElements={ownerPagination.totalElements}
                pageSize={ownerPagination.pageSize}
                onPageChange={(newPage) => setPage(newPage)}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}
