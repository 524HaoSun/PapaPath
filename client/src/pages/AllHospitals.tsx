/**
 * AllHospitals — Full hospital list with search, filter, sort
 * Layout: Warm Cockpit (SidebarNav + Header + BottomNav)
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ChevronLeft, Search, X, MapPin, Star, Heart, SlidersHorizontal } from "lucide-react";
import { useCare } from "@/contexts/CareContext";
import SidebarNav from "@/components/SidebarNav";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const filterTags = ["All", "Maternity", "24h", "OB/GYN", "Emergency", "NICU", "Lab"];
const sortOptions = ["Nearest", "Highest Rated", "Most Reviews"];

export default function AllHospitals() {
  const [, navigate] = useLocation();
  const { hospitals, toggleHospitalFavorite } = useCare();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Nearest");
  const [showSort, setShowSort] = useState(false);

  const filtered = hospitals
    .filter((h) => {
      const matchSearch = !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.type.toLowerCase().includes(search.toLowerCase());
      const matchTag = activeFilter === "All" || h.tags.includes(activeFilter);
      return matchSearch && matchTag;
    })
    .sort((a, b) => {
      if (sortBy === "Nearest") return a.distanceKm - b.distanceKm;
      if (sortBy === "Highest Rated") return b.rating - a.rating;
      return b.reviews - a.reviews;
    });

  const colorMap: Record<string, { bg: string; text: string }> = {
    blue:    { bg: "bg-blue-100",    text: "text-blue-700" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-700" },
    violet:  { bg: "bg-violet-100",  text: "text-violet-700" },
    rose:    { bg: "bg-rose-100",    text: "text-rose-700" },
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "oklch(0.97 0.015 80)",
        backgroundImage:
          "radial-gradient(circle at 20% 20%, oklch(0.94 0.03 188 / 0.12) 0%, transparent 50%), radial-gradient(circle at 80% 80%, oklch(0.95 0.04 80 / 0.15) 0%, transparent 50%)",
      }}
    >
      <div className="flex min-h-screen">
        <SidebarNav />
        <main className="flex-1 flex flex-col min-w-0">
          <Header className="lg:border-b lg:px-6 lg:py-4" />
          <div className="flex-1 overflow-y-auto pb-20 lg:pb-8" style={{ scrollbarWidth: "thin" }}>
            {/* Page header */}
            <div className="px-4 pt-4 pb-2 lg:px-6 lg:pt-5">
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => navigate("/care")}
                  className="w-9 h-9 rounded-xl flex items-center justify-center press-feedback"
                  style={{ background: "oklch(0.92 0.02 80)" }}
                >
                  <ChevronLeft size={20} style={{ color: "oklch(0.35 0.04 240)" }} />
                </button>
                <h2
                  className="text-xl font-bold flex-1"
                  style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}
                >
                  Nearby Hospitals
                </h2>
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center press-feedback"
                  style={{ background: "oklch(0.92 0.02 80)" }}
                >
                  <SlidersHorizontal size={17} style={{ color: "oklch(0.35 0.04 240)" }} />
                </button>
              </div>
              {/* Search */}
              <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "oklch(0.92 0.02 80)" }}>
                <Search size={15} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search hospitals…"
                  className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-slate-400"
                  style={{ color: "oklch(0.22 0.04 240)" }}
                />
                {search && <button onClick={() => setSearch("")}><X size={14} className="text-slate-400" /></button>}
              </div>
              {showSort && (
                <div className="mt-2 flex gap-2">
                  {sortOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSortBy(s); setShowSort(false); }}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-xl press-feedback transition-colors"
                      style={
                        sortBy === s
                          ? { background: "oklch(0.52 0.09 188)", color: "white" }
                          : { background: "oklch(0.92 0.02 80)", color: "oklch(0.35 0.04 240)" }
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 px-4 py-2 overflow-x-auto lg:px-6" style={{ scrollbarWidth: "none" }}>
              {filterTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(tag)}
                  className="flex-shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-full press-feedback transition-colors"
                  style={
                    activeFilter === tag
                      ? { background: "oklch(0.52 0.09 188)", color: "white" }
                      : { background: "white", color: "oklch(0.35 0.04 240)", border: "1px solid oklch(0.88 0.02 80)" }
                  }
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Hospital list */}
            <div className="px-4 pb-6 space-y-3 lg:px-6">
              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="text-4xl">🏥</span>
                  <p className="text-[14px] mt-3" style={{ color: "oklch(0.52 0.03 240)" }}>No hospitals match your search</p>
                  <button
                    onClick={() => { setSearch(""); setActiveFilter("All"); }}
                    className="mt-2 font-semibold text-[13px] press-feedback"
                    style={{ color: "oklch(0.52 0.09 188)" }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filtered.map((h) => {
                  const tagC = colorMap[h.color] ?? colorMap.blue;
                  return (
                    <button
                      key={h.id}
                      onClick={() => navigate(`/care/hospital/${h.id}`)}
                      className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 press-feedback text-left flex"
                    >
                      <div className="w-28 h-28 flex-shrink-0 overflow-hidden">
                        <img src={h.image} alt={h.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 p-3 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className="text-[14px] font-bold leading-tight"
                            style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}
                          >
                            {h.name}
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleHospitalFavorite(h.id); toast.success(h.isFavorite ? "Removed from favorites" : "Saved!"); }}
                            className="flex-shrink-0"
                          >
                            <Heart size={15} className={h.isFavorite ? "text-red-500 fill-red-500" : "text-slate-300"} />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{h.type}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex items-center gap-0.5">
                            <Star size={11} className="text-amber-400 fill-amber-400" />
                            <span className="text-[12px] font-semibold text-slate-700">{h.rating}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <MapPin size={10} style={{ color: "oklch(0.52 0.09 188)" }} />
                            <span className="text-[11px] text-slate-500">{h.distance}</span>
                          </div>
                          <span className="text-[11px] text-slate-400">· {h.waitTime}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {h.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tagC.bg} ${tagC.text}`}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
