import {
  Leaf,
  Trees,
  Utensils,
  Droplets,
  Recycle,
  Target,
} from "lucide-react";

const EnvironmentalImpact = () => {
  return (
    <div className="rounded-3xl bg-white p-7 shadow-sm border border-gray-200">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-gray-800">
            Environmental Impact
          </h2>

          <p className="mt-1 text-gray-500">
            Your contribution towards a sustainable future.
          </p>

        </div>

        <div className="rounded-2xl bg-green-100 p-3">
          <Leaf className="text-green-600" size={28} />
        </div>

      </div>

      {/* Statistics */}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

        <div className="rounded-2xl bg-green-50 p-5">
          <Leaf className="text-green-600 mb-3" size={26} />
          <p className="text-gray-500 text-sm">Carbon Prevented</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            2.3 Tons
          </h3>
        </div>

        <div className="rounded-2xl bg-orange-50 p-5">
          <Recycle className="text-orange-600 mb-3" size={26} />
          <p className="text-gray-500 text-sm">Food Waste Diverted</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            512 KG
          </h3>
        </div>

        <div className="rounded-2xl bg-blue-50 p-5">
          <Utensils className="text-blue-600 mb-3" size={26} />
          <p className="text-gray-500 text-sm">Meals Served</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            3,240
          </h3>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-5">
          <Trees className="text-emerald-600 mb-3" size={26} />
          <p className="text-gray-500 text-sm">Trees Equivalent</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            108 Trees
          </h3>
        </div>

        <div className="rounded-2xl bg-cyan-50 p-5">
          <Droplets className="text-cyan-600 mb-3" size={26} />
          <p className="text-gray-500 text-sm">Water Saved</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            8,450 L
          </h3>
        </div>

        <div className="rounded-2xl bg-purple-50 p-5">
          <Target className="text-purple-600 mb-3" size={26} />
          <p className="text-gray-500 text-sm">Annual Goal</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            72%
          </h3>
        </div>

      </div>

      {/* Progress */}

      <div className="mt-8">

        <div className="flex items-center justify-between mb-2">

          <span className="text-gray-600 font-medium">
            Sustainability Goal Progress
          </span>

          <span className="font-bold text-green-600">
            72%
          </span>

        </div>

        <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">

          <div
            className="h-full rounded-full bg-green-500"
            style={{ width: "72%" }}
          ></div>

        </div>

      </div>

    </div>
  );
};

export default EnvironmentalImpact;