import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Edit, User, Upload } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mca-arjun-gaming.onrender.com";
const API = `${BACKEND_URL}/api`;

function StatsPage({ user }) {
  const [allStats, setAllStats] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    br_rank: '',
    br_kda: 0,
    br_highest_kills: 0,
    br_wins: 0,
    cs_rank: '',
    cs_kda: 0,
    cs_highest_kills: 0,
    cs_wins: 0,
    profile_picture: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAllStats();
    if (user) {
      fetchMyStats();
    }
  }, [user]);

  const fetchAllStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setAllStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
    setLoading(false);
  };

  const fetchMyStats = async () => {
    try {
      const response = await axios.get(`${API}/stats/${user.uid}`);
      setMyStats(response.data);
      setFormData(response.data);
    } catch (error) {
      setMyStats(null);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);
      const response = await axios.post(`${API}/upload-image`, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, profile_picture: response.data.image_url });
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (myStats) {
        await axios.put(`${API}/stats`, formData);
        toast.success('Stats updated successfully');
      } else {
        await axios.post(`${API}/stats`, formData);
        toast.success('Stats created successfully');
      }
      setShowCreateModal(false);
      fetchMyStats();
      fetchAllStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save stats');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" data-testid="login-required-message">
        <div className="text-center">
          <User size={64} className="text-neon-orange mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-gray-400">Please login to create and manage your stats</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4" data-testid="stats-page">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold uppercase" data-testid="stats-page-title">
            <span className="text-neon-orange">Your Stats</span>
          </h1>
          {myStats ? (
            <button
              onClick={() => { setFormData(myStats); setShowCreateModal(true); }}
              className="primary-btn skew-button flex items-center gap-2"
              data-testid="edit-stats-button"
            >
              <span className="skew-button-text flex items-center gap-2">
                <Edit size={20} /> Edit Stats
              </span>
            </button>
          ) : (
            <button
              onClick={() => setShowCreateModal(true)}
              className="primary-btn skew-button"
              data-testid="create-stats-button"
            >
              <span className="skew-button-text">Create Stats</span>
            </button>
          )}
        </div>

        {myStats ? (
          <div className="stat-card tech-corner p-8 mb-12" data-testid="my-stats-card">
            <div className="flex items-start gap-6">
              {myStats.profile_picture && (
                <img
                  src={myStats.profile_picture}
                  alt={myStats.name}
                  className="profile-avatar w-24 h-24"
                  data-testid="my-profile-picture"
                />
              )}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2" data-testid="my-stats-name">{myStats.name}</h2>
                <p className="text-gray-500 font-mono mb-6" data-testid="my-stats-uid">UID: {myStats.uid}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-neon-orange mb-4" data-testid="br-stats-title">Battle Royale</h3>
                    <div className="space-y-2 text-gray-300">
                      <div>Rank: <span className="rank-badge" data-testid="br-rank">{myStats.br_rank}</span></div>
                      <div data-testid="br-kda">KDA: <span className="text-neon-yellow font-bold">{myStats.br_kda}</span></div>
                      <div data-testid="br-wins">Wins: <span className="text-white font-bold">{myStats.br_wins}</span></div>
                      <div data-testid="br-kills">Highest Kills: <span className="text-white font-bold">{myStats.br_highest_kills}</span></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-neon-red mb-4" data-testid="cs-stats-title">Clash Squad</h3>
                    <div className="space-y-2 text-gray-300">
                      <div>Rank: <span className="rank-badge" data-testid="cs-rank">{myStats.cs_rank}</span></div>
                      <div data-testid="cs-kda">KDA: <span className="text-neon-yellow font-bold">{myStats.cs_kda}</span></div>
                      <div data-testid="cs-wins">Wins: <span className="text-white font-bold">{myStats.cs_wins}</span></div>
                      <div data-testid="cs-kills">Highest Kills: <span className="text-white font-bold">{myStats.cs_highest_kills}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 mb-12 p-12 bg-card" data-testid="no-stats-message">
            <p className="text-xl">You haven't created your stats yet. Click "Create Stats" to get started!</p>
          </div>
        )}

        <h2 className="text-4xl font-bold uppercase text-neon-yellow mb-8" data-testid="all-players-title">All Players</h2>
        {loading ? (
          <div className="text-center text-gray-400" data-testid="loading-indicator">Loading...</div>
        ) : allStats.length === 0 ? (
          <div className="text-center text-gray-500" data-testid="no-players-message">No players found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="all-players-grid">
            {allStats.map((stat) => (
              <div key={stat.uid} className="stat-card tech-corner p-6" data-testid={`player-card-${stat.uid}`}>
                <div className="flex items-center gap-4 mb-4">
                  {stat.profile_picture && (
                    <img
                      src={stat.profile_picture}
                      alt={stat.name}
                      className="profile-avatar w-16 h-16"
                      data-testid={`player-avatar-${stat.uid}`}
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white" data-testid={`player-name-${stat.uid}`}>{stat.name}</h3>
                    <p className="text-xs text-gray-500 font-mono" data-testid={`player-uid-${stat.uid}`}>UID: {stat.uid}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500 uppercase mb-1">BR Stats</div>
                    <div className="text-sm text-gray-400" data-testid={`player-br-stats-${stat.uid}`}>
                      {stat.br_rank} | {stat.br_wins} wins | KDA {stat.br_kda}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 uppercase mb-1">CS Stats</div>
                    <div className="text-sm text-gray-400" data-testid={`player-cs-stats-${stat.uid}`}>
                      {stat.cs_rank} | {stat.cs_wins} wins | KDA {stat.cs_kda}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)} data-testid="stats-modal">
          <div className="modal-content tech-corner max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-3xl font-bold text-neon-orange mb-6 text-center" data-testid="stats-modal-title">
              {myStats ? 'Edit Stats' : 'Create Stats'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-mono text-gray-400 mb-2">Player Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field w-full"
                    required
                    data-testid="form-name-input"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-mono text-gray-400 mb-2">Profile Picture</label>
                  <div className="flex items-center gap-4">
                    {formData.profile_picture && (
                      <img src={formData.profile_picture} alt="Profile" className="w-20 h-20 rounded-full" data-testid="form-profile-preview" />
                    )}
                    <label className="primary-btn cursor-pointer" data-testid="upload-button">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                        data-testid="form-image-input"
                      />
                      <Upload size={16} className="inline mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-2xl font-bold text-neon-orange mb-4" data-testid="br-form-title">Battle Royale Stats</h3>
                </div>

                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">Rank</label>
                  <input
                    type="text"
                    value={formData.br_rank}
                    onChange={(e) => setFormData({ ...formData, br_rank: e.target.value })}
                    className="input-field w-full"
                    required
                    data-testid="form-br-rank-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">KDA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.br_kda}
                    onChange={(e) => setFormData({ ...formData, br_kda: parseFloat(e.target.value) })}
                    className="input-field w-full"
                    required
                    data-testid="form-br-kda-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">Highest Kills</label>
                  <input
                    type="number"
                    value={formData.br_highest_kills}
                    onChange={(e) => setFormData({ ...formData, br_highest_kills: parseInt(e.target.value) })}
                    className="input-field w-full"
                    required
                    data-testid="form-br-kills-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">Total Wins</label>
                  <input
                    type="number"
                    value={formData.br_wins}
                    onChange={(e) => setFormData({ ...formData, br_wins: parseInt(e.target.value) })}
                    className="input-field w-full"
                    required
                    data-testid="form-br-wins-input"
                  />
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-2xl font-bold text-neon-red mb-4" data-testid="cs-form-title">Clash Squad Stats</h3>
                </div>

                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">Rank</label>
                  <input
                    type="text"
                    value={formData.cs_rank}
                    onChange={(e) => setFormData({ ...formData, cs_rank: e.target.value })}
                    className="input-field w-full"
                    required
                    data-testid="form-cs-rank-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">KDA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cs_kda}
                    onChange={(e) => setFormData({ ...formData, cs_kda: parseFloat(e.target.value) })}
                    className="input-field w-full"
                    required
                    data-testid="form-cs-kda-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">Highest Kills</label>
                  <input
                    type="number"
                    value={formData.cs_highest_kills}
                    onChange={(e) => setFormData({ ...formData, cs_highest_kills: parseInt(e.target.value) })}
                    className="input-field w-full"
                    required
                    data-testid="form-cs-kills-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">Total Wins</label>
                  <input
                    type="number"
                    value={formData.cs_wins}
                    onChange={(e) => setFormData({ ...formData, cs_wins: parseInt(e.target.value) })}
                    className="input-field w-full"
                    required
                    data-testid="form-cs-wins-input"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="primary-btn flex-1" data-testid="form-submit-button">
                  {myStats ? 'Update Stats' : 'Create Stats'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-gray-600 text-gray-400 px-8 py-3 hover:bg-gray-800 transition-colors"
                  data-testid="form-cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatsPage;
