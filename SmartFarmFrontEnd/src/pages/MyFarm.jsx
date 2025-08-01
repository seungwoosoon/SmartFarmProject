// src/pages/MyFarm.jsx
import React from 'react';
import MqttViewer from '../components/MqttViewer';

const MyFarm = () => {
    return (
        <div>
            <h1>내 농장 페이지</h1>
            <MqttViewer />
        </div>
    );
};

export default MyFarm;