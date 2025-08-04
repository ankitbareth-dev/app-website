import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization,login,password,api-key",
  })
);
app.use(express.json());

app.post("/api/login", async (req, res) => {
  try {
    const { db, login, password, apiDomain } = req.body;

    const response = await fetch(`http://${apiDomain}/odoo_connect`, {
      method: "GET",
      headers: {
        login,
        password,
        db,
        "Content-Type": "application/json",
      },
    });

    // handle non-200 responses
    if (!response.ok) {
      const errorData = await response.text(); // can be .json() if known to be JSON
      throw new Error(`Server responded with ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({
      error: "Login failed",
      message: error.message,
    });
  }
});

// Profile endpoint - handles /send_request
app.post("/api/get-coordinates", async (req, res) => {
  try {
    const { model, id, db, login, password, apiKey, apiDomain } = req.body;

    const response = await axios({
      method: "get",
      url: `http://${apiDomain}/send_request?model=${model}&Id=${id}&db=${db}`,
      headers: {
        login,
        password,
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        fields: [
          "employee_latitude",
          "employee_longitude",
          "name",
          "active_project",
          "active_venue",
        ],
      }),
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Get coordinates error:", error.message);
    res.status(500).json({
      error: "Get coordinates failed",
      status: error.response?.status,
      details: error.response?.data || error.message,
    });
  }
});

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
    const { model, db, login, apiDomain, password, apiKey, fields, values } =
      req.body;

    const requestData = {
      fields,
      values,
    };

    const response = await axios({
      method: "post",
      url: `http://${apiDomain}/send_request?model=${model}&db=${db}`,
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
    const {
      model,
      id,
      db,
      fields,
      values,
      login,
      password,
      apiKey,
      apiDomain,
    } = req.body;
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
      url: `http://${apiDomain}/send_request?model=${model}&Id=${id}&db=${db}`,
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
      url: `http://140.245.30.123:8069/send_request?model=${model}&Id=${id}`,
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

// Get tickets endpoint - fetches created tickets
app.post("/api/get-tickets", async (req, res) => {
  try {
    const { login, password, apiKey } = req.body;
    console.log("🔍 Get tickets request:", {
      login,
      password,
      apiKey,
    });

    const requestData = {
      fields: [
        "name",
        "category_id",
        "ticket_type_id",
        "project_id",
        "venue_id",
        "create_date",
        "user_id",
        "stage_id",
      ],
    };

    const response = await axios({
      method: "get",
      url: `http://3.109.255.36/send_request?model=helpdesk.ticket&db=eduquity`,
      headers: {
        login,
        password,
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(requestData),
    });

    console.log("✅ Get tickets response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Get tickets error:", error.message);
    res.status(500).json({
      error: "Get tickets failed",
      status: error.response?.status,
      details: error.response?.data || error.message,
    });
  }
});

app.post("/api/create-ticket", async (req, res) => {
  try {
    const {
      login,
      password,
      apiKey,
      category_id,
      ticket_type_id,
      description,
      user_id,
    } = req.body;

    console.log(
      "values",
      login,
      password,
      apiKey,
      category_id,
      ticket_type_id,
      description,
      user_id
    );

    const requestData = {
      fields: ["category_id", "ticket_type_id", "description", "user_id"],
      values: {
        category_id,
        ticket_type_id,
        description,
        user_id,
      },
    };

    const response = await axios({
      method: "post",
      url: `http://3.109.255.36/send_request?model=helpdesk.ticket&db=eduquity`,
      headers: {
        login,
        password,
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(requestData),
    });

    console.log("✅ Create ticket response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Create ticket error:", error.message);
    res.status(500).json({
      error: "Create ticket failed",
      status: error.response?.status,
      details: error.response?.data || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running at http://localhost:${PORT}`);
});
