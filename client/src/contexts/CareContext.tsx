/**
 * CareContext — Global state management for Medical Support module
 * Manages: hospitals, appointments, risk alerts, emergency contacts, saved reports, favorites
 */
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { usePregnancy } from "@/hooks/usePregnancy";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Hospital {
  id: number;
  name: string;
  type: string;
  distance: string;
  distanceKm: number;
  rating: number;
  reviews: number;
  phone: string;
  address: string;
  hours: string;
  tags: string[];
  color: string;
  image: string;
  description: string;
  departments: string[];
  waitTime: string;
  beds: number;
  lat: number;
  lng: number;
  isFavorite?: boolean;
}

export interface Appointment {
  id: number;
  title: string;
  doctor: string;
  specialty: string;
  hospital: string;
  address: string;
  date: string;
  dateISO: string;
  time: string;
  duration: string;
  type: "routine" | "test" | "scan" | "consultation";
  status: "confirmed" | "pending" | "completed" | "cancelled";
  notes: string;
  checklist: { item: string; done: boolean }[];
  reminder: string;
  color: string;
}

export interface RiskAlert {
  id: number;
  title: string;
  severity: "high" | "medium" | "low";
  due: string;
  desc: string;
  category: string;
  dismissed: boolean;
  actionLabel?: string;
}

export interface EmergencyContact {
  id: number;
  label: string;
  number: string;
  type: "emergency" | "hospital" | "midwife" | "other";
  color: string;
  isFavorite: boolean;
}

export interface SavedReport {
  id: number;
  date: string;
  gestationalAge: string;
  reportType: string;
  overallStatus: "normal" | "attention" | "concern";
  thumbnail?: string;
  metrics: { label: string; value: string; unit: string; status: string }[];
}

// ─── Initial Data ─────────────────────────────────────────────────────────────

const initialHospitals: Hospital[] = [
  {
    id: 1,
    name: "King's College Hospital",
    type: "Maternity & Women's Health",
    distance: "1.2 km",
    distanceKm: 1.2,
    rating: 4.8,
    reviews: 312,
    phone: "+44 20 3299 9000",
    address: "Denmark Hill, London SE5 9RS",
    hours: "24/7 Emergency",
    tags: ["Maternity", "NICU", "24h"],
    color: "blue",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663736995811/4YGZMptmaYGwTto6XeuKDA/hospital-hero-AnpypQ7nV4MBXZZD9UQWzV.webp",
    description: "King's College Hospital is one of London's leading NHS teaching hospitals, renowned for its specialist maternity services, high-risk pregnancy care, and Level 3 NICU. The Golden Jubilee Wing provides world-class obstetric care around the clock.",
    departments: ["Maternity Ward", "NICU", "Fetal Medicine", "Prenatal Diagnostics", "Emergency"],
    waitTime: "~15 min",
    beds: 120,
    lat: 51.4685,
    lng: -0.0934,
    isFavorite: true,
  },
  {
    id: 2,
    name: "St Thomas' Hospital",
    type: "OB/GYN Specialist",
    distance: "2.8 km",
    distanceKm: 2.8,
    rating: 4.6,
    reviews: 189,
    phone: "+44 20 7188 7188",
    address: "Westminster Bridge Rd, London SE1 7EH",
    hours: "Mon–Sat 8am–8pm",
    tags: ["OB/GYN", "Prenatal", "Lab"],
    color: "emerald",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80",
    description: "St Thomas' Hospital, part of Guy's and St Thomas' NHS Foundation Trust, offers outstanding prenatal and postnatal care on the South Bank. Its midwifery-led unit and specialist obstetric team support all birth choices.",
    departments: ["OB/GYN", "Prenatal Lab", "Ultrasound", "Midwifery Unit"],
    waitTime: "~30 min",
    beds: 45,
    lat: 51.4985,
    lng: -0.1187,
    isFavorite: false,
  },
  {
    id: 3,
    name: "University College Hospital",
    type: "Full-Service Hospital",
    distance: "4.1 km",
    distanceKm: 4.1,
    rating: 4.5,
    reviews: 521,
    phone: "+44 20 3456 7890",
    address: "235 Euston Rd, London NW1 2BU",
    hours: "24/7 Emergency",
    tags: ["Emergency", "Surgery", "ICU"],
    color: "violet",
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&q=80",
    description: "University College Hospital is a major NHS teaching hospital in central London offering comprehensive emergency, surgical, and specialist maternity services. The Elizabeth Garrett Anderson Wing provides dedicated women's health care.",
    departments: ["Emergency", "Surgery", "ICU", "Maternity", "Radiology"],
    waitTime: "~45 min",
    beds: 350,
    lat: 51.5246,
    lng: -0.1340,
    isFavorite: false,
  },
  {
    id: 4,
    name: "Chelsea & Westminster Hospital",
    type: "Prenatal Specialist",
    distance: "5.3 km",
    distanceKm: 5.3,
    rating: 4.7,
    reviews: 244,
    phone: "+44 20 3315 8000",
    address: "369 Fulham Rd, London SW10 9NH",
    hours: "Mon–Fri 7am–9pm, Sat 8am–4pm",
    tags: ["Prenatal", "High-Risk", "Counselling"],
    color: "rose",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&q=80",
    description: "Chelsea & Westminster Hospital is a leading NHS trust in west London, specialising in high-risk pregnancy management, fetal medicine, and comprehensive prenatal education. The Birth Centre offers personalised care for every family.",
    departments: ["High-Risk OB", "Fetal Medicine", "Genetic Counselling", "Prenatal Education"],
    waitTime: "~20 min",
    beds: 60,
    lat: 51.4839,
    lng: -0.1822,
    isFavorite: false,
  },
];

const initialAppointments: Appointment[] = [
  {
    id: 1,
    title: "24-Week Checkup",
    doctor: "Dr. Sarah Chen",
    specialty: "OB/GYN",
    hospital: "King's College Hospital",
    address: "Denmark Hill, London SE5 9RS",
    date: "Jun 12, 2026",
    dateISO: "2026-06-12",
    time: "10:30 AM",
    duration: "45 min",
    type: "routine",
    status: "confirmed",
    notes: "Bring NHS maternity notes and previous scan reports",
    checklist: [
      { item: "Bring NHS maternity notes", done: true },
      { item: "Previous ultrasound reports", done: false },
      { item: "List of current medications", done: true },
      { item: "Questions for the doctor", done: false },
    ],
    reminder: "1 day before",
    color: "blue",
  },
  {
    id: 2,
    title: "Glucose Tolerance Test",
    doctor: "Dr. James Park",
    specialty: "Endocrinology",
    hospital: "St Thomas' Hospital",
    address: "Westminster Bridge Rd, London SE1 7EH",
    date: "Jun 18, 2026",
    dateISO: "2026-06-18",
    time: "8:00 AM",
    duration: "2 hours",
    type: "test",
    status: "confirmed",
    notes: "Fast for 8 hours before the test. No water after midnight.",
    checklist: [
      { item: "Fast for 8 hours", done: false },
      { item: "Bring GP referral letter", done: true },
      { item: "Wear comfortable clothing", done: false },
    ],
    reminder: "2 days before",
    color: "amber",
  },
  {
    id: 3,
    title: "Anatomy Ultrasound",
    doctor: "Dr. Maria Lopez",
    specialty: "Radiology",
    hospital: "King's College Hospital",
    address: "Denmark Hill, London SE5 9RS",
    date: "Jun 25, 2026",
    dateISO: "2026-06-25",
    time: "2:15 PM",
    duration: "30 min",
    type: "scan",
    status: "pending",
    notes: "Drink 4 glasses of water 1 hour before. Do not empty bladder.",
    checklist: [
      { item: "Drink 4 glasses of water 1hr before", done: false },
      { item: "Bring partner if possible", done: false },
      { item: "Bring previous scan reports", done: false },
    ],
    reminder: "1 day before",
    color: "violet",
  },
];

const initialRiskAlerts: RiskAlert[] = [
  {
    id: 1,
    title: "Gestational Diabetes Screening",
    severity: "medium",
    due: "Due in 2 weeks",
    desc: "Glucose tolerance test is recommended at 24–28 weeks of pregnancy. Schedule your test soon to stay on track.",
    category: "Screening",
    dismissed: false,
    actionLabel: "Schedule Test",
  },
  {
    id: 2,
    title: "Blood Pressure Monitoring",
    severity: "low",
    due: "Ongoing",
    desc: "Monitor blood pressure weekly. Report any readings above 140/90 mmHg to your midwife or doctor immediately.",
    category: "Monitoring",
    dismissed: false,
    actionLabel: "Log Reading",
  },
  {
    id: 3,
    title: "Iron Supplement Reminder",
    severity: "low",
    due: "Daily",
    desc: "Your last haemoglobin reading was borderline low (11.2 g/dL). Ensure you're taking prescribed iron supplements daily.",
    category: "Medication",
    dismissed: false,
    actionLabel: "Mark as Taken",
  },
];

const initialEmergencyContacts: EmergencyContact[] = [
  { id: 1, label: "Emergency (999)", number: "999", type: "emergency", color: "red", isFavorite: true },
  { id: 2, label: "NHS 111 (Non-Emergency)", number: "111", type: "hospital", color: "blue", isFavorite: true },
  { id: 3, label: "King's Maternity Unit", number: "+44 20 3299 9000", type: "hospital", color: "blue", isFavorite: true },
  { id: 4, label: "Midwife Helpline", number: "+44 20 3299 3637", type: "midwife", color: "emerald", isFavorite: false },
  { id: 5, label: "Poison Control (UK)", number: "0344 892 0111", type: "other", color: "amber", isFavorite: false },
  { id: 6, label: "Dr. Sarah Chen", number: "+44 7700 900543", type: "other", color: "violet", isFavorite: false },
];

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  // Pregnancy info
  pregnancyWeek: number;
  dueDate: string;
  partnerName: string;

  // Hospitals
  hospitals: Hospital[];
  toggleHospitalFavorite: (id: number) => void;

  // Appointments
  appointments: Appointment[];
  addAppointment: (appt: Omit<Appointment, "id">) => void;
  updateAppointment: (id: number, updates: Partial<Appointment>) => void;
  cancelAppointment: (id: number) => void;
  toggleChecklistItem: (apptId: number, itemIndex: number) => void;

  // Risk alerts
  riskAlerts: RiskAlert[];
  dismissAlert: (id: number) => void;
  undismissAlert: (id: number) => void;

  // Emergency contacts
  emergencyContacts: EmergencyContact[];
  toggleContactFavorite: (id: number) => void;

  // Saved reports
  savedReports: SavedReport[];
  addSavedReport: (report: Omit<SavedReport, "id">) => void;

  // UI state
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const CareContext = createContext<AppContextValue | null>(null);

export function CareProvider({ children }: { children: ReactNode }) {
  const { currentWeek, dueDateFormatted, partnerName: dbPartnerName } = usePregnancy();
  const [hospitals, setHospitals] = useState<Hospital[]>(initialHospitals);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>(initialRiskAlerts);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(initialEmergencyContacts);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [activeTab, setActiveTab] = useState("care");

  const toggleHospitalFavorite = useCallback((id: number) => {
    setHospitals((prev) =>
      prev.map((h) => (h.id === id ? { ...h, isFavorite: !h.isFavorite } : h))
    );
  }, []);

  const addAppointment = useCallback((appt: Omit<Appointment, "id">) => {
    setAppointments((prev) => [
      ...prev,
      { ...appt, id: Date.now() },
    ]);
  }, []);

  const updateAppointment = useCallback((id: number, updates: Partial<Appointment>) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  const cancelAppointment = useCallback((id: number) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
    );
  }, []);

  const toggleChecklistItem = useCallback((apptId: number, itemIndex: number) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id !== apptId) return a;
        const checklist = a.checklist.map((item, i) =>
          i === itemIndex ? { ...item, done: !item.done } : item
        );
        return { ...a, checklist };
      })
    );
  }, []);

  const dismissAlert = useCallback((id: number) => {
    setRiskAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a))
    );
  }, []);

  const undismissAlert = useCallback((id: number) => {
    setRiskAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, dismissed: false } : a))
    );
  }, []);

  const toggleContactFavorite = useCallback((id: number) => {
    setEmergencyContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  }, []);

  const addSavedReport = useCallback((report: Omit<SavedReport, "id">) => {
    setSavedReports((prev) => [{ ...report, id: Date.now() }, ...prev]);
  }, []);

  return (
    <CareContext.Provider
      value={{
        pregnancyWeek: currentWeek, // always has value via usePregnancy demo defaults
        dueDate: dueDateFormatted ?? "Not set",
        partnerName: dbPartnerName, // always has value via usePregnancy demo defaults
        hospitals,
        toggleHospitalFavorite,
        appointments,
        addAppointment,
        updateAppointment,
        cancelAppointment,
        toggleChecklistItem,
        riskAlerts,
        dismissAlert,
        undismissAlert,
        emergencyContacts,
        toggleContactFavorite,
        savedReports,
        addSavedReport,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </CareContext.Provider>
  );
}

export function useCare() {
  const ctx = useContext(CareContext);
  if (!ctx) throw new Error("useCare must be used within CareProvider");
  return ctx;
}
