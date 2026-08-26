import React, { useState, useEffect } from 'react';
import { fetchUsers } from '../../services/api';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setUsers(fetchUsers());
  }, []);

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page">
      <h1><span className="page-icon">👥</span> User Management</h1>
      <div className="user-toolbar">
        <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Location</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.location}</td>
                <td><span className={`badge ${u.status.toLowerCase()}`}>{u.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;