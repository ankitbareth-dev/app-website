import { useState, useEffect, memo } from "react";
import { useForm } from "react-hook-form";
import { useAppContext } from "../../store/AppContext";
import styles from "./TicketTable.module.css";
const SuccessPopup = memo(({ message }) => (

  <div className={styles.successPopup}>
    <span className={styles.successIcon}>✅</span>
    <span className={styles.successMessage}>{message}</span>
  </div>
));

const TicketTable = () => {
const { isCheckedIn } = useAppContext();
const [showForm, setShowForm] = useState(false);
const [apiData, setApiData] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [categories, setCategories] = useState([]);
const [allTicketTypes, setAllTicketTypes] = useState([]);
const [apiError, setApiError] = useState("");
const [filteredTicketTypes, setFilteredTicketTypes] = useState([]);
const [showCheckInMessage, setShowCheckInMessage] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [showSuccessPopup, setShowSuccessPopup] = useState(false);
const [successMessage, setSuccessMessage] = useState("");
const [isFetchingTickets, setIsFetchingTickets] = useState(true);
const [visibleTickets, setVisibleTickets] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const TICKETS_PER_PAGE = 10;
const [activeTab, setActiveTab] = useState("sent");
const [draftTickets, setDraftTickets] = useState([]);
const [editingTicket, setEditingTicket] = useState(null);
const [tickets, setTickets] = useState([]);
const [stats, setStats] = useState({
total: 0,
inProgress: 0,
done: 0,
sent: 0,
unresolved: 0,
});
const {
register,
handleSubmit,
formState: { errors },
reset,
setValue,
} = useForm();

const userLoginData = JSON.parse(localStorage.getItem("loginData"));
if (!userLoginData) {
alert("NO login data found Please Login again.");
}

const projectName = userLoginData.employee_assigned_project[1];
const userVenue = userLoginData.employee_assigned_venue[1];
const userName = userLoginData.name;

useEffect(() => {
const savedDrafts = localStorage.getItem("draftTickets");
if (savedDrafts) {
try {
setDraftTickets(JSON.parse(savedDrafts));
} catch (error) {
console.error("Error loading draft tickets:", error);
}
}
}, []);

// Update the stats calculation to handle API data stages correctly
useEffect(() => {
const total = tickets.length;
const inProgress = tickets.filter(
(t) => t.stage?.toLowerCase() === "in progress"
).length;
const done = tickets.filter(
(t) => t.stage?.toLowerCase() === "done"
).length;
const sent = tickets.filter(
(t) => t.stage?.toLowerCase() === "sent"
).length;
const unresolved = tickets.filter(
(t) => t.stage?.toLowerCase() === "new" || !t.stage
).length;

    setStats({ total, inProgress, done, sent, unresolved });

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
setApiData((prevData) => ({
...prevData,
riskLevel: "",
priority: "",
incidentDepartment: "",
expectedResolutionTime: "",
noOfSystemAffected: "",
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
          setApiData((prevData) => ({
            ...prevData,
            riskLevel: "",
            priority: "",
            incidentDepartment: "",
            expectedResolutionTime: "",
            noOfSystemAffected: "",
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
    const storedTicketTypes = localStorage.getItem("ticketTypes");
    if (storedTicketTypes) {
      try {
        const parsedTicketTypes = JSON.parse(storedTicketTypes);
        const selectedTicketType = parsedTicketTypes.find(
          (ticketType) => ticketType.name === selectedTicketTypeName
        );

        if (selectedTicketType) {
          // Update form fields with the selected ticket type data
          const formData = {
            riskLevel: Array.isArray(selectedTicketType.risk_level_id)
              ? selectedTicketType.risk_level_id[1]
              : "",
            priority: Array.isArray(selectedTicketType.priority_id)
              ? selectedTicketType.priority_id[1]
              : "",
            incidentDepartment: Array.isArray(selectedTicketType.department_id)
              ? selectedTicketType.department_id[1]
              : "",
            expectedResolutionTime:
              selectedTicketType.expected_resolution_time || "",
            noOfSystemAffected: selectedTicketType.no_of_system_affected || "",
          };

          // Update apiData with the new form data
          setApiData((prevData) => ({
            ...prevData,
            ...formData,
          }));
        }
      } catch (error) {
        console.error("Error processing ticket type selection:", error);
      }
    }

};

/_ const getStageClass = (stage) => {
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
}; _/

const getDefaultFormData = () => {
return {
project: "Project 1",
venue: "none",
createdBy: "administrator",
riskLevel: "",
incidentDepartment: "",
priority: "",
expectedResolutionTime: "",
noOfSystemAffected: "",
createdOn: new Date().toLocaleString(),
category: "none",
};
};

const fetchTickets = async () => {
try {
setIsFetchingTickets(true);
setApiError("");

      const apiDomain = localStorage.getItem("apiDomain");
      const dbName = localStorage.getItem("dbName");

      const response = await fetch("/api/get-created-tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: userLoginData.email,
          password: userLoginData.password,
          apiKey: userLoginData["api-Key"],
          db: dbName,
          apiDomain,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }
      setIsFetchingTickets(false);

      const data = await response.json();

      if (data && Array.isArray(data.records)) {
        const transformedTickets = data.records.map(transformApiTicket);
        setTickets(transformedTickets);
        // Initialize visible tickets with first page
        setVisibleTickets(transformedTickets.slice(0, TICKETS_PER_PAGE));
      } else {
        setTickets([]);
        setVisibleTickets([]);
        setApiError("No tickets found");
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setApiError("Error loading tickets. Please try again later.");
    } finally {
      setIsFetchingTickets(false);
    }

};

const transformApiTicket = (apiTicket) => {
return {
id: apiTicket.number
? `HT${String(apiTicket.number).padStart(5, "0")}`
: "N/A",
title: apiTicket.name || "Untitled",
type: Array.isArray(apiTicket.ticket_type_id)
? apiTicket.ticket_type_id[1]
: "N/A",
category: Array.isArray(apiTicket.category_id)
? apiTicket.category_id[1]
: "N/A",
project_id: apiTicket.project_id || ["", "N/A"],
venue_id: apiTicket.venue_id || ["", "N/A"],
createdBy: Array.isArray(apiTicket.user_id)
? apiTicket.user_id[1]
: "Unknown",
assigned_user: apiTicket.user_id || ["", "N/A"],
stage: Array.isArray(apiTicket.stage_id) ? apiTicket.stage_id[1] : "New",
create_date: apiTicket.create_date || new Date().toISOString(),
status: apiTicket.status || "new",
};
};

const handleGenerateTicket = async () => {
if (!isCheckedIn) {
setShowCheckInMessage(true);
setTimeout(() => setShowCheckInMessage(false), 5000);
return;
}

    if (!showForm && !isLoading) {
      setIsLoading(true);

      try {
        const userLoginData = JSON.parse(localStorage.getItem("loginData"));

        const body = JSON.stringify({
          db: localStorage.getItem("dbName"),
          login: userLoginData.email,
          password: userLoginData.password,
          apiKey: userLoginData["api-Key"],
          apiDomain: localStorage.getItem("apiDomain"), // Needed for backend
        });

        const [ticketTypesRes, categoriesRes] = await Promise.all([
          fetch("/api/get-tickets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          }),
          fetch("/api/get-categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          }),
        ]);

        if (!ticketTypesRes.ok || !categoriesRes.ok) {
          throw new Error("Failed to fetch ticket types or categories");
        }

        const responses = await Promise.all([
          ticketTypesRes.json(),
          categoriesRes.json(),
        ]);

        const [ticketTypesData, categoriesData] = responses;

        if (ticketTypesData?.records) {
          // Store ticket types
          localStorage.setItem(
            "ticketTypes",
            JSON.stringify(ticketTypesData.records)
          );
          setAllTicketTypes(ticketTypesData.records);

          // Extract and store categories
          const categoryNames = ticketTypesData.records
            .filter((record) => Array.isArray(record.category_id))
            .map((record) => record.category_id[1])
            .filter(
              (name) => name && typeof name === "string" && name.trim() !== ""
            )
            .filter((name, index, arr) => arr.indexOf(name) === index);

          const formattedCategories = categoryNames.map((name, index) => ({
            id: index + 1,
            complete_name: name,
          }));

          // Save both to localStorage
          localStorage.setItem(
            "ticketCategories",
            JSON.stringify(ticketTypesData.records)
          );
          localStorage.setItem("categories", JSON.stringify(categoriesData));

          setCategories(formattedCategories);
        }

        setApiData(ticketTypesData || getDefaultFormData());
        setShowForm(true);

        // Scroll to form after it appears
        setTimeout(() => {
          document.querySelector(`.${styles.formContainer}`)?.scrollIntoView({
            behavior: "smooth",
          });
        }, 100);
      } catch (error) {
        console.error("❌ Error creating ticket:", error);
        setApiData(getDefaultFormData());
        setShowForm(true);
      } finally {
        setIsLoading(false);
      }
    }

};

useEffect(() => {
fetchTickets();
}, []); // This effect runs only once on mount

const onSubmit = async (data) => {
try {
setIsSubmitting(true);

      const selectedTicketType = filteredTicketTypes.find(
        (type) => type.name === data.ticketType
      );

      if (!selectedTicketType) {
        throw new Error("Please select a valid ticket type");
      }

      const apiDomain = localStorage.getItem("apiDomain");
      const dbName = localStorage.getItem("dbName");

      const ticketData = {
        category_id: selectedTicketType.category_id[0],
        ticket_type_id: selectedTicketType.id,
        description: data.description,
        user_id: userLoginData.Id,
        login: userLoginData.email,
        password: userLoginData.password,
        apiKey: userLoginData["api-Key"],
        db: dbName,
        apiDomain,
      };

      const response = await fetch("/api/create-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create ticket");
      }

      await response.json();

      // If we were editing a draft, remove it from drafts
      if (editingTicket) {
        const updatedDrafts = draftTickets.filter(
          (d) => d.id !== editingTicket.id
        );
        setDraftTickets(updatedDrafts);
        localStorage.setItem("draftTickets", JSON.stringify(updatedDrafts));
      }

      // Reset states
      setShowForm(false);
      setApiData(null);
      setCategories([]);
      setFilteredTicketTypes([]);
      setEditingTicket(null);
      reset();

      // Refresh tickets list
      await fetchTickets();

      // Show success message
      setSuccessMessage(
        editingTicket
          ? "Draft updated and submitted successfully"
          : "Ticket created successfully"
      );
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (error) {
      console.error("Error creating/updating ticket:", error);
      setApiError(
        error.message || "Failed to create/update ticket. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }

};

const handleSubmitDraft = async (draft) => {
try {
setIsSubmitting(true);

      const storedTicketTypes = localStorage.getItem("ticketTypes");
      if (!storedTicketTypes) {
        throw new Error("No ticket types found. Please refresh the page.");
      }

      const ticketTypes = JSON.parse(storedTicketTypes);

      // Find the ticket type directly from stored data
      const selectedTicketType = ticketTypes.find(
        (type) =>
          type.name.toLowerCase() === draft.type.toLowerCase() &&
          type.category_id[1] === draft.category
      );

      if (!selectedTicketType) {
        throw new Error("Invalid ticket type for the selected category");
      }

      const apiDomain = localStorage.getItem("apiDomain");
      const dbName = localStorage.getItem("dbName");

      const ticketData = {
        category_id: selectedTicketType.category_id[0],
        ticket_type_id: selectedTicketType.id,
        description: draft.description,
        user_id: userLoginData.Id,
        login: userLoginData.email,
        password: userLoginData.password,
        apiKey: userLoginData["api-Key"],
        db: dbName,
        apiDomain,
      };

      const response = await fetch("/api/create-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit draft ticket");
      }

      await response.json();

      // Remove from drafts
      const updatedDrafts = draftTickets.filter((d) => d.id !== draft.id);
      setDraftTickets(updatedDrafts);
      localStorage.setItem("draftTickets", JSON.stringify(updatedDrafts));

      // Show success message
      setSuccessMessage("Draft ticket submitted successfully");
      setShowSuccessPopup(true);

      // Refresh tickets list
      await fetchTickets();

      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting draft:", error);
      setApiError(error.message || "Failed to submit draft ticket");
    } finally {
      setIsSubmitting(false);
    }

};

const handleDeleteDraft = (draftId) => {
try {
// Filter out the draft to be deleted
const updatedDrafts = draftTickets.filter(
(draft) => draft.id !== draftId
);

      // Update state
      setDraftTickets(updatedDrafts);

      // Update localStorage
      localStorage.setItem("draftTickets", JSON.stringify(updatedDrafts));

      // Show success message
      setSuccessMessage("Draft ticket deleted successfully");
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (error) {
      console.error("Error deleting draft:", error);
      setApiError("Failed to delete draft ticket");
    }

};

const handleSaveAsDraft = (data) => {
const draftTicket = {
id: `DRAFT-${String(Date.now()).slice(-5)}`,
category: data.category, // store ID
type: data.ticketType, // store ID
project_id: [null, projectName],
venue_id: [null, userVenue],
description: data.description,
createdBy: userName,
stage: "Draft",
created_at: new Date().toISOString(),
formData: { ...data, ...apiData }, // full form snapshot
};

    const updatedDrafts = [...draftTickets, draftTicket];
    setDraftTickets(updatedDrafts);
    localStorage.setItem("draftTickets", JSON.stringify(updatedDrafts));

    setSuccessMessage("Ticket saved as draft");
    setShowSuccessPopup(true);
    setTimeout(() => setShowSuccessPopup(false), 3000);

    reset();
    setShowForm(false);
    setApiData(null);

};

const handleEditDraft = (draft) => {
try {
// Set editing mode
setEditingTicket(draft);

      // Show form
      setShowForm(true);

      // Pre-fill form with draft data
      console.log(draft.category);
      setValue("category", draft.category_id);
      setValue("ticketType", draft.ticket_type_id);
      setValue("description", draft.description);

      if (draft.formData) {
        // Set additional form data if it exists
        Object.keys(draft.formData).forEach((key) => {
          setValue(key, draft.formData[key]);
        });

        // Update API data
        setApiData({
          ...getDefaultFormData(),
          ...draft.formData,
        });

        // Trigger category change to load correct ticket types
        handleCategoryChange(draft.category);
      }

      // Scroll to form
      setTimeout(() => {
        document.querySelector(`.${styles.formContainer}`)?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } catch (error) {
      console.error("Error editing draft:", error);
      setApiError("Failed to edit draft ticket");
    }

};

const handleLoadMore = () => {
const nextPage = currentPage + 1;
const start = 0;
const end = nextPage \* TICKETS_PER_PAGE;
setVisibleTickets(tickets.slice(start, end));
setCurrentPage(nextPage);
};

const handleShowLess = () => {
setVisibleTickets(tickets.slice(0, TICKETS_PER_PAGE));
setCurrentPage(1);
};

return (
<div className={styles.dashboardContainer}>
{/_ Check-in Required Message _/}
{showCheckInMessage && (
<div className={styles.checkInMessageOverlay}>
<div className={styles.checkInMessage}>
<div className={styles.messageIcon}>⚠️</div>
<h3 className={styles.messageTitle}>Check-in Required</h3>
<p className={styles.messageText}>
You need to be checked in to create a ticket. Please check in
first using the attendance feature.
</p>
<button
className={styles.messageCloseBtn}
onClick={() => setShowCheckInMessage(false)} >
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
        <div className={styles.statCard}>
          <div className={styles.statIcon}>❗</div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.unresolved}</h3>
            <p className={styles.statLabel}>Unresolved</p>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Tickets</h2>
          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tabButton} ${
                activeTab === "sent" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("sent")}
            >
              Sent
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "draft" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("draft")}
            >
              Draft
            </button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          {isFetchingTickets ? (
            <>
              <div className={styles.loadingState}></div>
              <p className={styles.loadingMessage}>Loading Tickets...</p>
            </>
          ) : activeTab === "sent" ? (
            apiError ? (
              <div className={styles.errorMessage}>{apiError}</div>
            ) : (
              <>
                <table className={styles.ticketTable}>
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Category</th>
                      <th>Ticket Type</th>
                      <th>Project</th>
                      <th>Venue</th>
                      <th>Created By</th>
                      <th>Assigned User</th>
                      <th>Stage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTickets.map((ticket) => (
                      <tr key={ticket.id} className={styles.tableRow}>
                        <td>
                          <div className={styles.ticketId}>{ticket.id}</div>
                        </td>
                        <td>{ticket.category}</td>
                        <td>{ticket.type}</td>
                        <td>
                          {ticket.project_id ? ticket.project_id[1] : "-"}
                        </td>
                        <td>{ticket.venue_id ? ticket.venue_id[1] : "-"}</td>
                        <td>
                          <div className={styles.userCell}>{userName}</div>
                        </td>
                        <td>
                          <div className={styles.userCell}>{userName}</div>
                        </td>
                        <td>{ticket.stage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {tickets.length > visibleTickets.length ? (
                  <div className={styles.loadMoreContainer}>
                    <button
                      className={styles.loadMoreButton}
                      onClick={handleLoadMore}
                    >
                      Load More
                    </button>
                  </div>
                ) : visibleTickets.length > TICKETS_PER_PAGE ? (
                  <div className={styles.loadMoreContainer}>
                    <button
                      className={styles.loadMoreButton}
                      onClick={handleShowLess}
                    >
                      Show Less
                    </button>
                  </div>
                ) : null}
              </>
            )
          ) : draftTickets.length > 0 ? (
            <table className={styles.ticketTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Created On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {draftTickets.map((draft) => (
                  <tr key={draft.id}>
                    <td>{draft.id}</td>
                    <td>{draft.category}</td>
                    <td>{draft.type}</td>
                    <td>{draft.description}</td>
                    <td>{new Date(draft.created_at).toLocaleDateString()}</td>
                    <td className="draftContainer">
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEditDraft(draft)}
                        >
                          Edit
                        </button>
                        <button
                          className={styles.submitButton}
                          onClick={() => handleSubmitDraft(draft)}
                        >
                          Submit
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteDraft(draft.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.loadingMessage}>
              No tickets has been drafted yet.
            </p>
          )}
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
                      onChange: (e) => handleTicketTypeChange(e.target.value),
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
                    value={projectName}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Venue</label>
                  <input
                    type="text"
                    className={`${styles.formInput} ${styles.readOnlyInput}`}
                    value={userVenue}
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
                    value={userName}
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
                  <label className={styles.formLabel}>
                    Expected Resolution Time (hours)
                  </label>
                  <input
                    type="text"
                    className={`${styles.formInput} ${styles.readOnlyInput}`}
                    value={apiData.expectedResolutionTime || ""}
                    readOnly
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Number of Systems Affected
                  </label>
                  <input
                    type="number"
                    className={styles.formInput}
                    {...register("noOfSystemAffected")}
                    placeholder="Enter number of systems affected"
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
                <button
                  type="submit"
                  className={styles.generateBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Creating..."
                    : editingTicket
                    ? "Update Ticket"
                    : "Submit Ticket"}
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
      {showSuccessPopup && <SuccessPopup message={successMessage} />}
    </div>

);
};

export default TicketTable;
