import { useState } from "react";
import Navbar from "../Navbar/Navbar";
import { useAppContext } from "../../store/AppContext";
import styles from "./ManualAttendance.module.css";

const ManualAttendance = () => {
  const { user, attendanceHistory, addManualAttendance } = useAppContext();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    date: "",
    checkInTime: "",
    checkInAmPm: "AM",
    status: "checked-in",
    location: "",
    checkOutTime: "",
    checkOutAmPm: "AM",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.checkInTime.trim()) {
      newErrors.checkInTime = "Check-in time is required";
    } else if (!/^(0?[1-9]|1[0-2]):[0-5][0-9]$/.test(formData.checkInTime)) {
      newErrors.checkInTime = "Please enter time in HH:MM format";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (formData.status === "checked-out") {
      if (!formData.checkOutTime.trim()) {
        newErrors.checkOutTime =
          "Check-out time is required when status is checked-out";
      } else if (!/^(0?[1-9]|1[0-2]):[0-5][0-9]$/.test(formData.checkOutTime)) {
        newErrors.checkOutTime = "Please enter time in HH:MM format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertTo24Hour = (time, ampm) => {
    const [hours, minutes] = time.split(":");
    let hour24 = parseInt(hours);
    if (ampm === "AM" && hour24 === 12) {
      hour24 = 0;
    } else if (ampm === "PM" && hour24 !== 12) {
      hour24 += 12;
    }
    return `${hour24.toString().padStart(2, "0")}:${minutes}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const checkInTime24 = convertTo24Hour(
      formData.checkInTime,
      formData.checkInAmPm
    );
    const checkOutTime24 =
      formData.status === "checked-out"
        ? convertTo24Hour(formData.checkOutTime, formData.checkOutAmPm)
        : null;

    const manualAttendanceData = {
      id: Date.now(),
      srNo: attendanceHistory.length + 1,
      date: new Date(formData.date).toLocaleDateString("en-GB"),
      checkIn: checkInTime24,
      checkOut: checkOutTime24,
      location: formData.location,
      status: formData.status,
      description: formData.description,
      isManual: true, // Flag to distinguish manual entries
      createdAt: new Date().toISOString(),
    };

    setSubmittedData(manualAttendanceData);
    setShowConfirmation(true);
  };

  const handleConfirmAdd = () => {
    // Use context to add manual attendance
    addManualAttendance(submittedData);
    // Reset form and states
    setShowConfirmation(false);
    setFormData({
      email: user?.email || "",
      date: "",
      checkInTime: "",
      checkInAmPm: "AM",
      status: "checked-in",
      location: "",
      checkOutTime: "",
      checkOutAmPm: "AM",
      description: "",
    });
    setSubmittedData(null);
    // No need to reload page anymore since context will update automatically
  };

  const handleCancel = () => {
    setFormData({
      email: user?.email || "",
      date: "",
      checkInTime: "",
      checkInAmPm: "AM",
      status: "checked-in",
      location: "",
      checkOutTime: "",
      checkOutAmPm: "AM",
      description: "",
    });
    setErrors({});
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setSubmittedData(null);
  };

  return (
    <>
      <Navbar />
      <div className={styles.manualAttendanceContainer}>
        <div className={styles.formContainer}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Request Manual Attendance</h2>
            </div>
            <form onSubmit={handleSubmit} className={styles.attendanceForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`${styles.input} ${
                    errors.email ? styles.inputError : ""
                  }`}
                  placeholder="Enter email"
                />
                {errors.email && (
                  <span className={styles.errorText}>{errors.email}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`${styles.input} ${
                    errors.date ? styles.inputError : ""
                  }`}
                />
                {errors.date && (
                  <span className={styles.errorText}>{errors.date}</span>
                )}
              </div>

              <div className={styles.timeGroup}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Check-in Time</label>
                  <div className={styles.timeInputGroup}>
                    <input
                      type="text"
                      name="checkInTime"
                      value={formData.checkInTime}
                      onChange={handleInputChange}
                      placeholder="HH:MM"
                      className={`${styles.timeInput} ${
                        errors.checkInTime ? styles.inputError : ""
                      }`}
                    />
                    <select
                      name="checkInAmPm"
                      value={formData.checkInAmPm}
                      onChange={handleInputChange}
                      className={styles.ampmSelect}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                  {errors.checkInTime && (
                    <span className={styles.errorText}>
                      {errors.checkInTime}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="checked-in">Checked-in</option>
                  <option value="checked-in">Checked-out</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`${styles.input} ${
                    errors.location ? styles.inputError : ""
                  }`}
                  placeholder="Enter location"
                />
                {errors.location && (
                  <span className={styles.errorText}>{errors.location}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Add any additional notes or description..."
                  rows="3"
                />
              </div>

              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={handleCancel}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.addButton}>
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Confirmation Popup */}
        {showConfirmation && submittedData && (
          <div className={styles.confirmationOverlay}>
            <div className={styles.confirmationModal}>
              <div className={styles.confirmationHeader}>
                <h3 className={styles.confirmationTitle}>
                  Confirm Manual Attendance
                </h3>
              </div>
              <div className={styles.confirmationContent}>
                <div className={styles.confirmationField}>
                  <strong>Email:</strong> {formData.email}
                </div>
                <div className={styles.confirmationField}>
                  <strong>Date:</strong> {submittedData.date}
                </div>
                <div className={styles.confirmationField}>
                  <strong>Check-in Time:</strong> {submittedData.checkIn}
                </div>
                {submittedData.checkOut && (
                  <div className={styles.confirmationField}>
                    <strong>Check-out Time:</strong> {submittedData.checkOut}
                  </div>
                )}
                <div className={styles.confirmationField}>
                  <strong>Status:</strong> {submittedData.status}
                </div>
                <div className={styles.confirmationField}>
                  <strong>Location:</strong> {submittedData.location}
                </div>
                <div className={styles.confirmationField}>
                  <strong>Type:</strong>{" "}
                  <span className={styles.manualBadge}>Manual Entry</span>
                </div>
              </div>
              <div className={styles.confirmationButtons}>
                <button
                  onClick={handleCancelConfirmation}
                  className={styles.confirmationCancelButton}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAdd}
                  className={styles.confirmationAddButton}
                >
                  Confirm & Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ManualAttendance;
