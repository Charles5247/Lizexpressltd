import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle sign in logic
  };

  return (
    <div className="min-h-screen bg-[#4A0E67] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl flex overflow-hidden">
        <div className="w-full md:w-1/2 p-8 bg-[#FFF5E6]">
          <div className="flex justify-between mb-8">
            <button className="text-[#4A0E67] font-bold border-b-2 border-[#4A0E67]">SIGN IN</button>
            <Link to="/signup" className="text-gray-500 hover:text-[#4A0E67]">SIGN UP</Link>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#4A0E67] mb-2">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                required
              />
            </div>
            
            <div>
              <label className="block text-[#4A0E67] mb-2">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-[#4A0E67] text-white py-3 rounded font-bold hover:bg-[#3a0b50] transition-colors"
            >
              LOGIN
            </button>
            
            <div className="text-center space-y-4">
              <Link to="/forgot-password" className="text-[#4A0E67] hover:underline block">
                Forgot Password?
              </Link>
              <button className="text-[#4A0E67] hover:underline block w-full">
                Continue with Google
              </button>
            </div>
          </form>
        </div>
        
        <div className="hidden md:block md:w-1/2 bg-center bg-cover p-12 text-right"
             style={{ backgroundImage: 'url(https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)' }}>
          <div className="h-full flex flex-col justify-center">
            <h2 className="text-[#F7941D] text-4xl font-bold mb-4">Already have an account?</h2>
            <h3 className="text-[#4A0E67] text-6xl font-bold">Log in!</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;