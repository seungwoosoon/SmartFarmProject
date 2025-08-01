// src/components/EditProfileModal.jsx
import React, { useState } from 'react';
import '../App.css';
import { uploadProfileImage } from '../api/image';// ✅ 여기가 맞는 위치

function EditProfileModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [zipcode, setZipcode] = useState(user?.address?.zipcode || '');
  const [file, setFile] = useState(null); // ✅ 프로필 이미지 상태

  const handleSave = async () => {
    const updatedUser = { /* ... */ };

    if (file) {
      try {
        const { imageUrl } = await uploadProfileImage(file);
        // 1) 프로필 객체에 URL 반영
        updatedUser.profileImageUrl = imageUrl;
      } catch (err) {
        console.error("이미지 업로드 실패:", err);
      }
    }

    onSave(updatedUser);
    onClose();
  };

  return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2 className="modal-title">Edit Profile</h2>

          <div className="login-input-group">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />

            <label>Phone Number</label>
            <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />

            <label>Street</label>
            <input value={street} onChange={(e) => setStreet(e.target.value)} />

            <label>City</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} />

            <label>Zipcode</label>
            <input value={zipcode} onChange={(e) => setZipcode(e.target.value)} />

            <label>Profile Image</label>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          </div>

          <button className="login-btn-modal" onClick={handleSave}>
            Save
          </button>

          <button className="close-btn" onClick={onClose}>X</button>
        </div>
      </div>
  );
}

export default EditProfileModal;