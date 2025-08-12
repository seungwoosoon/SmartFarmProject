// src/components/EditProfileModal.jsx
import React, { useState } from "react";
import { updateProfile } from "../api/auth";
import "../App.css";

function EditProfileModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user?.name || "");
  const [street, setStreet] = useState(user?.address?.street || "");
  const [city, setCity] = useState(user?.address?.city || "");
  const [zipcode, setZipcode] = useState(user?.address?.zipcode || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      await updateProfile({
        name,
        address: { street, city, zipcode },
      });
      if (onSave) onSave({ name, address: { street, city, zipcode } });
      onClose();
    } catch (e) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{
          borderRadius: 16,
          background: "#fff",
          boxShadow: "0 8px 32px rgba(60,80,120,0.18)",
          padding: "48px 48px 36px 48px",
          minWidth: 350,
          maxWidth: 440,
          position: "relative",
        }}
      >
        <button
          className="close-btn"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 22,
            right: 22,
            background: "none",
            border: "none",
            fontSize: 24,
            color: "#888",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          ×
        </button>
        <h2
          className="modal-title"
          style={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: 26,
            marginBottom: 38,
            color: "#2d3a4b",
          }}
        >
          Edit Profile
        </h2>

        <div
          className="login-input-group"
          style={{
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontWeight: 500 }}>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                borderRadius: 8,
                border: "1px solid #d3e0ea",
                padding: "14px 16px",
                fontSize: 16,
                width: "100%",
                background: "#f7fafc",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontWeight: 500 }}>Street</label>
            <input
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              style={{
                borderRadius: 8,
                border: "1px solid #d3e0ea",
                padding: "14px 16px",
                fontSize: 16,
                width: "100%",
                background: "#f7fafc",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontWeight: 500 }}>City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{
                borderRadius: 8,
                border: "1px solid #d3e0ea",
                padding: "14px 16px",
                fontSize: 16,
                width: "100%",
                background: "#f7fafc",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontWeight: 500 }}>Zipcode</label>
            <input
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              style={{
                borderRadius: 8,
                border: "1px solid #d3e0ea",
                padding: "14px 16px",
                fontSize: 16,
                width: "100%",
                background: "#f7fafc",
              }}
            />
          </div>
        </div>

        {error && (
          <div style={{ color: "red", marginTop: 8, textAlign: "center" }}>
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 28,
          }}
        >
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={loading}
            style={{
              minWidth: 120,
              background: "#4caf50",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "14px 0",
              fontSize: 18,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px rgba(76,175,80,0.08)",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;
