import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Calendar,
  Mail,
  Phone,
  Search,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Class, Student } from "../backend";
import { useActor } from "../hooks/useActor";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-primary",
  "bg-accent",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
];

export default function Students() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    classId: "",
    photoUrl: "",
  });

  const { data: students, isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: () => actor!.getStudents(),
    enabled: !!actor,
  });

  const { data: classes } = useQuery({
    queryKey: ["classes"],
    queryFn: () => actor!.getClasses(),
    enabled: !!actor,
  });

  const { data: studentGrades } = useQuery({
    queryKey: ["grades", "student", profileStudent?.id],
    queryFn: () => actor!.getGradesByStudent(profileStudent!.id),
    enabled: !!actor && !!profileStudent,
  });

  const { data: studentAttendance } = useQuery({
    queryKey: ["attendance", "student", profileStudent?.id],
    queryFn: () => actor!.getAttendanceByStudent(profileStudent!.id),
    enabled: !!actor && !!profileStudent,
  });

  const addMutation = useMutation({
    mutationFn: () =>
      actor!.addStudent(
        form.name,
        form.email,
        form.phone,
        form.classId,
        form.photoUrl,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Student added successfully");
      setAddOpen(false);
      setForm({ name: "", email: "", phone: "", classId: "", photoUrl: "" });
    },
    onError: () => toast.error("Failed to add student"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => actor!.removeStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Student removed");
      setProfileStudent(null);
    },
    onError: () => toast.error("Failed to remove student"),
  });

  const filtered = (students ?? []).filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );

  const getClassName = (classId: string) =>
    classes?.find((c) => c.id === classId)?.name ?? classId;

  const attendanceRate = studentAttendance
    ? Math.round(
        (studentAttendance.filter((a) => a.status === "present").length /
          Math.max(studentAttendance.length, 1)) *
          100,
      )
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setAddOpen(true)} size="sm" className="shrink-0">
          <UserPlus size={16} className="mr-2" />
          Add
        </Button>
      </div>

      {/* Student count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} student{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No students found
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((student, idx) => (
            <button
              type="button"
              key={student.id}
              onClick={() => setProfileStudent(student)}
              className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary/30 hover:shadow-card transition-all text-left"
            >
              <div
                className={`w-11 h-11 rounded-full ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white text-sm font-bold shrink-0`}
              >
                {getInitials(student.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground text-sm">
                  {student.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {student.email}
                </div>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">
                {getClassName(student.classId).split(" ")[1] ?? "Class"}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {/* Add Student Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input
                placeholder="e.g. John Smith"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="student@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                placeholder="+1 234 567 8901"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Class</Label>
              <Select
                value={form.classId}
                onValueChange={(v) => setForm({ ...form, classId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {(classes ?? []).map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => addMutation.mutate()}
              disabled={!form.name || !form.classId || addMutation.isPending}
            >
              {addMutation.isPending ? "Adding..." : "Add Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Profile Dialog */}
      <Dialog
        open={!!profileStudent}
        onOpenChange={(o) => !o && setProfileStudent(null)}
      >
        <DialogContent className="max-w-sm mx-auto">
          {profileStudent && (
            <>
              <DialogHeader>
                <DialogTitle>Student Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Avatar + name */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                    {getInitials(profileStudent.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">
                      {profileStudent.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getClassName(profileStudent.classId)}
                    </p>
                    {attendanceRate !== null && (
                      <Badge
                        variant="outline"
                        className={
                          attendanceRate >= 75
                            ? "text-success border-success"
                            : "text-destructive border-destructive"
                        }
                      >
                        {attendanceRate}% attendance
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail size={14} /> {profileStudent.email}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone size={14} /> {profileStudent.phone}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar size={14} /> Enrolled:{" "}
                    {profileStudent.enrolledDate}
                  </div>
                </div>

                {/* Recent Grades */}
                {(studentGrades ?? []).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Recent Grades
                    </h4>
                    <div className="space-y-1.5">
                      {(studentGrades ?? []).slice(0, 4).map((g) => (
                        <div
                          key={g.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground truncate flex-1">
                            {g.assignmentId}
                          </span>
                          <span className="font-semibold text-foreground ml-2">
                            {Number(g.score)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeMutation.mutate(profileStudent.id)}
                  disabled={removeMutation.isPending}
                >
                  <Trash2 size={14} className="mr-1" />
                  {removeMutation.isPending ? "Removing..." : "Remove Student"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setProfileStudent(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
