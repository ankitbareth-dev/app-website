import styles from "./About.module.css";
import logo from "../../assets/Eduquity25.jpg";

const About = () => {
  return (
    <div className={styles.aboutContainer}>
      <div className={styles.aboutCard}>
        <div className={styles.logoSection}>
          <img src={logo} alt="Eduquity Logo" className={styles.logo} />
        </div>

        <div className={styles.contentSection}>
          <h1 className={styles.title}>For support contact</h1>

          <div className={styles.contactSection}>
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>Email:</span>
              <a href="mailto:info@4devnet.com" className={styles.contactLink}>
                info@4devnet.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
