import { useState } from "react";
import styles from "./Incident.module.css";
import { useNavigate } from "react-router-dom";

const Incident = () => {
  const [isActive, setIsActive] = useState(false);

  const navigate = useNavigate();

  const handleTicketsClick = () => {
    setIsActive(!isActive);
    navigate("/tickets");
  };

  return (
    <div className={styles.pageBackground}>
      <div className={styles.incidentContainer}>
        <div className={styles.incidentHeader}>
          <div className={styles.incidentIcon}>🎫</div>
          <h2 className={styles.incidentTitle}>Incident Management</h2>
        </div>

        <div className={styles.incidentContent}>
          <p className={styles.incidentDescription}>
            Manage and track your support tickets efficiently
          </p>

          <button
            className={`${styles.ticketsButton} ${
              isActive ? styles.activeButton : ""
            }`}
            onClick={handleTicketsClick}
          >
            <span className={styles.buttonIcon}>🎟️</span>
            <span className={styles.buttonText}>Ticket</span>
            <span className={styles.buttonArrow}>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Incident;
