import React, { useState } from "react";
import { 
  Heart, Trash2, MapPin, Coins, Check, CloudSun, Compass, 
  FileText, CheckCircle2, Navigation, Loader, Edit3, Save, MessageSquare, Info
} from "lucide-react";
import { SavedDestination } from "../types";

interface BucketListProps {
  bucketList: SavedDestination[];
  onRemoveItem: (id: string) => void;
  onToggleVisited: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onNavigate: (view: string) => void;
  onSaveToBucket: (dest: { name: string; country: string; imageUrl: string; budget: number }) => void;
}

export default function BucketList({ 
  bucketList, onRemoveItem, onToggleVisited, onUpdateNotes, onNavigate, onSaveToBucket 
}: BucketListProps) {
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");
  const [customName, setCustomName] = useState("");
  const [customCountry, setCustomCountry] = useState("");
  const [customBudget, setCustomBudget] = useState(1000);
  const [addingCustom, setAddingCustom] = useState(false);

  const startEditingNotes = (id: string, notes: string) => {
    setEditingNotesId(id);
    setTempNotes(notes || "");
  };

  const handleNotesSave = (id: string) => {
    onUpdateNotes(id, tempNotes);
    setEditingNotesId(null);
  };

  const handleCustomAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    onSaveToBucket({
      name: customName,
      country: customCountry || "Custom Target",
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
      budget: Number(customBudget) || 1000
    });

    setCustomName("");
    setCustomCountry("");
    setCustomBudget(1000);
    setAddingCustom(false);
  };

  return (
    <div id="bucketlist-view-container" className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn select-none selection:bg-earth-accent/20 selection:text-earth-slate text-earth-slate">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-3xl font-serif font-bold text-earth-slate tracking-tight flex items-center justify-center md:justify-start gap-2">
            <Heart className="h-7 w-7 text-earth-accent fill-earth-accent animate-pulse" /> Travel Bucket List
          </h2>
          <p className="text-earth-accent/70 text-sm">Pin your target travel nests. Log visited milestones, review current forecasts, and record tips</p>
        </div>

        <button
          id="add-custom-destination-btn"
          type="button"
          onClick={() => setAddingCustom(!addingCustom)}
          className="bg-earth-accent hover:bg-earth-accent-hover text-white font-semibold text-xs px-4 py-3 rounded-lg transition-all shadow-sm active:scale-95 flex items-center gap-1.5 w-full md:w-auto justify-center uppercase tracking-wider"
        >
          {addingCustom ? "Close Parameters" : "Pin Custom Destination"}
        </button>
      </div>

      {addingCustom && (
        <form id="custom-destination-form" onSubmit={handleCustomAddSubmit} className="bg-white border border-earth-border p-6 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 animate-slideDown">
          <div className="space-y-1 md:col-span-2 text-left">
            <label className="text-xs font-bold text-earth-accent block">Destination Name 🗺️</label>
            <input
              id="cust-name-input"
              type="text"
              required
              placeholder="e.g. Venice, Italy"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full bg-white border border-earth-border px-4 py-2.5 text-sm rounded-lg focus:border-earth-accent focus:outline-none focus:ring-2 focus:ring-earth-accent/10 font-semibold"
            />
          </div>
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-earth-accent block">Country Name 📍</label>
            <input
              id="cust-country-input"
              type="text"
              placeholder="e.g. Italy"
              value={customCountry}
              onChange={(e) => setCustomCountry(e.target.value)}
              className="w-full bg-white border border-earth-border px-4 py-2.5 text-sm rounded-lg focus:border-earth-accent focus:outline-none focus:ring-2 focus:ring-earth-accent/10 font-semibold"
            />
          </div>
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-earth-accent block">Estimated Budget ($) 🪙</label>
            <input
              id="cust-budget-input"
              type="number"
              min="100"
              placeholder="1000"
              value={customBudget}
              onChange={(e) => setCustomBudget(Math.max(1, Number(e.target.value)))}
              className="w-full bg-white border border-earth-border px-4 py-2.5 text-sm rounded-lg focus:border-earth-accent focus:outline-none focus:ring-2 focus:ring-earth-accent/10 font-semibold text-center"
            />
          </div>
          <div className="md:col-span-4 flex justify-end gap-2">
            <button
              id="cancel-custom-btn"
              type="button"
              onClick={() => setAddingCustom(false)}
              className="px-4 py-2 text-earth-slate/60 text-sm font-semibold hover:text-earth-slate"
            >
              Cancel
            </button>
            <button
              id="save-custom-btn"
              type="submit"
              className="bg-earth-accent hover:bg-earth-accent-hover text-white font-bold text-xs px-5 py-2 rounded-lg shadow-sm"
            >
              Pin to Bucket
            </button>
          </div>
        </form>
      )}

      {/* Bucket List Main grid display cards */}
      {bucketList.length === 0 ? (
        <div id="empty-bucket-card" className="bg-[#EBEBE4]/20 border border-dashed border-earth-border p-12 rounded-lg text-center space-y-4">
          <Heart className="h-12 w-12 text-earth-accent/30 mx-auto" strokeWidth={1.5} />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-earth-slate">Your Bucket List is empty</h4>
            <p className="text-xs text-[#5A5A40] max-w-sm mx-auto leading-relaxed">
              Venture into our Places Explorer to discover incredible spots, food tips, and pin them directly to your personal checklist.
            </p>
          </div>
          <button
            id="bucket-gonav-btn"
            type="button"
            onClick={() => onNavigate("explorer")}
            className="bg-earth-accent hover:bg-earth-accent-hover text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-sm inline-flex items-center gap-1.5 active:scale-95 transition-all uppercase tracking-wider"
          >
            <Compass className="h-4.5 w-4.5" /> Launch places explorer
          </button>
        </div>
      ) : (
        <div id="bucket-list-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bucketList.map((item) => (
            <div 
              key={item.id} 
              id={`bucket-item-${item.id}`}
              className={`bg-white rounded-xl overflow-hidden border transition-all duration-300 flex flex-col justify-between group ${
                item.isVisited
                  ? "border-[#D1CFC0] bg-[#EBEBE4]/30 shadow-sm"
                  : "border-earth-border hover:border-earth-accent shadow-sm"
              }`}
            >
              {/* Top thumbnail */}
              <div className="relative h-40 overflow-hidden bg-earth-bg">
                <img
                  src={item.imageUrl}
                  alt={item.destinationName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                
                {/* State Tag indicators */}
                {item.isVisited && (
                  <span className="absolute top-3 left-3 text-[10px] bg-earth-accent text-white font-bold px-2.5 py-1 rounded shadow-sm flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Checked-In
                  </span>
                )}

                {/* Weather details tag */}
                {item.weatherSummary && (
                  <span className="absolute top-3 right-3 text-[10px] bg-white/95 text-earth-slate font-bold px-2.5 py-1 rounded shadow-sm flex items-center gap-1 backdrop-blur-md border border-earth-border">
                    <CloudSun className="h-3.5 w-3.5 text-earth-accent" /> {item.weatherSummary.temp}°C • {item.weatherSummary.condition}
                  </span>
                )}

                <div className="absolute bottom-3 left-4 text-white text-left font-serif">
                  <p className="text-[10px] text-white/90 flex items-center gap-0.5 font-bold">
                    <MapPin className="h-3 w-3" /> {item.country}
                  </p>
                  <h4 className="text-lg font-bold tracking-tight">{item.destinationName}</h4>
                </div>
              </div>

              {/* Bottom detail action panels */}
              <div className="p-4 space-y-4 flex-grow flex flex-col justify-between">
                
                {/* Budget guide */}
                <div className="flex items-center justify-between text-xs font-sans text-earth-slate/75">
                  <span className="flex items-center gap-1 font-semibold"><Coins className="h-4 w-4 text-[#8C7A5F]" /> Estimated Budget:</span>
                  <span className="font-bold text-earth-slate">${item.estimatedBudget}</span>
                </div>

                {/* Custom notes section */}
                <div className="space-y-1.5 p-3 bg-[#EBEBE4]/30 rounded-lg border border-earth-border flex-grow text-left">
                  <div className="flex items-center justify-between text-[10px] font-bold text-earth-accent uppercase tracking-widest leading-none">
                    <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> Pinned Notes</span>
                    {editingNotesId !== item.id && (
                      <button
                        id={`edit-notes-btn-${item.id}`}
                        type="button"
                        onClick={() => startEditingNotes(item.id, item.notes || "")}
                        className="text-earth-accent hover:text-earth-accent-hover hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {editingNotesId === item.id ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        id={`notes-textarea-${item.id}`}
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Write dynamic advice, dining hours..."
                        rows={2}
                        className="w-full bg-white border border-earth-border rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-earth-accent/20 leading-normal text-earth-slate font-sans"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          id={`save-notes-btn-${item.id}`}
                          type="button"
                          onClick={() => handleNotesSave(item.id)}
                          className="text-[9px] bg-earth-accent text-white font-bold px-2 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          id={`cancel-notes-btn-${item.id}`}
                          type="button"
                          onClick={() => setEditingNotesId(null)}
                          className="text-[9px] text-earth-slate/60 px-2 py-1 rounded hover:bg-[#EBEBE4]/40"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#5A5A40] italic font-sans leading-relaxed pt-0.5">
                      {item.notes || "No custom tips logged yet. Tap edit to log itinerary hints, flight times, or hotel numbers."}
                    </p>
                  )}
                </div>

                {/* Interactive Bottom action buttons matching criteria */}
                <div className="flex items-center justify-between pt-3 border-t border-earth-border/40 gap-1.5">
                  <button
                    id={`toggle-visited-btn-${item.id}`}
                    type="button"
                    onClick={() => onToggleVisited(item.id)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1 border ${
                      item.isVisited
                        ? "bg-[#EBEBE4]/30 text-earth-slate border-earth-border hover:bg-[#EBEBE4]/50"
                        : "bg-earth-accent text-white border-earth-accent hover:bg-earth-accent-hover"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                    {item.isVisited ? "Mark Unvisited" : "Check-In Visited"}
                  </button>

                  <button
                    id={`remove-bucket-btn-${item.id}`}
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 border border-earth-border hover:bg-[#EBEBE4]/30 text-earth-slate/60 hover:text-earth-accent rounded-lg transition-all"
                    title="Remove from Bucket list"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
