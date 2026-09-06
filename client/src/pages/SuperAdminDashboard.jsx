import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { superAdminApi } from '../services/api';
import { showToast } from '../store/slices/toastSlice';
import {
  ShieldCheck,
  Car,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Search,
  RefreshCw,
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('owners'); // 'owners' | 'cars' | 'users'
  const [stats, setStats] = useState(null);
  const [pendingOwners, setPendingOwners] = useState([]);
  const [pendingCars, setPendingCars] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null); // { type: 'owner' | 'car', id: Long, name: string }
  const [rejectReason, setRejectReason] = useState('');

  const isSuperAdmin =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'Role_SuperAdmin' ||
    user?.role?.toUpperCase()?.includes('ADMIN') ||
    user?.email === 'superadmin@carrental.com';

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, ownersRes, carsRes, usersRes] = await Promise.all([
        superAdminApi.getDashboardStats().catch(() => ({ data: {} })),
        superAdminApi.getPendingOwners().catch(() => ({ data: [] })),
        superAdminApi.getPendingCars().catch(() => ({ data: [] })),
        superAdminApi.getAllUsers().catch(() => ({ data: [] })),
      ]);

      setStats(statsRes.data || {});
      setPendingOwners(ownersRes.data || []);
      setPendingCars(carsRes.data || []);
      setAllUsers(usersRes.data || []);
    } catch (err) {
      dispatch(showToast({ message: 'Error loading admin data: ' + err.message, type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadData();
    }
  }, [isSuperAdmin]);

  const handleVerifyOwner = async (ownerId, approve, reason = '') => {
    try {
      await superAdminApi.verifyOwner(ownerId, approve, reason);
      dispatch(showToast(`Car Owner ${approve ? 'approved' : 'rejected'} successfully!`));
      loadData();
    } catch (err) {
      dispatch(
        showToast({
          message: 'Verification failed: ' + (err.response?.data?.message || err.message),
          type: 'error',
        })
      );
    }
  };

  const handleVerifyCar = async (carId, approve, reason = '') => {
    try {
      await superAdminApi.verifyCar(carId, approve, reason);
      dispatch(showToast(`Vehicle ${approve ? 'approved' : 'rejected'} successfully!`));
      loadData();
    } catch (err) {
      dispatch(
        showToast({
          message: 'Car verification failed: ' + (err.response?.data?.message || err.message),
          type: 'error',
        })
      );
    }
  };

  const handleToggleBlock = async (userType, userId, currentBlocked) => {
    const nextBlock = !currentBlocked;
    try {
      await superAdminApi.toggleUserBlock(
        userType,
        userId,
        nextBlock,
        nextBlock ? 'Suspended by Super Admin' : ''
      );
      dispatch(
        showToast(
          `User account ${nextBlock ? 'suspended & session revoked' : 'restored'} successfully!`
        )
      );
      loadData();
    } catch (err) {
      dispatch(
        showToast({
          message: 'Block action failed: ' + (err.response?.data?.message || err.message),
          type: 'error',
        })
      );
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    if (rejectTarget.type === 'owner') {
      await handleVerifyOwner(rejectTarget.id, false, rejectReason);
    } else if (rejectTarget.type === 'car') {
      await handleVerifyCar(rejectTarget.id, false, rejectReason);
    }
    setRejectModalOpen(false);
    setRejectTarget(null);
    setRejectReason('');
  };

  if (!isSuperAdmin) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Super Admin Privileges Required</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          This portal is restricted to authorized platform Super Administrators. Please log in with
          an administrator account to review car owners and fleet verification.
        </p>
      </div>
    );
  }

  const filteredUsers = allUsers.filter(
    (u) =>
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.role && u.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Root Governance & Fleet Auditing</span>
          </div>
          <h1 className="text-3xl font-black text-white">Super Admin Command Center</h1>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 shadow-lg self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex items-center gap-4 hover:border-slate-700 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              ₹{(stats?.totalRevenue || 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">Total Platform Revenue</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex items-center gap-4 hover:border-slate-700 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats?.totalCars || 0}</div>
            <div className="text-xs text-slate-400">Total Fleet Listed</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex items-center gap-4 hover:border-slate-700 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">{pendingOwners.length}</div>
            <div className="text-xs text-slate-400">Pending Owner Approvals</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex items-center gap-4 hover:border-slate-700 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-purple-400">{pendingCars.length}</div>
            <div className="text-xs text-slate-400">Pending Car Approvals</div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 max-w-lg">
        <button
          onClick={() => setActiveTab('owners')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'owners'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Pending Owners ({pendingOwners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cars')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'cars'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Pending Cars ({pendingCars.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>User Governance</span>
        </button>
      </div>

      {/* TAB 1: PENDING CAR OWNERS */}
      {activeTab === 'owners' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Car Owners Awaiting Verification</h2>
            <span className="text-xs text-slate-400">
              Verify driving license and contact details before approving.
            </span>
          </div>

          {pendingOwners.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">All Clear! No Pending Car Owners</h3>
              <p className="text-xs text-slate-400">
                All registered car owners have been reviewed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingOwners.map((owner) => (
                <div
                  key={owner.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-white">{owner.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        PENDING REVIEW
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-6 text-xs text-slate-400">
                      <div>
                        📧 Email: <strong className="text-slate-200">{owner.email}</strong>
                      </div>
                      <div>
                        📞 Phone:{' '}
                        <strong className="text-slate-200">{owner.phoneNumber || 'N/A'}</strong>
                      </div>
                      <div>
                        🪪 License:{' '}
                        <strong className="text-slate-200">{owner.licenseNumber || 'N/A'}</strong>
                      </div>
                      <div className="sm:col-span-3">
                        📍 Address: <span className="text-slate-300">{owner.address || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                    <button
                      onClick={() => {
                        setRejectTarget({ type: 'owner', id: owner.id, name: owner.name });
                        setRejectModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>

                    <button
                      onClick={() => handleVerifyOwner(owner.id, true)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Verify & Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: PENDING VEHICLES */}
      {activeTab === 'cars' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Vehicles Awaiting Fleet Approval</h2>
            <span className="text-xs text-slate-400">
              Vehicles will become available to customers only after your approval.
            </span>
          </div>

          {pendingCars.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Pending Vehicles</h3>
              <p className="text-xs text-slate-400">
                All registered vehicles have been inspected and approved.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingCars.map((car) => (
                <div
                  key={car.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between gap-6 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
                          {car.vehicleNumber}
                        </div>
                        <h3 className="text-xl font-black text-white">
                          {car.brand} {car.model}
                        </h3>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        PENDING APPROVAL
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                      <div>
                        ⛽ Fuel Type: <strong className="text-slate-200">{car.fuelType}</strong>
                      </div>
                      <div>
                        👥 Seats:{' '}
                        <strong className="text-slate-200">{car.seatingCapacity} Seater</strong>
                      </div>
                      <div>
                        💰 Price / Day:{' '}
                        <strong className="text-emerald-400">₹{car.pricePerDay}</strong>
                      </div>
                      <div>
                        🛣️ Price / Km: <strong className="text-slate-200">₹{car.pricePerKm}</strong>
                      </div>
                      <div className="col-span-2">
                        📄 RC:{' '}
                        <strong className="text-slate-200">{car.rcNumber || 'Not provided'}</strong>
                      </div>
                      <div className="col-span-2">
                        🛡️ Insurance Till:{' '}
                        <strong className="text-slate-200">
                          {car.insuranceValidTill || 'Not provided'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setRejectTarget({
                          type: 'car',
                          id: car.id,
                          name: `${car.brand} ${car.model} (${car.vehicleNumber})`,
                        });
                        setRejectModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Vehicle
                    </button>

                    <button
                      onClick={() => handleVerifyCar(car.id, true)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve to Fleet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: USER GOVERNANCE & BLOCK / UNBLOCK */}
      {activeTab === 'users' && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">User Governance & Security Audits</h2>
              <span className="text-xs text-slate-400">
                Instantly suspend malicious accounts and invalidate active JWT sessions.
              </span>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search user name, email, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Account Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-slate-500">
                        No users matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr
                        key={`${u.role}-${u.id}`}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-white">
                          <div>{u.name}</div>
                          <div className="text-[11px] font-normal text-slate-400">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{u.phoneNumber || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              u.role === 'CAR_OWNER'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                            }`}
                          >
                            {u.role === 'CAR_OWNER' ? 'Car Owner' : 'Customer'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.isBlocked ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-max">
                              <Lock className="w-3 h-3" /> Suspended
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleToggleBlock(u.role, u.id, u.isBlocked)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ml-auto ${
                              u.isBlocked
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 text-rose-400'
                            }`}
                          >
                            {u.isBlocked ? (
                              <>
                                <Unlock className="w-3.5 h-3.5" /> Unblock
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5" /> Block User
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              Provide Rejection Reason
            </h3>
            <p className="text-xs text-slate-400">
              Please specify the reason for declining <strong>{rejectTarget?.name}</strong>. An
              email notification with this note will be sent automatically.
            </p>

            <textarea
              rows="3"
              placeholder="e.g., Incomplete driving license documentation, invalid RC copy..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
