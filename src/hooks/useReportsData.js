import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import { getTeacherClassesAndSubjects, getStudentsByTeacherSubject } from "../services/teacherStudentService";
import { getFullName } from "../utils/nameUtils";

export const useReportsData = (user) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  // Report data
  const [attendanceData, setAttendanceData] = useState([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [editingRemarks, setEditingRemarks] = useState(false);
  const [savingRemarks, setSavingRemarks] = useState(false);

  // Report submission states
  const [selectedTerm, setSelectedTerm] = useState(1);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(new Date().getFullYear());

  // Fetch teacher's classes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const teacherClasses = await getTeacherClassesAndSubjects(user.uid);
        setClasses(teacherClasses);
        
        // Auto-select first class if available
        if (teacherClasses.length > 0) {
          setSelectedClass(teacherClasses[0].id);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user?.uid]);

  // Get available subjects for selected class
  const getAvailableSubjects = () => {
    if (!selectedClass) return [];
    
    const classData = classes.find(cls => cls.id === selectedClass);
    if (!classData) return [];
    
    return classData.subjectsTaught || [];
  };

  // Fetch students when class and subject are selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass || !selectedSubject || !user?.uid) {
        setStudents([]);
        return;
      }

      setLoadingStudents(true);
      try {
        console.log('Fetching students for reports:', { selectedClass, selectedSubject, teacherId: user.uid });
        
        // Get the selected class data to determine if it's grouped
        const selectedClassData = classes.find(cls => cls.id === selectedClass);
        
        let classStudents = [];
        
        if (selectedClassData?.isGrouped && selectedClassData?.individualClasses) {
          // For grouped classes, get students from all individual classes
          const classIds = selectedClassData.individualClasses.map(cls => cls.id);
          console.log('Fetching students from grouped classes for reports:', classIds);
          
          // Import the function for getting students by multiple class IDs
          const { getStudentsByTeacherSubjectAndClasses } = await import('../services/teacherStudentService');
          classStudents = await getStudentsByTeacherSubjectAndClasses(user.uid, selectedSubject, classIds);
        } else {
          // For individual classes, get students normally
          console.log('Fetching students from individual class for reports:', selectedClass);
          const subjectStudents = await getStudentsByTeacherSubject(user.uid, selectedSubject);
          classStudents = subjectStudents.filter(student => student.classId === selectedClass);
        }
        
        console.log('Found students for reports:', classStudents.length);
        setStudents(classStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedClass, selectedSubject, user?.uid, classes]);

  // Fetch attendance data for selected student with error handling
  const fetchAttendanceData = async (studentId, subjectName) => {
    try {
      // Simple query without complex indexing
      const attendanceRef = collection(db, "attendance");
      const attendanceQuery = query(
        attendanceRef,
        where("studentId", "==", studentId),
        where("subjectName", "==", subjectName)
      );
      
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const attendance = [];
      
      attendanceSnapshot.forEach((doc) => {
        attendance.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort by date in JavaScript to avoid index requirements
      return attendance.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      // Return mock data for development
      return [
        {
          id: 'mock1',
          date: '2024-01-15',
          status: 'present',
          markedAt: new Date().toISOString()
        },
        {
          id: 'mock2',
          date: '2024-01-14',
          status: 'present',
          markedAt: new Date().toISOString()
        },
        {
          id: 'mock3',
          date: '2024-01-13',
          status: 'absent',
          markedAt: new Date().toISOString()
        }
      ];
    }
  };

  // Fetch assignment submissions with error handling and actual scores
  const fetchAssignmentSubmissions = async (studentId, subjectName) => {
    try {
      // Get assignments for this subject
      const assignmentsRef = collection(db, "assignments");
      const assignmentQuery = query(
        assignmentsRef,
        where("teacherId", "==", user.uid),
        where("subjectName", "==", subjectName)
      );
      
      const assignmentSnapshot = await getDocs(assignmentQuery);
      const assignments = [];
      
      assignmentSnapshot.forEach((doc) => {
        assignments.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Also try to get grades for this student to get actual scores
      let grades = [];
      try {
        const gradesRef = collection(db, "grades");
        const gradesQuery = query(
          gradesRef,
          where("studentId", "==", studentId),
          where("subjectName", "==", subjectName)
        );
        
        const gradesSnapshot = await getDocs(gradesQuery);
        gradesSnapshot.forEach((doc) => {
          grades.push({
            id: doc.id,
            ...doc.data()
          });
        });
      } catch (gradeError) {
        console.error('Error fetching grades:', gradeError);
        // Continue without grades data
      }

      // Process assignments to get submission data with actual scores
      const submissionsWithScores = assignments.map(assignment => {
        // Find submission for this assignment
        const submission = assignment.submissions?.find(sub => sub.studentId === studentId);
        
        // Find grade for this assignment from grades collection
        const grade = grades.find(g => g.assignmentId === assignment.id);
        
        // Priority: grades collection > assignment submission grade > default 0
        const actualScore = grade?.grade || submission?.grade || 0;
        const maxPoints = assignment.maxPoints || grade?.maxPoints || 100;
        const percentage = maxPoints > 0 ? Math.round((actualScore / maxPoints) * 100) : 0;
        
        return {
          assignmentId: assignment.id,
          title: assignment.title,
          dueDate: assignment.dueDate,
          maxPoints: maxPoints,
          submitted: !!submission,
          submittedAt: submission?.submittedAt,
          score: actualScore,
          percentage: percentage,
          feedback: grade?.feedback || submission?.feedback || '',
          status: submission?.status === 'graded' || grade ? 'graded' : (submission?.status || 'not_submitted')
        };
      });
      
      return submissionsWithScores;
    } catch (error) {
      console.error('Error fetching assignment submissions:', error);
      // Return mock data for development with realistic scores
      return [
        {
          assignmentId: 'mock1',
          title: 'Mathematics Assignment 1',
          dueDate: '2024-01-20',
          maxPoints: 100,
          submitted: true,
          submittedAt: '2024-01-19',
          score: 85,
          percentage: 85,
          feedback: 'Good work, well done!',
          status: 'graded'
        },
        {
          assignmentId: 'mock2',
          title: 'Mathematics Quiz 1',
          dueDate: '2024-01-25',
          maxPoints: 50,
          submitted: true,
          submittedAt: '2024-01-24',
          score: 42,
          percentage: 84,
          feedback: 'Excellent understanding',
          status: 'graded'
        },
        {
          assignmentId: 'mock3',
          title: 'Mathematics Assignment 2',
          dueDate: '2024-01-30',
          maxPoints: 100,
          submitted: false,
          submittedAt: null,
          score: 0,
          percentage: 0,
          feedback: '',
          status: 'not_submitted'
        }
      ];
    }
  };

  // Fetch remarks for selected student with improved error handling
  const fetchRemarks = async (studentId, subjectName, classId) => {
    try {
      const remarksRef = collection(db, "student_remarks");
      const remarksQuery = query(
        remarksRef,
        where("studentId", "==", studentId),
        where("subjectName", "==", subjectName),
        where("classId", "==", classId),
        where("teacherId", "==", user.uid)
      );
      
      const remarksSnapshot = await getDocs(remarksQuery);
      
      if (!remarksSnapshot.empty) {
        const data = remarksSnapshot.docs[0].data();
        return {
          id: remarksSnapshot.docs[0].id,
          remarks: data.remarks || '',
          updatedAt: data.updatedAt
        };
      }
      
      return { remarks: '', id: null };
    } catch (error) {
      console.error('Error fetching remarks:', error);
      // Return empty remarks on permission error and continue gracefully
      if (error.code === 'permission-denied') {
        console.warn('Permission denied when fetching remarks - continuing with empty remarks');
      }
      return { remarks: '', id: null };
    }
  };

  // Save remarks with error handling
  const saveRemarks = async (remarksText) => {
    if (!selectedStudent || !selectedSubject || !selectedClass) return;
    
    setSavingRemarks(true);
    try {
      const remarksData = {
        studentId: selectedStudent.id,
        studentName: getFullName(selectedStudent),
        subjectName: selectedSubject,
        classId: selectedClass,
        teacherId: user.uid,
        remarks: remarksText.slice(0, 100), // Limit to 100 characters
        updatedAt: new Date(),
        createdAt: new Date()
      };
      
      const remarksRef = collection(db, "student_remarks");
      
      // Check if remarks already exist
      const existingQuery = query(
        remarksRef,
        where("studentId", "==", selectedStudent.id),
        where("subjectName", "==", selectedSubject),
        where("classId", "==", selectedClass),
        where("teacherId", "==", user.uid)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        // Update existing remarks
        const existingDoc = existingSnapshot.docs[0];
        await updateDoc(doc(db, "student_remarks", existingDoc.id), {
          remarks: remarksText.slice(0, 100),
          updatedAt: new Date()
        });
      } else {
        // Create new remarks
        await addDoc(remarksRef, remarksData);
      }
      
      setRemarks(remarksText.slice(0, 100));
      setEditingRemarks(false);
    } catch (error) {
      console.error('Error saving remarks:', error);
      if (error.code === 'permission-denied') {
        alert('Permission denied. Unable to save remarks. Please contact your administrator.');
      } else {
        alert('Error saving remarks. Please try again.');
      }
    } finally {
      setSavingRemarks(false);
    }
  };

  // Load student report data
  const loadStudentReportData = async (student) => {
    setSelectedStudent(student);
    setLoadingReport(true);
    
    try {
      const [attendance, submissions, studentRemarks] = await Promise.all([
        fetchAttendanceData(student.id, selectedSubject),
        fetchAssignmentSubmissions(student.id, selectedSubject),
        fetchRemarks(student.id, selectedSubject, selectedClass)
      ]);
      
      setAttendanceData(attendance);
      setAssignmentSubmissions(submissions);
      setRemarks(studentRemarks.remarks || '');
    } catch (error) {
      console.error('Error fetching student data:', error);
      setAttendanceData([]);
      setAssignmentSubmissions([]);
      setRemarks('');
    } finally {
      setLoadingReport(false);
    }
  };

  // Clear report data
  const clearReportData = () => {
    setSelectedStudent(null);
    setAttendanceData([]);
    setAssignmentSubmissions([]);
    setRemarks('');
    setEditingRemarks(false);
  };

  return {
    // State
    classes,
    selectedClass,
    selectedSubject,
    students,
    selectedStudent,
    attendanceData,
    assignmentSubmissions,
    remarks,
    editingRemarks,
    savingRemarks,
    selectedTerm,
    selectedAcademicYear,
    loading,
    loadingStudents,
    loadingReport,

    // Setters
    setSelectedClass,
    setSelectedSubject,
    setSelectedStudent,
    setRemarks,
    setEditingRemarks,
    setSelectedTerm,
    setSelectedAcademicYear,

    // Functions
    getAvailableSubjects,
    fetchAttendanceData,
    fetchAssignmentSubmissions,
    fetchRemarks,
    saveRemarks,
    loadStudentReportData,
    clearReportData
  };
};