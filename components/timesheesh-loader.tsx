import React from 'react';

const TimesheeshLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex items-center p-5 rounded-full shadow-lg bg-card opacity-0 animate-fade-in-down">
        <div className="relative w-16 h-16 opacity-0 animate-fade-in-right">
          {/* Rotating hands */}
          <div className="absolute w-16 h-16 animate-spin-slow">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" className="transform -rotate-1">
              <rect x="29" y="10" width="6" height="15" fill="currentColor" className="text-foreground"></rect>
            </svg>
          </div>
          <div className="absolute w-16 h-16 animate-spin-very-slow">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" className="transform -rotate-1">
              <rect x="29" y="10" width="6" height="15" fill="currentColor" className="text-foreground"></rect>
            </svg>
          </div>
          
          {/* Clock background */}
          <div className="absolute w-16 h-16">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
              <path d="M32 37C29.25 37 27 34.75 27 32C27 29.25 29.25 27 32 27C34.75 27 37 29.25 37 32C37 34.75 34.75 37 32 37Z" fill="currentColor" className="text-foreground"></path>
              <path fillRule="evenodd" clipRule="evenodd" d="M32 64C49.6731 64 64 49.6731 64 32C64 14.3269 49.6731 0 32 0C14.3269 0 0 14.3269 0 32C0 49.6731 14.3269 64 32 64ZM32 56C45.2548 56 56 45.2548 56 32C56 18.7452 45.2548 8 32 8C18.7452 8 8 18.7452 8 32C8 45.2548 18.7452 56 32 56Z" fill="#03A9F4"></path>
            </svg>
          </div>
        </div>
        
        <div className="px-5 font-roboto leading-tight opacity-0 animate-fade-in">
          <div className="text-lg font-normal text-foreground">Loading Timesheesh</div>
          <div className="text-xs text-muted-foreground">Just a moment please</div>
        </div>
      </div>
    </div>
  );
};

export default TimesheeshLoader;

