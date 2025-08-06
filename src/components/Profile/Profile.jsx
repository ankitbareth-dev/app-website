import { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import styles from "./Profile.module.css";
import profileImage from "../../assets/profile.png";
import { useAppContext } from "../../store/AppContext";
import logo from "../../assets/Eduquity25.jpg";

const Profile = () => {
  const { isCheckedIn } = useAppContext();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    joinDate: "20 May 2025",
    latitude: "",
    longitude: "",
    employeeId: "",
    assigned_project: "",
  });

  const loadUserData = () => {
    const loginData = localStorage.getItem("loginData");
    if (loginData) {
      const parsed = JSON.parse(loginData);

      setUserData({
        name: parsed.name || parsed.User || "User",
        email: parsed.employee_email || "",
        phone: parsed.employee_phone || "",
        department: parsed.employee_department || "N/A",
        position: parsed.employee_post || "N/A",
        joinDate: "20 May 2025",
        latitude: parsed.employee_latitude || "N/A",
        longitude: parsed.employee_longitude || "N/A",
        employeeId: parsed.employeeId || "",
        assigned_project: parsed.employee_assigned_project[1] || "N/A",
        assigned_venue: parsed.employee_assigned_venue[1] || "N/A",
      });
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  return (
    <>
      <Navbar />
      <div className={styles.cardContainer}>
        <div className={styles.profileCard}>
          <div className={styles.cardHeader}>
            <div className={styles.imageContainer}>
              <img
                className={styles.cardImage}
                src={profileImage}
                alt="Profile"
              />
              <div
                className={`${styles.statusBadge} ${
                  isCheckedIn ? styles.active : styles.inactive
                }`}
              >
                {isCheckedIn ? "Active" : "Inactive"}
              </div>
            </div>
            <div className={styles.headerInfo}>
              <h2 className={styles.name}>{userData.name}</h2>
              <p className={styles.position}>{userData.position}</p>
              <p className={styles.department}>{userData.department}</p>
            </div>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>Contact Information</h3>
              <div className={styles.infoItem}>
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>{userData.email}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Phone:</span>
                <span className={styles.value}>{userData.phone}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Latitude:</span>
                <span className={styles.value}>
                  {userData.latitude ?? "N/A"}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Longitude:</span>
                <span className={styles.value}>
                  {userData.longitude ?? "N/A"}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Assigned-Venue:</span>
                <span className={styles.value}>
                  {userData.assigned_venue ?? "N/A"}
                </span>
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>Work Details</h3>
              <div className={styles.infoItem}>
                <span className={styles.label}>Join Date:</span>
                <span className={styles.value}>{userData.joinDate}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Employee ID:</span>
                <span className={styles.value}>
                  EMP-{userData.employeeId || "N/A"}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Post:</span>
                <span className={styles.value}>{userData.position}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Status:</span>
                <span
                  className={`${styles.value} ${
                    isCheckedIn ? styles.activeStatus : styles.inactiveStatus
                  }`}
                >
                  {isCheckedIn ? "Active (Checked In)" : "Inactive"}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Assigned-Project:</span>
                <span className={styles.value}>
                  {userData.assigned_project ?? "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.logoContainer}>
          <img src={logo} alt="Logo" className={styles.logo} />
        </div>
      </div>
    </>
  );
};

export default Profile;
