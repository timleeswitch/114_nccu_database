import { useState } from 'react';
import type { ReactNode } from 'react';
import NavBar from './components/NavBar';
import HeroSection from './components/HeroSection';
import AuthSection from './components/AuthSection';
import ContactSection from './components/ContactSection';
import FeaturesSection from './components/FeaturesSection';
import AppLayout from './components/layout/AppLayout';
import CourseRecordsPage from './pages/CourseRecordsPage';
import CreditCheckPage from './pages/CreditCheckPage';
import ProfilePage from './pages/ProfilePage';
import { loginStudent } from './services/studentService';
import type { Student } from './types/student';
import type { SystemPage } from './types/navigation';
import './index.css';

const appBackground =
  'radial-gradient(ellipse 55% 60% at 15% 50%, #aacde8CC 0%, transparent 100%), radial-gradient(circle at 65% 40%, #FFCA4BAA 0%, #FFCA4B66 12%, #FFCA4B22 28%, transparent 55%), #ffffff';

export default function App() {
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [activePage, setActivePage] = useState<SystemPage>('courseRecords');

  async function handleLogin(): Promise<void> {
    const student = await loginStudent();
    setCurrentStudent(student);
    setActivePage('courseRecords');
  }

  function handleLogout(): void {
    setCurrentStudent(null);
    setActivePage('courseRecords');
  }

  function renderActivePage(): ReactNode {
    if (!currentStudent) {
      return null;
    }

    if (activePage === 'creditCheck') {
      return <CreditCheckPage />;
    }

    if (activePage === 'profile') {
      return <ProfilePage />;
    }

    return <CourseRecordsPage studentId={currentStudent.student_id} />;
  }

  if (currentStudent) {
    return (
      <div className="min-h-screen font-sans" style={{ background: appBackground }}>
        <AppLayout
          activePage={activePage}
          student={currentStudent}
          onLogout={handleLogout}
          onPageChange={setActivePage}
        >
          {renderActivePage()}
        </AppLayout>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: appBackground }}
    >
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <AuthSection onLogin={handleLogin} />
      <ContactSection />
    </div>
  );
}
