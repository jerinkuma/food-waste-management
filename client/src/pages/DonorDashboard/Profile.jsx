import Sidebar from "../../components/DonorDashboard/Sidebar";
import Topbar from "../../components/DonorDashboard/Topbar";

import ProfileCard from "../../components/DonorDashboard/Profile/ProfileCard";
import RestaurantInfo from "../../components/DonorDashboard/Profile/RestaurantInfo";
import AccountInfo from "../../components/DonorDashboard/Profile/AccountInfo";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-100">

      <Sidebar />

      <div className="ml-72">

        <Topbar />

        <main className="space-y-8 p-8">

          <div>

            <h1 className="text-3xl font-bold text-gray-900">
              Restaurant Profile
            </h1>

            <p className="mt-2 text-gray-500">
              View and manage your restaurant information.
            </p>

          </div>

          <ProfileCard />

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">

            <RestaurantInfo />

            <AccountInfo />

          </div>

        </main>

      </div>

    </div>
  );
};

export default Profile;