import React, { useState, useEffect } from 'react';
import { ArrowUpCircle } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    const scrolled = document.documentElement.scrollTop;
    if (scrolled > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {
        <button
          onClick={scrollToTop}
          className={`fixed bottom-4 left-4 bg-black/50 text-black hover:bg-black/70
                        rounded-full p-2 shadow-lg z-50 transition-all duration-500
                        opacity-0 ${isVisible ? 'opacity-70' : 'opacity-0'}`}
          aria-label="Scroll to Top"
          style={{
            transition: 'opacity 0.5s ease-in-out', // Ensure smooth transition
          }}
        >
          <ArrowUpCircle className="h-6 w-6" />
        </button>
      }
    </>
  );
};

export default ScrollToTop;
