import styles from "./SplashScreen.module.css";
import logo from "../../assets/logo.png";

const SplashScreen = () => {
  return (
    <div className={styles.splashContainer}>
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <img src={logo} alt="StaffSync Logo" className={styles.logo} />
        </div>
        <h1 className={styles.title}>Eduquity-OP</h1>
        <div className={styles.spinner}></div>
      </div>
    </div>
  );
};

export default SplashScreen;
