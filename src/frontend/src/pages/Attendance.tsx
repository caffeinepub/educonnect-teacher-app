import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Save, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AttendanceStatus } from "../backend";
import { useActor } from "../hooks/useActor";

type AttendanceState = Record<string, AttendanceStatus>;

export default function Attendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(today);
  const [localAttendance, setLocalAttendance] = useState<AttendanceState>({});

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: () => actor!.getClasses(),
    enabled: !!actor,
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["students", "class", selectedClass],
    queryFn: () => actor!.getStudentsByClass(selectedClass),
    enabled: !!actor && !!selectedClass,
  });

  const { data: existingAttendance } = useQuery({
    queryKey: ["attendance", selectedClass, date],
    queryFn: async () => {
      const records = await actor!.getAttendanceByClassAndDate(
        selectedClass,
        date,
      );
      const map: AttendanceState = {};
      for (const r of records) {
        map[r.studentId] = r.status as AttendanceStatus;
      }
      setLocalAttendance(map);
      return records;
    },
    enabled: !!actor && !!selectedClass && !!date,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!students) return;
      for (const student of students) {
        const status = localAttendance[student.id] ?? AttendanceStatus.present;
        const existing = existingAttendance?.find(
          (r) => r.studentId === student.id,
        );
        if (existing) {
          await actor!.updateAttendance({ ...existing, status });
        } else {
          await actor!.markAttendance(student.id, selectedClass, date, status);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Attendance saved!");
    },
    onError: () => toast.error("Failed to save attendance"),
  });

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setLocalAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const presentCount =
    students?.filter(
      (s) =>
        localAttendance[s.id] === AttendanceStatus.present ||
        localAttendance[s.id] === undefined,
    ).length ?? 0;
  const absentCount =
    students?.filter((s) => localAttendance[s.id] === AttendanceStatus.absent)
      .length ?? 0;
  const lateCount =
    students?.filter((s) => localAttendance[s.id] === AttendanceStatus.late)
      .length ?? 0;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classesLoading && (
                <SelectItem value="loading" disabled>
                  Loading...
                </SelectItem>
              )}
              {(classes ?? []).map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-40"
        />
      </div>

      {!selectedClass ? (
        <div className="text-center py-16 text-muted-foreground">
          <CheckCircle2 size={40} className="mx-auto mb-3 opacity-30" />
          <p>Select a class to take attendance</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          {students && students.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-success">
                  {presentCount}
                </div>
                <div className="text-xs text-muted-foreground">Present</div>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-destructive">
                  {absentCount}
                </div>
                <div className="text-xs text-muted-foreground">Absent</div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-yellow-600">
                  {lateCount}
                </div>
                <div className="text-xs text-muted-foreground">Late</div>
              </div>
            </div>
          )}

          {/* Student List */}
          {studentsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : (students ?? []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students in this class
            </div>
          ) : (
            <div className="space-y-2">
              {(students ?? []).map((student) => {
                const status =
                  localAttendance[student.id] ?? AttendanceStatus.present;
                return (
                  <div
                    key={student.id}
                    className="bg-card border border-border rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {student.name}
                      </div>
                    </div>
                    {/* Status buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setStatus(student.id, AttendanceStatus.present)
                        }
                        className={`p-1.5 rounded-lg transition-colors ${
                          status === AttendanceStatus.present
                            ? "bg-success text-white"
                            : "bg-muted text-muted-foreground hover:bg-green-50"
                        }`}
                        title="Present"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setStatus(student.id, AttendanceStatus.absent)
                        }
                        className={`p-1.5 rounded-lg transition-colors ${
                          status === AttendanceStatus.absent
                            ? "bg-destructive text-white"
                            : "bg-muted text-muted-foreground hover:bg-red-50"
                        }`}
                        title="Absent"
                      >
                        <XCircle size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setStatus(student.id, AttendanceStatus.late)
                        }
                        className={`p-1.5 rounded-lg transition-colors ${
                          status === AttendanceStatus.late
                            ? "bg-yellow-500 text-white"
                            : "bg-muted text-muted-foreground hover:bg-yellow-50"
                        }`}
                        title="Late"
                      >
                        <Clock size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {(students ?? []).length > 0 && (
            <Button
              className="w-full"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              <Save size={16} className="mr-2" />
              {saveMutation.isPending ? "Saving..." : "Save Attendance"}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
