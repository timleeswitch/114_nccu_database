import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import GraduationStatusPage from './pages/GraduationStatusPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/status" element={<GraduationStatusPage />} />
      </Routes>
    </BrowserRouter>
  );
}
