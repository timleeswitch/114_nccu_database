import NavBar from './components/NavBar';
import HeroSection from './components/HeroSection';
import AuthSection from './components/AuthSection';
import ContactSection from './components/ContactSection';
import FeaturesSection from './components/FeaturesSection';
import './index.css';

export default function App() {
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
      <AuthSection />
      <ContactSection />
    </div>
  );
}
