import { Link } from 'react-router-dom';
import './Header.css';

function Header({ darkMode, setDarkMode }) {
  console.log("Header rendering, darkMode:", darkMode); // Debugging line
  
  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/">
            {darkMode ? (
              <img 
                src="https://my77imagebucket.s3.ap-northeast-1.amazonaws.com/email/UPDATES+LOGOS/hero-logo-white-transparent.png" 
                alt="DJ Recording Manager" 
                className="logo-img" 
              />
            ) : (
              <img 
                src="https://my77imagebucket.s3.ap-northeast-1.amazonaws.com/email/UPDATES+LOGOS/hero-logo-black-transparent.png" 
                alt="DJ Recording Manager" 
                className="logo-img" 
              />
            )}
          </Link>
        </div>
        <button 
          className="dark-mode-toggle" 
          onClick={() => setDarkMode(prev => !prev)}
          aria-label="Toggle dark mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}

export default Header;
