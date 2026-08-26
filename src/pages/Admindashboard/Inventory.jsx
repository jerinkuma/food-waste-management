import React, { useState, useEffect } from 'react';
import { fetchInventory } from '../../services/api';
import './Inventory.css';

const Inventory = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(fetchInventory());
  }, []);

  return (
    <div className="page">
      <h1><span className="page-icon">🍛</span> Food Inventory</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Item</th><th>Quantity</th><th>Expiry Date</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td><strong>{item.name}</strong></td>
                <td>{item.qty}</td>
                <td>{item.expiry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;