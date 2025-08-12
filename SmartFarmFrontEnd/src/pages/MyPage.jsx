// src/pages/MyPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCurrentUser, logout, deleteAccount } from "../api/auth";
import { getProfileImageUrl, uploadProfileImage } from "../api/image";
import EditProfileModal from "../components/EditProfileModal";
import "../App.css";

function MyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [notify, setNotify] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch((err) => console.error(t("error.userLoadFail"), err));

    getProfileImageUrl()
      .then((res) => {
        const url = res.imageUrl ?? res;
        setProfileImageUrl(url);
      })
      .catch((err) => console.error(t("error.imageLoadFail"), err));
  }, [t]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { imageUrl } = await uploadProfileImage(file);
      setProfileImageUrl(imageUrl);
    } catch (error) {
      console.error(t("error.imageUploadFail"), error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(t("mypage.deleteConfirm"))) return;
    try {
      await deleteAccount();
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      alert(t("error.deleteAccountFail"));
      console.error(err);
    }
  };

  return (

    <div className="mypage-container">
      <div className="mypage-header">
        <div className="left-buttons">
          <button className="back-btn" onClick={() => navigate("/")}>
            ← {t("button.back")}
          </button>
        </div>

        <h2 className="mypage-title">{t("mypage.title")}</h2>

        <div className="right-buttons">
          <button className="edit-btn" onClick={() => setShowEditModal(true)}>
            ✏️ {t("mypage.editProfile")}
          </button>
        </div>

      {/* 인사말 */}
      <p className="mypage-greeting">
        {t("mypage.greeting1")}{" "}
        <strong>{user?.name ?? t("mypage.defaultName")}</strong>{" "}
        {t("mypage.greeting2")} 🧑‍🌾
        <br />
        {t("mypage.greeting3")}
      </p>

      <div className="mypage-body">
        {/* 프로필 섹션 */}
        <div className="profile-section">
          <p className="profile-title">{t("mypage.farmerProfile")}</p>
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
                alt={t("alt.profileImage")}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div className="image-placeholder">
                {t("mypage.imagePlaceholderText")}
                <br />
                <span style={{ fontSize: "12px", color: "#aaa" }}>
                  ({t("mypage.clickToUpload")})
                </span>
              </div>
            )}
          </label>
        </div>

        {/* 사용자 정보 섹션 */}
        <div className="info-section">
          <p>
            • {t("mypage.nameLabel")}: {user?.name ?? "-"}
          </p>
          <p>
            • {t("mypage.numberLabel")}: {user?.phoneNumber ?? "-"}
          </p>
          <p>
            • {t("mypage.locationLabel")}: {user?.address?.street ?? ""},{" "}
            {user?.address?.city ?? ""}, {user?.address?.zipcode ?? ""}
          </p>

          {/* 주소 미등록 안내 */}
          {!user?.address?.city && (
            <p style={{ fontSize: "13px", color: "#888", marginTop: "6px" }}>
              📍 {t("mypage.noLocationWarning")}
            </p>
          )}

          {/* 알림 설정 */}
          <div className="notify-section">
            <p>{t("mypage.alertSettings")}</p>
            <label>
              <input
                type="checkbox"
                checked={notify}
                onChange={() => setNotify(!notify)}
              />
              &nbsp;{t("mypage.notifyMessage")}
            </label>
          </div>

          {/* 삭제 전 경고 */}
          <p className="delete-warning">{t("mypage.deleteWarning")}</p>
          <button className="delete-btn" onClick={handleDeleteAccount}>
            {t("mypage.deleteAccount")}
          </button>
        </div>


      {/* 수정 모달 */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedUser) => setUser(updatedUser)}
        />
      )}

      {/* 하단 시스템 정보 */}
      <p className="footer-info">
        SmartFarm {t("mypage.systemVersion")} v1.0.0 &nbsp;|&nbsp; © 2025
        FarmLink Team
      </p>
    </div>
  );
}

export default MyPage;