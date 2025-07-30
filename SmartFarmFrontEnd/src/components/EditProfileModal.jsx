// src/components/EditProfileModal.jsx
import React, { useState } from 'react';
import '../App.css';

function EditProfileModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [zipcode, setZipcode] = useState(user?.address?.zipcode || '');

  const handleSave = () => {
    const updatedUser = {
      ...user,
      name,
      phoneNumber,
      address: { street, city, zipcode },
    };
    onSave(updatedUser); // MyPage에서 setUser 호출됨
    onClose();           // 모달 닫기
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
