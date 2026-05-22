import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, Edit3, Save, Check, Sparkles, Navigation, 
  MapPin, Calendar, Heart, Coins, Coffee, CloudSun, Compass, 
  Sliders, Loader, ArrowLeftRight, CheckCircle, Info, RefreshCw, ZoomIn, ZoomOut, AlertCircle
} from "lucide-react";
import confetti from "canvas-confetti";
import { Itinerary, DayItinerary, ActivityItem } from "../types";
import InteractiveMap from "./InteractiveMap";

interface ItineraryPlannerProps {
  onSaveToBucket: (dest: { name: string; country: string; imageUrl: string; budget: number }) => void;
  savedTripIds: string[];
  onSavePlan: (itinerary: Itinerary) => void;
  onNavigate: (view: string) => void;
}

const INTEREST_OPTIONS = [
  "Sightseeing 📷", "Culture & History 🏛️", "Local Delicacies 🍜", 
  "Adventure Sports 🧗", "Beaches & Coast 🏖️", "Hiking & Nature 🌿", 
  "Nightlife 🌃", "Shopping 🛍️", "Art & Museums 🎨"
];

export default function ItineraryPlanner({ onSaveToBucket, savedTripIds, onSavePlan, onNavigate }: ItineraryPlannerProps) {
  // Plan Parameters State
  const [startingLocation, setStartingLocation] = useState("Mumbai, India");
  const [destination, setDestination] = useState("");
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [numberOfTravelers, setNumberOfTravelers] = useState(1);
  const [budget, setBudget] = useState<"budget" | "moderate" | "luxury">("moderate");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  // Loading & Generation Status
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // Active loaded itinerary
  const [activeTrip, setActiveTrip] = useState<Itinerary | null>(null);
  
  // Editing Sub-state
  const [editingDayIdx, setEditingDayIdx] = useState<number | null>(null);
  const [editingActIdx, setEditingActIdx] = useState<number | null>(null);
  const [tempActName, setTempActName] = useState("");
  const [tempActDesc, setTempActDesc] = useState("");

  const loadingMessages = [
    "Consulting TripNest's travel databases...",
    "Drafting day-wise routes and transit steps...",
    "Finding the absolute best regional dining spots...",
    "Gemini is applying budget calculators and weather models...",
    "Polishing final itinerary and gathering local insider tips..."
  ];

  // Prefill hook from other panels
  useEffect(() => {
    const prefill = localStorage.getItem("planner_prefill_destination");
    if (prefill) {
      setDestination(prefill);
      localStorage.removeItem("planner_prefill_destination");
    }

    // Load active planned trip if chosen from dashboard
    const activeTripIdStr = localStorage.getItem("active_planned_trip_id");
    if (activeTripIdStr) {
      localStorage.removeItem("active_planned_trip_id");
      fetchSavedTripDetails(activeTripIdStr);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generating) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [generating]);

  const fetchSavedTripDetails = async (id: string) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/trips");
      const list = await res.json();
      const trip = list.find((t: Itinerary) => t.id === id);
      if (trip) {
        setActiveTrip(trip);
        setDestination(trip.destination);
        setStartingLocation(trip.startingLocation);
        setNumberOfDays(trip.numberOfDays);
        setNumberOfTravelers(trip.numberOfTravelers);
        setBudget(trip.budgetCategory);
        setSelectedInterests(trip.interests);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const toggleInterest = (interest: string) => {
    const cleanInter = interest.split(" ")[0]; // Strip emojis for code storage
    if (selectedInterests.includes(cleanInter)) {
      setSelectedInterests(selectedInterests.filter(i => i !== cleanInter));
    } else {
      setSelectedInterests([...selectedInterests, cleanInter]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      setError("Please specify an inspiring destination to venture into!");
      return;
    }

    setError("");
    setGenerating(true);
    setLoadingMsgIdx(0);

    try {
      const res = await fetch("/api/gemini/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startingLocation,
          destination,
          numberOfDays,
          numberOfTravelers,
          budget,
          interests: selectedInterests
        })
      });

      if (!res.ok) {
        throw new Error("Failed to consult Gemini. Fallback initiated.");
      }

      const data = await res.json();
      setActiveTrip(data);
      triggerConfetti();
    } catch (err: any) {
      setError(err.message || "An unexpected issue occurred while drafting your itinerary.");
    } finally {
      setGenerating(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSaveTrip = () => {
    if (!activeTrip) return;
    onSavePlan(activeTrip);
    triggerConfetti();
  };

  const handleAddToBucket = () => {
    if (!activeTrip) return;
    onSaveToBucket({
      name: activeTrip.destination,
      country: "Global Target",
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
      budget: activeTrip.estimatedExpenses.total
    });
    triggerConfetti();
  };

  // Activity Edit function
  const startEditActivity = (dayIdx: number, actIdx: number, item: ActivityItem) => {
    setEditingDayIdx(dayIdx);
    setEditingActIdx(actIdx);
    setTempActName(item.activity);
    setTempActDesc(item.description || "");
  };

  const saveEditActivity = () => {
    if (!activeTrip || editingDayIdx === null || editingActIdx === null) return;
    const updated = { ...activeTrip };
    const day = updated.dayWiseItinerary[editingDayIdx];
    day.activities[editingActIdx] = {
      ...day.activities[editingActIdx],
      activity: tempActName,
      description: tempActDesc
    };
    setActiveTrip(updated);
    setEditingDayIdx(null);
    setEditingActIdx(null);
  };

  return (
    <div id="itinerary-planner-module" className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn select-none selection:bg-earth-accent/20 selection:text-earth-slate text-earth-slate">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-3xl font-serif font-bold text-earth-slate tracking-tight flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="h-7 w-7 text-earth-accent" /> AI Trip Planner
          </h2>
          <p className="text-earth-accent/70 text-sm">Empower your travel dreams. Real-time path optimization, weather, and budget structures in minutes</p>
        </div>

        {activeTrip && (
          <button
            id="planner-reset-button"
            type="button"
            onClick={() => setActiveTrip(null)}
            className="border border-earth-border hover:bg-[#EBEBE4]/30 text-earth-slate px-4 py-2.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 active:scale-95 transition-all w-full md:w-auto justify-center"
          >
            <RefreshCw className="h-4 w-4" /> Start New Parameters
          </button>
        )}
      </div>

      {error && (
        <div id="planner-error-bar" className="flex items-start gap-2 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-xs font-sans text-left">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Planner split: Left Form or Active Itinerary lists | Right Interactive Visual Maps & Cost Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form (if null) or Detailed Trip Output (if defined) */}
        <div className="lg:col-span-7 space-y-6">
          
          {!activeTrip && !generating ? (
            /* Parameters Entry Form representing high fidelity fields */
            <form id="trip-parameters-form" onSubmit={handleGenerate} className="bg-white border border-earth-border rounded-lg p-6 md:p-8 shadow-sm space-y-6">
              
              {/* Destinations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-earth-accent block">Starting Location 🛫</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-earth-accent/60" />
                    <input
                      id="start-location-input"
                      type="text"
                      required
                      value={startingLocation}
                      onChange={(e) => setStartingLocation(e.target.value)}
                      placeholder="e.g. Mumbai, India"
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-earth-border focus:border-earth-accent focus:outline-none focus:ring-2 focus:ring-earth-accent/10 text-sm rounded-lg font-sans text-earth-slate transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-earth-accent block">Where to? Destined Nest 🗺️</label>
                  <div className="relative">
                    <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-earth-accent" />
                    <input
                      id="destination-location-input"
                      type="text"
                      required
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Kyoto, Japan"
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-earth-border focus:border-earth-accent focus:outline-none focus:ring-2 focus:ring-earth-accent/10 text-sm rounded-lg font-sans text-earth-slate transition-all font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Transit Parameters: Days & Travelers */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-1 text-left">
                  <label className="text-xs font-bold text-earth-accent block">Days 📅</label>
                  <input
                    id="days-count-input"
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={numberOfDays}
                    onChange={(e) => setNumberOfDays(Math.max(1, Math.min(10, Number(e.target.value))))}
                    className="w-full bg-white border border-earth-border px-4 py-2.5 text-sm rounded-lg focus:border-earth-accent focus:outline-none text-center font-bold text-earth-slate font-sans"
                  />
                </div>

                <div className="col-span-1 space-y-1 text-left">
                  <label className="text-xs font-bold text-earth-accent block">Travelers 🧑‍🤝‍🧑</label>
                  <input
                    id="travelers-count-input"
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={numberOfTravelers}
                    onChange={(e) => setNumberOfTravelers(Math.max(1, Math.min(12, Number(e.target.value))))}
                    className="w-full bg-white border border-earth-border px-4 py-2.5 text-sm rounded-lg focus:border-earth-accent focus:outline-none text-center font-bold text-earth-slate font-sans"
                  />
                </div>

                <div className="col-span-1 space-y-1 text-left font-sans">
                  <label className="text-xs font-bold text-earth-accent block">Budget Profile 🪙</label>
                  <select
                    id="budget-tier-select"
                    value={budget}
                    onChange={(e: any) => setBudget(e.target.value)}
                    className="w-full bg-white border border-earth-border px-3 py-2.5 text-xs font-bold rounded-lg focus:border-earth-accent focus:outline-none text-center text-earth-slate font-sans"
                  >
                    <option value="budget">Value ($)</option>
                    <option value="moderate">Moderate ($$)</option>
                    <option value="luxury">Luxury ($$$)</option>
                  </select>
                </div>
              </div>

              {/* Specific Interests checklist tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-earth-accent block text-left">Personalize Nest Interests 🧭</label>
                <div id="interests-checks-grid" className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {INTEREST_OPTIONS.map((opt) => {
                    const optionName = opt.split(" ")[0];
                    const isChecked = selectedInterests.includes(optionName);
                    return (
                      <button
                        key={opt}
                        type="button"
                        id={`interest-opt-${optionName}`}
                        onClick={() => toggleInterest(opt)}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg text-left border flex items-center justify-between transition-all active:scale-[0.98] ${
                          isChecked
                            ? "bg-earth-accent text-white border-earth-accent shadow-sm"
                            : "bg-white text-earth-slate/80 border-earth-border hover:bg-earth-bg"
                        }`}
                      >
                        <span>{opt}</span>
                        {isChecked && <CheckCircle className="h-3.5 w-3.5 text-white shrink-0 ml-1.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Generate CTA Button */}
              <button
                id="generate-itinerary-submit"
                type="submit"
                className="w-full bg-earth-accent hover:bg-earth-accent-hover text-white font-bold py-3.5 rounded-lg transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
              >
                <Sparkles className="h-4.5 w-4.5 animate-pulse" /> Draft AI Travel Itinerary
              </button>

            </form>
          ) : generating ? (
            /* Advanced AI generation reassuring screen */
            <div id="planner-generating-card" className="bg-white border border-earth-border p-10 rounded-lg text-center space-y-6 shadow-sm py-24 animate-pulse">
              <div className="relative w-20 h-20 mx-auto">
                <Compass className="h-20 w-20 text-earth-accent animate-spin" style={{ animationDuration: "14s" }} />
                <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-[#A09F84] animate-bounce" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-serif font-bold text-earth-slate">TripNest AI is drafting your nest...</h4>
                <p id="generating-message-tag" className="text-sm font-semibold text-earth-accent">{loadingMessages[loadingMsgIdx]}</p>
                <p className="text-xs text-[#5A5A40]/80 max-w-sm mx-auto leading-relaxed">
                  The model takes ~8 seconds to calculate attractions details, route schedules, restaurants, and forecast indicators.
                </p>
              </div>
            </div>
          ) : (
            /* Active loaded itinerary results detail list */
            activeTrip && (
              <div id="planner-results-view" className="space-y-6">
                
                {/* Immersive Itinerary Heading segment */}
                <div className="bg-white border border-earth-border p-5 rounded-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-[#EBEBE4] px-2.5 py-0.5 rounded font-bold text-earth-slate uppercase tracking-widest">
                      {activeTrip.numberOfDays} Day Adventure Loop
                    </span>
                    <h3 className="text-2xl font-serif font-black text-earth-slate tracking-tight">{activeTrip.title}</h3>
                    <p className="text-xs text-earth-accent/70 font-sans flex items-center gap-1.5 leading-relaxed pt-0.5">
                      <MapPin className="h-4 w-4 text-earth-accent" /> {activeTrip.startingLocation} &rarr; <span className="font-semibold text-earth-slate">{activeTrip.destination}</span>
                    </p>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end border-t md:border-0 pt-3 md:pt-0 border-earth-border/40">
                    <button
                      id="save-plan-to-db-btn"
                      type="button"
                      onClick={handleSaveTrip}
                      className="bg-earth-accent hover:bg-earth-accent-hover text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all shadow-sm flex items-center gap-1.5 active:scale-95 uppercase tracking-wider"
                    >
                      <Save className="h-4 w-4" /> Save This Itinerary
                    </button>
                    <button
                      id="save-plan-to-bucket-btn"
                      type="button"
                      onClick={handleAddToBucket}
                      className="bg-white hover:bg-[#EBEBE4]/30 border border-earth-border text-earth-slate font-bold text-xs px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Heart className="h-4 w-4 fill-current text-earth-accent" /> Pinned
                    </button>
                  </div>
                </div>

                {/* Day-Wise loops list */}
                <div id="daywise-itinerary-scroller" className="space-y-6">
                  {activeTrip.dayWiseItinerary.map((day, dayIdx) => (
                    <div 
                      key={day.dayNumber} 
                      id={`itinerary-day-box-${day.dayNumber}`}
                      className="bg-white border border-earth-border rounded-lg overflow-hidden shadow-sm"
                    >
                      {/* Day Header banner */}
                      <div className="bg-[#EBEBE4]/40 border-b border-earth-border px-6 py-4 flex items-center justify-between text-left">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-black text-earth-accent uppercase tracking-widest">Day Number {day.dayNumber}</h4>
                          <p className="text-base font-bold font-serif text-earth-slate">{day.theme}</p>
                        </div>
                        <Calendar className="h-5 w-5 text-earth-accent" />
                      </div>

                      {/* Day details */}
                      <div className="p-6 space-y-6 text-left">
                        
                        {/* Activities timeline */}
                        <div className="space-y-4">
                          <span className="text-xs font-bold text-[#8C7A5F] uppercase tracking-widest block">Daily Milestones Schedule</span>
                          
                          <div className="space-y-4 border-l border-earth-border pl-4 ml-1 relative">
                            {day.activities.map((act, actIdx) => {
                                const isEditingThis = editingDayIdx === dayIdx && editingActIdx === actIdx;

                                return (
                                  <div key={actIdx} className="relative group/act text-xs font-sans text-earth-slate/80">
                                    {/* Dot indicator */}
                                    <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border-2 border-white bg-earth-accent shrink-0" />
                                    
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-[10px] bg-[#EBEBE4]/30 text-earth-accent px-2 py-0.5 rounded border border-earth-border/40">
                                          {act.time}
                                        </span>
                                        
                                        {/* Quick Edit icon */}
                                        {!isEditingThis && (
                                          <button
                                            id={`edit-act-btn-${dayIdx}-${actIdx}`}
                                            type="button"
                                            onClick={() => startEditActivity(dayIdx, actIdx, act)}
                                            className="opacity-0 group-hover/act:opacity-100 p-1 text-earth-slate hover:text-earth-accent transition-all rounded"
                                            title="Modify Activity Task"
                                          >
                                            <Edit3 className="h-3 w-3" />
                                          </button>
                                        )}
                                      </div>

                                      {isEditingThis ? (
                                        <div className="space-y-2 mt-1.5 max-w-md bg-[#EBEBE4]/30 p-3 rounded-lg border border-earth-border">
                                          <input
                                            id="temp-act-name-input"
                                            type="text"
                                            value={tempActName}
                                            onChange={(e) => setTempActName(e.target.value)}
                                            className="w-full bg-white border border-earth-border px-2 py-1 rounded text-xs font-bold focus:outline-none"
                                          />
                                          <textarea
                                            id="temp-act-desc-input"
                                            value={tempActDesc}
                                            onChange={(e) => setTempActDesc(e.target.value)}
                                            rows={2}
                                            className="w-full bg-white border border-earth-border px-2 py-1 rounded text-xs focus:outline-none leading-relaxed"
                                          />
                                          <div className="flex justify-end gap-1.5 pt-1">
                                            <button
                                              id="save-act-edit-btn"
                                              type="button"
                                              onClick={saveEditActivity}
                                              className="text-[10px] bg-earth-accent text-white font-bold px-2 py-1 rounded flex items-center gap-0.5"
                                            >
                                              <Save className="h-2.5 w-2.5" /> Save
                                            </button>
                                            <button
                                              id="cancel-act-edit-btn"
                                              type="button"
                                              onClick={() => {
                                                setEditingDayIdx(null);
                                                setEditingActIdx(null);
                                              }}
                                              className="text-[10px] text-earth-slate/60 hover:bg-[#EBEBE4]/40 px-2 py-1 rounded"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div>
                                          <h5 className="font-bold text-earth-slate text-sm leading-snug">{act.activity}</h5>
                                          <p className="text-[#5A5A40] leading-relaxed font-normal pt-0.5">{act.description}</p>
                                          {act.location && (
                                            <p className="text-[10px] text-earth-accent font-semibold flex items-center gap-0.5 pt-0.5 font-sans">
                                              <MapPin className="h-3 w-3" /> {act.location} {act.cost ? `(Est. $${act.cost})` : ""}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        {/* Dining Suggestions */}
                        <div className="space-y-3 pt-4 border-t border-earth-border/40">
                          <span className="text-xs font-bold text-earth-accent uppercase tracking-widest flex items-center gap-1">
                            <Coffee className="h-4 w-4 text-earth-accent animate-pulse" /> Suggested Dining Nests
                          </span>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {day.suggestedRestaurants.map((rest, restIdx) => (
                              <div key={restIdx} className="bg-[#EBEBE4]/20 p-3.5 rounded-lg flex items-center justify-between border border-earth-border hover:border-[#D1CFC0] transition-all">
                                <div className="space-y-0.5 text-left">
                                  <h6 className="font-bold text-earth-slate text-xs">{rest.name}</h6>
                                  <p className="text-[10px] text-[#5A5A40] font-semibold">{rest.cuisine}</p>
                                </div>
                                <span className="text-[10px] font-bold text-earth-slate bg-white px-2 py-0.5 rounded border border-earth-border">
                                  Price: {rest.priceRange || "$$"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>

                {/* Travel tips banner */}
                <div id="itinerary-tips-card" className="bg-[#EBEBE4]/30 border border-earth-border rounded-lg p-5 md:p-6 space-y-3 text-earth-slate font-sans text-left">
                  <h4 className="text-sm font-black text-earth-accent uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="h-4.5 w-4.5" /> Voyager Insider Travel Tips
                  </h4>
                  <ul className="space-y-2 text-xs text-[#5A5A40] leading-relaxed font-sans list-disc pl-5">
                    {activeTrip.travelTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>

              </div>
            )
          )}
        </div>

        {/* Right Column: Visual Interactive Interactive Map and Estimates summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-earth-border rounded-lg overflow-hidden shadow-sm space-y-4 p-5 text-left">
            <h4 id="right-column-title" className="text-sm font-black text-earth-accent uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="h-4 w-4 text-earth-accent rotate-45 animate-pulse" /> Destination Exploration Stage
            </h4>
            
            {/* Embedded interactive map component loaded statically or via API key */}
            <div id="dynamic-maps-stage" className="h-72 rounded-lg overflow-hidden border border-earth-border relative bg-[#EBEBE4]/10 flex items-center justify-center">
              <InteractiveMap destinationName={activeTrip ? activeTrip.destination : destination || "Switzerland"} />
            </div>

            {/* If active trip, display the comprehensive calculated cost details right inside sidebar widget */}
            {activeTrip && (
              <div id="estimates-summary-sidebar" className="space-y-4 pt-1 text-earth-slate">
                <div className="flex items-center justify-between border-b border-earth-border pb-3">
                  <div>
                    <h5 className="font-bold text-sm text-earth-slate">Estimated Total Cost</h5>
                    <p className="text-[10px] text-earth-slate/60">Calculated based on {activeTrip.numberOfTravelers} travelers</p>
                  </div>
                  <span className="text-xl font-serif font-extrabold text-earth-accent">${activeTrip.estimatedExpenses.total}</span>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  <div className="flex justify-between items-center text-earth-slate/85 font-sans">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#7A603F" }} /> Transportation</span>
                    <span className="font-bold text-earth-slate">${activeTrip.estimatedExpenses.transportation}</span>
                  </div>
                  <div className="flex justify-between items-center text-earth-slate/85 font-sans">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#8C7A5F" }} /> Accommodation</span>
                    <span className="font-bold text-earth-slate">${activeTrip.estimatedExpenses.accommodation}</span>
                  </div>
                  <div className="flex justify-between items-center text-earth-slate/85 font-sans">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#A09F84" }} /> Food & Dining</span>
                    <span className="font-bold text-earth-slate">${activeTrip.estimatedExpenses.food}</span>
                  </div>
                  <div className="flex justify-between items-center text-earth-slate/85 font-sans">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#B5B39B" }} /> Attractions & Tours</span>
                    <span className="font-bold text-earth-slate">${activeTrip.estimatedExpenses.attractions}</span>
                  </div>
                  <div className="flex justify-between items-center text-earth-slate/85 font-sans">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#D1CFC0" }} /> Miscellaneous</span>
                    <span className="font-bold text-earth-slate">${activeTrip.estimatedExpenses.miscellaneous}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#EBEBE4]/30 border border-earth-border p-5 rounded-lg flex items-start gap-3 text-left">
            <Info className="h-5 w-5 text-earth-accent shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-earth-slate">Need to make revisions?</h5>
              <p className="text-[11px] text-[#5A5A40] leading-relaxed font-sans">
                You can hover over any timeline milestone on the itinerary card to trigger custom task name or description editing instantly.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
