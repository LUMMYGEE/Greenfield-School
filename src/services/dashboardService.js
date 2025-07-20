import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Get dashboard statistics for admin overview
 */
export const getDashboardStats = async () => {
  try {
    // Fetch all users to count students and teachers
    const usersQuery = query(collection(db, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    const users = usersSnapshot.docs.map(doc => doc.data());

    // Count students and teachers
    const students = users.filter(user => user.role === 'student');
    const teachers = users.filter(user => user.role === 'teacher');

    // Fetch all classes
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    const classes = classesSnapshot.docs.map(doc => doc.data());

    // Fetch assignments to count active exams/assessments
    const assignmentsSnapshot = await getDocs(collection(db, 'assignments'));
    const assignments = assignmentsSnapshot.docs.map(doc => doc.data());
    
    // Count active assignments (assuming assignments with due dates in the future are "active exams")
    const now = new Date();
    const activeExams = assignments.filter(assignment => {
      if (assignment.dueDate && assignment.dueDate.toDate) {
        return assignment.dueDate.toDate() > now;
      }
      return false;
    });

    // Calculate growth metrics (comparing with previous month)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const newStudentsThisMonth = students.filter(student => {
      if (student.createdAt && student.createdAt.toDate) {
        return student.createdAt.toDate() > oneMonthAgo;
      }
      return false;
    }).length;

    const newTeachersThisMonth = teachers.filter(teacher => {
      if (teacher.createdAt && teacher.createdAt.toDate) {
        return teacher.createdAt.toDate() > oneMonthAgo;
      }
      return false;
    }).length;

    // Count exams ending this week
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    const examsEndingThisWeek = activeExams.filter(exam => {
      if (exam.dueDate && exam.dueDate.toDate) {
        const dueDate = exam.dueDate.toDate();
        return dueDate <= oneWeekFromNow && dueDate > now;
      }
      return false;
    }).length;

    return {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalClasses: classes.length,
      activeExams: activeExams.length,
      newStudentsThisMonth,
      newTeachersThisMonth,
      examsEndingThisWeek
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Get recent activities for dashboard
 */
export const getRecentActivities = async () => {
  try {
    // Get recent students (last 5)
    const recentStudentsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const recentStudentsSnapshot = await getDocs(recentStudentsQuery);
    const recentStudents = recentStudentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: 'student_added'
    }));

    // Get recent teachers (last 3)
    const recentTeachersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'teacher'),
      orderBy('createdAt', 'desc'),
      limit(3)
    );
    const recentTeachersSnapshot = await getDocs(recentTeachersQuery);
    const recentTeachers = recentTeachersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: 'teacher_added'
    }));

    // Get recent classes (last 3)
    const recentClassesQuery = query(
      collection(db, 'classes'),
      orderBy('createdAt', 'desc'),
      limit(3)
    );
    const recentClassesSnapshot = await getDocs(recentClassesQuery);
    const recentClasses = recentClassesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: 'class_added'
    }));

    // Combine and sort all activities
    const allActivities = [...recentStudents, ...recentTeachers, ...recentClasses];
    allActivities.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

    return allActivities.slice(0, 10); // Return top 10 most recent activities
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

/**
 * Get class distribution data for charts
 */
export const getClassDistribution = async () => {
  try {
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    const classes = classesSnapshot.docs.map(doc => doc.data());

    // Group by level
    const levelDistribution = classes.reduce((acc, cls) => {
      const level = cls.level || 'Unknown';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    // Group by category
    const categoryDistribution = classes.reduce((acc, cls) => {
      const category = cls.category || 'General';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return {
      levelDistribution,
      categoryDistribution
    };
  } catch (error) {
    console.error('Error fetching class distribution:', error);
    throw error;
  }
};