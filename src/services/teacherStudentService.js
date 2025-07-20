import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getSubjectsByDepartment } from './subjectService';

/**
 * Get all students taking a specific subject taught by a teacher
 * This works by finding all classes where the teacher teaches the subject,
 * then getting all students in those classes with the matching category
 */
export const getStudentsByTeacherSubject = async (teacherId, subjectName) => {
  try {
    // First, check if this is a core subject
    const coreSubjects = await getSubjectsByDepartment('core');
    const isCoreSubject = coreSubjects.includes(subjectName);
    
    // Get all classes where this teacher teaches this subject
    const classesQuery = query(collection(db, 'classes'));
    const classesSnapshot = await getDocs(classesQuery);
    
    const relevantClasses = [];
    
    classesSnapshot.docs.forEach(doc => {
      const classData = { id: doc.id, ...doc.data() };
      
      // Check if this teacher teaches the subject in this class
      const teachesSubject = classData.subjects?.some(
        subject => subject.teacherId === teacherId && subject.subjectName === subjectName
      );
      
      if (teachesSubject) {
        relevantClasses.push(classData);
      }
    });

    // Get all students from these classes
    const allStudents = [];
    
    for (const classData of relevantClasses) {
      const studentsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'student'),
        where('classId', '==', classData.id)
      );
      
      const studentsSnapshot = await getDocs(studentsQuery);
      
      studentsSnapshot.docs.forEach(doc => {
        const studentData = { id: doc.id, ...doc.data() };
        
        // For core subjects, include ALL students in the class
        // For category subjects, students are automatically included based on their class category
        allStudents.push({
          ...studentData,
          className: classData.name,
          classLevel: classData.level,
          classCategory: classData.category,
          subjectType: isCoreSubject ? 'core' : classData.category || classData.level
        });
      });
    }

    return allStudents;
  } catch (error) {
    console.error('Error fetching students by teacher subject:', error);
    throw error;
  }
};

/**
 * Get all subjects taught by a teacher with student counts
 */
export const getTeacherSubjectsWithStudents = async (teacherId) => {
  try {
    // Get all classes where this teacher teaches
    const classesQuery = query(collection(db, 'classes'));
    const classesSnapshot = await getDocs(classesQuery);
    
    const teacherSubjects = new Map();
    
    for (const classDoc of classesSnapshot.docs) {
      const classData = { id: classDoc.id, ...classDoc.data() };
      
      // Find subjects taught by this teacher in this class
      const teacherSubjectsInClass = classData.subjects?.filter(
        subject => subject.teacherId === teacherId
      ) || [];
      
      for (const subject of teacherSubjectsInClass) {
        const key = subject.subjectName;
        
        if (!teacherSubjects.has(key)) {
          teacherSubjects.set(key, {
            subjectName: subject.subjectName,
            classes: [],
            totalStudents: 0
          });
        }
        
        // Get student count for this class
        const studentsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'student'),
          where('classId', '==', classData.id)
        );
        
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentCount = studentsSnapshot.size;
        
        const subjectData = teacherSubjects.get(key);
        subjectData.classes.push({
          classId: classData.id,
          className: classData.name,
          level: classData.level,
          category: classData.category,
          studentCount
        });
        subjectData.totalStudents += studentCount;
      }
    }
    
    return Array.from(teacherSubjects.values());
  } catch (error) {
    console.error('Error fetching teacher subjects with students:', error);
    throw error;
  }
};

/**
 * Get all subjects available to a student based on their class category
 */
export const getStudentSubjects = async (studentId) => {
  try {
    // Get student data
    const studentDoc = await getDoc(doc(db, 'users', studentId));
    if (!studentDoc.exists() || studentDoc.data().role !== 'student') {
      throw new Error('Student not found');
    }
    
    const studentData = studentDoc.data();
    
    // Get class data
    const classDoc = await getDoc(doc(db, 'classes', studentData.classId));
    if (!classDoc.exists()) {
      throw new Error('Class not found');
    }
    
    const classData = classDoc.data();
    
    // Always get core subjects (taken by ALL students)
    const coreSubjects = await getSubjectsByDepartment('core');
    let allSubjects = coreSubjects.map(subjectName => {
      const subjectInfo = classData.subjects?.find(s => s.subjectName === subjectName);
      return {
        subjectName,
        teacherId: subjectInfo?.teacherId || null,
        teacherName: subjectInfo?.teacherName || 'Not Assigned',
        category: 'core'
      };
    });
    
    // For Junior level, add junior-specific subjects
    if (classData.level === 'Junior') {
      const juniorSubjects = await getSubjectsByDepartment('junior');
      const juniorSubjectList = juniorSubjects.map(subjectName => {
        const subjectInfo = classData.subjects?.find(s => s.subjectName === subjectName);
        return {
          subjectName,
          teacherId: subjectInfo?.teacherId || null,
          teacherName: subjectInfo?.teacherName || 'Not Assigned',
          category: 'junior'
        };
      });
      allSubjects = [...allSubjects, ...juniorSubjectList];
    }
    
    // For Senior level, add category-specific subjects
    if (classData.level === 'Senior' && classData.category) {
      const categoryKey = classData.category.toLowerCase();
      const categorySubjects = await getSubjectsByDepartment(categoryKey);
      
      const categorySubjectList = categorySubjects.map(subjectName => {
        const subjectInfo = classData.subjects?.find(s => s.subjectName === subjectName);
        return {
          subjectName,
          teacherId: subjectInfo?.teacherId || null,
          teacherName: subjectInfo?.teacherName || 'Not Assigned',
          category: classData.category
        };
      });
      allSubjects = [...allSubjects, ...categorySubjectList];
    }
    
    return allSubjects;
  } catch (error) {
    console.error('Error fetching student subjects:', error);
    throw error;
  }
};

/**
 * Extract base class name from full class name
 * Examples: "SSS1 Science" -> "SSS1", "Grade 10A Science" -> "Grade 10A", "SSS 1 Science" -> "SSS 1"
 */
const extractBaseClassName = (fullClassName) => {
  if (!fullClassName) return '';
  
  const categoryPattern = /\s+(Science|Art|Commercial)$/i;
  const baseName = fullClassName.replace(categoryPattern, '').trim();
  
  return baseName;
};

/**
 * Get all classes and subjects taught by a teacher - IMPROVED VERSION
 * Groups classes by base class name for core subjects, shows individual classes for category subjects
 */
export const getTeacherClassesAndSubjects = async (teacherId) => {
  try {
    const classesQuery = query(collection(db, 'classes'));
    const classesSnapshot = await getDocs(classesQuery);
    
    // Get core subjects to identify them
    const coreSubjects = await getSubjectsByDepartment('core');
    
    const teacherClasses = [];
    const levelGroups = new Map(); // For grouping core subject classes by base class name
    
    for (const classDoc of classesSnapshot.docs) {
      const classData = { id: classDoc.id, ...classDoc.data() };
      
      // Find subjects taught by this teacher in this class
      const teacherSubjects = classData.subjects?.filter(
        subject => subject.teacherId === teacherId
      ) || [];
      
      if (teacherSubjects.length > 0) {
        // Get student count
        const studentsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'student'),
          where('classId', '==', classData.id)
        );
        
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentCount = studentsSnapshot.size;
        
        // Check if this class has core subjects
        const coreSubjectsInClass = teacherSubjects.filter(subject => 
          coreSubjects.includes(subject.subjectName)
        );
        
        const categorySubjectsInClass = teacherSubjects.filter(subject => 
          !coreSubjects.includes(subject.subjectName)
        );
        
        // Handle core subjects - group by base class name (e.g., SSS1, SSS2)
        if (coreSubjectsInClass.length > 0) {
          const baseClassName = extractBaseClassName(classData.name);
          const groupKey = baseClassName;
          
          if (!levelGroups.has(groupKey)) {
            levelGroups.set(groupKey, {
              id: `${baseClassName.toLowerCase().replace(/\s+/g, '_')}_grouped`,
              name: baseClassName,
              level: classData.level,
              category: 'All Categories', // Indicates this is a grouped class
              isGrouped: true,
              subjectsTaught: [],
              studentCount: 0,
              individualClasses: []
            });
          }
          
          const levelGroup = levelGroups.get(groupKey);
          
          // Add core subjects to the level group
          coreSubjectsInClass.forEach(subject => {
            if (!levelGroup.subjectsTaught.some(s => s.subjectName === subject.subjectName)) {
              levelGroup.subjectsTaught.push(subject);
            }
          });
          
          levelGroup.studentCount += studentCount;
          levelGroup.individualClasses.push({
            id: classData.id,
            name: classData.name,
            category: classData.category,
            studentCount
          });
        }
        
        // Handle category subjects - show individual classes
        if (categorySubjectsInClass.length > 0) {
          teacherClasses.push({
            ...classData,
            subjectsTaught: categorySubjectsInClass,
            studentCount,
            isGrouped: false
          });
        }
      }
    }
    
    // Add grouped level classes to the result
    levelGroups.forEach(levelGroup => {
      teacherClasses.push(levelGroup);
    });
    
    // Sort classes: grouped classes first, then individual classes
    teacherClasses.sort((a, b) => {
      if (a.isGrouped && !b.isGrouped) return -1;
      if (!a.isGrouped && b.isGrouped) return 1;
      return a.name.localeCompare(b.name);
    });
    
    return teacherClasses;
  } catch (error) {
    console.error('Error fetching teacher classes and subjects:', error);
    throw error;
  }
};

/**
 * Get students by teacher subject filtered by specific class IDs
 */
export const getStudentsByTeacherSubjectAndClasses = async (teacherId, subjectName, classIds) => {
  try {
    // First, check if this is a core subject
    const coreSubjects = await getSubjectsByDepartment('core');
    const isCoreSubject = coreSubjects.includes(subjectName);
    
    // Get all classes where this teacher teaches this subject
    const classesQuery = query(collection(db, 'classes'));
    const classesSnapshot = await getDocs(classesQuery);
    
    const relevantClasses = [];
    
    classesSnapshot.docs.forEach(doc => {
      const classData = { id: doc.id, ...doc.data() };
      
      // Check if this teacher teaches the subject in this class AND class is in the filter list
      const teachesSubject = classData.subjects?.some(
        subject => subject.teacherId === teacherId && subject.subjectName === subjectName
      );
      
      const isInFilteredClasses = classIds.includes(classData.id);
      
      if (teachesSubject && isInFilteredClasses) {
        relevantClasses.push(classData);
      }
    });

    // Get all students from these filtered classes
    const allStudents = [];
    
    for (const classData of relevantClasses) {
      const studentsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'student'),
        where('classId', '==', classData.id)
      );
      
      const studentsSnapshot = await getDocs(studentsQuery);
      
      studentsSnapshot.docs.forEach(doc => {
        const studentData = { id: doc.id, ...doc.data() };
        
        // For core subjects, include ALL students in the class
        // For category subjects, students are automatically included based on their class category
        allStudents.push({
          ...studentData,
          className: classData.name,
          classLevel: classData.level,
          classCategory: classData.category,
          subjectType: isCoreSubject ? 'core' : classData.category || classData.level
        });
      });
    }

    return allStudents;
  } catch (error) {
    console.error('Error fetching students by teacher subject and classes:', error);
    throw error;
  }
};

/**
 * Check if a teacher teaches a specific subject
 */
export const doesTeacherTeachSubject = async (teacherId, subjectName) => {
  try {
    const classesQuery = query(collection(db, 'classes'));
    const classesSnapshot = await getDocs(classesQuery);
    
    for (const classDoc of classesSnapshot.docs) {
      const classData = classDoc.data();
      const teachesSubject = classData.subjects?.some(
        subject => subject.teacherId === teacherId && subject.subjectName === subjectName
      );
      
      if (teachesSubject) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if teacher teaches subject:', error);
    throw error;
  }
};