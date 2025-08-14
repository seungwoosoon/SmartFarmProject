import React, { useState } from 'react';
import { signup, checkLogin } from '../api/auth';
import '../App.css';

function SignupModal({ onClose, onSwitchToLogin, onLoginSuccess }) {
  const [form, setForm] = useState({
    login: '',
    password: '',
    name: '',
    phoneNumber: '',
    address: {
      city: '',
      street: '',
      zipcode: ''
    }
  });

  const [idCheckMessage, setIdCheckMessage] = useState('');
  const [isIdAvailable, setIsIdAvailable] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['city', 'street', 'zipcode'].includes(name)) {
      setForm(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
      // 로그인 아이디가 바뀌면 이전 검사 무효화
      if (name === 'login') {
        setIsIdAvailable(false);
        setIdCheckMessage('');
      }
    }
  };

  const handleIdCheck = async () => {
    if (!form.login.trim()) {
      setIdCheckMessage('아이디를 입력해 주세요.');
      return;
    }
    try {
      const available = await checkLogin(form.login);
      if (available) {
        setIsIdAvailable(true);
        setIdCheckMessage('사용 가능한 아이디입니다');
      } else {
        setIsIdAvailable(false);
        setIdCheckMessage('이미 사용 중인 아이디입니다.');
      }
    } catch (err) {
      console.error(err);
      setIsIdAvailable(false);
      setIdCheckMessage('검사 중 오류가 발생했습니다.');
    }
  };

  const handleSignup = async () => {
    if (!isIdAvailable) {
      alert('먼저 아이디 중복 확인을 해주세요.');
      return;
    }
    try {
      await signup(form);
      alert('회원가입 성공!');
      onLoginSuccess();
      onClose();
    } catch (err) {
      alert('회원가입 실패: ' + (err.response?.data || err.message));
    }
  };

  return (
    <div className="modal-overlay signup-modal">
      <div className="modal-content signup-modal-content">
        <h2 className="modal-title">SIGN-UP</h2>

        <div className="signup-input-group">
          <label>USERNAME</label>
          <input type="text" name="name" placeholder="사용자 이름" value={form.name} onChange={handleChange} />

          <label>FARM ADDRESS - 도시</label>
          <input type="text" name="city" placeholder="도시명 입력" value={form.address.city} onChange={handleChange} />

          <label>FARM ADDRESS - 도로명</label>
          <input type="text" name="street" placeholder="도로명 주소 입력" value={form.address.street} onChange={handleChange} />

          <label>FARM ADDRESS - 우편번호</label>
          <input type="text" name="zipcode" placeholder="우편번호 입력" value={form.address.zipcode} onChange={handleChange} />

          <label>NUMBER</label>
          <input type="text" name="phoneNumber" placeholder="연락처" value={form.phoneNumber} onChange={handleChange} />

          <label>ID</label>
          <div className="id-check-group">
            <input type="text" name="login" placeholder="아이디 입력" value={form.login} onChange={handleChange} />
            <button type = "button" className="check-id-btn" onClick={handleIdCheck}>중복 확인</button>
          </div>
          {idCheckMessage && (
              <p style={{
                margin: '4px 0 12px',
                color: isIdAvailable ? 'green' : 'red',
                fontSize: '0.9em'
              }}>
                {idCheckMessage}
              </p>
          )}
          <label>PASSWORD</label>
          <input type="password" name="password" placeholder="비밀번호 입력" value={form.password} onChange={handleChange} />
        </div>

        {isIdAvailable ? (
            <button
                className="signup-btn-modal"
                onClick={handleSignup}
            >
              SIGN-UP
            </button>
        ) : (
            <p style={{ color: '#999', margin: '16px 0' }}>
              아이디 중복 확인 후 SIGN-UP 버튼이 나타납니다.
            </p>
        )}

        <p className="to-login-link" onClick={onSwitchToLogin}>LOG-IN</p>
        <button className="close-btn" onClick={onClose}>X</button>
      </div>
    </div>
  );
}

export default SignupModal;