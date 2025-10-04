import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";

export default function UserManagementView() {
  // Get companyId from logged-in admin
  const companyId = localStorage.getItem("companyId");

  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    role: "Employee",
    email: "",
    managerId: "",
  });

  // --- Fetch users ---
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${companyId}`);
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    if (companyId) fetchUsers();
  }, [companyId]);

  // --- Handlers ---
  const handleAction = (id) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      console.log(`Sending password to ${user.name} at ${user.email}`);
      toast.success(`Password sent to ${user.name}!`);
      // Optionally call backend API to send email
    }
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email) {
      return toast.error("Please fill in Name and Email fields.");
    }

    if (newUser.role === "Employee" && !newUser.managerId) {
      return toast.error("Employee role requires a Manager to be assigned.");
    }

    try {
      await axios.post("http://localhost:5000/api/create-user", {
        companyId,
        role: newUser.role,
        name: newUser.name,
        email: newUser.email,
        is_approver: newUser.role !== "Employee",
        password: "defaultPassword", // can be dynamic
        managerId: newUser.managerId || null,
      });

      toast.success(`${newUser.name} added successfully!`);
      setShowModal(false);
      setNewUser({ name: "", role: "Employee", email: "", managerId: "" });
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user");
    }
  };

  return (
    <div className="d-flex flex-column align-items-center vh-100 px-2" style={{ backgroundColor: "#f5f5f5" }}>
      <div className="card shadow p-4 w-100" style={{ borderRadius: "12px", backgroundColor: "#f0f0f0", overflowX: "auto" }}>
        <div className="w-100 mb-2">
          <button className="btn btn-dark px-4" onClick={() => setShowModal(true)} style={{ borderRadius: "6px" }}>
            New
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle" style={{ minWidth: "800px" }}>
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Manager</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
                  <td>{user.email}</td>
                  <td>{user.managerName || "N/A"}</td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => handleAction(user.id)}>
                      Send password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-md">
            <div className="modal-content" style={{ borderRadius: "12px" }}>
              <div className="modal-header">
                <h5 className="modal-title">Add New User</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input className="form-control" name="name" value={newUser.name} onChange={handleManualChange} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select className="form-select" name="role" value={newUser.role} onChange={handleManualChange}>
                    <option value="MANAGER">Manager</option>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="DIRECTOR">Director</option>
                    <option value="CFO">CFO</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" name="email" value={newUser.email} onChange={handleManualChange} />
                </div>

                {newUser.role === "EMPLOYEE" && (
                  <div className="mb-3">
                    <label className="form-label">Manager</label>
                    <select
                      className="form-select"
                      name="managerId"
                      value={newUser.managerId}
                      onChange={handleManualChange}
                    >
                      <option value="">Select Manager</option>
                      {users
                        .filter((u) => u.role === "MANAGER")
                        .map((mgr) => (
                          <option key={mgr.id} value={mgr.id}>
                            {mgr.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <button className="btn btn-dark w-100" onClick={handleAddUser}>
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
