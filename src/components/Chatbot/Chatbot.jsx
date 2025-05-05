import React, { useState, useEffect } from "react";
import './Chatbot.css';
import { Link } from 'react-router-dom';
import { getRandomGreeting, getBotReply } from '../../utils/chatbot';
import { useSelector } from "react-redux";

function Chatbot({ isOpen, onClose }) {
  const [userMessage, setUserMessage] = useState("");
  const [chatBotMessages, setChatBotMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const user = useSelector((state) => state.user);
  const userName = user.name?.split(" ")[0] || user.name;

  // Função que transforma mensagens em JSX com links clicáveis
  const parseMessage = (message, name) => {
    const parts = message.split(/(https?:\/\/[^\s]+|<Link to='[^']+'>[^<]+<\/Link>)/g);

    return parts.map((part, index) => {
      if (part.startsWith('http')) {
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        );
      } else if (part.startsWith("<Link to='")) {
        const match = part.match(/<Link to='([^']+)'>([^<]+)<\/Link>/);
        if (match) {
          const [, path, label] = match;
          return <Link key={index} to={path}>{label}</Link>;
        }
      } else {
        return <span key={index}>{part.replace('{name}', name)}</span>;
      }
    });
  }

  // animação de digitação
  const showTypingEffect = (text) => {
    let index = 0;
    const interval = setInterval(() => {
      setChatBotMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.sender === "bot-typing") {
          const updated = [...prev.slice(0, -1), { text: text.slice(0, index + 1), sender: "bot-typing" }];
          return updated;
        } else {
          return [...prev, { text: text.slice(0, index + 1), sender: "bot-typing" }];
        }
      });

      index++;

      if (index >= text.length) {
        clearInterval(interval);
        setChatBotMessages(prev => [
          ...prev.slice(0, -1),
          { text, sender: "bot" }
        ]);
      }
    }, 40);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    const userMsg = { text: userMessage, sender: "user" };
    setChatBotMessages(prev => [...prev, userMsg]);
    setUserMessage("");
    setIsThinking(true);

    const botReply = getBotReply(userMessage, userName);

    setTimeout(() => {
      setIsThinking(false);
      showTypingEffect(botReply);
    }, 2000);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const greeting = getRandomGreeting(userName);
      setChatBotMessages([{ text: greeting, sender: "bot" }]);
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, userName]);

  if (!isOpen) return null;

  return (
    <div className="chatbot-overlay">
      <div className="chatbot-container">
        <div className="chatbot-header">
          <h2>Fuzzy</h2>
          <button className="chatbot-close" onClick={onClose}>×</button>
        </div>

        <div className="chatbot-messages">
          {chatBotMessages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.sender}`}>
              {msg.sender === 'bot' || msg.sender === 'bot-typing'
                ? parseMessage(msg.text, userName)
                : msg.text
              }
            </div>
          ))}

          {isThinking && (
            <div className="chat-message bot thinking">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}
        </div>

        <form className="chatbot-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Digite sua mensagem..."
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
          />
          <button type="submit">Enviar</button>
        </form>
      </div>
    </div>
  );
}

export default Chatbot;
