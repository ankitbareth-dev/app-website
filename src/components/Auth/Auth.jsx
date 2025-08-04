import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../store/AppContext";
import styles from "./Auth.module.css";
import logo from "../../assets/Eduquity25.jpg";
import { useEffect, useState } from "react";

const Auth = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const { login } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [configError, setConfigError] = useState("");
  const [configSuccess, setConfigSuccess] = useState("");
  const [loginError, setLoginError] = useState("");
  const [currentConfig, setCurrentConfig] = useState({
    apiDomain: "",
    dbName: "",
  });

  useEffect(() => {
    // Check if configuration exists in localStorage
    const apiDomain = localStorage.getItem("apiDomain");
    const dbName = localStorage.getItem("dbName");
    if (apiDomain && dbName) {
      setIsConfigured(true);
      setCurrentConfig({ apiDomain, dbName });
    }
  }, []);

  const handleConfiguration = async (e) => {
    e.preventDefault();
    setConfigError("");
    setConfigSuccess("");
    setConfigLoading(true);

    const apiDomain = e.target.apiDomain.value.trim();
    const dbName = e.target.dbName.value.trim();

    if (!apiDomain || !dbName) {
      setConfigError("Both API Domain and DB Name are required");
      setConfigLoading(false);
      return;
    }

    try {
      // Optional: Add validation by making a test request to the API
      const testResponse = await fetch(`${apiDomain}/api/test`, {
        method: "GET",
      });

      if (!testResponse.ok) {
        throw new Error("Invalid API domain");
      }

      // Store configuration in localStorage
      localStorage.setItem("apiDomain", apiDomain);
      localStorage.setItem("dbName", dbName);
      setIsConfigured(true);
      setConfigSuccess("Configuration successful! You can now login.");

      // Automatically return to login after 2 seconds
      setTimeout(() => {
        setShowConfig(false);
      }, 2000);
    } catch (error) {
      console.error("Configuration error:", error);
      setConfigError("Failed to validate API domain. Please check the URL.");
    } finally {
      setConfigLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoginError(""); // Clear any previous errors

    if (!isConfigured) {
      setLoginError(
        "Please configure API Domain and DB Name using the gear (⚙️) icon before logging in"
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    const apiDomain = localStorage.getItem("apiDomain");
    const dbName = localStorage.getItem("dbName");

    try {
      const response = await fetch(`/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: data.email,
          password: data.password,
          db: dbName,
          apiDomain,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const responseText = await response.text();
      let responseData = JSON.parse(responseText);

      // Check if JSON response has successful auth
      if (responseData && responseData.Status === "auth successful") {
        const userData = {
          name: responseData.User,
          email: data.email,
          password: data.password,
          ["api-Key"]: responseData["api-key"],
          Id: responseData.UserID,
          employeeId: responseData.employee_id,
          employee_email: responseData.work_email,
          employee_phone: responseData.work_phone,
          employee_latitude: responseData.employee_latitude,
          employee_longitude: responseData.employee_longitude,
          employee_department: responseData.department_id,
          employee_post: responseData.job_id,
          employee_assigned_project: responseData?.active_project ?? "None",
          employee_assigned_venue: responseData?.active_venue ?? "None",
        };

        localStorage.setItem("loginData", JSON.stringify(userData));
        localStorage.setItem(
          "employeeId",
          String(responseData.employee_id || "")
        );
        localStorage.setItem("serverApiKey", responseData["api-key"]);

        login(userData);
        navigate("/dashboard");
        return;
      } else {
        // JSON but not successful auth
        throw new Error(
          responseData.message || "Invalid email or password. Please try again."
        );
      }
    } catch (error) {
      setLoginError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      {showConfig ? (
        // Configuration Card
        <div className={styles.loginCard}>
          <h1 className={styles.title}>Configure</h1>
          <form className={styles.form} onSubmit={handleConfiguration}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="apiDomain"
                placeholder="Enter API Domain"
                className={styles.input}
                defaultValue={currentConfig.apiDomain}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="dbName"
                placeholder="Enter DB Name"
                className={styles.input}
                defaultValue={currentConfig.dbName}
                required
              />
            </div>
            {configError && <div className={styles.error}>{configError}</div>}
            {configSuccess && (
              <div className={styles.success}>{configSuccess}</div>
            )}
            <button
              type="submit"
              className={styles.loginButton}
              disabled={configLoading}
            >
              {configLoading ? (
                <div className={styles.spinner}></div>
              ) : isConfigured ? (
                "Update Configuration"
              ) : (
                "Configure"
              )}
            </button>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => setShowConfig(false)}
            >
              Back to Login
            </button>
          </form>
        </div>
      ) : (
        <div className={styles.loginCard}>
          <button
            className={styles.gearButton}
            onClick={() => setShowConfig(true)}
          >
            ⚙️
          </button>
          <h1 className={styles.title}>Login</h1>
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.inputGroup}>
              <input
                type="email"
                {...register("email", { required: true })}
                placeholder="Enter your email"
                className={styles.input}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <input
                type="password"
                {...register("password", { required: true })}
                placeholder="Enter your password"
                className={styles.input}
                required
              />
            </div>
            {loginError && <div className={styles.error}>{loginError}</div>}
            <button
              type="submit"
              className={styles.loginButton}
              disabled={loading}
            >
              {loading ? <div className={styles.spinner}></div> : "Log-in"}
            </button>
          </form>
          <div className={styles.logoContainer}>
            <img src={logo} alt="Logo" className={styles.logo} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
