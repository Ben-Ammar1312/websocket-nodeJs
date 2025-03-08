import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Remplace par l'URL de ton serveur

const NotificationComponent = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Écouter les notifications du serveur
        socket.on("receiveNotification", (data) => {
            setNotifications((prev) => [...prev, data]);
        });

        return () => {
            socket.off("receiveNotification");
        };
    }, []);

    return (
        <div>
            <h3>📢 Notifications :</h3>
            <ul>
                {notifications.map((notif, index) => (
                    <li key={index}>{notif.message}</li>
                ))}
            </ul>
        </div>
    );
};

export default NotificationComponent;