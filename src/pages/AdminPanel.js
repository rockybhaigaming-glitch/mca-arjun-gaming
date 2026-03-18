import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Shield, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminPanel({ user }) {
  const [users, setUsers] = useState([]);
  const [allStats, setAllStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState(''); // 'user' or 'stats'
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        axios.get(`${API}/admin/users`),
        axios.get(`${API}/stats`)
      ]);
      setUsers(usersResponse.data.users);
      setAllStats(statsResponse.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
    setLoading(false);
  };

  const handleDeleteUser = async (uid) => {
    try {
      await axios.delete(`${API}/admin/user/${uid}`);
      toast.success('User deleted successfully');
      fetchData();
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete user');
    }
  };

  const handleDeleteStats = async (uid) => {
    try {
      await axios.delete(`${API}/admin/stats/${uid}`);
      toast.success('Stats deleted successfully');
      fetchData();
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete stats');
    }
  };

  const confirmDelete = (uid, type) => {
    setSelectedUser(uid);
    setDeleteType(type);
    setShowDeleteConfirm(true);
  };

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-24 px-4" data-testid="admin-panel">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <Shield className="text-yellow-500" size={48} />
          <h1 className="text-5xl md:text-7xl font-bold uppercase" data-testid="admin-title">
            <span className="text-yellow-500">Admin Panel</span>
          </h1>
        </div>

        {loading ? (
          <div className="text-center text-gray-400" data-testid="admin-loading">Loading...</div>
        ) : (
          <>
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-neon-orange mb-6" data-testid="users-section-title">Users ({users.length})</h2>
              <div className="space-y-2">
                {users.map((u) => (
                  <div key={u.uid} className="leaderboard-row" data-testid={`admin-user-${u.uid}`}>
                    <div className="flex-1">
                      <div className="font-bold text-white" data-testid={`admin-user-uid-${u.uid}`}>{u.uid}</div>
                      <div className="text-sm text-gray-500" data-testid={`admin-user-created-${u.uid}`}>
                        Created: {new Date(u.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {u.uid !== 'Gopichand' && (
                      <button
                        onClick={() => confirmDelete(u.uid, 'user')}
                        className="text-red-500 hover:text-red-400 transition-colors"
                        data-testid={`admin-delete-user-${u.uid}`}
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-neon-yellow mb-6" data-testid="stats-section-title">Player Stats ({allStats.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allStats.map((stat) => (
                  <div key={stat.uid} className="stat-card tech-corner p-6" data-testid={`admin-stat-${stat.uid}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white" data-testid={`admin-stat-name-${stat.uid}`}>{stat.name}</h3>
                        <p className="text-xs text-gray-500 font-mono" data-testid={`admin-stat-uid-${stat.uid}`}>UID: {stat.uid}</p>
                      </div>
                      <button
                        onClick={() => confirmDelete(stat.uid, 'stats')}
                        className="text-red-500 hover:text-red-400 transition-colors"
                        data-testid={`admin-delete-stat-${stat.uid}`}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="text-gray-400">
                        <div className="text-neon-orange font-bold mb-1">BR Stats</div>
                        <div data-testid={`admin-stat-br-${stat.uid}`}>{stat.br_rank} | {stat.br_wins} wins | KDA {stat.br_kda}</div>
                      </div>
                      <div className="text-gray-400">
                        <div className="text-neon-red font-bold mb-1">CS Stats</div>
                        <div data-testid={`admin-stat-cs-${stat.uid}`}>{stat.cs_rank} | {stat.cs_wins} wins | KDA {stat.cs_kda}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)} data-testid="delete-confirm-modal">
          <div className="modal-content tech-corner max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <AlertTriangle className="text-red-500 mx-auto mb-4" size={64} />
              <h2 className="text-2xl font-bold text-white mb-4" data-testid="delete-confirm-title">
                Confirm Delete
              </h2>
              <p className="text-gray-400 mb-6" data-testid="delete-confirm-message">
                Are you sure you want to delete {deleteType === 'user' ? 'this user and their stats' : 'these stats'}?
                <br />
                <span className="text-neon-orange font-mono">UID: {selectedUser}</span>
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => deleteType === 'user' ? handleDeleteUser(selectedUser) : handleDeleteStats(selectedUser)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-bold transition-colors"
                  data-testid="delete-confirm-yes"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 border border-gray-600 text-gray-400 px-6 py-3 hover:bg-gray-800 transition-colors"
                  data-testid="delete-confirm-no"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;