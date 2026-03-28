import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink, Radio, Trash2, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "teachment_live_classes";

interface LiveSession {
  id: string;
  title: string;
  className: string;
  date: string;
  time: string;
  link: string;
  createdAt: number;
}

function getSampleSessions(): LiveSession[] {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  return [
    {
      id: "sample-1",
      title: "Mathematics - Algebra Revision",
      className: "Class 8A",
      date: fmt(tomorrow),
      time: "10:00",
      link: "https://meet.google.com/abc-defg-hij",
      createdAt: Date.now() - 3600000,
    },
    {
      id: "sample-2",
      title: "Science - Chapter 5 Review",
      className: "Class 9B",
      date: fmt(yesterday),
      time: "14:00",
      link: "https://zoom.us/j/123456789",
      createdAt: Date.now() - 86400000,
    },
  ];
}

function loadSessions(): LiveSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.length > 0) return parsed;
    }
  } catch {}
  const samples = getSampleSessions();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
  return samples;
}

function saveSessions(sessions: LiveSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function isLive(session: LiveSession): boolean {
  const sessionDt = new Date(`${session.date}T${session.time}`);
  const diff = sessionDt.getTime() - Date.now();
  return diff >= -60000 && diff <= 15 * 60000;
}

function isPast(session: LiveSession): boolean {
  const sessionDt = new Date(`${session.date}T${session.time}`);
  return sessionDt.getTime() < Date.now() - 60000;
}

export default function LiveClasses() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  const sorted = [...sessions].sort((a, b) => {
    const da = new Date(`${a.date}T${a.time}`).getTime();
    const db = new Date(`${b.date}T${b.time}`).getTime();
    const now = Date.now();
    const aUpcoming = da >= now;
    const bUpcoming = db >= now;
    if (aUpcoming && !bUpcoming) return -1;
    if (!aUpcoming && bUpcoming) return 1;
    if (aUpcoming && bUpcoming) return da - db;
    return db - da;
  });

  const handleSchedule = () => {
    if (!title.trim() || !className || !date || !time || !link.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    const session: LiveSession = {
      id: `ls-${Date.now()}`,
      title: title.trim(),
      className,
      date,
      time,
      link: link.trim(),
      createdAt: Date.now(),
    };
    const updated = [...sessions, session];
    setSessions(updated);
    saveSessions(updated);
    setTitle("");
    setClassName("");
    setDate("");
    setTime("");
    setLink("");
    toast.success("Live class scheduled!");
  };

  const handleDelete = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    saveSessions(updated);
    toast.success("Session removed.");
  };

  const formatDateTime = (date: string, time: string) => {
    const dt = new Date(`${date}T${time}`);
    return dt.toLocaleString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Video size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Live Classes</h1>
          <p className="text-sm text-muted-foreground">
            Schedule and share live session links
          </p>
        </div>
      </div>

      {/* Schedule Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Radio size={16} className="text-primary" />
            Schedule a New Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="lc-title">Session Title</Label>
            <Input
              id="lc-title"
              data-ocid="live_classes.input"
              placeholder="e.g. Mathematics – Chapter 6 Revision"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="lc-class">Class</Label>
              <Select value={className} onValueChange={setClassName}>
                <SelectTrigger id="lc-class" data-ocid="live_classes.select">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Class 8A">Class 8A</SelectItem>
                  <SelectItem value="Class 9B">Class 9B</SelectItem>
                  <SelectItem value="All Classes">All Classes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lc-date">Date</Label>
              <Input
                id="lc-date"
                type="date"
                data-ocid="live_classes.input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="lc-time">Time</Label>
              <Input
                id="lc-time"
                type="time"
                data-ocid="live_classes.input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lc-link">Join Link (Zoom / Google Meet)</Label>
              <Input
                id="lc-link"
                type="url"
                data-ocid="live_classes.input"
                placeholder="https://meet.google.com/..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
          </div>

          <Button
            className="w-full"
            data-ocid="live_classes.submit_button"
            onClick={handleSchedule}
          >
            <Radio size={16} className="mr-2" />
            Schedule Class
          </Button>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Scheduled Sessions ({sorted.length})
        </h2>

        {sorted.length === 0 && (
          <div
            className="text-center py-12 text-muted-foreground"
            data-ocid="live_classes.empty_state"
          >
            <Video size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No sessions scheduled yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {sorted.map((session, idx) => {
            const live = isLive(session);
            const past = isPast(session);
            return (
              <Card
                key={session.id}
                data-ocid={`live_classes.item.${idx + 1}`}
                className={past ? "opacity-60" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">
                          {session.title}
                        </span>
                        {live && (
                          <Badge className="bg-red-500 hover:bg-red-500 text-white text-[10px] px-1.5 py-0 animate-pulse">
                            ● LIVE
                          </Badge>
                        )}
                        {past && !live && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            Past
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {session.className} ·{" "}
                        {formatDateTime(session.date, session.time)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white h-8 px-3 text-xs"
                        data-ocid={`live_classes.primary_button.${idx + 1}`}
                        onClick={() =>
                          window.open(
                            session.link,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                      >
                        <ExternalLink size={13} className="mr-1" />
                        Join Now
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        data-ocid={`live_classes.delete_button.${idx + 1}`}
                        onClick={() => handleDelete(session.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
