
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    });
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your store settings and preferences.
        </p>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Update your store details and information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input id="store-name" defaultValue="Ruhul's Jersey" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input id="contact-email" defaultValue="info@ruhulsjersey.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-phone">Store Phone</Label>
                  <Input id="store-phone" defaultValue="+880 1710 093 471" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-address">Store Address</Label>
                  <Input id="store-address" defaultValue="123 Jersey Street, Dhaka, Bangladesh" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Store Preferences</CardTitle>
              <CardDescription>
                Configure how your store works.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Put your store in maintenance mode while you make updates.
                  </p>
                </div>
                <Switch id="maintenance-mode" />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-guest-checkout">Allow Guest Checkout</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to checkout without creating an account.
                  </p>
                </div>
                <Switch id="allow-guest-checkout" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure which emails are sent to you and your customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Order Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive an email when a new order is placed.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Order Status Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Send emails to customers when their order status changes.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Methods</CardTitle>
              <CardDescription>
                Configure shipping options for your customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Standard Shipping</Label>
                  <p className="text-sm text-muted-foreground">
                    5-7 business days delivery.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Express Shipping</Label>
                  <p className="text-sm text-muted-foreground">
                    2-3 business days delivery.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Configure payment options for your customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cash on Delivery</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to pay when they receive their order.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>bKash</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to pay using bKash mobile payment.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Bank Transfer</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to pay via bank transfer.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>Save Settings</Button>
      </div>
    </div>
  );
};

export default AdminSettings;
