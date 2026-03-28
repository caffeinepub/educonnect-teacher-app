import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap } from "lucide-react";
import { useState } from "react";
import { AttendanceStatus } from "../backend";
import { useActor } from "../hooks/useActor";

export default function StudentPortal() {
  const { actor } = useActor();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: () => actor!.getStudents(),
    enabled: !!actor,
  });

  const { data: classes } = useQuery({
    queryKey: ["classes"],
    queryFn: () => actor!.getClasses(),
    enabled: !!actor,
  });

  const selectedStudent = (students ?? []).find(
    (s) => s.id === selectedStudentId,
  );

  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ["attendance", "student", selectedStudentId],
    queryFn: () => actor!.getAttendanceByStudent(selectedStudentId),
    enabled: !!actor && !!selectedStudentId,
  });

  const { data: grades, isLoading: gradesLoading } = useQuery({
    queryKey: ["grades", "student", selectedStudentId],
    queryFn: () => actor!.getGradesByStudent(selectedStudentId),
    enabled: !!actor && !!selectedStudentId,
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["assignments"],
    queryFn: () => actor!.getAssignments(),
    enabled: !!actor,
  });

  const isDetailLoading =
    attendanceLoading || gradesLoading || assignmentsLoading;

  const presentCount = (attendance ?? []).filter(
    (a) => a.status === AttendanceStatus.present,
  ).length;
  const lateCount = (attendance ?? []).filter(
    (a) => a.status === AttendanceStatus.late,
  ).length;
  const absentCount = (attendance ?? []).filter(
    (a) => a.status === AttendanceStatus.absent,
  ).length;
  const totalCount = (attendance ?? []).length;
  const attendancePct =
    totalCount > 0
      ? Math.round(((presentCount + lateCount) / totalCount) * 100)
      : 0;

  const studentClass = selectedStudent
    ? (classes ?? []).find((c) => c.id === selectedStudent.classId)
    : null;

  const studentAssignments = selectedStudent
    ? (assignments ?? []).filter((a) => a.classId === selectedStudent.classId)
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <GraduationCap size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Student Portal</h1>
          <p className="text-sm text-muted-foreground">
            Review a student's full academic progress
          </p>
        </div>
      </div>

      {/* Student Selector */}
      <div className="space-y-1.5">
        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
          <SelectTrigger data-ocid="student_portal.select" className="max-w-xs">
            <SelectValue
              placeholder={
                studentsLoading ? "Loading students..." : "Select a student"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {(students ?? []).map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedStudentId && (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="student_portal.empty_state"
        >
          <GraduationCap size={48} className="mx-auto mb-3 opacity-20" />
          <p>Select a student to view their progress</p>
        </div>
      )}

      {selectedStudentId && isDetailLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      )}

      {selectedStudentId && !isDetailLoading && selectedStudent && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Class Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Student Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name: </span>
                <span className="font-medium text-foreground">
                  {selectedStudent.name}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Class: </span>
                <span className="font-medium text-foreground">
                  {studentClass?.name ?? selectedStudent.classId}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Subject: </span>
                <span className="font-medium text-foreground">
                  {studentClass?.subject ?? "—"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span className="font-medium text-foreground break-all">
                  {selectedStudent.email || "—"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Phone: </span>
                <span className="font-medium text-foreground">
                  {selectedStudent.phone || "—"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Enrolled: </span>
                <span className="font-medium text-foreground">
                  {selectedStudent.enrolledDate || "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {totalCount === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No attendance records
                </p>
              ) : (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Attendance rate
                      </span>
                      <span className="font-semibold text-foreground">
                        {attendancePct}%
                      </span>
                    </div>
                    <Progress value={attendancePct} className="h-2" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                      <div className="text-lg font-bold text-green-700 dark:text-green-400">
                        {presentCount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Present
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2">
                      <div className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                        {lateCount}
                      </div>
                      <div className="text-xs text-muted-foreground">Late</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                      <div className="text-lg font-bold text-red-700 dark:text-red-400">
                        {absentCount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Absent
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {totalCount} total records
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Assignments & Grades */}
          <Card className="md:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Assignments & Grades</CardTitle>
            </CardHeader>
            <CardContent>
              {studentAssignments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No assignments for this class
                </p>
              ) : (
                <div className="space-y-2">
                  {studentAssignments.map((a) => {
                    const grade = (grades ?? []).find(
                      (g) => g.assignmentId === a.id,
                    );
                    return (
                      <div
                        key={a.id}
                        className="flex items-center justify-between text-xs gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate">
                            {a.title}
                          </div>
                          <div className="text-muted-foreground">
                            Due {a.dueDate}
                          </div>
                        </div>
                        <Badge
                          variant={grade ? "default" : "secondary"}
                          className="shrink-0 text-xs"
                        >
                          {grade
                            ? `${Number(grade.score)} / ${Number(a.maxScore)}`
                            : "Not graded"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full width assignment table on larger screens */}
      {selectedStudentId &&
        !isDetailLoading &&
        selectedStudent &&
        studentAssignments.length > 0 && (
          <Card className="hidden md:block">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Full Grade Sheet</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Max Score</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentAssignments.map((a) => {
                    const grade = (grades ?? []).find(
                      (g) => g.assignmentId === a.id,
                    );
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.title}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {a.dueDate}
                        </TableCell>
                        <TableCell>{Number(a.maxScore)}</TableCell>
                        <TableCell>
                          {grade ? (
                            <Badge variant="default">
                              {Number(grade.score)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              Not graded
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {grade?.feedback || "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
