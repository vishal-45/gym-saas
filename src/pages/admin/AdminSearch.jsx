import React, { useState } from 'react';
import { Search, User, Building2, Mail, ExternalLink } from 'lucide-react';
import { useGymContext } from '../../context/GymContext';

export default function AdminSearch() {
  const { token } = useGymContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/members/search?q=${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Search failed");
    }
    setIsSearching(false);
  };

  return (
    <div className="members-page fade-in">
      <div className="page-actions-bar">
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Universal Member Search</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Find any member across the entire platform by name or email.</p>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
          <div className="search-box" style={{ flex: 1, width: 'auto' }}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Enter member name or email..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ borderRadius: '0.75rem' }}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Scan Database'}
          </button>
        </form>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Primary Email</th>
              <th>Parent Gym</th>
              <th>Joined Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results.map((member) => (
                <tr key={member.id} className="fade-in">
                  <td>
                    <div className="table-cell-user">
                      <div className="avatar micro" style={{ backgroundColor: '#3b82f6' }}>
                        {member.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 600 }}>{member.name}</span>
                    </div>
                  </td>
                  <td>{member.email}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6' }}>
                      <Building2 size={14} />
                      {member.tenant?.name || 'Unknown'}
                    </div>
                  </td>
                  <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                       <ExternalLink size={14} /> Direct Support
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                  {query && !isSearching ? "No matches found in cross-platform databank." : "Begin a search to see global results."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
