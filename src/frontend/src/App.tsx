import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import {
  Bell,
  BookOpen,
  Calendar,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Megaphone,
  Menu,
  MessageSquare,
  Radio,
  UserCircle,
  Users,
  Video,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import InstallPrompt from "./components/InstallPrompt";
import Announcements from "./pages/Announcements";
import Assignments from "./pages/Assignments";
import Attendance from "./pages/Attendance";
import Dashboard from "./pages/Dashboard";
import Gradebook from "./pages/Gradebook";
import LiveClasses from "./pages/LiveClasses";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Recordings from "./pages/Recordings";
import Schedule from "./pages/Schedule";
import Students from "./pages/Students";

type Page =
  | "dashboard"
  | "students"
  | "attendance"
  | "assignments"
  | "gradebook"
  | "announcements"
  | "schedule"
  | "messages"
  | "recordings"
  | "live-classes"
  | "profile";

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { id: "students", label: "Students", icon: <Users size={20} /> },
  { id: "attendance", label: "Attendance", icon: <CalendarCheck size={20} /> },
  {
    id: "assignments",
    label: "Assignments",
    icon: <ClipboardList size={20} />,
  },
  { id: "gradebook", label: "Gradebook", icon: <BookOpen size={20} /> },
  {
    id: "announcements",
    label: "Announcements",
    icon: <Megaphone size={20} />,
  },
  { id: "schedule", label: "Schedule", icon: <Calendar size={20} /> },
  { id: "messages", label: "Messages", icon: <MessageSquare size={20} /> },
  { id: "recordings", label: "Recordings", icon: <Video size={20} /> },
  { id: "live-classes", label: "Live Classes", icon: <Radio size={20} /> },
  { id: "profile", label: "Profile", icon: <UserCircle size={20} /> },
];

const bottomNavItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Home", icon: <LayoutDashboard size={22} /> },
  { id: "students", label: "Students", icon: <Users size={22} /> },
  { id: "attendance", label: "Attendance", icon: <CalendarCheck size={22} /> },
  {
    id: "assignments",
    label: "Assignments",
    icon: <ClipboardList size={22} />,
  },
];

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [moreOpen, setMoreOpen] = useState(false);

  const [profileName, setProfileName] = useState("");
  const [profileRole, setProfileRole] = useState("");

  useEffect(() => {
    const readProfile = () => {
      try {
        const raw = localStorage.getItem("teachment_profiles");
        if (raw) {
          const list = JSON.parse(raw);
          if (list.length > 0) {
            setProfileName(list[0].name || "");
            setProfileRole(list[0].role || "");
          }
        }
      } catch {}
    };
    readProfile();
    window.addEventListener("storage", readProfile);
    const interval = setInterval(readProfile, 1000);
    return () => {
      window.removeEventListener("storage", readProfile);
      clearInterval(interval);
    };
  }, []);

  const pageComponents: Record<Page, React.ReactNode> = {
    dashboard: <Dashboard onNavigate={setPage} profileName={profileName} />,
    students: <Students />,
    attendance: <Attendance />,
    assignments: <Assignments />,
    gradebook: <Gradebook />,
    announcements: <Announcements />,
    schedule: <Schedule />,
    messages: <Messages />,
    recordings: <Recordings />,
    "live-classes": <LiveClasses />,
    profile: <Profile />,
  };

  const currentLabel =
    navItems.find((n) => n.id === page)?.label ?? "Teachment";

  return (
    <div className="min-h-screen bg-background flex">
      <InstallPrompt />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-card border-r border-border shrink-0 fixed h-full z-20">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <img
            src="/assets/generated/teachment-icon-transparent.dim_128x128.png"
            alt="Teachment"
            className="w-8 h-8 object-contain"
          />
          <span className="font-bold text-lg text-foreground">Teachment</span>
        </div>
        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setPage(item.id)}
              data-ocid={`nav.${item.id}.link`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors ${
                page === item.id
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.label}
              {page === item.id && (
                <ChevronRight size={14} className="ml-auto" />
              )}
            </button>
          ))}
        </nav>
        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              {profileName
                ? profileName
                    .split(" ")
                    .filter(Boolean)
                    .map((w: string) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "U"}
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                {profileName || "Umar Sir"}
              </div>
              <div className="text-xs text-muted-foreground">
                {profileRole || "Teacher"}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-card border-b border-border px-4 md:px-6 h-14 flex items-center gap-4">
          <span className="font-semibold text-foreground text-base md:text-lg flex-1">
            {currentLabel}
          </span>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-muted transition-colors relative"
          >
            <Bell size={20} className="text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              {profileName
                ? profileName
                    .split(" ")
                    .filter(Boolean)
                    .map((w: string) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "U"}
            </div>
            <span className="hidden md:inline text-sm font-medium text-foreground">
              {profileName || "Umar Sir"}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
          {pageComponents[page]}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-20 h-16">
        <div className="flex h-full">
          {bottomNavItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                setPage(item.id);
                setMoreOpen(false);
              }}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                page === item.id && !moreOpen
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          {/* More button */}
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
              moreOpen ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {moreOpen ? <X size={22} /> : <Menu size={22} />}
            More
          </button>
        </div>
      </nav>

      {/* Mobile More Menu Overlay */}
      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-30"
          role="presentation"
          onClick={() => setMoreOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setMoreOpen(false)}
        >
          <div
            className="absolute bottom-16 left-0 right-0 bg-card border-t border-border shadow-lg rounded-t-2xl p-4"
            role="presentation"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              More options
            </div>
            <div className="grid grid-cols-2 gap-2">
              {navItems.slice(4).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setPage(item.id);
                    setMoreOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    page === item.id
                      ? "bg-secondary text-primary"
                      : "bg-muted text-foreground hover:bg-secondary"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Toaster richColors position="top-right" />
    </div>
  );
}
