import { useEffect, useMemo, useState } from "react";
import "../styles/Messaging.scss";
import {
  type ConversationKind,
  type ConversationResponse,
  type MessageResponse,
  type UserResponse,
  createConversation,
  deleteConversation,
  getConversations,
  getMessages,
  getUsers,
  sendMessage,
  type CreateConversationPayload,
  type SendMessagePayload,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

type ViewState = "list" | "create";

const conversationFilters = [
  { label: "Toutes", value: undefined },
  { label: "Général", value: "GENERAL" },
  { label: "Cours", value: "COURS" },
  { label: "Alertes", value: "ALERT" },
] as const;

export function MessagingPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ConversationKind | undefined>(undefined);
  const [viewState, setViewState] = useState<ViewState>("list");
  const [participants, setParticipants] = useState<UserResponse[]>([]);

  const [newConversation, setNewConversation] = useState<CreateConversationPayload>({
    subject: "",
    kind: "GENERAL",
    courseId: undefined,
    createdById: undefined,
    participantIds: [],
  });
  const [creatingConversation, setCreatingConversation] = useState(false);

  useEffect(() => {
    loadConversations();
  }, [activeFilter]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setParticipants(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      setError(null);
      const data = await getConversations({ kind: activeFilter });
      setConversations(data);
      if (data.length > 0 && (!selectedConversation || !data.some((c) => c.id === selectedConversation.id))) {
        setSelectedConversation(data[0]);
      }
      if (data.length === 0) {
        setSelectedConversation(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les conversations");
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      setLoadingMessages(true);
      setError(null);
      const data = await getMessages(conversationId);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !messageInput.trim()) return;
    const payload: SendMessagePayload = {
      content: messageInput.trim(),
      authorId: user?.id,
    };

    try {
      setSending(true);
      await sendMessage(selectedConversation.id, payload);
      setMessageInput("");
      await loadMessages(selectedConversation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer le message");
    } finally {
      setSending(false);
    }
  };

  const handleCreateConversation = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newConversation.subject.trim()) return;

    try {
      setCreatingConversation(true);
      const created = await createConversation({
        ...newConversation,
        subject: newConversation.subject.trim(),
        createdById: user?.id,
      });
      setNewConversation({
        subject: "",
        kind: "GENERAL",
        courseId: undefined,
        createdById: undefined,
        participantIds: [],
      });
      setViewState("list");
      await loadConversations();
      setSelectedConversation(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de créer la conversation");
    } finally {
      setCreatingConversation(false);
    }
  };

  const handleParticipantSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(event.target.selectedOptions);
    const ids = options.map((option) => Number(option.value));
    setNewConversation((prev) => ({ ...prev, participantIds: ids }));
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;
    try {
      await deleteConversation(selectedConversation.id);
      setSelectedConversation(null);
      await loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible");
    }
  };

  const filteredConversations = useMemo(() => conversations, [conversations]);

  return (
    <section className="messaging-page">
      <header className="messaging-header">
        <div>
          <h2>Messagerie</h2>
          <p>
            Centralisez les discussions avec l'équipe, les cavaliers et suivez les mises à jour liées aux cours ou aux
            chevaux.
          </p>
        </div>
        <div className="messaging-actions">
          <button type="button" className="btn-secondary" onClick={() => setViewState("create")}>
            Nouvelle conversation
          </button>
        </div>
      </header>

      {error && <div className="messaging-error">{error}</div>}

      <div className="chat-container">
        <aside className="chat-list">
          <div className="chat-filters">
            {conversationFilters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                className={activeFilter === filter.value ? "active" : ""}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {loadingConversations ? (
            <p>Chargement des conversations...</p>
          ) : filteredConversations.length === 0 ? (
            <p>Aucune conversation trouvée.</p>
          ) : (
            <ul>
              {filteredConversations.map((conversation) => (
                <li
                  key={conversation.id}
                  className={selectedConversation?.id === conversation.id ? "active" : ""}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    setViewState("list");
                  }}
                >
                  <div className="conversation-title">{conversation.subject}</div>
                  <span className="conversation-meta">
                    {conversation._count?.messages ?? 0} message(s)
                    {conversation.kind && <span className="conversation-kind">{conversation.kind}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <main className="chat-view">
          {viewState === "create" ? (
            <form className="new-conversation-form" onSubmit={handleCreateConversation}>
              <h3>Nouvelle conversation</h3>
              <label>
                Sujet
                <input
                  type="text"
                  value={newConversation.subject}
                  onChange={(event) => setNewConversation((prev) => ({ ...prev, subject: event.target.value }))}
                  required
                />
              </label>

              <label>
                Type
                <select
                  value={newConversation.kind}
                  onChange={(event) =>
                    setNewConversation((prev) => ({ ...prev, kind: event.target.value as ConversationKind }))
                  }
                >
                  <option value="GENERAL">Général</option>
                  <option value="COURS">Cours</option>
                  <option value="ALERT">Alerte</option>
                </select>
              </label>

              <label>
                ID de cours (optionnel)
                <input
                  type="number"
                  min={1}
                  value={newConversation.courseId ?? ""}
                  onChange={(event) =>
                    setNewConversation((prev) => ({
                      ...prev,
                      courseId: event.target.value ? Number(event.target.value) : undefined,
                    }))
                  }
                />
              </label>

              <label>
                Participant ciblé (optionnel)
                <select
                  multiple
                  value={newConversation.participantIds?.map(String) ?? []}
                  onChange={handleParticipantSelection}
                >
                  {participants.map((participant) => (
                    <option key={participant.id} value={participant.id}>
                      {participant.firstName} {participant.lastName} ({participant.role})
                    </option>
                  ))}
                </select>
              </label>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setViewState("list")} disabled={creatingConversation}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary" disabled={creatingConversation}>
                  {creatingConversation ? "Création..." : "Créer"}
                </button>
              </div>
            </form>
          ) : selectedConversation ? (
            <>
              <div className="chat-header">
                <div>
                  <h3>{selectedConversation.subject}</h3>
                  {selectedConversation.course && (
                    <p className="chat-subtitle">Cours associé : {selectedConversation.course.title}</p>
                  )}
                  {selectedConversation.participants && selectedConversation.participants.length > 0 && (
                    <p className="chat-subtitle participants">
                      Participants :{" "}
                      {selectedConversation.participants
                        .map((participant) => `${participant.user.firstName} ${participant.user.lastName}`)
                        .join(", ")}
                    </p>
                  )}
                </div>
                {selectedConversation.kind && (
                  <span className={`conversation-kind pill kind-${selectedConversation.kind.toLowerCase()}`}>
                    {selectedConversation.kind}
                  </span>
                )}
              </div>

              <div className="messages" aria-live="polite">
                {loadingMessages ? (
                  <p>Chargement des messages...</p>
                ) : messages.length === 0 ? (
                  <p>Aucun message pour l'instant.</p>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="message-row">
                      <div className="message-meta">
                        <strong>
                          {message.author ? `${message.author.firstName} ${message.author.lastName}` : "Inconnu"}
                        </strong>
                        <span>{new Date(message.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="message-content">{message.content}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="message-input">
                <textarea
                  placeholder="Écrire un message..."
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.target.value)}
                  rows={3}
                />
                <div className="message-input-actions">
                  <button type="button" className="btn-secondary" onClick={handleDeleteConversation}>
                    Supprimer la conversation
                  </button>
                  <button type="button" className="btn-primary" onClick={handleSendMessage} disabled={sending}>
                    {sending ? "Envoi..." : "Envoyer"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-chat">Sélectionnez une conversation pour afficher les messages.</div>
          )}
        </main>
      </div>
    </section>
  );
}
