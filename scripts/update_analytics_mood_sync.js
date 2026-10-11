const fs = require('fs');
const path = require('path');

const frontendRoot = 'C:\\Users\\ujjwa\\Downloads\\frontend\\src';

// ====================================================
// 1. Updated Analytics.tsx with direct Mood Logging & Auto-Sync
// ====================================================
const analyticsContent = `import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  ArrowUpRight, Download, Zap, ShieldCheck, Clock, RefreshCw, Smile, Plus, X, Check, CheckCircle2
} from "lucide-react";
import Sidebar from "../components/Sidebar";

const fallbackWeeklyData = [
  { day: "Mon", sleep: 7.2, screenTime: 4.1, recovery: 85 },
  { day: "Tue", sleep: 6.8, screenTime: 4.5, recovery: 78 },
  { day: "Wed", sleep: 8.1, screenTime: 3.2, recovery: 92 },
  { day: "Thu", sleep: 7.4, screenTime: 3.8, recovery: 88 },
  { day: "Fri", sleep: 6.5, screenTime: 5.2, recovery: 74 },
  { day: "Sat", sleep: 8.5, screenTime: 2.8, recovery: 95 },
  { day: "Sun", sleep: 7.9, screenTime: 3.1, recovery: 91 },
];

const fallbackLogs = [
  { date: "Oct 24, 2026", sleep: "8.5 hrs", hr: "64 bpm", screen: "2.8 hrs", mood: "5 / 5", status: "Optimal", statusColor: "emerald" },
  { date: "Oct 23, 2026", sleep: "6.5 hrs", hr: "74 bpm", screen: "5.2 hrs", mood: "3 / 5", status: "Moderate", statusColor: "amber" },
  { date: "Oct 22, 2026", sleep: "7.4 hrs", hr: "68 bpm", screen: "3.8 hrs", mood: "4 / 5", status: "Optimal", statusColor: "emerald" },
  { date: "Oct 21, 2026", sleep: "8.1 hrs", hr: "66 bpm", screen: "3.2 hrs", mood: "5 / 5", status: "Optimal", statusColor: "emerald" },
  { date: "Oct 20, 2026", sleep: "6.8 hrs", hr: "72 bpm", screen: "4.5 hrs", mood: "4 / 5", status: "Normal", statusColor: "blue" },
];

const moodScaleOptions = [
  { value: 1, label: "Very Low", emoji: "😔", desc: "Exhausted / Low Energy" },
  { value: 2, label: "Low", emoji: "🙁", desc: "Mildly stressed or overwhelmed" },
  { value: 3, label: "Neutral", emoji: "😐", desc: "Balanced / Normal baseline" },
  { value: 4, label: "Good", emoji: "🙂", desc: "Calm, contented & positive" },
  { value: 5, label: "Excellent", emoji: "😄", desc: "Highly energized & focused" },
];

const quickTags = ["Well Rested", "Deep Focus", "Work Stress", "Post-Workout", "Social Time", "Fatigued"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3.5 py-2.5 border border-slate-200 rounded-lg shadow-sm text-xs">
        <p className="font-semibold text-slate-800 mb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-slate-600">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.name}:</span>
            <span className="font-semibold text-slate-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [activeRange, setActiveRange] = useState("7d");
  const [recoveryScore, setRecoveryScore] = useState(96);
  const [circadianConsistency, setCircadianConsistency] = useState(80);
  const [cognitiveLoadIndex, setCognitiveLoadIndex] = useState(37);
  const [weeklyData, setWeeklyData] = useState(fallbackWeeklyData);
  const [tableLogs, setTableLogs] = useState(fallbackLogs);
  const [refreshing, setRefreshing] = useState(false);
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [activeUserId, setActiveUserId] = useState(1);

  // Mood Modal State
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [successToast, setSuccessToast] = useState<string>("");

  const fetchAnalytics = async () => {
    setRefreshing(true);
    let userId = 1;
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.user_id) userId = Number(u.user_id);
      }
    } catch (e) {}
    setActiveUserId(userId);

    try {
      const res = await fetch(\`http://localhost:5000/api/analytics/\${userId}\`);
      const data = await res.json();
      if (res.ok && data) {
        if (typeof data.recoveryScore === "number") setRecoveryScore(data.recoveryScore);
        if (typeof data.circadianConsistency === "number") setCircadianConsistency(data.circadianConsistency);
        if (typeof data.cognitiveLoadIndex === "number") setCognitiveLoadIndex(data.cognitiveLoadIndex);

        if (Array.isArray(data.weeklyAnalyticsData) && data.weeklyAnalyticsData.length > 0) {
          setWeeklyData(data.weeklyAnalyticsData);
        }
        if (Array.isArray(data.logEntries) && data.logEntries.length > 0) {
          setTableLogs(data.logEntries);
        }
        setIsLiveBackend(true);
      }
    } catch (err) {
      console.log("Using baseline analytics:", err);
      setIsLiveBackend(false);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    window.addEventListener("storage", fetchAnalytics);
    return () => window.removeEventListener("storage", fetchAnalytics);
  }, []);

  const handleSaveMood = async () => {
    if (!selectedRating) return;

    const newEntry = {
      mood_rating: selectedRating,
      tag: selectedTag || undefined,
      timestamp: new Date().toISOString(),
    };

    // Optimistically update table with current date
    const currentDateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const optimisticRow = {
      date: currentDateStr,
      sleep: "8.0 hrs",
      hr: "68 bpm",
      screen: "3.5 hrs",
      mood: selectedTag ? \`\${selectedRating} / 5 (\${selectedTag})\` : \`\${selectedRating} / 5\`,
      status: selectedRating >= 4 ? "Optimal" : selectedRating === 3 ? "Normal" : "Moderate",
      statusColor: selectedRating >= 4 ? "emerald" : selectedRating === 3 ? "blue" : "amber"
    };

    setTableLogs(prev => [optimisticRow, ...prev.filter(r => r.date !== currentDateStr)]);

    // Save to localStorage
    const stored = JSON.parse(localStorage.getItem("user_logged_moods") || "[]");
    stored.push(newEntry);
    localStorage.setItem("user_logged_moods", JSON.stringify(stored));
    window.dispatchEvent(new Event("storage"));

    // POST to backend
    try {
      await fetch("http://localhost:5000/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: activeUserId,
          mood_rating: selectedRating,
          tag: selectedTag,
        })
      });
      // Re-fetch verified backend log entries
      await fetchAnalytics();
    } catch (e) {
      console.log("Offline mode, saved locally:", e);
    }

    setSuccessToast(\`Logged mood \${selectedRating}/5 with current date (\${currentDateStr})!\`);
    setIsMoodModalOpen(false);
    setSelectedRating(null);
    setSelectedTag("");

    setTimeout(() => {
      setSuccessToast("");
    }, 4500);
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Sleep Duration", "Resting HR", "Screen Time", "Mood Rating", "Status"];
    const rows = tableLogs.map(row => [
      \`"\${row.date}"\`,
      \`"\${row.sleep}"\`,
      \`"\${row.hr}"\`,
      \`"\${row.screen}"\`,
      \`"\${row.mood}"\`,
      \`"\${row.status}"\`
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "telemetry_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 bg-white p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Biometric & Cognitive Analytics
              </h1>
              {isLiveBackend && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live API
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Longitudinal behavioral correlations and circadian synchronization scores
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600">
              {["7d", "30d", "90d"].map((range) => (
                <button
                  key={range}
                  onClick={() => setActiveRange(range)}
                  className={\`px-3 py-1 rounded-md transition \${
                    activeRange === range
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-500 hover:text-slate-900"
                  }\`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsMoodModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm"
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Log Mood</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm"
              title="Download CSV report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={fetchAnalytics}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm disabled:opacity-60"
            >
              <RefreshCw className={\`w-3.5 h-3.5 text-slate-500 \${refreshing ? "animate-spin" : ""}\`} />
              <span>{refreshing ? "Syncing..." : "Sync Telemetry"}</span>
            </button>
          </div>
        </div>

        {/* Success Alert Toast */}
        {successToast && (
          <div className="mb-6 flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-medium shadow-sm transition">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successToast} Telemetry History Log refreshed.</span>
            </div>
            <button
              onClick={() => setSuccessToast("")}
              className="text-emerald-600 hover:text-emerald-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Top 3 Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Recovery Score</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{recoveryScore}%</span>
                <span className="text-xs text-emerald-600 font-medium inline-flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +4.1%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">High physical restoration capacity</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Circadian Consistency</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{circadianConsistency}%</span>
                <span className="text-xs text-emerald-600 font-medium inline-flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +1.8%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Consistent sleep & wake schedules</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Cognitive Load Index</span>
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{cognitiveLoadIndex}</span>
                <span className="text-xs text-slate-500">/ 100</span>
                <span className={\`text-xs font-medium inline-flex items-center ml-auto \${
                  cognitiveLoadIndex < 40 ? "text-emerald-600" : cognitiveLoadIndex < 70 ? "text-amber-600" : "text-rose-600"
                }\`}>
                  {cognitiveLoadIndex < 40 ? "Low Stress" : cognitiveLoadIndex < 70 ? "Moderate" : "Elevated Strain"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Calculated from HRV and active screen pacing</p>
            </div>
          </div>

          {/* Grouped Bar Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Daily Balance Comparison</h2>
                <p className="text-xs text-slate-500">Sleep hours vs. Screen time across the current period</p>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 12, fontSize: 12 }} />
                  <Bar dataKey="sleep" name="Sleep (Hours)" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="screenTime" name="Screen Time (Hours)" fill="#94a3b8" radius={[3, 3, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Log Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Telemetry History Log</h2>
                <p className="text-xs text-slate-500">Validated biometric observations ({tableLogs.length} entries &bull; latest sorted by date)</p>
              </div>

              <button
                onClick={() => setIsMoodModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New Mood</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Sleep Duration</th>
                    <th className="px-5 py-3">Resting HR</th>
                    <th className="px-5 py-3">Screen Time</th>
                    <th className="px-5 py-3">Mood Rating</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tableLogs.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-900">{row.date}</td>
                      <td className="px-5 py-3.5">{row.sleep}</td>
                      <td className="px-5 py-3.5">{row.hr}</td>
                      <td className="px-5 py-3.5">{row.screen}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">{row.mood}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={\`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium \${
                            row.statusColor === "emerald"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : row.statusColor === "amber"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }\`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Mood Rating Modal */}
      {isMoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Smile className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Log Current Mood</h3>
                  <p className="text-xs text-slate-500">Entry will immediately appear in the Telemetry History Log with today's date</p>
                </div>
              </div>

              <button
                onClick={() => setIsMoodModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive 1–5 Options */}
            <div className="space-y-2 mb-5">
              <label className="block text-xs font-semibold text-slate-700">Select Rating (1–5)</label>
              <div className="grid grid-cols-5 gap-2">
                {moodScaleOptions.map((option) => {
                  const isSelected = selectedRating === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedRating(option.value)}
                      className={\`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition \${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20"
                          : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                      }\`}
                    >
                      <span className="text-2xl mb-1">{option.emoji}</span>
                      <span className="text-sm font-bold text-slate-900">{option.value}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">{option.label}</span>
                    </button>
                  );
                })}
              </div>

              {selectedRating && (
                <p className="text-xs text-slate-600 mt-2 text-center bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100 font-medium">
                  {moodScaleOptions.find((o) => o.value === selectedRating)?.desc}
                </p>
              )}
            </div>

            {/* Optional Emotion / Context Tags */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Context Factor (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                    className={\`px-2.5 py-1 rounded-lg text-xs font-medium transition \${
                      selectedTag === tag
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                    }\`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMoodModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedRating}
                onClick={handleSaveMood}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save to History Log</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
`;

fs.writeFileSync(path.join(frontendRoot, 'pages', 'Analytics.tsx'), analyticsContent, 'utf8');
console.log("Updated Analytics.tsx with direct Mood Logging & Auto-Sync.");
