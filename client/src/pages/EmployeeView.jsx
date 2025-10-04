import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";

export default function EmployeeView() {
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser") || "{}");
  const employeeId = loggedUser.id;
  const companyId = loggedUser.companyId;

  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [countries, setCountries] = useState([]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [newExpense, setNewExpense] = useState({
    date: "",
    category: "",
    paidBy: loggedUser.name || "",
    description: "",
    amount: "",
    currency: "₹",
    receipt: null,
    status: "Draft",
  });

  // Fetch currencies
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,currencies")
      .then((res) => res.json())
      .then((data) => {
        const options = data.map((c) => ({
          name: c.name.common,
          currency:
            c.currencies && Object.keys(c.currencies)[0]
              ? Object.keys(c.currencies)[0]
              : "",
        }));
        setCountries(options);
      })
      .catch(() => toast.error("Failed to load currencies"));
  }, []);

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/history/${employeeId}`
      );
      setExpenses(res.data.expenses);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch expenses");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [employeeId]);

  // OCR upload
  const handleOcrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("receipt", file);

    toast.loading("Reading receipt...");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/upload-receipt",
        formData
      );
      const data = res.data.extractedData;
      const currencyMatch = data.currency || "₹";

      setNewExpense((prev) => ({
        ...prev,
        date: data.date ? new Date(data.date).toISOString().substr(0, 10) : "",
        category: data.category || "",
        description: data.description,
        amount: data.amount || "",
        currency: currencyMatch,
        receipt: file,
      }));

      toast.success("Receipt processed successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to read receipt");
    } finally {
      toast.dismiss();
    }
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({ ...newExpense, [name]: value });
  };

  const handleSubmitExpense = async () => {
    if (!newExpense.amount || !newExpense.date) {
      return toast.error("Please fill required fields");
    }

    setLoadingSubmit(true);
    try {
      await axios.post("http://localhost:5000/api/expense-add", {
        employeeId,
        companyId,
        amount: newExpense.amount,
        category: newExpense.category,
        description: newExpense.description,
        date: newExpense.date,
        is_receipt: !!newExpense.receipt,
        file_name: newExpense.receipt ? newExpense.receipt.name : null,
      });

      toast.success("Expense added successfully!");
      setShowModal(false);
      setNewExpense({
        date: "",
        category: "",
        paidBy: loggedUser.name || "",
        description: "",
        amount: "",
        currency: "₹",
        receipt: null,
        status: "Draft",
      });

      fetchExpenses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add expense");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleStatusSubmit = async (expenseId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/expense-submit/${expenseId}`
      );
      toast.success("Expense submitted for approval!");
      fetchExpenses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit expense");
    }
  };

  return (
    <div className="container-fluid py-4" style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <div className="card shadow border-0" style={{ borderRadius: "12px", backgroundColor: "#f0f0f0" }}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <button className="btn btn-dark px-4" onClick={() => setShowModal(true)}>
              New
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered align-middle text-center">
              <thead className="table-dark">
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>{new Date(exp.date).toLocaleDateString()}</td>
                    <td>{exp.category}</td>
                    <td>{exp.amount} {exp.currency}</td>
                    <td>{exp.status}</td>
                    <td>
                      {exp.status === "Draft" ? (
                        <button className="btn btn-sm btn-secondary" onClick={() => handleStatusSubmit(exp.id)}>Submit</button>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{ borderRadius: "12px" }}>
              <div className="modal-header">
                <h5 className="modal-title">Add New Expense</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label>Date</label>
                    <input type="date" name="date" className="form-control" value={newExpense.date} onChange={handleManualChange} />
                  </div>
                  <div className="col-md-6">
                    <label>Category</label>
                    <input name="category" className="form-control" value={newExpense.category} onChange={handleManualChange} />
                  </div>
                  <div className="col-md-6">
                    <label>Amount</label>
                    <input type="number" name="amount" className="form-control" value={newExpense.amount} onChange={handleManualChange} />
                  </div>
                  <div className="col-md-6">
                    <label>Currency</label>
                    <select className="form-select" name="currency" value={newExpense.currency} onChange={handleManualChange}>
                      <option value="₹">₹ INR</option>
                      {countries.map((c, i) => <option key={i} value={c.currency}>{c.name} ({c.currency})</option>)}
                    </select>
                  </div>
                  <div className="col-md-12">
                    <label>Description</label>
                    <textarea className="form-control" name="description" value={newExpense.description} onChange={handleManualChange}></textarea>
                  </div>
                  <div className="col-md-12">
                    <label>Attach Receipt (OCR)</label>
                    <input type="file" className="form-control" onChange={handleOcrUpload} />
                  </div>
                </div>
                <button className="btn btn-dark w-100 mt-4" onClick={handleSubmitExpense} disabled={loadingSubmit}>
                  {loadingSubmit ? "Submitting..." : "Add Expense"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
