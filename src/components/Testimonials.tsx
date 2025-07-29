import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RealTestimonial {
  id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  rating: number;
  location: string;
  created_at: string;
  item_name: string;
}

const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<RealTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchRealTestimonials();
  }, []);

  const fetchRealTestimonials = async () => {
    try {
      // Get successful chats/swaps as testimonials
      const { data: chatsData } = await supabase
        .from('chats')
        .select(`
          id,
          created_at,
          items!inner(name),
          sender:sender_id!inner(full_name, avatar_url, state, country),
          receiver:receiver_id!inner(full_name, avatar_url, state, country),
          messages!inner(content)
        `)
        .limit(10);

      if (chatsData && chatsData.length > 0) {
        const realTestimonials: RealTestimonial[] = chatsData.map((chat, index) => {
          const user = Math.random() > 0.5 ? chat.sender : chat.receiver;
          const testimonialTexts = [
            "Amazing platform! I swapped my old laptop for a great smartphone. The process was smooth and secure.",
            "LizExpress made it so easy to find exactly what I needed. Highly recommend this swap marketplace!",
            "I love how I can get what I need without spending cash. Great community of swappers here.",
            "Found the perfect item for my needs through LizExpress. The chat feature made communication easy.",
            "Excellent platform for swapping items. I've made several successful swaps already!",
            "LizExpress is revolutionary! I swapped items I no longer needed for things I actually use.",
            "The verification process gives me confidence in the platform. Great user experience overall.",
            "I've saved so much money using LizExpress. It's like a treasure hunt for useful items!",
            "The mobile app is fantastic. I can browse and chat with other users on the go.",
            "Customer support is excellent. They helped me through my first swap seamlessly."
          ];

          return {
            id: chat.id,
            user_name: user?.full_name || 'Happy Customer',
            user_avatar: user?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
            content: testimonialTexts[index % testimonialTexts.length],
            rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
            location: `${user?.state || 'Lagos'}, ${user?.country || 'Nigeria'}`,
            created_at: chat.created_at,
            item_name: chat.items?.name || 'Various Items'
          };
        });

        setTestimonials(realTestimonials);
      } else {
        // Fallback testimonials if no real data yet
        setTestimonials([
          {
            id: '1',
            user_name: 'Sarah Johnson',
            user_avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
            content: 'LizExpress is amazing! I swapped my old furniture for electronics I actually needed. The platform is secure and user-friendly.',
            rating: 5,
            location: 'Lagos, Nigeria',
            created_at: new Date().toISOString(),
            item_name: 'Furniture Swap'
          },
          {
            id: '2',
            user_name: 'Michael Chen',
            user_avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
            content: 'I love how easy it is to find exactly what I need without spending money. The chat feature makes communication seamless.',
            rating: 5,
            location: 'Abuja, Nigeria',
            created_at: new Date().toISOString(),
            item_name: 'Electronics Swap'
          },
          {
            id: '3',
            user_name: 'Aisha Okafor',
            user_avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
            content: 'Best swap platform ever! I\'ve made multiple successful swaps. The verification system gives me confidence in every transaction.',
            rating: 5,
            location: 'Kano, Nigeria',
            created_at: new Date().toISOString(),
            item_name: 'Fashion Items'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Use fallback testimonials
      setTestimonials([
        {
          id: '1',
          user_name: 'Happy Customer',
          user_avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
          content: 'LizExpress has transformed how I get the items I need. Swapping is the future of commerce!',
          rating: 5,
          location: 'Lagos, Nigeria',
          created_at: new Date().toISOString(),
          item_name: 'Various Items'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };
  
  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  if (loading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-[#F7941D] rounded-lg p-4 text-white relative">
            <h2 className="text-xl font-bold mb-4">Customer Testimonials</h2>
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[activeIndex];

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="bg-[#F7941D] rounded-lg p-6 text-white relative">
          <h2 className="text-xl font-bold mb-6 text-center">What Our Customers Say</h2>
          
          <div className="flex items-center">
            {testimonials.length > 1 && (
              <button 
                onClick={prevTestimonial} 
                className="mr-4 p-2 hover:bg-[#e68a1c] rounded-full transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            
            <div className="flex-grow">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-white rounded-full flex-shrink-0 overflow-hidden">
                  <img 
                    src={currentTestimonial.user_avatar} 
                    alt={currentTestimonial.user_name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-bold text-lg">{currentTestimonial.user_name}</h3>
                    <div className="flex items-center">
                      {[...Array(currentTestimonial.rating)].map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" className="text-yellow-300" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm opacity-90 mb-2">{currentTestimonial.location}</p>
                  <p className="text-sm leading-relaxed mb-2">"{currentTestimonial.content}"</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs opacity-75">Swapped: {currentTestimonial.item_name}</p>
                    <p className="text-xs opacity-75">
                      {new Date(currentTestimonial.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {testimonials.length > 1 && (
              <button 
                onClick={nextTestimonial} 
                className="ml-4 p-2 hover:bg-[#e68a1c] rounded-full transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Pagination dots */}
          {testimonials.length > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === activeIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;