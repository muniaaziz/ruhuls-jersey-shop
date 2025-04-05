
import React, { useState, useEffect } from "react";
import { Navigate, Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  Home,
  PanelLeftOpen,
  PanelLeftClose,
  Database
} from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminUsers from "@/components/admin/AdminUsers";

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = async () => {
      if (!user) {
        setCheckingAdmin(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .rpc('has_role', { _role: 'admin' });
          
        if (error) throw error;
        
        setIsAdmin(!!data);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };
    
    checkAdminStatus();
    
    // Set active tab based on URL
    const path = location.pathname.split("/").pop();
    if (path === "admin") {
      setActiveTab("dashboard");
    } else if (path) {
      setActiveTab(path);
    }
  }, [user, location]);

  // Show loading state
  if (loading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jersey-purple mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </Button>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center text-gray-500 hover:text-jersey-purple">
            <Home size={16} className="mr-1" /> Back to Site
          </Link>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div 
          className={`bg-white border-r border-gray-200 h-[calc(100vh-4rem)] ${
            isSidebarOpen ? "w-64" : "w-16"
          } transition-all duration-300 ease-in-out`}
        >
          <div className="p-4">
            <nav className="space-y-2">
              <Link 
                to="/admin" 
                className={`flex items-center p-2 rounded-lg ${
                  activeTab === "dashboard" 
                    ? "bg-jersey-purple text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ShoppingBag size={20} />
                {isSidebarOpen && <span className="ml-3">Dashboard</span>}
              </Link>
              <Link 
                to="/admin/products" 
                className={`flex items-center p-2 rounded-lg ${
                  activeTab === "products" 
                    ? "bg-jersey-purple text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Package size={20} />
                {isSidebarOpen && <span className="ml-3">Products</span>}
              </Link>
              <Link 
                to="/admin/orders" 
                className={`flex items-center p-2 rounded-lg ${
                  activeTab === "orders" 
                    ? "bg-jersey-purple text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ShoppingBag size={20} />
                {isSidebarOpen && <span className="ml-3">Orders</span>}
              </Link>
              <Link 
                to="/admin/users" 
                className={`flex items-center p-2 rounded-lg ${
                  activeTab === "users" 
                    ? "bg-jersey-purple text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Users size={20} />
                {isSidebarOpen && <span className="ml-3">Users</span>}
              </Link>
              <Link 
                to="/admin/settings" 
                className={`flex items-center p-2 rounded-lg ${
                  activeTab === "settings" 
                    ? "bg-jersey-purple text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Settings size={20} />
                {isSidebarOpen && <span className="ml-3">Settings</span>}
              </Link>
              <Link 
                to="/seed-products" 
                className={`flex items-center p-2 rounded-lg text-gray-600 hover:bg-gray-100`}
              >
                <Database size={20} />
                {isSidebarOpen && <span className="ml-3">Seed Products</span>}
              </Link>
            </nav>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 p-8 overflow-auto">
          <Outlet />
          {!location.pathname.includes("/admin/") && (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="space-y-6">
              <TabsList className="grid grid-cols-4 w-full max-w-3xl mb-8">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard">
                <AdminDashboard />
              </TabsContent>
              
              <TabsContent value="products">
                <AdminProducts />
              </TabsContent>
              
              <TabsContent value="orders">
                <AdminOrders />
              </TabsContent>
              
              <TabsContent value="users">
                <AdminUsers />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
