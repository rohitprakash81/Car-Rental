import { Fuel, Users, ShieldCheck, Star, Car as CarIcon, Gauge } from 'lucide-react';

export default function CarCard({ car, onBook, isOwnerView = false }) {
  return (
    <div className="group bg-slate-900/70 backdrop-blur-md rounded-3xl overflow-hidden border border-slate-800/80 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between">
      
      {/* Car Image with Badge overlay */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-950">
        <img
          src={car.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <Fuel className="w-3 h-3" />
            {car.fuelType}
          </span>
        </div>

        <div className="absolute top-4 right-4">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {car.rating || '4.9'}
          </span>
        </div>

        {/* Bottom Vehicle No */}
        <div className="absolute bottom-3 left-4">
          <span className="text-[11px] font-mono tracking-wider bg-slate-900/90 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
            {car.vehicleNumber || 'REG-PENDING'}
          </span>
        </div>
      </div>

      {/* Car Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-indigo-400 mb-1">
            {car.brand}
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
            {car.model}
          </h3>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 py-3 border-y border-slate-800/80">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span>{car.seatingCapacity} Seater</span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-slate-400" />
            <span>₹{car.pricePerKm}/km</span>
          </div>
          <div className="flex items-center gap-2 col-span-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Free Cancellation & Insurance</span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-2xl font-extrabold text-white">
              ₹{car.pricePerDay.toLocaleString('en-IN')}
              <span className="text-xs font-normal text-slate-400"> /day</span>
            </div>
          </div>

          {isOwnerView ? (
            <div className="px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Active Listing
            </div>
          ) : (
            <button
              onClick={() => onBook(car)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <CarIcon className="w-4 h-4 text-indigo-200" />
              Book Now
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
