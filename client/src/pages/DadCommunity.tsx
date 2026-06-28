/**
 * DadCommunity — Main community page with Forum & Library tabs
 * Layout: Warm Cockpit (SidebarNav + Header + BottomNav)
 * Redesigned to match reference: Action Item banner, large hero, icon tabs,
 * compose box with quick-post buttons, Latest/Trending/Following feed filter.
 */
import { useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Heart, MessageCircle, Bookmark, BookOpen, ChevronRight,
  Bot, X, Send, Bell, Image, HelpCircle, Sparkles, Lightbulb,
  Clock, Flame, UserCheck, MoreHorizontal, CheckCircle2, Circle,
  Trophy, Star,
} from "lucide-react";
import Header from "@/components/Header";
import SidebarNav from "@/components/SidebarNav";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { usePregnancy } from "@/hooks/usePregnancy";
import { getWeekData } from "@/lib/pregnancyData";
import {
  COMMUNITY_IMAGES,
  FORUM_POSTS,
  LIBRARY_CATEGORIES,
  FEATURED_ARTICLES,
  type ForumPost,
} from "@/lib/communityData";

type Tab = "forum" | "library";
type FeedFilter = "latest" | "trending" | "following";

// ─── Action Items (static for now) ───────────────────────────────────────────
interface ActionTask {
  id: number;
  emoji: string;
  text: string;
  category: string;
  categoryColor: string;
  categoryBg: string;
  priority: "high" | "medium" | "low";
}

const ACTION_ITEMS: ActionTask[] = [
  {
    id: 1,
    emoji: "💊",
    text: "Make sure mom takes her prenatal iron supplement before 2:00 PM.",
    category: "Health",
    categoryColor: "oklch(0.50 0.14 20)",
    categoryBg: "oklch(0.96 0.04 20)",
    priority: "high",
  },
  {
    id: 2,
    emoji: "🥗",
    text: "Prepare a light, protein-rich snack for mom's evening hunger.",
    category: "Nutrition",
    categoryColor: "oklch(0.48 0.13 140)",
    categoryBg: "oklch(0.95 0.04 140)",
    priority: "medium",
  },
  {
    id: 3,
    emoji: "🏥",
    text: "Check if the hospital bag is fully packed this week.",
    category: "Prep",
    categoryColor: "oklch(0.48 0.12 240)",
    categoryBg: "oklch(0.95 0.03 240)",
    priority: "medium",
  },
];

export default function DadCommunity() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("forum");
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());
  const [userPosts, setUserPosts] = useState<ForumPost[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostType, setNewPostType] = useState<"question" | "experience" | "tip">("question");
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("latest");
  // Pre-follow 2 dads so the Following tab has content from the start
  const [followedDads, setFollowedDads] = useState<Set<string>>(
    new Set(["David (Andy's Dad)", "Leo (Haohao's Dad)"])
  );
  const toggleFollow = (authorName: string) => {
    setFollowedDads((prev) => {
      const next = new Set(prev);
      if (next.has(authorName)) {
        next.delete(authorName);
        toast(`Unfollowed ${authorName}`);
      } else {
        next.add(authorName);
        toast.success(`Now following ${authorName}! ✨`);
      }
      return next;
    });
  };
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const [showAllActions, setShowAllActions] = useState(false);
  const [allDoneAnim, setAllDoneAnim] = useState(false);
  const actionBannerRef = useRef<HTMLDivElement>(null);

  const handleCreatePost = useCallback(
    (title: string, body: string, tag: string) => {
      const newPost: ForumPost = {
        id: Date.now(),
        avatar: user?.name?.charAt(0) ?? "Y",
        avatarClass: "bg-teal-600",
        author: user?.name ?? "You",
        weeks: "Expectant Dad",
        time: "Just now",
        tag: `#${tag}`,
        tagColor: "teal",
        title,
        body,
        likes: 0,
        replies: 0,
        comments: [],
      };
      setUserPosts((prev) => [newPost, ...prev]);
      setShowNewPost(false);
    },
    [user]
  );

  const toggleLike = (id: number) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSave = (id: number) => {
    setSavedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Sort posts by feed filter
  const allPosts = [...userPosts, ...FORUM_POSTS];
  const filteredPosts =
    feedFilter === "trending"
      ? [...allPosts].sort((a, b) => b.likes - a.likes)
      : feedFilter === "following"
      ? allPosts.filter((p) => followedDads.has(p.author))
      : allPosts;

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

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto pb-20 lg:pb-8" style={{ scrollbarWidth: "thin" }}>

            {/* Desktop page title */}
            <div className="hidden lg:block px-6 pt-5 pb-2">
              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}
              >
                Dad Community
              </h2>
              <p className="text-sm mt-1" style={{ color: "oklch(0.52 0.03 240)" }}>
                Connect with other dads &nbsp;·&nbsp; Learn &nbsp;·&nbsp; Grow together
              </p>
            </div>

            {/* ── Dad's Action Item Banner ─────────────────────────────── */}
            <div className="mx-4 lg:mx-6 mt-3" ref={actionBannerRef}>
              {/* Header row */}
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <Bell size={14} style={{ color: "oklch(0.55 0.14 60)" }} />
                  <span className="text-[13px] font-bold" style={{ color: "oklch(0.55 0.14 60)" }}>
                    Dad's Action Items
                  </span>
                  {completedTasks.size > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: "oklch(0.92 0.08 140)", color: "oklch(0.38 0.12 140)" }}
                    >
                      {completedTasks.size}/{ACTION_ITEMS.length} done
                    </motion.span>
                  )}
                </div>
                <button
                  className="text-[12px] font-semibold press-feedback"
                  style={{ color: "oklch(0.55 0.14 60)" }}
                  onClick={() => setShowAllActions((v) => !v)}
                >
                  {showAllActions ? "Collapse ↑" : "View all ↓"}
                </button>
              </div>

              {/* Progress bar */}
              <div
                className="h-1.5 rounded-full overflow-hidden mb-2.5"
                style={{ background: "oklch(0.92 0.02 80)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, oklch(0.65 0.14 140), oklch(0.55 0.14 60))" }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${(completedTasks.size / ACTION_ITEMS.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>

              {/* All-done celebration banner */}
              <AnimatePresence>
                {allDoneAnim && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="rounded-2xl px-4 py-3 mb-2 flex items-center gap-3"
                    style={{
                      background: "linear-gradient(120deg, oklch(0.92 0.08 140), oklch(0.94 0.06 80))",
                      border: "1px solid oklch(0.82 0.10 140 / 0.5)",
                    }}
                  >
                    <Trophy size={20} style={{ color: "oklch(0.48 0.14 80)" }} />
                    <div>
                      <p className="text-[13px] font-bold" style={{ color: "oklch(0.22 0.04 240)" }}>
                        All tasks done! 🎉 You're a great dad today.
                      </p>
                      <p className="text-[11px]" style={{ color: "oklch(0.42 0.04 240)" }}>
                        Keep it up — every small act counts.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Collapsed preview: show first incomplete task */}
              {!showAllActions && (() => {
                const firstIncomplete = ACTION_ITEMS.find((t) => !completedTasks.has(t.id));
                if (!firstIncomplete) return null;
                return (
                  <motion.div
                    key={firstIncomplete.id}
                    layout
                    className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
                    style={{
                      background: "oklch(0.99 0.01 80)",
                      border: "1px solid oklch(0.90 0.06 60 / 0.35)",
                      boxShadow: "0 1px 8px oklch(0.75 0.08 60 / 0.12)",
                    }}
                  >
                    <button
                      onClick={() => {
                        const newSet = new Set(completedTasks);
                        newSet.add(firstIncomplete.id);
                        setCompletedTasks(newSet);
                        const rect = actionBannerRef.current?.getBoundingClientRect();
                        const origin = {
                          x: rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5,
                          y: rect ? rect.top / window.innerHeight : 0.3,
                        };
                        if (newSet.size === ACTION_ITEMS.length) {
                          setAllDoneAnim(true);
                          confetti({
                            particleCount: 120,
                            spread: 80,
                            origin,
                            colors: ["#f97316", "#22c55e", "#3b82f6", "#f59e0b", "#ec4899"],
                            ticks: 200,
                          });
                          setTimeout(() => setAllDoneAnim(false), 5000);
                        } else {
                          confetti({
                            particleCount: 40,
                            spread: 50,
                            origin,
                            colors: ["#f97316", "#22c55e", "#f59e0b"],
                            ticks: 100,
                            scalar: 0.8,
                          });
                        }
                      }}
                      className="flex-shrink-0 press-feedback"
                      aria-label="Complete task"
                    >
                      <Circle size={22} style={{ color: "oklch(0.75 0.06 60)" }} />
                    </button>
                    <span className="text-xl flex-shrink-0">{firstIncomplete.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] leading-[1.55]" style={{ color: "oklch(0.28 0.04 240)" }}>
                        {firstIncomplete.text}
                      </p>
                      <span
                        className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: firstIncomplete.categoryBg, color: firstIncomplete.categoryColor }}
                      >
                        {firstIncomplete.category}
                      </span>
                    </div>
                  </motion.div>
                );
              })()}
            </div>

            {/* Expanded action items list */}
            <AnimatePresence>
              {showAllActions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                  className="overflow-hidden mx-4 lg:mx-6"
                >
                  <div
                    className="rounded-2xl px-3 py-3 flex flex-col gap-2"
                    style={{
                      background: "oklch(0.99 0.01 80)",
                      border: "1px solid oklch(0.90 0.06 60 / 0.3)",
                    }}
                  >
                    {ACTION_ITEMS.map((task) => {
                      const done = completedTasks.has(task.id);
                      return (
                        <motion.button
                          key={task.id}
                          layout
                          onClick={() => {
                            if (done) {
                              // Allow un-check
                              const newSet = new Set(completedTasks);
                              newSet.delete(task.id);
                              setCompletedTasks(newSet);
                              setAllDoneAnim(false);
                              return;
                            }
                            const newSet = new Set(completedTasks);
                            newSet.add(task.id);
                            setCompletedTasks(newSet);
                            const rect = actionBannerRef.current?.getBoundingClientRect();
                            if (newSet.size === ACTION_ITEMS.length) {
                              setAllDoneAnim(true);
                              confetti({
                                particleCount: 150,
                                spread: 90,
                                origin: {
                                  x: rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5,
                                  y: rect ? rect.top / window.innerHeight : 0.3,
                                },
                                colors: ["#f97316", "#22c55e", "#3b82f6", "#f59e0b", "#ec4899"],
                                ticks: 250,
                              });
                              setTimeout(() => setAllDoneAnim(false), 5000);
                            } else {
                              confetti({
                                particleCount: 45,
                                spread: 55,
                                origin: {
                                  x: rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5,
                                  y: rect ? rect.top / window.innerHeight : 0.3,
                                },
                                colors: ["#f97316", "#22c55e", "#f59e0b"],
                                ticks: 120,
                                scalar: 0.85,
                              });
                            }
                          }}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 text-left press-feedback w-full transition-all duration-200"
                          style={{
                            background: done ? "oklch(0.95 0.04 140 / 0.5)" : "transparent",
                          }}
                        >
                          {/* Checkbox */}
                          <motion.div
                            animate={done ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="flex-shrink-0"
                          >
                            {done ? (
                              <CheckCircle2 size={22} style={{ color: "oklch(0.48 0.14 140)" }} />
                            ) : (
                              <Circle size={22} style={{ color: "oklch(0.75 0.06 60)" }} />
                            )}
                          </motion.div>

                          {/* Emoji */}
                          <span className="text-xl flex-shrink-0">{task.emoji}</span>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[13px] leading-[1.55] transition-all duration-200"
                              style={{
                                color: done ? "oklch(0.55 0.04 240)" : "oklch(0.28 0.04 240)",
                                textDecoration: done ? "line-through" : "none",
                              }}
                            >
                              {task.text}
                            </p>
                            <span
                              className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: task.categoryBg, color: task.categoryColor }}
                            >
                              {task.category}
                            </span>
                          </div>

                          {/* Done star */}
                          {done && (
                            <motion.div
                              initial={{ scale: 0, rotate: -30 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                              <Star size={14} fill="oklch(0.75 0.14 80)" style={{ color: "oklch(0.75 0.14 80)" }} />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Icon Tab Switcher ────────────────────────────────────── */}
            <div
              className="mx-4 lg:mx-6 mt-3 flex bg-white/90 rounded-2xl overflow-hidden"
              style={{ border: "1px solid oklch(0.90 0.02 240 / 0.4)", boxShadow: "0 1px 6px oklch(0.8 0.02 240 / 0.15)" }}
            >
              {([
                { id: "forum" as Tab, emoji: "🌳", label: "Dad Round Table", sublabel: "Forum" },
                { id: "library" as Tab, emoji: "📖", label: "Care Library", sublabel: "Articles & Speech" },
              ]).map((tab, i) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center py-3.5 transition-all duration-200 relative ${
                    i === 0 ? "border-r border-slate-100" : ""
                  }`}
                  style={{ color: activeTab === tab.id ? "oklch(0.22 0.04 240)" : "oklch(0.55 0.03 240)" }}
                >
                  <span className="text-xl mb-0.5">{tab.emoji}</span>
                  <span className="text-[11px] font-bold leading-tight text-center px-1">{tab.label}</span>
                  <span className="text-[10px] leading-tight" style={{ color: "oklch(0.62 0.03 240)" }}>{tab.sublabel}</span>
                  {/* Active underline */}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-4 right-4 h-[2.5px] rounded-full"
                      style={{ background: "oklch(0.60 0.15 30)" }}
                      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === "forum" ? (
                <motion.div
                  key="forum"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <ForumContent
                    posts={filteredPosts}
                    likedPosts={likedPosts}
                    savedPosts={savedPosts}
                    feedFilter={feedFilter}
                    onFeedFilter={setFeedFilter}
                    onToggleLike={toggleLike}
                    onToggleSave={toggleSave}
                    onNewPost={(type) => { setNewPostType(type); setShowNewPost(true); }}
                    user={user}
                    followedDads={followedDads}
                    onToggleFollow={toggleFollow}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="library"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <LibraryContent navigate={navigate} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <BottomNav />

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPost && (
          <NewPostModal
            initialType={newPostType}
            onClose={() => setShowNewPost(false)}
            onSubmit={handleCreatePost}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Forum Tab ────────────────────────────────────────────────────────────────
function ForumContent({
  posts,
  likedPosts,
  savedPosts,
  feedFilter,
  onFeedFilter,
  onToggleLike,
  onToggleSave,
  onNewPost,
  user,
  followedDads,
  onToggleFollow,
}: {
  posts: ForumPost[];
  likedPosts: Set<number>;
  savedPosts: Set<number>;
  feedFilter: FeedFilter;
  onFeedFilter: (f: FeedFilter) => void;
  onToggleLike: (id: number) => void;
  onToggleSave: (id: number) => void;
  onNewPost: (type: "question" | "experience" | "tip") => void;
  user: { name?: string | null } | null | undefined;
  followedDads: Set<string>;
  onToggleFollow: (authorName: string) => void;
}) {
  return (
    <div className="px-4 lg:px-6 pt-4 flex flex-col gap-4">

      {/* ── Large Hero Card ──────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden flex items-stretch"
        style={{
          background: "linear-gradient(120deg, oklch(0.94 0.04 188) 0%, oklch(0.97 0.02 188) 60%, oklch(0.99 0.01 188) 100%)",
          border: "1px solid oklch(0.88 0.04 188 / 0.5)",
          minHeight: "180px",
        }}
      >
        <div className="flex-1 min-w-0 flex flex-col justify-center px-5 py-6">
          <h3
            className="text-[28px] font-extrabold leading-tight"
            style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.18 0.05 240)" }}
          >
            Dad Round Table
          </h3>
          <p className="text-[12px] mt-2.5 leading-[1.6] max-w-[190px]" style={{ color: "oklch(0.42 0.04 240)" }}>
            A space for dads-to-be to ask, share, and support each other.
          </p>
        </div>
        <div className="flex-shrink-0 w-[150px] flex items-end overflow-hidden">
          <img
            src={COMMUNITY_IMAGES.hero_dad_forum}
            alt="Dad Forum"
            className="w-full h-auto"
            style={{ display: "block" }}
          />
        </div>
      </div>

      {/* ── Compose Box ─────────────────────────────────────────── */}
      <div
        className="bg-white/90 rounded-2xl p-4"
        style={{ border: "1px solid oklch(0.90 0.02 240 / 0.4)", boxShadow: "0 1px 6px oklch(0.8 0.02 240 / 0.12)" }}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: "oklch(0.52 0.09 188)" }}
          >
            {user?.name?.charAt(0)?.toUpperCase() ?? "Y"}
          </div>
          <button
            onClick={() => onNewPost("question")}
            className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl text-left press-feedback"
            style={{
              background: "oklch(0.96 0.01 240)",
              border: "1px solid oklch(0.90 0.02 240 / 0.5)",
            }}
          >
            <span className="text-[13px]" style={{ color: "oklch(0.62 0.03 240)" }}>
              Share a thought, ask a question...
            </span>
            <Image size={16} style={{ color: "oklch(0.62 0.03 240)" }} />
          </button>
        </div>

        {/* Quick-post buttons */}
        <div className="flex gap-2">
          {([
            { type: "question" as const, icon: HelpCircle, label: "Ask a Question", color: "oklch(0.55 0.12 280)", bg: "oklch(0.95 0.03 280)" },
            { type: "experience" as const, icon: Sparkles, label: "Share Experience", color: "oklch(0.52 0.12 10)", bg: "oklch(0.97 0.03 10)" },
            { type: "tip" as const, icon: Lightbulb, label: "Share a Tip", color: "oklch(0.55 0.12 80)", bg: "oklch(0.97 0.04 80)" },
          ]).map((btn) => (
            <button
              key={btn.type}
              onClick={() => onNewPost(btn.type)}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-semibold press-feedback transition-all"
              style={{ background: btn.bg, color: btn.color, border: `1px solid ${btn.color}22` }}
            >
              <btn.icon size={12} />
              <span className="hidden xs:inline">{btn.label}</span>
              <span className="xs:hidden">{btn.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Feed Filter ─────────────────────────────────────────── */}
      <div
        className="flex bg-white/80 rounded-2xl overflow-hidden"
        style={{ border: "1px solid oklch(0.90 0.02 240 / 0.4)" }}
      >
        {([
          { id: "latest" as FeedFilter, icon: Clock, label: "Latest" },
          { id: "trending" as FeedFilter, icon: Flame, label: "Trending" },
          { id: "following" as FeedFilter, icon: UserCheck, label: "Following" },
        ]).map((f, i) => (
          <button
            key={f.id}
            onClick={() => onFeedFilter(f.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold transition-all relative ${
              i < 2 ? "border-r border-slate-100" : ""
            }`}
            style={{ color: feedFilter === f.id ? "oklch(0.60 0.15 30)" : "oklch(0.55 0.03 240)" }}
          >
            <f.icon size={14} />
            {f.label}
            {feedFilter === f.id && (
              <motion.div
                layoutId="feed-underline"
                className="absolute bottom-0 left-3 right-3 h-[2.5px] rounded-full"
                style={{ background: "oklch(0.60 0.15 30)" }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Post List ───────────────────────────────────────────── */}
      {posts.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center gap-3">
          <span className="text-4xl">{feedFilter === "following" ? "👥" : "✍️"}</span>
          <p className="text-[14px] font-semibold" style={{ color: "oklch(0.32 0.04 240)" }}>
            {feedFilter === "following" ? "No followed dads yet" : "No posts yet"}
          </p>
          <p className="text-[12px] max-w-[220px] leading-relaxed" style={{ color: "oklch(0.55 0.03 240)" }}>
            {feedFilter === "following"
              ? "Tap \"+ Follow\" on any dad's post to see their updates here."
              : "Be the first to share a thought or question!"}
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isLiked={likedPosts.has(post.id)}
            isSaved={savedPosts.has(post.id)}
            isFollowed={followedDads.has(post.author)}
            onToggleLike={() => onToggleLike(post.id)}
            onToggleSave={() => onToggleSave(post.id)}
            onToggleFollow={() => onToggleFollow(post.author)}
          />
        ))
      )}

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({
  post,
  isLiked,
  isSaved,
  isFollowed,
  onToggleLike,
  onToggleSave,
  onToggleFollow,
}: {
  post: ForumPost;
  isLiked: boolean;
  isSaved: boolean;
  isFollowed: boolean;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onToggleFollow: () => void;
}) {
  const [, navigate] = useLocation();
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const tagColorMap: Record<string, { bg: string; text: string }> = {
    purple: { bg: "oklch(0.94 0.04 280)", text: "oklch(0.42 0.12 280)" },
    teal:   { bg: "oklch(0.93 0.04 188)", text: "oklch(0.38 0.10 188)" },
    orange: { bg: "oklch(0.95 0.05 60)",  text: "oklch(0.48 0.14 60)"  },
  };
  const tagStyle = tagColorMap[post.tagColor] ?? { bg: "oklch(0.93 0.04 240)", text: "oklch(0.42 0.10 240)" };

  return (
    <div
      className="bg-white/90 rounded-2xl p-4"
      style={{ border: "1px solid oklch(0.90 0.02 240 / 0.4)", boxShadow: "0 1px 6px oklch(0.8 0.02 240 / 0.10)" }}
    >
      {/* Author row */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-full ${post.avatarClass} flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0`}
        >
          {post.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-[13px] font-bold" style={{ color: "oklch(0.22 0.04 240)" }}>
              {post.author}
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFollow(); }}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full press-feedback transition-all flex-shrink-0"
              style={isFollowed ? {
                background: "oklch(0.52 0.09 188 / 0.12)",
                color: "oklch(0.42 0.09 188)",
                border: "1px solid oklch(0.52 0.09 188 / 0.35)",
              } : {
                background: "oklch(0.96 0.04 80)",
                color: "oklch(0.48 0.12 60)",
                border: "1px solid oklch(0.85 0.07 60 / 0.5)",
              }}
            >
              {isFollowed ? "✓ Following" : "+ Follow"}
            </button>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: tagStyle.bg, color: tagStyle.text }}
            >
              {post.tag}
            </span>
          </div>
          <p className="text-[11px] mt-0.5" style={{ color: "oklch(0.55 0.03 240)" }}>
            {post.weeks} · {post.time}
          </p>
        </div>
        {/* Menu only */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-7 h-7 rounded-lg flex items-center justify-center press-feedback"
              style={{ color: "oklch(0.62 0.03 240)" }}
            >
              <MoreHorizontal size={16} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg py-1 min-w-[130px]"
                  style={{ border: "1px solid oklch(0.90 0.02 240 / 0.5)" }}
                >
                  {["Save post", "Copy link", "Report"].map((item) => (
                    <button
                      key={item}
                      onClick={() => setShowMenu(false)}
                      className="w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 transition-colors"
                      style={{ color: item === "Report" ? "oklch(0.55 0.15 25)" : "oklch(0.28 0.04 240)" }}
                    >
                      {item}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Content — clickable to open post detail */}
      <button
        onClick={() => navigate(`/community/post/${post.id}`)}
        className="w-full text-left press-feedback group"
      >
        <h4
          className="text-[14px] font-bold leading-snug mb-1.5 group-hover:underline decoration-slate-300 underline-offset-2"
          style={{ color: "oklch(0.18 0.05 240)" }}
        >
          {post.title}
        </h4>
        <p className="text-[13px] leading-relaxed line-clamp-3" style={{ color: "oklch(0.42 0.03 240)" }}>
          {post.body}
        </p>
        <p className="text-[11px] mt-1.5 font-medium" style={{ color: "oklch(0.52 0.08 240)" }}>
          Read more →
        </p>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-5 mt-3.5 pt-3 border-t border-slate-100">
        <button
          onClick={onToggleLike}
          className="flex items-center gap-1.5 text-[12px] press-feedback"
        >
          <Heart
            size={15}
            className={isLiked ? "fill-red-500 text-red-500" : "text-slate-400"}
          />
          <span style={{ color: "oklch(0.52 0.03 240)" }}>{post.likes + (isLiked ? 1 : 0)}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-[12px] press-feedback"
        >
          <MessageCircle
            size={15}
            className={showComments ? "text-blue-500" : "text-slate-400"}
          />
          <span style={{ color: "oklch(0.52 0.03 240)" }}>{post.comments.length}</span>
        </button>
        <button onClick={onToggleSave} className="ml-auto press-feedback">
          <Bookmark
            size={15}
            className={isSaved ? "fill-amber-500 text-amber-500" : "text-slate-400"}
          />
        </button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && post.comments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full ${comment.avatarClass} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}
                  >
                    {comment.avatar}
                  </div>
                  <div
                    className="flex-1 min-w-0 rounded-xl px-3 py-2.5"
                    style={{ background: "oklch(0.96 0.01 240)" }}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[12px] font-bold" style={{ color: "oklch(0.28 0.04 240)" }}>
                        {comment.author}
                      </p>
                      <p className="text-[10px]" style={{ color: "oklch(0.62 0.02 240)" }}>
                        {comment.time}
                      </p>
                    </div>
                    <p className="text-[12px] leading-relaxed" style={{ color: "oklch(0.38 0.03 240)" }}>
                      {comment.text}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <button className="flex items-center gap-1 press-feedback">
                        <Heart size={11} className="text-slate-300" />
                        <span className="text-[10px]" style={{ color: "oklch(0.62 0.02 240)" }}>
                          {comment.likes}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Library Tab ──────────────────────────────────────────────────────────────
function LibraryContent({ navigate }: { navigate: (path: string) => void }) {
  const { currentWeek } = usePregnancy();
  const week = currentWeek ?? 15;
  const weekData = getWeekData(week);
  const categories = Object.values(LIBRARY_CATEGORIES);
  const featuredArticles = FEATURED_ARTICLES.map((f) => {
    const cat = LIBRARY_CATEGORIES[f.categoryId];
    const art = cat?.articles.find((a) => a.id === f.articleId);
    return art ? { ...art, categoryId: f.categoryId } : null;
  }).filter(Boolean) as (typeof LIBRARY_CATEGORIES["hospital"]["articles"][0] & { categoryId: string })[];

  return (
    <div className="px-4 lg:px-6 pt-4 flex flex-col gap-4">

      {/* ── Week X Dad Hub Hero ────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden flex items-stretch"
        style={{
          background: "linear-gradient(120deg, oklch(0.95 0.04 60) 0%, oklch(0.97 0.03 60) 55%, oklch(0.99 0.01 60) 100%)",
          border: "1px solid oklch(0.88 0.05 60 / 0.5)",
          minHeight: "200px",
        }}
      >
        <div className="flex-1 min-w-0 flex flex-col justify-center px-5 py-6">
          <h3
            className="text-[32px] font-extrabold leading-[1.1]"
            style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.18 0.05 240)" }}
          >
            Week {week}<br />Dad Hub
          </h3>
          <p className="text-[12px] mt-3 leading-[1.65] max-w-[200px]" style={{ color: "oklch(0.40 0.04 240)" }}>
            Real stories. Honest advice. Stronger together. A safe space for expectant dads to share, learn, and support each other.
          </p>
        </div>
        <div className="flex-shrink-0 w-[155px] flex items-end overflow-hidden">
          <img
            src={COMMUNITY_IMAGES.hero_dad_hub}
            alt="Week Dad Hub"
            className="w-full h-auto"
            style={{ display: "block" }}
          />
        </div>
      </div>

      {/* ── Golden Care Library Hero ────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden flex items-stretch"
        style={{
          background: "linear-gradient(120deg, oklch(0.94 0.04 80) 0%, oklch(0.97 0.02 80) 60%, oklch(0.99 0.01 80) 100%)",
          border: "1px solid oklch(0.88 0.05 80 / 0.5)",
          minHeight: "170px",
        }}
      >
        <div className="flex-1 min-w-0 flex flex-col justify-center px-5 py-5">
          <h3
            className="text-[24px] font-extrabold leading-tight"
            style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.18 0.05 240)" }}
          >
            Golden Care Library
            <span className="text-amber-400 ml-1.5">✶</span>
          </h3>
          <p className="text-[12px] mt-2.5 leading-[1.65] max-w-[195px]" style={{ color: "oklch(0.40 0.04 240)" }}>
            Curated knowledge and gentle guidance to help you care for mom and baby with confidence and heart.
          </p>
        </div>
        <div className="flex-shrink-0 w-[150px] flex items-end overflow-hidden">
          <img
            src={COMMUNITY_IMAGES.library_books}
            alt="Care Library"
            className="w-full h-auto"
            style={{ display: "block", height: '165px' }}
          />
        </div>
      </div>

      {/* ── Category Grid (larger cards) ────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/community/category/${cat.id}`)}
            className="rounded-2xl p-5 text-left press-feedback relative overflow-hidden"
            style={{
              background: "oklch(0.99 0.005 80)",
              border: "1px solid oklch(0.90 0.02 240 / 0.4)",
              boxShadow: "0 2px 10px oklch(0.8 0.02 240 / 0.12)",
            }}
          >
            {/* Large icon */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-3xl mb-3"
              style={{ background: cat.colorLight }}
            >
              {cat.icon}
            </div>
            <p className="text-[14px] font-bold leading-tight" style={{ color: "oklch(0.18 0.05 240)" }}>
              {cat.title}
            </p>
            <p className="text-[11px] mt-1 leading-[1.5]" style={{ color: "oklch(0.50 0.03 240)" }}>
              {cat.subtitle}
            </p>
            {/* Accent bar at bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl"
              style={{ background: cat.color, opacity: 0.35 }}
            />
          </button>
        ))}
      </div>

      {/* ── This Week's Highlight (baby insight from pregnancyData) ──────── */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "oklch(0.97 0.02 188 / 0.6)",
          border: "1px solid oklch(0.88 0.04 188 / 0.4)",
        }}
      >
        <p className="text-[11px] font-bold uppercase tracking-wider mb-2.5" style={{ color: "oklch(0.45 0.09 188)" }}>
          ✨ Week {week} Highlights for Dad
        </p>
        <div className="flex gap-2 flex-wrap">
          {weekData.dadPlan.slice(0, 3).map((tip, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-[12px] leading-[1.5] w-full"
              style={{ color: "oklch(0.32 0.04 240)" }}
            >
              <span className="text-base flex-shrink-0 mt-[-1px]">{["1️⃣", "2️⃣", "3️⃣"][i]}</span>
              {tip}
            </div>
          ))}
        </div>
      </div>

      {/* ── Featured Articles ─────────────────────────────────────── */}
      <div>
        <h3 className="text-[14px] font-bold mb-3" style={{ color: "oklch(0.22 0.04 240)" }}>
          📚 Featured Articles
        </h3>
        <div className="flex flex-col gap-3">
          {featuredArticles.map((art) => (
            <button
              key={art.id}
              onClick={() => navigate(`/community/article/${art.categoryId}/${art.id}`)}
              className="flex gap-3 bg-white/90 rounded-2xl p-3.5 press-feedback text-left"
              style={{ border: "1px solid oklch(0.90 0.02 240 / 0.4)", boxShadow: "0 1px 6px oklch(0.8 0.02 240 / 0.10)" }}
            >
              <img
                src={COMMUNITY_IMAGES[art.imgKey]}
                alt={art.title}
                className="w-[80px] h-[80px] rounded-xl object-contain bg-slate-50 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold leading-snug line-clamp-2" style={{ color: "oklch(0.22 0.04 240)" }}>
                  {art.title}
                </p>
                <p className="text-[11px] mt-1.5" style={{ color: "oklch(0.52 0.03 240)" }}>
                  {art.readTime} · {art.tag}
                </p>
              </div>
              <ChevronRight size={14} className="text-slate-300 flex-shrink-0 self-center" />
            </button>
          ))}
        </div>
      </div>

      {/* ── AI Ask Dad Banner ─────────────────────────────────────── */}
      <button
        onClick={() => navigate("/community/ai-chat")}
        className="flex items-center gap-3 bg-white/90 rounded-2xl p-4 press-feedback"
        style={{ border: "1px solid oklch(0.90 0.02 240 / 0.4)", boxShadow: "0 1px 6px oklch(0.8 0.02 240 / 0.10)" }}
      >
        <div className="relative">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.92 0.04 188)" }}
          >
            <Bot size={20} style={{ color: "oklch(0.45 0.09 188)" }} />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-[14px] font-bold" style={{ color: "oklch(0.22 0.04 240)" }}>
            Ask Dad AI{" "}
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1"
              style={{ background: "oklch(0.92 0.04 188)", color: "oklch(0.45 0.09 188)" }}
            >
              AI
            </span>
          </p>
          <p className="text-[12px]" style={{ color: "oklch(0.52 0.03 240)" }}>
            Any pregnancy question, answered with care.
          </p>
        </div>
        <ChevronRight size={16} className="text-slate-300" />
      </button>

      {/* Suggested questions */}
      <div className="flex gap-2 flex-wrap pb-4">
        {["How to help her sleep? 💤", "Hospital bag? 🏥", "Mood swings? 💛"].map((q) => (
          <button
            key={q}
            onClick={() => navigate("/community/ai-chat")}
            className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-slate-200 bg-white/60 press-feedback"
            style={{ color: "oklch(0.42 0.03 240)" }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── New Post Modal ──────────────────────────────────────────────────────────
const POST_TYPE_CONFIG = {
  question: {
    label: "Ask a Question",
    icon: HelpCircle,
    color: "oklch(0.55 0.12 280)",
    bg: "oklch(0.95 0.03 280)",
    placeholder: "What would you like to ask fellow dads?",
    tagSuggestions: ["OGTT", "Sleep Tips", "Hospital", "Nutrition", "Labor"],
  },
  experience: {
    label: "Share Experience",
    icon: Sparkles,
    color: "oklch(0.52 0.12 10)",
    bg: "oklch(0.97 0.03 10)",
    placeholder: "Share a moment, milestone, or story from your pregnancy journey...",
    tagSuggestions: ["Fetal Kick", "First Scan", "Birth Plan", "Bonding", "Emotions"],
  },
  tip: {
    label: "Share a Tip",
    icon: Lightbulb,
    color: "oklch(0.55 0.12 80)",
    bg: "oklch(0.97 0.04 80)",
    placeholder: "Share a practical tip that helped you or your partner...",
    tagSuggestions: ["Sleep Tips", "Nutrition", "Exercise", "Relaxation", "Prep"],
  },
};

function NewPostModal({
  initialType,
  onClose,
  onSubmit,
}: {
  initialType: "question" | "experience" | "tip";
  onClose: () => void;
  onSubmit: (title: string, body: string, tag: string) => void;
}) {
  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("");

  const config = POST_TYPE_CONFIG[type];
  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-[480px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center press-feedback"
          >
            <X size={18} className="text-slate-600" />
          </button>
          <h3
            className="text-[16px] font-bold"
            style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}
          >
            New Post
          </h3>
          <button
            onClick={() => canSubmit && onSubmit(title.trim(), body.trim(), tag.trim() || config.tagSuggestions[0])}
            disabled={!canSubmit}
            className="px-4 py-1.5 rounded-xl text-[13px] font-bold text-white press-feedback transition-opacity"
            style={{
              background: canSubmit ? "oklch(0.52 0.09 188)" : "oklch(0.85 0.03 188)",
              opacity: canSubmit ? 1 : 0.6,
            }}
          >
            Post
          </button>
        </div>

        {/* Post type selector */}
        <div className="flex gap-2 px-5 pt-4">
          {(Object.entries(POST_TYPE_CONFIG) as [keyof typeof POST_TYPE_CONFIG, typeof POST_TYPE_CONFIG[keyof typeof POST_TYPE_CONFIG]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setType(key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold press-feedback transition-all"
              style={{
                background: type === key ? cfg.bg : "oklch(0.96 0.01 240)",
                color: type === key ? cfg.color : "oklch(0.55 0.03 240)",
                border: type === key ? `1.5px solid ${cfg.color}44` : "1.5px solid transparent",
              }}
            >
              <cfg.icon size={13} />
              <span className="hidden sm:inline">{cfg.label.split(" ").slice(1).join(" ")}</span>
              <span className="sm:hidden">{cfg.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {/* Tag suggestions */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "oklch(0.55 0.03 240)" }}>
              Topic Tag
            </label>
            <div className="flex gap-2 flex-wrap mb-2">
              {config.tagSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setTag(s)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full press-feedback transition-all"
                  style={{
                    background: tag === s ? config.bg : "oklch(0.95 0.01 240)",
                    color: tag === s ? config.color : "oklch(0.52 0.03 240)",
                    border: tag === s ? `1px solid ${config.color}44` : "1px solid oklch(0.88 0.02 240)",
                  }}
                >
                  #{s}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Or type a custom tag..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-teal-300/50 bg-slate-50/50 placeholder:text-slate-300"
              style={{ color: "oklch(0.22 0.04 240)" }}
            />
          </div>

          {/* Title */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "oklch(0.55 0.03 240)" }}>
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-teal-300/50 bg-slate-50/50 placeholder:text-slate-300"
              style={{ color: "oklch(0.22 0.04 240)" }}
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "oklch(0.55 0.03 240)" }}>
              Details <span className="text-red-400">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={config.placeholder}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-teal-300/50 bg-slate-50/50 placeholder:text-slate-300 resize-none"
              style={{ color: "oklch(0.22 0.04 240)" }}
            />
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 border-t border-slate-100">
          <p className="text-[11px] text-center" style={{ color: "oklch(0.62 0.02 240)" }}>
            Be kind and supportive. We're all in this together. 💙
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
