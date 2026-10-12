import React, {
  useState,
  useEffect,
  useCallback,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Phone,
  Eye,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  ChevronRight,
  PackageCheck,
  UserRound,
  Car,
  X,
} from "lucide-react";

import {
  Map as PigeonMap,
  Marker,
} from "pigeon-maps";

import { getCurrentUser } from "../../../services/auth";
import { getSocket } from "../../../services/socket";

import {
  fetchAvailableDonations,
  fetchNgoDonations,
  fetchNgoProfile,
  acceptDonation,
  updateDonationStatus,
  assignDeliveryDriver,
} from "../../../services/api";

import "./ActiveRequests.css";

const DEFAULT_CENTER = [
  22.3569,
  91.7832,
];

/*
  DONATION FLOW

  Available
      ↓
  Accept
      ↓
  NGO Requested / Accepted
      ↓
  Assign Driver
      ↓
  Delivery Man Assigned
      ↓
  Safety Verification
      ↓
  Food Picked Up
      ↓
  Completed
*/

const NEXT_STATUS = {
  "Food Picked Up": "Completed",
};

export default function ActiveRequests() {
  const user = getCurrentUser();

  const navigate = useNavigate();

  const [ngoId, setNgoId] =
    useState(null);

  const [available, setAvailable] =
    useState([]);

  const [activePickups, setActivePickups] =
    useState([]);

  const [alerts, setAlerts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [busyId, setBusyId] =
    useState(null);

  const [viewDetails, setViewDetails] =
    useState(null);

  const [showAllPickups, setShowAllPickups] =
    useState(false);

  const [showAllAvailable, setShowAllAvailable] =
    useState(false);

  // ==============================
  // DRIVER MODAL
  // ==============================

  const [showDriverModal, setShowDriverModal] =
    useState(false);

  const [driverDonation, setDriverDonation] =
    useState(null);

  const [driverName, setDriverName] =
    useState("");

  const [driverPhone, setDriverPhone] =
    useState("");

  const [vehicleNumber, setVehicleNumber] =
    useState("");

  const [assigningDriver, setAssigningDriver] =
    useState(false);



    

  // ==============================
  // ALERT
  // ==============================

  const pushAlert = useCallback(
    (text) => {
      setAlerts((prev) =>
        [
          {
            text,
            time:
              new Date().toLocaleTimeString(),
          },
          ...prev,
        ].slice(0, 20)
      );
    },
    []
  );

  // =====================================================
  // MERGE ACTIVE DONATION
  //
  // Prevent duplicate donations when both:
  // - API response
  // - Socket.IO event
  // return the same donation.
  // =====================================================

  const addOrUpdateActivePickup =
    useCallback((donation) => {
      if (!donation?._id) {
        return;
      }

      setActivePickups((prev) => {
        const exists = prev.some(
          (item) =>
            item._id === donation._id
        );

        if (exists) {
          return prev.map((item) =>
            item._id === donation._id
              ? {
                  ...item,
                  ...donation,
                }
              : item
          );
        }

        return [
          donation,
          ...prev,
        ];
      });
    }, []);

  // =====================================================
  // REMOVE FROM ACTIVE PICKUPS
  // =====================================================

  const removeFromActivePickups =
    useCallback((donationId) => {
      if (!donationId) {
        return;
      }

      setActivePickups((prev) =>
        prev.filter(
          (item) =>
            item._id !== donationId
        )
      );
    }, []);

  // =====================================================
  // LOAD AVAILABLE DONATIONS
  // =====================================================

  const loadAvailableDonations =
    useCallback(async () => {
      const loadList = async (
        latitude,
        longitude
      ) => {
        try {
          const list =
            await fetchAvailableDonations(
              latitude,
              longitude
            );

          setAvailable(
            Array.isArray(list)
              ? list
              : []
          );
        } catch (error) {
          console.error(
            "Available donation error:",
            error
          );

          setAvailable([]);
        }
      };

      navigator.geolocation?.getCurrentPosition(
        async (pos) => {
          await loadList(
            pos.coords.latitude,
            pos.coords.longitude
          );
        },

        async () => {
          await loadList();
        },

        {
          timeout: 4000,
        }
      );
    }, []);

  // =====================================================
  // LOAD EVERYTHING
  // =====================================================

  const loadEverything =
    useCallback(async () => {
      try {
        setLoading(true);

        // -----------------------------------------------
        // NGO PROFILE
        // -----------------------------------------------

        let profile = null;

        try {
          profile =
            await fetchNgoProfile();

          console.log(
            "NGO PROFILE:",
            profile
          );
        } catch (error) {
          console.error(
            "NGO profile loading error:",
            error
          );
        }

        /*
          NGO profile can expose different ID fields
          depending on backend response.

          Prefer NGO profile _id.
          Fall back to id / ngoId if needed.
        */

        const currentNgoId =
          profile?._id ||
          profile?.id ||
          profile?.ngoId ||
          null;

        setNgoId(currentNgoId);

        console.log(
          "CURRENT NGO PROFILE ID:",
          currentNgoId
        );

        // -----------------------------------------------
        // AVAILABLE DONATIONS
        // -----------------------------------------------

        await loadAvailableDonations();

        // -----------------------------------------------
        // NGO ACTIVE DONATIONS
        // -----------------------------------------------

        if (currentNgoId) {
          try {
            const result =
              await fetchNgoDonations(
                currentNgoId
              );

            console.log(
              "NGO DONATIONS RESULT:",
              result
            );

            const active =
              Array.isArray(
                result?.active
              )
                ? result.active
                : [];

            setActivePickups(active);
          } catch (error) {
            console.error(
              "NGO active donation error:",
              error
            );

            /*
              Don't destroy existing active
              pickups if the refresh API fails.
            */
          }
        }
      } catch (error) {
        console.error(
          "Error loading active requests:",
          error
        );
      } finally {
        setLoading(false);
      }
    }, [loadAvailableDonations]);

  // =====================================================
  // INITIAL LOAD + SOCKET
  // =====================================================

  useEffect(() => {
    loadEverything();

    const socket = getSocket();

    // -----------------------------------------------
    // NEW DONATION
    // -----------------------------------------------

    const onNew = (donation) => {
      pushAlert(
        `🍱 New donation posted: ${
          donation.foodName
        } (${donation.quantity}kg)`
      );

      loadAvailableDonations();
    };

    // -----------------------------------------------
    // DONATION UPDATED
    // -----------------------------------------------

    const onUpdated = (donation) => {
      if (!donation?._id) {
        return;
      }

      console.log(
        "SOCKET DONATION UPDATED:",
        donation
      );

      pushAlert(
        `🔄 ${
          donation.foodName ||
          "Donation"
        } is now "${
          donation.status ||
          donation.pipelineStatus ||
          "Updated"
        }"`
      );

      /*
        If the donation belongs to this NGO,
        immediately update Active Pickups.
      */

      const requestedBy =
        donation?.ngoRequest
          ?.requestedBy;

      const requestedNgoId =
        typeof requestedBy ===
        "object"
          ? requestedBy?._id
          : requestedBy;

      if (
        ngoId &&
        requestedNgoId &&
        requestedNgoId.toString() ===
          ngoId.toString()
      ) {
        if (
          ["Completed", "Rejected"].includes(
            donation.pipelineStatus
          )
        ) {
          removeFromActivePickups(
            donation._id
          );
        } else {
          addOrUpdateActivePickup(
            donation
          );
        }
      }

      /*
        Refresh available list too.
      */

      loadAvailableDonations();
    };

    socket.on(
      "donation:new",
      onNew
    );

    socket.on(
      "donation:updated",
      onUpdated
    );

    return () => {
      socket.off(
        "donation:new",
        onNew
      );

      socket.off(
        "donation:updated",
        onUpdated
      );
    };
  }, [
    loadEverything,
    loadAvailableDonations,
    pushAlert,
    ngoId,
    addOrUpdateActivePickup,
    removeFromActivePickups,
  ]);

  // =====================================================
  // ACCEPT DONATION
  // =====================================================

  const handleAccept = async (
    donationId
  ) => {
    if (!ngoId) {
      alert(
        "Your NGO profile could not be verified. Please log in again."
      );

      return;
    }

    setBusyId(donationId);

    try {
      /*
        Backend uses the logged-in NGO profile.
        ngoId is still passed for compatibility.
      */

      const response =
        await acceptDonation(
          donationId,
          ngoId
        );

      console.log(
        "ACCEPT RESPONSE:",
        response
      );

      const acceptedDonation =
        response?.donation;

      // -----------------------------------------------
      // REMOVE FROM AVAILABLE
      // -----------------------------------------------

      setAvailable((prev) =>
        prev.filter(
          (item) =>
            item._id !== donationId
        )
      );

      // -----------------------------------------------
      // IMMEDIATELY ADD TO ACTIVE PICKUPS
      // -----------------------------------------------

      if (acceptedDonation) {
        addOrUpdateActivePickup(
          acceptedDonation
        );
      }

      pushAlert(
        "✅ Donation accepted — moved to your Active Pickups."
      );

      /*
        Refresh backend data after the immediate UI
        update. This keeps the UI synchronized.
      */

      try {
        const result =
          await fetchNgoDonations(
            ngoId
          );

        const active =
          Array.isArray(
            result?.active
          )
            ? result.active
            : [];

        /*
          If backend returns the accepted donation,
          use the backend list.

          If for any reason it does not return it yet,
          keep the donation already inserted from
          acceptDonation response.
        */

        if (active.length > 0) {
          setActivePickups((prev) => {
            const map =
              new Map();

            prev.forEach((item) =>
              map.set(
                item._id,
                item
              )
            );

            active.forEach((item) =>
              map.set(
                item._id,
                item
              )
            );

            return Array.from(
              map.values()
            );
          });
        }
      } catch (refreshError) {
        console.error(
          "Active pickup refresh error:",
          refreshError
        );
      }
    } catch (error) {
      console.error(
        "Accept donation error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to accept this donation."
      );
    } finally {
      setBusyId(null);
    }
  };

  // =====================================================
  // REJECT
  // =====================================================

  const handleReject = async (
    donationId
  ) => {
    setBusyId(donationId);

    try {
      await updateDonationStatus(
        donationId,
        "Rejected",
        "Declined by NGO",
        user?.id
      );

      setAvailable((prev) =>
        prev.filter(
          (item) =>
            item._id !== donationId
        )
      );

      pushAlert(
        "⛔ Donation declined."
      );

      await loadEverything();
    } catch (error) {
      console.error(
        "Reject donation error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to decline."
      );
    } finally {
      setBusyId(null);
    }
  };

  // =====================================================
  // OPEN DRIVER MODAL
  // =====================================================

  const openDriverModal = (
    donation
  ) => {
    setDriverDonation(donation);

    setDriverName(
      donation?.deliveryMan?.name ||
        ""
    );

    setDriverPhone(
      donation?.deliveryMan?.phone ||
        ""
    );

    setVehicleNumber(
      donation?.deliveryMan
        ?.vehicleNumber || ""
    );

    setShowDriverModal(true);
  };

  // =====================================================
  // CLOSE DRIVER MODAL
  // =====================================================

  const closeDriverModal = () => {
    if (assigningDriver) {
      return;
    }

    setShowDriverModal(false);
    setDriverDonation(null);
    setDriverName("");
    setDriverPhone("");
    setVehicleNumber("");
  };

  // =====================================================
  // ASSIGN DRIVER
  // =====================================================

  const handleAssignDriver =
    async () => {
      if (!driverDonation?._id) {
        return;
      }

      if (
        !driverName.trim() ||
        !driverPhone.trim() ||
        !vehicleNumber.trim()
      ) {
        alert(
          "Driver name, phone number and vehicle number are required."
        );

        return;
      }

      setAssigningDriver(true);

      try {
        const response =
          await assignDeliveryDriver(
            driverDonation._id,
            driverName.trim(),
            driverPhone.trim(),
            vehicleNumber.trim()
          );

        console.log(
          "ASSIGN DRIVER RESPONSE:",
          response
        );

        const updatedDonation =
          response?.donation;

        /*
          Immediately update Active Pickups
          with the backend response.
        */

        if (updatedDonation) {
          addOrUpdateActivePickup(
            updatedDonation
          );

          setDriverDonation(
            updatedDonation
          );
        }

        pushAlert(
          `🚚 Driver assigned to ${
            driverDonation.foodName
          }.`
        );

        closeDriverModal();

        /*
          Small refresh after successful assignment.
        */

        try {
          const result =
            await fetchNgoDonations(
              ngoId
            );

          const active =
            Array.isArray(
              result?.active
            )
              ? result.active
              : [];

          if (active.length > 0) {
            setActivePickups(
              active
            );
          }
        } catch (refreshError) {
          console.error(
            "Driver refresh error:",
            refreshError
          );
        }
      } catch (error) {
        console.error(
          "Assign driver error:",
          error
        );

        alert(
          error?.response?.data?.message ||
            "Failed to assign driver."
        );
      } finally {
        setAssigningDriver(false);
      }
    };

  // =====================================================
  // OPEN QR VERIFICATION
  // =====================================================

  const openSafetyVerification = (
    donation
  ) => {
    if (!donation?.donationId) {
      alert(
        "Donation ID is missing."
      );

      return;
    }

    if (
      !donation.deliveryMan?.name
    ) {
      alert(
        "Please assign a delivery driver first."
      );

      return;
    }

    navigate(
      `/delivery/safety/${donation.donationId}`
    );
  };

  // =====================================================
  // COMPLETE DONATION
  // =====================================================

  const handleAdvanceStatus =
    async (donation) => {
      const next =
        NEXT_STATUS[
          donation.status
        ];

      if (!next) {
        return;
      }

      setBusyId(
        donation._id
      );

      try {
        const response =
          await updateDonationStatus(
            donation._id,
            next,
            "Donation completed after food pickup.",
            user?.id
          );

        console.log(
          "COMPLETE RESPONSE:",
          response
        );

        pushAlert(
          `📦 ${
            donation.foodName
          } marked as "${next}".`
        );

        removeFromActivePickups(
          donation._id
        );

        await loadEverything();
      } catch (error) {
        console.error(
          "Complete donation error:",
          error
        );

        alert(
          error?.response?.data?.message ||
            "Failed to update status."
        );
      } finally {
        setBusyId(null);
      }
    };

  // =====================================================
  // DISPLAY DATA
  // =====================================================

  const displayedAvailable =
    showAllAvailable
      ? available
      : available.slice(0, 2);

  const displayedPickups =
    showAllPickups
      ? activePickups
      : activePickups.slice(0, 2);

  const displayedAlerts =
    alerts.slice(0, 6);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="ar-container flex justify-center items-center h-64">
        <p className="text-slate-500 font-medium">
          Loading active requests...
        </p>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="ar-container">

      {/* ==========================
          TOP BANNER
      ========================== */}

      <div className="ar-top-banner">
        <div>
          <h2 className="ar-banner-title">
            ACTIVE PICKUPS: Live Restaurant
            &rarr; NGO Pipeline
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            {available.length} donation(s)
            waiting to be claimed
            &middot;{" "}
            {activePickups.length} in your
            active pipeline
          </p>
        </div>
      </div>

      <div className="ar-main-grid">

        {/* ==========================
            LEFT COLUMN
        ========================== */}

        <div className="ar-pickup-list-col">

          {/* ==========================
              AVAILABLE DONATIONS
          ========================== */}

          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
            Available Donations Near You
          </h3>

          {displayedAvailable.length ===
          0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 mb-4">
              <p className="text-slate-500 text-sm">
                No pending donations right now.
                New posts appear here instantly.
              </p>
            </div>
          ) : (
            displayedAvailable.map(
              (donation) => (
                <div
                  key={donation._id}
                  className="ar-pickup-card"
                >
                  <div className="ar-card-grid">

                    <div className="ar-card-info">

                      <div className="ar-id-row">
                        <span className="ar-id-text">
                          DONATION:{" "}
                          {donation.donationId}
                        </span>

                        <span className="ar-status-badge">
                          <span className="ar-status-ping"></span>

                          {donation.status ||
                            "Pending"}
                        </span>
                      </div>

                      <p className="text-slate-700">
                        <span className="font-bold text-slate-900">
                          RESTAURANT:
                        </span>{" "}
                        {donation.donor?.name ||
                          "Unknown"}{" "}

                        {donation.distanceKm !=
                        null ? (
                          <span className="text-amber-500 font-bold">
                            (
                            {
                              donation.distanceKm
                            }{" "}
                            km away)
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium text-[11px]">
                            (distance unavailable)
                          </span>
                        )}
                      </p>

                      <div className="ar-food-box">
                        <p className="font-bold text-slate-800 text-[11px]">
                          FOOD:
                        </p>

                        <p className="text-slate-600 text-[11px] mt-0.5">
                          {donation.foodName}
                          {" · "}
                          {donation.quantity}kg
                          {" · "}
                          ~
                          {
                            donation.estimatedMeals
                          }{" "}
                          meals
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="font-bold text-slate-900">
                          PICKUP ADDRESS:
                        </span>

                        <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 truncate max-w-[160px]">
                          {
                            donation.pickupAddress
                          }
                        </span>
                      </div>

                      <div className="ar-action-btns">

                        <button
                          className="ar-btn-view"
                          onClick={() =>
                            setViewDetails(
                              donation
                            )
                          }
                        >
                          <Eye className="w-3.5 h-3.5" />
                          VIEW DETAILS
                        </button>

                        <button
                          disabled={
                            busyId ===
                            donation._id
                          }
                          onClick={() =>
                            handleAccept(
                              donation._id
                            )
                          }
                          className="ar-btn-contact"
                          style={{
                            background:
                              "#059669",
                          }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />

                          {busyId ===
                          donation._id
                            ? "ACCEPTING..."
                            : "ACCEPT"}
                        </button>

                        <button
                          disabled={
                            busyId ===
                            donation._id
                          }
                          onClick={() =>
                            handleReject(
                              donation._id
                            )
                          }
                          className="ar-btn-archive"
                        >
                          DECLINE
                        </button>

                      </div>
                    </div>

                    {/* MAP */}

                    <div className="ar-card-map-col">

                      <div className="flex justify-between items-center mb-1">

                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Pickup Location
                        </span>

                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3" />

                          {donation
                            .resolvedLocation
                              ?.source ||
                            "unresolved"}
                        </span>

                      </div>

                      <div className="ar-map-wrapper">

                        <PigeonMap
                          defaultCenter={
                            donation.resolvedLocation
                              ? [
                                  donation
                                    .resolvedLocation
                                    .lat,

                                  donation
                                    .resolvedLocation
                                    .lng,
                                ]
                              : DEFAULT_CENTER
                          }
                          defaultZoom={13}
                        >

                          {donation.resolvedLocation && (
                            <Marker
                              width={30}
                              anchor={[
                                donation
                                  .resolvedLocation
                                  .lat,

                                donation
                                  .resolvedLocation
                                  .lng,
                              ]}
                              color="#059669"
                            />
                          )}

                        </PigeonMap>

                      </div>
                    </div>

                  </div>
                </div>
              )
            )
          )}

          {available.length > 2 && (
            <button
              onClick={() =>
                setShowAllAvailable(
                  !showAllAvailable
                )
              }
              className="ar-see-more-btn"
            >
              <span>
                {showAllAvailable
                  ? "SHOW LESS"
                  : `SEE MORE (${
                      available.length - 2
                    } MORE)`}
              </span>

              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  showAllAvailable
                    ? "-rotate-90"
                    : "rotate-90"
                }`}
              />
            </button>
          )}

          {/* ==========================
              ACTIVE PICKUPS
          ========================== */}

          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mt-6 mb-2">
            My Active Pickups
          </h3>

          {displayedPickups.length ===
          0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
              <p className="text-slate-500 text-sm">
                You haven't accepted any
                donations yet.
              </p>
            </div>
          ) : (
            displayedPickups.map(
              (pickup) => (
                <div
                  key={pickup._id}
                  className="ar-pickup-card"
                >
                  <div
                    className="ar-card-info"
                    style={{
                      width: "100%",
                    }}
                  >

                    <div className="ar-id-row">

                      <span className="ar-id-text">
                        PICKUP:{" "}
                        {pickup.donationId}
                      </span>

                      <span className="ar-status-badge">
                        <span className="ar-status-ping"></span>

                        {pickup.status}
                      </span>

                    </div>

                    <p className="text-slate-700">
                      <span className="font-bold text-slate-900">
                        RESTAURANT:
                      </span>{" "}
                      {pickup.donor?.name ||
                        "Unknown"}
                    </p>

                    <div className="ar-food-box">

                      <p className="font-bold text-slate-800 text-[11px]">
                        FOOD:
                      </p>

                      <p className="text-slate-600 text-[11px] mt-0.5">
                        {pickup.foodName}
                        {" · "}
                        {pickup.quantity}kg
                        {" · "}
                        ~
                        {
                          pickup.estimatedMeals
                        }{" "}
                        meals
                      </p>

                    </div>

                    {/* DRIVER INFO */}

                    {pickup.deliveryMan?.name && (
                      <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">

                        <div className="flex items-center gap-2 mb-2">

                          <UserRound
                            size={15}
                            className="text-emerald-600"
                          />

                          <span className="text-[11px] font-bold text-slate-800">
                            DELIVERY DRIVER
                          </span>

                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">

                          <p className="text-slate-600">
                            <span className="font-bold text-slate-800">
                              Name:
                            </span>{" "}
                            {
                              pickup
                                .deliveryMan
                                .name
                            }
                          </p>

                          <p className="text-slate-600">
                            <span className="font-bold text-slate-800">
                              Phone:
                            </span>{" "}
                            {
                              pickup
                                .deliveryMan
                                .phone
                            }
                          </p>

                          <p className="text-slate-600">
                            <span className="font-bold text-slate-800">
                              Vehicle:
                            </span>{" "}
                            {
                              pickup
                                .deliveryMan
                                .vehicleNumber
                            }
                          </p>

                        </div>
                      </div>
                    )}

                    <div className="ar-action-btns mt-3">

                      {/* DETAILS */}

                      <button
                        className="ar-btn-view"
                        onClick={() =>
                          setViewDetails(
                            pickup
                          )
                        }
                      >
                        <Eye className="w-3.5 h-3.5" />
                        VIEW DETAILS
                      </button>

                      {/* CALL RESTAURANT */}

                      <a
                        href={`tel:${pickup.contactNumber}`}
                        className="ar-btn-contact"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        CALL RESTAURANT
                      </a>

                      {/* DRIVER */}

                      {[
                        "NGO Requested",
                        "Delivery Man Assigned",
                      ].includes(
                        pickup.status
                      ) && (
                        <button
                          onClick={() =>
                            openDriverModal(
                              pickup
                            )
                          }
                          className="ar-btn-contact"
                          style={{
                            background:
                              "#2563eb",
                          }}
                        >
                          <Car className="w-3.5 h-3.5" />

                          {pickup
                            .deliveryMan
                            ?.name
                            ? "UPDATE DRIVER"
                            : "ASSIGN DRIVER"}
                        </button>
                      )}

                      {/* QR VERIFICATION */}

                      {pickup.status ===
                        "Delivery Man Assigned" && (
                        <button
                          onClick={() =>
                            openSafetyVerification(
                              pickup
                            )
                          }
                          className="ar-btn-contact"
                          style={{
                            background:
                              "#7c3aed",
                          }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          VERIFY PICKUP
                        </button>
                      )}

                      {/* COMPLETE */}

                      {NEXT_STATUS[
                        pickup.status
                      ] && (
                        <button
                          disabled={
                            busyId ===
                            pickup._id
                          }
                          onClick={() =>
                            handleAdvanceStatus(
                              pickup
                            )
                          }
                          className="ar-btn-archive"
                          style={{
                            background:
                              "#0f172a",
                            color: "#fff",
                          }}
                        >
                          <Truck
                            className="w-3.5 h-3.5"
                            style={{
                              display:
                                "inline",
                              marginRight: 4,
                            }}
                          />

                          {busyId ===
                          pickup._id
                            ? "UPDATING..."
                            : 'MARK "COMPLETED"'}
                        </button>
                      )}

                      {/* COMPLETED */}

                      {pickup.status ===
                        "Completed" && (
                        <span
                          className="ar-btn-archive"
                          style={{
                            background:
                              "#dcfce7",
                            color:
                              "#166534",
                          }}
                        >
                          <PackageCheck
                            className="w-3.5 h-3.5"
                            style={{
                              display:
                                "inline",
                              marginRight: 4,
                            }}
                          />

                          ARCHIVED IN HISTORY
                        </span>
                      )}

                    </div>
                  </div>
                </div>
              )
            )
          )}

          {activePickups.length > 2 && (
            <button
              onClick={() =>
                setShowAllPickups(
                  !showAllPickups
                )
              }
              className="ar-see-more-btn"
            >
              <span>
                {showAllPickups
                  ? "SHOW LESS PICKUPS"
                  : `SEE MORE PICKUPS (${
                      activePickups.length -
                      2
                    } MORE)`}
              </span>

              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  showAllPickups
                    ? "-rotate-90"
                    : "rotate-90"
                }`}
              />
            </button>
          )}

        </div>

        {/* ==========================
            RIGHT COLUMN
        ========================== */}

        <div className="ar-alerts-col">

          <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-3">

            <Clock className="w-5 h-5 text-amber-400" />

            <div>

              <h3 className="font-bold text-sm tracking-wide">
                LIVE ACTIVITY FEED
              </h3>

              <p className="text-[10px] text-slate-400">
                Real-time via Socket.IO
              </p>

            </div>
          </div>

          <div className="space-y-3">

            {displayedAlerts.length ===
            0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No recent activity yet.
              </p>
            ) : (
              displayedAlerts.map(
                (al, idx) => (
                  <div
                    key={idx}
                    className="ar-alert-card"
                  >

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">

                      <span className="text-emerald-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {al.time}
                      </span>

                      <span className="uppercase text-[9px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">
                        Live
                      </span>

                    </div>

                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                      {al.text}
                    </p>

                  </div>
                )
              )
            )}

          </div>

          <div className="mt-6 pt-4 border-t border-slate-700 text-center">

            <p className="text-[10px] text-slate-400">
              Auto-updating live via FeedLink
              Real-Time Sync
            </p>

          </div>

        </div>
      </div>

      {/* ==========================
          VIEW DETAILS MODAL
      ========================== */}

      {viewDetails && (
        <div className="ar-modal-backdrop">

          <div className="ar-modal-content">

            <div className="flex justify-between items-start border-b border-slate-100 pb-3">

              <div>

                <h3 className="font-bold text-slate-900 text-base">
                  Donation Details
                </h3>

                <p className="text-xs text-slate-500">
                  ID:{" "}
                  {viewDetails.donationId}
                </p>

              </div>

              <button
                onClick={() =>
                  setViewDetails(null)
                }
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>

            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200/80 text-xs">

              <p className="text-slate-700">
                <span className="font-bold">
                  Restaurant:
                </span>{" "}
                {viewDetails.donor?.name}
              </p>

              <p className="text-slate-700">
                <span className="font-bold">
                  Food:
                </span>{" "}
                {viewDetails.foodName} (
                {
                  viewDetails.foodCategory
                }
                ,{" "}
                {
                  viewDetails.condition
                }
                )
              </p>

              <p className="text-slate-700">
                <span className="font-bold">
                  Quantity:
                </span>{" "}
                {viewDetails.quantity} kg
                {" · "}
                ~
                {
                  viewDetails.estimatedMeals
                }{" "}
                meals
              </p>

              <p className="text-slate-700">
                <span className="font-bold">
                  Best Before:
                </span>{" "}
                {viewDetails.bestBefore
                  ? new Date(
                      viewDetails.bestBefore
                    ).toLocaleString()
                  : "N/A"}
              </p>

              <p className="text-slate-700">
                <span className="font-bold">
                  Pickup Address:
                </span>{" "}
                {
                  viewDetails.pickupAddress
                }
              </p>

              <p className="text-slate-700">
                <span className="font-bold">
                  Pickup Window:
                </span>{" "}
                {viewDetails.pickupDate
                  ? new Date(
                      viewDetails.pickupDate
                    ).toLocaleDateString()
                  : ""}
                {" at "}
                {
                  viewDetails.pickupTime
                }{" "}
                (
                {
                  viewDetails.pickupDuration
                }
                )
              </p>

              <p className="text-slate-700">
                <span className="font-bold">
                  Contact:
                </span>{" "}
                {
                  viewDetails.contactNumber
                }
              </p>

              {viewDetails.specialInstructions && (
                <p className="text-slate-700">
                  <span className="font-bold">
                    Notes:
                  </span>{" "}
                  {
                    viewDetails.specialInstructions
                  }
                </p>
              )}

              {viewDetails.deliveryMan
                ?.name && (
                <div className="mt-3 border-t border-slate-200 pt-3">

                  <p className="font-bold text-slate-800 mb-2">
                    Delivery Driver
                  </p>

                  <p className="text-slate-700">
                    <span className="font-bold">
                      Name:
                    </span>{" "}
                    {
                      viewDetails
                        .deliveryMan
                        .name
                    }
                  </p>

                  <p className="text-slate-700">
                    <span className="font-bold">
                      Phone:
                    </span>{" "}
                    {
                      viewDetails
                        .deliveryMan
                        .phone
                    }
                  </p>

                  <p className="text-slate-700">
                    <span className="font-bold">
                      Vehicle:
                    </span>{" "}
                    {
                      viewDetails
                        .deliveryMan
                        .vehicleNumber
                    }
                  </p>

                </div>
              )}

            </div>

            <button
              onClick={() =>
                setViewDetails(null)
              }
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer border-none w-full"
            >
              Close
            </button>

          </div>
        </div>
      )}

      {/* ==========================
          DRIVER ASSIGN MODAL
      ========================== */}

      {showDriverModal &&
        driverDonation && (
          <div className="ar-modal-backdrop">

            <div className="ar-modal-content">

              <div className="flex justify-between items-start border-b border-slate-100 pb-3">

                <div>

                  <h3 className="font-bold text-slate-900 text-base">
                    {driverDonation.deliveryMan
                      ?.name
                      ? "Update Delivery Driver"
                      : "Assign Delivery Driver"}
                  </h3>

                  <p className="text-xs text-slate-500">
                    Donation ID:{" "}
                    {
                      driverDonation.donationId
                    }
                  </p>

                </div>

                <button
                  onClick={
                    closeDriverModal
                  }
                  disabled={
                    assigningDriver
                  }
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>

              </div>

              <div className="space-y-4 mt-4">

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Driver Name
                  </label>

                  <input
                    value={driverName}
                    onChange={(e) =>
                      setDriverName(
                        e.target.value
                      )
                    }
                    placeholder="Enter driver name"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Driver Phone
                  </label>

                  <input
                    value={driverPhone}
                    onChange={(e) =>
                      setDriverPhone(
                        e.target.value
                      )
                    }
                    placeholder="Enter phone number"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vehicle Number
                  </label>

                  <input
                    value={vehicleNumber}
                    onChange={(e) =>
                      setVehicleNumber(
                        e.target.value
                      )
                    }
                    placeholder="Enter vehicle number"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />

                </div>

              </div>

              <div className="flex gap-3 mt-5">

                <button
                  onClick={
                    closeDriverModal
                  }
                  disabled={
                    assigningDriver
                  }
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs"
                >
                  CANCEL
                </button>

                <button
                  onClick={
                    handleAssignDriver
                  }
                  disabled={
                    assigningDriver
                  }
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs"
                >
                  {assigningDriver
                    ? "SAVING..."
                    : driverDonation
                        .deliveryMan
                        ?.name
                    ? "UPDATE DRIVER"
                    : "ASSIGN DRIVER"}
                </button>

              </div>

            </div>
          </div>
        )}

    </div>
  );
}