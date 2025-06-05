import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="divider"></div>
        <p className="footer-text">
          © {new Date().getFullYear()} DJ Recording Manager. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer; 