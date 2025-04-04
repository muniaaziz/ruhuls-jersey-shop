
import React from 'react';
import { CheckCircle, FileText, Shirt, Truck } from 'lucide-react';

const steps = [
  {
    icon: <FileText className="h-10 w-10 text-jersey-purple" />,
    title: 'Select & Customize',
    description: 'Browse our products, select quantity, and customize with names, numbers, and logos.'
  },
  {
    icon: <CheckCircle className="h-10 w-10 text-jersey-purple" />,
    title: 'Place Order',
    description: 'Submit your order details, sizes, and any special instructions for your jerseys.'
  },
  {
    icon: <Shirt className="h-10 w-10 text-jersey-purple" />,
    title: 'Production',
    description: 'We produce your custom jerseys with high-quality materials and premium printing.'
  },
  {
    icon: <Truck className="h-10 w-10 text-jersey-purple" />,
    title: 'Delivery',
    description: 'Your custom jerseys are delivered to your specified location in Bangladesh.'
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section className="bg-white section-padding">
      <div className="jersey-container">
        <div className="text-center mb-12">
          <h2 className="heading-secondary mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our simple four-step process makes ordering custom jerseys quick and easy.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-medium text-jersey-navy mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
              <div className="mt-4 text-5xl font-bold text-gray-200">
                {index + 1}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-jersey-navy text-white p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-2">Need assistance with your order?</h3>
              <p className="text-gray-300">
                Contact our team directly to discuss your requirements, get custom quotes, or ask any questions.
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <a href="https://wa.me/8801712345678" className="button-whatsapp">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.403 5.633A8.919 8.919 0 0 0 12.053 3c-4.948 0-8.976 4.027-8.978 8.977 0 1.582.413 3.126 1.198 4.488L3 21.116l4.759-1.249a8.981 8.981 0 0 0 4.29 1.093h.004c4.947 0 8.975-4.027 8.977-8.977a8.926 8.926 0 0 0-2.627-6.35m-6.35 13.812h-.003a7.446 7.446 0 0 1-3.798-1.041l-.272-.162-2.824.741.753-2.753-.177-.282a7.448 7.448 0 0 1-1.141-3.971c.002-4.114 3.349-7.461 7.465-7.461a7.413 7.413 0 0 1 5.275 2.188 7.42 7.42 0 0 1 2.183 5.279c-.002 4.114-3.349 7.462-7.461 7.462m4.093-5.589c-.225-.113-1.327-.655-1.533-.73-.205-.075-.354-.112-.504.112s-.58.729-.711.879-.262.168-.486.056-.947-.349-1.804-1.113c-.667-.595-1.117-1.329-1.248-1.554s-.014-.346.099-.458c.101-.1.224-.262.336-.393.112-.131.149-.224.224-.374s.038-.281-.019-.393c-.056-.113-.505-1.217-.692-1.666-.181-.435-.366-.377-.504-.383a9.65 9.65 0 0 0-.429-.008.826.826 0 0 0-.599.28c-.206.225-.785.767-.785 1.871s.804 2.171.916 2.321c.112.15 1.582 2.415 3.832 3.387.536.231.954.369 1.279.473.537.171 1.026.146 1.413.089.431-.064 1.327-.542 1.514-1.066.187-.524.187-.973.131-1.067-.056-.094-.207-.151-.43-.263"></path>
                </svg>
                Contact via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
