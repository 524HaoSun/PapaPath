/**
 * PostDetail — Full post view with comments, likes, replies
 */
import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Heart, MessageCircle, Bookmark, Send,
  MoreHorizontal, ThumbsUp, Share2, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import SidebarNav from "@/components/SidebarNav";
import BottomNav from "@/components/BottomNav";
import { FORUM_POSTS, type ForumPost, type ForumComment } from "@/lib/communityData";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getPost(id: number): ForumPost | undefined {
  return FORUM_POSTS.find((p) => p.id === id);
}

const TAG_COLOR_MAP: Record<string, { bg: string; text: string }> = {
  purple: { bg: "oklch(0.94 0.04 280)", text: "oklch(0.42 0.12 280)" },
  teal:   { bg: "oklch(0.93 0.04 188)", text: "oklch(0.38 0.10 188)" },
  orange: { bg: "oklch(0.95 0.05 60)",  text: "oklch(0.48 0.14 60)"  },
};

// ─── Comment Item ─────────────────────────────────────────────────────────────
function CommentItem({
  comment,
  onReply,
}: {
  comment: ForumComment & { replyTo?: string };
  onReply: (author: string) => void;
}) {
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className="flex gap-3"
    >
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-full ${comment.avatarClass} flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 mt-0.5`}
      >
        {comment.avatar}
      </div>

      {/* Bubble */}
      <div className="flex-1 min-w-0">
        <div
          className="rounded-2xl rounded-tl-sm px-3.5 py-3"
          style={{
            background: "oklch(0.97 0.01 240 / 0.8)",
            border: "1px solid oklch(0.92 0.02 240 / 0.4)",
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[12px] font-bold" style={{ color: "oklch(0.22 0.04 240)" }}>
              {comment.author}
            </span>
            <span className="text-[10px]" style={{ color: "oklch(0.60 0.02 240)" }}>
              {comment.time}
            </span>
          </div>
          {comment.replyTo && (
            <p className="text-[11px] mb-1.5 pl-2 border-l-2 border-slate-300" style={{ color: "oklch(0.55 0.03 240)" }}>
              @{comment.replyTo}
            </p>
          )}
          <p className="text-[13px] leading-relaxed" style={{ color: "oklch(0.32 0.03 240)" }}>
            {comment.text}
          </p>
        </div>

        {/* Comment actions */}
        <div className="flex items-center gap-4 mt-1.5 px-1">
          <button
            onClick={() => setLiked((v) => !v)}
            className="flex items-center gap-1 text-[11px] press-feedback"
            style={{ color: liked ? "oklch(0.55 0.15 25)" : "oklch(0.58 0.03 240)" }}
          >
            <ThumbsUp size={12} className={liked ? "fill-current" : ""} />
            <span>{comment.likes + (liked ? 1 : 0)}</span>
          </button>
          <button
            onClick={() => onReply(comment.author)}
            className="text-[11px] press-feedback"
            style={{ color: "oklch(0.55 0.09 240)" }}
          >
            Reply
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PostDetail() {
  const params = useParams<{ postId: string }>();
  const [, navigate] = useLocation();

  const postId = parseInt(params.postId ?? "0", 10);
  const basePost = getPost(postId);

  // Local state — all interactions are optimistic/local (no backend needed)
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [localComments, setLocalComments] = useState<(ForumComment & { replyTo?: string })[]>(
    basePost?.comments ?? []
  );
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Focus input when replying
  useEffect(() => {
    if (replyTo) {
      inputRef.current?.focus();
    }
  }, [replyTo]);

  if (!basePost) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-slate-500">Post not found.</p>
        <button onClick={() => navigate("/community")} className="text-blue-500 underline text-sm">
          Back to Community
        </button>
      </div>
    );
  }

  const tagStyle = TAG_COLOR_MAP[basePost.tagColor] ?? { bg: "oklch(0.93 0.04 240)", text: "oklch(0.42 0.10 240)" };
  const displayedComments = showAllComments ? localComments : localComments.slice(0, 3);

  const handleSendComment = () => {
    const text = inputText.trim();
    if (!text) return;

    const newComment: ForumComment & { replyTo?: string } = {
      id: Date.now(),
      avatar: "Y",
      avatarClass: "bg-teal-600",
      author: "You",
      time: "Just now",
      text,
      likes: 0,
      replyTo: replyTo ?? undefined,
    };

    setLocalComments((prev) => [...prev, newComment]);
    setInputText("");
    setReplyTo(null);

    // Scroll to bottom after render
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);

    toast.success("Comment posted! 💬");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: basePost.title, text: basePost.body }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast("Link copied to clipboard 🔗");
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "oklch(0.97 0.01 240 / 0.5)" }}
    >
      <SidebarNav />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        {/* Sticky sub-header */}
        <div
          className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3"
          style={{
            background: "oklch(0.98 0.01 240 / 0.92)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid oklch(0.92 0.02 240 / 0.4)",
          }}
        >
          <button
            onClick={() => navigate("/community")}
            className="w-8 h-8 rounded-full flex items-center justify-center press-feedback"
            style={{ background: "oklch(0.93 0.02 240 / 0.6)" }}
          >
            <ArrowLeft size={16} style={{ color: "oklch(0.32 0.04 240)" }} />
          </button>
          <span className="text-[14px] font-bold flex-1 truncate" style={{ color: "oklch(0.22 0.04 240)" }}>
            Post Detail
          </span>
          <button onClick={handleShare} className="press-feedback p-1.5">
            <Share2 size={16} style={{ color: "oklch(0.52 0.04 240)" }} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pb-32">
          <div className="max-w-2xl mx-auto px-4 pt-4 flex flex-col gap-5">

            {/* ── Post Card ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="bg-white rounded-2xl p-5"
              style={{ border: "1px solid oklch(0.90 0.02 240 / 0.4)", boxShadow: "0 2px 12px oklch(0.8 0.02 240 / 0.12)" }}
            >
              {/* Author row */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={`w-11 h-11 rounded-full ${basePost.avatarClass} flex items-center justify-center text-white text-[15px] font-bold flex-shrink-0`}
                >
                  {basePost.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-bold" style={{ color: "oklch(0.18 0.05 240)" }}>
                      {basePost.author}
                    </p>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: tagStyle.bg, color: tagStyle.text }}
                    >
                      {basePost.tag}
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: "oklch(0.55 0.03 240)" }}>
                    {basePost.weeks} · {basePost.time}
                  </p>
                </div>
                <button className="p-1 press-feedback">
                  <MoreHorizontal size={18} style={{ color: "oklch(0.62 0.03 240)" }} />
                </button>
              </div>

              {/* Full title */}
              <h2 className="text-[16px] font-bold leading-snug mb-3" style={{ color: "oklch(0.15 0.05 240)" }}>
                {basePost.title}
              </h2>

              {/* Full body — no line-clamp */}
              <p className="text-[14px] leading-relaxed" style={{ color: "oklch(0.38 0.03 240)" }}>
                {basePost.body}
              </p>

              {/* Divider */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-6">
                {/* Like */}
                <button
                  onClick={() => setIsLiked((v) => !v)}
                  className="flex items-center gap-1.5 press-feedback"
                >
                  <Heart
                    size={18}
                    className={isLiked ? "fill-red-500 text-red-500" : "text-slate-400"}
                  />
                  <span className="text-[13px]" style={{ color: "oklch(0.48 0.03 240)" }}>
                    {basePost.likes + (isLiked ? 1 : 0)}
                  </span>
                </button>

                {/* Comment count */}
                <button
                  onClick={() => inputRef.current?.focus()}
                  className="flex items-center gap-1.5 press-feedback"
                >
                  <MessageCircle size={18} className="text-slate-400" />
                  <span className="text-[13px]" style={{ color: "oklch(0.48 0.03 240)" }}>
                    {localComments.length}
                  </span>
                </button>

                {/* Save */}
                <button
                  onClick={() => {
                    setIsSaved((v) => !v);
                    toast(isSaved ? "Removed from saved" : "Post saved! 🔖");
                  }}
                  className="ml-auto press-feedback"
                >
                  <Bookmark
                    size={18}
                    className={isSaved ? "fill-amber-500 text-amber-500" : "text-slate-400"}
                  />
                </button>
              </div>
            </motion.div>

            {/* ── Comments Section ── */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[14px] font-bold" style={{ color: "oklch(0.22 0.04 240)" }}>
                  💬 {localComments.length} {localComments.length === 1 ? "Comment" : "Comments"}
                </h3>
              </div>

              <div className="flex flex-col gap-4">
                {localComments.length === 0 ? (
                  <div
                    className="rounded-2xl p-6 text-center"
                    style={{ background: "oklch(0.97 0.01 240 / 0.6)", border: "1px dashed oklch(0.88 0.03 240)" }}
                  >
                    <p className="text-2xl mb-2">💭</p>
                    <p className="text-[13px]" style={{ color: "oklch(0.52 0.03 240)" }}>
                      Be the first to comment!
                    </p>
                  </div>
                ) : (
                  <>
                    <AnimatePresence initial={false}>
                      {displayedComments.map((comment) => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          onReply={(author) => {
                            setReplyTo(author);
                          }}
                        />
                      ))}
                    </AnimatePresence>

                    {/* Show more / less */}
                    {localComments.length > 3 && (
                      <button
                        onClick={() => setShowAllComments((v) => !v)}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-medium press-feedback"
                        style={{
                          background: "oklch(0.95 0.02 240 / 0.6)",
                          color: "oklch(0.42 0.06 240)",
                          border: "1px solid oklch(0.90 0.02 240 / 0.5)",
                        }}
                      >
                        <ChevronDown
                          size={14}
                          style={{ transform: showAllComments ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                        />
                        {showAllComments
                          ? "Show less"
                          : `Show ${localComments.length - 3} more comment${localComments.length - 3 > 1 ? "s" : ""}`}
                      </button>
                    )}
                  </>
                )}
              </div>
              <div ref={commentsEndRef} />
            </div>

          </div>
        </div>

        {/* ── Sticky Comment Input ── */}
        <div
          className="fixed bottom-16 left-0 right-0 z-30 px-4 pb-3 pt-2"
          style={{
            background: "oklch(0.98 0.01 240 / 0.95)",
            backdropFilter: "blur(16px)",
            borderTop: "1px solid oklch(0.92 0.02 240 / 0.4)",
          }}
        >
          {/* Reply-to indicator */}
          <AnimatePresence>
            {replyTo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <p className="text-[11px]" style={{ color: "oklch(0.48 0.08 240)" }}>
                    Replying to <span className="font-bold">@{replyTo}</span>
                  </p>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-[11px] press-feedback"
                    style={{ color: "oklch(0.55 0.03 240)" }}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2.5">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0 mb-0.5">
              Y
            </div>

            {/* Textarea */}
            <div
              className="flex-1 flex items-end rounded-2xl px-3.5 py-2.5 gap-2"
              style={{
                background: "oklch(0.95 0.01 240 / 0.7)",
                border: "1px solid oklch(0.88 0.03 240 / 0.6)",
              }}
            >
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendComment();
                  }
                }}
                placeholder={replyTo ? `Reply to @${replyTo}…` : "Share your thoughts…"}
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none text-[13px] leading-relaxed max-h-24 overflow-y-auto"
                style={{ color: "oklch(0.22 0.04 240)" }}
              />
              <button
                onClick={handleSendComment}
                disabled={!inputText.trim()}
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 press-feedback transition-all"
                style={{
                  background: inputText.trim()
                    ? "oklch(0.52 0.12 188)"
                    : "oklch(0.88 0.02 240)",
                }}
              >
                <Send size={13} className="text-white" style={{ transform: "translateX(1px)" }} />
              </button>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
