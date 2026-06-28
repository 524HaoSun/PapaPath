/**
 * Medically accurate preset data for all 40 weeks of pregnancy.
 * Used as fallback when no live mom data is available.
 */

export type WeekPreset = {
  babySize: string;
  momStatus: {
    items: string[];
    careFocus: string;
  };
  dadPlan: {
    tasks: string[];
    priorityTask: string;
  };
};

const WEEK_PRESETS: Record<number, WeekPreset> = {
  1: {
    babySize: "poppy seed",
    momStatus: {
      items: ["Implantation may be occurring", "Hormones starting to shift", "May feel no symptoms yet"],
      careFocus: "Gentle support & patience",
    },
    dadPlan: {
      tasks: ["Research prenatal vitamins together", "Start a pregnancy journal", "Schedule first OB appointment"],
      priorityTask: "Schedule first OB appointment",
    },
  },
  2: {
    babySize: "sesame seed",
    momStatus: {
      items: ["Hormonal changes beginning", "May experience mild fatigue", "Emotions may feel heightened"],
      careFocus: "Emotional support & rest",
    },
    dadPlan: {
      tasks: ["Confirm first prenatal appointment", "Reduce alcohol at home together", "Ask how she's feeling daily"],
      priorityTask: "Confirm first prenatal appointment",
    },
  },
  3: {
    babySize: "peppercorn",
    momStatus: {
      items: ["Nausea may begin", "Breast tenderness common", "Fatigue increasing"],
      careFocus: "Rest & nausea management",
    },
    dadPlan: {
      tasks: ["Stock ginger tea and crackers at home", "Take over evening chores", "Offer back rubs for tension"],
      priorityTask: "Take over evening chores",
    },
  },
  4: {
    babySize: "poppy seed",
    momStatus: {
      items: ["Morning sickness may start", "Heightened sense of smell", "Mood may fluctuate"],
      careFocus: "Nausea relief & comfort",
    },
    dadPlan: {
      tasks: ["Prepare bland, easy-to-digest meals", "Avoid strong cooking smells", "Be patient with mood changes"],
      priorityTask: "Prepare bland, easy-to-digest meals",
    },
  },
  5: {
    babySize: "apple seed",
    momStatus: {
      items: ["Nausea often peaks this week", "Extreme fatigue is normal", "Frequent urination begins"],
      careFocus: "Rest & hydration support",
    },
    dadPlan: {
      tasks: ["Handle grocery shopping alone", "Ensure she stays hydrated", "Let her rest without guilt"],
      priorityTask: "Handle grocery shopping alone",
    },
  },
  6: {
    babySize: "sweet pea",
    momStatus: {
      items: ["Baby's heartbeat starts", "Nausea may be at its worst", "Emotional sensitivity high"],
      careFocus: "Emotional reassurance",
    },
    dadPlan: {
      tasks: ["Attend the first ultrasound appointment", "Express excitement about the heartbeat", "Research first trimester symptoms"],
      priorityTask: "Attend the first ultrasound appointment",
    },
  },
  7: {
    babySize: "blueberry",
    momStatus: {
      items: ["Nausea and vomiting common", "Food aversions may be strong", "Saliva production may increase"],
      careFocus: "Nausea & food support",
    },
    dadPlan: {
      tasks: ["Ask what foods she can tolerate", "Prepare small frequent meals", "Keep a sick bag discreetly available"],
      priorityTask: "Ask what foods she can tolerate",
    },
  },
  8: {
    babySize: "raspberry",
    momStatus: {
      items: ["Fatigue remains high", "Waistline beginning to expand", "Mood swings continue"],
      careFocus: "Rest & gentle reassurance",
    },
    dadPlan: {
      tasks: ["Take over all heavy lifting", "Plan a gentle walk together", "Share your excitement openly"],
      priorityTask: "Take over all heavy lifting",
    },
  },
  9: {
    babySize: "grape",
    momStatus: {
      items: ["Nausea may begin easing slightly", "Fatigue still significant", "Emotional ups and downs normal"],
      careFocus: "Patience & emotional support",
    },
    dadPlan: {
      tasks: ["Research maternity leave options", "Plan a relaxing date night at home", "Ask about her biggest worries"],
      priorityTask: "Ask about her biggest worries",
    },
  },
  10: {
    babySize: "kumquat",
    momStatus: {
      items: ["Baby bump may become visible", "Nausea often improving", "Energy levels slowly returning"],
      careFocus: "Celebrate progress together",
    },
    dadPlan: {
      tasks: ["Plan a special 10-week celebration", "Start researching baby gear", "Discuss birth preferences"],
      priorityTask: "Discuss birth preferences",
    },
  },
  11: {
    babySize: "fig",
    momStatus: {
      items: ["First trimester nearly over", "Nausea often fading", "Appetite may be returning"],
      careFocus: "Nutritional support",
    },
    dadPlan: {
      tasks: ["Cook nutritious meals together", "Research prenatal classes", "Start planning nursery ideas"],
      priorityTask: "Research prenatal classes",
    },
  },
  12: {
    babySize: "lime",
    momStatus: {
      items: ["End of first trimester approaching", "Risk of miscarriage drops significantly", "Energy often improving"],
      careFocus: "Celebrate this milestone",
    },
    dadPlan: {
      tasks: ["Plan a special announcement together", "Attend the 12-week scan", "Express pride in her strength"],
      priorityTask: "Attend the 12-week scan",
    },
  },
  13: {
    babySize: "lemon",
    momStatus: {
      items: ["Second trimester begins", "Energy often returning", "Nausea usually fading"],
      careFocus: "Renewed energy & planning",
    },
    dadPlan: {
      tasks: ["Start baby name discussions", "Research childcare options", "Plan a babymoon trip"],
      priorityTask: "Start baby name discussions",
    },
  },
  14: {
    babySize: "peach",
    momStatus: {
      items: ["Appetite returning strongly", "Baby bump becoming visible", "Mood often more stable"],
      careFocus: "Nutrition & gentle exercise",
    },
    dadPlan: {
      tasks: ["Join her for prenatal yoga", "Cook iron-rich meals", "Start reading a parenting book"],
      priorityTask: "Cook iron-rich meals",
    },
  },
  15: {
    babySize: "apple",
    momStatus: {
      items: ["Energy may be lower this week", "Back soreness may increase", "Mood or appetite may fluctuate"],
      careFocus: "Rest & emotional support",
    },
    dadPlan: {
      tasks: ["Join the next checkup and take notes", "Ask about sleep, mood, and appetite tonight", "Offer emotional support daily"],
      priorityTask: "Join the next checkup and take notes",
    },
  },
  16: {
    babySize: "avocado",
    momStatus: {
      items: ["Baby movements may be felt soon", "Round ligament pain possible", "Skin changes may appear"],
      careFocus: "Comfort & skin care",
    },
    dadPlan: {
      tasks: ["Learn about round ligament pain", "Offer gentle belly massages", "Set up a comfortable reading nook"],
      priorityTask: "Offer gentle belly massages",
    },
  },
  17: {
    babySize: "pear",
    momStatus: {
      items: ["Baby may start moving", "Weight gain accelerating", "Heartburn may begin"],
      careFocus: "Heartburn relief & comfort",
    },
    dadPlan: {
      tasks: ["Keep antacids stocked at home", "Elevate head of bed slightly", "Celebrate first movements together"],
      priorityTask: "Celebrate first movements together",
    },
  },
  18: {
    babySize: "bell pepper",
    momStatus: {
      items: ["Quickening (baby movements) likely felt", "Back pain may increase", "Sleep becoming harder"],
      careFocus: "Sleep support & back care",
    },
    dadPlan: {
      tasks: ["Buy a pregnancy pillow", "Give a back massage tonight", "Attend the anatomy scan"],
      priorityTask: "Attend the anatomy scan",
    },
  },
  19: {
    babySize: "mango",
    momStatus: {
      items: ["Anatomy scan week", "Baby kicks becoming regular", "Possible leg cramps at night"],
      careFocus: "Scan preparation & rest",
    },
    dadPlan: {
      tasks: ["Prepare questions for the anatomy scan", "Massage her legs before bed", "Start a kick count journal"],
      priorityTask: "Prepare questions for the anatomy scan",
    },
  },
  20: {
    babySize: "banana",
    momStatus: {
      items: ["Halfway milestone reached!", "Baby movements clearly felt", "Belly button may be changing"],
      careFocus: "Celebrate the halfway point",
    },
    dadPlan: {
      tasks: ["Plan a special halfway celebration", "Share your feelings about becoming a dad", "Start the nursery project"],
      priorityTask: "Plan a special halfway celebration",
    },
  },
  21: {
    babySize: "carrot",
    momStatus: {
      items: ["Baby movements becoming stronger", "Braxton Hicks may begin", "Swelling in feet possible"],
      careFocus: "Comfort & swelling relief",
    },
    dadPlan: {
      tasks: ["Foot rub after long days", "Research Braxton Hicks vs real contractions", "Reduce salt in meals together"],
      priorityTask: "Foot rub after long days",
    },
  },
  22: {
    babySize: "papaya",
    momStatus: {
      items: ["Belly growing noticeably", "Stretch marks may appear", "Sleep increasingly difficult"],
      careFocus: "Skin care & sleep support",
    },
    dadPlan: {
      tasks: ["Apply stretch mark oil together", "Optimize bedroom for better sleep", "Take bump photos this week"],
      priorityTask: "Take bump photos this week",
    },
  },
  23: {
    babySize: "large mango",
    momStatus: {
      items: ["Baby can hear voices now", "Shortness of breath may begin", "Backaches common"],
      careFocus: "Talk to baby & back care",
    },
    dadPlan: {
      tasks: ["Read or sing to the bump daily", "Research back support options", "Plan a babymoon if not yet done"],
      priorityTask: "Read or sing to the bump daily",
    },
  },
  24: {
    babySize: "corn",
    momStatus: {
      items: ["Glucose test due soon", "Swelling may increase", "Fatigue returning"],
      careFocus: "Test preparation & rest",
    },
    dadPlan: {
      tasks: ["Accompany her to glucose screening", "Reduce sugary foods at home", "Ensure she rests with feet elevated"],
      priorityTask: "Accompany her to glucose screening",
    },
  },
  25: {
    babySize: "rutabaga",
    momStatus: {
      items: ["Third trimester approaching", "Pelvic pressure increasing", "Heartburn often worse"],
      careFocus: "Comfort & heartburn relief",
    },
    dadPlan: {
      tasks: ["Stock heartburn-friendly foods", "Research birth plan options", "Take a hospital tour together"],
      priorityTask: "Take a hospital tour together",
    },
  },
  26: {
    babySize: "scallion",
    momStatus: {
      items: ["Baby's eyes opening for first time", "Braxton Hicks more frequent", "Sleep very disrupted"],
      careFocus: "Sleep & relaxation",
    },
    dadPlan: {
      tasks: ["Install a white noise machine", "Take over all night-time tasks", "Practice relaxation techniques together"],
      priorityTask: "Practice relaxation techniques together",
    },
  },
  27: {
    babySize: "head of cauliflower",
    momStatus: {
      items: ["Third trimester begins", "Baby very active", "Fatigue and discomfort increasing"],
      careFocus: "Third trimester support",
    },
    dadPlan: {
      tasks: ["Pack the hospital bag together", "Finalize the birth plan", "Increase check-ins throughout the day"],
      priorityTask: "Pack the hospital bag together",
    },
  },
  28: {
    babySize: "eggplant",
    momStatus: {
      items: ["Kick counts become important", "Pelvic girdle pain possible", "Anxiety about birth may increase"],
      careFocus: "Reassurance & birth prep",
    },
    dadPlan: {
      tasks: ["Learn the kick count routine", "Attend birth preparation class", "Discuss labor support role"],
      priorityTask: "Attend birth preparation class",
    },
  },
  29: {
    babySize: "butternut squash",
    momStatus: {
      items: ["Frequent urination returns", "Shortness of breath worsening", "Insomnia common"],
      careFocus: "Sleep & breathing support",
    },
    dadPlan: {
      tasks: ["Ensure bathroom is easy to reach at night", "Prop her up with extra pillows", "Research labor breathing techniques"],
      priorityTask: "Research labor breathing techniques",
    },
  },
  30: {
    babySize: "cabbage",
    momStatus: {
      items: ["Baby's brain developing rapidly", "Heartburn often severe", "Waddling walk begins"],
      careFocus: "Comfort & patience",
    },
    dadPlan: {
      tasks: ["Prepare easy-to-eat small meals", "Walk slowly and patiently with her", "Confirm hospital route and parking"],
      priorityTask: "Confirm hospital route and parking",
    },
  },
  31: {
    babySize: "coconut",
    momStatus: {
      items: ["Braxton Hicks very frequent", "Pelvic pressure intense", "Nesting instinct may kick in"],
      careFocus: "Nesting support & rest",
    },
    dadPlan: {
      tasks: ["Help with nesting projects", "Know the signs of real labor", "Ensure car seat is installed"],
      priorityTask: "Ensure car seat is installed",
    },
  },
  32: {
    babySize: "jicama",
    momStatus: {
      items: ["Baby in head-down position ideally", "Rib pain from baby's position", "Anxiety about labor increasing"],
      careFocus: "Birth anxiety & preparation",
    },
    dadPlan: {
      tasks: ["Practice birth affirmations together", "Finalize hospital bag checklist", "Discuss pain management options"],
      priorityTask: "Practice birth affirmations together",
    },
  },
  33: {
    babySize: "pineapple",
    momStatus: {
      items: ["Lungs and brain maturing", "Extreme fatigue normal", "Emotional sensitivity high"],
      careFocus: "Rest & emotional closeness",
    },
    dadPlan: {
      tasks: ["Plan a special date before baby arrives", "Express love and gratitude daily", "Prepare postpartum support plan"],
      priorityTask: "Plan a special date before baby arrives",
    },
  },
  34: {
    babySize: "cantaloupe",
    momStatus: {
      items: ["Baby gaining weight rapidly", "Sleep nearly impossible", "Pelvic pressure very intense"],
      careFocus: "Maximum comfort support",
    },
    dadPlan: {
      tasks: ["Take over all household tasks", "Set up the nursery completely", "Review newborn care basics"],
      priorityTask: "Take over all household tasks",
    },
  },
  35: {
    babySize: "honeydew melon",
    momStatus: {
      items: ["Baby dropping lower", "Breathing may ease slightly", "Pelvic pressure intensifies"],
      careFocus: "Labor readiness & comfort",
    },
    dadPlan: {
      tasks: ["Confirm pediatrician is selected", "Know when to call the hospital", "Prepare a labor support playlist"],
      priorityTask: "Know when to call the hospital",
    },
  },
  36: {
    babySize: "romaine lettuce",
    momStatus: {
      items: ["Weekly checkups begin", "Baby fully formed and growing", "Cervix may begin dilating"],
      careFocus: "Weekly appointment support",
    },
    dadPlan: {
      tasks: ["Attend every weekly checkup", "Keep phone fully charged at all times", "Finalize work leave arrangements"],
      priorityTask: "Finalize work leave arrangements",
    },
  },
  37: {
    babySize: "winter melon",
    momStatus: {
      items: ["Baby considered full term", "Could go into labor any day", "Nesting instinct very strong"],
      careFocus: "Labor readiness",
    },
    dadPlan: {
      tasks: ["Stay within 30 minutes of home", "Review labor signs one more time", "Charge all devices and cameras"],
      priorityTask: "Stay within 30 minutes of home",
    },
  },
  38: {
    babySize: "pumpkin",
    momStatus: {
      items: ["Mucus plug may release", "Contractions may become regular", "Extreme discomfort is normal"],
      careFocus: "Labor watch & comfort",
    },
    dadPlan: {
      tasks: ["Know the 5-1-1 contraction rule", "Keep hospital bag by the door", "Be present and attentive"],
      priorityTask: "Know the 5-1-1 contraction rule",
    },
  },
  39: {
    babySize: "small watermelon",
    momStatus: {
      items: ["Due date approaching", "Labor could begin any moment", "Anxiety and excitement mixed"],
      careFocus: "Presence & reassurance",
    },
    dadPlan: {
      tasks: ["Be available 24/7 this week", "Reassure her she's doing amazingly", "Rest when she rests"],
      priorityTask: "Be available 24/7 this week",
    },
  },
  40: {
    babySize: "watermelon",
    momStatus: {
      items: ["Due date is here!", "Baby fully ready to meet the world", "Every day is a gift"],
      careFocus: "Presence & celebration",
    },
    dadPlan: {
      tasks: ["Be her rock during labor", "Capture the first moments", "Tell her how proud you are"],
      priorityTask: "Be her rock during labor",
    },
  },
};

export function getWeekData(week: number): WeekPreset {
  const clamped = Math.max(1, Math.min(40, week));
  return WEEK_PRESETS[clamped] ?? WEEK_PRESETS[15]!;
}
