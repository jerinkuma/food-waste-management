import { CheckCircle2, QrCode, Download, Printer, LayoutDashboard, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DonationSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">

      <div className="w-full max-w-5xl rounded-3xl bg-white shadow-xl p-10">

        {/* Success */}

        <div className="text-center">

          <CheckCircle2
            size={80}
            className="mx-auto text-green-600"
          />

          <h1 className="mt-5 text-4xl font-bold text-gray-800">
            Donation Published Successfully 🎉
          </h1>

          <p className="mt-3 text-gray-500">
            Your donation is now available for NGO acceptance.
          </p>

        </div>

        {/* Information */}

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">

          {/* Left */}

          <div className="rounded-3xl bg-gray-50 p-8">

            <h2 className="mb-6 text-2xl font-bold">
              Donation Details
            </h2>

            <div className="space-y-5">

              <Info title="Donation ID" value="FD-2026-00125" />

              <Info title="Restaurant" value="Cafe One" />

              <Info title="Food" value="Chicken Biryani" />

              <Info title="Quantity" value="20 KG" />

              <Info title="Estimated Meals" value="80 Meals" />

              <Info title="CO₂ Saved" value="5.2 KG" />

              <Info
                title="Status"
                value="Waiting for NGO Acceptance"
              />

            </div>

          </div>

          {/* Right */}

          <div className="rounded-3xl border-2 border-dashed border-green-300 p-8 text-center">

            <QrCode
              size={180}
              className="mx-auto text-green-700"
            />

            <p className="mt-5 font-semibold text-gray-700">
              QR Code for Verification
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Volunteer or NGO will scan this QR during pickup.
            </p>

          </div>

        </div>

        {/* Timeline */}

        <div className="mt-12 rounded-3xl bg-green-50 p-8">

          <h2 className="mb-6 text-2xl font-bold text-green-700">
            Donation Timeline
          </h2>

          <div className="space-y-5">

            <Timeline
              title="Donation Created"
              active
            />

            <Timeline
              title="Published"
              active
            />

            <Timeline
              title="NGO Accepted"
            />

            <Timeline
              title="Food Picked Up"
            />

            <Timeline
              title="Delivered"
            />

            <Timeline
              title="Completed"
            />

          </div>

        </div>

        {/* Buttons */}

        <div className="mt-10 flex flex-wrap justify-center gap-5">

          <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">

            <Download size={20} />

            Download QR

          </button>

          <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-white hover:bg-orange-600">

            <Printer size={20} />

            Print QR

          </button>

          <button
            onClick={() => navigate("/restaurant/dashboard")}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-white hover:bg-green-700"
          >

            <LayoutDashboard size={20} />

            Dashboard

          </button>

          <button
            onClick={() => navigate("/restaurant/history")}
            className="flex items-center gap-2 rounded-xl border border-gray-300 px-6 py-3 hover:bg-gray-100"
          >

            <History size={20} />

            Donation History

          </button>

        </div>

      </div>

    </div>
  );
};

const Info = ({ title, value }) => (
  <div className="flex justify-between border-b pb-3">
    <span className="text-gray-500">{title}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

const Timeline = ({ title, active }) => (
  <div className="flex items-center gap-4">

    <div
      className={`h-5 w-5 rounded-full ${
        active
          ? "bg-green-600"
          : "bg-gray-300"
      }`}
    />

    <p
      className={`font-medium ${
        active
          ? "text-green-700"
          : "text-gray-500"
      }`}
    >
      {title}
    </p>

  </div>
);

export default DonationSuccess;