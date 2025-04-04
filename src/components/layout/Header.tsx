
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ShoppingCart, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  const { totalItems } = useCart();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    console.log('Searching for:', searchQuery);
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
            <Link to="/" className={`transition-colors ${location.pathname === '/' ? 'text-jersey-purple' : 'text-gray-800 hover:text-jersey-purple'}`}>Home</Link>
            <Link to="/products" className={`transition-colors ${location.pathname.includes('/products') || location.pathname.includes('/product') ? 'text-jersey-purple' : 'text-gray-800 hover:text-jersey-purple'}`}>Products</Link>
            <Link to="/about" className={`transition-colors ${location.pathname === '/about' ? 'text-jersey-purple' : 'text-gray-800 hover:text-jersey-purple'}`}>About</Link>
            <Link to="/contact" className={`transition-colors ${location.pathname === '/contact' ? 'text-jersey-purple' : 'text-gray-800 hover:text-jersey-purple'}`}>Contact</Link>
            {isAdmin && (
              <Link to="/admin" className={`transition-colors ${location.pathname.includes('/admin') ? 'text-jersey-purple' : 'text-gray-800 hover:text-jersey-purple'}`}>Admin</Link>
            )}
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
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-jersey-purple text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={`text-gray-700 hover:text-jersey-purple ${location.pathname === '/account' ? 'text-jersey-purple' : ''}`}>
                    <User size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="w-full cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account/orders" className="w-full cursor-pointer">My Orders</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="w-full cursor-pointer">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-500 cursor-pointer">
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth" className="text-gray-700 hover:text-jersey-purple">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="text-gray-700 hover:text-jersey-purple relative">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-jersey-purple text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
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
              <Link to="/" className={`transition-colors py-2 ${location.pathname === '/' ? 'text-jersey-purple' : 'text-gray-800 hover:text-jersey-purple'}`}>Home</Link>
              <Link to="/products" className={`transition-colors py-2 ${location.pathname.includes('/products') || location.pathname.includes('/product') ? 'text-jersey-purple' : 'text-gray-800 hover:text-jersey-purple'}`}>Products</Link>
              <Link to="/about" className={`transition-colors py-2 ${location.pathname === '/about' ? 'text-jersey-purple' : 'text-gray-800 hover:text-jersey-purple'}`}>About</Link>
              <Link to="/contact" className={`transition-colors py-2 ${location.pathname === '/contact' ? 'text-jersey-purple' : 'text-gray-800 hover:text-jersey-purple'}`}>Contact</Link>
              {isAdmin && (
                <Link to="/admin" className={`transition-colors py-2 ${location.pathname.includes('/admin') ? 'text-jersey-purple' : 'text-gray-800 hover:text-jersey-purple'}`}>Admin</Link>
              )}
              
              {user ? (
                <>
                  <Link to="/account" className={`transition-colors py-2 text-gray-800 hover:text-jersey-purple ${location.pathname === '/account' ? 'text-jersey-purple' : ''}`}>
                    <div className="flex items-center gap-2">
                      <User size={18} /> My Account
                    </div>
                  </Link>
                  <Link to="/account/orders" className="transition-colors py-2 text-gray-800 hover:text-jersey-purple">
                    My Orders
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-red-500 py-2"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" className="transition-colors py-2 text-gray-800 hover:text-jersey-purple">
                  <Button>Sign In / Register</Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
