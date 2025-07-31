import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAppContext } from "../../store/AppContext";

import styles from "./TicketTable.module.css";

const TicketTable = () => {
  const { isCheckedIn } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [allTicketTypes, setAllTicketTypes] = useState([]); // Store all ticket types
  const [filteredTicketTypes, setFilteredTicketTypes] = useState([]); // Store filtered ticket types
  const [showCheckInMessage, setShowCheckInMessage] = useState(false);

  const [editingTicket, setEditingTicket] = useState(null);
  const [tickets, setTickets] = useState([
    {
      id: "TKT-001",
      title: "Login authentication issue",
      type: "Bug",
      riskLevel: "High",
      createdBy: "John Smith",
      stage: "In Progress",
      status: "submitted",
    },
    {
      id: "TKT-002",
      title: "Feature request for dashboard",
      type: "Feature",
      riskLevel: "",
      createdBy: "Sarah Wilson",
      stage: "Done",
      status: "submitted",
    },
    {
      id: "TKT-003",
      title: "Database performance optimization",
      type: "Task",
      riskLevel: "Medium",
      createdBy: "Mike Davis",
      stage: "Sent",
      status: "submitted",
    },
    {
      id: "TKT-004",
      title: "UI component styling fix",
      type: "Bug",
      riskLevel: "Low",
      createdBy: "Emma Brown",
      stage: "In Progress",
      status: "submitted",
    },
  ]);

  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    done: 0,
    sent: 0,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  // Calculate stats whenever tickets change
  useEffect(() => {
    const total = tickets.length;
    const inProgress = tickets.filter(
      (t) => t.stage.toLowerCase() === "in progress"
    ).length;
    const done = tickets.filter((t) => t.stage.toLowerCase() === "done").length;
    const sent = tickets.filter((t) => t.stage.toLowerCase() === "sent").length;

    setStats({ total, inProgress, done, sent });
  }, [tickets]);

  // Load categories from localStorage on component mount
  useEffect(() => {
    const storedCategories = localStorage.getItem("ticketCategories");
    if (storedCategories) {
      try {
        const parsedCategories = JSON.parse(storedCategories);

        // Extract category names from category_id[1] and filter duplicates/empty
        const categoryNames = parsedCategories
          .filter((cat) => Array.isArray(cat.category_id)) // Only process records where category_id is an array
          .map((cat) => cat.category_id[1]) // Get category name from index 1
          .filter(
            (name) => name && typeof name === "string" && name.trim() !== ""
          ) // Filter out empty/null values
          .filter((name, index, arr) => arr.indexOf(name) === index); // Remove duplicates

        // Convert to format expected by the dropdown
        const formattedCategories = categoryNames.map((name, index) => ({
          id: index + 1,
          complete_name: name,
        }));

        setCategories(formattedCategories);
      } catch (error) {
        console.error("Error parsing categories from localStorage:", error);
      }
    }
  }, []);

  // Load ticket types from localStorage on component mount
  useEffect(() => {
    const storedTicketTypes = localStorage.getItem("ticketTypes");
    if (storedTicketTypes) {
      try {
        const parsedTicketTypes = JSON.parse(storedTicketTypes);
        setAllTicketTypes(parsedTicketTypes);
      } catch (error) {
        console.error("Error parsing ticket types from localStorage:", error);
      }
    }
  }, []);

  // Function to handle category selection and filter ticket types
  const handleCategoryChange = (selectedCategoryName) => {
    if (selectedCategoryName === "none") {
      setFilteredTicketTypes([]);
      // Clear form fields when no category is selected
      setApiData(prevData => ({
        ...prevData,
        riskLevel: "",
        priority: "",
        incidentDepartment: "",
        expectedResolutionTime: "",
        noOfSystemAffected: false
      }));
      // Reset ticket type dropdown
      setValue("ticketType", "");
      return;
    }

    // Find the selected category's ID from allTicketTypes (since they come from same API now)
    if (allTicketTypes.length > 0) {
      try {
        const selectedCategory = allTicketTypes.find(
          (record) =>
            Array.isArray(record.category_id) &&
            record.category_id[1] === selectedCategoryName
        );

        if (selectedCategory) {
          const selectedCategoryId = selectedCategory.category_id[0];

          // Filter ticket types that have the same category_id[0]
          const filtered = allTicketTypes.filter(
            (ticketType) =>
              Array.isArray(ticketType.category_id) &&
              ticketType.category_id[0] === selectedCategoryId
          );

          setFilteredTicketTypes(filtered);
          
          // Clear form fields when category changes (user needs to select ticket type again)
          setApiData(prevData => ({
            ...prevData,
            riskLevel: "",
            priority: "",
            incidentDepartment: "",
            expectedResolutionTime: "",
            noOfSystemAffected: false
          }));
          
          // Reset ticket type dropdown
          setValue("ticketType", "");
        }
      } catch (error) {
        console.error("Error filtering ticket types:", error);
      }
    }
  };

  // Function to handle ticket type selection and auto-fill form fields
  const handleTicketTypeChange = (selectedTicketTypeName) => {
    if (selectedTicketTypeName === "" || selectedTicketTypeName === "none") {
      return;
    }

    // Find the selected ticket type data from localStorage
    const storedTicketTypes = localStorage.getItem('ticketTypes');
    if (storedTicketTypes) {
      try {
        const parsedTicketTypes = JSON.parse(storedTicketTypes);
        const selectedTicketType = parsedTicketTypes.find(ticketType => 
          ticketType.name === selectedTicketTypeName
        );

        if (selectedTicketType) {
          // Update form fields with the selected ticket type data
          const formData = {
            riskLevel: Array.isArray(selectedTicketType.risk_level_id) ? selectedTicketType.risk_level_id[1] : '',
            priority: Array.isArray(selectedTicketType.priority_id) ? selectedTicketType.priority_id[1] : '',
            incidentDepartment: Array.isArray(selectedTicketType.department_id) ? selectedTicketType.department_id[1] : '',
            expectedResolutionTime: selectedTicketType.expected_resolution_time || '',
            noOfSystemAffected: selectedTicketType.no_of_system_affected || false
          };

          // Update apiData with the new form data
          setApiData(prevData => ({
            ...prevData,
            ...formData
          }));
        }
      } catch (error) {
        console.error('Error processing ticket type selection:', error);
      }
    }
  };

  const getStageClass = (stage) => {
    switch (stage.toLowerCase()) {
      case "draft":
        return styles.stageDraft;
      case "done":
        return styles.stageDone;
      case "in progress":
        return styles.stageInProgress;
      case "sent":
        return styles.stageSent;
      default:
        return styles.stageDefault;
    }
  };

  const getDefaultFormData = () => {
    return {
      project: "Project 1",
      venue: "none",
      createdBy: "administrator",
      riskLevel: "Medium",
      incidentDepartment: "IT Support",
      createdOn: new Date().toLocaleString(),
      category: "none",
    };
  };

  // Add these new functions

  const handleSaveAsDraft = (data) => {
    const draftTicket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
      title: data.ticketType || "New Ticket",
      type: data.ticketType,
      riskLevel: apiData.riskLevel,
      createdBy: apiData.createdBy,
      stage: "Draft",
      status: "draft",
      description: data.description,
      formData: { ...data, ...apiData }, // Store form data for editing
    };

    setTickets((prevTickets) => [...prevTickets, draftTicket]);
    reset();
    setShowForm(false);
    setApiData(null);
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setApiData(ticket.formData);
    setShowForm(true);
    setTimeout(() => {
      document.querySelector(`.${styles.formContainer}`)?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
    // Pre-populate form with ticket data
    reset(ticket.formData);
  };

  const handleDeleteTicket = (ticketId) => {
    setTickets((prevTickets) => prevTickets.filter((t) => t.id !== ticketId));
  };

  const handleGenerateTicket = async () => {
    // Check if user is checked in before allowing ticket creation
    if (!isCheckedIn) {
      setShowCheckInMessage(true);
      // Auto-hide message after 5 seconds
      setTimeout(() => setShowCheckInMessage(false), 5000);
      return;
    }

    if (!showForm && !isLoading) {
      setIsLoading(true);

      try {
        // Check if data already exists in localStorage
        const storedTicketTypes = localStorage.getItem("ticketTypes");
        const storedCategories = localStorage.getItem("ticketCategories");

        if (storedTicketTypes && storedCategories) {
          // Data exists in localStorage, use it instead of calling API
          console.log("Using existing data from localStorage");
          
          const parsedTicketTypes = JSON.parse(storedTicketTypes);
          
          // Set the ticket types if not already set
          if (allTicketTypes.length === 0) {
            setAllTicketTypes(parsedTicketTypes);
          }

          // Set categories if not already set
          if (categories.length === 0) {
            const categoryNames = parsedTicketTypes
              .filter((record) => Array.isArray(record.category_id))
              .map((record) => record.category_id[1])
              .filter((name) => name && typeof name === "string" && name.trim() !== "")
              .filter((name, index, arr) => arr.indexOf(name) === index);

            const formattedCategories = categoryNames.map((name, index) => ({
              id: index + 1,
              complete_name: name,
            }));
            
            setCategories(formattedCategories);
          }

          // Use default form data since we have the necessary dropdown data
          setApiData(getDefaultFormData());
          setShowForm(true);
        } else {
          // Data doesn't exist, call API
          console.log("Data not found in localStorage, calling API");
          
          const requestData = {
            model: "helpdesk.ticket.type",
            db: "eduquity",
            login: "aditya@gmail.com",
            password: "1234",
            apiKey: "13985aa4-d760-468c-a5f4-45b96c341bd5",
          };

          const ticketTypesResponse = await fetch("/api/tickets", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "helpdesk.ticket.type",
              db: "eduquity",
              login: requestData.login,
              password: requestData.password,
              apiKey: requestData.apiKey,
            }),
          });

          if (!ticketTypesResponse.ok) {
            throw new Error("Failed to fetch ticket types");
          }

          const ticketTypesData = await ticketTypesResponse.json();
          console.log("Ticket Types from API:", ticketTypesData);

          if (ticketTypesData && ticketTypesData.records) {
            // Save all ticket types to localStorage
            localStorage.setItem(
              "ticketTypes",
              JSON.stringify(ticketTypesData.records)
            );
            setAllTicketTypes(ticketTypesData.records);

            // Extract categories from ticket types data
            const categoryNames = ticketTypesData.records
              .filter((record) => Array.isArray(record.category_id))
              .map((record) => record.category_id[1])
              .filter((name) => name && typeof name === "string" && name.trim() !== "")
              .filter((name, index, arr) => arr.indexOf(name) === index);

            const formattedCategories = categoryNames.map((name, index) => ({
              id: index + 1,
              complete_name: name,
            }));

            // Save categories to localStorage and update state
            localStorage.setItem(
              "ticketCategories",
              JSON.stringify(ticketTypesData.records)
            );
            setCategories(formattedCategories);
          }

          setApiData(ticketTypesData || getDefaultFormData());
          setShowForm(true);
        }

        // Scroll to form after it appears
        setTimeout(() => {
          document.querySelector(`.${styles.formContainer}`)?.scrollIntoView({
            behavior: "smooth",
          });
        }, 100);
      } catch (error) {
        console.error("Error creating ticket:", error);
        // Fallback to default data if API fails
        setApiData(getDefaultFormData());
        setShowForm(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onSubmit = (data) => {
    const ticketData = {
      ...data,
      ...apiData,
    };

    if (editingTicket) {
      // Update existing draft
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === editingTicket.id
            ? {
                ...ticket,
                ...ticketData,
                stage: "In Progress",
                status: "submitted",
              }
            : ticket
        )
      );
      setEditingTicket(null);
    } else {
      // Create new submitted ticket
      const newTicket = {
        id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
        title: data.ticketType || "New Ticket",
        type: data.ticketType,
        riskLevel: apiData.riskLevel,
        createdBy: apiData.createdBy,
        stage: "In Progress",
        status: "submitted",
        description: data.description,
      };
      setTickets((prevTickets) => [...prevTickets, newTicket]);
    }

    reset();
    setShowForm(false);
    setApiData(null);
    setCategories([]);
    setFilteredTicketTypes([]);
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Check-in Required Message */}
      {showCheckInMessage && (
        <div className={styles.checkInMessageOverlay}>
          <div className={styles.checkInMessage}>
            <div className={styles.messageIcon}>⚠️</div>
            <h3 className={styles.messageTitle}>Check-in Required</h3>
            <p className={styles.messageText}>
              You need to be checked in to create a ticket. Please check in first using the attendance feature.
            </p>
            <button 
              className={styles.messageCloseBtn}
              onClick={() => setShowCheckInMessage(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Header */}
      <div className={styles.dashboardHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.dashboardTitle}>Ticket Management Dashboard</h1>
          <p className={styles.dashboardSubtitle}>
            Manage and track all support tickets
          </p>
        </div>
        <div className={styles.headerActions}>
          {!showForm && (
            <button
              className={styles.createTicketBtn}
              onClick={handleGenerateTicket}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "+ Create Ticket"}
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.total}</h3>
            <p className={styles.statLabel}>Total Tickets</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔄</div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.inProgress}</h3>
            <p className={styles.statLabel}>In Progress</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.done}</h3>
            <p className={styles.statLabel}>Completed</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📤</div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.sent}</h3>
            <p className={styles.statLabel}>Sent</p>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>All Tickets</h2>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.ticketTable}>
            <thead>
              <tr>
                <th>Ticket Number</th>
                <th>Title</th>
                <th>Type</th>
                <th>Risk Level</th>
                <th>Created By</th>
                <th>Stage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className={styles.tableRow}>
                  <td>
                    <a href="#" className={styles.ticketLink}>
                      {ticket.id}
                    </a>
                  </td>
                  <td className={styles.titleCell}>{ticket.title}</td>
                  <td>{ticket.type}</td>
                  <td>{ticket.riskLevel}</td>
                  <td>{ticket.createdBy}</td>
                  <td>
                    <span
                      className={`${styles.stageBadge} ${getStageClass(
                        ticket.stage
                      )}`}
                    >
                      {ticket.stage}
                    </span>
                  </td>
                  <td>
                    {ticket.status === "draft" ? (
                      <>
                        <button
                          onClick={() => handleEditTicket(ticket)}
                          className={`${styles.actionBtn} ${styles.editBtn}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className={styles.submittedText}>Submitted</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Form */}
      {showForm && apiData && (
        <div className={styles.formContainer}>
          <div className={styles.formWrapper}>
            <h3 className={styles.formTitle}>Request New Ticket</h3>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={styles.ticketForm}
            >
              <div className={styles.formGrid}>
                {/* User Input Fields */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Category</label>
                  <select
                    className={styles.formInput}
                    {...register("category", {
                      onChange: (e) => handleCategoryChange(e.target.value),
                    })}
                  >
                    <option value="none">none</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.complete_name}>
                        {category.complete_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ticket Type *</label>
                  <select
                    className={styles.formInput}
                    {...register("ticketType", {
                      required: "Ticket type is required",
                      onChange: (e) => handleTicketTypeChange(e.target.value)
                    })}
                  >
                    <option value="">Select Ticket Type</option>
                    <option value="none">None</option>
                    {filteredTicketTypes.map((type) => (
                      <option key={type.id} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {errors.ticketType && (
                    <span className={styles.errorMessage}>
                      {errors.ticketType.message}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Project</label>
                  <input
                    type="text"
                    className={`${styles.formInput} ${styles.readOnlyInput}`}
                    value={apiData.project}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Venue</label>
                  <input
                    type="text"
                    className={`${styles.formInput} ${styles.readOnlyInput}`}
                    value={apiData.venue}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Number</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    {...register("number")}
                    placeholder="Enter number"
                  />
                </div>

                {/* Read-only API Fields */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Risk Level</label>
                  <input
                    type="text"
                    className={`${styles.formInput} ${styles.readOnlyInput}`}
                    value={apiData.riskLevel || ""}
                    readOnly
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Incident Department
                  </label>
                  <input
                    type="text"
                    className={`${styles.formInput} ${styles.readOnlyInput}`}
                    value={apiData.incidentDepartment || ""}
                    readOnly
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Priority</label>
                  <input
                    type="text"
                    className={`${styles.formInput} ${styles.readOnlyInput}`}
                    value={apiData.priority || ""}
                    readOnly
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Created By</label>
                  <input
                    type="text"
                    className={`${styles.formInput} ${styles.readOnlyInput}`}
                    value={apiData.createdBy}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Created On</label>
                  <input
                    type="text"
                    className={`${styles.formInput} ${styles.readOnlyInput}`}
                    value={apiData.createdOn}
                    readOnly
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Expected Resolution Time (hours)</label>
                  <input
                    type="text"
                    className={`${styles.formInput} ${styles.readOnlyInput}`}
                    value={apiData.expectedResolutionTime || ""}
                    readOnly
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Number of Systems Affected</label>
                  <input
                    type="text"
                    className={`${styles.formInput} ${styles.readOnlyInput}`}
                    value={apiData.noOfSystemAffected ? "Yes" : "No"}
                    readOnly
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  className={styles.formInput}
                  {...register("description")}
                  placeholder="Enter description"
                  rows="4"
                  style={{ width: "100%" }}
                />
              </div>

              <div className={styles.formActions} style={{ marginTop: "20px" }}>
                <button type="submit" className={styles.generateBtn}>
                  {editingTicket ? "Update Ticket" : "Submit Ticket"}
                </button>

                {!editingTicket && (
                  <button
                    type="button"
                    className={styles.generateBtn}
                    onClick={handleSubmit(handleSaveAsDraft)}
                  >
                    Save as Draft
                  </button>
                )}

                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    setShowForm(false);
                    setApiData(null);
                    setEditingTicket(null);
                    setCategories([]);
                    setFilteredTicketTypes([]);
                    reset();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketTable;
