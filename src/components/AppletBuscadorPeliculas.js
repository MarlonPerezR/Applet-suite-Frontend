import React, { useState, useEffect } from "react";
import "../Applets.css";

const BACKEND_URL = `${process.env.REACT_APP_BACKEND_URL}/api/peliculas`;

const AppletBuscadorPeliculas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [view, setView] = useState("search");

  // 🔹 Efecto: cargar favoritos al iniciar
  useEffect(() => {
    const saved = localStorage.getItem("movieFavorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (err) {
        console.error("Error cargando favoritos:", err);
        setFavorites([]);
      }
    }
  }, []);

  // 🔹 Efecto: guardar favoritos cuando cambien
  useEffect(() => {
    try {
      localStorage.setItem("movieFavorites", JSON.stringify(favorites));
    } catch (err) {
      console.error("Error guardando favoritos:", err);
    }
  }, [favorites]);

  // ✅ Función para buscar películas
  const searchMovies = async (e) => {
    if (e) e.preventDefault();

    if (!searchTerm.trim()) {
      return setError("Por favor ingresa un título de película");
    }

    iniciarBusqueda();

    try {
      const data = await fetchPeliculas(searchTerm);
      manejarRespuestaBusqueda(data);
    } catch (err) {
      manejarErrorBusqueda(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Funciones auxiliares separadas
  const iniciarBusqueda = () => {
    setLoading(true);
    setError("");
    setSelectedMovie(null);
  };

  const fetchPeliculas = async (titulo) => {
    const response = await fetch(
      `${BACKEND_URL}/buscar?titulo=${encodeURIComponent(titulo)}`
    );
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return response.json();
  };
  const manejarRespuestaBusqueda = (data) => {
    console.log("📦 Datos crudos del backend:", data);

    if (data.error) {
      setError(data.error);
      setMovies([]);
    } else if (data.peliculas && Array.isArray(data.peliculas)) {
      console.log("🎬 Películas encontradas:", data.peliculas);

      // ✅ ELIMINAR DUPLICADOS usando Set
      const peliculasUnicas = data.peliculas.reduce((unicos, pelicula) => {
        const existe = unicos.find((p) => p.id === pelicula.id);
        if (!existe) {
          unicos.push(pelicula);
        }
        return unicos;
      }, []);

      const peliculasMapeadas = peliculasUnicas.map((pelicula, index) => ({
        imdbID: pelicula.id,
        Title: pelicula.titulo,
        Year: pelicula.año,
        Poster: pelicula.poster,
        Type: pelicula.tipo,
      }));

      console.log(
        `🔄 ${peliculasUnicas.length} películas únicas de ${data.peliculas.length} totales`
      );
      setMovies(peliculasMapeadas);
    } else {
      setError("No se encontraron películas");
      setMovies([]);
    }
  };

  const manejarErrorBusqueda = (err) => {
    setError("Error al buscar películas. Intenta nuevamente.");
    console.error("Error buscando películas:", err);
  };

  const getMovieDetails = async (imdbID) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/detalles?id=${imdbID}`);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();

      console.log("📋 Datos crudos de detalles:", data); // Para debug

      if (data.error) {
        setError(data.error);
      } else {
        // ✅ MAPEO CORREGIDO para detalles - español a inglés
        const detallesMapeados = {
          imdbID: data.id || data.imdbID,
          Title: data.titulo || data.Title,
          Year: data.año || data.Year,
          Poster: data.poster || data.Poster,
          Rated: data.clasificacion || data.Rated || "N/A",
          Released: data.lanzamiento || data.Released || "N/A",
          Runtime: data.duracion || data.Runtime || "N/A",
          Genre: data.genero || data.Genre || "N/A",
          Director: data.director || data.Director || "N/A",
          Actors: data.actores || data.Actors || "N/A",
          Plot: data.sinopsis || data.Plot || "Sin sinopsis disponible",
          Awards: data.premios || data.Awards || "N/A",
          Ratings: data.ratings || data.Ratings || [],
          Type: data.tipo || data.Type || "movie",
        };

        console.log("🔄 Detalles mapeados:", detallesMapeados);
        setSelectedMovie(detallesMapeados);
      }
    } catch (err) {
      setError("Error al cargar detalles");
      console.error("Error fetching movie details:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (movie) => {
    const isFavorite = favorites.some((fav) => fav.imdbID === movie.imdbID);

    if (isFavorite) {
      setFavorites(favorites.filter((fav) => fav.imdbID !== movie.imdbID));
    } else {
      setFavorites([...favorites, { ...movie, isFavorite: true }]);
    }
  };
  const isMovieFavorite = (imdbID) => {
    return favorites.some((fav) => fav.imdbID === imdbID);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setMovies([]);
    setSelectedMovie(null);
    setError("");
  };

  const formatRating = (ratings) => {
    if (!ratings || !Array.isArray(ratings)) return "N/A";

    const imdbRating = ratings.find(
      (rating) => rating.Source === "Internet Movie Database"
    );
    return imdbRating ? imdbRating.Value : "N/A";
  };

  return (
    <div className="applet-buscador-peliculas">
      {/* Navegación entre búsqueda y favoritos */}
      <div
        className="view-switcher"
        style={{ marginBottom: "20px", textAlign: "center" }}
      >
        <button
          className={`sidebar-button ${view === "search" ? "active" : ""}`}
          onClick={() => setView("search")}
          style={{
            marginBottom: "10px",
            backgroundColor: view === "search" ? "#5d7a9a" : "#a8c0d6",
            color: view === "search" ? "#ffffff" : "#2c3e50",
            border: "none",
            borderRadius: "8px",
            padding: "12px 20px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "all 0.3s ease",
            boxShadow:
              view === "search"
                ? "0 4px 8px rgba(0,0,0,0.2)"
                : "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          🔍 Buscar Películas
        </button>
        <button
          className={`sidebar-button ${view === "favorites" ? "active" : ""}`}
          onClick={() => setView("favorites")}
          style={{
            marginTop: "5px",
            backgroundColor: view === "favorites" ? "#5d7a9a" : "#a8c0d6",
            color: view === "favorites" ? "#ffffff" : "#2c3e50",
            border: "none",
            borderRadius: "8px",
            padding: "12px 20px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "all 0.3s ease",
            boxShadow:
              view === "favorites"
                ? "0 4px 8px rgba(0,0,0,0.2)"
                : "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          ⭐ Favoritos ({favorites.length})
        </button>
      </div>

      {view === "search" ? (
        <>
          {/* Formulario de búsqueda */}
          <form onSubmit={searchMovies} className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar películas... (ej: Avengers, Titanic)"
              className="search-input"
            />
            <button type="submit" className="search-button">
              🔍 Buscar
            </button>
            <button
              type="button"
              onClick={clearSearch}
              className="search-button"
              style={{ backgroundColor: "#e74c3c" }}
            >
              🗑️ Limpiar
            </button>
          </form>

          {/* Mensajes de estado */}
          {loading && (
            <div style={{ textAlign: "center", margin: "20px 0" }}>
              <div className="cargando">Buscando películas...</div>
            </div>
          )}

          {error && (
            <div
              style={{
                textAlign: "center",
                margin: "20px 0",
                padding: "15px",
                background: "#ffeaa7",
                borderRadius: "8px",
                color: "#e74c3c",
                fontWeight: "bold",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Detalles de película seleccionada */}
          {selectedMovie && (
            <div
              className="movie-details"
              style={{
                background: "#f8f9fa",
                padding: "25px",
                borderRadius: "12px",
                margin: "20px 0",
                border: "2px solid #bdc3c7",
              }}
            >
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <div style={{ flex: "0 0 200px" }}>
                  <img
                    src={
                      selectedMovie.Poster !== "N/A"
                        ? selectedMovie.Poster
                        : "/placeholder-movie.jpg"
                    }
                    alt={selectedMovie.Title}
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                    }}
                  />
                  <button
                    onClick={() => toggleFavorite(selectedMovie)}
                    className="search-button"
                    style={{
                      width: "100%",
                      marginTop: "10px",
                      backgroundColor: isMovieFavorite(selectedMovie.imdbID)
                        ? "#e74c3c"
                        : "#27ae60",
                    }}
                  >
                    {isMovieFavorite(selectedMovie.imdbID)
                      ? "💔 Quitar de Favoritos"
                      : "⭐ Agregar a Favoritos"}
                  </button>
                </div>

                <div style={{ flex: "1", minWidth: "300px" }}>
                  <h2 style={{ color: "#2c3e50", marginBottom: "10px" }}>
                    {selectedMovie.Title} ({selectedMovie.Year})
                  </h2>

                  <div style={{ marginBottom: "15px" }}>
                    <span
                      style={{
                        background: "#3498db",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "0.9rem",
                        marginRight: "10px",
                      }}
                    >
                      {selectedMovie.Rated}
                    </span>
                    <span style={{ color: "#7f8c8d" }}>
                      {selectedMovie.Runtime} • {selectedMovie.Genre}
                    </span>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <strong>📅 Lanzamiento:</strong> {selectedMovie.Released}
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <strong>⭐ Rating IMDB:</strong>{" "}
                    {formatRating(selectedMovie.Ratings)}
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <strong>🎬 Director:</strong> {selectedMovie.Director}
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <strong>🎭 Actores:</strong> {selectedMovie.Actors}
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <strong>📝 Sinopsis:</strong>
                    <p style={{ marginTop: "8px", lineHeight: "1.5" }}>
                      {selectedMovie.Plot}
                    </p>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <strong>🏆 Premios:</strong> {selectedMovie.Awards}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid de películas - CORREGIDO */}
          {/* Grid de películas */}
          {movies.length > 0 && !selectedMovie && (
            <div className="movies-grid">
              {movies.map((movie, index) => (
                <div
                  key={`${movie.imdbID}-${index}`} 
                  className="movie-card"
                  onClick={() => {
                    if (movie.imdbID) {
                      getMovieDetails(movie.imdbID);
                    } else {
                      console.error("Movie sin imdbID:", movie);
                      setError("Película sin ID válido");
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && movie.imdbID) {
                      e.preventDefault();
                      getMovieDetails(movie.imdbID);
                    }
                  }}
                >
                  <img
                    src={
                      movie.Poster !== "N/A"
                        ? movie.Poster
                        : "/placeholder-movie.jpg"
                    }
                    alt={movie.Title}
                    className="movie-poster"
                  />
                  <div className="movie-info">
                    <div className="movie-title">{movie.Title}</div>
                    <div className="movie-year">{movie.Year}</div>
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "0.8rem",
                        color: isMovieFavorite(movie.imdbID)
                          ? "#e74c3c"
                          : "#7f8c8d",
                      }}
                    >
                      {isMovieFavorite(movie.imdbID)
                        ? "⭐ En favoritos"
                        : "📝 Click para detalles"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Vista de favoritos */
        <div>
          <h3
            style={{
              textAlign: "center",
              color: "#2c3e50",
              marginBottom: "20px",
            }}
          >
            🎬 Tus Películas Favoritas
          </h3>

          {favorites.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                background: "#ecf0f1",
                borderRadius: "8px",
                color: "#7f8c8d",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🎭</div>
              <p>No tienes películas favoritas aún.</p>
              <p>Busca películas y agrégalas a tus favoritos.</p>
            </div>
          ) : (
            <div className="movies-grid">
              {favorites.map((movie) => (
                <div
                  key={movie.imdbID}
                  className="movie-card"
                  onClick={() => {
                    setView("search");
                    getMovieDetails(movie.imdbID);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setView("search");
                      getMovieDetails(movie.imdbID);
                    }
                  }}
                >
                  <img
                    src={
                      movie.Poster !== "N/A"
                        ? movie.Poster
                        : "/placeholder-movie.jpg"
                    }
                    alt={movie.Title}
                    className="movie-poster"
                  />
                  <div className="movie-info">
                    <div className="movie-title">{movie.Title}</div>
                    <div className="movie-year">{movie.Year}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(movie);
                      }}
                      style={{
                        marginTop: "8px",
                        padding: "5px 10px",
                        background: "#e74c3c",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        width: "100%",
                      }}
                    >
                      💔 Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppletBuscadorPeliculas;
