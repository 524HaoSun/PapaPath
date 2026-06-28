/**
 * Pregnancy Data Store
 * Complete week-by-week data for all 40 weeks of pregnancy
 * Covers: fetus images, sizes, descriptions, baby insights, mom status, dad plan
 */

export interface WeekData {
  week: number;
  day: number;
  fetusImage: string;
  fetusSize: string;
  title: string;
  description: string;
  trimester: 1 | 2 | 3;
  babyInsights: { icon: string; label: string }[];
  momStatus: string[];
  dadPlan: string[];
}

// Fetus image map — 9 key images covering all 40 weeks
const FETUS_IMAGES: Record<number, string> = {
  4:  "https://d2xsxph8kpxj0f.cloudfront.net/310519663242146660/YgHQKdD9wY2Ut466VSfzNe/fetus-week4-i2DBL3D433dbPKeGDQ98Po.webp",
  8:  "https://d2xsxph8kpxj0f.cloudfront.net/310519663242146660/YgHQKdD9wY2Ut466VSfzNe/fetus-week8-638zj5XN6h5QFv4KqJnFtj.webp",
  12: "https://d2xsxph8kpxj0f.cloudfront.net/310519663242146660/YgHQKdD9wY2Ut466VSfzNe/fetus-week12-84Uu8oaDsktGvb8E9XqNck.webp",
  15: "https://d2xsxph8kpxj0f.cloudfront.net/310519663242146660/YgHQKdD9wY2Ut466VSfzNe/fetus-orb-YEkT2j8KjbjQQE6W7Es4CN.webp",
  20: "https://d2xsxph8kpxj0f.cloudfront.net/310519663242146660/YgHQKdD9wY2Ut466VSfzNe/fetus-week20-mYSw3vRTFBgbifTDApjWF4.webp",
  25: "https://d2xsxph8kpxj0f.cloudfront.net/310519663242146660/YgHQKdD9wY2Ut466VSfzNe/fetus-week25-2EGXMkGY6Fkak7xDhaxDpW.webp",
  30: "https://d2xsxph8kpxj0f.cloudfront.net/310519663242146660/YgHQKdD9wY2Ut466VSfzNe/fetus-week30-ijNZCRNB8NYfz9MRicARDK.webp",
  35: "https://d2xsxph8kpxj0f.cloudfront.net/310519663242146660/YgHQKdD9wY2Ut466VSfzNe/fetus-week35-VCR8JcFTCymk76wh6aK8GD.webp",
  40: "https://d2xsxph8kpxj0f.cloudfront.net/310519663242146660/YgHQKdD9wY2Ut466VSfzNe/fetus-week40-MKCFvFMPNF26FTGyQkrLE3.webp",
};

export function getFetusImage(week: number): string {
  const keys = Object.keys(FETUS_IMAGES).map(Number).sort((a, b) => a - b);
  let closest = keys[0];
  for (const k of keys) {
    if (k <= week) closest = k;
  }
  return FETUS_IMAGES[closest];
}

function trimester(week: number): 1 | 2 | 3 {
  if (week <= 13) return 1;
  if (week <= 27) return 2;
  return 3;
}

const TRIMESTER_NAMES = { 1: "First trimester", 2: "Second trimester", 3: "Third trimester" };
export function getTrimesterName(week: number) {
  return TRIMESTER_NAMES[trimester(week)];
}

// Baby size comparisons — all 40 weeks
const SIZES: Record<number, string> = {
  1: "tiny cluster of cells", 2: "poppy seed", 3: "sesame seed", 4: "poppy seed",
  5: "apple seed", 6: "sweet pea", 7: "blueberry", 8: "raspberry",
  9: "grape", 10: "kumquat", 11: "fig", 12: "lime",
  13: "lemon", 14: "peach", 15: "apple", 16: "avocado",
  17: "pear", 18: "bell pepper", 19: "mango", 20: "banana",
  21: "carrot", 22: "papaya", 23: "grapefruit", 24: "ear of corn",
  25: "rutabaga", 26: "scallion", 27: "cauliflower", 28: "eggplant",
  29: "butternut squash", 30: "cabbage", 31: "coconut", 32: "jicama",
  33: "pineapple", 34: "cantaloupe", 35: "honeydew melon", 36: "romaine lettuce",
  37: "winter melon", 38: "leek", 39: "watermelon", 40: "pumpkin",
};

// Complete descriptions — all 40 weeks
const DESCRIPTIONS: Record<number, string> = {
  1:  "Conception has just occurred. A single fertilized cell is beginning the most remarkable journey of all.",
  2:  "The fertilized egg is traveling toward the uterus. Cell division is happening at a rapid pace.",
  3:  "Implantation is underway. Your baby is now a tiny ball of cells nestled into the uterine wall.",
  4:  "The embryo has just implanted. A tiny cluster of cells is forming your baby's foundation.",
  5:  "The neural tube is forming — this will become the brain and spinal cord. A heartbeat may begin.",
  6:  "The heart is beating! Tiny arm and leg buds are emerging. The embryo is about the size of a sweet pea.",
  7:  "Baby's face is taking shape — nostrils, mouth, and eyes are forming. The brain is growing fast.",
  8:  "Major organs are forming. Your baby's heart is beating and tiny limbs are budding.",
  9:  "Fingers and toes are beginning to separate. The embryo is now officially called a fetus.",
  10: "Baby can make small movements now. Vital organs are in place and starting to function.",
  11: "Fingernails are forming. Baby is practicing breathing movements in the amniotic fluid.",
  12: "The first trimester is nearly complete. All vital organs are in place and the risk of miscarriage drops significantly.",
  13: "Baby can yawn, hiccup, and suck. The vocal cords are forming. You're entering the second trimester!",
  14: "Baby is making facial expressions. Lanugo — fine downy hair — is beginning to cover the body.",
  15: "Your baby is growing fast this week. Hearing is developing and tiny bones are hardening.",
  16: "Baby's eyes can move, though lids remain closed. Toenails are forming and the skeleton is strengthening.",
  17: "Baby is putting on fat for warmth and energy. The umbilical cord is growing stronger and thicker.",
  18: "Baby can hear sounds from outside the womb. Ears are fully formed and in their final position.",
  19: "A protective coating called vernix is forming on baby's skin. Sensory development is accelerating.",
  20: "Halfway there! Baby can hear your voice and is very active inside the womb.",
  21: "Baby is swallowing amniotic fluid regularly — great practice for feeding after birth.",
  22: "Baby's lips and eyebrows are more defined. The inner ear is fully developed for balance.",
  23: "Baby can sense light through the womb. Skin is still translucent but becoming more opaque.",
  24: "Baby's lungs are developing air sacs. Taste buds are forming and baby may respond to sweet flavors.",
  25: "Baby's face is fully formed. Tiny fingerprints are developing and hair is growing.",
  26: "Baby's eyes are beginning to open. The brain is entering a period of rapid development.",
  27: "Baby can now recognize your voice. Sleep cycles are becoming more regular.",
  28: "Baby's brain is forming important grooves and indentations. Eyes can blink and detect light.",
  29: "Baby's muscles and lungs are maturing. Head is growing to accommodate the rapidly developing brain.",
  30: "Baby's brain is developing rapidly. Eyes can open and close, and baby may dream during REM sleep.",
  31: "Baby is gaining weight quickly — about half a pound per week now. Immune system is strengthening.",
  32: "Baby's toenails are fully formed. Practice breathing movements are becoming more frequent.",
  33: "Baby's bones are hardening, except for the skull which stays soft for birth. Pupils can dilate.",
  34: "Baby's central nervous system is maturing. Most internal organs are fully developed.",
  35: "Baby is almost ready. Lungs are nearly mature and baby is gaining about an ounce per day.",
  36: "Baby is considered late preterm. Most development is complete — baby is just gaining weight now.",
  37: "Baby is full term! All systems are go. Baby is practicing sucking and swallowing for feeding.",
  38: "Baby's organs are fully mature. The lanugo hair is mostly gone, shed into the amniotic fluid.",
  39: "Baby is ready to meet the world. The placenta is delivering antibodies to boost baby's immune system.",
  40: "Full term! Baby could arrive any day. Everything is in place — you're ready, Dad.",
};

// Complete Baby This Week insights — all 40 weeks, 3 per week
const INSIGHTS: Record<number, { icon: string; label: string }[]> = {
  1:  [{ icon: "🔬", label: "Fertilization complete" }, { icon: "🧬", label: "DNA combining" }, { icon: "✨", label: "Life has begun" }],
  2:  [{ icon: "🌱", label: "Cells dividing fast" }, { icon: "🚀", label: "Traveling to uterus" }, { icon: "💫", label: "Blastocyst forming" }],
  3:  [{ icon: "🏠", label: "Implantation begins" }, { icon: "🔬", label: "Layers forming" }, { icon: "❤️", label: "Heart cells appear" }],
  4:  [{ icon: "🔬", label: "Cells dividing rapidly" }, { icon: "❤️", label: "Heart cells forming" }, { icon: "🌱", label: "Neural tube developing" }],
  5:  [{ icon: "🧠", label: "Neural tube forming" }, { icon: "❤️", label: "Heart may start beating" }, { icon: "🫁", label: "Lung buds appearing" }],
  6:  [{ icon: "❤️", label: "Heart is beating!" }, { icon: "🖐️", label: "Arm & leg buds forming" }, { icon: "👁️", label: "Eye pits developing" }],
  7:  [{ icon: "👃", label: "Nostrils forming" }, { icon: "🧠", label: "Brain growing fast" }, { icon: "😮", label: "Mouth taking shape" }],
  8:  [{ icon: "🫀", label: "Heart is beating" }, { icon: "🦷", label: "Tooth buds forming" }, { icon: "🖐️", label: "Tiny limb buds appear" }],
  9:  [{ icon: "🤏", label: "Fingers separating" }, { icon: "🦶", label: "Toes forming" }, { icon: "🐣", label: "Now called a fetus" }],
  10: [{ icon: "💃", label: "Making small movements" }, { icon: "🫀", label: "Heart fully formed" }, { icon: "🧠", label: "Brain dividing fast" }],
  11: [{ icon: "💅", label: "Fingernails forming" }, { icon: "🫁", label: "Breathing practice" }, { icon: "🦴", label: "Bones developing" }],
  12: [{ icon: "👁️", label: "Eyes moving under lids" }, { icon: "🦴", label: "Bones hardening" }, { icon: "🤏", label: "Fingers separating" }],
  13: [{ icon: "😮", label: "Can yawn & hiccup" }, { icon: "🎙️", label: "Vocal cords forming" }, { icon: "🍭", label: "Taste buds developing" }],
  14: [{ icon: "😊", label: "Making expressions" }, { icon: "🪶", label: "Lanugo hair forming" }, { icon: "🦴", label: "Skeleton strengthening" }],
  15: [{ icon: "👂", label: "Hearing developing" }, { icon: "🖐️", label: "Hands & feet active" }, { icon: "✨", label: "Fine hair growing" }],
  16: [{ icon: "👁️", label: "Eyes can move" }, { icon: "💅", label: "Toenails forming" }, { icon: "🦴", label: "Skeleton strengthening" }],
  17: [{ icon: "🧈", label: "Putting on fat" }, { icon: "💪", label: "Cord growing stronger" }, { icon: "🦴", label: "Cartilage to bone" }],
  18: [{ icon: "👂", label: "Ears fully formed" }, { icon: "🎵", label: "Can hear outside sounds" }, { icon: "💃", label: "Active movements" }],
  19: [{ icon: "🛡️", label: "Vernix coating forming" }, { icon: "🧠", label: "Senses accelerating" }, { icon: "🦴", label: "Bones hardening" }],
  20: [{ icon: "👂", label: "Can hear your voice" }, { icon: "💃", label: "Active kicks & rolls" }, { icon: "🧠", label: "Brain growing fast" }],
  21: [{ icon: "💧", label: "Swallowing fluid" }, { icon: "🍽️", label: "Practicing feeding" }, { icon: "💪", label: "Muscles strengthening" }],
  22: [{ icon: "👄", label: "Lips more defined" }, { icon: "🎯", label: "Inner ear for balance" }, { icon: "🖐️", label: "Grip reflex forming" }],
  23: [{ icon: "☀️", label: "Can sense light" }, { icon: "🎨", label: "Skin becoming opaque" }, { icon: "💪", label: "Gaining strength" }],
  24: [{ icon: "🫁", label: "Air sacs developing" }, { icon: "👅", label: "Taste buds forming" }, { icon: "😴", label: "Sleep cycles forming" }],
  25: [{ icon: "😊", label: "Face fully formed" }, { icon: "🖐️", label: "Fingerprints developing" }, { icon: "👁️", label: "Eyes respond to light" }],
  26: [{ icon: "👁️", label: "Eyes opening" }, { icon: "🧠", label: "Rapid brain growth" }, { icon: "💪", label: "Lungs maturing" }],
  27: [{ icon: "🎙️", label: "Recognizes your voice" }, { icon: "😴", label: "Regular sleep cycles" }, { icon: "🧠", label: "Brain developing fast" }],
  28: [{ icon: "👁️", label: "Eyes can blink" }, { icon: "🧠", label: "Brain forming grooves" }, { icon: "💡", label: "Detects light & dark" }],
  29: [{ icon: "💪", label: "Muscles maturing" }, { icon: "🫁", label: "Lungs developing" }, { icon: "🧠", label: "Head growing fast" }],
  30: [{ icon: "👁️", label: "Eyes open & close" }, { icon: "🧠", label: "Brain developing fast" }, { icon: "😴", label: "May dream in REM" }],
  31: [{ icon: "⚖️", label: "Gaining half lb/week" }, { icon: "🛡️", label: "Immune system building" }, { icon: "🦴", label: "Bones hardening" }],
  32: [{ icon: "💅", label: "Toenails fully formed" }, { icon: "🫁", label: "Breathing practice" }, { icon: "🧠", label: "Brain connections forming" }],
  33: [{ icon: "🦴", label: "Skull stays soft" }, { icon: "👁️", label: "Pupils can dilate" }, { icon: "💪", label: "Gaining weight daily" }],
  34: [{ icon: "🧠", label: "Nervous system maturing" }, { icon: "🫀", label: "Heart fully developed" }, { icon: "⚖️", label: "Nearly full weight" }],
  35: [{ icon: "🫁", label: "Lungs nearly mature" }, { icon: "🍑", label: "Chubby cheeks forming" }, { icon: "🔄", label: "Head-down position" }],
  36: [{ icon: "✅", label: "Late preterm ready" }, { icon: "⚖️", label: "Still gaining weight" }, { icon: "🛡️", label: "Immune boost from mom" }],
  37: [{ icon: "🎉", label: "Full term!" }, { icon: "🍼", label: "Practicing sucking" }, { icon: "💪", label: "All systems ready" }],
  38: [{ icon: "🪶", label: "Lanugo mostly gone" }, { icon: "🫀", label: "Organs fully mature" }, { icon: "😴", label: "Resting & waiting" }],
  39: [{ icon: "🛡️", label: "Antibodies transferring" }, { icon: "💪", label: "Strong and ready" }, { icon: "🌟", label: "Final preparations" }],
  40: [{ icon: "🎉", label: "Fully developed" }, { icon: "💪", label: "Strong and ready" }, { icon: "❤️", label: "Ready to meet you" }],
};

// Complete Mom Status — all 40 weeks
const MOM_STATUS: Record<number, string[]> = {
  1:  ["Cycle just ended", "No symptoms yet", "Good time to start prenatal vitamins"],
  2:  ["Implantation may cause spotting", "Mild cramping is normal", "Stay well hydrated"],
  3:  ["Fatigue may begin", "Breast tenderness possible", "Heightened sense of smell"],
  4:  ["Fatigue is very common now", "Morning sickness may begin", "Mood swings are normal"],
  5:  ["Nausea may start", "Frequent urination begins", "Bloating is common"],
  6:  ["Morning sickness often peaks", "Extreme fatigue is normal", "Food aversions may appear"],
  7:  ["Nausea throughout the day", "Heightened emotions", "Saliva may increase"],
  8:  ["Nausea may peak this week", "Breast tenderness increasing", "Frequent urination expected"],
  9:  ["Fatigue remains high", "Mood can shift quickly", "Constipation is common"],
  10: ["Nausea may begin to ease", "Headaches are possible", "Round ligament pain may start"],
  11: ["Energy slowly returning", "Skin may change", "Appetite may improve"],
  12: ["Morning sickness may ease", "Energy slowly returning", "Appetite improving"],
  13: ["Second trimester begins soon", "Energy levels rising", "Bump becoming visible"],
  14: ["Energy is improving", "Nasal congestion possible", "Skin may glow"],
  15: ["Energy may be lower this week", "Back soreness may increase", "Mood or appetite may fluctuate"],
  16: ["Round ligament pain common", "Appetite increasing", "Feeling more energetic"],
  17: ["Back pain may increase", "Leg cramps possible", "Skin stretching"],
  18: ["Baby movements may be felt", "Heartburn may begin", "Sleep positions changing"],
  19: ["Feeling baby kicks", "Dizziness possible", "Skin darkening in areas"],
  20: ["Baby kicks felt regularly", "Back pain is common", "Sleep may be disrupted"],
  21: ["Braxton Hicks may start", "Swollen ankles possible", "Heartburn increasing"],
  22: ["Stretch marks may appear", "Belly button changing", "Increased appetite"],
  23: ["Shortness of breath possible", "Leg cramps at night", "Skin itching as it stretches"],
  24: ["Swelling in hands and feet", "Heartburn is common", "Difficulty sleeping"],
  25: ["Heartburn may increase", "Swelling in feet and ankles", "Braxton Hicks may start"],
  26: ["Pelvic girdle pain possible", "Increased discharge", "Fatigue returning"],
  27: ["Third trimester approaching", "Rib pain possible", "Frequent bathroom trips"],
  28: ["Shortness of breath increases", "Insomnia may begin", "Colostrum may appear"],
  29: ["Pelvic pressure building", "Backache worsening", "Difficulty finding comfort"],
  30: ["Shortness of breath possible", "Frequent bathroom trips return", "Nesting instinct may kick in"],
  31: ["Braxton Hicks more frequent", "Fatigue is high", "Emotional and reflective"],
  32: ["Heartburn and indigestion", "Sleep is challenging", "Baby movements very strong"],
  33: ["Pelvic pressure increasing", "Frequent urination", "Waddling walk begins"],
  34: ["Lightening may occur", "Nesting instinct strong", "Cervix beginning to change"],
  35: ["Pelvic pressure increasing", "Sleep is challenging", "Colostrum may appear"],
  36: ["Cervix may be dilating", "Increased discharge", "Nesting in full swing"],
  37: ["Contractions may begin", "Pelvic pressure very high", "Anxiety and excitement mixed"],
  38: ["Cervix ripening", "Mucus plug may pass", "Feeling very heavy"],
  39: ["Contractions may increase", "Extreme fatigue", "Emotionally ready"],
  40: ["Contractions may begin", "Cervix is ripening", "Emotional and ready"],
};

// Complete Dad's Weekly Plan — all 40 weeks
const DAD_PLAN: Record<number, string[]> = {
  1:  ["Start taking notes on her cycle", "Research prenatal vitamins together", "Begin learning about early pregnancy"],
  2:  ["Be aware of early signs", "Encourage healthy eating habits", "Reduce stress at home"],
  3:  ["Watch for implantation signs", "Prepare for the pregnancy test", "Create a calm home environment"],
  4:  ["Schedule the first prenatal visit", "Start learning about pregnancy stages", "Be patient with mood changes"],
  5:  ["Research OB/GYN options", "Help manage nausea with ginger tea", "Learn what to expect at first appointment"],
  6:  ["Be understanding about morning sickness", "Keep crackers and snacks handy", "Avoid strong smells at home"],
  7:  ["Attend the first prenatal appointment", "Take notes during the visit", "Ask about prenatal vitamins"],
  8:  ["Attend the first ultrasound", "Help manage morning sickness", "Prepare healthy snacks at home"],
  9:  ["Learn about miscarriage risk reduction", "Be extra patient and supportive", "Research pregnancy-safe exercises"],
  10: ["Celebrate reaching 10 weeks", "Research genetic testing options", "Help with household chores"],
  11: ["Learn about the NT scan", "Prepare questions for the doctor", "Plan a relaxing weekend together"],
  12: ["Celebrate the first trimester milestone", "Share the news with family", "Research prenatal classes"],
  13: ["Announce the pregnancy if ready", "Start planning for baby's room", "Research maternity leave options"],
  14: ["Research baby gear essentials", "Plan a babymoon trip", "Help with body pillow setup for sleep"],
  15: ["Join the next checkup and take notes", "Ask about sleep, mood, and appetite tonight", "Offer emotional support daily"],
  16: ["Research the anatomy scan", "Start a baby name list together", "Help with back massage"],
  17: ["Learn about kick counting", "Research car seat safety", "Plan a date night before third trimester"],
  18: ["Attend the 18-week appointment", "Talk and read to the baby", "Research childbirth classes"],
  19: ["Learn about the anatomy scan results", "Start a pregnancy journal together", "Help with prenatal yoga"],
  20: ["Attend the anatomy scan", "Start planning the nursery", "Talk and sing to the baby"],
  21: ["Research breastfeeding support", "Start assembling baby furniture", "Plan hospital bag contents"],
  22: ["Learn about Braxton Hicks", "Help with swollen feet massage", "Research pediatricians"],
  23: ["Research birth plans", "Practice breathing exercises", "Help with sleep positioning"],
  24: ["Attend the glucose screening", "Finalize nursery plans", "Learn infant CPR basics"],
  25: ["Research childbirth classes", "Prepare a hospital bag checklist", "Give daily foot massages"],
  26: ["Learn about preterm labor signs", "Finalize the birth plan draft", "Research postpartum depression"],
  27: ["Celebrate entering the third trimester soon", "Review birth plan with partner", "Research newborn care basics"],
  28: ["Attend the 28-week appointment", "Discuss birth preferences with doctor", "Learn about Group B Strep test"],
  29: ["Research postpartum support options", "Help with nesting activities", "Practice the hospital route"],
  30: ["Finalize the birth plan", "Practice breathing exercises together", "Stock up on postpartum supplies"],
  31: ["Pack the hospital bag", "Learn about epidural options", "Arrange paternity leave"],
  32: ["Do a hospital tour", "Learn newborn feeding basics", "Help with sleep comfort"],
  33: ["Install the car seat", "Review emergency contacts", "Learn signs of labor"],
  34: ["Confirm pediatrician choice", "Prepare the nursery final touches", "Review birth plan one more time"],
  35: ["Install the car seat", "Have the hospital bag ready", "Stay close and available"],
  36: ["Keep phone charged always", "Know the route to the hospital", "Prepare a labor support playlist"],
  37: ["Be on high alert for labor signs", "Confirm hospital bag is packed", "Practice breathing together daily"],
  38: ["Stay close to home", "Know when to call the doctor", "Rest and prepare mentally"],
  39: ["Be ready to leave at any moment", "Stay calm and reassuring", "Review the birth plan one last time"],
  40: ["Keep phone charged at all times", "Stay calm and supportive", "Trust the process — you've got this"],
};

export function getWeekData(week: number): WeekData {
  const w = Math.max(1, Math.min(40, week));
  return {
    week: w,
    day: Math.round(w * 7 - 3),
    fetusImage: getFetusImage(w),
    fetusSize: SIZES[w] ?? "growing",
    title: `Week ${w}`,
    description: DESCRIPTIONS[w] ?? "Your baby is growing and developing every day.",
    trimester: trimester(w),
    babyInsights: INSIGHTS[w] ?? [
      { icon: "🌱", label: "Growing steadily" },
      { icon: "❤️", label: "Heart beating strong" },
      { icon: "✨", label: "New developments daily" },
    ],
    momStatus: MOM_STATUS[w] ?? ["Symptoms may vary", "Rest is important", "Stay hydrated"],
    dadPlan: DAD_PLAN[w] ?? ["Be present and supportive", "Attend prenatal visits", "Offer help daily"],
  };
}

// ── Legacy check-in (kept for backward compat, badge system uses badgeSystem.ts) ──
export const CHECK_IN_KEY = "dad_companion_checkin";

export interface CheckInData {
  streak: number;
  lastCheckIn: string | null;
  totalDays: number;
  checkedInToday: boolean;
}

export function getCheckInData(): CheckInData {
  try {
    const raw = localStorage.getItem(CHECK_IN_KEY);
    if (!raw) return { streak: 0, lastCheckIn: null, totalDays: 0, checkedInToday: false };
    const data = JSON.parse(raw) as CheckInData;
    const today = new Date().toDateString();
    const lastDate = data.lastCheckIn ? new Date(data.lastCheckIn).toDateString() : null;
    return { ...data, checkedInToday: lastDate === today };
  } catch {
    return { streak: 0, lastCheckIn: null, totalDays: 0, checkedInToday: false };
  }
}

export function doCheckIn(): CheckInData {
  const current = getCheckInData();
  const today = new Date();
  const todayStr = today.toDateString();
  if (current.checkedInToday) return current;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastDate = current.lastCheckIn ? new Date(current.lastCheckIn).toDateString() : null;
  const newStreak = lastDate === yesterday.toDateString() ? current.streak + 1 : 1;
  const updated: CheckInData = {
    streak: newStreak,
    lastCheckIn: today.toISOString(),
    totalDays: current.totalDays + 1,
    checkedInToday: true,
  };
  localStorage.setItem(CHECK_IN_KEY, JSON.stringify(updated));
  return updated;
  void todayStr;
}
