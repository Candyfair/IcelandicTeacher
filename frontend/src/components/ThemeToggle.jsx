import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const isDark = theme === 'dark';

  function handleClick() {
    if (isSpinning) return;
    setIsSpinning(true);
    setTimeout(() => {
      onToggle();
      setIsSpinning(false);
    }, 400);
  }

  const Icon = isDark ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className="theme-toggle"
    >
      <Icon
        size={20}
        className={isSpinning ? 'theme-icon spinning' : 'theme-icon'}
      />
    </button>
  );
}
