import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import GraduationStatusPage from './pages/GraduationStatusPage';
import CourseRecordsPage from './pages/CourseRecordsPage';
import CreditCheckPage from './pages/CreditCheckPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/status" element={<GraduationStatusPage />} />
        <Route path="/records" element={<CourseRecordsPage studentId={1} />} />
        <Route path="/credits" element={<CreditCheckPage />} />
      </Routes>
    </BrowserRouter>
  );
}
