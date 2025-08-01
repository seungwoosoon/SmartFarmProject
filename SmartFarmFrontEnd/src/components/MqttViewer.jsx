// src/components/MqttViewer.jsx
import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { CompatClient, Stomp } from '@stomp/stompjs';

const MqttViewer = () => {
    const [temperature, setTemperature] = useState('-');
    const [humidity, setHumidity] = useState('-');

    useEffect(() => {
        const socket = new SockJS(`${process.env.REACT_APP_BACKEND_URL}/ws`);
        const stompClient = Stomp.over(socket);

        stompClient.connect({}, () => {
            console.log('✅ WebSocket 연결 성공');

            stompClient.subscribe('/topic/temp', (message) => {
                setTemperature(message.body);
            });

            stompClient.subscribe('/topic/humi', (message) => {
                setHumidity(message.body);
            });
        });

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect(() => {
                    console.log('🔌 WebSocket 연결 해제');
                });
            }
        };
    }, []);

    return (
        <div style={{ padding: '2rem', fontFamily: 'Arial', fontSize: '1.2rem' }}>
            <h2>🌿 스마트팜 센서 정보</h2>
            <p>🌡️ <strong>온도:</strong> {temperature} ℃</p>
            <p>💧 <strong>습도:</strong> {humidity} %</p>
        </div>
    );
};

export default MqttViewer;