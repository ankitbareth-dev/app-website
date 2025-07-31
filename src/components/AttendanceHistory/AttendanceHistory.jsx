import { useState, useEffect } from "react";
import styles from "./AttendanceHistory.module.css";
import Navbar from "../Navbar/Navbar";
import axios from "axios";

const AttendanceHistory = () => {
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true); // ⏳ Start loading
      try {
        const response = await axios.post("/api/attendance/history", {
          model: "hr.attendance",
          db: "eduquity",
          domain: [["employee_id", "=", 6966]],
          fields: [
            "id",
            "check_in",
            "check_out",
            "in_latitude",
            "in_longitude",
          ],
          order: "id desc",
          limit: 50,
          login: "a.sairam@eduquity.com",
          password: "asiram@123",
          apiKey: "edbc12f1-bb12-49c0-bc2b-1d4119309dd2",
        });

        const formattedData = response.data.records.map((record) => {
          const date = new Date(record.check_in).toLocaleDateString();
          const checkIn = new Date(record.check_in).toLocaleTimeString();
          const checkOut = record.check_out
            ? new Date(record.check_out).toLocaleTimeString()
            : null;

          const latitude = record.in_latitude;
          const longitude = record.in_longitude;

          return {
            id: record.id,
            date,
            checkIn,
            checkOut,
            latitude,
            longitude,
          };
        });

        setAttendanceHistory(formattedData);
      } catch (error) {
        console.error("❌ Error fetching attendance history:", error);
      } finally {
        setLoading(false); // ✅ Stop loading
      }
    };

    fetchAttendance();
  }, []);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 5, attendanceHistory.length));
  };

  const visibleData = attendanceHistory.slice(0, visibleCount);
  const hasMore = visibleCount < attendanceHistory.length;

  return (
    <>
      <Navbar />
      <div className={styles.cardContainer}>
        <div className={styles.attendanceCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.title}>Attendance History</h2>
          </div>

          {loading ? (
            <div className={styles.loader}>
              <div className={styles.spinner}></div>
            </div>
          ) : attendanceHistory.length === 0 ? (
            <div className={styles.noDataMessage}>
              <p className={styles.emptyMessage}>
                No attendance records found. Start by checking in!
              </p>
            </div>
          ) : (
            <>
              <div className={styles.tableContainer}>
                <table className={styles.attendanceTable}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleData.map((record) => (
                      <tr key={record.id} className={styles.tableRow}>
                        <td className={styles.date}>{record.date}</td>
                        <td className={styles.checkIn}>{record.checkIn}</td>
                        <td className={styles.checkOut}>
                          {record.checkOut || (
                            <span className={styles.pendingCheckout}>
                              Pending
                            </span>
                          )}
                        </td>
                        <td
                          className={styles.location}
                        >{`${record.latitude} && ${record.longitude}`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {hasMore && (
                <div className={styles.loadMoreContainer}>
                  <button
                    className={styles.loadMoreButton}
                    onClick={handleLoadMore}
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AttendanceHistory;
