import React, { useState } from 'react';
import './TrustScore.css'; // Jodi custom CSS file use korte chan

export default function TrustScore({ themeMode = 'light' }) {
  // 1. Initial Donor Data
  const [donors, setDonors] = useState([
    {
      id: "d1",
      name: "Café 1",
      location: "Agrabad, Chattogram",
      trustScore: 4.8,
      totalDonations: 42,
      isFollowed: true,
      tags: ["Fresh Food", "Super Fast", "Top Rated"],
      recentImages: [
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200"
      ],
      reviews: [
        { id: "r1", user: "Volunteer A", rating: 5, comment: "Food was warm and well packed.", type: "positive" },
        { id: "r2", user: "NGO Rep", rating: 2, comment: "Pickup was delayed by 30 minutes.", type: "negative" }
      ]
    },
    {
      id: "d2",
      name: "Hotel Agrabad",
      location: "Agrabad, Chattogram",
      trustScore: 4.7,
      totalDonations: 35,
      isFollowed: false,
      tags: ["Large Meals", "Very Hygienic"],
      recentImages: [
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=200"
      ],
      reviews: [
        { id: "r3", user: "Shelter Coordinator", rating: 5, comment: "Excellent quantity and highly hygienic.", type: "positive" }
      ]
    },
    {
      id: "d3",
      name: "Royal Dine",
      location: "GEC Circle, Chattogram",
      trustScore: 3.5,
      totalDonations: 28,
      isFollowed: false,
      tags: ["Quality Packaging", "Inconsistent Quantity"],
      recentImages: [],
      reviews: [
        { id: "r4", user: "Distributor B", rating: 2, comment: "Packaging was torn during pickup.", type: "negative" }
      ]
    },
    {
      id: "d4",
      name: "Restaurant Name 2",
      location: "WASA, Chattogram",
      trustScore: 2.8,
      totalDonations: 19,
      isFollowed: false,
      tags: ["Late Delivery", "Cold Food"],
      recentImages: [],
      reviews: [
        { id: "r5", user: "Volunteer C", rating: 1, comment: "Food quality was below average and cold.", type: "negative" }
      ]
    }
  ]);

  const [pendingRatings, setPendingRatings] = useState([
    { id: "DH1005", donor: "Café 1", food: "Rice & Chicken Curry (~30 meals)", deliveredTime: "2 hours ago" },
    { id: "DH1004", donor: "Restaurant Name 2", food: "Chow Mein & Sauce (~15 meals)", deliveredTime: "Yesterday" }
  ]);

  const [selectedDonorDetail, setSelectedDonorDetail] = useState(null);
  const [selectedRatingItem, setSelectedRatingItem] = useState(null);
  const [userStars, setUserStars] = useState(4);
  const [selectedTag, setSelectedTag] = useState('Best Food Quality');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [ratingTypeFilter, setRatingTypeFilter] = useState('all');

  const toggleFollow = (id) => {
    setDonors(prev =>
      prev.map(item => item.id === id ? { ...item, isFollowed: !item.isFollowed } : item)
    );
  };

  const handleRatingSubmit = () => {
    if (!selectedRatingItem) return;

    setDonors(prev =>
      prev.map(donor => {
        if (donor.name === selectedRatingItem.donor) {
          const newTotalDonations = donor.totalDonations + 1;
          const updatedScore = parseFloat(
            (((donor.trustScore * donor.totalDonations) + userStars) / newTotalDonations).toFixed(1)
          );
          
          const newTags = donor.tags.includes(selectedTag) 
            ? donor.tags 
            : [...donor.tags, selectedTag];

          const newReview = {
            id: `r_${Date.now()}`,
            user: "Verified Recipient",
            rating: userStars,
            comment: reviewComment || "No written review provided.",
            type: userStars >= 3 ? "positive" : "negative"
          };

          return {
            ...donor,
            trustScore: updatedScore,
            totalDonations: newTotalDonations,
            tags: newTags,
            reviews: [newReview, ...donor.reviews]
          };
        }
        return donor;
      })
    );

    setPendingRatings(prev => prev.filter(r => r.id !== selectedRatingItem.id));
    setSelectedRatingItem(null);
    setReviewComment('');
  };

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          donor.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (ratingTypeFilter === 'positive') {
      return matchesSearch && donor.trustScore >= 4.0;
    } else if (ratingTypeFilter === 'negative') {
      return matchesSearch && donor.trustScore < 4.0;
    }
    return matchesSearch;
  });

  const isDark = themeMode === 'dark';

  const getRatingLabel = (stars) => {
    switch (stars) {
      case 5: return 'Excellent Experience';
      case 4: return 'Good Experience';
      case 3: return 'Average Experience';
      case 2: return 'Poor Experience';
      case 1: return 'Very Bad Experience';
      default: return 'Rate Your Experience';
    }
  };

  return (
    <div className={`space-y-6 min-h-screen font-sans p-4 transition-colors ${
      isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Header */}
      <div className={`p-5 rounded-2xl border flex justify-between items-center flex-wrap gap-4 ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">DONOR TRUST SCORE & NETWORK</h2>
        </div>
        
        <div className="bg-emerald-50 border border-emerald-300 px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <span>Following:</span>
          <span className="bg-emerald-700 text-white px-2 py-0.5 rounded-full text-[10px]">
            {donors.filter(d => d.isFollowed).length} Followed
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">
        
        {/* Donor Leaderboard Section */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            
            <div className="flex justify-between items-center border-b pb-3 flex-wrap gap-2 border-slate-200">
              <div>
                <h3 className="font-extrabold text-sm tracking-wide text-slate-900">RESTAURANTS & DONORS NETWORK</h3>
                <p className="text-[11px] text-slate-500">Filter by trust level or search by area</p>
              </div>
              
              <div className="flex gap-1 text-xs font-bold">
                <button
                  onClick={() => setRatingTypeFilter('all')}
                  className={`px-3 py-1 rounded-lg border ${
                    ratingTypeFilter === 'all'
                      ? 'bg-slate-800 text-white border-slate-700'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  All Donors
                </button>
                <button
                  onClick={() => setRatingTypeFilter('positive')}
                  className={`px-3 py-1 rounded-lg border ${
                    ratingTypeFilter === 'positive'
                      ? 'bg-emerald-700 text-white border-emerald-600'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  High Rated (4.0+)
                </button>
                <button
                  onClick={() => setRatingTypeFilter('negative')}
                  className={`px-3 py-1 rounded-lg border ${
                    ratingTypeFilter === 'negative'
                      ? 'bg-rose-700 text-white border-rose-600'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  Low Rated / Issues
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search donor by name or location (Agrabad, WASA, GEC)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs border rounded-xl px-3.5 py-2.5 bg-slate-50 border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-900 font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Donor List */}
            <div className="space-y-3">
              {filteredDonors.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  No donors match the current criteria.
                </div>
              ) : (
                filteredDonors.map((donor, index) => (
                  <div 
                    key={donor.id} 
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-sm transition-all bg-white flex flex-wrap sm:flex-nowrap items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 font-extrabold text-slate-700 flex items-center justify-center text-xs border border-slate-300 shrink-0">
                        #{index + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button 
                            onClick={() => setSelectedDonorDetail(donor)}
                            className="font-extrabold text-sm text-emerald-700 hover:underline text-left block"
                          >
                            {donor.name}
                          </button>
                        </div>
                        
                        <p className="text-[11px] text-slate-600 font-semibold">{donor.location}</p>
                        
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {donor.tags.map((tag, tIdx) => (
                            <span 
                              key={tIdx} 
                              className={`text-[10px] px-2.5 py-1 rounded-md font-bold ${
                                tag.toLowerCase().includes('late') || tag.toLowerCase().includes('cold') || tag.toLowerCase().includes('inconsistent')
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:justify-center w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 justify-between">
                      <div className="text-left sm:text-right">
                        <div className="flex items-center gap-1">
                          <span className="font-black text-slate-900 text-base">★ {donor.trustScore}</span>
                          <span className="text-[10px] text-slate-500 font-bold">/ 5.0</span>
                        </div>
                        <p className="text-[10px] text-emerald-700 font-bold">{donor.totalDonations} Donations</p>
                      </div>

                      <button
                        onClick={() => toggleFollow(donor.id)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          donor.isFollowed
                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        }`}
                      >
                        {donor.isFollowed ? '- Unfollow' : '+ Follow'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

        {/* Pending Feedback Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            
            <div className="border-b pb-3 border-slate-200">
              <h3 className="font-extrabold text-sm tracking-wide text-slate-900">PENDING FEEDBACK</h3>
              <p className="text-[10px] text-slate-500">Rate pickup quality to keep trust scores updated</p>
            </div>

            {pendingRatings.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                All completed deliveries have been reviewed.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRatings.map((item) => (
                  <div key={item.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-slate-500">{item.id}</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        Delivered
                      </span>
                    </div>

                    <div>
                      <h5 className="font-extrabold text-slate-900 text-xs">{item.donor}</h5>
                      <p className="text-[11px] text-slate-600 font-medium">{item.food}</p>
                    </div>

                    <button
                      onClick={() => setSelectedRatingItem(item)}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-sm"
                    >
                      Rate This Donor
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Donor Profile Details Modal */}
      {selectedDonorDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 border border-slate-200 text-slate-900">
            <div className="flex justify-between items-center border-b pb-3 border-slate-200">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{selectedDonorDetail.name} Profile</h3>
              </div>
              <button onClick={() => setSelectedDonorDetail(null)} className="text-slate-500 hover:text-slate-900 font-bold text-lg">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-3 rounded-xl border border-slate-200">
                <p><strong className="text-slate-600">Location:</strong> {selectedDonorDetail.location}</p>
                <p><strong className="text-slate-600">Trust Score:</strong> ★ {selectedDonorDetail.trustScore} / 5.0</p>
                <p><strong className="text-slate-600">Total Donations:</strong> {selectedDonorDetail.totalDonations}</p>
                <p><strong className="text-slate-600">Status:</strong> {selectedDonorDetail.isFollowed ? 'Following' : 'Not Followed'}</p>
              </div>
              
              {selectedDonorDetail.recentImages.length > 0 && (
                <div>
                  <strong className="text-slate-700 block mb-1">Recent Food Donation Proofs:</strong>
                  <div className="flex gap-2">
                    {selectedDonorDetail.recentImages.map((img, i) => (
                      <img key={i} src={img} alt="Donation Proof" className="w-20 h-20 rounded-xl object-cover border border-slate-300" />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <strong className="text-slate-700 block mb-2">Community Feedback & Reviews:</strong>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedDonorDetail.reviews.map((rev) => (
                    <div 
                      key={rev.id} 
                      className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${
                        rev.type === 'positive'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="flex justify-between font-bold">
                        <span>{rev.user}</span>
                        <span>Rating: ★ {rev.rating}/5</span>
                      </div>
                      <p className="font-medium">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => setSelectedDonorDetail(null)} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {selectedRatingItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-200 text-slate-900">
            
            <div className="flex justify-between items-start border-b pb-3 border-slate-200">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Rate Donor Experience</h3>
                <p className="text-xs text-slate-500 font-medium">Order #{selectedRatingItem.id} - {selectedRatingItem.donor}</p>
              </div>
              <button onClick={() => setSelectedRatingItem(null)} className="text-slate-400 hover:text-slate-800 font-bold text-base">✕</button>
            </div>

            {/* Star Rating Selection */}
            <div className="text-center space-y-2 py-2">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">SELECT SCORE RATING</label>
              
              <div className="flex justify-center items-center gap-2">
                {[1, 2, 3, 4, 5].anim?.map ? null : [1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserStars(star)}
                    className={`w-11 h-11 rounded-full border-2 text-lg font-bold flex items-center justify-center transition-all ${
                      star <= userStars 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105'
                        : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <div className="pt-1">
                <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
                  {getRatingLabel(userStars)}
                </span>
              </div>
            </div>

            {/* Highlight Feedback Buttons */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">HIGHLIGHT FEEDBACK:</label>
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                {[
                  'Best Food Quality', 'Fresh Food', 'On Time Pickup', 
                  'Delayed Pickup', 'Cold Food', 'Packaging Issue'
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-xl border-2 transition-all ${
                      selectedTag === tag 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                        : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Review Textarea */}
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">DETAILED REVIEW (OPTIONAL):</label>
              <textarea
                rows="3"
                placeholder="Mention specific details about food condition, packaging, or timing..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full text-xs p-3 border-2 rounded-xl bg-slate-50 border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-emerald-600 resize-none placeholder:text-slate-400"
              />
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleRatingSubmit}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-md"
              >
                Submit Feedback
              </button>
              <button
                onClick={() => setSelectedRatingItem(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold px-5 py-3 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}