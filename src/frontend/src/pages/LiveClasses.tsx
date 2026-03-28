import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  Radio,
  Send,
  Trash2,
  UserPlus,
  Users,
  Video,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "teachment_live_classes";
const MAX_CAPACITY = 100;

interface Enrollment {
  name: string;
  enrolledAt: number;
}

interface ChatMessage {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

interface LiveSession {
  id: string;
  title: string;
  className: string;
  date: string;
  time: string;
  link: string;
  createdAt: number;
  maxCapacity: number;
  enrollments: Enrollment[];
  attendance: string[];
  chat: ChatMessage[];
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
      maxCapacity: MAX_CAPACITY,
      enrollments: [
        { name: "Ahmed Khan", enrolledAt: Date.now() - 3000000 },
        { name: "Priya Sharma", enrolledAt: Date.now() - 2500000 },
        { name: "Rahul Verma", enrolledAt: Date.now() - 2000000 },
      ],
      attendance: ["Ahmed Khan"],
      chat: [
        {
          id: "c1",
          author: "Ahmed Khan",
          text: "Will we cover quadratic equations today?",
          timestamp: Date.now() - 1800000,
        },
        {
          id: "c2",
          author: "Priya Sharma",
          text: "Looking forward to this class!",
          timestamp: Date.now() - 1200000,
        },
      ],
    },
    {
      id: "sample-2",
      title: "Science - Chapter 5 Review",
      className: "Class 9B",
      date: fmt(yesterday),
      time: "14:00",
      link: "https://zoom.us/j/123456789",
      createdAt: Date.now() - 86400000,
      maxCapacity: MAX_CAPACITY,
      enrollments: [
        { name: "Sara Ali", enrolledAt: Date.now() - 90000000 },
        { name: "Dev Patel", enrolledAt: Date.now() - 88000000 },
      ],
      attendance: ["Sara Ali", "Dev Patel"],
      chat: [
        {
          id: "c3",
          author: "Dev Patel",
          text: "Great class! Understood Newton's laws clearly.",
          timestamp: Date.now() - 82000000,
        },
      ],
    },
  ];
}

function migrateSession(s: any): LiveSession {
  return {
    ...s,
    maxCapacity: s.maxCapacity ?? MAX_CAPACITY,
    enrollments: s.enrollments ?? [],
    attendance: s.attendance ?? [],
    chat: s.chat ?? [],
  };
}

function loadSessions(): LiveSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.length > 0) return parsed.map(migrateSession);
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

function formatDateTime(date: string, time: string) {
  const dt = new Date(`${date}T${time}`);
  return dt.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CapacityBadge({ enrolled, max }: { enrolled: number; max: number }) {
  const pct = (enrolled / max) * 100;
  let cls = "bg-green-100 text-green-700 border-green-200";
  if (pct >= 100) cls = "bg-red-100 text-red-700 border-red-200";
  else if (pct >= 80) cls = "bg-yellow-100 text-yellow-700 border-yellow-200";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${cls}`}
    >
      <Users size={10} />
      {enrolled}/{max}
    </span>
  );
}

function EnrollForm({
  session,
  onEnroll,
  onCancel,
}: {
  session: LiveSession;
  onEnroll: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const full = session.enrollments.length >= session.maxCapacity;

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter your name.");
      return;
    }
    if (
      session.enrollments.some(
        (e) => e.name.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      toast.error("You are already enrolled in this class.");
      return;
    }
    if (full) {
      toast.error("This class is at full capacity.");
      return;
    }
    onEnroll(trimmed);
  };

  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100 space-y-2">
      <p className="text-xs font-medium text-blue-700">Enroll in this class</p>
      {full ? (
        <p className="text-xs text-red-600 font-semibold">
          Class is full (100/100)
        </p>
      ) : (
        <>
          <Input
            data-ocid="live_classes.input"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="h-8 text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-7 text-xs px-3"
              onClick={submit}
              data-ocid="live_classes.submit_button"
            >
              Enroll
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs px-3"
              onClick={onCancel}
              data-ocid="live_classes.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function JoinModal({
  onJoin,
  onCancel,
}: {
  onJoin: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter your name to join.");
      return;
    }
    onJoin(trimmed);
  };

  return (
    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100 space-y-2">
      <p className="text-xs font-medium text-green-700">
        Enter your name to join
      </p>
      <Input
        data-ocid="live_classes.input"
        placeholder="Your full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        className="h-8 text-sm"
        autoFocus
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          className="h-7 text-xs px-3 bg-green-500 hover:bg-green-600 text-white"
          onClick={submit}
          data-ocid="live_classes.confirm_button"
        >
          Join
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs px-3"
          onClick={onCancel}
          data-ocid="live_classes.cancel_button"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

function ChatPanel({
  session,
  onSendMessage,
}: {
  session: LiveSession;
  onSendMessage: (author: string, text: string) => void;
}) {
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll on chat update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.chat.length]);

  const send = () => {
    if (!author.trim()) {
      toast.error("Enter your name.");
      return;
    }
    if (!text.trim()) {
      toast.error("Enter a message.");
      return;
    }
    onSendMessage(author.trim(), text.trim());
    setText("");
  };

  return (
    <div className="flex flex-col gap-2">
      <ScrollArea className="h-48 rounded border bg-gray-50 p-2">
        {session.chat.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">
            No messages yet. Be the first!
          </p>
        )}
        <div className="space-y-2">
          {session.chat.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-primary">
                  {msg.author}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <p className="text-xs text-foreground bg-white rounded px-2 py-1 border">
                {msg.text}
              </p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <div className="space-y-1.5">
        <Input
          data-ocid="live_classes.input"
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="h-7 text-xs"
        />
        <div className="flex gap-2">
          <Textarea
            data-ocid="live_classes.textarea"
            placeholder="Type a question or comment... (max 500 chars)"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500))}
            className="text-xs resize-none h-16"
          />
          <Button
            size="sm"
            className="h-16 px-3"
            onClick={send}
            data-ocid="live_classes.submit_button"
          >
            <Send size={14} />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-right">
          {text.length}/500
        </p>
      </div>
    </div>
  );
}

function SessionCard({
  session,
  idx,
  onUpdate,
  onDelete,
}: {
  session: LiveSession;
  idx: number;
  onUpdate: (s: LiveSession) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showEnroll, setShowEnroll] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const live = isLive(session);
  const past = isPast(session);

  const handleEnroll = (name: string) => {
    const updated: LiveSession = {
      ...session,
      enrollments: [...session.enrollments, { name, enrolledAt: Date.now() }],
    };
    onUpdate(updated);
    setShowEnroll(false);
    toast.success(`${name} enrolled successfully!`);
  };

  const handleJoin = (name: string) => {
    const alreadyPresent = session.attendance.includes(name);
    const updated: LiveSession = {
      ...session,
      attendance: alreadyPresent
        ? session.attendance
        : [...session.attendance, name],
    };
    onUpdate(updated);
    setShowJoin(false);
    window.open(session.link, "_blank", "noopener,noreferrer");
    toast.success(`Marked ${name} as present!`);
  };

  const handleSendMessage = (author: string, text: string) => {
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      author,
      text,
      timestamp: Date.now(),
    };
    onUpdate({ ...session, chat: [...session.chat, msg] });
  };

  const full = session.enrollments.length >= session.maxCapacity;

  return (
    <Card
      data-ocid={`live_classes.item.${idx + 1}`}
      className={past ? "opacity-70" : ""}
    >
      <CardContent className="p-4">
        {/* Top row */}
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
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Past
                </Badge>
              )}
              <CapacityBadge
                enrolled={session.enrollments.length}
                max={session.maxCapacity}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {session.className} · {formatDateTime(session.date, session.time)}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
              data-ocid={`live_classes.secondary_button.${idx + 1}`}
              onClick={() => {
                setShowEnroll((v) => !v);
                setShowJoin(false);
              }}
              title={full ? "Class Full" : "Enroll"}
            >
              <UserPlus size={13} />
            </Button>
            <Button
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white h-8 px-3 text-xs"
              data-ocid={`live_classes.primary_button.${idx + 1}`}
              onClick={() => {
                setShowJoin((v) => !v);
                setShowEnroll(false);
              }}
            >
              <ExternalLink size={13} className="mr-1" />
              Join Now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              data-ocid={`live_classes.delete_button.${idx + 1}`}
              onClick={() => onDelete(session.id)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>

        {/* Enroll form */}
        {showEnroll && (
          <EnrollForm
            session={session}
            onEnroll={handleEnroll}
            onCancel={() => setShowEnroll(false)}
          />
        )}

        {/* Join name form */}
        {showJoin && (
          <JoinModal onJoin={handleJoin} onCancel={() => setShowJoin(false)} />
        )}

        {/* Expand toggle */}
        <div className="mt-3 pt-2 border-t">
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
            onClick={() => setExpanded((v) => !v)}
            data-ocid={`live_classes.toggle.${idx + 1}`}
          >
            <MessageSquare size={12} />
            <span>{expanded ? "Hide Details" : "View Details"}</span>
            <span className="ml-auto">
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </span>
          </button>

          {expanded && (
            <div className="mt-3">
              <Tabs defaultValue="students">
                <TabsList className="w-full h-8">
                  <TabsTrigger
                    value="students"
                    className="flex-1 text-xs h-7"
                    data-ocid={`live_classes.tab.${idx + 1}`}
                  >
                    Students ({session.enrollments.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="attendance"
                    className="flex-1 text-xs h-7"
                    data-ocid={`live_classes.tab.${idx + 1}`}
                  >
                    Attendance ({session.attendance.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="chat"
                    className="flex-1 text-xs h-7"
                    data-ocid={`live_classes.tab.${idx + 1}`}
                  >
                    Q&A ({session.chat.length})
                  </TabsTrigger>
                </TabsList>

                {/* Students tab */}
                <TabsContent value="students" className="mt-2">
                  {session.enrollments.length === 0 ? (
                    <p
                      className="text-xs text-muted-foreground text-center py-4"
                      data-ocid="live_classes.empty_state"
                    >
                      No students enrolled yet.
                    </p>
                  ) : (
                    <ScrollArea className="h-36">
                      <div className="space-y-1">
                        {session.enrollments.map((e) => (
                          <div
                            key={e.name}
                            className="flex items-center justify-between px-2 py-1 rounded bg-gray-50"
                          >
                            <span className="text-xs font-medium">
                              {e.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatTime(e.enrolledAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {session.enrollments.length} / {session.maxCapacity}{" "}
                    enrolled
                  </p>
                </TabsContent>

                {/* Attendance tab */}
                <TabsContent value="attendance" className="mt-2">
                  {session.attendance.length === 0 ? (
                    <p
                      className="text-xs text-muted-foreground text-center py-4"
                      data-ocid="live_classes.empty_state"
                    >
                      No attendance recorded yet.
                    </p>
                  ) : (
                    <ScrollArea className="h-36">
                      <div className="space-y-1">
                        {session.attendance.map((name) => (
                          <div
                            key={name}
                            className="flex items-center justify-between px-2 py-1 rounded bg-green-50"
                          >
                            <span className="text-xs font-medium">{name}</span>
                            <Badge className="bg-green-500 hover:bg-green-500 text-white text-[10px] px-1.5 py-0">
                              Present
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>

                {/* Chat tab */}
                <TabsContent value="chat" className="mt-2">
                  <ChatPanel
                    session={session}
                    onSendMessage={handleSendMessage}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
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
      maxCapacity: MAX_CAPACITY,
      enrollments: [],
      attendance: [],
      chat: [],
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

  const handleUpdate = (updated: LiveSession) => {
    const next = sessions.map((s) => (s.id === updated.id ? updated : s));
    setSessions(next);
    saveSessions(next);
  };

  const handleDelete = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    saveSessions(updated);
    toast.success("Session removed.");
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
            Schedule sessions · Enroll up to 100 students · Track attendance &
            Q&A
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
          {sorted.map((session, idx) => (
            <SessionCard
              key={session.id}
              session={session}
              idx={idx}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
