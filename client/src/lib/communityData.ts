/**
 * Dad Community — Static data for Forum posts, Library categories & articles
 */

// ─── Image Map ────────────────────────────────────────────────────────────────
export const COMMUNITY_IMAGES = {
  hero_dad_forum: "/manus-storage/hero-dad-forum_3f878bbf.jpg",
  hero_dad_hub: "/manus-storage/hero-dad-hub_778155a5.jpg",
  article_sleep: "/manus-storage/art-massage_f900a579.jpg",
  article_anxiety: "/manus-storage/art-emotions_cc1f2d1f.jpg",
  article_labor: "/manus-storage/art-birth-plan_9cdf80e7.jpg",
  banner_hospital: "/manus-storage/banner-hospital_9fe0f518.jpg",
  library_books: "/manus-storage/library-books_8bc5af26.jpg",
  banner_communication: "/manus-storage/banner-communication_a8926c4e.jpg",
  banner_emotional: "/manus-storage/banner-emotional_5cb0d012.jpg",
  banner_practical: "/manus-storage/banner-practical_c0966f2b.jpg",
  art_fetal_kick: "/manus-storage/art-fetal-kick_eb4e898d.jpg",
  art_birth_plan: "/manus-storage/art-birth-plan_9cdf80e7.jpg",
  art_massage: "/manus-storage/art-massage_f900a579.jpg",
  art_hospital_bag: "/manus-storage/art-hospital-bag_46a7fd31.jpg",
  art_breathing: "/manus-storage/art-breathing_40edfa50.jpg",
  art_communication: "/manus-storage/art-communication_90411e4b.jpg",
  art_nutrition: "/manus-storage/art-nutrition_87e071fc.jpg",
  art_emotions: "/manus-storage/art-emotions_cc1f2d1f.jpg",
  art_checklist: "/manus-storage/art-checklist_2be10aed.jpg",
};

// ─── Forum Posts ──────────────────────────────────────────────────────────────
export interface ForumComment {
  id: number;
  avatar: string;
  avatarClass: string;
  author: string;
  time: string;
  text: string;
  likes: number;
}

export interface ForumPost {
  id: number;
  avatar: string;
  avatarClass: string;
  author: string;
  weeks: string;
  time: string;
  tag: string;
  tagColor: string;
  title: string;
  body: string;
  likes: number;
  replies: number;
  comments: ForumComment[];
}

export const FORUM_POSTS: ForumPost[] = [
  {
    id: 1, avatar: "D", avatarClass: "bg-blue-500",
    author: "David (Andy's Dad)", weeks: "24 Weeks Expectant Dad", time: "2 hours ago",
    tag: "#OGTT", tagColor: "purple",
    title: "The Glucose Tolerance Test (OGTT) is coming up, can any dads share how to help mom prepare?",
    body: "My wife has a 75g OGTT next Tuesday. I saw many pregnant moms complaining about the extremely sweet sugary water...",
    likes: 18, replies: 2,
    comments: [
      { id: 1, avatar: "T", avatarClass: "bg-teal-500", author: "Tom (Lily's Dad)", time: "1 hour ago", text: "My wife just did this last week! I made sure she fasted properly the night before and brought her favorite book to read during the wait. The key is keeping her distracted during the 2-hour wait.", likes: 5 },
      { id: 2, avatar: "R", avatarClass: "bg-orange-500", author: "Ryan (Mia's Dad)", time: "30 min ago", text: "Pro tip: bring a straw! My wife said drinking the glucose solution through a straw made it slightly more bearable. Also, cold water right after helps with the taste.", likes: 8 },
    ],
  },
  {
    id: 2, avatar: "L", avatarClass: "bg-emerald-500",
    author: "Leo (Haohao's Dad)", weeks: "24 Weeks Expectant Dad", time: "5 hours ago",
    tag: "#Fetal Kick", tagColor: "teal",
    title: "When I felt the fetal kicks for the first time, my eyes suddenly got wet...",
    body: "Usually, my wife described to me how the baby was rolling in her tummy. Last night, while reading \"Little Bear Baby\"...",
    likes: 42, replies: 1,
    comments: [
      { id: 1, avatar: "S", avatarClass: "bg-pink-500", author: "Sam (Ava's Dad)", time: "3 hours ago", text: "I know exactly what you mean! The first time I felt it was during a quiet movie night. It's like the baby was saying hello directly to me. Cherish these moments, they go by fast!", likes: 12 },
    ],
  },
  {
    id: 3, avatar: "M", avatarClass: "bg-amber-500",
    author: "Mike (Emma's Dad)", weeks: "24 Weeks Expectant Dad", time: "1 day ago",
    tag: "#Sleep Tips", tagColor: "orange",
    title: "How do you manage sleep when she can't sleep?",
    body: "She wakes up multiple times at night now. Any tips that actually worked for you?",
    likes: 15, replies: 3,
    comments: [
      { id: 1, avatar: "A", avatarClass: "bg-indigo-500", author: "Alex (Zoe's Dad)", time: "20 hours ago", text: "Pregnancy pillow was a game changer for us. Also, I started doing a warm foot massage before bed — she falls asleep faster now.", likes: 7 },
      { id: 2, avatar: "K", avatarClass: "bg-rose-500", author: "Kevin (Ethan's Dad)", time: "18 hours ago", text: "White noise machine + keeping the room cool (around 18°C). Also, I take the early morning shifts so she can sleep in.", likes: 4 },
      { id: 3, avatar: "P", avatarClass: "bg-cyan-500", author: "Peter (Luna's Dad)", time: "12 hours ago", text: "Chamomile tea before bed (caffeine-free of course) and a consistent bedtime routine helped us a lot.", likes: 3 },
    ],
  },
  {
    id: 4, avatar: "J", avatarClass: "bg-violet-500",
    author: "James (Noah's Dad)", weeks: "26 Weeks Expectant Dad", time: "2 days ago",
    tag: "#Nutrition", tagColor: "purple",
    title: "What snacks do you prepare for your wife during the third trimester?",
    body: "My wife keeps getting hungry at night. I've been making small protein snacks but wondering what other dads do...",
    likes: 31, replies: 7,
    comments: [
      { id: 1, avatar: "B", avatarClass: "bg-lime-600", author: "Ben (Sophie's Dad)", time: "1 day ago", text: "Greek yogurt with berries, cheese crackers, and banana with peanut butter are our go-to midnight snacks. Easy to prep and nutritious!", likes: 9 },
      { id: 2, avatar: "C", avatarClass: "bg-sky-500", author: "Chris (Oliver's Dad)", time: "1 day ago", text: "I batch-prep energy balls every Sunday — oats, dates, coconut, and dark chocolate. She loves them and they're filling.", likes: 11 },
      { id: 3, avatar: "N", avatarClass: "bg-fuchsia-500", author: "Nick (Isla's Dad)", time: "22 hours ago", text: "Avocado toast with everything bagel seasoning. Takes 2 minutes and she says it's the best thing I make 😄", likes: 6 },
      { id: 4, avatar: "D", avatarClass: "bg-blue-500", author: "David (Andy's Dad)", time: "20 hours ago", text: "Trail mix with dried fruits and nuts. I keep a jar on her nightstand so she doesn't even have to get up.", likes: 4 },
      { id: 5, avatar: "H", avatarClass: "bg-amber-600", author: "Henry (Grace's Dad)", time: "18 hours ago", text: "Smoothie prep bags in the freezer — just blend with milk in the morning. Spinach + banana + mango is her favorite combo.", likes: 7 },
      { id: 6, avatar: "W", avatarClass: "bg-red-500", author: "Will (Chloe's Dad)", time: "15 hours ago", text: "Cottage cheese with honey and walnuts. High protein and calcium which she needs extra of right now.", likes: 3 },
      { id: 7, avatar: "E", avatarClass: "bg-emerald-600", author: "Evan (Liam's Dad)", time: "10 hours ago", text: "Hard-boiled eggs prepped for the week. Simple but effective. Also, frozen grapes are amazing as a sweet treat!", likes: 5 },
    ],
  },
];

// ─── Library Categories & Articles ────────────────────────────────────────────
export interface ArticleSection {
  heading: string;
  items: string[];
}

export interface Article {
  id: string;
  imgKey: keyof typeof COMMUNITY_IMAGES;
  title: string;
  desc: string;
  readTime: string;
  tag: string;
  content: {
    intro: string;
    sections: ArticleSection[];
    tip: string;
  };
}

export interface LibraryCategory {
  id: string;
  icon: string;
  color: string;
  colorLight: string;
  title: string;
  subtitle: string;
  bannerKey: keyof typeof COMMUNITY_IMAGES;
  description: string;
  articles: Article[];
}

export const LIBRARY_CATEGORIES: Record<string, LibraryCategory> = {
  hospital: {
    id: "hospital",
    icon: "🏥",
    color: "#E8724A",
    colorLight: "#FDE8DC",
    title: "Hospital & Labor",
    subtitle: "Prepare for delivery day and beyond.",
    bannerKey: "banner_hospital",
    description: "Everything you need to know to be the best birth partner. From packing the hospital bag to understanding labor stages — you've got this, Dad.",
    articles: [
      {
        id: "h1",
        imgKey: "art_hospital_bag",
        title: "The Ultimate Hospital Bag Checklist for Dads",
        desc: "Don't forget a thing. Here's exactly what to pack — for her, for baby, and for yourself.",
        readTime: "7 min read",
        tag: "Preparation",
        content: {
          intro: "Packing the hospital bag is one of the most tangible ways you can show up for your partner. Start packing at Week 35 — babies don't always wait.",
          sections: [
            { heading: "👜 For Mom", items: ["Comfortable nightgown or robe (front-opening for breastfeeding)", "Non-slip socks or slippers", "Toiletries: toothbrush, shampoo, lip balm", "Snacks she loves for early labor", "Phone charger + portable battery", "Birth plan (printed × 3 copies)", "Insurance card and hospital documents", "Going-home outfit (maternity size)"] },
            { heading: "👶 For Baby", items: ["2–3 newborn onesies (bring 0–3 month size too)", "Soft swaddle blanket", "Newborn hat and mittens", "Car seat (installed before you leave!)", "Going-home outfit"] },
            { heading: "🧔 For You", items: ["Change of clothes for 2 days", "Snacks and water bottle", "Phone charger", "Headphones (for long waiting)", "Camera or make sure phone has space", "Cash for hospital cafeteria"] },
          ],
          tip: "Dad Tip: Keep the bag by the front door from Week 36. When labor starts, the last thing you want is a frantic search.",
        },
      },
      {
        id: "h2",
        imgKey: "art_birth_plan",
        title: "How to Be Her Anchor During Labor",
        desc: "Simple phrases, touch cues, and presence tips that help reduce anxiety and build her confidence.",
        readTime: "8 min read",
        tag: "Support",
        content: {
          intro: "Your presence during labor is more powerful than you realize. Studies show that continuous support from a partner reduces the need for pain medication and shortens labor.",
          sections: [
            { heading: "🗣️ Words That Help", items: ["\"You're doing so well. I'm right here.\"", "\"One contraction at a time. You've got this.\"", "\"I'm so proud of you.\"", "\"Tell me what you need — I'm listening.\"", "\"Breathe with me. In… and out…\""] },
            { heading: "🤲 Touch Cues That Work", items: ["Firm lower back pressure during contractions", "Cool damp cloth on her forehead", "Hold her hand — let her squeeze as hard as she needs", "Gentle hair strokes between contractions", "Help her change positions every 30–60 minutes"] },
            { heading: "👁️ What to Watch For", items: ["Signs she needs more pain relief — ask, don't assume", "When to call the nurse (her request, unusual pain)", "Keep track of contraction timing in early labor", "Protect her birth plan preferences with medical staff"] },
          ],
          tip: "Dad Tip: Don't try to fix the pain. Your job is to be present, calm, and consistent. That alone is everything.",
        },
      },
      {
        id: "h3",
        imgKey: "art_breathing",
        title: "Labor Breathing Techniques to Practice Together",
        desc: "Learn the breathing patterns now so they become automatic when it matters most.",
        readTime: "5 min read",
        tag: "Technique",
        content: {
          intro: "Breathing is the most accessible pain management tool during labor — and it works best when you've practiced together beforehand.",
          sections: [
            { heading: "🌬️ Slow Breathing (Early Labor)", items: ["Breathe in slowly through the nose for 4 counts", "Breathe out through the mouth for 6–8 counts", "Keep shoulders relaxed, jaw loose", "Your role: breathe with her to set the pace"] },
            { heading: "💨 Light Breathing (Active Labor)", items: ["Faster, lighter breaths — in and out through the mouth", "About 2 breaths per second at peak contraction", "Watch for hyperventilation — slow down if dizzy", "Your role: count aloud to help her maintain rhythm"] },
            { heading: "🔥 Pushing Breathing", items: ["Deep breath in, hold, push for 6–8 seconds", "Release, quick breath, push again", "Follow midwife or doctor guidance", "Your role: count \"1, 2, 3…\" firmly and calmly"] },
          ],
          tip: "Dad Tip: Practice these together every evening from Week 36. It builds muscle memory AND brings you closer as a team.",
        },
      },
    ],
  },
  emotional: {
    id: "emotional",
    icon: "💗",
    color: "#C2577A",
    colorLight: "#FCE8EF",
    title: "Emotional Support",
    subtitle: "Support her mind and heart.",
    bannerKey: "banner_emotional",
    description: "Pregnancy is an emotional journey for both of you. Learn how to hold space, listen deeply, and be the steady presence she needs.",
    articles: [
      {
        id: "e1",
        imgKey: "art_massage",
        title: "The Art of Really Listening",
        desc: "Most dads want to solve problems. But sometimes she just needs to be heard. Here's how.",
        readTime: "6 min read",
        tag: "Connection",
        content: {
          intro: "Pregnancy hormones, physical discomfort, and the weight of becoming a mother create a complex emotional landscape. Your most powerful tool isn't advice — it's presence.",
          sections: [
            { heading: "👂 Active Listening Basics", items: ["Put your phone down. Full eye contact.", "Don't interrupt or finish her sentences", "Reflect back: \"It sounds like you're feeling…\"", "Ask \"What do you need right now — a hug, advice, or just to vent?\"", "Validate before you problem-solve: \"That makes total sense.\""] },
            { heading: "🚫 Phrases to Avoid", items: ["\"At least…\" (minimizes her feelings)", "\"You shouldn't feel that way\"", "\"Just relax, it'll be fine\"", "\"My mom did it without any help\"", "Jumping straight to solutions"] },
            { heading: "💬 Phrases That Help", items: ["\"I hear you. That sounds really hard.\"", "\"I'm not going anywhere. Take your time.\"", "\"You don't have to figure this out alone.\"", "\"What would feel most supportive right now?\"", "\"I love you and I'm here.\""] },
          ],
          tip: "Dad Tip: Set aside 10 minutes each evening — phones away — just to check in. Ask \"How are you feeling today?\" and really mean it.",
        },
      },
      {
        id: "e2",
        imgKey: "art_emotions",
        title: "Managing Your Own Anxiety as an Expectant Dad",
        desc: "Practical steps to calm your mind so you can show up fully for the people you love.",
        readTime: "6 min read",
        tag: "Self-Care",
        content: {
          intro: "Up to 1 in 10 expectant dads experience anxiety or depression during pregnancy. Acknowledging this is strength, not weakness.",
          sections: [
            { heading: "🧠 Common Dad Worries (You're Not Alone)", items: ["Will I be a good father?", "Can we afford this?", "What if something goes wrong during birth?", "Will our relationship change?", "Am I ready for this responsibility?"] },
            { heading: "🛠️ Tools That Actually Work", items: ["Name it: Write down your fears in a journal", "Move it: 20-minute walk daily reduces cortisol by 26%", "Talk it: Find one trusted friend or dad group", "Breathe it: 4-7-8 breathing before bed", "Limit it: Reduce doom-scrolling pregnancy horror stories"] },
            { heading: "🤝 When to Seek Support", items: ["Persistent sadness lasting more than 2 weeks", "Inability to sleep even when tired", "Withdrawing from your partner", "Intrusive thoughts about harm", "Talk to your GP — paternal mental health matters"] },
          ],
          tip: "Dad Tip: A calm dad creates a calm home. Taking care of your mental health is one of the most loving things you can do for your family.",
        },
      },
      {
        id: "e3",
        imgKey: "art_fetal_kick",
        title: "Bonding With Your Baby Before Birth",
        desc: "Your connection with your baby starts now — not at the delivery room.",
        readTime: "5 min read",
        tag: "Bonding",
        content: {
          intro: "Babies in the womb can hear voices from around Week 18, recognize patterns from Week 25, and respond to touch. Your bond can start right now.",
          sections: [
            { heading: "🎵 Talk & Sing to Baby", items: ["Read a short story aloud each night", "Sing a simple song — baby will recognize it after birth", "Tell baby about your day, your hopes, your love", "Use baby's name if you've chosen one", "Babies respond to familiar voices with increased movement"] },
            { heading: "✋ Touch & Feel", items: ["Gently press on the belly and wait for a response", "Play the \"kick game\" — press where baby kicked", "Warm your hands before touching her belly", "Try this at the same time each day — babies have rhythms"] },
            { heading: "📸 Create Memories", items: ["Take weekly bump photos together", "Write a letter to your baby each month", "Start a \"Dad's Journal\" — your thoughts, fears, hopes", "Attend every ultrasound you can"] },
          ],
          tip: "Dad Tip: The moment you feel that first kick under your hand, everything changes. Make time for it every day.",
        },
      },
    ],
  },
  practical: {
    id: "practical",
    icon: "📋",
    color: "#2E8B7A",
    colorLight: "#E0F2EF",
    title: "Practical Preparation",
    subtitle: "Checklists and daily essentials.",
    bannerKey: "banner_practical",
    description: "From nursery setup to financial planning — the practical side of becoming a dad, broken down into clear, manageable steps.",
    articles: [
      {
        id: "p1",
        imgKey: "art_checklist",
        title: "Week-by-Week Dad's Preparation Checklist",
        desc: "A clear roadmap of everything to do before baby arrives, organized by trimester.",
        readTime: "9 min read",
        tag: "Checklist",
        content: {
          intro: "Preparation is love in action. This checklist covers the practical essentials — so you can focus on being present when it matters most.",
          sections: [
            { heading: "📅 Weeks 20–28 (Second Trimester)", items: ["Attend the anatomy scan together", "Start researching pediatricians", "Begin budgeting for baby expenses", "Discuss parental leave with your employer", "Start reading one parenting book", "Take a hospital tour"] },
            { heading: "📅 Weeks 28–36 (Early Third Trimester)", items: ["Set up and safety-check the nursery", "Install the car seat (get it checked!)", "Pack the hospital bag", "Finalize your birth plan with her", "Stock up on postpartum essentials", "Freeze 2 weeks of meals"] },
            { heading: "📅 Weeks 36–40 (Final Stretch)", items: ["Know the route to the hospital (test drive it)", "Save the hospital number in your phone", "Arrange pet/plant care for hospital stay", "Charge all devices and cameras", "Review newborn care basics", "Rest — you'll need the energy"] },
          ],
          tip: "Dad Tip: Share this checklist with her. Doing it together turns tasks into team moments.",
        },
      },
      {
        id: "p2",
        imgKey: "art_nutrition",
        title: "Nutrition Support: What to Cook This Week",
        desc: "Iron-rich, nausea-friendly, and third-trimester-approved meals you can actually make.",
        readTime: "6 min read",
        tag: "Nutrition",
        content: {
          intro: "One of the most practical ways to support your partner is through food. In the third trimester, she needs iron, calcium, omega-3s, and frequent small meals.",
          sections: [
            { heading: "🥗 Iron-Rich Meals (Anemia Prevention)", items: ["Lentil soup with spinach and lemon", "Beef stir-fry with broccoli and sesame", "Chickpea and sweet potato curry", "Fortified oatmeal with dried apricots", "Tip: Pair with Vitamin C to boost iron absorption"] },
            { heading: "🐟 Omega-3 Boosters (Brain Development)", items: ["Baked salmon with roasted vegetables", "Sardine toast with avocado", "Walnut and berry smoothie", "Chia seed pudding with mango", "Avoid high-mercury fish: swordfish, king mackerel"] },
            { heading: "🌙 Late-Night Snack Ideas", items: ["Warm milk with honey (promotes sleep)", "Banana with almond butter", "Whole grain crackers with hummus", "Greek yogurt with berries", "Small bowl of oatmeal"] },
          ],
          tip: "Dad Tip: Batch cook on Sundays. Having healthy food ready means she eats well even on exhausting days.",
        },
      },
      {
        id: "p3",
        imgKey: "art_hospital_bag",
        title: "Setting Up a Safe & Cozy Nursery",
        desc: "Everything you need to create a safe, functional, and beautiful space for your newborn.",
        readTime: "7 min read",
        tag: "Nursery",
        content: {
          intro: "The nursery doesn't need to be perfect — it needs to be safe and functional. Here's what actually matters.",
          sections: [
            { heading: "🛏️ Sleep Safety Essentials", items: ["Firm, flat mattress — no soft bedding in crib", "Crib meets current safety standards", "Room temperature: 68–72°F (20–22°C)", "No pillows, bumpers, or loose toys in sleep space", "White noise machine helps baby (and you) sleep"] },
            { heading: "🔒 Baby-Proofing Basics", items: ["Secure all furniture to walls (tip-over risk)", "Cover all electrical outlets", "Remove cords and blind strings from reach", "Install baby monitor before due date", "Check for recalled products on CPSC.gov"] },
            { heading: "✨ Nice-to-Have Touches", items: ["Blackout curtains for daytime naps", "Comfortable nursing chair for night feeds", "Soft rug for tummy time", "Organized diaper station at arm's reach", "A small bookshelf — reading starts from day one"] },
          ],
          tip: "Dad Tip: Build the crib together. It's a small thing that becomes a big memory.",
        },
      },
    ],
  },
  communication: {
    id: "communication",
    icon: "💬",
    color: "#7B5EA7",
    colorLight: "#EDE7F6",
    title: "Communication",
    subtitle: "Build trust and reduce stress together.",
    bannerKey: "banner_communication",
    description: "Strong communication is the foundation of strong parenting. Learn how to navigate tough conversations, express your needs, and grow closer through this journey.",
    articles: [
      {
        id: "c1",
        imgKey: "art_communication",
        title: "Having the Hard Conversations Before Baby Arrives",
        desc: "Parenting styles, finances, family boundaries — the talks that prevent conflict later.",
        readTime: "8 min read",
        tag: "Relationship",
        content: {
          intro: "The couples who talk about the hard stuff before baby arrives navigate new parenthood with far less conflict. These conversations are acts of love.",
          sections: [
            { heading: "💰 Money & Leave", items: ["How long will each of you take parental leave?", "Who manages finances during leave?", "What's the budget for baby's first year?", "Will one parent reduce work hours?", "Emergency fund: do you have 3 months saved?"] },
            { heading: "👨‍👩‍👧 Parenting Philosophy", items: ["How were you each raised — what do you want to keep or change?", "Breastfeeding vs. formula — no judgment, just a plan", "Sleep training: what approach feels right?", "Screen time rules (yes, start thinking now)", "Discipline philosophy — discuss before you need it"] },
            { heading: "👪 Family Boundaries", items: ["How much involvement do grandparents have?", "Who visits first, and for how long?", "Unsolicited advice — how will you handle it together?", "Your home, your rules — agree on this as a team", "Postpartum support: who can you call at 3am?"] },
          ],
          tip: "Dad Tip: Start with \"I feel…\" not \"You always…\". Frame these as team planning, not confrontation.",
        },
      },
      {
        id: "c2",
        imgKey: "art_emotions",
        title: "Understanding Her Love Language During Pregnancy",
        desc: "How she needs to feel loved might shift — here's how to adapt and stay connected.",
        readTime: "5 min read",
        tag: "Connection",
        content: {
          intro: "Pregnancy often shifts how your partner experiences love. What worked before may not work now. Tuning in to her current needs is the key to staying connected.",
          sections: [
            { heading: "🎁 Acts of Service (Most Common Shift)", items: ["Take over a chore she usually does without being asked", "Prepare her favorite snack before she mentions it", "Handle logistics (appointments, insurance, nursery)", "Run her a warm bath after a long day", "\"What can I take off your plate today?\""] },
            { heading: "🤗 Physical Touch (Adapted)", items: ["Gentle back rubs without expecting anything in return", "Hold her hand during appointments", "Foot massage before bed", "Spooning with a pillow between her knees", "Ask before touching her belly — it's her body"] },
            { heading: "💬 Words of Affirmation", items: ["\"You're going to be an amazing mom\"", "\"I notice how hard you're working to grow our baby\"", "\"You look beautiful\" — mean it, say it often", "\"I'm so lucky to be doing this with you\"", "Leave a sticky note on the mirror"] },
          ],
          tip: "Dad Tip: Ask her directly: \"What makes you feel most loved right now?\" The answer might surprise you.",
        },
      },
      {
        id: "c3",
        imgKey: "art_massage",
        title: "Navigating Conflict Without Escalation",
        desc: "Disagreements are normal. Here's how to fight fair and come out stronger.",
        readTime: "6 min read",
        tag: "Conflict",
        content: {
          intro: "Pregnancy amplifies emotions for both of you. Learning to navigate disagreements without escalation is one of the most important skills you can build before baby arrives.",
          sections: [
            { heading: "🛑 The Pause Technique", items: ["When tension rises, say: \"I need 10 minutes to think\"", "Walk away physically — not emotionally", "Come back calmer with \"I want to understand your perspective\"", "Never storm out or slam doors", "Agree on a pause signal beforehand"] },
            { heading: "🔄 Repair Attempts", items: ["Use humor gently (not sarcastically)", "Touch her arm — physical reconnection works", "Say \"I'm sorry\" without \"but\"", "Acknowledge her point before making yours", "\"We're on the same team\" — remind each other"] },
            { heading: "📋 Ground Rules for Arguments", items: ["No bringing up old issues", "No name-calling or contempt", "Take turns speaking — really listen", "Focus on the issue, not the person", "End with a plan, not a winner"] },
          ],
          tip: "Dad Tip: The goal of an argument isn't to win — it's to understand. If you both feel heard, you both win.",
        },
      },
    ],
  },
};

// ─── Featured Articles (for Library landing) ──────────────────────────────────
export const FEATURED_ARTICLES: { categoryId: string; articleId: string }[] = [
  { categoryId: "hospital", articleId: "h1" },
  { categoryId: "emotional", articleId: "e2" },
  { categoryId: "practical", articleId: "p1" },
  { categoryId: "communication", articleId: "c1" },
];

// Helper to get article by id
export function getArticle(categoryId: string, articleId: string): Article | undefined {
  return LIBRARY_CATEGORIES[categoryId]?.articles.find((a) => a.id === articleId);
}

export function getCategory(categoryId: string): LibraryCategory | undefined {
  return LIBRARY_CATEGORIES[categoryId];
}
