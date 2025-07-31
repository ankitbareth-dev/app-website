import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: "*", // ✅ Your frontend URL
    credentials: false,
  })
);
app.use(express.json());

// Login endpoint - handles /odoo_connect
app.post("/api/login", async (req, res) => {
  try {
    const { db, login, password } = req.body;

    const response = await axios({
      method: "get",
      url: `http://3.109.255.36/odoo_connect?db=${db}`,
      headers: {
        login,
        password,
        db,
        "Content-Type": "application/json",
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({
      error: "Login failed",
      status: error.response?.status,
      details: error.response?.data || error.message,
    });
  }
  /* const mockResponse = {
    Status: "auth successful",
    User: "Administrator",
    "api-key": "13985aa4-d760-468c-a5f4-45b96c341bd5",
    employee_id: 101,
  };

  // Optional: simulate a short delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Send the mock response
  res.status(200).json(mockResponse); */
});

// Profile endpoint - handles /send_request
app.post("/api/profile", async (req, res) => {
  try {
    const { model, id, db, fields, login, password, apiKey } = req.body;
    console.log("🔍 Profile request:", {
      model,
      id,
      db,
      fields,
      login,
      password,
      apiKey,
    });

    const response = await axios({
      method: "get",
      url: `http://3.109.255.36/send_request?model=${model}&Id=${id}&db=${db}`,
      headers: {
        login,
        password,
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({ fields }),
    });

    console.log("✅ Profile response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Profile error:", error.message);
    res.status(500).json({
      error: "Profile fetch failed",
      status: error.response?.status,
      details: error.response?.data || error.message,
    });
  }
});

app.post("/api/check-in", async (req, res) => {
  try {
    const { model, db, login, password, apiKey, fields, values } = req.body;
    console.log("🔍 Attendance check-in request:", {
      model,
      db,
      fields,
      values,
      login,
      password,
      apiKey,
    });

    const requestData = {
      fields,
      values,
    };

    const response = await axios({
      method: "post",
      url: `http://3.109.255.36/send_request?model=${model}&db=${db}`,
      headers: {
        login,
        password,
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(requestData),
    });

    console.log("✅ Attendance check-in response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Attendance check-in error:", error.message);
    res.status(500).json({
      error: "Attendance check-in failed",
      status: error.response?.status,
      details: error.response?.data || error.message,
    });
  }
});

// New endpoint for attendance verification - converts POST to GET
app.post("/api/attendance/verify", async (req, res) => {
  try {
    const { model, db, domain, fields, limit, order, login, password, apiKey } =
      req.body;
    console.log("🔍 Attendance verification request:", {
      model,
      db,
      domain,
      fields,
      limit,
      order,
      login,
      password,
      apiKey,
    });

    const requestData = {
      domain,
      fields,
      limit,
      order,
    };

    const response = await axios({
      method: "get",
      url: `http://3.109.255.36/send_request?model=${model}&db=${db}`,
      headers: {
        login,
        password,
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(requestData),
    });

    console.log("✅ Attendance verification response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Attendance verification error:", error.message);
    res.status(500).json({
      error: "Attendance verification failed",
      status: error.response?.status,
      details: error.response?.data || error.message,
    });
  }
});

// New endpoint for attendance check-out - converts PUT to PUT (keeping existing logic)
app.put("/api/attendance/checkout", async (req, res) => {
  try {
    const { model, id, db, fields, values, login, password, apiKey } = req.body;
    console.log("🔍 Attendance checkout request:", {
      model,
      id,
      db,
      fields,
      values,
      login,
      password,
      apiKey,
    });

    const requestData = {
      fields,
      values,
    };

    const response = await axios({
      method: "put",
      url: `http://3.109.255.36/send_request?model=${model}&Id=${id}&db=${db}`,
      headers: {
        login,
        password,
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(requestData),
    });

    console.log("✅ Attendance checkout response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Attendance checkout error:", error.message);
    res.status(500).json({
      error: "Attendance checkout failed",
      status: error.response?.status,
      details: error.response?.data || error.message,
    });
  }
});

app.get("/api/reverse-geocode", async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      {
        headers: {
          "User-Agent": "AttendanceApp/1.0",
        },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    res.status(500).json({ error: "Reverse geocoding failed" });
  }
});

app.put("/api/logout", async (req, res) => {
  try {
    const { model, id, db, fields, values, login, password, apiKey } = req.body;
    console.log("🔍 Logout request:", {
      model,
      id,
      db,
      fields,
      values,
      login,
      password,
      apiKey,
    });

    const requestData = {
      fields,
      values,
    };

    const response = await axios({
      method: "put",
      url: `http://3.109.255.36/send_request?model=${model}&Id=${id}&db=${db}`,
      headers: {
        login,
        password,
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(requestData),
    });

    console.log("✅ Logout response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Logout error:", error.message);
    res.status(500).json({
      error: "Logout failed",
      status: error.response?.status,
      details: error.response?.data || error.message,
    });
  }
});

app.post("/api/tickets", async (req, res) => {
  const { model, db, login, password, apiKey } = req.body;
  console.log("🔍 Ticket data request:", req.body);

  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `http://3.109.255.36/send_request?model=${model}&db=${db}`,
    headers: {
      login: login,
      password: password,
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      fields: [
        "name",
        "category_id",
        "department_id",
        "risk_level_id",
        "priority_id",
        "expected_resolution_time",
        "no_of_system_affected",
      ],
    }),
  };
  const response = await axios.request(config);

  console.log("✅ Ticket types response:", response.data);
  res.status(200).json(response.data);
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running at http://localhost:${PORT}`);
});
