import React, { useState, useEffect } from "react";
import { 
  Navigation, Compass, Calendar, Calculator, Heart, 
  Sparkles, ShieldCheck, HelpCircle, Loader, LogOut, CheckCircle
} from "lucide-react";
import { UserProfile, Itinerary, SavedDestination, SearchStats } from "./types";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import HomeExplorer from "./components/HomeExplorer";
import ItineraryPlanner from "./components/ItineraryPlanner";
import BudgetCalculator from "./components/BudgetCalculator";
import BucketList from "./components/BucketList";

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeView, setActiveView] = useState<string>("dashboard");
  const [bucketList, setBucketList] = useState<SavedDestination[]>([]);
  const [plannedTrips, setPlannedTrips] = useState<Itinerary[]>([]);
  const [searchStats, setSearchStats] = useState<SearchStats>({
    totalSearches: 0,
    totalEstimatedBudget: 0,
    popularTags: []
  });

  const [globalLoading, setGlobalLoading] = useState(false);

  // Sync state on startup if a session already exists
  useEffect(() => {
    const cached = localStorage.getItem("tripnest_user_profile");
    if (cached) {
      try {
        const u = JSON.parse(cached);
        setUser(u);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Sync related lists whenever user is defined
  useEffect(() => {
    if (user) {
      fetchUserLists();
    }
  }, [user]);

  const fetchUserLists = async () => {
    setGlobalLoading(true);
    try {
      const [tripsRes, bucketRes] = await Promise.all([
        fetch("/api/trips"),
        fetch("/api/bucketlist")
      ]);

      if (tripsRes.ok && bucketRes.ok) {
        const trips: Itinerary[] = await tripsRes.json();
        const bk: SavedDestination[] = await bucketRes.json();
        
        setPlannedTrips(trips);
        setBucketList(bk);
        
        // Calculate dynamic expenses metrics
        const totalBudgetsSum = trips.reduce((acc, t) => acc + (t.estimatedExpenses?.total || 0), 0);
        setSearchStats({
          totalSearches: trips.length + bk.length,
          totalEstimatedBudget: totalBudgetsSum,
          popularTags: ["nature", "beaches", "historical"]
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem("tripnest_user_profile", JSON.stringify(profile));
    setActiveView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("tripnest_user_profile");
    localStorage.removeItem("active_planned_trip_id");
    localStorage.removeItem("planner_prefill_destination");
  };

  // Add Item to Bucket List
  const handleSaveToBucket = async (dest: { name: string; country: string; imageUrl: string; budget: number }) => {
    try {
      const res = await fetch("/api/bucketlist/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dest)
      });
      if (res.ok) {
        fetchUserLists();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Trip Plan
  const handleDeleteTrip = async (id: string) => {
    try {
      const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchUserLists();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle visted item (checked in)
  const handleToggleVisited = async (id: string) => {
    try {
      const res = await fetch("/api/bucketlist/toggle-visited", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchUserLists();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update notes
  const handleUpdateNotes = async (id: string, notes: string) => {
    try {
      const res = await fetch("/api/bucketlist/update-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, notes })
      });
      if (res.ok) {
        fetchUserLists();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save brand new planned itinerary
  const handleSavePlan = async (itinerary: Itinerary) => {
    try {
      const res = await fetch("/api/trips/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itinerary)
      });
      if (res.ok) {
        fetchUserLists();
        setActiveView("dashboard");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Render components reactively depending on chosen parameters view
  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <Dashboard
            user={user}
            stats={searchStats}
            trips={plannedTrips}
            bucketList={bucketList}
            onNavigate={(v) => setActiveView(v)}
            onLogout={handleLogout}
            onDeleteTrip={handleDeleteTrip}
            onUpdateProfile={(updated) => {
              setUser(updated);
              localStorage.setItem("tripnest_user_profile", JSON.stringify(updated));
            }}
          />
        );
      case "explorer":
        return (
          <HomeExplorer
            onSaveToBucket={handleSaveToBucket}
            savedNames={bucketList.map(item => item.destinationName)}
            onNavigate={(v) => setActiveView(v)}
          />
        );
      case "planner":
        return (
          <ItineraryPlanner
            onSaveToBucket={handleSaveToBucket}
            savedTripIds={plannedTrips.map(p => p.id)}
            onSavePlan={handleSavePlan}
            onNavigate={(v) => setActiveView(v)}
          />
        );
      case "calculator":
        return <BudgetCalculator onNavigate={(v) => setActiveView(v)} />;
      case "bucket":
        return (
          <BucketList
            bucketList={bucketList}
            onRemoveItem={(id) => {
              fetch(`/api/bucketlist/${id}`, { method: "DELETE" }).then(() => fetchUserLists());
            }}
            onToggleVisited={handleToggleVisited}
            onUpdateNotes={handleUpdateNotes}
            onNavigate={(v) => setActiveView(v)}
            onSaveToBucket={handleSaveToBucket}
          />
        );
      default:
        return <div className="text-center py-20 text-slate-500 font-sans">View not found</div>;
    }
  };

  return (
    <div id="app-viewport-root" className="min-h-screen bg-earth-bg flex flex-col justify-between selection:bg-earth-accent/20 selection:text-earth-slate pb-20 md:pb-0 font-sans text-earth-slate">
      
      {/* Dynamic Header Navbar block */}
      <header id="main-navigation-header" className="bg-earth-bg/95 backdrop-blur-md border-b border-earth-border sticky top-0 z-40 select-none">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <div 
            id="branding-title-logo"
            onClick={() => setActiveView("dashboard")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="bg-earth-accent text-white p-2.5 rounded-lg">
              <Navigation className="h-5 w-5 rotate-45" />
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-earth-accent italic">
              TripNest
            </h1>
          </div>

          {/* Desktop Links View */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              id="gonav-dashboard"
              onClick={() => setActiveView("dashboard")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all inline-flex items-center gap-1.5 ${
                activeView === "dashboard"
                  ? "bg-earth-accent text-white"
                  : "text-earth-accent/85 hover:bg-earth-aside/50 hover:text-earth-slate"
              }`}
            >
              Dashboard
            </button>
            <button
              id="gonav-explorer"
              onClick={() => setActiveView("explorer")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all inline-flex items-center gap-1.5 ${
                activeView === "explorer"
                  ? "bg-earth-accent text-white"
                  : "text-earth-accent/85 hover:bg-earth-aside/50 hover:text-earth-slate"
              }`}
            >
              <Compass className="h-4 w-4" /> Discovery
            </button>
            <button
              id="gonav-planner"
              onClick={() => setActiveView("planner")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all inline-flex items-center gap-1.5 ${
                activeView === "planner"
                  ? "bg-earth-accent text-white"
                  : "text-earth-accent/85 hover:bg-earth-aside/50 hover:text-earth-slate"
              }`}
            >
              <Sparkles className="h-4 w-4" /> AI Planner
            </button>
            <button
              id="gonav-calculator"
              onClick={() => setActiveView("calculator")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all inline-flex items-center gap-1.5 ${
                activeView === "calculator"
                  ? "bg-earth-accent text-white"
                  : "text-earth-accent/85 hover:bg-earth-aside/50 hover:text-earth-slate"
              }`}
            >
              <Calculator className="h-4 w-4" /> Budget Cost
            </button>
            <button
              id="gonav-bucket"
              onClick={() => setActiveView("bucket")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all inline-flex items-center gap-1.5 ${
                activeView === "bucket"
                  ? "bg-earth-accent text-white"
                  : "text-earth-accent/85 hover:bg-earth-aside/50 hover:text-earth-slate"
              }`}
            >
              <Heart className="h-4 w-4" /> Bucket List
            </button>
          </nav>

          {/* Quick loading indicator / User profile block */}
          <div className="flex items-center gap-3">
            {globalLoading && (
              <Loader className="h-4 w-4 text-earth-accent animate-spin" />
            )}
            
            <div id="quick-user-badge" className="flex items-center gap-2 border border-earth-border p-1 pr-3 rounded-full bg-white/60">
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-white"
              />
              <span className="text-xs font-semibold text-earth-slate hidden md:inline truncate max-w-[90px]">{user.name}</span>
            </div>
          </div>

        </div>
      </header>

      {/* Primary view content canvas */}
      <main className="flex-grow">
        {renderView()}
      </main>

      {/* Sticky Bottom touch Bar on Mobile devices for ergonomics */}
      <nav id="mobile-sticky-navbar" className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-earth-border grid grid-cols-5 items-center justify-center px-2 z-40 select-none shadow-sm">
        <button
          id="mobile-nav-dashboard"
          onClick={() => setActiveView("dashboard")}
          className={`flex flex-col items-center justify-center text-center gap-1 transition-all ${
            activeView === "dashboard" ? "text-earth-accent" : "text-earth-accent/50"
          }`}
        >
          <span className="text-[10px] font-bold">Dash</span>
        </button>

        <button
          id="mobile-nav-explorer"
          onClick={() => setActiveView("explorer")}
          className={`flex flex-col items-center justify-center text-center gap-1 transition-all ${
            activeView === "explorer" ? "text-earth-accent" : "text-earth-accent/50"
          }`}
        >
          <Compass className="h-5 w-5 mx-auto" />
          <span className="text-[10px] font-bold">Discover</span>
        </button>

        <button
          id="mobile-nav-planner"
          onClick={() => setActiveView("planner")}
          className={`flex flex-col items-center justify-center text-center gap-1 transition-all ${
            activeView === "planner" ? "text-earth-accent animate-pulse" : "text-earth-accent/50"
          }`}
        >
          <Sparkles className="h-5 w-5 mx-auto" />
          <span className="text-[10px] font-bold">Planner</span>
        </button>

        <button
          id="mobile-nav-calculator"
          onClick={() => setActiveView("calculator")}
          className={`flex flex-col items-center justify-center text-center gap-1 transition-all ${
            activeView === "calculator" ? "text-earth-accent" : "text-earth-accent/50"
          }`}
        >
          <Calculator className="h-5 w-5 mx-auto" />
          <span className="text-[10px] font-bold">Budget</span>
        </button>

        <button
          id="mobile-nav-bucket"
          onClick={() => setActiveView("bucket")}
          className={`flex flex-col items-center justify-center text-center gap-1 transition-all ${
            activeView === "bucket" ? "text-earth-accent" : "text-earth-accent/50"
          }`}
        >
          <Heart className="h-5 w-5 mx-auto" />
          <span className="text-[10px] font-bold">Dream</span>
        </button>
      </nav>

      {/* Compact footer */}
      <footer className="hidden md:block py-6 border-t border-earth-border bg-white/40 text-center text-xs text-earth-accent/60 select-none">
        <p>© 2026 TripNest Inc. Your secure AI Travel Planning Workspace. All rights reserved.</p>
      </footer>
    </div>
  );
}
