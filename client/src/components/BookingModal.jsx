import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bookCarThunk } from '../store/slices/bookingsSlice';
import { openAuthModal } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import { X, Calendar, MapPin, CheckCircle, Car, Shield } from 'lucide-react';

export default function BookingModal({
  car: initialCar,
  availableCars = [],
  isOpen,
  onClose,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading: submitting } = useSelector((state) => state.bookings);

  const [selectedCarId, setSelectedCarId] = useState(initialCar?.id || '');
  const [formData, setFormData] = useState({
    journeyDate: new Date().toISOString().split('T')[0],
    source: 'Gurugram',
    destination: 'Jaipur',
  });

  useEffect(() => {
    if (initialCar) {
      setSelectedCarId(initialCar.id);
    } else if (availableCars.length > 0 && !selectedCarId) {
      setSelectedCarId(availableCars[0].id);
    }
  }, [initialCar, availableCars, selectedCarId]);

  if (!isOpen) return null;

  const activeCar =
    initialCar ||
    availableCars.find((c) => String(c.id) === String(selectedCarId)) ||
    availableCars[0];

  if (!activeCar) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 text-center space-y-4 shadow-2xl">
          <Car className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Vehicles Available</h3>
          <p className="text-xs text-slate-400">
            There are currently no approved vehicles ready for booking. Please check back soon or
            contact support.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      dispatch(showToast({ message: 'Please sign in to place a booking request.', type: 'error' }));
      dispatch(openAuthModal('login'));
      return;
    }

    if (user.role === 'CarOwner' || user.role === 'CAR_OWNER') {
      dispatch(
        showToast({
          message: 'You are logged in as a Car Owner. Please login as a Customer to book cars.',
          type: 'error',
        })
      );
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (formData.journeyDate < todayStr) {
      dispatch(showToast({ message: 'Journey date cannot be in the past', type: 'error' }));
      return;
    }

    const result = await dispatch(
      bookCarThunk({
        carId: activeCar.id,
        bookingDetails: {
          journeyDate: formData.journeyDate,
          source: formData.source.trim(),
          destination: formData.destination.trim(),
        },
      })
    );

    if (bookCarThunk.fulfilled.match(result)) {
      dispatch(showToast('Booking request sent successfully to car owner!'));
      if (onSuccess) onSuccess();
      onClose();
    } else {
      dispatch(
        showToast({ message: result.payload || 'Failed to submit booking request', type: 'error' })
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="relative h-28 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-6 flex items-end justify-between border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="z-10">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-300">
              {initialCar ? 'Reserve Vehicle' : 'Create a Trip Booking'}
            </span>
            <h2 className="text-2xl font-extrabold text-white">
              {activeCar.brand} {activeCar.model}
            </h2>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Car Picker if opened from Dashboard without a preselected car */}
          {!initialCar && availableCars.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-indigo-400" />
                Select Vehicle from Fleet
              </label>
              <select
                value={activeCar.id}
                onChange={(e) => setSelectedCarId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {availableCars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.brand} {c.model} ({c.vehicleNumber || 'No Plate'}) — ₹{c.pricePerDay}/day (
                    {c.fuelType})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Car Info Bar */}
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <Car className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <div className="text-white font-medium">
                  {activeCar.brand} {activeCar.model}
                </div>
                <div className="text-xs text-slate-400">
                  {activeCar.vehicleNumber} • {activeCar.fuelType} • {activeCar.seatingCapacity}{' '}
                  Seats
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-emerald-400">₹{activeCar.pricePerDay}</div>
              <div className="text-[10px] text-slate-400">per day rate</div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Journey Date */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Journey Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.journeyDate}
                onChange={(e) => setFormData({ ...formData, journeyDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Source & Destination Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  Pickup City (Source)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gurugram"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Destination
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jaipur"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Guarantee info */}
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Real-time booking request submitted directly to Car Owner. Payment is required only
              after approval.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>Submitting Request...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-indigo-200" />
                  Confirm & Book Trip
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
