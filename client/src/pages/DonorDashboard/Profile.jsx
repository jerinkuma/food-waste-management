import { useEffect, useState } from "react";

import DashboardLayout from "../../components/DonorDashboard/DashboardLayout";

import ProfileCard from "../../components/DonorDashboard/Profile/ProfileCard";
import RestaurantInfo from "../../components/DonorDashboard/Profile/RestaurantInfo";
import AccountInfo from "../../components/DonorDashboard/Profile/AccountInfo";

const Profile = () => {
  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  // =====================================
  // LOAD PROFILE
  // =====================================

  const loadProfile = async () => {
    try {
      const userData =
        localStorage.getItem("user");

      const user = userData
        ? JSON.parse(userData)
        : null;


      if (!user?.id) {
        console.error(
          "User information not found."
        );

        setLoading(false);

        return;
      }


      const response = await fetch(
        `http://localhost:5000/api/restaurants/profile/${user.id}`
      );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load profile."
        );
      }


      setProfile(
        data.restaurant
      );

    } catch (error) {
      console.error(
        "Restaurant profile error:",
        error
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadProfile();
  }, []);


  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-gray-500">
            Loading profile...
          </p>
        </div>
      </DashboardLayout>
    );
  }


  // =====================================
  // ERROR
  // =====================================

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
          Failed to load restaurant profile.
        </div>
      </DashboardLayout>
    );
  }


  // =====================================
  // PROFILE PAGE
  // =====================================

  return (
    <DashboardLayout>

      <div className="space-y-6 sm:space-y-8">

        


        {/* Profile Card */}
        <ProfileCard
          profile={profile}
          setProfile={setProfile}
        />


        {/* Information Sections */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          <RestaurantInfo
            profile={profile}
          />

          <AccountInfo
            profile={profile}
          />

        </div>

      </div>

    </DashboardLayout>
  );
};

export default Profile;