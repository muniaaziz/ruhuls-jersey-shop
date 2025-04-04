
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-gray-100 to-white">
      <div className="jersey-container py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-jersey-navy mb-4">
              Premium Custom Jerseys For Your Team
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              We create high-quality custom jerseys and shirts for sports teams, events, and organizations. Minimum order of 10 pieces with tiered pricing for bulk orders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button className="bg-jersey-purple hover:bg-jersey-purple/90 text-white px-6 py-3 rounded-md font-medium">
                  Browse Products
                </Button>
              </Link>
              <Link to="/custom-design">
                <Button variant="outline" className="border-jersey-purple text-jersey-purple hover:bg-jersey-purple/10 px-6 py-3 rounded-md font-medium flex items-center">
                  Custom Design
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="order-1 md:order-2 relative h-64 md:h-96 animate-fade-in">
            <div className="absolute top-0 right-0 w-full h-full bg-jersey-navy rounded-lg overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-jersey-purple opacity-20"></div>
              <div className="p-8 text-white text-center flex flex-col items-center justify-center h-full">
                <h3 className="text-xl md:text-2xl font-bold mb-2">Premium Sports Jerseys</h3>
                <p className="text-sm md:text-base opacity-80">Custom designed for your team</p>
              </div>
            </div>
            <div className="absolute top-4 left-4 w-full h-full border-4 border-jersey-purple rounded-lg"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
