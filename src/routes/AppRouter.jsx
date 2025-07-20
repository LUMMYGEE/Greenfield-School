import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import RoleBasedRoute from "../components/RoleBasedRoute";
import Home from "../pages/Home";
import DashboardLayout from "../layouts/DashboardLayout";
import StudentLayout from "../layouts/StudentLayout";
import TeacherLayout from "../layouts/TeacherLayout";

// Lazy loaded components
// students routes
const Login = lazy(() => import("../pages/Login"));
const Unauthorized = lazy(() => import("../pages/Unauthorized"));
const CreateAdmin = lazy(() => import("../pages/CreateAdmin"));

const StudentDashboard = lazy(() => import("../pages/student/Dashboard")); // Student landing
const Profile = lazy(() => import("../pages/student/Profile"));
const Results = lazy(() => import("../pages/student/Results"));
const Timetable = lazy(() => import("../pages/student/Timetable"));
const StudentSubjects = lazy(() => import("../pages/student/Subjects"));
const StudentAssignments = lazy(() => import("../pages/student/Assignments"));
const StudentExamResults = lazy(() => import("../pages/student/ExamResults"));

// Teacher routes
const TeacherDashboard = lazy(() => import("../pages/dashboard/teacher/Dashboard")); // Teacher landing
const MyClasses = lazy(() => import("../pages/dashboard/teacher/MyClasses"));
const TeacherStudents = lazy(() => import("../pages/dashboard/teacher/Students"));
const Grades = lazy(() => import("../pages/dashboard/teacher/Grades"));
const Assignments = lazy(() => import("../pages/dashboard/teacher/Assignments"));
const TeacherTimetable = lazy(() => import("../pages/dashboard/teacher/Timetable"));
const TeacherAttendance = lazy(() => import("../pages/dashboard/teacher/Attendance"));
const TeacherReports = lazy(() => import("../pages/dashboard/teacher/Reports"));
const MyReports = lazy(() => import("../pages/dashboard/teacher/MyReports"));
const TeacherProfile = lazy(() => import("../pages/dashboard/teacher/Profile"));
const TeacherExams = lazy(() => import("../pages/dashboard/teacher/Exams"));
const CreateExam = lazy(() => import("../pages/dashboard/teacher/CreateExam"));
const TeacherExamResults = lazy(() => import("../pages/dashboard/teacher/ExamResults"));

//Admin Dashboard routes
const Overview = lazy(() => import("../pages/dashboard/Overview")); //Admin landing
const Students = lazy(() => import("../pages/dashboard/Students"));
const Teachers = lazy(() => import("../pages/dashboard/Teachers"));
const Classes = lazy(() => import("../pages/dashboard/Classes"));
const ClassStudents = lazy(() => import("../pages/dashboard/ClassStudents"));

const Admins = lazy(() => import("../pages/dashboard/Admins"));
const Settings = lazy(() => import("../pages/dashboard/Settings"));
const AdminSubjects = lazy(() => import("../pages/dashboard/Subjects"));
const AdminReports = lazy(() => import("../pages/dashboard/Reports"));
const ManageResults = lazy(() => import("../pages/dashboard/ManageResults"));

const AdminReview = lazy(() => import("../pages/dashboard/AdminReview"));
const CarouselManagement = lazy(() => import("../pages/dashboard/CarouselManagement"));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
  </div>
);

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Home />} />

    <Route
      path="/login"
      element={
        <Suspense fallback={<LoadingFallback />}>
          <Login />
        </Suspense>
      }
    />

    <Route
      path="/create-admin"
      element={
        <Suspense fallback={<LoadingFallback />}>
          <CreateAdmin />
        </Suspense>
      }
    />

    {/* Admin Dashboard Routes */}
    <Route
      path="/dashboard"
      element={
        <RoleBasedRoute allowedRoles={["admin", "super_admin"]}>
          <DashboardLayout />
        </RoleBasedRoute>
      }
    >
      <Route
        index
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Overview />
          </Suspense>
        }
      />
      <Route
        path="students"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Students />
          </Suspense>
        }
      />
      <Route
        path="teachers"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Teachers />
          </Suspense>
        }
      />
      <Route
        path="classes"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Classes />
          </Suspense>
        }
      />
      <Route
        path="classes/:slug/students"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <ClassStudents />
          </Suspense>
        }
      />
      <Route
        path="subjects"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <AdminSubjects />
          </Suspense>
        }
      />
      <Route
        path="reports"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <AdminReports />
          </Suspense>
        }
      />


      <Route
        path="admin-review"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <AdminReview />
          </Suspense>
        }
      />
      <Route
        path="admins"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Admins />
          </Suspense>
        }
      />
      <Route
        path="settings"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Settings />
          </Suspense>
        }
      />
      <Route
        path="classes/:classId"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <ClassStudents />
          </Suspense>
        }
      />
      <Route
        path="exams/:examId/manage-results"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <ManageResults />
          </Suspense>
        }
      />
      <Route
        path="carousel"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <CarouselManagement />
          </Suspense>
        }
      />
    </Route>

    {/* Teacher Routes */}
    <Route
      path="/teacher"
      element={
        <RoleBasedRoute allowedRoles={["teacher", "admin", "super_admin"]}>
          <TeacherLayout />
        </RoleBasedRoute>
      }
    >
      <Route
        index
        element={
          <Suspense fallback={<LoadingFallback />}>
            <TeacherDashboard />
          </Suspense>
        }
      />
      <Route
        path="classes"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <MyClasses />
          </Suspense>
        }
      />
      <Route
        path="students"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <TeacherStudents />
          </Suspense>
        }
      />
      <Route
        path="grades"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Grades />
          </Suspense>
        }
      />
      <Route
        path="assignments"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Assignments />
          </Suspense>
        }
      />
      <Route
        path="timetable"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <TeacherTimetable />
          </Suspense>
        }
      />
      <Route
        path="attendance"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <TeacherAttendance />
          </Suspense>
        }
      />
      <Route
        path="reports"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <TeacherReports />
          </Suspense>
        }
      />
      <Route
        path="my-reports"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <MyReports />
          </Suspense>
        }
      />
      <Route
        path="profile"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <TeacherProfile />
          </Suspense>
        }
      />
      <Route
        path="subjects/:subjectName/students"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <MyClasses />
          </Suspense>
        }
      />
      <Route
        path="subjects/:subjectName/assignments"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Assignments />
          </Suspense>
        }
      />
      <Route
        path="exam-results"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <TeacherExamResults />
          </Suspense>
        }
      />
    </Route>
    

    {/* Student Portal Routes (Nested) */}
    <Route
      path="/student"
      element={
        <RoleBasedRoute allowedRoles={["student", "admin", "super_admin"]}>
          <StudentLayout />
        </RoleBasedRoute>
      }
    >
      <Route
        index
        element={
          <Suspense fallback={<LoadingFallback />}>
            <StudentDashboard />
          </Suspense>
        }
      />
      <Route
        path="profile"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Profile />
          </Suspense>
        }
      />
      <Route
        path="subjects"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <StudentSubjects />
          </Suspense>
        }
      />
      <Route
        path="results"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Results />
          </Suspense>
        }
      />
      <Route
        path="exam-results"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <StudentExamResults />
          </Suspense>
        }
      />
      <Route
        path="timetable"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Timetable />
          </Suspense>
        }
      />
      <Route
        path="assignments"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <StudentAssignments />
          </Suspense>
        }
      />
    </Route>

    {/* Unauthorized Route */}
    <Route
      path="/unauthorized"
      element={
        <Suspense fallback={<LoadingFallback />}>
          <Unauthorized />
        </Suspense>
      }
    />
  </Routes>
);

export default AppRouter;