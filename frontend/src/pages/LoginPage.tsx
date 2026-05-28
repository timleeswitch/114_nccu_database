import NavBar from '../components/NavBar';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import AuthSection from '../components/AuthSection';
import ContactSection from '../components/ContactSection';
import type { LoginPayload } from '../services/studentService';

interface LoginPageProps {
  onLogin: (payload: LoginPayload) => Promise<void>;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background:
          'radial-gradient(ellipse 55% 60% at 15% 50%, #aacde8CC 0%, transparent 100%), radial-gradient(circle at 65% 40%, #FFCA4BAA 0%, #FFCA4B66 12%, #FFCA4B22 28%, transparent 55%), #ffffff',
      }}
    >
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <AuthSection onLogin={onLogin} />
      <ContactSection />
    </div>
  );
}
