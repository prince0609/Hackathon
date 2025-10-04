import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [formData, setFormData] = useState({
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    companyName: "",
    country: "",
  });

  const navigate = useNavigate();

  const sendData = async (e) => {
    e.preventDefault();
    if (
      !formData.adminName ||
      !formData.adminEmail ||
      !formData.adminPassword ||
      !formData.companyName ||
      !formData.country
    ) {
      return toast.error("Please fill in all fields");
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/signup",
        formData
      );

      // Axios automatically sends JSON and sets Content-Type
      // The response data is in response.data
      console.log(response.data);
      toast.success("Signup successful 🎉");
      navigate("/adduser");
    } catch (error) {
      toast.error("Signup failed");
      console.error("Signup error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name")
      .then((res) => res.json())
      .then((data) => {
        const list = data
          .map((c) => c.name.common)
          .sort((a, b) => a.localeCompare(b));
        setCountries(list);
      })
      .catch(() => toast.error("Failed to load countries"));
  }, []);

  const inputStyle = {
    backgroundColor: "#f0f0f0",
    color: "#000",
    border: "1px solid #555",
    borderRadius: "6px",
    padding: "0.5rem 0.75rem",
    width: "100%",
    boxSizing: "border-box",
    marginBottom: "1rem",
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100 px-2"
      style={{ backgroundColor: "#f5f5f5" }}
    >
      <div
        className="card shadow p-4 p-md-5"
        style={{
          width: "100%",
          maxWidth: "450px",
          borderRadius: "12px",
          backgroundColor: "#f0f0f0",
          color: "#000",
        }}
      >
        <h2 className="mb-3 text-center fs-5 fs-md-4">Sign Up</h2>

        <form onSubmit={sendData}>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.adminName}
            onChange={(e) =>
              setFormData({ ...formData, adminName: e.target.value })
            }
            style={inputStyle}
          />

          <input
            type="email"
            placeholder="Email"
            value={formData.adminEmail}
            onChange={(e) =>
              setFormData({ ...formData, adminEmail: e.target.value })
            }
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.adminPassword}
            onChange={(e) =>
              setFormData({ ...formData, adminPassword: e.target.value })
            }
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Company Name"
            value={formData.companyName}
            onChange={(e) =>
              setFormData({ ...formData, companyName: e.target.value })
            }
            style={inputStyle}
          />

          <select
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            style={inputStyle}
          >
            <option value="">Select Country</option>
            {countries.map((c, idx) => (
              <option key={idx} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="btn btn-dark w-100"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-3 text-secondary fs-6">
          Already have an account?{" "}
          <Link to="/" style={{ color: "#0d6efd" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
