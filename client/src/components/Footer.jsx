import { Car, Shield, Phone, Mail, MapPin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Car className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Drive<span className="text-indigo-400">Prime</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Experience seamless self-drive car rentals with zero hidden costs, verified vehicle
              owners, and 24/7 roadside assistance.
            </p>
            <div className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 w-fit">
              <Shield className="w-4 h-4 text-emerald-400" />
              100% Insured & Verified Fleet
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-indigo-400 transition-colors">
                  Explore All Cars
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-indigo-400 transition-colors">
                  Customer Portal
                </Link>
              </li>
              <li>
                <Link to="/owner-dashboard" className="hover:text-indigo-400 transition-colors">
                  Car Owner Portal
                </Link>
              </li>
              <li>
                <Link to="/add-car" className="hover:text-indigo-400 transition-colors">
                  Register Your Car
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">
              Vehicle Types
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="hover:text-white cursor-pointer transition-colors">
                Luxury SUVs (Innova, Thar)
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Premium Sedans (BMW, Mercedes)
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Compact Hatchbacks
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                EV & Hybrid Fleet (Nexon EV)
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">
              Support & Help
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-indigo-400" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>support@driveprime.com</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>Gurugram, Delhi NCR, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>© {new Date().getFullYear()} DrivePrime Rentals Inc. All rights reserved.</div>
          <div className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for React &
            Tailwind.
          </div>
        </div>
      </div>
    </footer>
  );
}
