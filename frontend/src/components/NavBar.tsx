interface NavBarProps {}

export default function NavBar({}: NavBarProps) {
  return (
    <nav className="flex items-center justify-between px-6 md:px-16 py-5">
      <span className="text-2xl font-semibold text-gray-900">NCCUCS</span>
    </nav>
  );
}
