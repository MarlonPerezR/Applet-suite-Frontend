import React, { useState, useRef, useEffect } from "react";
import "../Applets.css";

const AppletReproductor = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [repeatMode, setRepeatMode] = useState("none");
  const [shuffle, setShuffle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para YouTube
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("playlist");
  const [error, setError] = useState("");

  const listaReproduccionRef = useRef(null);
  const resultadosRef = useRef(null);
  const audioRef = useRef(null);

  // ✅ PLAYLIST LOCAL CON TUS ARCHIVOS REALES
  useEffect(() => {
    // ✅ MOVER playlistLocal DENTRO del useEffect
    const playlistLocal = [
      {
        id: 1,
        titulo: "Estranged",
        artista: "Guns N' Roses",
        duracion: 563,
        url: "/audio/Guns N' Roses - Estranged.mp3",
        portada: "/images/Estranged.jpg",
        videoId: "estranged",
      },
      {
        id: 2,
        titulo: "Patience",
        artista: "Guns N' Roses",
        duracion: 354,
        url: "/audio/Guns N' Roses - Patience.mp3",
        portada: "/images/Patience.jpg",
        videoId: "patience",
      },
      {
        id: 3,
        titulo: "Master of Puppets",
        artista: "Metallica",
        duracion: 516,
        url: "/audio/Master of Puppets (Remastered).mp3",
        portada: "/images/Master.jpg",
        videoId: "master",
      },
      {
        id: 4,
        titulo: "Nothing Else Matters",
        artista: "Metallica",
        duracion: 388,
        url: "/audio/Nothing Else Matters.mp3",
        portada: "/images/Nothing.jpg",
        videoId: "nothing",
      },

      {
        id: 5,
        titulo: "Monkey Business",
        artista: "Skid Row",
        duracion: 332,
        url: "http://localhost:3000/audio/Monkey%20Business.mp3",
        portada: "http://localhost:3000/images/Monkey.jpg",
        videoId: "monkey",
      },
      {
        id: 6,
        titulo: "18 and Life",
        artista: "Skid Row",
        duracion: 312,
        url: "http://localhost:3000/audio/18%20and%20Life.mp3",
        portada: "http://localhost:3000/images/18.jpg",
        videoId: "18andlife",
      },
      {
        id: 7,
        titulo: "Hysteria",
        artista: "Def Leppard",
        duracion: 537,
        url: "http://localhost:3000/audio/Hysteria.mp3",
        portada: "http://localhost:3000/images/Hysteria.jpg",
        videoId: "hysteria",
      },
      {
        id: 8,
        titulo: "Bringin' On The Heartbreak",
        artista: "Def Leppard",
        duracion: 264,
        url: "http://localhost:3000/audio/Bringin%20On%20The%20Heartbreak.mp3",
        portada:
          "http://localhost:3000/images/Bringin%20On%20The%20Heartbreak.jpg",
        videoId: "bringinon",
      },
    ];

    console.log("🎵 Cargando playlist LOCAL con archivos reales...");
    console.log("📁 Archivos cargados:", playlistLocal);

    setPlaylist(playlistLocal);
  }, []); // ✅ Ahora no hay dependencias faltantes

  // Efecto para manejar cambios de canción
  useEffect(() => {
    if (currentSong && audioRef.current && currentSong.type !== "youtube") {
      setIsLoading(true);

      const playAudio = async () => {
        try {
          console.log("🎵 Intentando reproducir:", currentSong.titulo);
          console.log("📁 URL del archivo:", currentSong.url);

          // Configurar el audio
          audioRef.current.src = currentSong.url;
          audioRef.current.volume = volume;

          // Esperar a que el audio esté listo
          audioRef.current.oncanplaythrough = () => {
            console.log("✅ Audio listo para reproducir:", currentSong.titulo);
            setIsLoading(false);
          };

          audioRef.current.onerror = (e) => {
            console.error("❌ Error de audio:", e);
            console.error(
              "🔍 Verifica que el archivo exista en:",
              currentSong.url
            );
            setIsLoading(false);
          };

          // Cargar y reproducir
          await audioRef.current.load();
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("❌ Error al reproducir:", error);
          setIsPlaying(false);
          setIsLoading(false);
        }
      };

      playAudio();
    }
  }, [currentSong, volume]);

  // Buscar en YouTube
  const buscarEnYouTube = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setError("");
      return;
    }

    setIsSearching(true);
    setError("");
    try {
      const response = await fetch(
        `https://applet-suite-backend.onrender.com/api/musica/buscar?query=${encodeURIComponent(
          query
        )}`
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const resultados = await response.json();
      setSearchResults(resultados);
    } catch (error) {
      console.error("Error buscando en YouTube:", error);
      setError(error.message || "Error al conectar con el servidor");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // ✅ FUNCIÓN CORREGIDA: Manejo de volumen
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Reproducir canción de YouTube
  const reproducirDesdeYouTube = (cancionYouTube) => {
    const cancionAdaptada = {
      id: cancionYouTube.videoId,
      titulo: cancionYouTube.titulo,
      artista: cancionYouTube.artista,
      duracion: cancionYouTube.duracion,
      url: cancionYouTube.url,
      portada: cancionYouTube.portada,
      type: "youtube",
    };

    setCurrentSong(cancionAdaptada);
    setIsPlaying(false);
  };

  // Manejar búsqueda
const manejarBusqueda = (e) => {
  e.preventDefault();
  buscarEnYouTube(searchQuery);
  setActiveTab("search");
  
  // Desplazar a resultados después de un pequeño delay para que se renderice
  setTimeout(() => {
    resultadosRef.current?.scrollIntoView({ behavior: "smooth" });
  }, 100);
};

  // Funciones del reproductor
  const updateProgress = () => {
    if (audioRef.current && audioRef.current.duration) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;

      // ✅ VERIFICAR que duration sea finito
      if (isFinite(duration) && duration > 0) {
        setCurrentTime(current);
        setProgress((current / duration) * 100);
      }
    }
  };

  const togglePlayPause = async () => {
    if (!currentSong) {
      if (playlist.length > 0) {
        setCurrentSong(playlist[0]);
      }
      return;
    }

    if (currentSong.type === "youtube") {
      alert(
        "🎵 Para reproducir canciones de YouTube, necesitas un reproductor especializado."
      );
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("Error al reproducir:", error);
        }
      }
    }
  };

  const selectSong = (song) => {
    console.log("🎵 Seleccionando:", song.titulo);
    if (song.type === "youtube") {
      reproducirDesdeYouTube(song);
    } else {
      setCurrentSong(song);
      setProgress(0);
      setCurrentTime(0);
    }
  };

  const nextSong = () => {
    if (!playlist.length) return;

    const currentIndex = playlist.findIndex(
      (song) => song.id === currentSong?.id
    );
    let nextIndex;

    if (shuffle) {
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (nextIndex === currentIndex && playlist.length > 1);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }

    selectSong(playlist[nextIndex]);
  };

  const prevSong = () => {
    if (!playlist.length) return;

    const currentIndex = playlist.findIndex(
      (song) => song.id === currentSong?.id
    );
    const prevIndex =
      currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;

    selectSong(playlist[prevIndex]);
  };

  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);

    if (audioRef.current && audioRef.current.duration) {
      const newTime = (newProgress / 100) * audioRef.current.duration;

      // ✅ VERIFICAR que newTime sea un número finito
      if (isFinite(newTime)) {
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSongEnd = () => {
    if (repeatMode === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      nextSong();
    }
  };

  const getCurrentSongIndex = () => {
    return playlist.findIndex((song) => song.id === currentSong?.id);
  };

  const getPlayPauseIcon = () => {
    if (isLoading) return "⏳";
    if (currentSong?.type === "youtube") return "🔴";
    if (isPlaying) return "⏸️";
    return "▶️";
  };

  

  const renderSearchContent = () => {
    if (isSearching) {
      return <div className="estado-carga">🔍 Buscando en YouTube...</div>;
    }
    if (searchResults.length > 0) {
      return (
        <>
          {searchResults.map((cancion, index) => (
            <div
              key={cancion.videoId}
              className={`cancion-item resultado-youtube ${
                currentSong?.videoId === cancion.videoId ? "activa" : ""
              }`}
              onClick={() => reproducirDesdeYouTube(cancion)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  reproducirDesdeYouTube(cancion);
                }
              }}
            >
              <div className="numero-cancion">{index + 1}</div>
              <div className="info-cancion-lista">
                <div className="titulo-lista-item">{cancion.titulo}</div>
                <div className="artista-lista-item">{cancion.artista}</div>
              </div>
              <div className="duracion-lista">
                {formatTime(cancion.duracion)}
              </div>
              <div className="fuente-youtube">YouTube</div>
            </div>
          ))}
        </>
      );
    }
    return (
      <div className="estado-vacio">
        {searchQuery
          ? "No se encontraron resultados"
          : "Escribe algo para buscar en YouTube"}
      </div>
    );
  };

  return (
    <div className="applet-reproductor">
      {/* Barra de búsqueda */}
      <div className="barra-busqueda">
        <form onSubmit={manejarBusqueda} className="form-busqueda">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Buscar música en YouTube..."
            className="input-busqueda"
            disabled={isSearching}
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()  }
            className="boton-busqueda"
          >
            {isSearching ? "Buscando..." : "Buscar"}
          </button>
        </form>
        {error && <div className="error-busqueda">⚠️ {error}</div>}
      </div>

      {/* Tabs de navegación */}
      <div className="tabs-navegacion">
        <button
          className={`tab ${activeTab === "playlist" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("playlist");
            listaReproduccionRef.current?.scrollIntoView({
              behavior: "smooth",
            });
          }}
        >
          🎵 Mi Playlist ({playlist.length})
        </button>
        <button
          className={`tab ${activeTab === "search" ? "active" : ""}`} ref={resultadosRef}
          onClick={() => {
            setActiveTab("search");
            resultadosRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          🔍 Resultados ({searchResults.length})
        </button>
      </div>

      {/* Reproductor principal */}
      <div className="reproductor-principal">
        <div className="info-cancion">
          {currentSong ? (
            <>
              <div className="cover-art">
                {currentSong.portada ? (
                  <img src={currentSong.portada} alt={currentSong.titulo} />
                ) : (
                  <span>🎵</span>
                )}
              </div>
              <div className="titulo-cancion">{currentSong.titulo}</div>
              <div className="artista-cancion">{currentSong.artista}</div>
              {currentSong.type === "youtube" && (
                <div className="fuente-youtube-badge">YouTube</div>
              )}
              <div className="contador-cancion">
                {currentSong.type !== "youtube" && (
                  <>
                    {getCurrentSongIndex() + 1} de {playlist.length}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="estado-vacio">
              <div className="icono-estado">🎧</div>
              <div>Selecciona una canción para comenzar</div>
            </div>
          )}
        </div>

        {currentSong?.type !== "youtube" && (
          <>
            <div className="barra-progreso">
              <span className="tiempo-actual">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleProgressChange}
                className="progreso-slider"
              />
              <span className="tiempo-total">
                {formatTime(currentSong?.duracion || 0)}
              </span>
            </div>

            <div className="controles-reproduccion">
              <button
                onClick={prevSong}
                disabled={!currentSong}
                className="control-btn"
              >
                ⏮
              </button>

              <button
                onClick={togglePlayPause}
                disabled={isLoading || !currentSong}
                className="control-btn play-pause-btn"
              >
                {getPlayPauseIcon()}
              </button>

              <button
                onClick={nextSong}
                disabled={!currentSong}
                className="control-btn"
              >
                ⏭
              </button>
            </div>

            <div className="controles-extra">
              <button
                className={`control-extra-btn ${
                  repeatMode !== "none" ? "active" : ""
                }`}
                onClick={() => {
                  const modes = ["none", "all", "one"];
                  const currentIndex = modes.indexOf(repeatMode);
                  setRepeatMode(modes[(currentIndex + 1) % modes.length]);
                }}
                title={(() => {
                  switch (repeatMode) {
                    case "none":
                      return "Repetir: Desactivado";
                    case "all":
                      return "Repetir: Toda la lista";
                    case "one":
                      return "Repetir: Una canción";
                    default:
                      return "Repetir: Desactivado";
                  }
                })()}
              >
                🔄 {repeatMode !== "none" && (repeatMode === "one" ? "1" : "∞")}
              </button>

              <button
                className={`control-extra-btn ${shuffle ? "active" : ""}`}
                onClick={() => setShuffle(!shuffle)}
                title={
                  shuffle
                    ? "Desactivar mezcla aleatoria"
                    : "Activar mezcla aleatoria"
                }
              >
                🔀
              </button>

              <div className="control-volumen">
                <span className="icono-volumen">
                  {(() => {
                    if (volume === 0) return "🔇";
                    if (volume < 0.5) return "🔈";
                    return "🔊";
                  })()}
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume * 100}
                  onChange={handleVolumeChange}
                  className="volumen-slider"
                />
              </div>
            </div>

            <audio
              ref={audioRef}
              onEnded={handleSongEnd}
              onTimeUpdate={updateProgress}
              onLoadedMetadata={updateProgress}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={(e) => {
                console.error("Error de audio:", e);
                setIsLoading(false);
              }}
            >
              {currentSong && (
                <source src={currentSong.url} type="audio/mpeg" />
              )}
              <track kind="captions" src="" srcLang="es" label="Español" />
              Tu navegador no soporta el elemento de audio.
            </audio>
          </>
        )}

        {currentSong?.type === "youtube" && (
          <div className="youtube-info">
            <div className="youtube-message">
              <strong>🎵 Canción de YouTube seleccionada</strong>
              <p>
                Para reproducir audio de YouTube necesitas un reproductor
                especializado.
              </p>
              <a
                href={currentSong.url}
                target="_blank"
                rel="noopener noreferrer"
                className="youtube-link"
              >
                🔗 Abrir en YouTube
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Lista de reproducción */}
      <div className="lista-reproduccion" ref={listaReproduccionRef}>
        {activeTab === "playlist" ? (
          <>
            <h3 className="titulo-lista">
              <span>🎵 Mi Playlist</span>
              <span className="contador-lista">
                {playlist.length} canciones
              </span>
            </h3>

            {playlist.map((song, index) => (
              <button
                key={song.id}
                className={`cancion-item ${
                  currentSong?.id === song.id ? "activa" : ""
                }`}
                onClick={() => selectSong(song)}
              >
                <div className="numero-cancion">
                  {currentSong?.id === song.id && isPlaying ? "🎵" : index + 1}
                </div>

                <div className="info-cancion-lista">
                  <div className="titulo-lista-item">{song.titulo}</div>
                  <div className="artista-lista-item">{song.artista}</div>
                </div>

                <div className="duracion-lista">
                  {formatTime(song.duracion)}
                </div>
              </button>
            ))}
          </>
        ) : (
          <>
           <div className="lista-reproduccion" ref={resultadosRef}></div>
            <h3 className="titulo-lista">
              <span>🔍 Resultados de YouTube</span>
              <span className="contador-lista">
                {searchResults.length} canciones
              </span>
            </h3>

            {renderSearchContent()}
          </>
        )}
      </div>

      {/* Información del reproductor */}
      <div className="info-reproductor">
        <p>
          🎧 <strong>Reproductor de Música</strong> - Con tus archivos reales
        </p>
        <p>✨ Guns N' Roses & Metallica - Archivos locales</p>
      </div>
    </div>
  );
};

export default AppletReproductor;
