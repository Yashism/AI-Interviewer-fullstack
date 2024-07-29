import React, { useEffect, useRef, useState } from 'react';
import { Eye } from 'lucide-react';
import "../../styles/globals.css"
import { useReducedMotion } from 'framer-motion';
const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = (e:any) => {
    e.preventDefault();
    if (isSignUp) {
      console.log('Signing up...');
      // Implement sign-up logic here
    } else {  
      console.log('Signing in...');
      // Implement sign-in logic here
    }
  };
  // Set initial focus when component mounts
  useEffect(() => {
    if (isSignUp) {
      nameRef.current?.focus();
    } else {
      emailRef.current?.focus();
    }
  }, [isSignUp]);
  //handle enter key
  const handleEnterkey=(e: React.KeyboardEvent<HTMLInputElement>, nextRef: React.RefObject<HTMLInputElement | HTMLButtonElement> | null) =>{
 if (e.key==='Enter'){
  e.preventDefault();
   if (nextRef && nextRef.current) {
      nextRef.current.focus();
    } else {
      // If there's no next ref, this is the last input, so submit the form
      handleSubmit(e);
    }
 }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">
          {isSignUp ? 'Create an Account' : 'Welcome Back!'}
        </h1>
        <p className="text-gray-500 mb-8">
          {isSignUp
            ? 'Sign up to get started with your new account.'
            : 'To get started, sign in to your account.'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="bg-gray-50 rounded-xl p-3">
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full bg-transparent placeholder-gray-400 focus:outline-none"
                ref={nameRef}
                onKeyDown={(e) =>handleEnterkey(e,emailRef)}
                
              />
            </div>
          )}
          <div className="bg-gray-50 rounded-xl p-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-transparent placeholder-gray-400 focus:outline-none"
              ref={emailRef}
              onKeyDown={(e) =>handleEnterkey(e,passwordRef)}
            />
          </div>
          
          <div className="bg-gray-50 rounded-xl p-3 flex items-center">
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-transparent placeholder-gray-400 focus:outline-none"
              ref={passwordRef}
               onKeyDown={(e) =>handleEnterkey(e, isSignUp ? confirmPasswordRef : submitButtonRef)}
            />
            <Eye className="text-gray-400" size={20} />
          </div>
          
          {isSignUp && (
            <div className="bg-gray-50 rounded-xl p-3 flex items-center">
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full bg-transparent placeholder-gray-400 focus:outline-none"
                ref={confirmPasswordRef}
                onKeyDown={(e) => handleEnterkey(e, submitButtonRef)}
              />
              <Eye className="text-gray-400" size={20} />
            </div>
          )}
          
          <div className="text-right">
            <a href="#" className="text-sm text-black font-medium underline">Forgot password</a>
          </div>
          
          <button
            ref={submitButtonRef}
            type="submit"
            className="w-full bg-black text-white py-3 rounded-xl font-medium text-lg hover:bg-gray-800 transition duration-300"
          >
            {isSignUp ? 'Sign up' : 'Sign in'}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-gray-400 relative">
          <span className="bg-white px-4 relative z-10">{isSignUp ?"Or sign up with " :"Or sign in with"}</span>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-1"></div>
        </div>
        
        <div className="mt-4 space-y-3">
          <button className="w-full flex items-center justify-center py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition duration-300">
            <img src="/Google.png" alt="Google logo" className="w-5 h-5 mr-2" />
            <span className="font-medium">{isSignUp?"Sign up with Google":" Sign in with Google"}</span>
          </button>
          <button className="w-full flex items-center justify-center py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition duration-300">
            <img src="/Apple.png" alt="Apple logo" className="w-5 h-5 mr-2" />
            <span className="font-medium">{isSignUp?"Sign up with Apple":"Sign in with Apple"}</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="mt-2 text-black font-medium underline"
          >
            {isSignUp ? 'Sign in' : 'Register now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;