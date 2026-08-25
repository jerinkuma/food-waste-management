import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Utensils,
  HeartHandshake,
  Star,
  Map as MapIcon,
  Maximize2,
  Truck,
  Check,
  X,
  ArrowRight,
} from "lucide-react";

import { Map as PigeonMap, Marker } from "pigeon-maps";

export default function NGODashboard({
  requests = [],
  handleAccept,
  handleDecline,
}) {
  const navigate = useNavigate();

  // Show only the first two requests
  const displayedRequests = requests.slice(0, 2);

  // Navigate to donation map
  const goToMap = () => {
    navigate("/ngo/donation-map");
  };

  return (
    <div className="space-y-6">

      {/* =====================================================
          STAT CARDS
      ====================================================== */}

      <div className="grid grid-cols-4 gap-5">

        {/* Total Claimed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">

          <div className="flex justify-between items-start">

            <div>
              <p className="text-xs font-semibold text-slate-400">
                Total Claimed
              </p>

              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                142
              </h3>
            </div>

            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
              <Utensils className="w-6 h-6" />
            </div>

          </div>

          <div className="flex justify-between items-center text-[11px]">

            <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              +6 Today
            </span>

            <span className="text-slate-400">
              Updated just now
            </span>

          </div>

        </div>


        {/* Meals Distributed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">

          <div className="flex justify-between items-start">

            <div>
              <p className="text-xs font-semibold text-slate-400">
                Meals Distributed
              </p>

              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                2,850
              </h3>
            </div>

            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
              <HeartHandshake className="w-6 h-6" />
            </div>

          </div>

          <div className="flex justify-between items-center text-[11px]">

            <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
              +140 Meals
            </span>

            <span className="text-slate-400">
              Updated just now
            </span>

          </div>

        </div>


        {/* Trust Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">

          <div className="flex justify-between items-start">

            <div>
              <p className="text-xs font-semibold text-slate-400">
                Trust Score
              </p>

              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                4.8{" "}
                <span className="text-amber-400 text-xl">
                  ★
                </span>
              </h3>
            </div>

            <div className="p-3 bg-amber-100 text-amber-500 rounded-2xl">
              <Star className="w-6 h-6 fill-amber-500" />
            </div>

          </div>

          <div className="flex justify-between items-center text-[11px]">

            <span className="text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
              94 Reviews
            </span>

            <span className="text-slate-400">
              Updated just now
            </span>

          </div>

        </div>


        {/* Food Waste Saved */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">

          <div className="flex justify-between items-start">

            <div>
              <p className="text-xs font-semibold text-slate-400">
                Food Waste Saved
              </p>

              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                1.8 Tons
              </h3>
            </div>

            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
              <Utensils className="w-6 h-6" />
            </div>

          </div>

          <div className="flex justify-between items-center text-[11px]">

            <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              +12% This Month
            </span>

            <span className="text-slate-400">
              Updated just now
            </span>

          </div>

        </div>

      </div>


      {/* =====================================================
          MAP + ACTIVE REQUESTS
      ====================================================== */}

      <div className="grid grid-cols-12 gap-6">

        {/* ===================================================
            MAP
        ==================================================== */}

        <div className="col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">

          <div className="flex justify-between items-center mb-3">

            <div className="flex items-center gap-2">

              <MapIcon className="w-5 h-5 text-emerald-600" />

              <h3 className="font-bold text-slate-900 text-sm">
                NEARBY FOOD{" "}
                <span className="text-slate-500 font-normal">
                  (Chattogram Area)
                </span>
              </h3>

            </div>

            <button
              onClick={goToMap}
              className="text-slate-400 hover:text-emerald-600 p-1"
              title="Open Full Map View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

          </div>


          <div
            onClick={goToMap}
            className="relative w-full h-80 rounded-xl overflow-hidden border border-slate-200 cursor-pointer group"
          >

            <PigeonMap
              defaultCenter={[22.3569, 91.7832]}
              defaultZoom={12}
            >

              <Marker
                width={40}
                anchor={[22.3587, 91.8215]}
                color="#059669"
              />

              <Marker
                width={40}
                anchor={[22.3303, 91.8122]}
                color="#f59e0b"
              />

            </PigeonMap>


            <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/20 transition-all flex items-center justify-center">

              <span className="bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-full text-xs font-bold text-slate-800 shadow-lg">
                📍 Click to Open Donation Map View
              </span>

            </div>

          </div>

        </div>


        {/* ===================================================
            ACTIVE REQUESTS
        ==================================================== */}

        <div className="col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">

          <div>

            <div className="flex justify-between items-center mb-3">

              <div>

                <h3 className="font-bold text-slate-900 text-sm">
                  ACTIVE REQUESTS
                </h3>

                <p className="text-[11px] text-slate-400 font-medium">
                  Showing latest 2 pending actions
                </p>

              </div>

              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {requests.length} Total
              </span>

            </div>


            <div className="space-y-3">

              {displayedRequests.map((req) => (

                <div
                  key={req.id}
                  className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2"
                >

                  <div className="flex justify-between items-start">

                    <div>

                      <h4 className="font-bold text-slate-900 text-xs">
                        {req.donor}
                      </h4>

                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">

                        <Truck className="w-3 h-3 text-rose-500" />

                        {req.logistics}

                      </p>

                    </div>

                    <span className="text-[10px] text-slate-400 font-medium">
                      {req.timeAgo}
                    </span>

                  </div>


                  <p className="text-[11px] text-slate-600 bg-white p-1.5 rounded border border-slate-100">
                    {req.foodTypes}
                  </p>


                  <div className="flex items-center gap-2 pt-1">

                    <button
                      onClick={() => handleAccept(req.id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      ACCEPT
                    </button>


                    <button
                      onClick={() => handleDecline(req.id)}
                      className="flex-1 bg-rose-700 hover:bg-rose-800 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      DECLINE
                    </button>

                  </div>

                </div>

              ))}


              {/* No Requests */}

              {displayedRequests.length === 0 && (

                <div className="text-center py-10">

                  <p className="text-sm text-slate-400">
                    No active donation requests.
                  </p>

                </div>

              )}

            </div>

          </div>


          {/* See All */}

          <button
            onClick={goToMap}
            className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
          >

            <span>
              SEE ALL ACTIVE REQUESTS ({requests.length})
            </span>

            <ArrowRight className="w-4 h-4 text-emerald-400" />

          </button>

        </div>

      </div>

    </div>
  );
}