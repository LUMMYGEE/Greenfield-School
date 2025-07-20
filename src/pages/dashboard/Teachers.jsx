import React, { useState, useEffect } from 'react';
import { getAllTeachers, createTeacher, deleteTeacher } from '../../services/teacherService';
import TeacherForm from '../../components/forms/TeacherForm';
import TeacherTable from '../../components/teachers/TeacherTable';
import { toast } from 'react-hot-toast';


const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const teacherList = await getAllTeachers();
      setTeachers(teacherList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (formData) => {
  setError('');
  try {
    await createTeacher(formData);
    setShowForm(false);
    fetchTeachers();
    toast.success('Teacher created successfully!');
  } catch (err) {
    setError(err.message);
    toast.error('Failed to create teacher');
  }
}


const handleDelete = async (teacherId) => {
  if (window.confirm('Are you sure you want to delete this teacher?')) {
    try {
      await deleteTeacher(teacherId);
      fetchTeachers();
      toast.success('Teacher deleted successfully!');
    } catch (err) {
      setError(err.message);
      toast.error('Failed to delete teacher');
    }
  }
};



  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teacher Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Teacher
        </button>
      </div>

      {showForm && (
        <TeacherForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          error={error}
        />
      )}

      <TeacherTable teachers={teachers} onDelete={handleDelete} />
    </div>
  );
};

export default Teachers;
