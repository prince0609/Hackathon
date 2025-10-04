import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

export default function Login() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const inputStyle = {
    backgroundColor: "#f0f0f0",
    color: "#000",
    border: "2px solid #222",
    borderRadius: "6px",
    transition: "all 0.2s",
  };

  const inputHoverFocus = {
    boxShadow: "0 0 8px rgba(0,0,0,0.5)",
    borderColor: "#000",
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Please enter your email");
    setStep(2);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) return toast.error("Please enter your password");

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/login", { email, password, role });
      const data = response.data;

      if (role === "EMPLOYEE") {
        localStorage.setItem("loggedUser", JSON.stringify(data.user));
        navigate("/employee");
      } else {
        localStorage.setItem("loggedAdmin", JSON.stringify(data.adminUser));
        navigate("/dashboard");
      }

      localStorage.setItem("lastLogin", new Date().toISOString());
      toast.success("Login successful 🎉");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => toast.success("Password reset link sent!");

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 mx-2" style={{ backgroundColor: "#f5f5f5" }}>
      <div className="card shadow p-5" style={{ maxWidth: "400px", borderRadius: "12px", backgroundColor: "#f0f0f0" }}>
        <h5 className="text-center mb-2 text-secondary">Sign in to Expense Manager</h5>
        <hr className="my-4" style={{ borderColor: "#555" }} />

        {step === 1 && (
          <form onSubmit={handleNext}>
            <div className="mb-3">
              <label>Email</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            </div>
            <button type="submit" className="btn btn-dark w-100">Next</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label>Password</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
            </div>

            <div className="mb-3">
              <label>Role</label>
              <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="ADMIN">Admin</option>
                <option value="EMPLOYEE">Employee</option>
              </select>
            </div>

            <button type="submit" className="btn btn-dark w-100" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <button type="button" className="btn btn-dark mt-2 w-100" onClick={() => setStep(1)}>Back</button>
            <button type="button" className="btn btn-link text-danger mt-3 w-100" onClick={handleForgotPassword}>Forgot password?</button>
          </form>
        )}

        <p className="text-center mt-3 text-secondary">
          Don't have an account? <Link to="/signup" style={{ color: "#0d6efd" }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
