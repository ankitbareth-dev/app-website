import Navbar from "../Navbar/Navbar";
import styles from "./Attendance.module.css";
import { useAppContext } from "../../store/AppContext";
import { useEffect, useState } from "react";

const CheckIn = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isCheckedIn, currentCheckInTime, user, checkIn, checkOut } =
    useAppContext();

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000, // 15 seconds timeout
        maximumAge: 60000, // Accept cached position up to 1 minute old
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);

          // Create a more descriptive error message
          let errorMessage = "";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied by user. Please allow location access and try again.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                "Location information is unavailable. Please check your GPS settings.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              break;
            default:
              errorMessage =
                "An unknown error occurred while retrieving location.";
              break;
          }

          const enhancedError = new Error(errorMessage);
          enhancedError.code = error.code;
          reject(enhancedError);
        },
        options
      );
    });
  };

  const handleToggle = async () => {
    setError("");
    setSuccessMessage("");
    console.log("🚀 Handle toggle called, isCheckedIn:", isCheckedIn);

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by this browser. Please use a modern browser with location services."
      );
      return;
    }

    if (!isCheckedIn) {
      setIsLoading(true);
      try {
        console.log("⏰ Starting check-in process...");
        const position = await getCurrentPosition();
        console.log("📍 Position obtained:", position);
        const location = await reverseGeocode(
          position.latitude,
          position.longitude
        );
        console.log("🏠 Location geocoded:", location);
        await checkIn(location, position);
        setSuccessMessage("✅ Checked in successfully!");
      } catch (error) {
        console.error("❌ Check-in error details:", error);
        let errorMessage = "";

        // Handle geolocation-specific errors
        if (
          error.code === 1 ||
          error.message.includes("permission") ||
          error.message.includes("denied")
        ) {
          errorMessage =
            "Location access denied. Please allow location access in your browser and try again.";
        } else if (
          error.code === 2 ||
          error.message.includes("position unavailable")
        ) {
          errorMessage =
            "Unable to determine your location. Please check your GPS/location settings and try again.";
        } else if (error.code === 3 || error.message.includes("timeout")) {
          errorMessage = "Location request timed out. Please try again.";
        } else if (
          error.message.includes("assigned location") ||
          error.message.includes("meters away")
        ) {
          errorMessage = error.message; // Use the specific location error message
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch") ||
          error.message.includes("Failed to fetch")
        ) {
          errorMessage =
            "Network error. Please check your internet connection and try again.";
        } else if (error.message.includes("Server error")) {
          errorMessage =
            "Server is temporarily unavailable. Please try again later.";
        } else if (error.message.includes("login data")) {
          errorMessage = "Session expired. Please log in again.";
        } else {
          errorMessage = `Failed to check-in: ${
            error.message || "An unexpected error occurred. Please try again."
          }`;
        }

        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        console.log("⏰ Starting check-out process...");
        const position = await getCurrentPosition();
        console.log("📍 Check-out position obtained:", position);
        const location = await reverseGeocode(
          position.latitude,
          position.longitude
        );
        console.log("🏠 Location geocoded:", location);
        await checkOut(position);
        setSuccessMessage("✅ Checked out successfully!");
      } catch (error) {
        console.error("❌ Check-out error details:", error);

        if (error.type === "ALREADY_CHECKED_OUT") {
          setSuccessMessage("✅ Checked out from server successfully!");
        } else if (
          error.code === 1 ||
          error.message.includes("permission") ||
          error.message.includes("denied")
        ) {
          setError(
            "Location access denied. Please allow location access in your browser and try again."
          );
        } else if (
          error.code === 2 ||
          error.message.includes("position unavailable")
        ) {
          setError(
            "Unable to determine your location. Please check your GPS/location settings and try again."
          );
        } else if (error.code === 3 || error.message.includes("timeout")) {
          setError("Location request timed out. Please try again.");
        } else if (
          error.message.includes("assigned location") ||
          error.message.includes("meters away")
        ) {
          setError(error.message); // Use the specific location error message
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch") ||
          error.message.includes("Failed to fetch")
        ) {
          setError(
            "Network error. Please check your internet connection and try again."
          );
        } else if (error.message.includes("Server error")) {
          setError(
            "Server is temporarily unavailable. Please try again later."
          );
        } else if (error.message.includes("login data")) {
          setError("Session expired. Please log in again.");
        } else if (error.message.includes("Check-in record not found")) {
          setError(
            "No active check-in found. Please check-in first before attempting to check-out."
          );
        } else {
          setError(
            `Failed to check-out: ${
              error.message || "An unexpected error occurred. Please try again."
            }`
          );
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Convert coordinates to readable address
  const reverseGeocode = async (latitude, longitude) => {
    try {
      console.log("🌍 Reverse geocoding:", latitude, longitude);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        {
          method: "GET",
          headers: {
            // Recommended by OpenStreetMap usage policy
            "User-Agent": "StaffSync/1.0 (ankitbareth7877@gmail.com)",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Geocoding service unavailable");
      }

      const data = await response.json();
      console.log("🌍 Geocoding response:", data);

      if (data && data.address) {
        const { city, state, country, town, village, county } = data.address;
        const locationParts = [
          city || town || village || county,
          state,
          country,
        ].filter(Boolean);
        return locationParts.join(", ") || "Unknown location";
      }

      throw new Error("Address not found");
    } catch (error) {
      console.error("❌ Reverse geocoding error:", error);
      return "Location not available";
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.attendanceContainer}>
        <div className={styles.attendanceCard}>
          <div className={styles.buttonContainer}>
            <button
              className={
                isCheckedIn ? styles.checkInButton : styles.checkInButton2
              }
              onClick={handleToggle}
              disabled={isLoading}
            >
              {isLoading
                ? "Processing..."
                : isCheckedIn
                ? "Check-Out"
                : "Check-In"}
            </button>
          </div>

          {error && (
            <div className={styles.errorContainer}>
              <p className={styles.errorMessage}>{error}</p>
            </div>
          )}

          {successMessage && (
            <div className={styles.successContainer}>
              <p className={styles.successMessage}>{successMessage}</p>
            </div>
          )}

          {(isCheckedIn || currentCheckInTime) && (
            <div className={styles.checkInContainers}>
              <div className={styles.userData}>
                <div className={styles.userField}>
                  <strong>Email</strong>
                  {user?.email || ""}
                </div>
                <div className={styles.userField}>
                  <strong>Check-In Time</strong>
                  {currentCheckInTime || ""}
                </div>
                <div className={styles.userField}>
                  <strong>Status</strong>
                  {isCheckedIn ? "Checked In" : "Checked Out"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CheckIn;
