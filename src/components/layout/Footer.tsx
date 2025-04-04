
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-jersey-navy text-white pt-12 pb-6">
      <div className="jersey-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Ruhul's Jersey</h3>
            <p className="text-gray-300 mb-4">
              Custom-made T-shirts and sports jerseys with premium quality for teams and bulk orders.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-white hover:text-jersey-purple">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-jersey-purple">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-jersey-purple">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-gray-300 hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/custom-design" className="text-gray-300 hover:text-white transition-colors">Custom Designs</Link></li>
              <li><Link to="/how-to-order" className="text-gray-300 hover:text-white transition-colors">How to Order</Link></li>
              <li><Link to="/faq" className="text-gray-300 hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><Link to="/products/football" className="text-gray-300 hover:text-white transition-colors">Football Jerseys</Link></li>
              <li><Link to="/products/cricket" className="text-gray-300 hover:text-white transition-colors">Cricket Jerseys</Link></li>
              <li><Link to="/products/basketball" className="text-gray-300 hover:text-white transition-colors">Basketball Jerseys</Link></li>
              <li><Link to="/products/tshirts" className="text-gray-300 hover:text-white transition-colors">T-Shirts</Link></li>
              <li><Link to="/products/custom" className="text-gray-300 hover:text-white transition-colors">Fully Custom Designs</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="mr-2 flex-shrink-0 mt-1" size={18} />
                <span className="text-gray-300">123 Jersey Street, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 flex-shrink-0" size={18} />
                <a href="tel:+8801712345678" className="text-gray-300 hover:text-white transition-colors">+880 171 234 5678</a>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 flex-shrink-0" size={18} />
                <a href="mailto:info@ruhulsjersey.com" className="text-gray-300 hover:text-white transition-colors">info@ruhulsjersey.com</a>
              </li>
              <li className="mt-4">
                <a href="https://wa.me/8801712345678" className="bg-green-600 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-green-700 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.403 5.633A8.919 8.919 0 0 0 12.053 3c-4.948 0-8.976 4.027-8.978 8.977 0 1.582.413 3.126 1.198 4.488L3 21.116l4.759-1.249a8.981 8.981 0 0 0 4.29 1.093h.004c4.947 0 8.975-4.027 8.977-8.977a8.926 8.926 0 0 0-2.627-6.35m-6.35 13.812h-.003a7.446 7.446 0 0 1-3.798-1.041l-.272-.162-2.824.741.753-2.753-.177-.282a7.448 7.448 0 0 1-1.141-3.971c.002-4.114 3.349-7.461 7.465-7.461a7.413 7.413 0 0 1 5.275 2.188 7.42 7.42 0 0 1 2.183 5.279c-.002 4.114-3.349 7.462-7.461 7.462m4.093-5.589c-.225-.113-1.327-.655-1.533-.73-.205-.075-.354-.112-.504.112s-.58.729-.711.879-.262.168-.486.056-.947-.349-1.804-1.113c-.667-.595-1.117-1.329-1.248-1.554s-.014-.346.099-.458c.101-.1.224-.262.336-.393.112-.131.149-.224.224-.374s.038-.281-.019-.393c-.056-.113-.505-1.217-.692-1.666-.181-.435-.366-.377-.504-.383a9.65 9.65 0 0 0-.429-.008.826.826 0 0 0-.599.28c-.206.225-.785.767-.785 1.871s.804 2.171.916 2.321c.112.15 1.582 2.415 3.832 3.387.536.231.954.369 1.279.473.537.171 1.026.146 1.413.089.431-.064 1.327-.542 1.514-1.066.187-.524.187-.973.131-1.067-.056-.094-.207-.151-.43-.263"></path>
                  </svg>
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Ruhul's Jersey. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
