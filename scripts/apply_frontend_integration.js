const fs = require('fs');
const path = require('path');

const frontendRoot = 'C:\\Users\\ujjwa\\Downloads\\frontend\\src';

console.log("Starting frontend integration update...");

// ==========================================
// 1. Sidebar.tsx
// ==========================================
const sidebarContent = `import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, BarChart3, Brain, User as UserIcon, Activity, LogOut } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Alex Johnson");
  const [initials, setInitials] = useState("AJ");

  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          const name = parsed.user_names || parsed.name || "Alex Johnson";
          setUserName(name);
          const parts = name.trim().split(" ");
          if (parts.length >= 2) {
            setInitials((parts[0][0] + parts[1][0]).toUpperCase());
          } else if (parts.length === 1 && parts[0].length > 0) {
            setInitials(parts[0].slice(0, 2).toUpperCase());
          }
        }
      } catch (e) {
        console.error("Error reading user from localStorage:", e);
      }
    };

    loadUser();
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "AI Insights", path: "/insights", icon: Brain },
    { name: "Profile", path: "/profile", icon: UserIcon },
  ];

  return (
    <aside className="w-64 shrink-0 min-h-screen bg-white border-r border-slate-200 flex flex-col justify-between py-6 px-4 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
              MindTwin
            </h1>
            <span className="text-[11px] font-medium text-slate-400 tracking-wide uppercase">
              Digital Twin OS
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={\`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors \${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }\`}
              >
                <Icon
                  className={\`w-4 h-4 transition-colors \${
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  }\`}
                />
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Pill & Logout */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
              {initials}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-900 truncate">{userName}</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <p className="text-[10px] text-slate-500">Online</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50/50 rounded-lg transition-colors text-left"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
`;

fs.writeFileSync(path.join(frontendRoot, 'components', 'Sidebar.tsx'), sidebarContent, 'utf8');
console.log("Updated Sidebar.tsx successfully.");

// ==========================================
// 2. Profile.tsx
// ==========================================
const profileContent = `import { useState, useEffect } from "react";
import {
  User, Mail, Calendar, Heart, Check,
  Smartphone, Watch, Save, RefreshCw
} from "lucide-react";
import Sidebar from "../components/Sidebar";

const Profile = () => {
  const [name, setName] = useState("Alex Johnson");
  const [email, setEmail] = useState("alex.johnson@mindtwin.ai");
  const [age, setAge] = useState("26");
  const [targetSleep, setTargetSleep] = useState("8.0");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [userId, setUserId] = useState(1);

  useEffect(() => {
    let currentId = 1;
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.user_id) currentId = Number(u.user_id);
        if (u.user_names || u.name) setName(u.user_names || u.name);
        if (u.email) setEmail(u.email);
        if (u.age) setAge(String(u.age));
        if (u.targetSleep) setTargetSleep(String(u.targetSleep));
      }
    } catch (e) {
      console.error(e);
    }
    setUserId(currentId);

    // Fetch from backend
    fetch(\`http://localhost:5000/api/users/profile/\${currentId}\`)
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.user_names || data.email)) {
          if (data.user_names) setName(data.user_names);
          if (data.email) setEmail(data.email);
          if (data.age) setAge(String(data.age));
          if (data.targetSleep) setTargetSleep(String(data.targetSleep));
        }
      })
      .catch((err) => {
        console.log("Using cached profile:", err);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg("");

    const payload = {
      user_names: name,
      email,
      age: Number(age) || 26,
      targetSleep: Number(targetSleep) || 8.0,
    };

    try {
      const res = await fetch(\`http://localhost:5000/api/users/profile/\${userId}\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        const updatedUser = data.user || { ...payload, user_id: userId };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("storage"));
        setSaved(true);
        setStatusMsg("Profile and digital twin calibration saved to database!");
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (err: any) {
      console.log("Backend offline or request failed; saving locally:", err);
      const localUser = { ...payload, user_id: userId };
      localStorage.setItem("user", JSON.stringify(localUser));
      window.dispatchEvent(new Event("storage"));
      setSaved(true);
      setStatusMsg("Profile preferences saved locally (offline mode).");
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(false), 4000);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 bg-white p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Profile & Twin Calibration
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Personal telemetry settings, biological parameters, and sensor sync
            </p>
          </div>

          {saved && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{statusMsg || "Profile preferences saved"}</span>
            </div>
          )}
        </div>

        <div className="space-y-6 max-w-4xl">
          {/* User Profile Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-sm shadow-blue-500/20">
                {name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "AJ"}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-lg font-bold text-slate-900">{name}</h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Twin Calibrated
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{email}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-600">
                  <span><strong>Biological Age:</strong> {age} yrs</span>
                  <span className="text-slate-300">&bull;</span>
                  <span><strong>Target Sleep:</strong> {targetSleep} hrs/night</span>
                  <span className="text-slate-300">&bull;</span>
                  <span><strong>Twin Status:</strong> Synchronized</span>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-semibold text-slate-900">Personal & Biometric Baseline</h3>
              <p className="text-xs text-slate-500 mt-0.5">Parameters used to calibrate baseline physiological algorithms</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Chronological Age
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Daily Sleep Goal (Hours)
                </label>
                <div className="relative">
                  <Heart className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="number"
                    step="0.5"
                    value={targetSleep}
                    onChange={(e) => setTargetSleep(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition"
                  />
                </div>
              </div>
            </div>

            {/* Connected Devices */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-900 mb-3">Paired Telemetry Devices</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/60">
                  <div className="flex items-center gap-2.5">
                    <Watch className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Apple Watch Ultra</p>
                      <p className="text-[10px] text-slate-500">Continuous HR, HRV, Sleep stages</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Connected
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/60">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Screen Time Bridge</p>
                      <p className="text-[10px] text-slate-500">iOS Screen Time API sync</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-60"
              >
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;
`;

fs.writeFileSync(path.join(frontendRoot, 'pages', 'Profile.tsx'), profileContent, 'utf8');
console.log("Updated Profile.tsx successfully.");

// ==========================================
// 3. Insights.tsx
// ==========================================
const insightsContent = `import { useState, useEffect } from "react";
import {
  Brain, Moon, Heart, Smartphone, Sparkles,
  ArrowRight, Lightbulb, Compass, RefreshCw, Activity
} from "lucide-react";
import Sidebar from "../components/Sidebar";

interface InsightItem {
  id: number | string;
  category: string;
  icon?: any;
  iconColor?: string;
  title: string;
  description: string;
  badge: string;
  badgeType: "emerald" | "amber" | "blue" | string;
  recommendation: string;
  impact: string;
}

const baselineInsights: InsightItem[] = [
  {
    id: 1,
    category: "Sleep Architecture",
    icon: Moon,
    iconColor: "text-blue-600 bg-blue-50",
    title: "Deep Sleep & Quality Synchronization",
    description: "Your deep sleep restoration correlates strongly with screen wind-down 45 minutes prior to bedtime.",
    badge: "Optimal Recovery",
    badgeType: "emerald",
    recommendation: "Maintain your 10:30 PM wind-down routine to support consistent REM restoration.",
    impact: "+22% Deep Sleep",
  },
  {
    id: 2,
    category: "Cardiovascular Telemetry",
    icon: Heart,
    iconColor: "text-rose-600 bg-rose-50",
    title: "Autonomic Nervous Recovery (Resting HR)",
    description: "Resting heart rate remains tightly bounded within optimal baseline, indicating stable autonomic recovery.",
    badge: "Optimal Recovery",
    badgeType: "emerald",
    recommendation: "Your current cardiovascular recovery indicates ready adaptation for moderate aerobic activity.",
    impact: "Stable HRV (58ms)",
  },
  {
    id: 3,
    category: "Daily Activity & Movement",
    icon: Smartphone,
    iconColor: "text-indigo-600 bg-indigo-50",
    title: "Movement & Sedentary Pacing",
    description: "Daily active minutes and step count provide consistent counterbalances against evening screen latency.",
    badge: "High Engagement",
    badgeType: "blue",
    recommendation: "Activate display grayscale or blue-light filter after 9:00 PM to lessen retinal stimulation.",
    impact: "Active Pacing",
  },
  {
    id: 4,
    category: "Cognitive Balance",
    icon: Sparkles,
    iconColor: "text-violet-600 bg-violet-50",
    title: "7-Day Emotional Set-Point (Momentum)",
    description: "Subjective mood scores show stable baseline resilience following nights with uninterrupted sleep cycles.",
    badge: "Momentum Shift",
    badgeType: "violet",
    recommendation: "Aim for 10–15 minutes of outdoor natural light within 30 minutes of waking.",
    impact: "+35% Day Satisfaction",
  },
];

const iconMap: Record<string, { icon: any; iconColor: string }> = {
  "Sleep Architecture": { icon: Moon, iconColor: "text-blue-600 bg-blue-50" },
  "Cardiovascular Telemetry": { icon: Heart, iconColor: "text-rose-600 bg-rose-50" },
  "Daily Activity & Movement": { icon: Smartphone, iconColor: "text-indigo-600 bg-indigo-50" },
  "Digital Wellness": { icon: Smartphone, iconColor: "text-indigo-600 bg-indigo-50" },
  "Cognitive Balance": { icon: Sparkles, iconColor: "text-violet-600 bg-violet-50" },
};

const categories = ["All", "Sleep Architecture", "Cardiovascular Telemetry", "Daily Activity & Movement", "Cognitive Balance"];

const Insights = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [items, setItems] = useState<InsightItem[]>(baselineInsights);
  const [healthScore, setHealthScore] = useState(80);
  const [riskLevel, setRiskLevel] = useState("Optimal Range");
  const [forecast, setForecast] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLiveBackend, setIsLiveBackend] = useState(false);

  const fetchInsights = async () => {
    setRefreshing(true);
    let userId = 1;
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.user_id) userId = Number(u.user_id);
      }
    } catch (e) {}

    try {
      const res = await fetch(\`http://localhost:5000/api/insights/\${userId}\`);
      const data = await res.json();

      if (data && res.ok) {
        if (typeof data.healthScore === "number") setHealthScore(data.healthScore);
        if (data.riskLevel) setRiskLevel(data.riskLevel);
        if (data.forecast) setForecast(data.forecast);
        if (Array.isArray(data.recommendations)) setRecommendations(data.recommendations);

        if (Array.isArray(data.insights) && data.insights.length > 0) {
          const mapped: InsightItem[] = data.insights.map((it: any) => {
            const conf = iconMap[it.category] || { icon: Sparkles, iconColor: "text-blue-600 bg-blue-50" };
            return {
              ...it,
              icon: conf.icon,
              iconColor: conf.iconColor,
            };
          });
          setItems(mapped);
        }
        setIsLiveBackend(true);
      }
    } catch (err) {
      console.log("Using cached baseline insights:", err);
      setIsLiveBackend(false);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const displayedInsights = selectedCategory === "All"
    ? items
    : items.filter((item) => item.category === selectedCategory || (selectedCategory === "Daily Activity & Movement" && item.category === "Digital Wellness"));

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 bg-white p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                AI Health & Behavioral Insights
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <Brain className="w-3 h-3 text-blue-600" />
                HistGradientBoosting Engine
              </span>
              {isLiveBackend && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live API
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Machine learning models synthesized from your daily physiological signals
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchInsights}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition shadow-sm disabled:opacity-60"
            >
              <RefreshCw className={\`w-3.5 h-3.5 text-slate-500 \${refreshing ? "animate-spin" : ""}\`} />
              <span>{refreshing ? "Syncing..." : "Sync Telemetry"}</span>
            </button>
          </div>
        </div>

        {/* Circadian Health Score & ML Forecast Highlight Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Circadian Health Score Card */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50/80 via-white to-slate-50 border border-blue-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-900 tracking-wide uppercase">
                  Circadian Health Score
                </span>
                <span className={\`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold \${
                  healthScore >= 75
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }\`}>
                  {riskLevel}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{healthScore}</span>
                <span className="text-xs text-slate-500 font-medium">/ 100</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Aggregated physiological equilibrium derived from sleep continuity, resting heart rate recovery, and screen latency.
              </p>
            </div>
            <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden mt-4">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-700"
                style={{ width: \`\${Math.min(100, Math.max(0, healthScore))}%\` }}
              />
            </div>
          </div>

          {/* Key Discovery & Forecast Banner */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Key Discovery: {forecast ? \`Predicted Mood \${forecast.predicted_mood}/5 (\${forecast.mood_label})\` : "Circadian Sleep-Mood Feedback Loop"}
                  </h2>
                  {forecast && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                      Trend: {forecast.trend}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  {recommendations.length > 0
                    ? recommendations[0]
                    : "Your biological twin has detected a 94% statistical correlation between consistent wake times and elevated evening mood stability."}
                </p>
                {recommendations.length > 1 && (
                  <p className="text-[11px] text-slate-500 mt-1.5 italic">
                    &bull; {recommendations[1]}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {forecast?.model_architecture || "HistGradientBoostingRegressor (GroupKFold validated)"}
                </span>
                {forecast?.confidence && (
                  <span className="font-semibold text-slate-700">&bull; Confidence: {forecast.confidence}</span>
                )}
              </div>
              <button
                onClick={fetchInsights}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
              >
                <span>Refresh Predictions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={\`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap \${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }\`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedInsights.map((item) => {
            const Icon = item.icon || Sparkles;
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={\`w-8 h-8 rounded-lg flex items-center justify-center \${item.iconColor || "text-blue-600 bg-blue-50"}\`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-slate-500">{item.category}</span>
                    </div>

                    <span
                      className={\`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium \${
                        item.badgeType === "emerald"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : item.badgeType === "amber"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : item.badgeType === "violet"
                          ? "bg-violet-50 text-violet-700 border border-violet-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }\`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Compass className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-[11px] text-slate-600 truncate max-w-[240px]">
                      {item.recommendation}
                    </span>
                  </div>
                  <span className="font-semibold text-[11px] text-blue-600 shrink-0 ml-2">
                    {item.impact}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Insights;
`;

fs.writeFileSync(path.join(frontendRoot, 'pages', 'Insights.tsx'), insightsContent, 'utf8');
console.log("Updated Insights.tsx successfully.");

// ==========================================
// 4. Analytics.tsx
// ==========================================
const analyticsContent = `import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  ArrowUpRight, Download, Zap, ShieldCheck, Clock, RefreshCw
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
  }, []);

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

          <div className="flex items-center gap-2">
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
                <p className="text-xs text-slate-500">Validated biometric observations ({tableLogs.length} recent sessions)</p>
              </div>
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
                      <td className="px-5 py-3.5 font-medium text-slate-900">{row.date}</td>
                      <td className="px-5 py-3.5">{row.sleep}</td>
                      <td className="px-5 py-3.5">{row.hr}</td>
                      <td className="px-5 py-3.5">{row.screen}</td>
                      <td className="px-5 py-3.5">{row.mood}</td>
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
    </div>
  );
};

export default Analytics;
`;

fs.writeFileSync(path.join(frontendRoot, 'pages', 'Analytics.tsx'), analyticsContent, 'utf8');
console.log("Updated Analytics.tsx successfully.");

// ==========================================
// 5. Dashboard.tsx
// ==========================================
const dashboardContent = `import { useEffect, useState, useId } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area, BarChart, Bar, ResponsiveContainer
} from "recharts";
import {
  Moon, Heart, Smartphone, Smile, RefreshCw,
  TrendingUp, TrendingDown, CheckCircle2, Plus, X, Check,
  Brain
} from "lucide-react";
import Sidebar from "../components/Sidebar";

// Fallback high-fidelity sample data if backend cold start delays
const fallbackData = {
  sleep: [
    { total_sleep_hours: 6.8 },
    { total_sleep_hours: 7.2 },
    { total_sleep_hours: 8.0 },
    { total_sleep_hours: 6.5 },
    { total_sleep_hours: 7.5 },
    { total_sleep_hours: 7.8 },
    { total_sleep_hours: 8.2 },
  ],
  heart: [
    { heart_rate: 68 },
    { heart_rate: 72 },
    { heart_rate: 70 },
    { heart_rate: 75 },
    { heart_rate: 69 },
    { heart_rate: 66 },
    { heart_rate: 71 },
  ],
  phone: [
    { screen_time: 4.2 },
    { screen_time: 3.5 },
    { screen_time: 4.8 },
    { screen_time: 3.9 },
    { screen_time: 2.8 },
    { screen_time: 3.1 },
    { screen_time: 2.4 },
  ],
  mood: [
    { mood_rating: 4 },
    { mood_rating: 3 },
    { mood_rating: 4 },
    { mood_rating: 4 },
    { mood_rating: 5 },
    { mood_rating: 4 },
    { mood_rating: 5 },
  ],
  forecast: {
    predicted_mood: 3.41,
    predicted_mood_rounded: 3,
    mood_label: "Neutral / Balanced Baseline",
    trend: "Mild Dip Risk (-)",
    confidence: "88%",
    model_architecture: "HistGradientBoostingRegressor (GroupKFold validated)",
    benchmark_metrics: {
      model_rmse: 0.5979,
      naive_rmse: 0.6969,
      error_reduction: "14.2%",
      model_r2: "+0.1079"
    }
  }
};

const moodScaleOptions = [
  { value: 1, label: "Very Low", emoji: "😔", desc: "Exhausted / Low Energy", color: "hover:border-red-400 hover:bg-red-50/50 text-red-600" },
  { value: 2, label: "Low", emoji: "🙁", desc: "Mildly stressed or overwhelmed", color: "hover:border-orange-400 hover:bg-orange-50/50 text-orange-600" },
  { value: 3, label: "Neutral", emoji: "😐", desc: "Balanced / Normal baseline", color: "hover:border-slate-400 hover:bg-slate-50 text-slate-600" },
  { value: 4, label: "Good", emoji: "🙂", desc: "Calm, contented & positive", color: "hover:border-blue-400 hover:bg-blue-50/50 text-blue-600" },
  { value: 5, label: "Excellent", emoji: "😄", desc: "Highly energized & focused", color: "hover:border-emerald-400 hover:bg-emerald-50/50 text-emerald-600" },
];

const quickTags = ["Well Rested", "Deep Focus", "Work Stress", "Post-Workout", "Social Time", "Fatigued"];

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 border border-slate-200 rounded-lg shadow-md text-xs">
        <p className="font-semibold text-slate-700">{label}</p>
        <p className="text-blue-600 font-medium mt-0.5">
          {payload[0].value} {unit || ""}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeUserId, setActiveUserId] = useState(1);
  const sleepGradientId = useId();

  // Mood modal & submission state
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [moodSuccessMessage, setMoodSuccessMessage] = useState<string>("");

  const fetchData = async () => {
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
      const res = await axios.get(\`http://localhost:5000/api/dashboard/\${userId}\`, {
        timeout: 8000,
      });
      if (res.data) {
        const storedMoods = JSON.parse(localStorage.getItem("user_logged_moods") || "[]");
        const mergedData = {
          ...res.data,
          mood: [...(res.data.mood || []), ...storedMoods],
        };
        setData(mergedData);
        setIsLiveBackend(true);
      }
    } catch (err) {
      console.log("Backend offline or delayed, presenting cached/fallback digital twin metrics:", err);
      const storedMoods = JSON.parse(localStorage.getItem("user_logged_moods") || "[]");
      setData({
        ...fallbackData,
        mood: [...fallbackData.mood, ...storedMoods],
      });
      setIsLiveBackend(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveMood = async () => {
    if (!selectedRating) return;

    const newEntry = {
      mood_rating: selectedRating,
      tag: selectedTag || undefined,
      timestamp: new Date().toISOString(),
    };

    setData((prev: any) => {
      const current = prev || fallbackData;
      return {
        ...current,
        mood: [...(current.mood || []), newEntry],
      };
    });

    const stored = JSON.parse(localStorage.getItem("user_logged_moods") || "[]");
    stored.push(newEntry);
    localStorage.setItem("user_logged_moods", JSON.stringify(stored));

    try {
      await axios.post(
        "http://localhost:5000/api/mood",
        {
          user_id: activeUserId,
          mood_rating: selectedRating,
          tag: selectedTag,
        },
        { timeout: 5000 }
      );
    } catch (e) {
      console.log("Backend mood endpoint not reached; persisted locally:", e);
    }

    const ratingObj = moodScaleOptions.find((o) => o.value === selectedRating);
    setMoodSuccessMessage(\`Logged rating \${selectedRating}/5 (\${ratingObj?.label || ""})!\`);
    setIsMoodModalOpen(false);
    setSelectedRating(null);
    setSelectedTag("");

    setTimeout(() => {
      setMoodSuccessMessage("");
    }, 4000);
  };

  const currentData = data || fallbackData;
  const forecast = currentData.forecast || fallbackData.forecast;

  const sleepData = (currentData.sleep || []).map((s: any, i: number) => ({
    day: \`Day \${i + 1}\`,
    hours: s.total_sleep_hours,
  }));
  const heartData = (currentData.heart || []).map((h: any, i: number) => ({
    time: \`T\${i + 1}\`,
    bpm: h.heart_rate,
  }));
  const phoneData = (currentData.phone || []).map((p: any, i: number) => ({
    day: \`Day \${i + 1}\`,
    hours: p.screen_time,
  }));
  const moodData = (currentData.mood || []).map((m: any, i: number) => ({
    day: i < (currentData.mood || []).length - 1 ? \`Day \${i + 1}\` : "Latest",
    score: m.mood_rating,
  }));

  const avgSleep = sleepData.length
    ? (sleepData.reduce((acc: number, cur: any) => acc + (cur.hours || 0), 0) / sleepData.length).toFixed(1)
    : "7.4";
  const avgHeart = heartData.length
    ? Math.round(heartData.reduce((acc: number, cur: any) => acc + (cur.bpm || 0), 0) / heartData.length)
    : "69";
  const avgScreen = phoneData.length
    ? (phoneData.reduce((acc: number, cur: any) => acc + (cur.hours || 0), 0) / phoneData.length).toFixed(1)
    : "3.5";
  const avgMood = moodData.length
    ? (moodData.reduce((acc: number, cur: any) => acc + (cur.score || 0), 0) / moodData.length).toFixed(1)
    : "4.3";

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 bg-white p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Digital Twin Dashboard
              </h1>
              {isLiveBackend ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live API
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Synchronized
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Real-time physiological telemetry, behavioral signals, and circadian rhythm analysis
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick action button to log mood */}
            <button
              onClick={() => setIsMoodModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm"
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Log Mood Rating</span>
            </button>

            <button
              onClick={fetchData}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition shadow-sm disabled:opacity-60"
            >
              <RefreshCw className={\`w-3.5 h-3.5 text-slate-500 \${refreshing ? "animate-spin" : ""}\`} />
              <span>{refreshing ? "Syncing..." : "Sync Telemetry"}</span>
            </button>
          </div>
        </div>

        {/* Success alert toast if user logged mood */}
        {moodSuccessMessage && (
          <div className="mb-6 flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-medium shadow-sm transition">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{moodSuccessMessage} Telemetry updated on chart and KPI metric.</span>
            </div>
            <button
              onClick={() => setMoodSuccessMessage("")}
              className="text-emerald-600 hover:text-emerald-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* MindTwin AI Mood Forecast Card (Top of Dashboard) */}
        {forecast && (
          <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-800">
                    MindTwin AI Tomorrow Forecast
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                    {forecast.model_architecture ? "HistGradientBoostingRegressor" : "ML Inference Engine"}
                  </span>
                  {forecast.benchmark_metrics?.error_reduction && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      +{forecast.benchmark_metrics.error_reduction} vs Naive
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex items-baseline gap-2.5">
                  <span className="text-2xl font-black text-slate-900">
                    {forecast.predicted_mood} <span className="text-sm font-normal text-slate-500">/ 5</span>
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {forecast.mood_label}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    &bull; Trend: <span className="font-semibold text-indigo-700">{forecast.trend}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Statistical confidence of <strong>{forecast.confidence || "88%"}</strong> based on 7-day sleep debt, resting autonomic recovery, and digital screen pacing.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => setIsMoodModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
              >
                <Smile className="w-3.5 h-3.5" />
                <span>Calibrate Twin</span>
              </button>
            </div>
          </div>
        )}

        {loading ? (
          /* Clean light skeleton loader */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-slate-50 rounded-xl border border-slate-200 animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 bg-slate-50 rounded-xl border border-slate-200 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Sleep Stat */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Avg Sleep</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Moon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-slate-900">{avgSleep}</span>
                    <span className="text-xs text-slate-500">hrs/day</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                    <TrendingUp className="w-3 h-3" />
                    <span>+7.2% vs target</span>
                  </div>
                </div>
              </div>

              {/* Heart Stat */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Resting Heart Rate</span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-slate-900">{avgHeart}</span>
                    <span className="text-xs text-slate-500">bpm</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                    <TrendingDown className="w-3 h-3" />
                    <span>-2.1 bpm baseline</span>
                  </div>
                </div>
              </div>

              {/* Phone Stat */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Screen Time</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-slate-900">{avgScreen}</span>
                    <span className="text-xs text-slate-500">hrs/day</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                    <TrendingDown className="w-3 h-3" />
                    <span>-35m vs prev week</span>
                  </div>
                </div>
              </div>

              {/* Mood Stat */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Avg Mood Rating</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Smile className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-slate-900">{avgMood}</span>
                    <span className="text-xs text-slate-500">/ 5</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                    <TrendingUp className="w-3 h-3" />
                    <span>Resilient Baseline</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Analytics 2x2 Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. Sleep Architecture Chart */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <h2 className="text-sm font-semibold text-slate-900">Sleep Architecture</h2>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Target: 8.0h</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sleepData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id={sleepGradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 10]} />
                      <Tooltip content={<CustomTooltip unit="hrs" />} />
                      <Area type="monotone" dataKey="hours" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill={\`url(#\${sleepGradientId})\`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 2. Cardiovascular Telemetry Chart */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <h2 className="text-sm font-semibold text-slate-900">Resting Heart Rate (BPM)</h2>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Continuous Sync</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={heartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="time" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis domain={[40, 100]} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip unit="bpm" />} />
                      <Line type="monotone" dataKey="bpm" stroke="#e11d48" strokeWidth={2} dot={{ r: 3, fill: '#e11d48', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 3. Phone Screen Usage Chart */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <h2 className="text-sm font-semibold text-slate-900">Phone Screen Usage</h2>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Daily Hours</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={phoneData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 8]} />
                      <Tooltip content={<CustomTooltip unit="hrs" />} />
                      <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 4. Mood Tracking Chart */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <h2 className="text-sm font-semibold text-slate-900">Subjective Mood Index</h2>
                  </div>
                  <button
                    onClick={() => setIsMoodModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Log Mood</span>
                  </button>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip unit="/ 5" />} />
                      <Line type="monotone" dataKey="score" stroke="#059669" strokeWidth={2} dot={{ r: 3, fill: '#059669', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
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
                  <h3 className="text-base font-bold text-slate-900">How are you feeling today?</h3>
                  <p className="text-xs text-slate-500">Record your subjective score on the 1–5 scale</p>
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
                <span>Save Rating</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
`;

fs.writeFileSync(path.join(frontendRoot, 'pages', 'Dashboard.tsx'), dashboardContent, 'utf8');
console.log("Updated Dashboard.tsx successfully.");

console.log("ALL 5 FRONTEND FILES UPDATED SUCCESSFULLY!");
