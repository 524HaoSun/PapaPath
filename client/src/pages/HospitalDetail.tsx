/**
 * HospitalDetail — Hospital detail with map, call, favorite, navigate
 * Design: Friendly Companion — Nunito + Inter, blue brand
 */
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import {
  ChevronLeft, MapPin, Phone, Clock, Star, Navigation,
  Heart, ChevronRight, Share2, Info, Building2,
  CheckCircle, Calendar, Bookmark
} from "lucide-react";
import { useCare } from "@/contexts/CareContext";
import { MapView } from "@/components/Map";
import SidebarNav from "@/components/SidebarNav";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function HospitalDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { hospitals, toggleHospitalFavorite, addAppointment } = useCare();
  const hospital = hospitals.find((h) => h.id === Number(id)) ?? hospitals[0];

  const [activeTab, setActiveTab] = useState<"info" | "map" | "reviews">("info");
  const [showBooking, setShowBooking] = useState(false);

  const colorMap: Record<string, { bg: string; text: string }> = {
    blue:    { bg: "bg-blue-100",    text: "text-blue-700" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-700" },
    violet:  { bg: "bg-violet-100",  text: "text-violet-700" },
    rose:    { bg: "bg-rose-100",    text: "text-rose-700" },
  };
  const tagColor = colorMap[hospital.color] ?? colorMap.blue;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: hospital.name, text: `${hospital.name} — ${hospital.address}`, url: window.location.href })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`${hospital.name} — ${hospital.address}`);
      toast.success("Hospital info copied to clipboard");
    }
  };

  const handleBookAppointment = () => {
    addAppointment({
      title: `Consultation at ${hospital.name}`,
      doctor: "Dr. (To be assigned)",
      specialty: hospital.type,
      hospital: hospital.name,
      address: hospital.address,
      date: "Jun 30, 2026",
      dateISO: "2026-06-30",
      time: "10:00 AM",
      duration: "30 min",
      type: "consultation",
      status: "pending",
      notes: "",
      checklist: [{ item: "Bring insurance card", done: false }],
      reminder: "1 day before",
      color: hospital.color,
    });
    toast.success(`Appointment request sent to ${hospital.name}!`);
    setShowBooking(false);
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
      {/* Hero */}
      <div className="relative h-52 overflow-hidden">
        <img src={hospital.image} alt={hospital.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={() => navigate("/care")}
          className="absolute top-4 left-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center press-feedback shadow"
        >
          <ChevronLeft size={20} className="text-slate-700" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => { toggleHospitalFavorite(hospital.id); toast.success(hospital.isFavorite ? "Removed from favorites" : "Saved to favorites"); }}
            className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center press-feedback shadow"
          >
            <Heart size={18} className={hospital.isFavorite ? "text-red-500 fill-red-500" : "text-slate-600"} />
          </button>
          <button
            onClick={handleShare}
            className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center press-feedback shadow"
          >
            <Share2 size={17} className="text-slate-700" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-[20px] font-black text-white leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>{hospital.name}</p>
          <p className="text-[13px] text-white/80 mt-0.5">{hospital.type}</p>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="flex items-center gap-0 bg-white border-b border-slate-100 divide-x divide-slate-100">
        {[
          { icon: Star, value: `${hospital.rating}`, sub: `${hospital.reviews} reviews`, color: "text-amber-500" },
          { icon: MapPin, value: hospital.distance, sub: "away", color: "text-blue-500" },
          { icon: Clock, value: hospital.waitTime, sub: "avg wait", color: "text-emerald-500" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="flex-1 flex flex-col items-center py-3 gap-0.5">
              <Icon size={16} className={`${s.color} ${i === 0 ? "fill-amber-400" : ""}`} />
              <span className="text-[13px] font-bold text-slate-800">{s.value}</span>
              <span className="text-[10px] text-slate-400">{s.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-100 px-4 gap-4">
        {(["info", "map", "reviews"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-[13px] font-semibold capitalize border-b-2 transition-colors press-feedback ${
              activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"
            }`}
          >
            {tab === "info" ? "Info" : tab === "map" ? "Map" : "Reviews"}
          </button>
        ))}
      </div>

      <div className="pb-28">
        {/* ── Info Tab ── */}
        {activeTab === "info" && (
          <div className="p-4 space-y-4">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {hospital.tags.map((tag) => (
                <span key={tag} className={`text-[12px] font-semibold px-3 py-1 rounded-full ${tagColor.bg} ${tagColor.text}`}>
                  {tag}
                </span>
              ))}
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Info size={15} className="text-blue-500" />
                <p className="text-[14px] font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', serif" }}>About</p>
              </div>
              <p className="text-[13px] text-slate-600 leading-relaxed">{hospital.description}</p>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
              <p className="text-[14px] font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', serif" }}>Contact & Hours</p>
              {[
                { icon: Phone,    label: "Phone",   value: hospital.phone },
                { icon: MapPin,   label: "Address", value: hospital.address },
                { icon: Clock,    label: "Hours",   value: hospital.hours },
              ].map(({ icon: Icon, label, value }) => (
                <button
                  key={label}
                  onClick={() => {
                    if (label === "Phone") { toast.success(`Calling ${hospital.name}…`); }
                    else if (label === "Address") { toast.info("Opening maps…"); }
                    else { toast.info(value); }
                  }}
                  className="w-full flex items-center gap-3 press-feedback"
                >
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-blue-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[11px] text-slate-400">{label}</p>
                    <p className="text-[13px] font-semibold text-slate-800">{value}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                </button>
              ))}
            </div>

            {/* Departments */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <p className="text-[14px] font-bold text-slate-800 mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>Departments</p>
              <div className="space-y-0">
                {hospital.departments.map((dept) => (
                  <div
                    key={dept}
                    className="w-full flex items-center gap-2 py-2.5 border-b border-slate-50 last:border-0"
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                    <span className="text-[13px] text-slate-700">{dept}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-2xl p-4 text-center">
                <p className="text-[28px] font-black text-blue-600" style={{ fontFamily: "'DM Serif Display', serif" }}>{hospital.beds}</p>
                <p className="text-[12px] text-slate-600">Total Beds</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                <p className="text-[22px] font-black text-emerald-600" style={{ fontFamily: "'DM Serif Display', serif" }}>{hospital.waitTime}</p>
                <p className="text-[12px] text-slate-600">Avg Wait Time</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Map Tab ── */}
        {activeTab === "map" && (
          <div className="h-[400px] relative">
            <MapView
              onMapReady={(map) => {
                const marker = new google.maps.Marker({
                  position: { lat: hospital.lat, lng: hospital.lng },
                  map,
                  title: hospital.name,
                  animation: google.maps.Animation.DROP,
                });
                const infoWindow = new google.maps.InfoWindow({
                  content: `<div style="font-family:Nunito,sans-serif;padding:4px"><strong>${hospital.name}</strong><br/><span style="font-size:12px;color:#64748b">${hospital.address}</span></div>`,
                });
                marker.addListener("click", () => infoWindow.open(map, marker));
                infoWindow.open(map, marker);
                map.setCenter({ lat: hospital.lat, lng: hospital.lng });
                map.setZoom(15);
              }}
            />
            <div className="absolute bottom-4 left-4 right-4">
              <button
                onClick={() => toast.info("Opening Google Maps for directions…")}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 press-feedback shadow-lg"
                style={{ boxShadow: "0 4px 16px rgba(37,99,235,0.4)" }}
              >
                <Navigation size={16} />
                Get Directions
              </button>
            </div>
          </div>
        )}

        {/* ── Reviews Tab ── */}
        {activeTab === "reviews" && (
          <div className="p-4 space-y-3">
            {[
              { name: "James T.", rating: 5, date: "May 2026", text: "Excellent maternity care. The staff were incredibly supportive throughout the entire process. Highly recommend!" },
              { name: "Michael R.", rating: 5, date: "Apr 2026", text: "My wife had a wonderful experience here. The nurses were attentive and the facilities are top-notch." },
              { name: "David K.", rating: 4, date: "Mar 2026", text: "Good hospital overall. Wait times can be a bit long during peak hours but the quality of care is great." },
              { name: "Chris L.", rating: 5, date: "Feb 2026", text: "The prenatal team is amazing. They made us feel at ease throughout the entire pregnancy journey." },
            ].map((r, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-[12px] font-bold text-blue-600">{r.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-800">{r.name}</p>
                      <p className="text-[11px] text-slate-400">{r.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} size={12} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-[13px] text-slate-600 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-slate-100 p-4 flex gap-3">
        <button
          onClick={() => toast.info("Opening maps for directions…")}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl press-feedback text-[14px]"
        >
          <Navigation size={15} />
          Directions
        </button>
        <button
          onClick={() => toast.success(`Calling ${hospital.name}…`)}
          className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-semibold py-3 px-4 rounded-xl press-feedback text-[14px]"
        >
          <Phone size={15} />
          Call
        </button>
        <button
          onClick={handleBookAppointment}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 rounded-xl press-feedback text-[14px]"
          style={{ boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}
        >
          <Calendar size={15} />
          Book
        </button>
      </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
