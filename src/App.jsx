import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Admindashboard/Navbar';
import Sidebar from './components/Admindashboard/Sidebar';
import Footer from './components/Admindashboard/Footer';
import Dashboard from './pages/Admindashboard/Dashboard';
import Users from './pages/Admindashboard/Users';
import Donations from './pages/Admindashboard/Donations';
import Orphanages from './pages/Admindashboard/Orphanages';
import Feedback from './pages/Admindashboard/Feedback';
import Reports from './pages/Admindashboard/Reports';
import Inventory from './pages/Admindashboard/Inventory';
import Settings from './pages/Admindashboard/Settings';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="main-wrapper">
          <Sidebar />
          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/donations" element={<Donations />} />
              <Route path="/orphanages" element={<Orphanages />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;