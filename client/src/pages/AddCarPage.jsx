import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { registerCar } from '../store/slices/carsSlice';
import { openAuthModal } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import { 
  Car, 
  Fuel, 
  Users, 
  DollarSign, 
  Gauge, 
  FileText, 
  Image as ImageIcon, 
  ArrowLeft,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function AddCarPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading: submitting, error } = useSelector((state) => state.cars);

  const [formData, setFormData] = useState({
    vehicleNumber: '',
    brand: 'Toyota',
    model: '',
    fuelType: 'Diesel',
    seatingCapacity: 5,
    pricePerDay: 2500,
    pricePerKm: 15,
    imageUrl: ''
  });

  if (!user || user.role !== 'CarOwner') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
          <Car className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Car Owner Account Required</h2>
        <p className="text-xs text-slate-400">
          Only registered Car Owners can list vehicles. Please sign in as a Car Owner.
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('price') || name === 'seatingCapacity' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(registerCar(formData));

    if (registerCar.fulfilled.match(res)) {
      dispatch(showToast('Vehicle registered successfully on backend!'));
      navigate('/owner-dashboard');
    } else {
      dispatch(showToast({ message: res.payload || 'Failed to register car', type: 'error' }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      
      {/* Top Back Link */}
      <button
        onClick={() => navigate('/owner-dashboard')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Owner Dashboard
      </button>

      {/* Form Container Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-8 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            Backend Listing Endpoint (/carOwner/registerCar)
          </div>
          <h1 className="text-3xl font-extrabold text-white">Register a New Car</h1>
          <p className="text-xs text-slate-400 mt-1">
            Fill in the details below to add your car directly to the Spring Boot backend database.
          </p>
        </div>

        {error && (
          <div className="mx-8 mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Vehicle Number */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                Vehicle Number Plate
              </label>
              <input
                type="text"
                name="vehicleNumber"
                required
                placeholder="e.g. HR26AB1234"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 uppercase tracking-wider font-mono"
              />
            </div>

            {/* Brand Dropdown */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-emerald-400" />
                Car Brand
              </label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="Toyota">Toyota</option>
                <option value="Hyundai">Hyundai</option>
                <option value="BMW">BMW</option>
                <option value="Mercedes-Benz">Mercedes-Benz</option>
                <option value="Tata">Tata</option>
                <option value="Mahindra">Mahindra</option>
                <option value="Kia">Kia</option>
                <option value="Audi">Audi</option>
                <option value="Honda">Honda</option>
              </select>
            </div>

            {/* Car Model */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                Model Name & Trim
              </label>
              <input
                type="text"
                name="model"
                required
                placeholder="e.g. Innova Crysta / Creta SX"
                value={formData.model}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                Fuel Type
              </label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            {/* Seating Capacity */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Seating Capacity
              </label>
              <input
                type="number"
                name="seatingCapacity"
                required
                min="2"
                max="10"
                value={formData.seatingCapacity}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Price Per Day */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Price Per Day (₹)
              </label>
              <input
                type="number"
                name="pricePerDay"
                required
                min="500"
                step="100"
                value={formData.pricePerDay}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Price Per Km */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                Price Per Kilometer (₹)
              </label>
              <input
                type="number"
                name="pricePerKm"
                required
                min="5"
                step="1"
                value={formData.pricePerKm}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                Image URL (Optional)
              </label>
              <input
                type="url"
                name="imageUrl"
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/owner-dashboard')}
              className="px-6 py-3 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <span>Registering on Backend...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  List Vehicle Now
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
