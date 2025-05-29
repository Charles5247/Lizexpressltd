import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Header = ({ user }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-[#33004A] text-white py-2 shadow-md relative z-50">
      <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
        {/* Logo - Larger */}
        <Link to="/" className="flex-shrink-0">
          <img
            src="https://imgur.com/CtN9l7s.png" // Replace with your actual logo
            alt="LizExpress"
            className="h-20 w-auto object-contain" // Adjusted logo size
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="hover:text-[#F7941D] text-lg">HOME</Link>
          <Link to="/browse" className="hover:text-[#F7941D] text-lg">BROWSE</Link>
          {user && (
            <>
              <Link to="/dashboard" className="hover:text-[#F7941D] text-lg">DASHBOARD</Link>
              <Link to="/list-item" className="hover:text-[#F7941D] text-lg">LIST ITEM</Link>
            </>
          )}
          <Link
            to={user ? "/dashboard" : "/signin"}
            className="bg-[#F7941D] text-white px-6 py-2 rounded-full font-bold hover:bg-[#e68a1c] text-lg"
          >
            {user ? "MY ACCOUNT" : "SIGN IN"}
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white z-50"
          onClick={handleMenuToggle}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Nav - Half Drawer */}
      <div
        className={`fixed top-[70px] right-0 h-[70%] w-[70%] max-w-[300px] bg-[#33004A] shadow-lg z-40 rounded-l-xl transform ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <nav className="flex flex-col p-6 space-y-5">
          <Link to="/" onClick={handleMenuClose} className="text-white hover:text-[#F7941D] text-lg">
            HOME
          </Link>
          <Link to="/browse" onClick={handleMenuClose} className="text-white hover:text-[#F7941D] text-lg">
            BROWSE
          </Link>
          {user && (
            <>
              <Link to="/dashboard" onClick={handleMenuClose} className="text-white hover:text-[#F7941D] text-lg">
                DASHBOARD
              </Link>
              <Link to="/list-item" onClick={handleMenuClose} className="text-white hover:text-[#F7941D] text-lg">
                LIST ITEM
              </Link>
            </>
          )}
          <Link
            to={user ? "/dashboard" : "/signin"}
            onClick={handleMenuClose}
            className="bg-[#F7941D] text-white px-6 py-3 rounded-full font-bold text-center hover:bg-[#e68a1c] text-lg"
          >
            {user ? "MY ACCOUNT" : "SIGN IN"}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
