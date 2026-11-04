import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Upload, Store, Calendar, Package } from 'lucide-react';

export default function DistributionProofPage({ ngoId, ngoName }) {
  const [completedDonations, setCompletedDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null); 
  const [showModal, setShowModal] = useState(false);
  
  // ফর্ম ফিল্ড
  const [description, setDescription] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // ১. কমপ্লিটেড ডোনেশন বা রেস্টুরেন্টের লিস্ট ফেচ করা
  useEffect(() => {
    fetchCompletedDonations();
  }, []);

  const fetchCompletedDonations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/ngo/completed-donations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data && response.data.success) {
        setCompletedDonations(response.data.donations || []);
      }
    } catch (err) {
      console.error("Error fetching completed donations:", err);
    } finally {
      setLoading(false);
    }
  };

  // প্রুফ বাটন ক্লিক করলে মোডাল ওপেন হবে
  const handleOpenModal = (donation) => {
    setSelectedDonation(donation);
    setDescription('');
    setImageFiles([]);
    setImagePreviews([]);
    setMessage('');
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const filesArray = Array.from(e.target.files);
    if (filesArray.length === 0) return;

    setImageFiles((prev) => [...prev, ...filesArray]);
    const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // সাবমিট হ্যান্ডলার
  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!imageFiles || imageFiles.length === 0) {
      setMessage('Please select at least one distribution proof image.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    const formData = new FormData();
    formData.append('ngoId', ngoId || '');
    formData.append('restaurantId', selectedDonation.donor?._id || selectedDonation.donor || '');
    formData.append('donationId', selectedDonation._id);
    formData.append('description', `Food: ${selectedDonation.foodName || 'Donation'} | Qty: ${selectedDonation.quantity} | Details: ${description}`);
    formData.append('ngoName', ngoName || 'NGO Partner');

    for (let i = 0; i < imageFiles.length; i++) {
      formData.append('images', imageFiles[i]);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/ngo/submit-distribution', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data && response.data.success) {
        setMessage('Distribution proof submitted successfully and notification sent to the restaurant!');
        setTimeout(() => {
          setShowModal(false);
          setSelectedDonation(null);
        }, 1500);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setMessage(err.response?.data?.message || 'Failed to submit proof.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-slate-500">Loading completed donations...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Distribution Proof Management</h2>
      <p className="text-xs text-slate-500 mb-6">Select a completed donation below and click "Distribution Proof" to upload verification images directly to the restaurant.</p>

      {/* রেস্টুরেন্ট/ডোনেশন লিস্ট */}
      <div className="space-y-4">
        {completedDonations.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-slate-400 border border-slate-200">
            No completed donations found.
          </div>
        ) : (
          completedDonations.map((item) => (
            <div key={item._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {item.donor?.organizationName || item.donor?.name || item.restaurantName || 'Restaurant Partner'}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center mt-1">
                    <Package className="w-3.5 h-3.5 mr-1 text-slate-400" /> Food: <strong className="text-slate-700 ml-1">{item.foodName || 'Donation Food'}</strong> ({item.quantity} items)
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center mt-0.5">
                    <Calendar className="w-3 h-3 mr-1" /> ID: {item.donationId || item._id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenModal(item)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center"
              >
                <Upload className="w-4 h-4 mr-1.5" /> Distribution Proof
              </button>
            </div>
          ))
        )}
      </div>

      {/* পপআপ ফর্ম মোডাল */}
      {showModal && selectedDonation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-1">Submit Distribution Proof</h3>
            <p className="text-xs text-slate-500 mb-4">
              Restaurant: <strong className="text-emerald-600">{selectedDonation.donor?.organizationName || selectedDonation.donor?.name || 'Restaurant'}</strong> | Food: <strong>{selectedDonation.foodName}</strong>
            </p>

            {message && (
              <div className={`mb-4 p-3 rounded-xl text-xs font-semibold ${message.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1">Distribution Details / Notes</label>
                <textarea
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800"
                  rows="3"
                  placeholder="Write details about where and how the food was distributed..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1">
                  Upload Proof Images (Max 20-30 images allowed)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple 
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-600 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                  onChange={handleImageChange}
                />
                <span className="text-[10px] text-slate-400 mt-1 block">You can select multiple images at once (Hold Ctrl/Shift).</span>

                {imagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50">
                    {imagePreviews.map((src, index) => (
                      <div key={index} className="relative group w-full h-16 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                        <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 opacity-80 group-hover:opacity-100 transition shadow-sm cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition text-xs shadow-md cursor-pointer"
              >
                {submitting ? 'Submitting Proof...' : 'Submit & Send to Restaurant'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}