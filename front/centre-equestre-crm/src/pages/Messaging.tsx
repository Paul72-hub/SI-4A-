import { useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/Messaging.scss";

export type Conversation = {
  id: number;
  name: string;
  messages: { from: string; text: string }[];
};

const mockConversations: Conversation[] = [
  { id: 1, name: "Planning Mardi", messages: [{ from: "Alice", text: "Hello" }, { from: "Bob", text: "Hi" }] },
  {
    id: 2,
    name: "Cheval Petit Tonnerre",
    messages: [
      { from: "Claire", text: "Petit Tonnerre a besoin d’un repos demain." },
      { from: "Marc", text: "Ok, je décale sa séance." },
    ],
  },
  {
    id: 3,
    name: "Groupe avancé",
    messages: [
      { from: "Élodie", text: "On peut s’entraîner sur le parcours 2 ?" },
      { from: "Julien", text: "Oui, bonne idée !" },
    ],
  },
];

export function MessagingPage() {
  const location = useLocation();
  const chatFromState = location.state?.chatName;

  // Select initial chat
  const initialChat =
    chatFromState
      ? mockConversations.find((c) => c.name === chatFromState) || mockConversations[0]
      : mockConversations[0];

  const [selectedChat, setSelectedChat] = useState<Conversation>(initialChat);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const newMessage = { from: "Moi", text: inputValue };
    setSelectedChat({
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage],
    });
    setInputValue("");
  };

  return (
    <section className="messaging-page">
      <h2>Messagerie</h2>

      <div className="chat-container">
        {/* Left panel: chat list */}
        <aside className="chat-list">
          <h3>Discussions</h3>
          <ul>
            {mockConversations.map((conv) => (
              <li
                key={conv.id}
                className={selectedChat.id === conv.id ? "active" : ""}
                onClick={() => setSelectedChat(conv)}
              >
                {conv.name}
              </li>
            ))}
          </ul>
        </aside>

        {/* Right panel: chat messages */}
        <main className="chat-view">
          <h3>{selectedChat.name}</h3>
          <div className="messages">
            {selectedChat.messages.map((msg, i) => (
              <div key={i} className={`message ${msg.from === "Moi" ? "sent" : "received"}`}>
                <strong>{msg.from}:</strong> {msg.text}
              </div>
            ))}
          </div>

          <div className="message-input">
            <input
              type="text"
              placeholder="Écrire un message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>Envoyer</button>
          </div>
        </main>
      </div>
    </section>
  );
}
