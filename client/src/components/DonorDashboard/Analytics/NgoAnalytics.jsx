import { useMemo, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import {
    Building2,
    Weight,
    TrendingUp,
    CalendarDays,
    Award,
} from "lucide-react";

// ==========================================
// FORMAT KG
// ==========================================

const formatKg = (value) =>
    `${Number(value || 0).toLocaleString(undefined, {
        maximumFractionDigits: 2,
    })} KG`;

// ==========================================
// SAME DEMO DATA USED IN MONTHLY DONATION
// ANALYTICS
// ==========================================

// 2025: January - December
const DEMO_2025_MONTHLY_DATA = [
    32, 48, 59, 71, 86, 64,
    80, 101, 115, 96, 120, 140,
];

// 2026: January - September
const DEMO_2026_MONTHLY_DATA = [
    45, 68, 54, 82, 95, 76,
    110, 92, 128,
];

// ==========================================
// NGO ANALYTICS COMPONENT
// ==========================================

const NgoAnalytics = ({ analytics, loading, error }) => {
    const ngoList = analytics?.ngoAnalytics || [];

    const [selectedNgoId, setSelectedNgoId] = useState("");

    // ==========================================
    // SELECTED NGO
    // ==========================================

    const selectedNgo = useMemo(() => {
        if (!ngoList.length) return null;

        return (
            ngoList.find((ngo) => ngo.ngoId === selectedNgoId) ||
            ngoList[0]
        );
    }, [ngoList, selectedNgoId]);

    // ==========================================
    // NGO COMPARISON
    // Actual completed donation data only
    // ==========================================

    const ngoComparison = useMemo(
        () =>
            ngoList.map((ngo) => ({
                name: ngo.ngoName,
                quantity: Number(ngo.totalReceivedKg) || 0,
            })),
        [ngoList]
    );

    // ==========================================
    // MONTHLY DATA
    // Actual data gets priority.
    // Demo data is distributed among NGOs according
    // to their actual total receiving share.
    // ==========================================

    const monthlyData = useMemo(() => {
        if (!selectedNgo) return [];

        const actualYears = (selectedNgo.monthly || []).map(
            (item) => Number(item.year)
        );

        const yearsToShow = [
            ...new Set([
                2025,
                2026,
                new Date().getFullYear(),
                ...actualYears,
            ]),
        ].sort((a, b) => a - b);

        // Total actual food received by all NGOs
        const totalNgoReceived = ngoList.reduce(
            (sum, ngo) =>
                sum + (Number(ngo.totalReceivedKg) || 0),
            0
        );

        // Selected NGO's share of total actual received food
        const ngoShare =
            totalNgoReceived > 0
                ? (Number(selectedNgo.totalReceivedKg) || 0) /
                  totalNgoReceived
                : 0;

        return yearsToShow.flatMap((year) =>
            Array.from({ length: 12 }, (_, index) => {
                const monthNumber = index + 1;

                // Find selected NGO's actual monthly record
                const actualData = selectedNgo.monthly?.find(
                    (item) =>
                        Number(item.year) === year &&
                        Number(item.month) === monthNumber
                );

                // Check whether ANY NGO has actual data
                // for this particular month
                const actualMonthExists = ngoList.some((ngo) =>
                    (ngo.monthly || []).some(
                        (item) =>
                            Number(item.year) === year &&
                            Number(item.month) === monthNumber
                    )
                );

                const monthName = new Date(
                    year,
                    index,
                    1
                ).toLocaleString("en-US", {
                    month: "short",
                });

                // Select the same demo quantity used in
                // Monthly Donation Analytics
                let demoTotal = null;

                if (year === 2025) {
                    demoTotal =
                        DEMO_2025_MONTHLY_DATA[index] ?? null;
                } else if (year === 2026) {
                    demoTotal =
                        DEMO_2026_MONTHLY_DATA[index] ?? null;
                }

                let quantity = 0;
                let donations = 0;
                let isDemo = false;
                let isUnavailable = false;

                // 1. Actual data takes priority
                if (actualMonthExists) {
                    quantity = actualData
                        ? Number(actualData.quantity) || 0
                        : 0;

                    donations = actualData
                        ? Number(actualData.donations) || 0
                        : 0;

                    // An NGO without a record for a month
                    // with actual records receives zero here.
                    isUnavailable = !actualData;
                }

                // 2. If no NGO has actual data for this month,
                // distribute the global demo quantity.
                else if (demoTotal !== null) {
                    quantity = demoTotal * ngoShare;
                    donations = 0;
                    isDemo = true;
                }

                // 3. No actual or demo data available
                else {
                    quantity = 0;
                    donations = 0;
                    isUnavailable = true;
                }

                return {
                    year,
                    month: monthNumber,
                    monthName,
                    label: `${monthName} ${year}`,
                    quantity: Number(quantity.toFixed(2)),
                    donations,
                    isDemo,
                    isUnavailable,
                };
            })
        );
    }, [selectedNgo, ngoList]);

    // ==========================================
    // YEARLY DATA
    // Calculated from monthly data
    // ==========================================

    const yearlyData = useMemo(() => {
        const yearMap = {};

        monthlyData.forEach((item) => {
            if (!yearMap[item.year]) {
                yearMap[item.year] = {
                    year: item.year,
                    quantity: 0,
                    donations: 0,
                    hasDemo: false,
                    hasActual: false,
                    hasUnavailable: false,
                };
            }

            yearMap[item.year].quantity += item.quantity;
            yearMap[item.year].donations += item.donations;

            if (item.isDemo) {
                yearMap[item.year].hasDemo = true;
            }

            if (!item.isDemo && !item.isUnavailable) {
                yearMap[item.year].hasActual = true;
            }

            if (item.isUnavailable) {
                yearMap[item.year].hasUnavailable = true;
            }
        });

        return Object.values(yearMap)
            .map((item) => ({
                ...item,
                quantity: Number(item.quantity.toFixed(2)),
            }))
            .sort((a, b) => a.year - b.year);
    }, [monthlyData]);

    // ==========================================
    // LOADING STATE
    // ==========================================

    if (loading) {
        return (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Loading NGO analytics...
                </p>
            </section>
        );
    }

    // ==========================================
    // ERROR STATE
    // ==========================================

    if (error) {
        return (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-500/30 dark:bg-red-950/30">
                <p className="font-semibold text-red-700 dark:text-red-300">
                    Unable to load NGO analytics
                </p>

                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            </section>
        );
    }

    // ==========================================
    // EMPTY STATE
    // ==========================================

    if (!analytics || ngoList.length === 0) {
        return (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center gap-2">
                    <Building2 className="text-emerald-600" size={21} />

                    <h2 className="font-bold text-slate-800 dark:text-slate-100">
                        NGO-wise Donation Analytics
                    </h2>
                </div>

                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    No completed donations received by NGOs yet.
                    NGO analytics will appear here after a donation
                    is successfully verified and completed.
                </p>
            </section>
        );
    }

    // ==========================================
    // SUMMARY CARDS
    // ==========================================

    const summaryCards = [
        {
            title: "Total Food Received",
            value: formatKg(analytics.totalReceivedKg),
            icon: Weight,
        },
        {
            title: "NGO Partners",
            value: analytics.totalNgos || 0,
            icon: Building2,
        },
        {
            title: "Completed Donations",
            value: analytics.totalCompletedDonations || 0,
            icon: TrendingUp,
        },
        {
            title: "Top Receiving NGO",
            value: analytics.topNgo?.ngoName || "N/A",
            icon: Award,
        },
    ];

    // ==========================================
    // MAIN UI
    // ==========================================

    return (
        <section className="space-y-5">

            {/* HEADER */}

            <div>
                <div className="flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-emerald-500" />

                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        NGO-wise Donation Analytics
                    </h2>
                </div>

                <p className="mt-1 text-xs text-slate-900 dark:text-slate-400">
                    Track how much food each NGO has received from your donations.
                    Only completed donations are included in actual statistics.
                </p>
            </div>

            {/* SUMMARY CARDS */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    {card.title}
                                </p>

                                <Icon
                                    size={19}
                                    className="shrink-0 text-emerald-600 dark:text-emerald-400"
                                />
                            </div>

                            <p className="mt-3 break-words text-xl font-bold text-slate-900 dark:text-slate-100">
                                {card.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* TOP MONTH AND YEAR */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <CalendarDays size={19} />

                        <p className="text-sm font-semibold">
                            Highest Donation Month
                        </p>
                    </div>

                    <p className="mt-3 text-xl font-bold text-slate-800 dark:text-slate-100">
                        {analytics.topMonth
                            ? `${analytics.topMonth.monthName} ${analytics.topMonth.year}`
                            : "N/A"}
                    </p>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {analytics.topMonth
                            ? formatKg(analytics.topMonth.quantity)
                            : "No data available"}
                    </p>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                        <TrendingUp size={19} />

                        <p className="text-sm font-semibold">
                            Highest Donation Year
                        </p>
                    </div>

                    <p className="mt-3 text-xl font-bold text-slate-800 dark:text-slate-100">
                        {analytics.topYear?.year || "N/A"}
                    </p>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {analytics.topYear
                            ? formatKg(analytics.topYear.quantity)
                            : "No data available"}
                    </p>
                </div>

            </div>

            {/* NGO COMPARISON */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">

                <h3 className="font-bold text-slate-1000 dark:text-slate-100">
                    NGO Food Receiving Comparison
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Total completed food donations received by each NGO.
                </p>

                <div className="mt-5 h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={ngoComparison}
                            layout="vertical"
                            margin={{
                                top: 5,
                                right: 25,
                                left: 15,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={false}
                                stroke="#94a3b8"
                                opacity={0.25}
                            />

                            <XAxis
                                type="number"
                                tick={{
                                    fontSize: 11,
                                    fill: "#94a3b8",
                                }}
                                tickLine={false}
                                axisLine={false}
                            />

                            <YAxis
                                type="category"
                                dataKey="name"
                                width={120}
                                tick={{
                                    fontSize: 11,
                                    fill: "#94a3b8",
                                }}
                                tickLine={false}
                                axisLine={false}
                            />

                            <Tooltip
                                formatter={(value) => [
                                    formatKg(value),
                                    "Received",
                                ]}
                                contentStyle={{
                                    borderRadius: "12px",
                                    border: "1px solid #e2e8f0",
                                }}
                            />

                            <Bar
                                dataKey="quantity"
                                name="Food Received"
                                fill="#10b981"
                                radius={[0, 6, 6, 0]}
                                barSize={24}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* INDIVIDUAL NGO PERFORMANCE */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h3 className="font-bold text-slate-1000 dark:text-slate-100">
                            Individual NGO Performance
                        </h3>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Select an NGO to view its monthly and yearly received quantity.
                        </p>
                    </div>

                    <select
                        value={selectedNgo?.ngoId || ""}
                        onChange={(e) => setSelectedNgoId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 sm:w-64"
                    >
                        {ngoList.map((ngo) => (
                            <option
                                key={ngo.ngoId}
                                value={ngo.ngoId}
                            >
                                {ngo.ngoName}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedNgo && (
                    <>
                        {/* SELECTED NGO INFO */}

                        <div className="mt-4 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
                            <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                Selected NGO
                            </p>

                            <p className="mt-1 font-bold text-slate-800 dark:text-slate-100">
                                {selectedNgo.ngoName}
                            </p>

                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                Total Received:{" "}
                                {formatKg(selectedNgo.totalReceivedKg)}
                                {" · "}
                                {selectedNgo.completedDonations} completed donations
                            </p>
                        </div>

                        {/* MONTHLY AND YEARLY CHARTS */}
                        {/* Desktop: side by side | Mobile: stacked */}

                        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

                            {/* MONTHLY CHART */}

                            <div className="min-w-0">
                                <h4 className="mb-3 text-sm font-semibold text-slate-400 dark:text-slate-200">
                                    Monthly Food Received
                                </h4>

                                {monthlyData.length === 0 ? (
                                    <p className="text-sm text-slate-500">
                                        No monthly records available.
                                    </p>
                                ) : (
                                    <div className="h-[260px] w-full">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={monthlyData}
                                                margin={{
                                                    top: 10,
                                                    right: 15,
                                                    left: 0,
                                                    bottom: 5,
                                                }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                    stroke="#94a3b8"
                                                    opacity={0.25}
                                                />

                                                <XAxis
                                                    dataKey="label"
                                                    interval={0}
                                                    angle={-35}
                                                    textAnchor="end"
                                                    height={65}
                                                    tick={{
                                                        fontSize: 10,
                                                        fill: "#94a3b8",
                                                    }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />

                                                <YAxis
                                                    tick={{
                                                        fontSize: 11,
                                                        fill: "#94a3b8",
                                                    }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />

                                                <Tooltip
                                                    labelFormatter={(_, payload) => {
                                                        const item =
                                                            payload?.[0]?.payload;

                                                        return item
                                                            ? `${item.monthName} ${item.year}`
                                                            : "";
                                                    }}
                                                    formatter={(value, name, props) => {
                                                        const item = props.payload;

                                                        let label = "Actual Food Received";

                                                        if (item.isDemo) {
                                                            label = "Illustrative Demo Data";
                                                        } else if (item.isUnavailable) {
                                                            label = "No NGO Record";
                                                        }

                                                        return [
                                                            formatKg(value),
                                                            label,
                                                        ];
                                                    }}
                                                />

                                                <Bar
                                                    dataKey="quantity"
                                                    name="Food Received"
                                                    fill="#0d9488"
                                                    radius={[6, 6, 0, 0]}
                                                    barSize={30}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>

                            {/* YEARLY CHART */}

                            <div className="min-w-0">
                                <h4 className="mb-3 text-sm font-semibold text-slate-400 dark:text-slate-200">
                                    Yearly Food Received
                                </h4>

                                {yearlyData.length === 0 ? (
                                    <p className="text-sm text-slate-500">
                                        No yearly records available.
                                    </p>
                                ) : (
                                    <div className="h-[240px] w-full">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={yearlyData}
                                                margin={{
                                                    top: 10,
                                                    right: 15,
                                                    left: 0,
                                                    bottom: 5,
                                                }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                    stroke="#94a3b8"
                                                    opacity={0.25}
                                                />

                                                <XAxis
                                                    dataKey="year"
                                                    tick={{
                                                        fontSize: 11,
                                                        fill: "#94a3b8",
                                                    }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />

                                                <YAxis
                                                    tick={{
                                                        fontSize: 11,
                                                        fill: "#94a3b8",
                                                    }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />

                                                <Tooltip
                                                    formatter={(value, name, props) => {
                                                        const item = props.payload;

                                                        let label = "Actual Food Received";

                                                        if (item.hasDemo && item.hasActual) {
                                                            label = "Actual + Illustrative Demo Data";
                                                        } else if (item.hasDemo) {
                                                            label = "Illustrative Demo Data";
                                                        }

                                                        return [
                                                            formatKg(value),
                                                            label,
                                                        ];
                                                    }}
                                                />

                                                <Bar
                                                    dataKey="quantity"
                                                    name="Food Received"
                                                    fill="#6366f1"
                                                    radius={[6, 6, 0, 0]}
                                                    barSize={35}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* DEMO DATA NOTICE */}

                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                            <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                                <strong>Note:</strong> Months without actual
                                NGO records may display illustrative demo
                                values. These values are distributed among
                                NGOs according to their actual total receiving
                                share. Actual completed donation records take
                                priority. Demo values are not stored in the
                                database and should not be treated as actual
                                donation history.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

export default NgoAnalytics;