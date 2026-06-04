import { useState, useEffect } from 'react';
import { Loader2, Smartphone, Mail, MapPin } from 'lucide-react';
import { SITE_CONFIG } from '../config';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${SITE_CONFIG.backendUrl}/api/auth/users`, {
      headers: { Authorization: 'Bearer admin-token' },
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setUsers(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500 mt-1">{users.length} registered users</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-slate-400" />
          </div>
        ) : users.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-400 text-sm">No users registered yet.</div>
        ) : (
          users.map(u => (
            <div key={u.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {(u.name || u.phone)?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{u.name || 'Unnamed'}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Smartphone size={11} /> +91 {u.phone}
                  </div>
                </div>
                <div className="ml-auto">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                    {u.role || 'customer'}
                  </span>
                </div>
              </div>
              {u.email && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Mail size={11} /> {u.email}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin size={11} /> {u.addresses?.length || 0} addresses
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
