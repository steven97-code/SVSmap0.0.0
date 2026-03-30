import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface LoginAnimationProps {
  onComplete: () => void;
}

export function LoginAnimation({ onComplete }: LoginAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // 3 seconds animation
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 overflow-hidden">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative flex flex-col items-center"
      >
        <motion.img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Emblem_of_the_Ministry_of_National_Defence_%28Algeria%29.svg/1024px-Emblem_of_the_Ministry_of_National_Defence_%28Algeria%29.svg.png"
          alt="Ministry of National Defence - Algeria"
          className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-[0_0_30px_rgba(202,138,4,0.3)]"
          animate={{ 
            rotateY: [0, 360],
          }}
          transition={{ 
            duration: 2, 
            ease: "easeInOut",
            delay: 0.2
          }}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-8 text-center"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200 tracking-wider">
            MINISTRY OF NATIONAL DEFENCE
          </h1>
          <p className="text-slate-400 mt-2 tracking-widest text-sm uppercase">
            Secure Access System
          </p>
        </motion.div>

        {/* Loading bar */}
        <motion.div 
          className="w-64 h-1 bg-slate-800 rounded-full mt-8 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div 
            className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
