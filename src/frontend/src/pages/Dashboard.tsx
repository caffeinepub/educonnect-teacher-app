import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Calendar,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  Megaphone,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import type React from "react";
import { useActor } from "../hooks/useActor";

type Page =
  | "dashboard"
  | "students"
  | "attendance"
  | "assignments"
  | "gradebook"
  | "announcements"
  | "schedule"
  | "messages";

type DashboardProps = {
  onNavigate: (page: Page) => void;
};

const CLASS_COLORS = [
  "bg-primary text-primary-foreground",
  "bg-accent text-accent-foreground",
  "bg-chart-3 text-white",
  "bg-chart-4 text-white",
];

const TODAY_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { actor } = useActor();

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: () => actor!.getClasses(),
    enabled: !!actor,
  });

  const { data: announcements, isLoading: annLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => actor!.getAnnouncements(),
    enabled: !!actor,
  });

  const todayDay = new Date().getDay();
  const todayMotokoDay = todayDay === 0 ? 6 : todayDay - 1;

  const { data: todaySchedule, isLoading: schedLoading } = useQuery({
    queryKey: ["schedule", "day", todayMotokoDay],
    queryFn: () => actor!.getScheduleByDay(BigInt(todayMotokoDay)),
    enabled: !!actor,
  });

  const quickActions: {
    icon: React.ReactNode;
    label: string;
    page: Page;
    color: string;
  }[] = [
    {
      icon: <CalendarCheck size={20} />,
      label: "Attendance",
      page: "attendance" as Page,
      color: "bg-blue-50 text-primary",
    },
    {
      icon: <ClipboardList size={20} />,
      label: "Assignment",
      page: "assignments" as Page,
      color: "bg-purple-50 text-accent",
    },
    {
      icon: <Megaphone size={20} />,
      label: "Notice",
      page: "announcements" as Page,
      color: "bg-green-50 text-success",
    },
    {
      icon: <MessageSquare size={20} />,
      label: "Message",
      page: "messages" as Page,
      color: "bg-orange-50 text-chart-4",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Greeting */}
      <div className="bg-primary rounded-2xl p-5 text-primary-foreground">
        <p className="text-sm font-medium opacity-80 mb-1">
          {TODAY_DAYS[todayDay]},{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <h1 className="text-xl font-bold leading-tight">
          Welcome Back,
          <br />
          Ms. Sarah Johnson! 👋
        </h1>
        <p className="text-sm opacity-70 mt-1">Have a great day teaching</p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              type="button"
              key={action.page}
              onClick={() => onNavigate(action.page)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl ${action.color} transition-transform active:scale-95`}
            >
              {action.icon}
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Class Overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Class Overview</h2>
          <button
            type="button"
            onClick={() => onNavigate("students")}
            className="text-xs text-primary font-medium flex items-center gap-0.5"
          >
            View all <ChevronRight size={14} />
          </button>
        </div>
        {classesLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(classes ?? []).map((cls, i) => (
              <div
                key={cls.id}
                className="bg-card rounded-xl p-4 shadow-card border border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {cls.subject} · Section {cls.section}
                    </p>
                  </div>
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${CLASS_COLORS[i % CLASS_COLORS.length]}`}
                  >
                    <BookOpen size={16} />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {cls.studentIds.length} students
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={13} className="text-success" />
                    <span className="text-xs text-muted-foreground">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's Schedule */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Today's Schedule</h2>
          <button
            type="button"
            onClick={() => onNavigate("schedule")}
            className="text-xs text-primary font-medium flex items-center gap-0.5"
          >
            Full schedule <ChevronRight size={14} />
          </button>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          {schedLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : (todaySchedule ?? []).length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No classes scheduled today
            </div>
          ) : (
            <div className="divide-y divide-border">
              {(todaySchedule ?? [])
                .sort((a, b) => Number(a.periodNumber) - Number(b.periodNumber))
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="text-xs text-muted-foreground w-16 shrink-0">
                      {entry.startTime}
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {entry.subject}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Room {entry.roomNumber}
                      </div>
                    </div>
                    <div className="text-xs text-primary font-medium shrink-0">
                      P{Number(entry.periodNumber)}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Announcements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">
            Recent Announcements
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("announcements")}
            className="text-xs text-primary font-medium flex items-center gap-0.5"
          >
            View all <ChevronRight size={14} />
          </button>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          {annLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : (announcements ?? []).length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No announcements
            </div>
          ) : (
            <div className="divide-y divide-border">
              {(announcements ?? []).slice(0, 3).map((ann) => (
                <div key={ann.id} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                      <Megaphone size={14} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {ann.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {ann.body}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {ann.createdDate}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
