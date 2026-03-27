import Array "mo:core/Array";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

actor {
  type Class = {
    id : Text;
    name : Text;
    subject : Text;
    section : Text;
    studentIds : [Text];
  };

  module Class {
    public func compare(class1 : Class, class2 : Class) : Order.Order {
      Text.compare(class1.id, class2.id);
    };
  };

  type Student = {
    id : Text;
    name : Text;
    email : Text;
    phone : Text;
    classId : Text;
    photoUrl : Text;
    enrolledDate : Text;
  };

  module Student {
    public func compare(student1 : Student, student2 : Student) : Order.Order {
      Text.compare(student1.name, student2.name);
    };
  };

  type AttendanceStatus = { #present; #absent; #late };

  type AttendanceRecord = {
    id : Text;
    studentId : Text;
    classId : Text;
    date : Text;
    status : AttendanceStatus;
  };

  type Assignment = {
    id : Text;
    title : Text;
    description : Text;
    classId : Text;
    dueDate : Text;
    createdDate : Text;
    maxScore : Nat;
  };

  module Assignment {
    public func compare(assignment1 : Assignment, assignment2 : Assignment) : Order.Order {
      Text.compare(assignment1.id, assignment2.id);
    };
  };

  type Grade = {
    id : Text;
    studentId : Text;
    assignmentId : Text;
    score : Nat;
    feedback : Text;
  };

  type Announcement = {
    id : Text;
    title : Text;
    body : Text;
    classId : Text;
    createdDate : Text;
    authorName : Text;
  };

  module Announcement {
    public func compare(announcement1 : Announcement, announcement2 : Announcement) : Order.Order {
      Text.compare(announcement1.id, announcement2.id);
    };
  };

  type ScheduleEntry = {
    id : Text;
    dayOfWeek : Nat;
    periodNumber : Nat;
    subject : Text;
    classId : Text;
    startTime : Text;
    endTime : Text;
    roomNumber : Text;
  };

  module ScheduleEntry {
    public func compare(entry1 : ScheduleEntry, entry2 : ScheduleEntry) : Order.Order {
      Text.compare(entry1.id, entry2.id);
    };
  };

  type Message = {
    id : Text;
    senderId : Text;
    senderName : Text;
    recipientId : Text;
    recipientName : Text;
    subject : Text;
    body : Text;
    sentDate : Text;
    isRead : Bool;
  };

  // STATE

  let classes = Map.empty<Text, Class>();
  let students = Map.empty<Text, Student>();
  let attendance = Map.empty<Text, AttendanceRecord>();
  let assignments = Map.empty<Text, Assignment>();
  let grades = Map.empty<Text, Grade>();
  let announcements = Map.empty<Text, Announcement>();
  let schedule = Map.empty<Text, ScheduleEntry>();
  let messages = Map.empty<Text, Message>();

  var nextClassId = 3;
  var nextStudentId = 9;
  var nextAttendanceId = 1;
  var nextAssignmentId = 5;
  var nextGradeId = 1;
  var nextAnnouncementId = 4;
  var nextScheduleId = 1;
  var nextMessageId = 5;

  // HELPERS

  func getCurrentDate() : Text {
    let timestamp = Time.now();
    let timestampNat = Int.abs(timestamp);
    timestampNat.toText();
  };

  func getNextId(prefix : Text, nextId : Nat) : Text {
    prefix # nextId.toText();
  };

  // ACTOR METHODS - CLASSES

  public shared ({ caller }) func addClass(name : Text, subject : Text, section : Text) : async Text {
    let id = getNextId("class-", nextClassId);
    let newClass : Class = {
      id;
      name;
      subject;
      section;
      studentIds = [];
    };
    classes.add(id, newClass);
    nextClassId += 1;
    id;
  };

  public shared ({ caller }) func updateClass(updatedClass : Class) : async Bool {
    if (not classes.containsKey(updatedClass.id)) {
      return false;
    };
    classes.add(updatedClass.id, updatedClass);
    true;
  };

  public shared ({ caller }) func deleteClass(classId : Text) : async Bool {
    classes.remove(classId);
    true;
  };

  public query ({ caller }) func getClassById(classId : Text) : async Class {
    switch (classes.get(classId)) {
      case (null) { Runtime.trap("Class not found") };
      case (?c) { c };
    };
  };

  public query ({ caller }) func getClasses() : async [Class] {
    classes.values().toArray().sort();
  };

  public query ({ caller }) func getClassesSortedById() : async [Class] {
    classes.values().toArray().sort();
  };

  // ACTOR METHODS - STUDENTS

  public shared ({ caller }) func addStudent(name : Text, email : Text, phone : Text, classId : Text, photoUrl : Text) : async Text {
    let id = getNextId("student-", nextStudentId);
    let newStudent : Student = {
      id;
      name;
      email;
      phone;
      classId;
      photoUrl;
      enrolledDate = getCurrentDate();
    };

    students.add(id, newStudent);
    nextStudentId += 1;

    // Update class studentIds
    switch (classes.get(classId)) {
      case (?c) {
        let updatedClass : Class = {
          id = c.id;
          name = c.name;
          subject = c.subject;
          section = c.section;
          studentIds = c.studentIds.concat([id]);
        };
        classes.add(classId, updatedClass);
      };
      case (null) {};
    };

    id;
  };

  public shared ({ caller }) func updateStudent(updatedStudent : Student) : async Bool {
    if (not students.containsKey(updatedStudent.id)) {
      return false;
    };
    students.add(updatedStudent.id, updatedStudent);
    true;
  };

  public shared ({ caller }) func removeStudent(studentId : Text) : async Bool {
    let student = switch (students.get(studentId)) {
      case (null) { return false };
      case (?s) { s };
    };

    students.remove(studentId);

    // Remove student from class studentIds
    switch (classes.get(student.classId)) {
      case (?c) {
        let updatedClass : Class = {
          id = c.id;
          name = c.name;
          subject = c.subject;
          section = c.section;
          studentIds = c.studentIds.filter(func(id) { id != studentId });
        };
        classes.add(student.classId, updatedClass);
      };
      case (null) {};
    };

    true;
  };

  public query ({ caller }) func getStudentById(studentId : Text) : async Student {
    switch (students.get(studentId)) {
      case (null) { Runtime.trap("Student not found") };
      case (?s) { s };
    };
  };

  public query ({ caller }) func getStudents() : async [Student] {
    students.values().toArray().sort();
  };

  public query ({ caller }) func getStudentsByClass(classId : Text) : async [Student] {
    students.values().toArray().filter(func(s) { s.classId == classId }).sort();
  };

  // ACTOR METHODS - ATTENDANCE

  public shared ({ caller }) func markAttendance(studentId : Text, classId : Text, date : Text, status : AttendanceStatus) : async Text {
    let id = getNextId("attendance-", nextAttendanceId);
    let record : AttendanceRecord = {
      id;
      studentId;
      classId;
      date;
      status;
    };
    attendance.add(id, record);
    nextAttendanceId += 1;
    id;
  };

  public query ({ caller }) func getAttendanceByClassAndDate(classId : Text, date : Text) : async [AttendanceRecord] {
    attendance.values().toArray().filter(func(a) { a.classId == classId and a.date == date });
  };

  public query ({ caller }) func getAttendanceByStudent(studentId : Text) : async [AttendanceRecord] {
    attendance.values().toArray().filter(func(a) { a.studentId == studentId });
  };

  public shared ({ caller }) func updateAttendance(updatedRecord : AttendanceRecord) : async Bool {
    if (not attendance.containsKey(updatedRecord.id)) {
      return false;
    };
    attendance.add(updatedRecord.id, updatedRecord);
    true;
  };

  // ACTOR METHODS - ASSIGNMENTS

  public shared ({ caller }) func addAssignment(title : Text, description : Text, classId : Text, dueDate : Text, maxScore : Nat) : async Text {
    let id = getNextId("assignment-", nextAssignmentId);
    let assignment : Assignment = {
      id;
      title;
      description;
      classId;
      dueDate;
      createdDate = getCurrentDate();
      maxScore;
    };
    assignments.add(id, assignment);
    nextAssignmentId += 1;
    id;
  };

  public shared ({ caller }) func updateAssignment(updatedAssignment : Assignment) : async Bool {
    if (not assignments.containsKey(updatedAssignment.id)) {
      return false;
    };
    assignments.add(updatedAssignment.id, updatedAssignment);
    true;
  };

  public shared ({ caller }) func deleteAssignment(assignmentId : Text) : async Bool {
    assignments.remove(assignmentId);
    true;
  };

  public query ({ caller }) func getAssignments() : async [Assignment] {
    assignments.values().toArray().sort();
  };

  public query ({ caller }) func getAssignmentsByClass(classId : Text) : async [Assignment] {
    assignments.values().toArray().filter(func(a) { a.classId == classId });
  };

  // ACTOR METHODS - GRADES

  public shared ({ caller }) func recordGrade(studentId : Text, assignmentId : Text, score : Nat, feedback : Text) : async Text {
    let id = getNextId("grade-", nextGradeId);
    let grade : Grade = {
      id;
      studentId;
      assignmentId;
      score;
      feedback;
    };
    grades.add(id, grade);
    nextGradeId += 1;
    id;
  };

  public shared ({ caller }) func updateGrade(updatedGrade : Grade) : async Bool {
    if (not grades.containsKey(updatedGrade.id)) {
      return false;
    };
    grades.add(updatedGrade.id, updatedGrade);
    true;
  };

  public query ({ caller }) func getGradesByAssignment(assignmentId : Text) : async [Grade] {
    grades.values().toArray().filter(func(g) { g.assignmentId == assignmentId });
  };

  public query ({ caller }) func getGradesByStudent(studentId : Text) : async [Grade] {
    grades.values().toArray().filter(func(g) { g.studentId == studentId });
  };

  // ACTOR METHODS - ANNOUNCEMENTS

  public shared ({ caller }) func addAnnouncement(title : Text, body : Text, classId : Text, authorName : Text) : async Text {
    let id = getNextId("announcement-", nextAnnouncementId);
    let announcement : Announcement = {
      id;
      title;
      body;
      classId;
      createdDate = getCurrentDate();
      authorName;
    };
    announcements.add(id, announcement);
    nextAnnouncementId += 1;
    id;
  };

  public shared ({ caller }) func deleteAnnouncement(announcementId : Text) : async Bool {
    announcements.remove(announcementId);
    true;
  };

  public query ({ caller }) func getAnnouncements() : async [Announcement] {
    announcements.values().toArray().sort();
  };

  // ACTOR METHODS - SCHEDULE

  public shared ({ caller }) func addScheduleEntry(dayOfWeek : Nat, periodNumber : Nat, subject : Text, classId : Text, startTime : Text, endTime : Text, roomNumber : Text) : async Text {
    let id = getNextId("schedule-", nextScheduleId);
    let entry : ScheduleEntry = {
      id;
      dayOfWeek;
      periodNumber;
      subject;
      classId;
      startTime;
      endTime;
      roomNumber;
    };
    schedule.add(id, entry);
    nextScheduleId += 1;
    id;
  };

  public shared ({ caller }) func updateScheduleEntry(updatedEntry : ScheduleEntry) : async Bool {
    if (not schedule.containsKey(updatedEntry.id)) {
      return false;
    };
    schedule.add(updatedEntry.id, updatedEntry);
    true;
  };

  public shared ({ caller }) func deleteScheduleEntry(scheduleId : Text) : async Bool {
    schedule.remove(scheduleId);
    true;
  };

  public query ({ caller }) func getSchedule() : async [ScheduleEntry] {
    schedule.values().toArray().sort();
  };

  public query ({ caller }) func getScheduleByDay(dayOfWeek : Nat) : async [ScheduleEntry] {
    schedule.values().toArray().filter(func(e) { e.dayOfWeek == dayOfWeek });
  };

  // ACTOR METHODS - MESSAGES

  public shared ({ caller }) func sendMessage(senderId : Text, senderName : Text, recipientId : Text, recipientName : Text, subject : Text, body : Text) : async Text {
    let id = getNextId("message-", nextMessageId);
    let message : Message = {
      id;
      senderId;
      senderName;
      recipientId;
      recipientName;
      subject;
      body;
      sentDate = getCurrentDate();
      isRead = false;
    };
    messages.add(id, message);
    nextMessageId += 1;
    id;
  };

  public shared ({ caller }) func markMessageRead(messageId : Text) : async Bool {
    switch (messages.get(messageId)) {
      case (null) { return false };
      case (?m) {
        let updatedMessage : Message = {
          id = m.id;
          senderId = m.senderId;
          senderName = m.senderName;
          recipientId = m.recipientId;
          recipientName = m.recipientName;
          subject = m.subject;
          body = m.body;
          sentDate = m.sentDate;
          isRead = true;
        };
        messages.add(messageId, updatedMessage);
        true;
      };
    };
  };

  public query ({ caller }) func getMessages(userId : Text) : async [Message] {
    messages.values().toArray().filter(
      func(m) {
        m.senderId == userId or m.recipientId == userId
      }
    );
  };

  public query ({ caller }) func getMessageThread(userId : Text, otherUserId : Text) : async [Message] {
    messages.values().toArray().filter(
      func(m) {
        (m.senderId == userId and m.recipientId == otherUserId) or (m.senderId == otherUserId and m.recipientId == userId)
      }
    );
  };

  public query ({ caller }) func getUnreadCount(userId : Text) : async Nat {
    let unread = messages.values().toArray().filter(
      func(m) {
        m.recipientId == userId and not m.isRead
      }
    );
    unread.size();
  };

  // SEED DATA

  system func preupgrade() {};
};
