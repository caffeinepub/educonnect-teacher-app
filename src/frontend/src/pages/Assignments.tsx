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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Hash,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Assignment } from "../backend";
import { useActor } from "../hooks/useActor";

const today = new Date().toISOString().split("T")[0];

export default function Assignments() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailAssignment, setDetailAssignment] = useState<Assignment | null>(
    null,
  );
  const [form, setForm] = useState({
    title: "",
    description: "",
    classId: "",
    dueDate: "",
    maxScore: "100",
  });

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["assignments"],
    queryFn: () => actor!.getAssignments(),
    enabled: !!actor,
  });

  const { data: classes } = useQuery({
    queryKey: ["classes"],
    queryFn: () => actor!.getClasses(),
    enabled: !!actor,
  });

  const { data: assignmentGrades } = useQuery({
    queryKey: ["grades", "assignment", detailAssignment?.id],
    queryFn: () => actor!.getGradesByAssignment(detailAssignment!.id),
    enabled: !!actor && !!detailAssignment,
  });

  const { data: classStudents } = useQuery({
    queryKey: ["students", "class", detailAssignment?.classId],
    queryFn: () => actor!.getStudentsByClass(detailAssignment!.classId),
    enabled: !!actor && !!detailAssignment,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      actor!.addAssignment(
        form.title,
        form.description,
        form.classId,
        form.dueDate,
        BigInt(Number.parseInt(form.maxScore) || 100),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      toast.success("Assignment created!");
      setCreateOpen(false);
      setForm({
        title: "",
        description: "",
        classId: "",
        dueDate: "",
        maxScore: "100",
      });
    },
    onError: () => toast.error("Failed to create assignment"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      toast.success("Assignment deleted");
      setDetailAssignment(null);
    },
    onError: () => toast.error("Failed to delete"),
  });

  const getClassName = (classId: string) =>
    classes?.find((c) => c.id === classId)?.name ?? classId;

  const upcoming = (assignments ?? []).filter((a) => a.dueDate >= today);
  const past = (assignments ?? []).filter((a) => a.dueDate < today);

  const AssignmentCard = ({ assignment }: { assignment: Assignment }) => (
    <button
      type="button"
      onClick={() => setDetailAssignment(assignment)}
      className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-primary/30 hover:shadow-card transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm">
            {assignment.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {assignment.description}
          </p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 ml-3">
          <ClipboardList size={16} className="text-primary" />
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <BookOpen size={12} />
          {getClassName(assignment.classId)}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar size={12} />
          Due: {assignment.dueDate}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Hash size={12} />
          Max: {Number(assignment.maxScore)}
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus size={16} className="mr-2" />
          New Assignment
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              All ({(assignments ?? []).length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex-1">
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1">
              Past ({past.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-3 mt-4">
            {(assignments ?? []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No assignments yet
              </div>
            ) : (
              (assignments ?? []).map((a) => (
                <AssignmentCard key={a.id} assignment={a} />
              ))
            )}
          </TabsContent>
          <TabsContent value="upcoming" className="space-y-3 mt-4">
            {upcoming.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No upcoming assignments
              </div>
            ) : (
              upcoming.map((a) => <AssignmentCard key={a.id} assignment={a} />)
            )}
          </TabsContent>
          <TabsContent value="past" className="space-y-3 mt-4">
            {past.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No past assignments
              </div>
            ) : (
              past.map((a) => <AssignmentCard key={a.id} assignment={a} />)
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                placeholder="Assignment title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="Assignment details..."
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Max Score</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="100"
                  value={form.maxScore}
                  onChange={(e) =>
                    setForm({ ...form, maxScore: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={
                !form.title ||
                !form.classId ||
                !form.dueDate ||
                createMutation.isPending
              }
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog
        open={!!detailAssignment}
        onOpenChange={(o) => !o && setDetailAssignment(null)}
      >
        <DialogContent className="max-w-sm mx-auto">
          {detailAssignment && (
            <>
              <DialogHeader>
                <DialogTitle>{detailAssignment.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {detailAssignment.description}
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Class: </span>
                    <span className="font-medium">
                      {getClassName(detailAssignment.classId)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Due: </span>
                    <span className="font-medium">
                      {detailAssignment.dueDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max: </span>
                    <span className="font-medium">
                      {Number(detailAssignment.maxScore)}
                    </span>
                  </div>
                </div>

                {/* Grades */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Student Grades
                  </h4>
                  {(classStudents ?? []).length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No students
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {(classStudents ?? []).map((s) => {
                        const grade = assignmentGrades?.find(
                          (g) => g.studentId === s.id,
                        );
                        return (
                          <div
                            key={s.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-foreground">{s.name}</span>
                            <span
                              className={
                                grade
                                  ? "font-semibold text-foreground"
                                  : "text-muted-foreground"
                              }
                            >
                              {grade
                                ? `${Number(grade.score)} / ${Number(detailAssignment.maxScore)}`
                                : "Not graded"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(detailAssignment.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 size={14} className="mr-1" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDetailAssignment(null)}
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
