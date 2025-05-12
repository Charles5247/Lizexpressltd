import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  return (
    <header className="bg-[#4A0E67] text-white p-4 shadow-md relative z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center">
          <span className="text-white">Liz</span>
          <span className="text-[#F7941D]">Express</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="hover:text-[#F7941D] transition-colors">HOME</Link>
          <Link to="/browse" className="hover:text-[#F7941D] transition-colors">BROWSE</Link>
          <Link to="/dashboard" className="hover:text-[#F7941D] transition-colors">DASHBOARD</Link>
          <Link to="/signin" className="bg-[#F7941D] text-white px-4 py-1 rounded hover:bg-[#e68a1c] transition-colors">
            SIGN IN
          </Link>
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white z-50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu with transition */}
      <div 
        className={`fixed inset-0 bg-[#4A0E67] transform ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out md:hidden`}
        style={{ top: '60px' }}
      >
        <nav className="flex flex-col p-4 space-y-4">
          <Link to="/" className="text-white hover:text-[#F7941D] transition-colors text-lg">
            HOME
          </Link>
          <Link to="/browse" className="text-white hover:text-[#F7941D] transition-colors text-lg">
            BROWSE
          </Link>
          <Link to="/dashboard" className="text-white hover:text-[#F7941D] transition-colors text-lg">
            DASHBOARD
          </Link>
          <Link to="/signin" className="bg-[#F7941D] text-white px-4 py-2 rounded hover:bg-[#e68a1c] transition-colors text-center text-lg">
            SIGN IN
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;