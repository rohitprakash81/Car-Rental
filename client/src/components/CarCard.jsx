import {
  Fuel,
  Users,
  ShieldCheck,
  Star,
  Car as CarIcon,
  Gauge,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

export default function CarCard({ car, onBook, isOwnerView = false }) {
  const isApproved = car.approvalStatus === 'APPROVED';
  const isPendingApproval = car.approvalStatus === 'PENDING';

  const defaultImages = {
    Petrol:
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    Diesel:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    Electric:
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
    Hybrid:
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  };

  const carImg = car.imageUrl || defaultImages[car.fuelType] || defaultImages.Petrol;

  return (
    <div className="group bg-slate-900/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-800/80 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between">
      {/* Car Image with Badge overlay */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-950">
        <img
          src={carImg}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = defaultImages.Petrol;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-90" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-md">
            <Fuel className="w-3 h-3" />
            {car.fuelType}
          </span>

          {isOwnerView &&
            (isApproved ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Live in Fleet
              </span>
            ) : isPendingApproval ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                Under Admin Review
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md flex items-center gap-1">
                <XCircle className="w-3 h-3 text-rose-400" />
                Declined
              </span>
            ))}
        </div>

        <div className="absolute top-4 right-4">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-950/80 text-amber-300 border border-slate-800 backdrop-blur-md flex items-center gap-1 shadow-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {car.rating || '4.9'}
          </span>
        </div>

        {/* Bottom Vehicle No */}
        <div className="absolute bottom-3 left-4">
          <span className="text-[11px] font-mono tracking-wider bg-slate-900/90 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 shadow-sm">
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
          <h3 className="text-xl font-black text-white group-hover:text-indigo-300 transition-colors">
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
            <span>₹{car.pricePerKm}/km rate</span>
          </div>
          <div className="flex items-center gap-2 col-span-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified RC & Insurance</span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-2xl font-black text-white">
              ₹{(car.pricePerDay || 0).toLocaleString('en-IN')}
              <span className="text-xs font-normal text-slate-400"> /day</span>
            </div>
          </div>

          {isOwnerView ? (
            <div className="text-xs text-slate-400 font-medium bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              Listing #{car.id}
            </div>
          ) : (
            <button
              onClick={() => onBook(car)}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-2"
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
