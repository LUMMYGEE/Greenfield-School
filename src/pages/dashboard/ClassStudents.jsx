import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentsByClassId, getAllClasses } from '../../services/classService';
import StudentTable from '../../components/students/StudentTable';

const ClassStudents = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClassStudents();
  }, [slug]);

  const fetchClassStudents = async () => {
    setLoading(true);
    try {
      const classesData = await getAllClasses();
      const currentClass = classesData.find(cls => cls.slug === slug);
      
      if (!currentClass) {
        setError('Class not found');
        return;
      }
      
      const studentsData = await getStudentsByClassId(currentClass.id);
      setClassInfo(currentClass);
      setStudents(studentsData);
    } catch (err) {
      setError('Failed to load class students');
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading students...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/dashboard/classes')}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
          >
            ← Back to Classes
          </button>
          <h1 className="text-2xl font-bold">
            {classInfo?.name} Students
          </h1>
          <p className="text-gray-600">
            {classInfo?.level} {classInfo?.category && `- ${classInfo.category}`} | {students.length} students
          </p>
        </div>
      </div>

      <StudentTable
        students={students}
        onEdit={() => {}} // Disable editing from this view
        onDelete={() => {}} // Disable deleting from this view
      />
    </div>
  );
};

export default ClassStudents;