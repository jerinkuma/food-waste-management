import { HandPlatter, Users, HeartHandshake, MapPinned } from "lucide-react";

const stats = [
    {
        icon: <HandPlatter size={42} />,
        number: "1200+",
        title: "Food Donations",
    },
    {
        icon: <HeartHandshake size={42} />,
        number: "85+",
        title: "NGO Partners",
    },
    {
        icon: <Users size={42} />,
        number: "6500+",
        title: "People Served",
    },
    {
        icon: <MapPinned size={42} />,
        number: "20+",
        title: "Cities Covered",
    },
];

const Impact = () => {
    return (
        <section className="bg-gray-50 py-24 px-6">
            <div className="max-w-7xl mx-auto">

                <div className="text-center mb-14">

                    <h2 className="text-4xl font-bold text-gray-800">
                        Our Impact
                    </h2>

                    <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                        Together we reduce food waste and make sure surplus food
                        reaches people who need it.
                    </p>

                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

                    {stats.map((item, index) => (

                        <div
                            key={index}
                            className="rounded-2xl bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
                        >

                            <div className="text-green-600 mb-6">
                                {item.icon}
                            </div>

                            <h3 className="text-4xl font-bold text-gray-800">
                                {item.number}
                            </h3>

                            <p className="mt-3 text-gray-500">
                                {item.title}
                            </p>

                        </div>

                    ))}

                </div>

            </div>
        </section>
    );
};

export default Impact;