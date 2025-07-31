import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../store/AppContext";
import styles from "./Auth.module.css";
import logo from "../../assets/Eduquity25.jpg";
import { useState } from "react";

const Auth = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const { login } = useAppContext();
  const [loading, setLoading] = useState(false);
  // const [showApiConfig, setShowApiConfig] = useState(false);
  // const [apiDomain, setApiDomain] = useState("http://erp.eduquity.com");
  // const [apiLink, setApiLink] = useState("/odoo_connect");

  /*  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await fetch(`${apiDomain}${apiLink}`, {
        method: "GET",
        headers: {
          action: "login",
          login: data.email,
          password: data.password,
          db: "eduquity",
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Mobile; login-page)",
        },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const responseText = await response.text();

      // Try to parse as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);

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
            employee_assigned_project: responseData?.assigned_project ?? "None",
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
            responseData.message ||
              "Invalid email or password. Please try again."
          );
        }
      } catch {
        // If JSON parsing fails, treat as HTML
        if (responseText.includes("This User Already Login")) {
          alert(
            "You are already logged in on another device. Please logout from the other device first."
          );
          return;
        } else {
          throw new Error(
            "Invalid email or password. Please check your credentials and try again."
          );
        }
      }
    } catch (error) {
      // Show graceful error messages
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        alert(
          "Unable to connect to the server. Please check your internet connection and try again."
        );
      } else if (error.message.includes("Server error: 500")) {
        alert("Server is temporarily unavailable. Please try again later.");
      } else if (
        error.message.includes("Server error: 401") ||
        error.message.includes("Server error: 403")
      ) {
        alert(
          "Invalid email or password. Please check your credentials and try again."
        );
      } else {
        alert(error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }; */

  // Mock login for testing - uncomment this and comment the above onSubmit function
  const onSubmit = async (data) => {
    setLoading(true);

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: data.email,
        password: data.password,
        db: "eduquity",
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const responseText = await response.text();
    try {
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
    } catch (jsonError) {
      // If JSON parsing fails, treat as HTML
      if (responseText.includes("This User Already Login")) {
        alert(
          "You are already logged in on another device. Please logout from the other device first."
        );
        return;
      } else {
        throw new Error(
          "Invalid email or password. Please check your credentials and try again."
        );
      }
    }

    /* const mockUserData = {
      name: "Test User",
      email: data.email,
      password: data.password,
      ["api-Key"]: "mock-api-key",
      Id: "mock-id",
      employeeId: "EMP123",
      employee_email: data.email,
      employee_phone: "1234567890",
      employee_latitude: "12.9716",
      employee_longitude: "77.5946",
      employee_department: "Engineering",
      employee_post: "Developer",
    };

    localStorage.setItem("loginData", JSON.stringify(mockUserData));
    localStorage.setItem("employeeId", String(mockUserData.employeeId));
    localStorage.setItem("serverApiKey", mockUserData["api-Key"]);

    login(mockUserData); */
  };

  // const handleApiSubmit = (e) => {
  //   e.preventDefault();

  //   // Save API configuration to localStorage
  //   localStorage.setItem("apiDomain", apiDomain);
  //   localStorage.setItem("apiLink", apiLink);

  //   // Show success message
  //   alert("API configuration saved successfully!");

  //   setShowApiConfig(false);
  // };

  // // Load saved API configuration on component mount
  // useEffect(() => {
  //   const savedDomain = localStorage.getItem("apiDomain");
  //   const savedLink = localStorage.getItem("apiLink");

  //   if (savedDomain) setApiDomain(savedDomain);
  //   if (savedLink) setApiLink(savedLink);
  // }, []);

  return (
    <div className={styles.authContainer}>
      <div className={styles.loginCard}>
        {/* <button
          className={styles.gearButton}
          onClick={() => setShowApiConfig(!showApiConfig)}
          type="button"
        >
          ⚙️
        </button> */}

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

        {/* {!showApiConfig ? (
          <>
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
          </>
        ) : (
          <>
            <h1 className={styles.title}>API Configuration</h1>
            <form className={styles.form} onSubmit={handleApiSubmit}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={apiDomain}
                  onChange={(e) => setApiDomain(e.target.value)}
                  placeholder="Enter API Domain"
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={apiLink}
                  onChange={(e) => setApiLink(e.target.value)}
                  placeholder="Enter API Link"
                  className={styles.input}
                  required
                />
              </div>
              <button type="submit" className={styles.loginButton}>
                Save Configuration
              </button>
              <button
                type="button"
                className={styles.backButton}
                onClick={() => setShowApiConfig(false)}
              >
                ← Back to Login
              </button>
            </form>
          </>
        )} */}
      </div>
    </div>
  );
};

export default Auth;
