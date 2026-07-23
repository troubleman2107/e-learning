"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Cuộn lên đầu trang"
      className="fixed bottom-6 right-6 z-50 flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-white/20 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/50 active:scale-95 animate-fadeIn cursor-pointer"
    >
      <ArrowUp className="size-5 stroke-[2.5]" />
    </button>
  );
}
