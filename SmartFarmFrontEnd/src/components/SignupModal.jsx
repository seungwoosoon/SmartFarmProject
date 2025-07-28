// // src/components/SignupModal.jsx
// import React, { useState } from 'react';
// import { signup } from '../api/auth';
// import '../App.css'; // 로그인처럼 App.css에서 스타일 사용

// function SignupModal({ onClose, onSwitchToLogin, onLoginSuccess }) {
// //   const [form, setForm] = useState({
// //     username: '',
// //     farmAddress: '',
// //     number: '',
// //     login: '',
// //     password: '',
// //   });

//   const [form, setForm] = useState({
//   login: '',
//   password: '',
//   username: '',
//   number: '',
//   address: {
//     city: '',
//     street: '',
//     zipcode: ''
//   }
// });


//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSignup = async () => {
//     try {
//       await signup(form); // ✅ API 호출
//       alert('회원가입 성공!');
//       onLoginSuccess(); // ✅ 로그인 상태로 전환
//       onClose();         // 모달 닫기
//     } catch (err) {
//       alert('회원가입 실패: ' + (err.response?.data || err.message));
//     }
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal-content">
//         <h2 className="modal-title">SIGN-UP</h2>

//         <div className="signup-input-group">
//           <label>USERNAME</label>
//           <input type="text" name="username" placeholder="사용자 이름" value={form.username} onChange={handleChange} />

//           <label>FARM ADDRESS</label>
//           <input type="text" name="farmAddress" placeholder="농장 주소" value={form.farmAddress} onChange={handleChange} />

//           <label>NUMBER</label>
//           <input type="text" name="number" placeholder="연락처" value={form.number} onChange={handleChange} />

//           <label>ID</label>
//           <div className="id-check-group">
//             <input type="text" name="login" placeholder="아이디 입력" value={form.login} onChange={handleChange} />
//             <button className="check-id-btn">중복 확인</button> {/* (옵션) 추후 연결 */}
//           </div>

//           <label>PASSWORD</label>
//           <input type="password" name="password" placeholder="비밀번호 입력" value={form.password} onChange={handleChange} />
//         </div>

//         <button className="signup-btn-modal" onClick={handleSignup}>SIGN-UP</button>

//         <p className="to-login-link" onClick={onSwitchToLogin}>LOG-IN</p>
//         <button className="close-btn" onClick={onClose}>X</button>
//       </div>
//     </div>
//   );
// }

// export default SignupModal;


import React, { useState } from 'react';
import { signup } from '../api/auth';
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (['city', 'street', 'zipcode'].includes(name)) {
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value }
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSignup = async () => {
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
    <div className="modal-overlay">
      <div className="modal-content">
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
            <button className="check-id-btn">중복 확인</button>
          </div>

          <label>PASSWORD</label>
          <input type="password" name="password" placeholder="비밀번호 입력" value={form.password} onChange={handleChange} />
        </div>

        <button className="signup-btn-modal" onClick={handleSignup}>SIGN-UP</button>

        <p className="to-login-link" onClick={onSwitchToLogin}>LOG-IN</p>
        <button className="close-btn" onClick={onClose}>X</button>
      </div>
    </div>
  );
}

export default SignupModal;
