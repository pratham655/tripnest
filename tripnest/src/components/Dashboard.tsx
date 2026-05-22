import React, { useState } from "react";
import { 
  Compass, Calendar, Heart, Award, ArrowUpRight, 
  MapPin, Plus, Loader, LogOut, FileText, Trash2, 
  Settings, User, Map, CheckCircle2, TrendingUp, Sparkles, Smile
} from "lucide-react";
import { UserProfile, Itinerary, SavedDestination, SearchStats } from "../types";

interface DashboardProps {
  user: UserProfile;
  stats: SearchStats;
  trips: Itinerary[];
  bucketList: SavedDestination[];
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onDeleteTrip: (id: string) => void;
  onUpdateProfile: (updated: UserProfile) => void;
}

export default function Dashboard({ 
  user, stats, trips, bucketList, onNavigate, onLogout, onDeleteTrip, onUpdateProfile 
}: DashboardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editBio, setEditBio] = useState(user.bio || "");
  const [editHome, setEditHome] = useState(user.homeLocation || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          name: editName,
          bio: editBio,
          homeLocation: editHome
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onUpdateProfile(data.user);
        setIsEditing(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="dashboard-container" className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn select-none selection:bg-earth-accent/20 selection:text-earth-slate">
      {/* Upper Welcome banner with Profile Info */}
      <div id="welcome-profile-card" className="bg-earth-accent rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        {/* Abstract graphic accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full blur-2xl -ml-16 -mb-16" />

        <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img 
              id="user-profile-avatar"
              src={user.avatarUrl} 
              alt={user.name} 
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full border-4 border-white/10 shadow-sm object-cover bg-earth-bg"
            />
            <div className="text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <span className="text-xs bg-white/10 px-3 py-0.5 rounded-full backdrop-blur-sm tracking-wide font-sans font-medium">TripNest Voyager</span>
                {user.homeLocation && (
                  <span className="text-xs bg-white/15 px-3 py-0.5 rounded-full border border-white/20 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-earth-bg" /> {user.homeLocation}
                  </span>
                )}
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">{user.name}</h2>
              <p className="text-white/80 max-w-lg text-sm italic font-sans animate-fadeIn">
                &ldquo;{user.bio || "Crafting paths, matching charts, discovering nests..."}&rdquo;
              </p>
              <p className="text-xs text-white/60">Email: {user.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              id="edit-profile-btn"
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-4 py-2 rounded-lg text-sm font-semibold transition-all backdrop-blur-md active:scale-95 flex items-center gap-1.5"
            >
              <Settings className="h-4 w-4" /> {isEditing ? "Close" : "Edit Profile"}
            </button>
            <button
              id="logout-btn"
              type="button"
              onClick={onLogout}
              className="bg-rose-500/80 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 flex items-center gap-1.5"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Profile Editing Form */}
        {isEditing && (
          <form id="profile-edit-form" onSubmit={handleUpdate} className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-earth-slate animate-slideDown">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/95 uppercase tracking-wider">Your Display Name</label>
              <input
                id="edit-name-input"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-white border border-earth-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 font-medium text-earth-slate"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/95 uppercase tracking-wider">Home/Starting Location</label>
              <input
                id="edit-home-input"
                type="text"
                placeholder="e.g. Mumbai, India"
                value={editHome}
                onChange={(e) => setEditHome(e.target.value)}
                className="w-full bg-white border border-earth-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 font-medium text-earth-slate"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/95 uppercase tracking-wider">Personal Bio/Motto</label>
              <input
                id="edit-bio-input"
                type="text"
                placeholder="Write what inspires your travel..."
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full bg-white border border-earth-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 font-medium text-earth-slate"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2 mt-2">
              <button
                id="cancel-edit-btn"
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-white/80 hover:text-white text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                id="save-profile-btn"
                type="submit"
                disabled={loading}
                className="bg-white hover:bg-white/90 text-earth-accent min-w-[120px] px-5 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 flex items-center justify-center"
              >
                {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Stats Bento Grid */}
      <div id="dashboard-stats-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div id="stat-trips" className="bg-white p-5 rounded-xl border border-earth-border flex items-center gap-4 hover:border-earth-accent transition-all shadow-sm">
          <div className="p-3 bg-[#E6E6DF] rounded-lg text-earth-accent shrink-0">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">AI Itineraries</p>
            <p className="text-2xl font-serif font-semibold text-earth-slate">{trips.length}</p>
          </div>
        </div>

        <div id="stat-saved" className="bg-white p-5 rounded-xl border border-earth-border flex items-center gap-4 hover:border-earth-accent transition-all shadow-sm">
          <div className="p-3 bg-[#F1ECE4] rounded-lg text-[#8C7A5F] shrink-0">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">Dream Places</p>
            <p className="text-2xl font-serif font-semibold text-earth-slate">{bucketList.length}</p>
          </div>
        </div>

        <div id="stat-visited" className="bg-white p-5 rounded-xl border border-earth-border flex items-center gap-4 hover:border-earth-accent transition-all shadow-sm">
          <div className="p-3 bg-[#EBEBE4] rounded-lg text-earth-accent shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">Visited Count</p>
            <p className="text-2xl font-serif font-semibold text-earth-slate">
              {bucketList.filter(b => b.isVisited).length} <span className="text-xs text-[#5A5A40]/50 font-normal font-sans">checked-in</span>
            </p>
          </div>
        </div>

        <div id="stat-budget" className="bg-white p-5 rounded-xl border border-earth-border flex items-center gap-4 hover:border-earth-accent transition-all shadow-sm">
          <div className="p-3 bg-[#EAE4D9] rounded-lg text-[#7A603F] shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#5A5A40] uppercase tracking-wider font-sans">Budget Managed</p>
            <p className="text-2xl font-serif font-semibold text-earth-slate">
              ${stats.totalEstimatedBudget.toLocaleString() || "0"}
            </p>
          </div>
        </div>
      </div>

      {/* Main split: Upcoming Plans vs Quick launch */}
      <div id="dashboard-split" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Future plans block (Column 1 & 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-bold text-earth-slate flex items-center gap-2">
              <Calendar className="h-5 w-5 text-earth-accent" /> Upcoming Planned Trips
            </h3>
            {trips.length > 0 && (
              <button 
                id="create-another-trip-btn"
                type="button"
                onClick={() => onNavigate("planner")} 
                className="text-xs font-bold text-earth-accent hover:text-earth-accent-hover flex items-center gap-1 hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Plan New
              </button>
            )}
          </div>

          {trips.length === 0 ? (
            <div id="empty-trips-card" className="bg-[#EBEBE4]/30 border border-dashed border-earth-border p-10 rounded-xl text-center space-y-4">
              <Compass className="h-12 w-12 text-earth-accent/50 mx-auto animate-pulse-slow" />
              <div className="space-y-1">
                <h4 className="text-base font-serif font-bold text-earth-slate">No planned voyages yet</h4>
                <p className="text-xs text-earth-accent/70 max-w-sm mx-auto leading-relaxed">
                  Generate beautiful day-wise flight/stay itineraries in seconds powered recursively by intelligent Gemini AI.
                </p>
              </div>
              <button
                id="launch-planner-empty-btn"
                type="button"
                onClick={() => onNavigate("planner")}
                className="bg-earth-accent hover:bg-earth-accent-hover text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-sm inline-flex items-center justify-center gap-1.5 mx-auto active:scale-95"
              >
                <Sparkles className="h-4 w-4" /> Launch AI Planner
              </button>
            </div>
          ) : (
            <div id="trips-scroller" className="space-y-4">
              {trips.map((trip) => (
                <div 
                  key={trip.id} 
                  id={`planned-trip-${trip.id}`}
                  className="bg-white border border-earth-border p-5 rounded-xl transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-[#EBEBE4] text-earth-accent">
                        {trip.numberOfDays} Days • {trip.numberOfTravelers} Guests
                      </span>
                      <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-[#EAE4D9] text-[#7A603F]">
                        {trip.budgetCategory}
                      </span>
                    </div>
                    <h4 className="text-lg font-serif font-bold text-earth-slate">{trip.title}</h4>
                    <p className="text-xs text-earth-accent/85 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-earth-accent" /> {trip.startingLocation} &rarr; <span className="font-semibold text-earth-slate">{trip.destination}</span>
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {trip.interests.slice(0, 3).map((interest, idx) => (
                        <span key={idx} className="text-[10px] bg-[#EBEBE4]/30 text-[#5A5A40] px-2 py-0.5 rounded-full border border-earth-border/40">
                          #{interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between border-t md:border-t-0 pt-3 md:pt-0 border-earth-border/40">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] uppercase font-semibold text-earth-accent/60">Total Budget</p>
                      <p className="text-base font-extrabold text-earth-accent">${trip.estimatedExpenses?.total || "0"}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        id={`view-trip-${trip.id}-btn`}
                        type="button"
                        onClick={() => {
                          // Signal navigation to active trip explorer
                          localStorage.setItem("active_planned_trip_id", trip.id);
                          onNavigate("planner");
                        }}
                        className="p-2 text-earth-slate hover:text-earth-accent bg-earth-bg hover:bg-[#EBEBE4] rounded-lg transition-all"
                        title="Open Full Itinerary"
                      >
                        <FileText className="h-5 w-5" />
                      </button>
                      <button
                        id={`delete-trip-${trip.id}-btn`}
                        type="button"
                        onClick={() => onDeleteTrip(trip.id)}
                        className="p-2 text-earth-slate hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete Trip Plan"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Launch & Tools panel (Column 3) */}
        <div className="space-y-6">
          <h3 className="text-xl font-serif font-bold text-earth-slate flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-earth-accent" /> TripNest Quick Tools
          </h3>

          <div id="tools-launchpad" className="bg-white border border-earth-border p-6 rounded-xl space-y-4 shadow-sm">
            
            <div 
              id="tool-explore-shortcut"
              onClick={() => onNavigate("explorer")}
              className="group flex items-center gap-4 p-3.5 rounded-lg hover:bg-earth-bg border border-transparent hover:border-earth-border cursor-pointer transition-all"
            >
              <div className="p-3 bg-[#E6E6DF] rounded-lg text-earth-accent group-hover:bg-white group-hover:shadow-sm">
                <Compass className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-earth-slate text-sm group-hover:text-earth-accent font-serif">Search Places</h5>
                <p className="text-xs text-earth-accent/70">Discover weather, Attractions, and food</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-earth-accent/50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>

            <div 
              id="tool-planner-shortcut"
              onClick={() => onNavigate("planner")}
              className="group flex items-center gap-4 p-3.5 rounded-lg hover:bg-earth-bg border border-transparent hover:border-earth-border cursor-pointer transition-all"
            >
              <div className="p-3 bg-[#F1ECE4] rounded-lg text-[#8C7A5F] group-hover:bg-white group-hover:shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-earth-slate text-sm group-hover:text-earth-accent font-serif">AI Planner</h5>
                <p className="text-xs text-earth-accent/70">Generate high-quality micro travel loops</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-earth-accent/50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>

            <div 
              id="tool-calculator-shortcut"
              onClick={() => onNavigate("calculator")}
              className="group flex items-center gap-4 p-3.5 rounded-lg hover:bg-earth-bg border border-transparent hover:border-earth-border cursor-pointer transition-all"
            >
              <div className="p-3 bg-[#EBEBE4] rounded-lg text-earth-accent group-hover:bg-white group-hover:shadow-sm">
                <Map className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-earth-slate text-sm group-hover:text-earth-accent font-serif">Budget Calculator</h5>
                <p className="text-xs text-earth-accent/70">Analyze transit/lodging cost metrics</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-earth-accent/50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>

            <div 
              id="tool-bucket-shortcut"
              onClick={() => onNavigate("bucket")}
              className="group flex items-center gap-4 p-3.5 rounded-lg hover:bg-earth-bg border border-transparent hover:border-earth-border cursor-pointer transition-all"
            >
              <div className="p-3 bg-[#EAE4D9] rounded-lg text-[#7A603F] group-hover:bg-white group-hover:shadow-sm">
                <Heart className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-earth-slate text-sm group-hover:text-earth-accent font-serif">Bucket Checklist</h5>
                <p className="text-xs text-earth-accent/70">Track and pin amazing dream cities</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-earth-accent/50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            
          </div>

          {/* Inspirational Quote Widget */}
          <div className="bg-[#EBEBE4]/40 border border-earth-border p-5 rounded-xl relative overflow-hidden flex items-start gap-3">
            <Smile className="h-6 w-6 text-earth-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-earth-slate">Traveler's Quote of the Day</p>
              <p className="text-xs text-earth-accent/80 italic leading-relaxed mt-1">
                &ldquo;Live with no excuses and travel with no regrets. Every single step unlocks a beautiful nest of memories.&rdquo;
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
