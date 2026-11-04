import React, { useEffect, useMemo, useState } from "react";
import { fetchDonations } from "../../services/api";
import "./Donations.css";

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDonations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetchDonations();
        const list = Array.isArray(response)
          ? response
          : response?.donations || [];

        if (isMounted) {
          setDonations(list);
        }
      } catch (err) {
        console.error("Failed to load donations:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Donation information load করা যায়নি।"
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDonations();

    return () => {
      isMounted = false;
    };
  }, []);

  const getFoodName = (donation) =>
    donation.foodName || donation.food || "N/A";

  const getQuantity = (donation) => {
    const quantity = donation.quantity ?? donation.qty;
    return quantity !== undefined && quantity !== null
      ? `${quantity} kg`
      : "N/A";
  };

  const getDonorName = (donation) => {
    if (typeof donation.donor === "object" && donation.donor !== null) {
      return donation.donor.name || donation.donor.email || "N/A";
    }
    return donation.donorName || donation.donor || "N/A";
  };

  const getStatus = (donation) =>
    donation.pipelineStatus || donation.status || "Pending";

  // এনজিওর নাম বা আইডি/রেফারেন্স কোড বের করার ফাংশন
  const getNgoName = (donation) => {
    if (donation.ngoName) return donation.ngoName;
    if (donation.assignedNgo) return donation.assignedNgo;
    
    const ngoField = donation.ngo || donation.selectedNgo || donation.ngoId;
    if (typeof ngoField === "object" && ngoField !== null) {
      return ngoField.name || ngoField._id || ngoField.id || "Assigned NGO";
    }
    if (typeof ngoField === "string" && ngoField.trim() !== "") {
      return ngoField;
    }

    const status = getStatus(donation).toLowerCase();
    if (status.includes("completed") || status.includes("delivered") || status.includes("accepted")) {
      return donation.requestId || donation.donationId || "NGO-Assigned";
    }

    return "";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "N/A";
    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredDonations = useMemo(() => {
    const searchText = search.trim().toLowerCase();
    if (!searchText) return donations;

    return donations.filter((donation) => {
      const fields = [
        getFoodName(donation),
        getDonorName(donation),
        getStatus(donation),
        getNgoName(donation),
        donation.quantity,
        donation.createdAt,
        donation._id,
      ];

      return fields.some((field) =>
        String(field ?? "").toLowerCase().includes(searchText)
      );
    });
  }, [donations, search]);

  const pendingCount = donations.filter(
    (donation) => getStatus(donation).toLowerCase() === "pending"
  ).length;

  // স্ট্যাটাস অনুযায়ী ব্যাজ কালার কনফিগারেশন
  const getBadgeStyle = (status) => {
    const st = status.toLowerCase();
    if (st.includes("completed") || st.includes("delivered")) {
      return { background: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0" };
    }
    if (st.includes("pending")) {
      return { background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" };
    }
    if (st.includes("accepted") || st.includes("assigned")) {
      return { background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" };
    }
    return { background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" };
  };

  return (
    <div className="page" style={{ padding: "32px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "12px", margin: 0 }}>
          <span style={{ background: "#e2e8f0", padding: "8px", borderRadius: "10px", fontSize: "20px" }}>🍱</span> 
          Donation Management
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="donation-summary" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "28px" }}>
        <div style={{ background: "#ffffff", padding: "22px 24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Donations</span>
          <strong style={{ display: "block", fontSize: "32px", fontWeight: "700", color: "#0f172a", marginTop: "8px" }}>{loading ? "..." : donations.length}</strong>
          <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px", display: "block" }}>All active and past records</span>
        </div>

        <div style={{ background: "#ffffff", padding: "22px 24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#d97706", textTransform: "uppercase", letterSpacing: "0.5px" }}>Pending Donations</span>
          <strong style={{ display: "block", fontSize: "32px", fontWeight: "700", color: "#d97706", marginTop: "8px" }}>{loading ? "..." : pendingCount}</strong>
          <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px", display: "block" }}>Waiting for processing/approval</span>
        </div>
      </div>

      {/* Search Toolbar */}
      <div style={{ marginBottom: "24px", background: "#fff", padding: "12px", borderRadius: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0", display: "inline-block", width: "100%", maxWidth: "450px" }}>
        <input
          type="text"
          placeholder="🔍 Search food, donor, status, or NGO..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "none", outline: "none", fontSize: "14px", background: "transparent", color: "#1e293b" }}
        />
      </div>

      {/* Content Area */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#64748b", fontSize: "15px", fontWeight: "500" }}>
          Loading donations from database...
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "40px", background: "#fff", borderRadius: "16px", border: "1px solid #fecaca", color: "#dc2626" }}>
          <p style={{ fontWeight: "600" }}>{error}</p>
          <button type="button" onClick={() => window.location.reload()} style={{ marginTop: "12px", padding: "8px 20px", background: "#059669", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
            Try Again
          </button>
        </div>
      ) : (
        <>
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px", fontWeight: "500" }}>
            Showing <strong>{filteredDonations.length}</strong> of <strong>{donations.length}</strong> donations
          </p>

          {/* Cards Grid View */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {filteredDonations.length > 0 ? (
              filteredDonations.map((donation, index) => {
                const status = getStatus(donation);
                const ngoName = getNgoName(donation);
                const badgeStyle = getBadgeStyle(status);

                return (
                  <div 
                    key={donation._id || donation.id || index} 
                    style={{ 
                      background: "#fff", 
                      borderRadius: "16px", 
                      padding: "24px", 
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)", 
                      border: "1px solid #e2e8f0", 
                      display: "flex", 
                      flexDirection: "column", 
                      justifyContent: "space-between",
                      transition: "all 0.2s ease-in-out",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                        <div>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Item #{index + 1}</span>
                          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "4px 0 0 0", lineHeight: "1.4" }}>{getFoodName(donation)}</h3>
                        </div>
                        <span style={{ padding: "5px 12px", borderRadius: "30px", fontSize: "12px", fontWeight: "700", ...badgeStyle }}>
                          {status}
                        </span>
                      </div>

                      {/* Details Info List */}
                      <div style={{ fontSize: "14px", color: "#475569", display: "flex", flexDirection: "column", gap: "10px", margin: "16px 0", padding: "12px 0", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#64748b", fontSize: "13px" }}>Quantity:</span>
                          <strong style={{ color: "#0f172a", background: "#f8fafc", padding: "2px 8px", borderRadius: "6px" }}>{getQuantity(donation)}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#64748b", fontSize: "13px" }}>Donor / Restaurant:</span>
                          <strong style={{ color: "#0f172a" }}>{getDonorName(donation)}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#64748b", fontSize: "13px" }}>Date:</span>
                          <span style={{ color: "#334155", fontWeight: "500" }}>{formatDate(donation.createdAt || donation.date)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Assigned NGO Footer Section */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Assigned NGO:</span>
                      <strong style={{ fontSize: "13px", color: ngoName ? "#059669" : "#94a3b8", fontStyle: ngoName ? "normal" : "italic", fontWeight: ngoName ? "700" : "400" }}>
                        {ngoName || "Not Assigned"}
                      </strong>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", background: "#fff", borderRadius: "16px", color: "#94a3b8", border: "1px solid #e2e8f0" }}>
                {search.trim() ? "No donations match your search criteria." : "No donations found in the database."}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Donations;