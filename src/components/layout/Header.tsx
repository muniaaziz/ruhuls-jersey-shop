
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="jersey-container py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-jersey-navy">Ruhul's<span className="text-jersey-purple">Jersey</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-800 hover:text-jersey-purple transition-colors">Home</Link>
            <Link to="/products" className="text-gray-800 hover:text-jersey-purple transition-colors">Products</Link>
            <Link to="/about" className="text-gray-800 hover:text-jersey-purple transition-colors">About</Link>
            <Link to="/contact" className="text-gray-800 hover:text-jersey-purple transition-colors">Contact</Link>
          </nav>

          {/* Search, Cart, Account */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jerseys..."
                className="pl-3 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-jersey-purple focus:border-transparent"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-500">
                <Search size={18} />
              </button>
            </form>
            <Link to="/cart" className="text-gray-700 hover:text-jersey-purple relative">
              <ShoppingCart />
              <span className="absolute -top-2 -right-2 bg-jersey-purple text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">0</span>
            </Link>
            <Link to="/account" className="text-gray-700 hover:text-jersey-purple">
              <User />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="text-gray-700 hover:text-jersey-purple relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-jersey-purple text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">0</span>
            </Link>
            <button onClick={toggleMenu} className="text-gray-700">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fade-in">
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jerseys..."
                className="w-full pl-3 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-jersey-purple focus:border-transparent"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-500">
                <Search size={18} />
              </button>
            </form>
            <nav className="flex flex-col space-y-3">
              <Link to="/" className="text-gray-800 hover:text-jersey-purple transition-colors py-2">Home</Link>
              <Link to="/products" className="text-gray-800 hover:text-jersey-purple transition-colors py-2">Products</Link>
              <Link to="/about" className="text-gray-800 hover:text-jersey-purple transition-colors py-2">About</Link>
              <Link to="/contact" className="text-gray-800 hover:text-jersey-purple transition-colors py-2">Contact</Link>
              <Link to="/account" className="text-gray-800 hover:text-jersey-purple transition-colors py-2 flex items-center gap-2">
                <User size={18} /> My Account
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
