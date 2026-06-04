import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import GraduationStatusPage from './pages/GraduationStatusPage';
import CourseRecordsPage from './pages/CourseRecordsPage';
import './index.css';

export default function App() {
  const loggedInStudentId = Number(localStorage.getItem('student_id') ?? 1);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/status" element={<GraduationStatusPage />} />
        <Route path="/records" element={<CourseRecordsPage studentId={loggedInStudentId} />} />
      </Routes>
    </BrowserRouter>
  );
}
