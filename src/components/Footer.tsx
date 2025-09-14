import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Facebook, Instagram, Youtube, MessageCircle, Mail, Phone } from 'lucide-react';
import PrivacyPolicyModal from '../pages/PrivacyPolicyModal';
import RefundPolicyModal from '../pages/RefundPolicyModal'; // New modal

const Footer: React.FC = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showRefund, setShowRefund] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const socialLinks = [
    { name: 'TikTok', url: 'https://www.tiktok.com/@lizexpressltd?is_from_webapp=1&sender_device=pc', icon: MessageCircle, color: 'hover:text-black' },
    { name: 'YouTube', url: 'https://youtube.com/@lizexpressltd?si=cpHGI931fS0yNPdc', icon: Youtube, color: 'hover:text-red-500' },
    { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61577030412249', icon: Facebook, color: 'hover:text-blue-600' },
    { name: 'Instagram', url: 'https://www.instagram.com/lizexpressnig?igsh=MWQ0ZHozeXZkMXU1eA==', icon: Instagram, color: 'hover:text-pink-500' }
  ];

  return (
    <>
      <footer className="bg-[#4A0E67] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Navigation Links */}
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/" className="hover:text-[#F7941D] transition-colors">Home</a></li>
                <li><a href="/browse" className="hover:text-[#F7941D] transition-colors">Browse</a></li>
                {user && (
                  <li><a href="/dashboard" className="hover:text-[#F7941D] transition-colors">Dashboard</a></li>
                )}
                <li><a href="/terms" className="hover:text-[#F7941D] transition-colors">Terms & Conditions</a></li>
                
                {/* Privacy Policy */}
                <li>
                  <button 
                    onClick={() => setShowPrivacy(true)}
                    className="hover:text-[#F7941D] transition-colors"
                  >
                    Privacy Policies
                  </button>
                </li>

                {/* Refund Policy */}
                <li>
                  <button 
                    onClick={() => setShowRefund(true)}
                    className="hover:text-[#F7941D] transition-colors"
                  >
                    Refund Policy
                  </button>
                </li>
              </ul>
            </div>
            
            {/* Categories */}
            <div>
              <h3 className="font-bold text-lg mb-4">Categories</h3>
              <ul className="space-y-2">
                <li><a href="/browse?category=Electronics" className="hover:text-[#F7941D] transition-colors">Electronics</a></li>
                <li><a href="/browse?category=Furniture" className="hover:text-[#F7941D] transition-colors">Furniture</a></li>
                <li><a href="/browse?category=Phones" className="hover:text-[#F7941D] transition-colors">Phones & Accessories</a></li>
                <li><a href="/browse?category=Computer" className="hover:text-[#F7941D] transition-colors">Computer & Accessories</a></li>
                <li><a href="/browse?category=Clothing" className="hover:text-[#F7941D] transition-colors">Fashion & Clothing</a></li>
                <li><a href="/browse?category=Clothing" className="hover:text-[#F7941D] transition-colors">Others</a></li>
              </ul>
            </div>

            {/* Social Media & Contact */}
            <div>
              <h3 className="font-bold text-lg mb-4">Follow Us</h3>
              <div className="flex flex-wrap gap-3 mb-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 bg-white/10 rounded-full transition-all duration-300 hover:bg-white/20 ${social.color}`}
                    title={social.name}
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail size={16} />
                  <a href="mailto:lizexpressorg@gmail.com" className="hover:text-[#F7941D] transition-colors text-sm">
                    lizexpressorg@gmail.com
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone size={16} />
                  <a href="tel:+2349048304531" className="hover:text-[#F7941D] transition-colors text-sm">
                    +234 904 8304 531
                  </a>
                </div>
              </div>
            </div>
            
            {/* Newsletter */}
            <div>
              <div className="bg-[#F7941D] p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-white">Subscribe to our Newsletter!</h3>
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-black rounded focus:outline-none focus:ring-2 focus:ring-white"
                    required
                  />
                  <button 
                    type="submit"
                    className="w-full bg-[#4A0E67] text-white px-4 py-2 rounded hover:bg-[#3a0b50] transition-colors"
                  >
                    {subscribed ? 'Subscribed!' : 'Subscribe'}
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-white/20 text-sm text-center md:text-left">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <div>
                <p> © LizExpress 2025 | All Rights Reserved</p>
                <p>Website by ViSiON Studios</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showPrivacy && (
        <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} isOpen={showPrivacy} />
      )}
      {showRefund && (
        <RefundPolicyModal onClose={() => setShowRefund(false)} isOpen={showRefund} />
      )}
    </>
  );
};

export default Footer;
