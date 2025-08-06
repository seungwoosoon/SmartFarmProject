/* 배경 어둡게 + 모달 띄우기용 */

import React from 'react';
import './ModalWrapper.css';

function ModalWrapper({ children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-body" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default ModalWrapper;
