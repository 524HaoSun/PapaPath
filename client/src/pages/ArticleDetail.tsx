/**
 * ArticleDetail — Full article reading page
 * Layout: Warm Cockpit (SidebarNav + Header + BottomNav)
 */
import { useLocation, useParams } from "wouter";
import { ChevronLeft, Clock, Lightbulb } from "lucide-react";
import Header from "@/components/Header";
import SidebarNav from "@/components/SidebarNav";
import BottomNav from "@/components/BottomNav";
import { COMMUNITY_IMAGES, getArticle } from "@/lib/communityData";

export default function ArticleDetail() {
  const [, navigate] = useLocation();
  const params = useParams<{ categoryId: string; articleId: string }>();
  const article = getArticle(params.categoryId ?? "", params.articleId ?? "");

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Article not found</p>
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
              <button onClick={() => navigate(`/community/category/${params.categoryId}`)} className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center press-feedback">
                <ChevronLeft size={20} className="text-slate-700" />
              </button>
              <p className="text-[15px] font-bold text-slate-800 truncate max-w-[200px]" style={{ fontFamily: "'DM Serif Display', serif" }}>
                {article.tag}
              </p>
              <div className="w-9 h-9" />
            </header>

            {/* Article hero image — contain so full illustration shows */}
            <div className="mx-4 lg:mx-6 mt-4 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center" style={{ minHeight: "200px" }}>
              <img
                src={COMMUNITY_IMAGES[article.imgKey]}
                alt={article.title}
                className="w-full h-auto object-contain max-h-[280px]"
                style={{ display: "block" }}
              />
            </div>

            {/* Article content */}
            <div className="px-4 lg:px-6 pt-4 pb-6 max-w-[720px]">
              {/* Title */}
              <h1
                className="text-xl font-bold leading-snug"
                style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}
              >
                {article.title}
              </h1>

              {/* Meta */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-[12px]" style={{ color: "oklch(0.52 0.03 240)" }}>
                  <Clock size={12} />
                  {article.readTime}
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {article.tag}
                </span>
              </div>

              {/* Intro */}
              <p className="text-[14px] leading-relaxed mt-4" style={{ color: "oklch(0.32 0.03 240)" }}>
                {article.content.intro}
              </p>

              {/* Sections */}
              {article.content.sections.map((section, idx) => (
                <div key={idx} className="mt-6">
                  <h2 className="text-[16px] font-bold mb-3" style={{ color: "oklch(0.22 0.04 240)" }}>
                    {section.heading}
                  </h2>
                  <ul className="flex flex-col gap-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex gap-2 text-[13px] leading-relaxed" style={{ color: "oklch(0.35 0.03 240)" }}>
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-[7px]" style={{ background: "oklch(0.52 0.09 188)" }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Tip */}
              <div
                className="mt-6 rounded-2xl p-4 border"
                style={{ background: "oklch(0.95 0.03 80 / 0.6)", borderColor: "oklch(0.85 0.06 80)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} style={{ color: "oklch(0.52 0.09 80)" }} />
                  <span className="text-[13px] font-bold" style={{ color: "oklch(0.35 0.06 80)" }}>Pro Tip</span>
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: "oklch(0.35 0.04 80)" }}>
                  {article.content.tip}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
