import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Auth from "./pages/Auth/Auth";
import Dashboard from "./pages/DonorDashboard/Dashboard";
import AddDonation from "./pages/DonorDashboard/AddDonation";
import DonationSuccess from "./pages/DonorDashboard/DonationSuccess";


//donationhistory
import DonationHistory from "./pages/DonorDashboard/DonationHistory";

//analytics

import Analytics from "./pages/DonorDashboard/Analytics";

import Profile from "./pages/DonorDashboard/Profile";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/restaurant/dashboard" element={<Dashboard />} />
        <Route path="/restaurant/add-donation" element={<AddDonation />} />
        <Route path="/restaurant/donation-success" element={<DonationSuccess />} />
        <Route path="/restaurant/donation-history" element={<DonationHistory />} />
        <Route path="/restaurant/analytics" element={<Analytics />} />
        <Route path="/restaurant/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;