// src/App.js
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import ClickGame from './components/ClickGame';
import Formulario from './components/Formulario';
import PokeAPI from './components/PokeAPI';
import Login from './components/login';
import VincularGitHub from './components/VincularGitHub';
import GlobalLeaderboard from './components/GlobalLeaderboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [mostrarClickGame, setMostrarClickGame] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [mostrarPokeAPI, setMostrarPokeAPI] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUsuario(user);
    });
    return () => unsubscribe();
  }, []);

  if (!usuario) {
    return <Login onLogin={() => window.location.reload()} />;
  }

  return (
    <div className="App">
      {/* Cerrar sesión */}
      <div className="cerrar-sesion">
        <button className="boton-cerrar" onClick={() => signOut(auth)}>
          ⏻ Cerrar sesión
        </button>
      </div>

      {/* Saludo + Vinculación GitHub */}
      <h2>Hola, {usuario.displayName || usuario.email}</h2>
      <VincularGitHub />

      {/* 📊 Top Global */}
      <GlobalLeaderboard />

      {/* Toggles para mostrar/ocultar secciones */}
      <div className="bloque-principal" style={{ marginTop: '20px' }}>
        <div className="botones-toggle">
          <button className="boton" onClick={() => setMostrarClickGame(v => !v)}>
            {mostrarClickGame ? 'Ocultar Contador' : 'Mostrar Contador'}
          </button>
          <button className="boton" onClick={() => setMostrarFormulario(v => !v)}>
            {mostrarFormulario ? 'Ocultar Formulario' : 'Mostrar Formulario'}
          </button>
          <button className="boton" onClick={() => setMostrarPokeAPI(v => !v)}>
            {mostrarPokeAPI ? 'Ocultar PokéAPI' : 'Mostrar PokéAPI'}
          </button>
        </div>

        {/* ClickGame dentro de ventana estilo POKEDEX */}
        {mostrarClickGame && (
          <div className="cards-container">
            <div className="window-card">
              <div className="window-header">
                <div className="window-buttons">
                  <span className="win-btn close" />
                  <span className="win-btn min" />
                  <span className="win-btn max" />
                </div>
                <div className="window-title">CLICKGAME</div>
              </div>
              <div className="window-content">
                <ClickGame usuario={usuario} />
              </div>
            </div>
          </div>
        )}

        {/* Formulario de Comentarios */}
        {mostrarFormulario && (
          <div className="cards-container">
            <div className="window-card">
              <div className="window-header">
                <div className="window-buttons">
                  <span className="win-btn close" />
                  <span className="win-btn min" />
                  <span className="win-btn max" />
                </div>
                <div className="window-title">COMENTARIOS</div>
              </div>
              <div className="window-content">
                <Formulario />
              </div>
            </div>
          </div>
        )}

        {/* Módulo principal de PokeAPI */}
        {mostrarPokeAPI && <PokeAPI usuario={usuario} />}
      </div>

      {/* Toasts */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;






