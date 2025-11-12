import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomeMessages.scss";

export type ChatNotification = {
  chatName: string;
  lastMessage: string;
  timestamp?: string;
  unread?: number;
};

const initialNotifications: ChatNotification[] = [
  { chatName: "Planning Mardi", lastMessage: "Hi", timestamp: "14:05", unread: 1 },
  { chatName: "Cheval Petit Tonnerre", lastMessage: "Ok, je décale sa séance.", timestamp: "13:30", unread: 0 },
  { chatName: "Groupe avancé", lastMessage: "Oui, bonne idée !", timestamp: "12:10", unread: 2 },
];

export function HomeMessages() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const navigate = useNavigate();

  const handleClick = (chatName: string, index: number) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((notif, i) =>
        i === index ? { ...notif, unread: 0 } : notif
      )
    );
    // Navigate to messaging page with chat name
    navigate("messagerie", { state: { chatName } });
  };

  return (
    <div className="home-messages">
      <ul>
        {notifications.map((notif, index) => (
          <li
            key={index}
            className={notif.unread ? "unread" : ""}
            onClick={() => handleClick(notif.chatName, index)}
          >
            <div className="chat-name">{notif.chatName}</div>
            <div className="last-message">{notif.lastMessage}</div>
            {notif.timestamp && <div className="timestamp">{notif.timestamp}</div>}
            {notif.unread ? <span className="badge">{notif.unread}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
