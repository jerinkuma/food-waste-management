
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/DonorDashboard/DashboardLayout";

import AnalyticsCards from "../../components/DonorDashboard/Analytics/AnalyticsCards";
import MonthlyChart from "../../components/DonorDashboard/Analytics/MonthlyChart";
import StatusChart from "../../components/DonorDashboard/Analytics/StatusChart";
import FoodTypeChart from "../../components/DonorDashboard/Analytics/FoodTypeChart";


import NgoAnalytics from "../../components/DonorDashboard/Analytics/NgoAnalytics";

import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

import {
  RefreshCw,
  AlertCircle,
  FileText,
  X,
} from "lucide-react";

const getDonationDate = (donation) => {
  if (!donation?.createdAt) return null;

  const date = new Date(donation.createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
};

const Analytics = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );

  const [dateRange, setDateRange] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");




  const [ngoAnalytics, setNgoAnalytics] = useState(null);
  const [ngoLoading, setNgoLoading] = useState(true);
  const [ngoError, setNgoError] = useState("");

  // =========================================
  // LOAD DONATIONS
  // =========================================

  const loadDonations = useCallback(async () => {
    setLoading(true);
    setError("");
    setNgoLoading(true);
    setNgoError("");

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!user?.id) {
        throw new Error("User session not found. Please login again.");
      }

      // Existing donor donations
      const response = await fetch(
        `http://localhost:5000/api/donations/donor/${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load donations.");
      }

      setDonations(data.donations || []);

      // NGO-wise analytics (protected API)
      try {
        if (!token) {
          throw new Error("Authentication token not found. Please login again.");
        }

        const ngoResponse = await fetch(
          `http://localhost:5000/api/donations/donor/${user.id}/ngo-analytics`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const ngoData = await ngoResponse.json();

        if (!ngoResponse.ok) {
          throw new Error(
            ngoData.message || "Failed to load NGO analytics."
          );
        }

        setNgoAnalytics(ngoData.analytics || null);
      } catch (ngoErr) {
        console.error("NGO Analytics Error:", ngoErr);
        setNgoError(ngoErr.message || "Failed to load NGO analytics.");
        setNgoAnalytics(null);
      }

    } catch (err) {
      console.error("Analytics error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setNgoLoading(false);
    }
  }, []);


  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  // =========================================
  // FILTER DONATIONS
  // =========================================

  const filteredDonations = useMemo(() => {
    const now = new Date();
    let start = null;
    let end = new Date(now);

    end.setHours(23, 59, 59, 999);

    if (dateRange === "7days") {
      start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    } else if (dateRange === "30days") {
      start = new Date(now);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
    } else if (dateRange === "3months") {
      start = new Date(now);
      start.setMonth(start.getMonth() - 3);
      start.setHours(0, 0, 0, 0);
    } else if (dateRange === "year") {
      start = new Date(now.getFullYear(), 0, 1);
    } else if (dateRange === "custom") {
      if (customStart) {
        start = new Date(`${customStart}T00:00:00`);
      }

      if (customEnd) {
        end = new Date(`${customEnd}T23:59:59.999`);
      }
    } else if (dateRange === "all") {
      return donations;
    }

    if (
      dateRange === "custom" &&
      customStart &&
      customEnd &&
      start > end
    ) {
      return [];
    }

    return donations.filter((donation) => {
      const date = getDonationDate(donation);

      if (!date) return false;
      if (start && date < start) return false;
      if (end && date > end) return false;

      return true;
    });
  }, [donations, dateRange, customStart, customEnd]);

  // =========================================
  // AVAILABLE YEARS
  // =========================================

  const availableYears = useMemo(() => {
    return [
      ...new Set(
        donations
          .map((donation) => getDonationDate(donation)?.getFullYear())
          .filter(Boolean)
      ),
    ];
  }, [donations]);

  // Always include 2025 and 2026.
  // Other years will be added automatically from database records.

  const years = useMemo(() => {
    return [
      ...new Set([
        new Date().getFullYear(),
        2026,
        2025,
        ...availableYears,
      ]),
    ].sort((a, b) => b - a);
  }, [availableYears]);

  // =========================================
  // PDF EXPORT - EXACTLY 2 PAGES
  // =========================================

  const exportPDF = async () => {
    const pages = document.querySelectorAll(".analytics-pdf-page");

    if (pages.length !== 2) {
      alert("PDF export requires exactly 2 analytics sections.");
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 8;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      for (let index = 0; index < pages.length; index++) {
        const element = pages[index];

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,

          onclone: (clonedDocument) => {
            const clonedPage = clonedDocument.querySelector(
              `[data-pdf-page="${index + 1}"]`
            );

            if (!clonedPage) return;

            clonedPage.style.width = "100%";
            clonedPage.style.maxWidth = "none";
            clonedPage.style.margin = "0";
            clonedPage.style.padding = "0";
            clonedPage.style.backgroundColor = "#ffffff";

            // Keep PDF in light theme
            clonedPage.querySelectorAll("*").forEach((item) => {
              item.style.colorScheme = "light";
            });

            // Hide interactive controls from PDF
            clonedPage.querySelectorAll(".pdf-hide").forEach((item) => {
              item.style.display = "none";
            });

            // Compact chart heights for PDF
            const chartHeightSelectors = [
              ".monthly-chart-card .h-\\[280px\\]",
              ".monthly-chart-card .sm\\:h-\\[310px\\]",
              ".status-chart-card .h-\\[240px\\]",
              ".status-chart-card .min-h-\\[280px\\]",
              ".food-chart-card .h-\\[280px\\]",
            ];

            chartHeightSelectors.forEach((selector) => {
              clonedPage.querySelectorAll(selector).forEach((item) => {
                item.style.height = "190px";
                item.style.minHeight = "0";
              });
            });

            clonedPage.querySelectorAll("section").forEach((section) => {
              section.style.breakInside = "avoid";
              section.style.pageBreakInside = "avoid";
            });

            // Remove shadows in PDF
            clonedPage.querySelectorAll("*").forEach((item) => {
              item.style.boxShadow = "none";
            });
          },
        });

        const scale = Math.min(
          availableWidth / canvas.width,
          availableHeight / canvas.height
        );

        const imageWidth = canvas.width * scale;
        const imageHeight = canvas.height * scale;

        const x = (pageWidth - imageWidth) / 2;
        const y = (pageHeight - imageHeight) / 2;

        if (index > 0) {
          pdf.addPage("a4", "landscape");
        }

        pdf.addImage(
          canvas.toDataURL("image/jpeg", 0.95),
          "JPEG",
          x,
          y,
          imageWidth,
          imageHeight
        );
      }

      pdf.save(
        `FeedLink-Analytics-${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`
      );
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert(`PDF Export Failed: ${error.message}`);
    }
  };

  // =========================================
  // DATE RANGE OPTIONS
  // =========================================

  const dateOptions = [
    { value: "all", label: "All Time" },
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "3months", label: "Last 3 Months" },
    { value: "year", label: "This Year" },
    { value: "custom", label: "Custom Range" },
  ];

  const clearFilters = () => {
    setDateRange("all");
    setCustomStart("");
    setCustomEnd("");
  };

  // =========================================
  // REUSABLE DARK MODE CLASSES
  // =========================================

  const inputStyle =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20";

  return (
    <DashboardLayout>
      <div className="analytics-print-area min-h-full bg-slate-50/50 transition-colors duration-300 dark:bg-slate-900 print:bg-white">

        <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-8 print:space-y-3 print:pb-0">

          {/* =====================================
              PDF PAGE 1
              HEADER + OVERVIEW
          ===================================== */}

          <div
            className="analytics-pdf-page space-y-6 print:space-y-3"
            data-pdf-page="1"
          >

            {/* HEADER + FILTER CARD */}

            <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800 sm:p-6 print:rounded-lg print:border-slate-300 print:p-3 print:shadow-none">

              <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-emerald-50/80 blur-3xl dark:bg-emerald-500/10 print:hidden" />

              <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                <div className="min-w-0">
                  <h1 className="text-xl font-bold tracking-tight text-slate-1000 dark:text-slate-100 sm:text-2xl">
                    Analytics Dashboard
                  </h1>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Track and understand your donation activity.
                  </p>
                </div>

                <div className="pdf-hide flex flex-col gap-3 sm:flex-row sm:items-end print:hidden">

                  <div className="w-full sm:w-48">
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className={inputStyle}
                    >
                      {dateOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={exportPDF}
                    disabled={loading || !!error}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FileText size={17} />
                    Export PDF
                  </button>

                </div>
              </div>

              {/* CUSTOM DATE INPUTS */}

              {dateRange === "custom" && (
                <div className="pdf-hide relative mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-700 sm:flex-row sm:items-end print:hidden">

                  <div className="w-full sm:w-44">
                    <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Start Date
                    </label>

                    <input
                      type="date"
                      value={customStart}
                      max={customEnd || undefined}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className={inputStyle}
                    />
                  </div>

                  <div className="w-full sm:w-44">
                    <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                      End Date
                    </label>

                    <input
                      type="date"
                      value={customEnd}
                      min={customStart || undefined}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className={inputStyle}
                    />
                  </div>

                </div>
              )}

              {/* FILTER SUMMARY */}

              <div className="pdf-hide relative mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-700 print:hidden">

                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {loading
                    ? "Loading donation records..."
                    : `Showing ${filteredDonations.length} of ${donations.length} donations`}
                </p>

                {dateRange !== "all" && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    <X size={13} />
                    Clear Filter
                  </button>
                )}

              </div>
            </section>

            {/* ERROR STATE */}

            {error && (
              <div className="pdf-hide flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-500/30 dark:bg-red-950/30 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-start gap-3">
                  <AlertCircle
                    className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
                    size={21}
                  />

                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-300">
                      Unable to load analytics
                    </p>

                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                </div>

                <button
                  onClick={loadDonations}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  <RefreshCw
                    size={15}
                    className={loading ? "animate-spin" : ""}
                  />
                  Try Again
                </button>

              </div>
            )}

            {!error && (
              <section className="space-y-3 print:space-y-2">

                <div className="flex items-center gap-2">
                  <div className="h-5 w-1 rounded-full bg-emerald-500 print:h-4" />

                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 print:text-base">
                    Overview
                  </h2>
                </div>

                <AnalyticsCards
                  donations={filteredDonations}
                  loading={loading}
                />

              </section>
            )}

          </div>

          {/* =====================================
              PDF PAGE 2
              DONATION ANALYTICS + FOOD INSIGHTS
          ===================================== */}

          {!error && (
            <div
              className="analytics-pdf-page space-y-6 print:space-y-3"
              data-pdf-page="2"
            >

              {/* DONATION ANALYTICS */}

              <section className="space-y-3 print:space-y-2">

                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-1 rounded-full bg-emerald-500 print:h-4" />

                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 print:text-base">
                        Donation Analytics
                      </h2>
                    </div>

                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      Visual breakdown of your donation activity
                    </p>
                  </div>

                  {/* YEAR SELECTOR: 2026 + 2025 + DATABASE YEARS */}

                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    disabled={loading}
                    className={`pdf-hide ${inputStyle} w-full font-medium sm:w-auto print:hidden`}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>

                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 print:grid-cols-2 print:gap-2">

                  {/* IMPORTANT:
                      MonthlyChart receives ALL donations.
                      Date range filter should not hide yearly comparison data.
                  */}

                  <MonthlyChart
                    donations={donations}
                    loading={loading}
                    selectedYear={selectedYear}
                  />

                  <StatusChart
                    donations={filteredDonations}
                    loading={loading}
                  />

                </div>
              </section>

              {/* NGO-WISE DONATION ANALYTICS */}

              <NgoAnalytics
                analytics={ngoAnalytics}
                loading={ngoLoading}
                error={ngoError}
              />

              {/* FOOD CATEGORY INSIGHTS */}

              <section className="space-y-3 print:space-y-2">

                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-emerald-500 print:h-4" />

                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 print:text-base">
                      Food Category Insights
                    </h2>
                  </div>

                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Discover your most frequently donated food categories
                  </p>
                </div>

                <FoodTypeChart
                  donations={filteredDonations}
                  loading={loading}
                />

              </section>

              <div className="border-t border-slate-200 pt-4 text-center dark:border-slate-700 print:hidden">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Analytics are based on your donation history.
                </p>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* PRINT STYLES */}

      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 7mm;
          }

          html,
          body,
          #root {
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
          }

          .donor-dashboard-layout,
          .donor-dashboard-main,
          .donor-dashboard-content {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
          }

          .analytics-print-area {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .analytics-print-area .print\\:hidden {
            display: none !important;
          }

          .analytics-print-area .mx-auto {
            max-width: none !important;
          }

          .analytics-pdf-page {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .analytics-pdf-page + .analytics-pdf-page {
            page-break-before: always !important;
            break-before: page !important;
          }

          .analytics-print-area .shadow,
          .analytics-print-area [class*="shadow-"] {
            box-shadow: none !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

    </DashboardLayout>
  );
};

export default Analytics;
