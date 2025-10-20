import React, { useState, useRef, useEffect } from 'react';
import '../Applets.css';

const AppletChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [personality, setPersonality] = useState('asistente');
  const [,setChatHistory] = useState([]);

  const messagesEndRef = useRef(null);

  // Personalidades del chatbot
  const personalities = {
    asistente: {
      name: "Asistente Virtual",
      greeting: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
      style: "profesional y útil",
      emoji: "🤖"
    },
    divertido: {
      name: "Bot Divertido",
      greeting: "¡Hola! 🎉 Soy el bot más divertido del mundo. ¿Listo para pasar un buen rato?",
      style: "divertido y bromista",
      emoji: "😄"
    },
    sabio: {
      name: "Sabio Digital",
      greeting: "Saludos, buscador de conocimiento. El sabio digital está aquí para guiarte.",
      style: "filosófico y profundo",
      emoji: "🧙"
    },
    tecnico: {
      name: "Especialista Técnico",
      greeting: "Hola. Especialista técnico listo para resolver tus problemas.",
      style: "técnico y preciso",
      emoji: "💻"
    }
  };

  // Scroll automático al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    // Agregar mensaje del usuario
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // ✅ LLAMAR AL BACKEND SPRING BOOT
      const response = await fetch('http://localhost:8080/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          personality: personality
        })
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Agregar respuesta del bot desde el backend
      const botResponse = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
        personality: personality
      };

      setMessages(prev => [...prev, botResponse]);
      
      // Guardar en historial
      setChatHistory(prev => [...prev, {
        user: inputMessage,
        bot: data.response,
        personality: personality,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Error calling chatbot API:', error);
      
      // ❌ FALLBACK a respuestas locales si hay error
      const fallbackResponse = {
        id: Date.now() + 1,
        text: "Lo siento, el servicio no está disponible en este momento. Por favor, intenta más tarde.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: personalities[personality].greeting,
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
    setChatHistory([]);
  };

  const changePersonality = (newPersonality) => {
    setPersonality(newPersonality);
    
    // Mensaje de cambio de personalidad
    const changeMessage = {
      id: Date.now(),
      text: `¡Personalidad cambiada a ${personalities[newPersonality].name}! ${personalities[newPersonality].greeting}`,
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, changeMessage]);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="applet-chatbot">
      {/* Selector de personalidad */}
      <div className="personality-selector">
        {Object.entries(personalities).map(([key, persona]) => (
          <button
            key={key}
            className={`personality-btn ${personality === key ? 'active' : ''}`}
            onClick={() => changePersonality(key)}
          >
            {persona.emoji} {persona.name}
          </button>
        ))}
      </div>

      {/* Contenedor del chat */}
      <div className="chat-container">
        <div className="chat-header" style={{
          padding: '15px 20px',
          background: '#3498db',
          color: 'white',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>{personalities[personality].name}</strong>
            <span style={{ fontSize: '0.9rem', marginLeft: '10px', opacity: 0.8 }}>
              {personalities[personality].style}
            </span>
          </div>
          <button
            onClick={clearChat}
            className="search-button"
            style={{ 
              padding: '8px 15px',
              fontSize: '0.8rem',
              backgroundColor: '#e74c3c'
            }}
          >
            🗑️ Limpiar Chat
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender}`}
              style={{
                alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                background: message.sender === 'user' ? '#3498db' : 'white',
                color: message.sender === 'user' ? 'white' : '#2c3e50',
                border: message.sender === 'bot' ? '1px solid #dee2e6' : 'none',
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '18px',
                marginBottom: '10px',
                borderBottomRightRadius: message.sender === 'user' ? '4px' : '18px',
                borderBottomLeftRadius: message.sender === 'bot' ? '4px' : '18px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ marginBottom: '5px' }}>
                {message.text}
              </div>
              <div style={{
                fontSize: '0.7rem',
                opacity: 0.7,
                textAlign: message.sender === 'user' ? 'right' : 'left'
              }}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="message bot" style={{
              alignSelf: 'flex-start',
              background: 'white',
              border: '1px solid #dee2e6',
              padding: '12px 16px',
              borderRadius: '18px',
              borderBottomLeftRadius: '4px',
              fontStyle: 'italic',
              color: '#7f8c8d'
            }}>
              {personalities[personality].emoji} Escribiendo...
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input del chat */}
        <form onSubmit={handleSendMessage} className="chat-input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Escribe tu mensaje para ${personalities[personality].name}...`}
            className="chat-input"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={loading || !inputMessage.trim()}
          >
            {loading ? '⏳' : '📤'}
          </button>
        </form>
      </div>

      {/* Información del chat */}
      <div style={{ 
        marginTop: '15px', 
        textAlign: 'center',
        color: '#7f8c8d',
        fontSize: '0.9rem'
      }}>
        <p>
          💡 <strong>Tip:</strong> Prueba diferentes personalidades para experiencias únicas de chat
        </p>
        <p>
          Mensajes en esta sesión: {messages.length} | 
          Personalidad activa: {personalities[personality].name}
        </p>
      </div>
    </div>
  );
};

export default AppletChatbot;