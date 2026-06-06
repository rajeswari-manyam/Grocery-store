import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.jpeg" alt="MANYAM MART" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-white text-lg font-bold">MANYAM MART</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your trusted source for healthy millets, premium rice, and daily staples. Pure, natural, and straight from the farm.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Shop</h4>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <span className="cursor-pointer hover:text-white transition-colors">Millets & Healthy Grains</span>
              <span className="cursor-pointer hover:text-white transition-colors">Rice Varieties</span>
              <span className="cursor-pointer hover:text-white transition-colors">Flours & Powders</span>
              <span className="cursor-pointer hover:text-white transition-colors">Pulses & Lentils</span>
              <span className="cursor-pointer hover:text-white transition-colors">Seeds & Health Add-Ons</span>
              <span className="cursor-pointer hover:text-white transition-colors">Ready Products</span>
              <span className="cursor-pointer hover:text-white transition-colors">Grocery & Staples</span>
              <span className="cursor-pointer hover:text-white transition-colors">Spices & Oils</span>
              <span className="cursor-pointer hover:text-white transition-colors">Grains & Processed Foods</span>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-emerald-400" />
                ganesh@manyamconsultancy.com
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-emerald-400" />
                +91 81250 24999
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-emerald-400" />
               49-287/4/B, Padmanagar Phase 1, Quthbullapur, Hyderabad, Telangana 500054
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-xs text-slate-500">
          &copy; 2026 MANYAM MART. All rights reserved. | Healthy millets & daily staples delivered to your door.
        </div>
      </div>
    </footer>
  );
}
