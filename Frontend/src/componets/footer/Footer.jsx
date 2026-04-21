import styles from "./Footer.module.css";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import { useState } from "react";

function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert("Subscribed with: " + email);
    setEmail("");
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Brand */}
        <div className={styles.section}>
          <h2 className={styles.logo}>📚 Digital Library</h2>
          <p className={styles.text}>
            Discover thousands of books anytime, anywhere. القراءة أصبحت أسهل.
          </p>
        </div>

        {/* Links */}
        <div className={styles.section}>
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link to="/login" className={styles.link}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/signup" className={styles.link}>
                Signup
              </Link>
            </li>
            <li>
              <Link to="/#HowItWorks" className={styles.link}>
                How It Works
              </Link>
            </li>
            <li>
              <Link to="/#testimonials" className={styles.link}>
                Testimonials
              </Link>
            </li>
            <li>
              <Link to="/login" className={styles.link}>
                Browse Books
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className={styles.section}>
          <h3>Subscribe</h3>
          <p className={styles.text}>Get updates on new books</p>

          <form onSubmit={handleSubscribe} className={styles.form}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
            <button type="submit" className={styles.subscribeBtn}>
              Subscribe
            </button>
          </form>
        </div>

        {/* Social */}
        <div className={styles.section}>
          <h3>Follow Us</h3>
          <div className={styles.socials}>
            <FaFacebookF />
            <FaTwitter />
            <FaInstagram />
            <FaLinkedin />
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className={styles.bottom}>
        © {new Date().getFullYear()} Digital Library. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
