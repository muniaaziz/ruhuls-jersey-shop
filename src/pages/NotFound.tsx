
import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="jersey-container py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="text-9xl font-bold text-jersey-purple mb-6">404</div>
          <h1 className="text-3xl font-bold text-jersey-navy mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button className="bg-jersey-purple hover:bg-jersey-purple/90 text-white px-6 py-3 rounded-md font-medium">
                Go to Homepage
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" className="border-jersey-purple text-jersey-purple hover:bg-jersey-purple/10 px-6 py-3 rounded-md font-medium">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
