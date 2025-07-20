import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Get class names from class IDs for display purposes
 */
export const getClassNamesByIds = async (classIds) => {
  if (!classIds || classIds.length === 0) return [];
  
  try {
    const classesQuery = query(collection(db, 'classes'));
    const classesSnapshot = await getDocs(classesQuery);
    
    const classNames = [];
    
    classesSnapshot.docs.forEach(doc => {
      const classData = { id: doc.id, ...doc.data() };
      if (classIds.includes(classData.id)) {
        classNames.push({
          id: classData.id,
          name: classData.name,
          level: classData.level,
          category: classData.category
        });
      }
    });
    
    return classNames;
  } catch (error) {
    console.error('Error fetching class names:', error);
    return [];
  }
};

/**
 * Format class names for display
 */
export const formatClassNames = (classes) => {
  if (!classes || classes.length === 0) return 'No classes';
  
  if (classes.length === 1) {
    const cls = classes[0];
    return `${cls.name} - ${cls.level}${cls.category ? ` (${cls.category})` : ''}`;
  }
  
  if (classes.length <= 3) {
    return classes.map(cls => 
      `${cls.name} - ${cls.level}${cls.category ? ` (${cls.category})` : ''}`
    ).join(', ');
  }
  
  return `${classes.length} classes (${classes.slice(0, 2).map(cls => cls.name).join(', ')}, +${classes.length - 2} more)`;
};