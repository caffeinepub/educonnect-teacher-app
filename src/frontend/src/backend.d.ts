import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Grade {
    id: string;
    studentId: string;
    feedback: string;
    score: bigint;
    assignmentId: string;
}
export interface Class {
    id: string;
    subject: string;
    name: string;
    section: string;
    studentIds: Array<string>;
}
export interface ScheduleEntry {
    id: string;
    startTime: string;
    subject: string;
    endTime: string;
    dayOfWeek: bigint;
    classId: string;
    roomNumber: string;
    periodNumber: bigint;
}
export interface Message {
    id: string;
    sentDate: string;
    subject: string;
    body: string;
    isRead: boolean;
    senderName: string;
    recipientName: string;
    recipientId: string;
    senderId: string;
}
export interface Assignment {
    id: string;
    title: string;
    maxScore: bigint;
    createdDate: string;
    dueDate: string;
    description: string;
    classId: string;
}
export interface AttendanceRecord {
    id: string;
    status: AttendanceStatus;
    studentId: string;
    date: string;
    classId: string;
}
export interface Announcement {
    id: string;
    title: string;
    body: string;
    authorName: string;
    createdDate: string;
    classId: string;
}
export interface Student {
    id: string;
    enrolledDate: string;
    name: string;
    photoUrl: string;
    classId: string;
    email: string;
    phone: string;
}
export enum AttendanceStatus {
    present = "present",
    late = "late",
    absent = "absent"
}
export interface backendInterface {
    addAnnouncement(title: string, body: string, classId: string, authorName: string): Promise<string>;
    addAssignment(title: string, description: string, classId: string, dueDate: string, maxScore: bigint): Promise<string>;
    addClass(name: string, subject: string, section: string): Promise<string>;
    addScheduleEntry(dayOfWeek: bigint, periodNumber: bigint, subject: string, classId: string, startTime: string, endTime: string, roomNumber: string): Promise<string>;
    addStudent(name: string, email: string, phone: string, classId: string, photoUrl: string): Promise<string>;
    deleteAnnouncement(announcementId: string): Promise<boolean>;
    deleteAssignment(assignmentId: string): Promise<boolean>;
    deleteClass(classId: string): Promise<boolean>;
    deleteScheduleEntry(scheduleId: string): Promise<boolean>;
    getAnnouncements(): Promise<Array<Announcement>>;
    getAssignments(): Promise<Array<Assignment>>;
    getAssignmentsByClass(classId: string): Promise<Array<Assignment>>;
    getAttendanceByClassAndDate(classId: string, date: string): Promise<Array<AttendanceRecord>>;
    getAttendanceByStudent(studentId: string): Promise<Array<AttendanceRecord>>;
    getClassById(classId: string): Promise<Class>;
    getClasses(): Promise<Array<Class>>;
    getClassesSortedById(): Promise<Array<Class>>;
    getGradesByAssignment(assignmentId: string): Promise<Array<Grade>>;
    getGradesByStudent(studentId: string): Promise<Array<Grade>>;
    getMessageThread(userId: string, otherUserId: string): Promise<Array<Message>>;
    getMessages(userId: string): Promise<Array<Message>>;
    getSchedule(): Promise<Array<ScheduleEntry>>;
    getScheduleByDay(dayOfWeek: bigint): Promise<Array<ScheduleEntry>>;
    getStudentById(studentId: string): Promise<Student>;
    getStudents(): Promise<Array<Student>>;
    getStudentsByClass(classId: string): Promise<Array<Student>>;
    getUnreadCount(userId: string): Promise<bigint>;
    markAttendance(studentId: string, classId: string, date: string, status: AttendanceStatus): Promise<string>;
    markMessageRead(messageId: string): Promise<boolean>;
    recordGrade(studentId: string, assignmentId: string, score: bigint, feedback: string): Promise<string>;
    removeStudent(studentId: string): Promise<boolean>;
    sendMessage(senderId: string, senderName: string, recipientId: string, recipientName: string, subject: string, body: string): Promise<string>;
    updateAssignment(updatedAssignment: Assignment): Promise<boolean>;
    updateAttendance(updatedRecord: AttendanceRecord): Promise<boolean>;
    updateClass(updatedClass: Class): Promise<boolean>;
    updateGrade(updatedGrade: Grade): Promise<boolean>;
    updateScheduleEntry(updatedEntry: ScheduleEntry): Promise<boolean>;
    updateStudent(updatedStudent: Student): Promise<boolean>;
}
