import { useState } from "react";
import Navbar from "../Navbar/Navbar";
import styles from "./Expenses.module.css";
import { useAppContext } from "../../store/AppContext";

const Expenses = () => {
  const {
    expenses,
    updateExpense,
    saveExpenseDraft,
    submitExpense,
    displayedExpensesCount,
    loadMoreExpenses,
  } = useAppContext();

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
    description: "",
    receipt: null,
  });
  const displayedExpenses = expenses.slice(0, displayedExpensesCount);
  const hasMoreExpenses = expenses.length > displayedExpensesCount;

  const categories = [
    "Travel",
    "Food & Dining",
    "Office Supplies",
    "Transportation",
    "Accommodation",
    "Communication",
    "Training",
    "Other",
  ];

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "receipt") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e, isDraft = false) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.amount ||
      !formData.category ||
      !formData.date
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
      receipt: formData.receipt ? formData.receipt.name : null,
    };

    if (editingExpense) {
      if (isDraft) {
        // Update existing expense as draft
        updateExpense({
          ...expenseData,
          id: editingExpense.id,
          status: "draft",
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Submit the expense (convert draft to submitted or update submitted)
        submitExpense({
          ...expenseData,
          id: editingExpense.id,
          updatedAt: new Date().toISOString(),
        });
      }
      setEditingExpense(null);
    } else {
      // New expense
      if (isDraft) {
        saveExpenseDraft(expenseData);
      } else {
        submitExpense(expenseData);
      }
    }

    // Reset form
    setFormData({
      title: "",
      amount: "",
      category: "",
      date: "",
      description: "",
      receipt: null,
    });
    setShowForm(false);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      description: expense.description || "",
      receipt: null,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
    setFormData({
      title: "",
      amount: "",
      category: "",
      date: "",
      description: "",
      receipt: null,
    });
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getExpensesByCategory = () => {
    const categoryTotals = {};
    expenses.forEach((expense) => {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;
    });
    return categoryTotals;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  return (
    <>
      <Navbar />
      <div className={styles.expensesContainer}>
        {/* Summary Cards */}
        <div className={styles.summarySection}>
          <div className={styles.summaryCard}>
            <h3>Total Expenses</h3>
            <p className={styles.totalAmount}>
              {formatCurrency(getTotalExpenses())}
            </p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Total Records</h3>
            <p className={styles.totalCount}>{expenses.length}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>This Month</h3>
            <p className={styles.monthlyAmount}>
              {formatCurrency(
                expenses
                  .filter((expense) => {
                    const expenseDate = new Date(expense.date);
                    const currentDate = new Date();
                    return (
                      expenseDate.getMonth() === currentDate.getMonth() &&
                      expenseDate.getFullYear() === currentDate.getFullYear()
                    );
                  })
                  .reduce((total, expense) => total + expense.amount, 0)
              )}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className={styles.actionSection}>
          <button
            className={styles.addButton}
            onClick={() => setShowForm(true)}
          >
            + Add New Expense
          </button>
        </div>

        {/* Expense Form */}
        {showForm && (
          <div className={styles.formOverlay}>
            <div className={styles.formContainer}>
              <div className={styles.formHeader}>
                <h2>{editingExpense ? "Edit Expense" : "Add New Expense"}</h2>
                <button className={styles.closeButton} onClick={handleCancel}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.expenseForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="title">Title *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter expense title"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="amount">Amount *</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="date">Date *</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter expense description (optional)"
                    rows="3"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="receipt">Receipt</label>
                  <input
                    type="file"
                    id="receipt"
                    name="receipt"
                    onChange={handleInputChange}
                    accept="image/*,.pdf"
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.draftButton}
                    onClick={(e) => handleSubmit(e, true)}
                  >
                    Save as Draft
                  </button>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    onClick={(e) => handleSubmit(e, false)}
                  >
                    {editingExpense ? "Update Expense" : "Submit Expense"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div className={styles.expensesSection}>
          <div className={styles.sectionHeader}>
            <h2>Recent Expenses</h2>
          </div>

          {expenses.length === 0 ? (
            <div className={styles.noExpenses}>
              <p>No expenses recorded yet.</p>
              <p>Click "Add New Expense" to get started!</p>
            </div>
          ) : (
            <div className={styles.expensesList}>
              {displayedExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className={`${styles.expenseCard} ${
                    styles[expense.status || "submitted"]
                  }`}
                >
                  <div className={styles.expenseHeader}>
                    <h3 className={styles.expenseTitle}>{expense.title}</h3>
                    <div className={styles.expenseActions}>
                      {expense.status === "draft" && (
                        <button
                          className={styles.editButton}
                          onClick={() => handleEdit(expense)}
                        >
                          Edit Draft
                        </button>
                      )}
                      <span
                        className={`${styles.statusBadge} ${
                          styles[expense.status || "submitted"]
                        }`}
                      >
                        {expense.status === "draft" ? "DRAFT" : "SUBMITTED"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.expenseDetails}>
                    <div className={styles.expenseInfo}>
                      <span className={styles.expenseAmount}>
                        {formatCurrency(expense.amount)}
                      </span>
                      <span className={styles.expenseCategory}>
                        {expense.category}
                      </span>
                    </div>

                    <div className={styles.expenseMeta}>
                      <span className={styles.expenseDate}>
                        {formatDate(expense.date)}
                      </span>
                      {expense.receipt && (
                        <span className={styles.receiptIndicator}>
                          📎 Receipt attached
                        </span>
                      )}
                    </div>

                    {expense.description && (
                      <p className={styles.expenseDescription}>
                        {expense.description}
                      </p>
                    )}
                  </div>

                  <div className={styles.expenseFooter}>
                    <small className={styles.createdDate}>
                      Added:{" "}
                      {new Date(expense.createdAt).toLocaleString("en-GB")}
                      {expense.updatedAt &&
                        expense.updatedAt !== expense.createdAt && (
                          <span>
                            {" "}
                            • Updated:{" "}
                            {new Date(expense.updatedAt).toLocaleString(
                              "en-GB"
                            )}
                          </span>
                        )}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {hasMoreExpenses && (
          <div className={styles.loadMoreSection}>
            <button
              className={styles.loadMoreButton}
              onClick={loadMoreExpenses}
            >
              Load More ({expenses.length - displayedExpensesCount} remaining)
            </button>
          </div>
        )}

        {/* Category Breakdown */}
        {expenses.length > 0 && (
          <div className={styles.categorySection}>
            <h2>Expenses by Category</h2>
            <div className={styles.categoryGrid}>
              {Object.entries(getExpensesByCategory()).map(
                ([category, amount]) => (
                  <div key={category} className={styles.categoryCard}>
                    <h4>{category}</h4>
                    <p>{formatCurrency(amount)}</p>
                    <small>
                      {expenses.filter((e) => e.category === category).length}{" "}
                      expense(s)
                    </small>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Expenses;
