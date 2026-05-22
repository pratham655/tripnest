import React, { useState, useEffect } from "react";
import { 
  Search, SlidersHorizontal, MapPin, Compass, Heart, Check, 
  Calendar, Coffee, Sparkles, Navigation, CloudSun, UtensilsCrossed, 
  Smile, Coins, HelpCircle, Loader, Info 
} from "lucide-react";
import { DestinationDetail, WeatherDetails } from "../types";

interface HomeExplorerProps {
  onSaveToBucket: (dest: { name: string; country: string; imageUrl: string; budget: number }) => void;
  savedNames: string[];
  onNavigate: (view: string) => void;
}

const FILTER_TAGS = [
  { label: "All", tag: "" },
  { label: "Beaches 🏖️", tag: "beaches" },
  { label: "Mountains 🏔️", tag: "mountains" },
  { label: "Adventure 🧗", tag: "adventure" },
  { label: "Nature 🌿", tag: "nature" },
  { label: "Historical 🕌", tag: "historical" },
  { label: "Budget-Friendly 🪙", tag: "budget-friendly" },
  { label: "Luxury 💎", tag: "luxury" },
  { label: "Family 👨‍👩‍👧‍👦", tag: "family-friendly" }
];

export default function HomeExplorer({ onSaveToBucket, savedNames, onNavigate }: HomeExplorerProps) {
  const [destinations, setDestinations] = useState<DestinationDetail[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedDest, setSelectedDest] = useState<DestinationDetail | null>(null);
  const [weather, setWeather] = useState<WeatherDetails | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  useEffect(() => {
    fetchDestinations();
  }, [selectedTag, search]);

  useEffect(() => {
    if (selectedDest) {
      fetchWeather(selectedDest.name);
    } else {
      setWeather(null);
    }
  }, [selectedDest]);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      let url = "/api/destinations";
      const params = new URLSearchParams();
      if (selectedTag) params.append("tag", selectedTag);
      if (search) params.append("search", search);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      setDestinations(data);
      if (data.length > 0 && !selectedDest) {
        setSelectedDest(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (cityName: string) => {
    setWeatherLoading(true);
    try {
      const res = await fetch(`/api/weather?q=${encodeURIComponent(cityName)}`);
      const data = await res.json();
      setWeather(data);
    } catch (e) {
      console.error(e);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleSaveBucket = (dest: DestinationDetail) => {
    onSaveToBucket({
      name: dest.name,
      country: dest.country,
      imageUrl: dest.imageUrl,
      budget: dest.averageTripCost.moderate
    });
    setSavedSuccessId(dest.id);
    setTimeout(() => {
      setSavedSuccessId(null);
    }, 2000);
  };

  return (
    <div id="explorer-view-container" className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn select-none selection:bg-earth-accent/20 selection:text-earth-slate text-earth-slate">
      {/* Header section with Search bar and title */}
      <div id="explorer-header" className="space-y-4 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-serif font-bold text-earth-slate tracking-tight flex items-center justify-center md:justify-start gap-2">
              <Compass className="h-7 w-7 text-earth-accent" /> Explore Global Destinations
            </h2>
            <p className="text-earth-accent/70 text-sm">Discover beautiful places, local culinary tastes, and forecast-ready recommendations</p>
          </div>

          <div className="flex shrink-0 gap-2 w-full md:w-auto">
            <button
              id="plan-trip-nav-btn"
              type="button"
              onClick={() => onNavigate("planner")}
              className="flex-1 md:flex-initial bg-earth-accent text-white font-semibold text-sm px-5 py-3 rounded-lg transition-all flex items-center justify-center gap-2 hover:bg-earth-accent-hover shadow-sm"
            >
              <Sparkles className="h-4.5 w-4.5" /> Launch AI Travel Planner
            </button>
          </div>
        </div>

        {/* Dynamic Filters & Search Input bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-2">
          {/* Search wrapper */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-earth-accent/60" />
            <input
              id="explorer-search-input"
              type="text"
              placeholder="Search by city, country or descriptive keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white rounded-lg border border-earth-border focus:border-earth-accent focus:outline-none focus:ring-2 focus:ring-earth-accent/10 text-sm font-sans text-earth-slate transition-all shadow-sm placeholder:text-earth-accent/40"
            />
          </div>

          {/* Filter pills list */}
          <div className="flex items-center gap-2 overflow-x-auto w-full no-scrollbar pb-1 pt-1">
            <SlidersHorizontal className="h-4 w-4 text-earth-accent/60 shrink-0 hidden md:block" />
            {FILTER_TAGS.map((pill) => (
              <button
                key={pill.tag}
                id={`filter-pill-${pill.tag || "all"}`}
                type="button"
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                  (selectedTag === pill.tag)
                    ? "bg-earth-accent text-white shadow-sm"
                    : "bg-white text-earth-slate border border-earth-border hover:bg-[#EBEBE4]/30"
                }`}
                onClick={() => setSelectedTag(pill.tag)}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Explorer splits: Left Cards Grid | Right Immersive Detail Slider */}
      <div id="explorer-splits-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Destinations List Column (8 of 12) */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader className="h-10 w-10 text-teal-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-500">Searching beautiful nests...</p>
            </div>
          ) : destinations.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 rounded-3xl text-center space-y-4 text-slate-500">
              <Compass className="h-12 w-12 text-slate-400 mx-auto" />
              <div>
                <p className="text-base font-bold text-slate-700">No destinations match your filters</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">Try resetting your tag selection or search query to find inspiring travel ideas.</p>
              </div>
              <button
                id="reset-explorer-filters"
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedTag("");
                }}
                className="bg-white border text-sm px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-bold shadow-sm"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div id="destination-card-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {destinations.map((dest) => {
                const isSelected = selectedDest?.id === dest.id;
                const isSaved = savedNames.includes(dest.name);

                return (
                  <div
                    key={dest.id}
                    id={`dest-card-${dest.id}`}
                    onClick={() => setSelectedDest(dest)}
                    className={`bg-white rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                      isSelected 
                        ? "border-earth-accent ring-2 ring-earth-accent/10 shadow-sm"
                        : "border-earth-border shadow-sm hover:border-earth-accent"
                    }`}
                  >
                    {/* Top image panel */}
                    <div className="relative h-44 overflow-hidden bg-earth-bg">
                      <img
                        src={dest.imageUrl}
                        alt={dest.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                      
                      {/* Name/country overlay */}
                      <div className="absolute bottom-3 left-4 text-white text-left">
                        <p className="text-xs text-white/90 flex items-center gap-0.5 font-semibold">
                          <MapPin className="h-3 w-3" /> {dest.country}
                        </p>
                        <h4 className="text-xl font-serif font-bold tracking-tight">{dest.name}</h4>
                      </div>

                      {/* Best Season absolute indicator */}
                      <span className="absolute top-3 right-3 text-[10px] bg-white/90 font-bold text-earth-slate px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1 shadow-sm border border-earth-border">
                        <Calendar className="h-3 w-3 text-earth-accent" /> {dest.bestTimeToVisit.split(" (")[0]}
                      </span>
                    </div>

                    {/* Bottom description and info panel */}
                    <div className="p-4 space-y-4 flex-1 flex flex-col justify-between text-left">
                      <p className="text-xs text-[#5A5A40] line-clamp-2 leading-relaxed">
                        {dest.description}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {dest.tags.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="text-[10px] bg-[#EBEBE4]/30 text-earth-slate px-2 py-0.5 rounded border border-earth-border/40 font-sans">
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Quick cost footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-earth-border/40">
                        <div>
                          <p className="text-[10px] text-[#5A5A40]/60 font-semibold uppercase tracking-wider">Estimated Moderate</p>
                          <p className="text-base font-bold text-earth-accent">${dest.averageTripCost.moderate} <span className="text-[10px] text-earth-accent/40 font-normal">/ trip</span></p>
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            id={`save-bucket-${dest.id}-btn`}
                            type="button"
                            disabled={isSaved}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveBucket(dest);
                            }}
                            className={`p-2 rounded-lg transition-all ${
                              isSaved
                                ? "bg-[#EBEBE4]/60 text-earth-accent border border-earth-border"
                                : "bg-white hover:bg-[#EBEBE4]/30 text-earth-accent/60 border border-earth-border"
                            }`}
                            title={isSaved ? "Saved in Bucket List" : "Pin to Dream Bucket"}
                          >
                            {isSaved ? <Check className="h-4.5 w-4.5" /> : <Heart className="h-4.5 w-4.5 fill-current" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Destination Immersive Drawer Detail Panel (5 of 12) */}
        <div className="lg:col-span-5">
          {selectedDest ? (
            <div id="explorer-detail-card" className="bg-white border border-earth-border rounded-xl p-5 shadow-sm space-y-6 sticky top-6">
              
              {/* Detailed Visual header */}
              <div className="relative h-48 rounded-lg overflow-hidden bg-earth-bg shadow-sm">
                <img
                  src={selectedDest.imageUrl}
                  alt={selectedDest.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white text-left font-serif">
                  <span className="text-[10px] font-bold tracking-widest uppercase bg-earth-accent text-white px-2.5 py-0.5 rounded">
                    {selectedDest.country}
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight mt-1">{selectedDest.name}</h3>
                </div>

                <button
                  id="detail-direction-overlay"
                  type="button"
                  onClick={() => {
                    // Pre-fill fields and send to visual map explore
                    localStorage.setItem("active_map_dest", JSON.stringify(selectedDest));
                    onNavigate("planner");
                  }}
                  className="absolute top-4 right-4 bg-white/95 text-earth-slate p-2.5 rounded-full hover:bg-[#EBEBE4] shadow-sm font-sans hover:scale-105 transition-all text-xs"
                  title="Plan directly with AI"
                >
                  <Navigation className="h-4.5 w-4.5 text-earth-accent rotate-45" />
                </button>
              </div>

              {/* Quick dynamic weather report block */}
              <div id="detail-weather-block" className="bg-[#EBEBE4]/40 rounded-xl p-4 border border-earth-border/40 text-left">
                {weatherLoading ? (
                  <div className="flex items-center gap-3 py-2">
                    <Loader className="h-4.5 w-4.5 text-earth-accent animate-spin" />
                    <span className="text-xs text-earth-slate font-semibold font-sans">Getting latest forecast updates...</span>
                  </div>
                ) : weather ? (
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <CloudSun className="h-5 w-5 text-earth-accent" />
                        <span className="text-sm font-bold text-earth-slate">{weather.currentTemp}°C</span>
                        <span className="text-xs text-earth-accent/80">• {weather.condition}</span>
                      </div>
                      <p className="text-[11px] text-[#5A5A40] leading-relaxed font-sans mt-1">
                        <span className="font-semibold text-earth-accent">Nest Advisory:</span> {weather.travelRecommendation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-earth-accent/60">Weather simulation offline. Check key.</div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5 text-left">
                <span className="text-xs font-bold text-earth-accent/80 uppercase tracking-widest flex items-center gap-1">
                  <Info className="h-4 w-4" /> About Destination
                </span>
                <p className="text-xs text-[#5A5A40] leading-relaxed font-sans text-justify">
                  {selectedDest.description}
                </p>
              </div>

              {/* Splits: Best Season & Costs */}
              <div className="grid grid-cols-2 gap-4 pb-2 border-b border-earth-border text-left">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-earth-accent/70 uppercase tracking-widest block">Best Time</span>
                  <p className="text-xs font-semibold text-earth-slate">{selectedDest.bestTimeToVisit}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-earth-accent/70 uppercase tracking-widest block">Average Cost</span>
                  <p className="text-xs font-bold text-earth-accent">${selectedDest.averageTripCost.budget} ~ ${selectedDest.averageTripCost.luxury}</p>
                </div>
              </div>

              {/* Attractions & activities block */}
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-earth-accent/80 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-[#8C7A5F]" /> Top Attractions
                  </span>
                  <ul className="space-y-1 text-xs text-[#5A5A40] font-sans">
                    {selectedDest.topAttractions.map((attr, i) => (
                      <li key={i} className="flex items-center gap-1.5 leading-tight">
                        <span className="h-1.5 w-1.5 bg-earth-accent rounded-full shrink-0" />
                        <span>{attr}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-earth-accent/80 uppercase tracking-widest flex items-center gap-1">
                    <UtensilsCrossed className="h-3.5 w-3.5 text-earth-accent" /> Local Cuisine
                  </span>
                  <ul className="space-y-1 text-xs text-[#5A5A40] font-sans">
                    {selectedDest.localFood.map((food, i) => (
                      <li key={i} className="flex items-center gap-1.5 leading-tight">
                        <span className="h-1.5 w-1.5 bg-[#8C7A5F] rounded-full shrink-0" />
                        <span>{food}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Activities */}
              <div className="space-y-2 pt-2 border-t border-earth-border text-left">
                <span className="text-xs font-bold text-earth-accent/80 uppercase tracking-widest block">Popular Activities</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDest.popularActivities.map((act, i) => (
                    <span key={i} className="text-[10px] bg-[#EBEBE4]/40 text-earth-slate font-semibold px-2.5 py-1 rounded border border-earth-border">
                      {act}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Interactive Button to save directly or plan */}
              <div className="flex gap-3 pt-2">
                <button
                  id="selected-plan-gonav-btn"
                  type="button"
                  onClick={() => {
                    localStorage.setItem("planner_prefill_destination", selectedDest.name);
                    onNavigate("planner");
                  }}
                  className="flex-1 bg-earth-accent hover:bg-earth-accent-hover text-white font-bold text-xs py-3 rounded-lg transition-all shadow-sm active:scale-95 text-center uppercase tracking-wider"
                >
                  Create Trip to {selectedDest.name}
                </button>
                <button
                  id="selected-bucket-save-btn"
                  type="button"
                  onClick={() => handleSaveBucket(selectedDest)}
                  disabled={savedNames.includes(selectedDest.name)}
                  className={`px-4 py-3 border rounded-lg transition-all active:scale-95 ${
                    savedNames.includes(selectedDest.name)
                      ? "bg-[#EBEBE4]/30 text-earth-accent/40 border-earth-border cursor-not-allowed"
                      : "bg-white hover:bg-[#EBEBE4]/30 border-earth-border text-earth-accent"
                  }`}
                  title="Add to wishlist"
                >
                  <Heart className="h-5 w-5 fill-current" />
                </button>
              </div>
              
            </div>
          ) : (
            <div className="bg-[#EBEBE4]/20 border border-dashed border-earth-border p-8 rounded-xl text-center space-y-4 shadow-sm text-earth-accent/60 py-24">
              <Compass className="h-10 w-10 text-earth-accent/30 mx-auto" />
              <div>
                <p className="text-sm font-bold text-earth-slate">Select a Destination</p>
                <p className="text-xs text-earth-accent/70 max-w-[200px] mx-auto mt-1">Click any card on the left to see weather, attractions, local tastes, and budget guides.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
