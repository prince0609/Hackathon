import React, { useState } from "react";
import toast from "react-hot-toast";

export default function ManagerView() {
  // Sample data
  const [approvals, setApprovals] = useState([
    {
      id: 1,
      subject: "none",
      owner: "Sarah",
      category: "Food",
      status: "Pending",
      amountUSD: 567,
      amountINR: 49896,
      readonly: false,
    },
    {
      id: 2,
      subject: "Travel Request",
      owner: "John",
      category: "Travel",
      status: "Pending",
      amountUSD: 200,
      amountINR: 17600,
      readonly: false,
    },
  ]);

  const handleAction = (id, action) => {
    setApprovals((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: action, readonly: true }
          : item
      )
    );
    // toast.success(Request ${action});
  };

  return (
    <div
      className="d-flex flex-column align-items-center vh-100"
      style={{ backgroundColor: "#f5f5f5", padding: "20px", width: "100vw" }}
    >
      <div
        className="card shadow p-4 w-100"
        style={{
          borderRadius: "12px",
          backgroundColor: "#f0f0f0",
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto", // ✅ makes table scroll if content overflows
        }}
      >
        <h5 className="mb-4">Approvals to review</h5>

        <div className="table-responsive" style={{ width: "100%" }}>
          <table
            className="table table-bordered text-center align-middle"
            style={{ width: "100%", minWidth: "1000px" }} // ✅ force full-width layout
          >
            <thead className="table-dark">
              <tr>
                <th>Approval Subject</th>
                <th>Request Owner</th>
                <th>Category</th>
                <th>Request Status</th>
                <th>Total amount (in company’s currency)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((item) => (
                <tr key={item.id}>
                  <td>{item.subject}</td>
                  <td>{item.owner}</td>
                  <td>{item.category}</td>
                  <td
                    className={
                      item.status === "Approved"
                        ? "text-success fw-bold"
                        : item.status === "Rejected"
                        ? "text-danger fw-bold"
                        : "text-warning fw-bold"
                    }
                  >
                    {item.status}
                  </td>
                  <td>
                    <span className="text-danger fw-bold"></span>{" "}
                    {item.amountINR}
                  </td>
                  <td>
                    {!item.readonly && (
                      <div className="d-flex gap-2 justify-content-center">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleAction(item.id, "Approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleAction(item.id, "Rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}