import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebase/config";

// Submit a report from teacher to admin
export const submitReport = async (reportData) => {
  try {
    const reportsRef = collection(db, "student_reports");

    const report = {
      ...reportData,
      submittedAt: Timestamp.now(),
      status: 'submitted',
      academicYear: reportData.academicYear || new Date().getFullYear(),
      term: reportData.term || 1, // 1, 2, or 3
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(reportsRef, report);
    const submittedReport = { id: docRef.id, ...report };

    return submittedReport;
  } catch (error) {
    console.error('Error submitting report:', error);
    throw error;
  }
};

// Submit multiple reports in bulk
export const submitBulkReports = async (reportsData) => {
  try {
    const reportsRef = collection(db, "student_reports");
    const results = [];
    const errors = [];

    // Process reports in batches to avoid overwhelming Firestore
    const batchSize = 10;
    for (let i = 0; i < reportsData.length; i += batchSize) {
      const batch = reportsData.slice(i, i + batchSize);

      const batchPromises = batch.map(async (reportData) => {
        try {
          // Check if report already exists
          const reportCheck = await checkReportExists(
            reportData.studentId,
            reportData.subjectName,
            reportData.term,
            reportData.academicYear,
            reportData.teacherId
          );

          if (reportCheck.exists && !reportCheck.canResubmit) {
            return {
              success: false,
              studentName: reportData.studentName,
              error: 'Report already exists for this student, subject, term, and academic year'
            };
          }

          const report = {
            ...reportData,
            submittedAt: Timestamp.now(),
            status: 'submitted',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          };

          const docRef = await addDoc(reportsRef, report);
          return {
            success: true,
            studentName: reportData.studentName,
            reportId: docRef.id
          };
        } catch (error) {
          return {
            success: false,
            studentName: reportData.studentName,
            error: error.message
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      batchResults.forEach(result => {
        if (result.success) {
          results.push(result);
        } else {
          errors.push(result);
        }
      });
    }
    return {
      successful: results,
      failed: errors,
      totalSubmitted: results.length,
      totalFailed: errors.length
    };
  } catch (error) {
    console.error('Error submitting bulk reports:', error);
    throw error;
  }
};

// Get all reports for admin view
export const getAllReports = async (filters = {}) => {
  try {
    const reportsRef = collection(db, "student_reports");
    let q = query(reportsRef, orderBy("submittedAt", "desc"));

    // Apply filters
    if (filters.academicYear) {
      q = query(q, where("academicYear", "==", filters.academicYear));
    }
    if (filters.term) {
      q = query(q, where("term", "==", filters.term));
    }
    if (filters.subjectName) {
      q = query(q, where("subjectName", "==", filters.subjectName));
    }
    if (filters.className) {
      q = query(q, where("className", "==", filters.className));
    }
    if (filters.teacherId) {
      q = query(q, where("teacherId", "==", filters.teacherId));
    }

    const snapshot = await getDocs(q);
    const reports = [];

    snapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });

    return reports;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

// Get reports for a specific student
export const getStudentReports = async (studentId, filters = {}) => {
  try {
    const reportsRef = collection(db, "student_reports");
    let q = query(
      reportsRef,
      where("studentId", "==", studentId),
      orderBy("academicYear", "desc"),
      orderBy("term", "desc")
    );

    // Apply additional filters
    if (filters.academicYear) {
      q = query(q, where("academicYear", "==", filters.academicYear));
    }
    if (filters.term) {
      q = query(q, where("term", "==", filters.term));
    }
    if (filters.subjectName) {
      q = query(q, where("subjectName", "==", filters.subjectName));
    }

    const snapshot = await getDocs(q);
    const reports = [];

    snapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });

    return reports;
  } catch (error) {
    console.error('Error fetching student reports:', error);
    throw error;
  }
};

// Get reports by subject
export const getReportsBySubject = async (subjectName, filters = {}) => {
  try {
    const reportsRef = collection(db, "student_reports");
    let q = query(
      reportsRef,
      where("subjectName", "==", subjectName),
      orderBy("submittedAt", "desc")
    );

    // Apply additional filters
    if (filters.academicYear) {
      q = query(q, where("academicYear", "==", filters.academicYear));
    }
    if (filters.term) {
      q = query(q, where("term", "==", filters.term));
    }
    if (filters.className) {
      q = query(q, where("className", "==", filters.className));
    }

    const snapshot = await getDocs(q);
    const reports = [];

    snapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });

    return reports;
  } catch (error) {
    console.error('Error fetching reports by subject:', error);
    throw error;
  }
};

// Get reports by teacher
export const getReportsByTeacher = async (teacherId, filters = {}) => {
  try {
    const reportsRef = collection(db, "student_reports");
    let q = query(
      reportsRef,
      where("teacherId", "==", teacherId),
      orderBy("submittedAt", "desc")
    );

    // Apply additional filters
    if (filters.academicYear) {
      q = query(q, where("academicYear", "==", filters.academicYear));
    }
    if (filters.term) {
      q = query(q, where("term", "==", filters.term));
    }
    if (filters.subjectName) {
      q = query(q, where("subjectName", "==", filters.subjectName));
    }

    const snapshot = await getDocs(q);
    const reports = [];

    snapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });

    return reports;
  } catch (error) {
    console.error('Error fetching reports by teacher:', error);
    throw error;
  }
};

// Update report status (for admin actions)
export const updateReportStatus = async (reportId, status, adminNotes = '') => {
  try {
    const reportRef = doc(db, "student_reports", reportId);

    // Update the report status
    await updateDoc(reportRef, {
      status,
      adminNotes,
      reviewedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

  } catch (error) {
    console.error('Error updating report status:', error);
    throw error;
  }
};

// Delete a report
export const deleteReport = async (reportId) => {
  try {
    const reportRef = doc(db, "student_reports", reportId);
    await deleteDoc(reportRef);
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};

// Get unique academic years from reports
export const getAcademicYears = async () => {
  try {
    const reportsRef = collection(db, "student_reports");
    const snapshot = await getDocs(reportsRef);

    const years = new Set();
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.academicYear) {
        years.add(data.academicYear);
      }
    });

    return Array.from(years).sort((a, b) => b - a); // Sort descending
  } catch (error) {
    console.error('Error fetching academic years:', error);
    return [new Date().getFullYear()]; // Return current year as fallback
  }
};

// Update remarks for a rejected report
export const updateReportRemarks = async (reportId, remarks) => {
  try {
    const reportRef = doc(db, "student_reports", reportId);

    await updateDoc(reportRef, {
      remarks,
      status: "resubmitted",
      submittedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating report remarks:", error);
    throw error;
  }
};

// Resubmit a rejected report (legacy - use updateReportRemarks instead)
export const resubmitReport = async (reportId, updatedData) => {
  try {
    const reportRef = doc(db, "student_reports", reportId);

    // Only allow updating remarks for rejected reports
    await updateDoc(reportRef, {
      remarks: updatedData.remarks || "",
      status: "resubmitted",
      submittedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error resubmitting report:", error);
    throw error;
  }
};

// Real-time listener for teacher reports
export const listenToTeacherReports = (teacherId, callback) => {
  const q = query(
    collection(db, "student_reports"),
    where("teacherId", "==", teacherId)
  );

  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(reports);
  });
};

// Get unique subjects from reports
export const getReportSubjects = async () => {
  try {
    const reportsRef = collection(db, "student_reports");
    const snapshot = await getDocs(reportsRef);

    const subjects = new Set();
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.subjectName) {
        subjects.add(data.subjectName);
      }
    });

    return Array.from(subjects).sort();
  } catch (error) {
    console.error('Error fetching report subjects:', error);
    return [];
  }
};

// Get unique classes from reports
export const getReportClasses = async () => {
  try {
    const reportsRef = collection(db, "student_reports");
    const snapshot = await getDocs(reportsRef);

    const classes = new Set();
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.className) {
        classes.add(data.className);
      }
    });

    return Array.from(classes).sort();
  } catch (error) {
    console.error('Error fetching report classes:', error);
    return [];
  }
};

// Check if report already exists for student, subject, term, and year
export const checkReportExists = async (studentId, subjectName, term, academicYear, teacherId) => {
  try {
    const reportsRef = collection(db, "student_reports");
    const q = query(
      reportsRef,
      where("studentId", "==", studentId),
      where("subjectName", "==", subjectName),
      where("term", "==", term),
      where("academicYear", "==", academicYear),
      where("teacherId", "==", teacherId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { exists: false };
    }

    const existingReport = snapshot.docs[0];
    const reportData = existingReport.data();

    // If report exists and is rejected, allow resubmission
    if (reportData.status === 'rejected') {
      return {
        exists: true,
        canResubmit: true,
        reportId: existingReport.id,
        reportData: { id: existingReport.id, ...reportData }
      };
    }

    // Report exists and is not rejected - block submission
    return {
      exists: true,
      canResubmit: false,
      reportId: existingReport.id,
      reportData: { id: existingReport.id, ...reportData }
    };
  } catch (error) {
    console.error('Error checking report existence:', error);
    if (error.code === 'permission-denied') {
      console.warn('Permission denied when checking report existence - proceeding with submission');
      return { exists: false };
    }
    return { exists: false };
  }
};
