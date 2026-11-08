
import { useEffect, useState } from "react";
import { Image, Loader2, CalendarDays, Package, AlertCircle } from "lucide-react";
import DashboardLayout from "../../components/DonorDashboard/DashboardLayout";

const API_URL = "http://localhost:5000";

const DistributionProof = () => {
    const [proofs, setProofs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProofs = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/api/ngo/donor/distribution-proofs`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load distribution proofs."
                    );
                }

                setProofs(data.proofs || []);
            } catch (err) {
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        };

        fetchProofs();
    }, []);

    const getImageSrc = (url) => {
        if (!url) return "";
        return url.startsWith("http") ? url : `${API_URL}${url}`;
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen p-4 md:p-6">
                <div className="mb-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-green-100 p-3 text-green-700">
                            <Image size={25} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                                Distribution Proofs
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                View photos and details submitted by NGO partners after food
                                distribution.
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex min-h-60 items-center justify-center">
                        <Loader2 className="animate-spin text-green-600" size={35} />
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
                        <AlertCircle size={22} />
                        <p>{error}</p>
                    </div>
                ) : proofs.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
                        <Image
                            size={45}
                            className="mx-auto mb-3 text-gray-400"
                        />
                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                            No Distribution Proof Yet
                        </h2>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Distribution photos and reports will appear here after an NGO
                            submits them.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        {proofs.map((proof) => {
                            const images =
                                proof.imageUrls?.length > 0
                                    ? proof.imageUrls
                                    : proof.imageUrl
                                        ? [proof.imageUrl]
                                        : [];

                            return (
                                <div
                                    key={proof._id}
                                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
                                >
                                    <div className="border-b border-gray-100 p-5 dark:border-gray-800">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <h2>{proof.ngoName || "NGO Partner"}</h2>

                                                <p>
                                                    NGO ID: {proof.ngoOrganizationId || "Not available"}
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                Proof Submitted
                                            </span>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-2">
                                                <Package size={16} />
                                                Donation: {proof.donationId || "N/A"}
                                            </span>

                                            <span className="flex items-center gap-2">
                                                <CalendarDays size={16} />
                                                {proof.createdAt
                                                    ? new Date(proof.createdAt).toLocaleDateString()
                                                    : "Date unavailable"}
                                            </span>
                                        </div>
                                    </div>

                                    {images.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2 p-4">
                                            {images.map((image, index) => (
                                                <a
                                                    key={`${proof._id}-${index}`}
                                                    href={getImageSrc(image)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block overflow-hidden rounded-xl"
                                                >
                                                    <img
                                                        src={getImageSrc(image)}
                                                        alt={`Distribution proof ${index + 1}`}
                                                        className="h-44 w-full object-cover transition-transform duration-300 hover:scale-105"
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    <div className="px-5 pb-5">
                                        <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                            Distribution Details
                                        </h3>

                                        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-gray-400">
                                            {proof.description || "No description provided."}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DistributionProof;
