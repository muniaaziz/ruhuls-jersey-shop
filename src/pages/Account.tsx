
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Order, Address } from '@/types';
import { Package, MapPin, UserCircle, Clock } from 'lucide-react';

// Mock data - in a real app this would come from API
const mockUser: User = {
  id: "user-1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "01712345678",
  addresses: [
    {
      id: "address-1",
      name: "Home",
      street: "123 Main Street",
      city: "Dhaka",
      postalCode: "1000",
      phone: "01712345678",
      isDefault: true,
    }
  ]
};

const mockOrders: Order[] = [
  {
    id: "order-1",
    userId: "user-1",
    items: [
      {
        id: "cart-item-1", // Add the missing id property
        productId: "product-1",
        quantity: 15,
        customization: {
          names: [{ name: "John", size: "M" }],
          numbers: [{ number: "10", size: "M" }]
        },
        sizesDistribution: {
          "S": 5,
          "M": 5,
          "L": 5
        }
      }
    ],
    status: "pending",
    totalAmount: 4500,
    paidAmount: 0,
    createdAt: "2023-04-01",
    updatedAt: "2023-04-01",
    deliveryAddress: mockUser.addresses[0],
    statusHistory: [
      {
        status: "pending",
        timestamp: "2023-04-01",
        notes: "Order placed"
      }
    ],
    paymentHistory: []
  }
];

// Schema for profile form
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(11, { message: "Please enter a valid phone number." }),
});

// Schema for address form
const addressFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  street: z.string().min(5, { message: "Please enter a valid street address." }),
  city: z.string().min(2, { message: "Please enter a valid city." }),
  postalCode: z.string().min(4, { message: "Please enter a valid postal code." }),
  phone: z.string().min(11, { message: "Please enter a valid phone number." }),
});

const Account = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [addresses, setAddresses] = useState<Address[]>(mockUser.addresses);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: mockUser.name,
      email: mockUser.email,
      phone: mockUser.phone,
    },
  });

  const addressForm = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      name: "",
      street: "",
      city: "",
      postalCode: "",
      phone: "",
    },
  });

  const onProfileSubmit = (values: z.infer<typeof profileFormSchema>) => {
    console.log(values);
    // In a real app, this would save to API
    // Show success message after successful update
  };

  const onAddressSubmit = (values: z.infer<typeof addressFormSchema>) => {
    console.log(values);
    // In a real app, this would save to API
    // Add new address to the list
    const newAddress: Address = {
      id: `address-${Date.now()}`,
      name: values.name,
      street: values.street,
      city: values.city,
      postalCode: values.postalCode,
      phone: values.phone,
      isDefault: addresses.length === 0, // First address is default
    };
    
    setAddresses([...addresses, newAddress]);
    addressForm.reset();
  };

  return (
    <Layout>
      <div className="jersey-container py-10">
        <h1 className="heading-primary mb-8">My Account</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              <span className="hidden md:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden md:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden md:inline">Addresses</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account details. This information will be displayed on your profile.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter your phone number with country code.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit">Save Changes</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Your Orders</CardTitle>
                <CardDescription>
                  View and track your order history.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mockOrders.length > 0 ? (
                  <div className="space-y-4">
                    {mockOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Clock className="mr-1 h-4 w-4" />
                              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : order.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="border-t pt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Items:</span>
                            <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} pieces</span>
                          </div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Total Amount:</span>
                            <span>৳{order.totalAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Paid Amount:</span>
                            <span>৳{order.paidAmount.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Button variant="outline" className="w-full">View Details</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start shopping to place your first order.
                    </p>
                    <div className="mt-6">
                      <Button>Browse Products</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Add New Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Address</CardTitle>
                  <CardDescription>
                    Add a new delivery address to your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...addressForm}>
                    <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
                      <FormField
                        control={addressForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Home, Office, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addressForm.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addressForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={addressForm.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={addressForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button type="submit" className="w-full">Add Address</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              {/* Saved Addresses */}
              <Card>
                <CardHeader>
                  <CardTitle>Saved Addresses</CardTitle>
                  <CardDescription>
                    Manage your delivery addresses.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {addresses.length > 0 ? (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <h4 className="font-medium">{address.name}</h4>
                                {address.isDefault && (
                                  <span className="ml-2 px-2 py-0.5 bg-jersey-purple bg-opacity-10 text-jersey-purple rounded-full text-xs">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm mt-2">{address.street}</p>
                              <p className="text-sm">{address.city}, {address.postalCode}</p>
                              <p className="text-sm mt-1">{address.phone}</p>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Button variant="outline" size="sm">Edit</Button>
                              {!address.isDefault && (
                                <Button variant="outline" size="sm">
                                  Set as Default
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No addresses yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Add your first address to make checkout easier.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Account;
