import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCustomerCars } from '../store/slices/carsSlice';
import { 
  Search, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Sparkles,
  Car as CarIcon
} from 'lucide-react';
import CarCard from '../components/CarCard';
import BookingModal from '../components/BookingModal';

export default function Home() {
  const dispatch = useDispatch();
  const { cars, loading } = useSelector((state) => state.cars);

  const [selectedCar, setSelectedCar] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedFuel, setSelectedFuel] = useState('All');
  const [maxPrice, setMaxPrice] = useState(10000);

  useEffect(() => {
    dispatch(fetchCustomerCars());
  }, [dispatch]);

  const handleBook = (car) => {
    setSelectedCar(car);
    setIsBookingOpen(true);
  };

  // Extract unique brands for filter
  const brands = ['All', ...new Set(cars.map(c => c.brand).filter(Boolean))];

  const filteredCars = cars.filter(car => {
    const matchesSearch = 
      (car.brand && car.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (car.model && car.model.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (car.vehicleNumber && car.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBrand = selectedBrand === 'All' || car.brand === selectedBrand;
    const matchesFuel = selectedFuel === 'All' || car.fuelType === selectedFuel;
    const matchesPrice = !car.pricePerDay || car.pricePerDay <= maxPrice;

    return matchesSearch && matchesBrand && matchesFuel && matchesPrice;
  });

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        
        {/* Glow effect backdrops */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/20 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 text-indigo-400 text-xs font-semibold mb-6 shadow-xl backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Next-Gen Self Drive Car Rental Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Drive Your Freedom. <br className="hidden sm:inline" />
            Rent Luxury & Daily Cars <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">Instantly.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Direct real-time Spring Boot backend integration. Choose from verified vehicles, transparent daily rates, and zero security deposit hassle.
          </p>

          {/* Quick Stats Bar */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-800/80">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-white">Spring Boot</div>
              <div className="text-xs text-slate-400 font-medium">Backend Server</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">Redux Toolkit</div>
              <div className="text-xs text-slate-400 font-medium">State Management</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-indigo-400">REST API</div>
              <div className="text-xs text-slate-400 font-medium">Full Integration</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-white">100%</div>
              <div className="text-xs text-slate-400 font-medium">Insured Fleet</div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Fleet Exploration Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">Backend Fleet API</div>
            <h2 className="text-3xl font-extrabold text-white mt-1">Explore Available Cars</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
  Filter vehicles by brand, fuel type, or daily budget. Click "Book Now" to send a live request to backend endpoint `/customer/bookCar/{'{'}carId{'}'}`.
</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900/80 p-4 rounded-3xl border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Search Input */}
            <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search brand, model, vehicle no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Brand Filter */}
            <div>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {brands.map(brand => (
                  <option key={brand} value={brand}>
                    Brand: {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Fuel Type Filter */}
            <div>
              <select
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="All">Fuel: All Types</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="flex flex-col justify-center px-2">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Max Price:</span>
                <span className="font-bold text-indigo-400">₹{maxPrice}/day</span>
              </div>
              <input
                type="range"
                min="1000"
                max="15000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

          </div>

        </div>

        {/* Cars Grid View */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-slate-900/50 rounded-3xl h-80 border border-slate-800 animate-pulse flex items-center justify-center text-xs text-slate-500">
                Fetching backend API...
              </div>
            ))}
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8">
            <CarIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Vehicles Returned from Backend</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              If the Spring Boot server is running on localhost:1571, add cars via the Owner Portal to populate the fleet.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBrand('All');
                setSelectedFuel('All');
                setMaxPrice(15000);
                dispatch(fetchCustomerCars());
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Refresh Backend Cars
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map(car => (
              <CarCard
                key={car.id || car.vehicleNumber}
                car={car}
                onBook={handleBook}
              />
            ))}
          </div>
        )}

      </section>

      {/* Feature Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 border-t border-slate-900">
        <div className="text-center mb-12">
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">Spring Boot + Redux Architecture</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">Built for Full Stack Production</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Redux Toolkit Slices</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Global state managed cleanly with Redux slices (`authSlice`, `carsSlice`, `bookingsSlice`, `toastSlice`).
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Pure API Calls</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct interaction with Spring Boot REST API (`/auth/*`, `/customer/*`, `/carOwner/*`) with zero static dummy mock fallbacks.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 hover:border-purple-500/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Async Thunks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clean asynchronous API lifecycle handling with automatic loading, success, and error dispatchers.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal
        car={selectedCar}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => dispatch(fetchCustomerCars())}
      />

    </div>
  );
}
