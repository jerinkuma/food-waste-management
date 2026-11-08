
import {
  Leaf,
  Trees,
  Droplets,
  Recycle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const EnvironmentalImpact = ({
  carbonPrevented = 0,
  foodWasteDiverted = 0,
  treesEquivalent = 0,
  waterFootprintLitres = 0,
  waterFootprintCoverageKg = 0,
  waterUnclassifiedKg = 0,
}) => {
  const formatNumber = (value, decimals = 2) => {
    const number = Number(value);

    return Number.isFinite(number)
      ? number.toLocaleString(undefined, {
          maximumFractionDigits: decimals,
        })
      : "0";
  };

  const totalFoodKg = Math.max(Number(foodWasteDiverted) || 0, 0);
  const classifiedKg = Math.max(Number(waterFootprintCoverageKg) || 0, 0);
  const unclassifiedKg = Math.max(Number(waterUnclassifiedKg) || 0, 0);

  const coveragePercentage =
    totalFoodKg > 0
      ? Math.min((classifiedKg / totalFoodKg) * 100, 100)
      : 0;

  const unclassifiedPercentage =
    totalFoodKg > 0
      ? Math.min((unclassifiedKg / totalFoodKg) * 100, 100)
      : 0;

  const isFullyClassified =
    totalFoodKg > 0 && unclassifiedKg === 0;

  const impactCards = [
    {
      title: "CO₂e Emissions Avoided",
      value: `${formatNumber(carbonPrevented)} kg`,
      description: "Estimated CO₂ equivalent",
      icon: Leaf,
      color: "green",
    },
    {
      title: "Food Waste Diverted",
      value: `${formatNumber(foodWasteDiverted)} kg`,
      description: "Completed donations",
      icon: Recycle,
      color: "orange",
    },
    {
      title: "Urban Tree Equivalent",
      value: formatNumber(treesEquivalent),
      description: "Annual tree equivalent",
      icon: Trees,
      color: "emerald",
    },
    {
      title: "Estimated Water Footprint",
      value: `${formatNumber(waterFootprintLitres)} L`,
      description: "Based on classified food types",
      icon: Droplets,
      color: "cyan",
    },
  ];

  const colorStyles = {
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    cyan: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400",
  };

  return (
    <div className="environmental-impact rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition-colors duration-300 sm:p-6 lg:p-7 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 sm:text-2xl dark:text-gray-100">
            Environmental Impact
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Estimated environmental benefits of your completed food donations.
          </p>
        </div>

        <div className="shrink-0 rounded-2xl bg-green-100 p-2.5 dark:bg-green-900/30">
          <Leaf size={24} className="text-green-600 dark:text-green-400" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:gap-5">
        {impactCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className={`rounded-2xl p-4 sm:p-5 ${colorStyles[card.color]}`}
            >
              <Icon size={24} className="mb-2 sm:mb-3" />

              <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                {card.title}
              </p>

              <h3 className="mt-1 break-words text-lg font-bold text-gray-800 sm:mt-2 sm:text-2xl dark:text-gray-100">
                {card.value}
              </h3>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Water Footprint Coverage */}
      <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Droplets size={19} className="text-green-600 dark:text-green-400" />

            <h3 className="text-sm font-bold text-gray-800 sm:text-base dark:text-gray-100">
              Water Footprint Coverage
            </h3>
          </div>

          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:border dark:border-green-700/50 dark:bg-green-900/30 dark:text-green-400">
            {formatNumber(coveragePercentage, 1)}% Covered
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {isFullyClassified ? (
            <CheckCircle2
              size={17}
              className="shrink-0 text-green-600 dark:text-green-400"
            />
          ) : (
            <AlertCircle
              size={17}
              className="shrink-0 text-orange-500 dark:text-orange-400"
            />
          )}

          <p className="text-xs font-semibold text-gray-700 sm:text-sm dark:text-gray-300">
            {totalFoodKg === 0
              ? "No completed donations yet"
              : isFullyClassified
                ? "All food quantities classified"
                : "Partial food classification"}
          </p>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Classified food</span>

            <span className="font-semibold text-green-700 dark:text-green-400">
              {formatNumber(classifiedKg)} / {formatNumber(totalFoodKg)} kg
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-700 dark:bg-green-400"
              style={{ width: `${coveragePercentage}%` }}
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-700">
            <div className="flex items-center gap-1.5">
              <CheckCircle2
                size={15}
                className="text-green-600 dark:text-green-400"
              />

              <p className="text-xs text-gray-500 dark:text-gray-300">
                Classified
              </p>
            </div>

            <h4 className="mt-2 text-lg font-bold text-green-700 dark:text-green-400">
              {formatNumber(classifiedKg)} kg
            </h4>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formatNumber(coveragePercentage, 1)}% of total
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-700">
            <div className="flex items-center gap-1.5">
              <AlertCircle
                size={15}
                className="text-orange-500 dark:text-orange-400"
              />

              <p className="text-xs text-gray-500 dark:text-gray-300">
                Unclassified
              </p>
            </div>

            <h4 className="mt-2 text-lg font-bold text-orange-600 dark:text-orange-400">
              {formatNumber(unclassifiedKg)} kg
            </h4>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formatNumber(unclassifiedPercentage, 1)}% of total
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        Environmental figures are estimates based on published research factors.
        Water footprint represents estimated water used in food production,
        not actual water saved.
      </p>
    </div>
  );
};

export default EnvironmentalImpact;
