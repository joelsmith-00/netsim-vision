import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.style.setProperty('--background', '260 25% 5%');
      root.style.setProperty('--foreground', '240 5% 92%');
      root.style.setProperty('--card', '260 22% 9%');
      root.style.setProperty('--card-foreground', '240 5% 92%');
      root.style.setProperty('--popover', '260 22% 9%');
      root.style.setProperty('--popover-foreground', '240 5% 92%');
      root.style.setProperty('--muted', '260 20% 14%');
      root.style.setProperty('--muted-foreground', '260 10% 50%');
      root.style.setProperty('--border', '260 18% 16%');
      root.style.setProperty('--input', '260 20% 14%');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--background', '220 20% 97%');
      root.style.setProperty('--foreground', '240 10% 10%');
      root.style.setProperty('--card', '220 15% 94%');
      root.style.setProperty('--card-foreground', '240 10% 10%');
      root.style.setProperty('--popover', '220 15% 94%');
      root.style.setProperty('--popover-foreground', '240 10% 10%');
      root.style.setProperty('--muted', '220 14% 90%');
      root.style.setProperty('--muted-foreground', '220 10% 40%');
      root.style.setProperty('--border', '220 13% 82%');
      root.style.setProperty('--input', '220 14% 90%');
    }
  }, [isDark]);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setIsDark(!isDark)}
      className="relative w-14 h-7 rounded-full bg-muted border border-border/50 flex items-center px-1 transition-colors duration-500"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <motion.div
        className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] bg-gradient-to-br from-primary to-accent shadow-lg"
        animate={{ x: isDark ? 0 : 24 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {isDark ? '🌙' : '☀️'}
      </motion.div>
    </motion.button>
  );
}
