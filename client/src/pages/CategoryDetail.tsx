/**
 * CategoryDetail — Library category page showing all articles in a category
 * Layout: Warm Cockpit (SidebarNav + Header + BottomNav)
 */
import { useLocation, useParams } from "wouter";
import { ChevronLeft } from "lucide-react";
import Header from "@/components/Header";
import SidebarNav from "@/components/SidebarNav";
import BottomNav from "@/components/BottomNav";
import { COMMUNITY_IMAGES, getCategory } from "@/lib/communityData";

export default function CategoryDetail() {
  const [, navigate] = useLocation();
  const params = useParams<{ categoryId: string }>();
  const category = getCategory(params.categoryId ?? "");

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );
  }

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

            {/* Sub-page header */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <button onClick={() => navigate("/community")} className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center press-feedback">
                <ChevronLeft size={20} className="text-slate-700" />
              </button>
              <p className="text-[17px] font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', serif" }}>
                {category.title}
              </p>
              <div className="w-9 h-9" />
            </header>

            {/* Banner — text left, full illustration right */}
            <div
              className="mx-4 lg:mx-6 mt-4 rounded-2xl overflow-hidden flex items-end"
              style={{ background: "oklch(0.94 0.04 188 / 0.2)", border: "1px solid oklch(0.88 0.04 188 / 0.35)" }}
            >
              <div className="flex-1 min-w-0 px-5 py-5">
                <p className="text-[18px] font-extrabold leading-snug" style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.18 0.05 240)" }}>
                  {category.icon} {category.title}
                </p>
                <p className="text-[12px] mt-2 leading-relaxed" style={{ color: "oklch(0.42 0.04 240)" }}>
                  {category.description}
                </p>
              </div>
              <div className="flex-shrink-0 w-[130px] sm:w-[150px]">
                <img
                  src={COMMUNITY_IMAGES[category.bannerKey]}
                  alt={category.title}
                  className="w-full h-auto object-contain"
                  style={{ display: "block" }}
                />
              </div>
            </div>

            {/* Articles list */}
            <div className="px-4 lg:px-6 pt-4 flex flex-col gap-3 pb-4">
              {category.articles.map((art) => (
                <button
                  key={art.id}
                  onClick={() => navigate(`/community/article/${category.id}/${art.id}`)}
                  className="flex gap-3 bg-white/80 rounded-2xl p-3 border border-white/60 shadow-sm press-feedback text-left hover:bg-white/90 transition-colors"
                >
                  <img
                    src={COMMUNITY_IMAGES[art.imgKey]}
                    alt={art.title}
                    className="w-[90px] h-[90px] rounded-xl object-contain bg-slate-50 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold leading-snug line-clamp-2" style={{ color: "oklch(0.22 0.04 240)" }}>
                      {art.title}
                    </p>
                    <p className="text-[12px] mt-1 line-clamp-2" style={{ color: "oklch(0.52 0.03 240)" }}>
                      {art.desc}
                    </p>
                    <p className="text-[11px] mt-1.5 font-medium" style={{ color: "oklch(0.45 0.09 188)" }}>
                      {art.readTime} · {art.tag}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
