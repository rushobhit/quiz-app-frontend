import { useTheme } from "../context/ThemeContext";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        {/* Use a plain anchor so it always goes to root on static hosting */}
        <a href="/" className="site-brand">
          <span className="site-brand__mark">Q</span>
          <div className="site-brand__text">
            <strong>Quiz App</strong>
            <span>Practice smarter</span>
          </div>
        </a>

        <nav className="site-nav" aria-label="Main navigation">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
          >
            <span className="theme-toggle__track">
              <span
                className={`theme-toggle__thumb theme-toggle__thumb--${theme}`}
              />
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}