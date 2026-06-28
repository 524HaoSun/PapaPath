import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CareProvider } from "./contexts/CareContext";
import Home from "./pages/Home";
import MomStatusPage from "./pages/MomStatus";
import MumMonitor from "./pages/MumMonitor";
import CareHospital from "./pages/CareHospital";
import HospitalDetail from "./pages/HospitalDetail";
import AllHospitals from "./pages/AllHospitals";
import AllAppointments from "./pages/AllAppointments";
import AppointmentDetail from "./pages/AppointmentDetail";
import AllAlerts from "./pages/AllAlerts";
import AllReports from "./pages/AllReports";
import ReportScanner from "./pages/ReportScanner";
import TriageGuide from "./pages/TriageGuide";
import DadCommunity from "./pages/DadCommunity";
import CategoryDetail from "./pages/CategoryDetail";
import ArticleDetail from "./pages/ArticleDetail";
import AIChatPage from "./pages/AIChatPage";
import PostDetail from "./pages/PostDetail";
import Settings from "./pages/Settings";
import SplashScreen from "./pages/SplashScreen";

/** Redirect to /splash on first visit of each session */
function SplashRedirect() {
  const [location, navigate] = useLocation();
  useEffect(() => {
    // Only redirect when landing on root path and splash hasn't been seen yet
    if (location === "/" && !sessionStorage.getItem("splash_seen")) {
      navigate("/splash", { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function Router() {
  return (
    <>
      <SplashRedirect />
      <Switch>
      <Route path={"/splash"} component={SplashScreen} />
      <Route path={"/"} component={Home} />
      <Route path={"/mom-status"} component={MomStatusPage} />
      <Route path={"/mum-monitor"} component={MumMonitor} />
      {/* Medical Support / Care routes */}
      <Route path={"/care"} component={CareHospital} />
      <Route path={"/care/hospital/:id"} component={HospitalDetail} />
      <Route path={"/care/hospitals"} component={AllHospitals} />
      <Route path={"/care/appointments"} component={AllAppointments} />
      <Route path={"/care/appointment/:id"} component={AppointmentDetail} />
      <Route path={"/care/alerts"} component={AllAlerts} />
      <Route path={"/care/reports"} component={AllReports} />
      <Route path={"/care/scan"} component={ReportScanner} />
      <Route path={"/care/triage"} component={TriageGuide} />
      {/* Dad Community routes */}
      <Route path={"/community"} component={DadCommunity} />
      <Route path={"/community/category/:categoryId"} component={CategoryDetail} />
      <Route path={"/community/article/:categoryId/:articleId"} component={ArticleDetail} />
      <Route path={"/community/ai-chat"} component={AIChatPage} />
      <Route path={"/community/post/:postId"} component={PostDetail} />
      {/* Settings */}
      <Route path={"/settings"} component={Settings} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
    </>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  const basePath = import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <CareProvider>
          <TooltipProvider>
            <Toaster />
            <WouterRouter base={basePath}>
              <Router />
            </WouterRouter>
          </TooltipProvider>
        </CareProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
