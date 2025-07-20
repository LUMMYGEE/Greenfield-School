import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Get teacher classes and subjects in simplified format for ExamResults component
 */
export const getTeacherClassesAndSubjectsSimple = async (teacherId) => {
  try {
    const classesQuery = query(collection(db, 'classes'));
    const classesSnapshot = await getDocs(classesQuery);
    
    const teacherClasses = [];
    const teacherSubjects = new Set();
    
    for (const classDoc of classesSnapshot.docs) {
      const classData = { id: classDoc.id, ...classDoc.data() };
      
      // Find subjects taught by this teacher in this class
      const subjectsInClass = classData.subjects?.filter(
        subject => subject.teacherId === teacherId
      ) || [];
      
      if (subjectsInClass.length > 0) {
        // Get student count
        const studentsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'student'),
          where('classId', '==', classData.id)
        );
        
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentCount = studentsSnapshot.size;
        
        // Add class to teacher's classes
        teacherClasses.push({
          id: classData.id,
          name: classData.name,
          level: classData.level,
          category: classData.category,
          studentCount,
          subjectsTaught: subjectsInClass
        });
        
        // Add subjects to the set
        subjectsInClass.forEach(subject => {
          teacherSubjects.add(subject.subjectName);
        });
      }
    }
    
    // Convert subjects set to array of objects
    const subjectsArray = Array.from(teacherSubjects).map(subjectName => ({
      name: subjectName
    }));
    
    return {
      classes: teacherClasses,
      subjects: subjectsArray
    };
  } catch (error) {
    console.error('Error fetching teacher classes and subjects:', error);
    throw error;
  }
};