
import {
  Leaf,
  Trees,
  Droplets,
  Recycle,
} from "lucide-react";

const EnvironmentalImpact = ({
  carbonPrevented = null,
  foodWasteDiverted = 0,
  treesEquivalent = null,
  waterSaved = 0,
}) => {
  // Format numbers for display
  const formatNumber = (value) => {
    const number = Number(value || 0);
    return number.toLocaleString();
  };

  // Carbon and trees are not currently calculated
  // by the backend, so we don't invent values here.
  const carbonValue =
    carbonPrevented !== null &&
    carbonPrevented !== undefined
      ? `${Number(carbonPrevented).toLocaleString()} KG`
      : "N/A";

  const treesValue =
    treesEquivalent !== null &&
    treesEquivalent !== undefined
      ? `${Number(treesEquivalent).toLocaleString()} Trees`
      : "N/A";

  return (
    <div className="environmental-impact rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition-colors duration-300 sm:p-6 lg:p-7">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
            Environmental Impact
          </h2>

          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            Your contribution towards a sustainable future.
          </p>
        </div>

        <div className="shrink-0 rounded-2xl bg-green-100 p-2.5 sm:p-3">
          <Leaf
            className="text-green-600"
            size={24}
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-2 lg:grid-cols-2 lg:gap-5">

        {/* Carbon Prevented */}
        <div className="rounded-2xl bg-green-50 p-4 sm:p-5">
          <Leaf
            className="mb-2 text-green-600 sm:mb-3"
            size={24}
          />

          <p className="text-xs text-gray-500 sm:text-sm">
            Carbon Prevented
          </p>

          <h3 className="mt-1 text-lg font-bold text-gray-800 sm:mt-2 sm:text-2xl">
            {carbonValue}
          </h3>
        </div>

        {/* Food Waste */}
        <div className="rounded-2xl bg-orange-50 p-4 sm:p-5">
          <Recycle
            className="mb-2 text-orange-600 sm:mb-3"
            size={24}
          />

          <p className="text-xs text-gray-500 sm:text-sm">
            Food Waste Diverted
          </p>

          <h3 className="mt-1 text-lg font-bold text-gray-800 sm:mt-2 sm:text-2xl">
            {formatNumber(foodWasteDiverted)} KG
          </h3>
        </div>

        {/* Trees */}
        <div className="rounded-2xl bg-emerald-50 p-4 sm:p-5">
          <Trees
            className="mb-2 text-emerald-600 sm:mb-3"
            size={24}
          />

          <p className="text-xs text-gray-500 sm:text-sm">
            Trees Equivalent
          </p>

          <h3 className="mt-1 text-lg font-bold text-gray-800 sm:mt-2 sm:text-2xl">
            {treesValue}
          </h3>
        </div>

        {/* Water Saved */}
        <div className="rounded-2xl bg-cyan-50 p-4 sm:p-5">
          <Droplets
            className="mb-2 text-cyan-600 sm:mb-3"
            size={24}
          />

          <p className="text-xs text-gray-500 sm:text-sm">
            Water Saved
          </p>

          <h3 className="mt-1 text-lg font-bold text-gray-800 sm:mt-2 sm:text-2xl">
            {formatNumber(waterSaved)} L
          </h3>
        </div>

      </div>
    </div>
  );
};

export default EnvironmentalImpact;
