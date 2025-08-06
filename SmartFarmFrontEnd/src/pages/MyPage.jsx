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
      .catch((err) => console.error('사용자 정보 불러오기 실패', err));

    getProfileImageUrl()
      .then((res) => {
        const url = res.imageUrl ?? res;
        setProfileImageUrl(url);
      })
      .catch((err) => console.error('프로필 이미지 불러오기 실패', err));
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { imageUrl } = await uploadProfileImage(file);
      setProfileImageUrl(imageUrl);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
    }
  };

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <div className="left-buttons">
          <button className="back-btn" onClick={() => navigate('/')}>←</button>
        </div>

        <h2 className="mypage-title">MY PAGE</h2>

        <div className="right-buttons">
          <button className="edit-btn" onClick={() => setShowEditModal(true)}>✏️ Edit Profile</button>
        </div>
      </div>


      {/* 🧑‍🌾 인사말 */}
      <p className="mypage-greeting">
        반가워요, <strong>{user?.name ?? '농부'}</strong>님! 🧑‍🌾<br />
        아래에서 회원 정보를 확인하거나 수정할 수 있어요.
      </p>

      <div className="mypage-body">
        {/* 📸 프로필 섹션 */}
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
              <div className="image-placeholder">
                     사진 선택<br />
                <span style={{ fontSize: '12px', color: '#aaa' }}>
                  (클릭하여 업로드)
                </span>
              </div>
            )}
          </label>
        </div>

        {/* 👤 사용자 정보 섹션 */}
        <div className="info-section">
          <p>• name: {user?.name ?? '-'}</p>
          <p>• number: {user?.phoneNumber ?? '-'}</p>
          <p>
            • location: {user?.address?.street ?? ''}, {user?.address?.city ?? ''}, {user?.address?.zipcode ?? ''}
          </p>

          {/* 📍 주소 미등록 안내 */}
          {!user?.address?.city && (
            <p style={{ fontSize: '13px', color: '#888', marginTop: '6px' }}>
              📍 농장 위치를 아직 등록하지 않았어요.
            </p>
          )}

          {/* 🛎 알림 설정 */}
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

          {/* ⚠️ 삭제 전 경고 */}
          <p className="delete-warning">
            계정을 삭제하면 모든 정보가 사라지며 복구가 불가능합니다.
          </p>
          <button className="delete-btn">❗ Delete Account</button>
        </div>
      </div>

      {/* ✏️ 수정 모달 */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedUser) => setUser(updatedUser)}
        />
      )}

      {/* ⬇️ 하단 시스템 정보 */}
      <p className="footer-info">
        SmartFarm 시스템 v1.0.0 &nbsp;|&nbsp; © 2025 FarmLink Team
      </p>
    </div>
  );
}

export default MyPage;
