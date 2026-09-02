import DashboardLayout from "../../components/DonorDashboard/DashboardLayout";

import ProfileCard from "../../components/DonorDashboard/Profile/ProfileCard";
import RestaurantInfo from "../../components/DonorDashboard/Profile/RestaurantInfo";
import AccountInfo from "../../components/DonorDashboard/Profile/AccountInfo";

const Profile = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Restaurant Profile
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            View and manage your restaurant information.
          </p>
        </div>

        {/* Profile Card */}
        <ProfileCard />

        {/* Information Sections */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <RestaurantInfo />
          <AccountInfo />
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Profile;