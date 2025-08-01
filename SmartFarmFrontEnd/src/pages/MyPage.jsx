import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api/auth';
import { getProfileImageUrl, uploadProfileImage } from '../api/image';
import EditProfileModal from '../components/EditProfileModal';
import '../App.css';

function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [notify, setNotify] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  useEffect(() => {
    getCurrentUser()
        .then(setUser)
        .catch(err => console.error('사용자 정보 불러오기 실패', err));

    getProfileImageUrl()
        .then(res => {
          // res가 DTO({ id, imageUrl })든, 문자열(imageUrl)이든 대응
          const url = res.imageUrl ?? res;
          setProfileImageUrl(url);
        })
        .catch(err => console.error('프로필 이미지 불러오기 실패', err));
  }, []);

  // 2) 파일 선택 시 곧바로 백엔드에 업로드
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // uploadProfileImage → { id, imageUrl }
      const { imageUrl } = await uploadProfileImage(file);
      setProfileImageUrl(imageUrl);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
    }
  };

  return (
      <div className="mypage-container">
        <div className="mypage-header">
          <button className="back-btn" onClick={() => navigate('/')}>←</button>
          <h2 className="mypage-title">MY PAGE</h2>
          <button className="edit-btn" onClick={() => setShowEditModal(true)}>✏️ Edit Profile</button>
        </div>

        <div className="mypage-body">
          <div className="profile-section">
            <p className="profile-title">FARMER’s PROFILE</p>
            <label className="profile-image-box">
              <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
              />
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

          <div className="info-section">
            <p>• name: {user?.name}</p>
            <p>• number: {user?.phoneNumber}</p>
            <p>
              • location: {user?.address?.street}, {user?.address?.city}, {user?.address?.zipcode}
            </p>

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
