import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentUser,
  getProfileImageUrl,
  updateProfileImageUrl
} from '../api/auth';
import EditProfileModal from '../components/EditProfileModal';
import '../App.css';

function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [notify, setNotify] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  // 사용자 정보 & 이미지 URL 불러오기
  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(err => console.error('사용자 정보 불러오기 실패', err));

    getProfileImageUrl()
      .then(setProfileImageUrl)
      .catch(err => console.error('프로필 이미지 불러오기 실패', err));
  }, []);

  // 이미지 파일 선택 → S3 업로드 후 URL 받아서 DB에 저장
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. S3 등 이미지 업로드 API로 먼저 전송
    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadRes = await fetch('https://your-s3-upload-api.com/upload', {
        method: 'POST',
        body: formData
      });
      const { imageUrl } = await uploadRes.json();

      // 2. 받은 URL을 서버에 저장
      await updateProfileImageUrl(imageUrl);
      setProfileImageUrl(imageUrl);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
    }
  };

  return (
    <div className="mypage-container">
      {/* 상단 네비게이션 */}
      <div className="mypage-header">
        <button className="back-btn" onClick={() => navigate('/')}>←</button>
        <h2 className="mypage-title">MY PAGE</h2>
        <button className="edit-btn" onClick={() => setShowEditModal(true)}>✏️ Edit Profile</button>
      </div>

      <div className="mypage-body">
        {/* 왼쪽: 프로필 박스 */}
        <div className="profile-section">
          <p className="profile-title">FARMER’s PROFILE</p>
          <label className="profile-image-box">
            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div className="image-placeholder">사진 선택</div>
            )}
          </label>
        </div>

        {/* 오른쪽: 정보 표시 */}
        <div className="info-section">
          <p>• name: {user?.name}</p>
          <p>• number: {user?.phoneNumber}</p>
          <p>• location: {user?.address?.street}, {user?.address?.city}, {user?.address?.zipcode}</p>

          <div className="notify-section">
            <p>Alert Settings</p>
            <label>
              <input
                type="checkbox"
                checked={notify}
                onChange={() => setNotify(!notify)}
              />
              &nbsp;Notify me when an issue is detected
            </label>
          </div>

          <button className="delete-btn">❗ Delete Account</button>
        </div>
      </div>

      {/* 수정 모달 */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedUser) => setUser(updatedUser)}
        />
      )}
    </div>
  );
}

export default MyPage;
