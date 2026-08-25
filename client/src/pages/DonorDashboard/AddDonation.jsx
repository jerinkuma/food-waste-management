import Sidebar from "../../components/DonorDashboard/Sidebar";
import Topbar from "../../components/DonorDashboard/Topbar";

import FoodInformation from "../../components/DonorDashboard/AddDonation/FoodInformation";
import FoodCondition from "../../components/DonorDashboard/AddDonation/StorageCondition";
import PickupInformation from "../../components/DonorDashboard/AddDonation/PickupInformation";
import SafetyDeclaration from "../../components/DonorDashboard/AddDonation/SafetyDeclaration";
import DonationPreview from "../../components/DonorDashboard/AddDonation/DonationPreview";
import ActionButtons from "../../components/DonorDashboard/AddDonation/ActionButtons";

import DonationByCard from "../../components/DonorDashboard/AddDonation/DonationByCard";

const AddDonation = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">

            <Sidebar />

            <div className="flex-1 ml-72">

                <Topbar />

                <div className="p-8">

                    {/* Page Header */}

                    <div className="mb-8">

                        <p className="mt-2 text-gray-500">
                            Provide accurate food and pickup information before submitting.
                        </p>

                    </div>

                    <div className="space-y-8">

                        <DonationByCard />

                        <FoodInformation />

                        <FoodCondition />

                        <PickupInformation />

                        <SafetyDeclaration />

                        <DonationPreview />

                        <ActionButtons />

                    </div>

                </div>

            </div>

        </div>
    );
};

export default AddDonation;