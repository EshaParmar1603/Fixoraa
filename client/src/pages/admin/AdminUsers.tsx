import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Award,
  MoreVertical,
  Filter
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { User, Role } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await adminApi.toggleUserStatus(userId, !currentStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeRole = async (userId: string, newRole: Role) => {
    try {
      await adminApi.changeUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyProvider = async (providerId: string, currentVerified: boolean) => {
    try {
      await adminApi.verifyProvider(providerId, !currentVerified);
      setUsers((prev) =>
        prev.map((u) => {
          if (u.providerProfile && u.providerProfile.id === providerId) {
            return {
              ...u,
              providerProfile: { ...u.providerProfile, isVerified: !currentVerified }
            };
          }
          return u;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (selectedRole !== 'ALL' && u.role !== selectedRole) return false;
    if (searchTerm) {
      const matchName = u.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEmail = u.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchName || matchEmail;
    }
    return true;
  });

  if (loading) {
    return <LoadingSpinner message="Loading user access permissions..." fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <Users className="w-8 h-8 text-brand-600" />
          <span>User Access & Role Management</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review registered accounts, grant provider credentials, or deactivate suspicious actors
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-bold uppercase">Role:</span>
          {['ALL', 'CUSTOMER', 'PROVIDER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedRole === r
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">User</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Role & Permissions</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Verification Badge</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Account State</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          u.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`
                        }
                        alt=""
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-100"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u.id, e.target.value as Role)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 font-bold text-xs bg-white text-slate-700 focus:outline-none focus:border-brand-500"
                    >
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="PROVIDER">PROVIDER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>

                  <td className="px-6 py-4">
                    {u.role === 'PROVIDER' && u.providerProfile ? (
                      <button
                        onClick={() =>
                          handleVerifyProvider(
                            u.providerProfile!.id,
                            u.providerProfile!.isVerified
                          )
                        }
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                          u.providerProfile.isVerified
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{u.providerProfile.isVerified ? 'Verified Pro' : 'Unverified'}</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 italic">N/A</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current"></span>
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleToggleStatus(u.id, u.isActive)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                          u.isActive
                            ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                            : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.isActive ? 'Suspend' : 'Reactivate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
