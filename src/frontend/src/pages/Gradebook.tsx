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
import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Assignment, Grade, Student } from "../backend";
import { useActor } from "../hooks/useActor";

export default function Gradebook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState("");
  const [gradeCell, setGradeCell] = useState<{
    student: Student;
    assignment: Assignment;
    existing?: Grade;
  } | null>(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");

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

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["assignments", "class", selectedClass],
    queryFn: () => actor!.getAssignmentsByClass(selectedClass),
    enabled: !!actor && !!selectedClass,
  });

  // Fetch all grades for each assignment
  const gradesQueries = useQuery({
    queryKey: ["grades", "class", selectedClass, assignments?.map((a) => a.id)],
    queryFn: async () => {
      if (!assignments || assignments.length === 0) return {};
      const results: Record<string, Grade[]> = {};
      for (const a of assignments) {
        results[a.id] = await actor!.getGradesByAssignment(a.id);
      }
      return results;
    },
    enabled: !!actor && !!selectedClass && !!assignments,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!gradeCell) return;
      const score = BigInt(Number.parseInt(gradeInput) || 0);
      if (gradeCell.existing) {
        await actor!.updateGrade({
          ...gradeCell.existing,
          score,
          feedback: feedbackInput,
        });
      } else {
        await actor!.recordGrade(
          gradeCell.student.id,
          gradeCell.assignment.id,
          score,
          feedbackInput,
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      toast.success("Grade saved!");
      setGradeCell(null);
    },
    onError: () => toast.error("Failed to save grade"),
  });

  const getGrade = (
    studentId: string,
    assignmentId: string,
  ): Grade | undefined => {
    return gradesQueries.data?.[assignmentId]?.find(
      (g) => g.studentId === studentId,
    );
  };

  const getStudentAvg = (studentId: string): string => {
    if (!assignments || !gradesQueries.data) return "-";
    const grades = assignments
      .map((a) => getGrade(studentId, a.id))
      .filter(Boolean) as Grade[];
    if (grades.length === 0) return "-";
    const avg =
      grades.reduce((sum, g) => sum + Number(g.score), 0) / grades.length;
    return avg.toFixed(1);
  };

  const openGradeCell = (student: Student, assignment: Assignment) => {
    const existing = getGrade(student.id, assignment.id);
    setGradeCell({ student, assignment, existing });
    setGradeInput(existing ? String(Number(existing.score)) : "");
    setFeedbackInput(existing?.feedback ?? "");
  };

  const isLoading = studentsLoading || assignmentsLoading || classesLoading;

  return (
    <div className="space-y-4">
      {/* Class selector */}
      <Select value={selectedClass} onValueChange={setSelectedClass}>
        <SelectTrigger>
          <SelectValue placeholder="Select class to view gradebook" />
        </SelectTrigger>
        <SelectContent>
          {classesLoading && (
            <SelectItem value="__loading" disabled>
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

      {!selectedClass ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Select a class to view the gradebook</p>
        </div>
      ) : isLoading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : !students?.length || !assignments?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          {!students?.length
            ? "No students in this class"
            : "No assignments for this class"}
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4">
          <div className="min-w-max px-4">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-xs font-semibold text-muted-foreground pb-2 pr-4 min-w-32">
                    Student
                  </th>
                  {(assignments ?? []).map((a) => (
                    <th
                      key={a.id}
                      className="text-center text-xs font-semibold text-muted-foreground pb-2 px-2 min-w-20"
                    >
                      <div className="line-clamp-2">{a.title}</div>
                      <div className="text-[10px] font-normal opacity-60">
                        /{Number(a.maxScore)}
                      </div>
                    </th>
                  ))}
                  <th className="text-center text-xs font-semibold text-primary pb-2 px-2 min-w-16">
                    Avg
                  </th>
                </tr>
              </thead>
              <tbody>
                {(students ?? []).map((student) => (
                  <tr key={student.id} className="border-t border-border">
                    <td className="py-2 pr-4">
                      <div className="text-sm font-medium text-foreground">
                        {student.name}
                      </div>
                    </td>
                    {(assignments ?? []).map((assignment) => {
                      const grade = getGrade(student.id, assignment.id);
                      return (
                        <td
                          key={assignment.id}
                          className="py-2 px-2 text-center"
                        >
                          <button
                            type="button"
                            onClick={() => openGradeCell(student, assignment)}
                            className={`w-12 h-8 rounded-lg text-xs font-semibold transition-colors ${
                              grade
                                ? "bg-secondary text-primary hover:bg-primary hover:text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-secondary"
                            }`}
                          >
                            {grade ? (
                              Number(grade.score)
                            ) : (
                              <Pencil size={12} className="mx-auto" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                    <td className="py-2 px-2 text-center">
                      <span className="text-sm font-bold text-primary">
                        {getStudentAvg(student.id)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grade entry dialog */}
      <Dialog open={!!gradeCell} onOpenChange={(o) => !o && setGradeCell(null)}>
        <DialogContent className="max-w-xs mx-auto">
          {gradeCell && (
            <>
              <DialogHeader>
                <DialogTitle>Grade Entry</DialogTitle>
              </DialogHeader>
              <div className="text-sm text-muted-foreground mb-4">
                <strong className="text-foreground">
                  {gradeCell.student.name}
                </strong>{" "}
                — {gradeCell.assignment.title}
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>
                    Score (max {Number(gradeCell.assignment.maxScore)})
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max={Number(gradeCell.assignment.maxScore)}
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Feedback (optional)</Label>
                  <Input
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Add feedback..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setGradeCell(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={!gradeInput || saveMutation.isPending}
                >
                  {saveMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
