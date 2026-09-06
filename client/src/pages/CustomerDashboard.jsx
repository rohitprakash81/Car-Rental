import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCustomerBookings } from '../store/slices/bookingsSlice';
import { fetchCustomerCars } from '../store/slices/carsSlice';
import { openAuthModal } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import { initiateRazorpayPayment } from '../services/razorpay';
import Pagination from '../components/Pagination';
import BookingModal from '../components/BookingModal';
import {
  CalendarCheck,
  MapPin,
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';

export default function CustomerDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    customerBookings: bookings,
    customerPagination,
    loading,
    error,
  } = useSelector((state) => state.bookings);
  const { cars } = useSelector((state) => state.cars);

  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'ACCEPTED' | 'CONFIRMED' | 'REJECTED'
  const [payingBookingId, setPayingBookingId] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (user) {
      dispatch(fetchCustomerBookings({ page, size: 5 }));
      dispatch(fetchCustomerCars({ page: 0, size: 50 }));
    }
  }, [user, dispatch, page]);

  const handlePayNow = async (booking) => {
    const bookingId = booking.id || booking.bookingId || booking.booking?.id;
    if (!bookingId) {
      dispatch(showToast({ message: 'Invalid booking for payment', type: 'error' }));
      return;
    }
    setPayingBookingId(bookingId);
    await initiateRazorpayPayment({
      bookingId,
      user,
      onSuccess: () => {
        dispatch(showToast('Payment verified successfully! Trip is confirmed.'));
        dispatch(fetchCustomerBookings());
        setPayingBookingId(null);
      },
      onError: (err) => {
        dispatch(showToast({ message: err, type: 'error' }));
        setPayingBookingId(null);
      },
    });
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
          <CalendarCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Sign In Required</h2>
        <p className="text-xs text-slate-400">
          Please sign in with your Customer account to view your trip bookings, make payments, and
          track reservation status.
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

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACCEPTED') return b.status === 'ACCEPTED' || b.status === 'AWAITING_PAYMENT';
    if (filter === 'CONFIRMED') return b.status === 'CONFIRMED' || b.status === 'PAID';
    return b.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'PAID':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm shadow-emerald-500/10">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Trip Confirmed & Paid
          </span>
        );
      case 'ACCEPTED':
      case 'AWAITING_PAYMENT':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5 animate-pulse">
            <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
            Payment Required
          </span>
        );
      case 'REJECTED':
      case 'CANCELLED':
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
            Pending Owner Review
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
            Passenger Reservation Center
          </div>
          <h1 className="text-3xl font-extrabold text-white">My Trips & Reservations</h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setIsBookingModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            Book a New Trip
          </button>

          {/* Filter buttons */}
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto flex-wrap gap-1">
            {[
              { id: 'ALL', label: 'All Trips' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'ACCEPTED', label: 'Payment Due' },
              { id: 'CONFIRMED', label: 'Confirmed' },
              { id: 'REJECTED', label: 'Declined' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Backend API: {error}</span>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-32 bg-slate-900/40 rounded-3xl border border-slate-800 animate-pulse flex items-center justify-center text-xs text-slate-500"
            >
              Loading your bookings from backend...
            </div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-4">
          <Car className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Trips Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filter === 'ALL'
              ? 'You haven’t booked any vehicles yet. Explore available cars and start your journey!'
              : `No bookings matching "${filter}".`}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              Create a Trip Reservation
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60 text-xs font-medium transition-all"
            >
              <Car className="w-3.5 h-3.5" />
              Browse Full Fleet Showcase
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5">
            {filteredBookings.map((booking, index) => {
              const isPaymentDue =
                booking.status === 'ACCEPTED' || booking.status === 'AWAITING_PAYMENT';
              const isConfirmed = booking.status === 'CONFIRMED' || booking.status === 'PAID';
              const bookingKey = booking.id
                ? `cust-booking-${booking.id}`
                : `cust-booking-${index}`;

              return (
                <div
                  key={bookingKey}
                  className={`bg-slate-900/80 border rounded-3xl p-6 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                    isPaymentDue
                      ? 'border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                      : isConfirmed
                        ? 'border-emerald-500/30'
                        : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 ${
                        isConfirmed
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400'
                      }`}
                    >
                      <Car className="w-7 h-7" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-bold text-white">
                          {booking.carName || 'Self Drive Rental'}
                        </h3>
                        <span className="text-xs font-mono bg-slate-950 px-2.5 py-1 rounded-lg text-slate-400 border border-slate-800">
                          {booking.vehicleNumber || `Booking #${booking.id}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-xs text-slate-300 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-indigo-400" />
                          <span>
                            Date: <strong>{booking.journeyDate}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-emerald-400" />
                          <span>
                            Route: <strong>{booking.source}</strong> →{' '}
                            <strong>{booking.destination}</strong>
                          </span>
                        </div>
                      </div>

                      {isPaymentDue && (
                        <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5 inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            Car Owner approved your request! Complete payment to guarantee your car
                            reservation.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                    {getStatusBadge(booking.status)}

                    {isPaymentDue && (
                      <button
                        onClick={() => handlePayNow(booking)}
                        disabled={payingBookingId === booking.id}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>
                          {payingBookingId === booking.id ? 'Processing...' : 'Pay Now (Razorpay)'}
                        </span>
                      </button>
                    )}

                    {isConfirmed && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Ready for Pickup</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {customerPagination && (
            <Pagination
              currentPage={customerPagination.pageNumber}
              totalPages={customerPagination.totalPages}
              totalElements={customerPagination.totalElements}
              pageSize={customerPagination.pageSize}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </>
      )}

      {/* Direct In-Dashboard Trip Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        availableCars={cars}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          dispatch(fetchCustomerBookings({ page: 0, size: 5 }));
        }}
      />
    </div>
  );
}
