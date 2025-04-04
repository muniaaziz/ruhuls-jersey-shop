
import React from 'react';
import { StarIcon } from 'lucide-react';

const testimonials = [
  {
    name: 'Arif Ahmed',
    title: 'Football Club Manager',
    content: 'Ruhul\'s Jersey delivered excellent quality jerseys for our entire club. The printing was perfect and they helped us throughout the design process.',
    rating: 5
  },
  {
    name: 'Salma Begum',
    title: 'Event Organizer',
    content: 'We needed 150 custom t-shirts for our corporate event with just two weeks notice. The team delivered on time and the quality exceeded our expectations.',
    rating: 5
  },
  {
    name: 'Karim Rahman',
    title: 'Cricket Team Captain',
    content: 'The cricket jerseys we ordered were fantastic quality and the team was very responsive to our customization requests. Will definitely order again.',
    rating: 4
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="bg-gray-50 section-padding">
      <div className="jersey-container">
        <div className="text-center mb-12">
          <h2 className="heading-secondary mb-4">Customer Testimonials</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our customers have to say about their experience with Ruhul's Jersey.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg p-6 shadow-md"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon 
                    key={i} 
                    className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill={i < testimonial.rating ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-6">"{testimonial.content}"</p>
              <div>
                <p className="font-semibold text-jersey-navy">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
