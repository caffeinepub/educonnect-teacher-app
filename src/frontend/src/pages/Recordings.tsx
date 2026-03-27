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
import {
  Calendar,
  PlayCircle,
  Trash2,
  Upload,
  Video,
  VideoOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Recording {
  id: string;
  title: string;
  classId: string;
  subject: string;
  date: string;
  fileName: string;
  fileSize: number;
  objectUrl?: string;
}

const CLASS_OPTIONS = ["Class 8A", "Class 9B"];

const STORAGE_KEY = "teachment_recordings_meta";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Recordings() {
  const [recordings, setRecordings] = useState<Recording[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [title, setTitle] = useState("");
  const [classId, setClassId] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    const meta = recordings.map(({ objectUrl: _url, ...rest }) => rest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
  }, [recordings]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  }

  function handleUpload() {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!classId) {
      toast.error("Please select a class");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }
    if (!file) {
      toast.error("Please select a video file");
      return;
    }

    setUploading(true);
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      const id = `rec_${Date.now()}`;
      const newRec: Recording = {
        id,
        title: title.trim(),
        classId,
        subject: subject.trim(),
        date,
        fileName: file.name,
        fileSize: file.size,
        objectUrl: url,
      };
      setObjectUrls((prev) => ({ ...prev, [id]: url }));
      setRecordings((prev) => [newRec, ...prev]);
      setTitle("");
      setClassId("");
      setSubject("");
      setDate("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploading(false);
      toast.success("Recording saved successfully!");
    }, 800);
  }

  function handleDelete(id: string) {
    const url = objectUrls[id];
    if (url) URL.revokeObjectURL(url);
    setObjectUrls((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    setRecordings((prev) => prev.filter((r) => r.id !== id));
    if (playingId === id) setPlayingId(null);
    toast.success("Recording deleted");
  }

  function togglePlay(rec: Recording) {
    if (playingId === rec.id) {
      setPlayingId(null);
      return;
    }
    if (!objectUrls[rec.id] && !rec.objectUrl) {
      toast.error(
        "Video is only available during the current session. Please re-upload to play.",
      );
      return;
    }
    if (!objectUrls[rec.id] && rec.objectUrl) {
      setObjectUrls((prev) => ({ ...prev, [rec.id]: rec.objectUrl! }));
    }
    setPlayingId(rec.id);
  }

  const classBadgeColor: Record<string, string> = {
    "Class 8A":
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    "Class 9B":
      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Upload size={20} className="text-primary" />
            Upload Class Recording
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="rec-title">Title</Label>
              <Input
                id="rec-title"
                placeholder="e.g. Chapter 5 – Algebra Introduction"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-ocid="recordings.input"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Class</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger data-ocid="recordings.select">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rec-subject">Subject</Label>
              <Input
                id="rec-subject"
                placeholder="e.g. Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rec-date">Date</Label>
              <Input
                id="rec-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="rec-file">Video File</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="rec-file"
                  type="file"
                  accept="video/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="flex-1"
                  data-ocid="recordings.upload_button"
                />
              </div>
              {file && (
                <p className="text-xs text-muted-foreground mt-1">
                  {file.name} — {formatSize(file.size)}
                </p>
              )}
            </div>
          </div>

          <Button
            className="mt-5 w-full sm:w-auto"
            onClick={handleUpload}
            disabled={uploading}
            data-ocid="recordings.submit_button"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/60 border-t-primary-foreground rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload size={16} />
                Save Recording
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recordings List */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">
          Saved Recordings ({recordings.length})
        </h2>

        {recordings.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center bg-muted/40 rounded-xl border border-dashed border-border"
            data-ocid="recordings.empty_state"
          >
            <VideoOff size={40} className="text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No recordings yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Upload a class recording above to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recordings.map((rec, idx) => {
              const isPlaying = playingId === rec.id;
              const hasUrl = !!objectUrls[rec.id];
              return (
                <Card
                  key={rec.id}
                  className="overflow-hidden"
                  data-ocid={`recordings.item.${idx + 1}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail / Icon */}
                      <div className="shrink-0 w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Video size={28} className="text-primary" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground text-sm truncate">
                            {rec.title}
                          </h3>
                          <Badge
                            className={`text-[10px] px-2 py-0 ${classBadgeColor[rec.classId] ?? ""}`}
                            variant="secondary"
                          >
                            {rec.classId}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          {rec.subject}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar size={12} />
                          <span>{rec.date}</span>
                          <span className="ml-2 text-muted-foreground/60">
                            {rec.fileName}
                          </span>
                          {rec.fileSize > 0 && (
                            <span className="text-muted-foreground/60">
                              · {formatSize(rec.fileSize)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => togglePlay(rec)}
                          data-ocid={`recordings.toggle.${idx + 1}`}
                        >
                          <PlayCircle size={15} />
                          {isPlaying ? "Close" : "Play"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(rec.id)}
                          data-ocid={`recordings.delete_button.${idx + 1}`}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </div>

                    {/* Inline Video Player */}
                    {isPlaying && (
                      <div className="mt-4">
                        {hasUrl ? (
                          // biome-ignore lint/a11y/useMediaCaption: captions not available for user-uploaded class recordings
                          <video
                            ref={(el) => {
                              videoRefs.current[rec.id] = el;
                            }}
                            src={objectUrls[rec.id]}
                            controls
                            autoPlay
                            className="w-full rounded-lg max-h-72 bg-black"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-24 bg-muted rounded-lg text-sm text-muted-foreground">
                            Video not available — please re-upload the file
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
