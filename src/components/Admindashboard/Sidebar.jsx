import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/users', icon: '👥', label: 'Users' },
    { path: '/donations', icon: '🍱', label: 'Donations' },
    { path: '/orphanages', icon: '🏠', label: 'Orphanages' },
    { path: '/feedback', icon: '💬', label: 'Feedback' },
    { path: '/reports', icon: '📈', label: 'Reports' },
    { path: '/inventory', icon: '🍛', label: 'Inventory' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;