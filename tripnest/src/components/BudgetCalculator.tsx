import React, { useState, useEffect } from "react";
import { 
  Calculator, Coins, Info, Check, ShieldAlert, 
  MapPin, Calendar, HelpCircle, Loader, Navigation, ArrowRight,
  TrendingDown, DollarSign, Wallet
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from "recharts";

interface BudgetCalculatorProps {
  onNavigate: (view: string) => void;
}

export default function BudgetCalculator({ onNavigate }: BudgetCalculatorProps) {
  const [destination, setDestination] = useState("Bali");
  const [numberOfDays, setNumberOfDays] = useState(5);
  const [numberOfTravelers, setNumberOfTravelers] = useState(2);
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [activeTier, setActiveTier] = useState<"budget" | "moderate" | "luxury">("moderate");

  useEffect(() => {
    handleCalculate();
  }, []);

  const handleCalculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCalculating(true);
    try {
      const res = await fetch("/api/budget/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          numberOfDays,
          numberOfTravelers
        })
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  const COLORS = ["#7A603F", "#8C7A5F", "#A09F84", "#B5B39B", "#D1CFC0"];

  const getPieData = () => {
    if (!results) return [];
    const calc = results.calculations[activeTier];
    return [
      { name: "Transit", value: calc.transportation },
      { name: "Lodging", value: calc.accommodation },
      { name: "Food & Dining", value: calc.food },
      { name: "Attractions", value: calc.attractions },
      { name: "Miscellaneous", value: calc.miscellaneous }
    ];
  };

  const getBarData = () => {
    if (!results) return [];
    const calcs = results.calculations;
    return [
      { name: "Value Tier ($)", cost: calcs.budget.total },
      { name: "Moderate Tier ($$)", cost: calcs.moderate.total },
      { name: "Luxury Tier ($$$)", cost: calcs.luxury.total }
    ];
  };

  return (
    <div id="budget-calculator-view" className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn select-none selection:bg-earth-accent/20 selection:text-earth-slate text-earth-slate">
      {/* Visual heading */}
      <div className="space-y-1 text-center md:text-left">
        <h2 className="text-3xl font-serif font-bold text-earth-slate tracking-tight flex items-center justify-center md:justify-start gap-2">
          <Calculator className="h-7 w-7 text-earth-accent" /> Travel Budget Calculator
        </h2>
        <p className="text-earth-accent/70 text-sm">Empower decisions by estimating core expenses across multiple travel tiers dynamically</p>
      </div>

      {/* Calculator main divide: Left Parameter inputs | Right Recharts visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Input form (4 of 12) */}
        <div className="lg:col-span-4 bg-white border border-earth-border p-6 rounded-xl shadow-sm space-y-5">
          <form id="calc-form" onSubmit={handleCalculate} className="space-y-4">
            
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-earth-accent block">Target City/Region 🗺️</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-earth-accent/60" />
                <input
                  id="calc-dest-input"
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Kyoto, Japan"
                  className="w-full pl-11 pr-4 py-2 bg-white border border-earth-border focus:border-earth-accent focus:outline-none focus:ring-2 focus:ring-earth-accent/10 text-sm rounded-lg font-sans text-earth-slate transition-all font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-earth-accent block">Duration (Days) 📅</label>
                <input
                  id="calc-days-input"
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={numberOfDays}
                  onChange={(e) => setNumberOfDays(Math.max(1, Math.min(30, Number(e.target.value))))}
                  className="w-full bg-white border border-earth-border px-4 py-2 text-sm rounded-lg focus:border-earth-accent focus:outline-none text-center font-bold text-earth-slate"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-earth-accent block">Travelers 🧑‍🤝‍🧑</label>
                <input
                  id="calc-travelers-input"
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={numberOfTravelers}
                  onChange={(e) => setNumberOfTravelers(Math.max(1, Math.min(20, Number(e.target.value))))}
                  className="w-full bg-white border border-earth-border px-4 py-2 text-sm rounded-lg focus:border-earth-accent focus:outline-none text-center font-bold text-earth-slate"
                />
              </div>
            </div>

            <button
              id="calc-submit-btn"
              type="submit"
              disabled={calculating}
              className="w-full bg-earth-accent hover:bg-earth-accent-hover text-white font-bold py-2.5 rounded-lg text-sm transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 uppercase tracking-wider"
            >
              {calculating ? <Loader className="h-4.5 w-4.5 animate-spin" /> : <Calculator className="h-4.5 w-4.5" />}
              {calculating ? "Calculating Estimations..." : "Estimate Travel Cost"}
            </button>
            
          </form>

          {/* Quick tips about estimations */}
          <div className="bg-[#EBEBE4]/30 border border-earth-border p-4 rounded-lg flex items-start gap-2.5 text-left">
            <Info className="h-4.5 w-4.5 text-earth-accent shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[#5A5A40]">
              <p className="text-[11px] font-bold text-earth-slate font-sans">Estimation Standard Info</p>
              <p className="text-[10px] leading-relaxed font-sans">
                These calculations incorporate historical flight variables, seasonal hotel rates, and localized dinner averages. Values scale non-linearly for longer stays.
              </p>
            </div>
          </div>
          
        </div>

        {/* Right Output reports and charts (8 of 12) */}
        <div className="lg:col-span-8 space-y-6">
          {calculating ? (
            <div id="recharts-loading-card" className="bg-white border border-earth-border rounded-xl p-16 text-center space-y-4 shadow-sm animate-pulse">
              <Coins className="h-10 w-10 text-earth-accent animate-bounce mx-auto" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-earth-slate font-sans">Gathering localized hotel & transit averages...</p>
            </div>
          ) : results ? (
            <div id="calculator-results-grid" className="space-y-6">
              
              {/* Dynamic Budget Tiers tabs */}
              <div id="tier-selector-scroller" className="flex bg-[#EBEBE4]/40 p-1 rounded-lg border border-earth-border max-w-md">
                {(["budget", "moderate", "luxury"] as const).map((tier) => (
                  <button
                    key={tier}
                    id={`budget-tier-pill-${tier}`}
                    type="button"
                    onClick={() => setActiveTier(tier)}
                    className={`flex-1 py-2 rounded-md text-xs font-bold leading-none tracking-wide text-center uppercase transition-all whitespace-nowrap ${
                      activeTier === tier
                        ? "bg-earth-accent text-white shadow-sm"
                        : "text-earth-slate/60 hover:text-earth-slate"
                    }`}
                  >
                    {tier === "budget" ? "Value Tier" : tier === "moderate" ? "Moderate" : "Luxury"}
                  </button>
                ))}
              </div>

              {/* Cost summary widgets */}
              <div id="cost-split-panels" className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                
                <div id="cost-panel-total" className="bg-white border border-earth-border p-5 rounded-lg shadow-sm text-center space-y-1">
                  <p className="text-[10px] text-earth-accent font-bold uppercase tracking-wider">Total Calculated Cost</p>
                  <p className="text-3xl font-serif font-black text-earth-slate">${results.calculations[activeTier].total.toLocaleString()}</p>
                  <p className="text-[10px] text-earth-slate/60 font-semibold font-sans">For {results.days} Days • {results.travelers} Travel guests</p>
                </div>

                <div id="cost-panel-daily" className="bg-white border border-earth-border p-5 rounded-lg shadow-sm text-center space-y-1">
                  <p className="text-[10px] text-earth-accent font-bold uppercase tracking-wider">Estimated Allocation / Day</p>
                  <p className="text-3xl font-serif font-black text-earth-accent">
                    ${Math.round(results.calculations[activeTier].total / results.days).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-earth-slate/60 font-semibold font-sans">Optimized daily target spending</p>
                </div>

                <div id="cost-panel-person" className="bg-white border border-earth-border p-5 rounded-lg shadow-sm text-center space-y-1">
                  <p className="text-[10px] text-earth-accent font-bold uppercase tracking-wider">Estimated / Traveler</p>
                  <p className="text-3xl font-serif font-black text-[#8C7A5F]">
                    ${Math.round(results.calculations[activeTier].total / results.travelers).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-earth-slate/60 font-semibold font-sans">Individual cost breakdown ratio</p>
                </div>
                
              </div>

              {/* Recharts visual charts panels */}
              <div id="budget-charts-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Pie Chart: Allocation breakdown */}
                <div className="bg-white border border-earth-border p-5 rounded-lg shadow-sm space-y-3">
                  <h4 className="text-xs font-black text-earth-accent uppercase tracking-wider text-left">How is your money spent?</h4>
                  <div className="h-60 relative flex items-center justify-center font-sans text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getPieData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {getPieData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${value}`, "Cost"]} />
                        <Legend wrapperStyle={{ fontSize: 10, fontFamily: "sans-serif" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart: Side-by-side tier comparison */}
                <div className="bg-white border border-earth-border p-5 rounded-lg shadow-sm space-y-3 font-sans">
                  <h4 className="text-xs font-black text-earth-accent uppercase tracking-wider font-sans text-left">Spend Tier Comparative Chart</h4>
                  
                  <div className="h-60 font-sans text-[10px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getBarData()} margin={{ top: 20, right: 10, left: -15, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#8C7A5F" fontSize={9} />
                        <YAxis stroke="#8C7A5F" fontSize={9} />
                        <Tooltip formatter={(value) => [`$${value}`, "Total Expense"]} />
                        <Bar dataKey="cost" fill="#A09F84" radius={[4, 4, 0, 0]}>
                          {getBarData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === (activeTier === "budget" ? 0 : activeTier === "moderate" ? 1 : 2) ? "#7A603F" : "#D1CFC0"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Dynamic budget recommendations section */}
              <div id="budget-recommendation-tips" className="bg-[#EBEBE4]/40 border border-earth-border rounded-lg p-5 space-y-3 text-earth-slate font-sans text-left">
                <h4 className="text-sm font-black text-earth-accent uppercase tracking-widest flex items-center gap-1">
                  <Wallet className="h-4.5 w-4.5" /> Core Saving Tips For Selected Tier
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1 font-sans">
                    <p className="font-bold text-earth-slate font-sans">Accommodation optimization:</p>
                    <p className="text-[#5A5A40] font-sans leading-relaxed">
                      {activeTier === "budget" 
                        ? "Opt for verified hostel rooms or shared rental spaces. Focus on staying close to public train terminals."
                        : activeTier === "moderate"
                          ? "Leverage 3-star boutique hotels. Booking 45 days in advance typically secures a 15-20% discount."
                          : "Consider luxurious private villas or 5-star resorts. Check for included loyalty perks like complimentary breakfasts and airport pickups."}
                    </p>
                  </div>
                  <div className="space-y-1 font-sans">
                    <p className="font-bold text-earth-slate font-sans">Food & Activities saver:</p>
                    <p className="text-[#5A5A40] font-sans leading-relaxed">
                      {activeTier === "budget"
                        ? "Substitute dinner dining with bustling street vendor markets. Most museum parks are free on public Wednesdays!"
                        : activeTier === "moderate"
                          ? "Alternate between bistro dinners and casual cafes. Utilize multi-attraction city explorer passes."
                          : "Explore premium private food tours. Engage a dedicated personal guide for high-value priority sightseeing spots."}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div id="results-empty-card" className="bg-[#EBEBE4]/20 border border-dashed border-earth-border rounded-xl p-24 text-center text-earth-accent/60 space-y-3">
              <Calculator className="h-10 w-10 text-earth-accent/30 mx-auto animate-bounce" />
              <p className="text-sm font-bold text-earth-slate">Calculate Travel estimates</p>
              <p className="text-xs text-earth-accent/70 max-w-xs mx-auto">Fill target destination, duration, and guest statistics on the left panel to trigger costs comparisons.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
