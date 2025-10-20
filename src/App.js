import React, { useState } from 'react';
import AppletClima from './components/AppletClima';
import AppletReproductor from './components/AppletReproductor';
import AppletBuscadorPeliculas from './components/AppletBuscadorPeliculas';
import AppletChatbot from './components/AppletChatbot';
import AppletGeneradorPasswords from './components/AppletGeneradorPasswords';
import AppletGeneradorColores from './components/AppletGeneradorColores';
import AppletConversor from './components/AppletConversor';
import AppletCalculadora from './components/AppletCalculadora';
import './Applets.css';

function App() {
  const [currentApplet, setCurrentApplet] = useState('clima'); // Por defecto el primero

  const renderApplet = () => {
    switch(currentApplet) {
      case 'clima': return <AppletClima />;
      case 'reproductor': return <AppletReproductor />;
      case 'buscador-peliculas': return <AppletBuscadorPeliculas />;
      case 'chatbot': return <AppletChatbot />;
      case 'generador-passwords': return <AppletGeneradorPasswords />;
      case 'generador-colores': return <AppletGeneradorColores />;
      case 'conversor': return <AppletConversor />;
      case 'calculadora': return <AppletCalculadora />;
      default: return <AppletClima />;
    }
  };

  const getAppletTitle = () => {
    switch(currentApplet) {
      case 'clima': return 'Pronóstico en Tiempo Real';
      case 'reproductor': return 'Reproductor de Música con API de YouTube';
      case 'buscador-peliculas': return 'Buscador de Películas con API';
      case 'chatbot': return 'Asistente Virtual Inteligente';
      case 'generador-passwords': return 'Generador de Contraseñas Seguras';
      case 'generador-colores': return 'Generador de Paletas de Colores';
      case 'conversor': return 'Conversor de Unidades';
      case 'calculadora': return 'Calculadora Avanzada';
      default: return 'Pronóstico del Tiempo en Tiempo Real';
    }
  };

  return (
    <div className="App">
      {/* BARRA LATERAL IZQUIERDA */}
      <aside className="app-sidebar">
        <h1 className="sidebar-title">Applets Suite</h1>
        <nav className="sidebar-buttons">
          
          {/* ORDEN SOLICITADO */}
          
          {/* 1. Clima - Datos en tiempo real + API */}
          <button 
            className={`sidebar-button ${currentApplet === 'clima' ? 'active' : ''}`}
            onClick={() => setCurrentApplet('clima')}
          >
            🌤️ Clima  
          </button>

          {/* 2. Reproductor Música - Integración YouTube + UI Completa */}
          <button 
            className={`sidebar-button ${currentApplet === 'reproductor' ? 'active' : ''}`}
            onClick={() => setCurrentApplet('reproductor')}
          >
            🎵 Reproductor de Música
          </button>
          {/* 3. Buscador Películas - API Externa + Resultados Dinámicos */}
          <button 
            className={`sidebar-button ${currentApplet === 'buscador-peliculas' ? 'active' : ''}`}
            onClick={() => setCurrentApplet('buscador-peliculas')}
          >
            🎬 Buscador de Películas
          </button>

          {/* 4. Chatbot - Interacción Usuario */}
          <button 
            className={`sidebar-button ${currentApplet === 'chatbot' ? 'active' : ''}`}
            onClick={() => setCurrentApplet('chatbot')}
          >
            🤖 Chatbot IA
          </button>

          {/* 5. Generador Passwords - Herramienta Práctica */}
          <button 
            className={`sidebar-button ${currentApplet === 'generador-passwords' ? 'active' : ''}`}
            onClick={() => setCurrentApplet('generador-passwords')}
          >
            🔐 Generador de Passwords
          </button>

          {/* 6. Generador Colores - Visualmente Atractivo */}
          <button 
            className={`sidebar-button ${currentApplet === 'generador-colores' ? 'active' : ''}`}
            onClick={() => setCurrentApplet('generador-colores')}
          >
            🎨 Generador de Colores
          </button>

          {/* 7. Conversor - Utilidad Básica */}
          <button 
            className={`sidebar-button ${currentApplet === 'conversor' ? 'active' : ''}`}
            onClick={() => setCurrentApplet('conversor')}
          >
            📐 Conversor de Unidades
          </button>

          {/* 8. Calculadora - Lógica Avanzada */}
          <button 
            className={`sidebar-button ${currentApplet === 'calculadora' ? 'active' : ''}`}
            onClick={() => setCurrentApplet('calculadora')}
          >
            🧮 Calculadora
          </button>
        </nav>
      </aside>

      {/* CONTENEDOR PRINCIPAL DERECHO */}
      <main className="app-main-content">
        <div className="app-main-container">
          <h2 className="applet-title">{getAppletTitle()}</h2>
          {renderApplet()}
        </div>
      </main>
    </div>
  );
}

export default App;