import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider, githubProvider, facebookProvider } from '../firebase';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modoRegistro, setModoRegistro] = useState(false);
  const [error, setError] = useState('');

  const manejarError = (err) => {
    console.error("Error durante la autenticación:", err);
    let mensajePersonalizado = 'Ups, ocurrió un error. Intenta de nuevo.';
    setError(mensajePersonalizado);
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (modoRegistro) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err) {
      manejarError(err);
    }
  };

  const loginConProveedor = async (provider) => {
    setError('');
    try {
      await signInWithPopup(auth, provider);
      onLogin();
    } catch (err) {
      manejarError(err);
    }
  };

  return (
    <div className="contenedor-formulario">
      <h1 className="titulo">{modoRegistro ? 'Registro' : 'Iniciar sesión'}</h1>
      <form onSubmit={manejarEnvio}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <button className="boton" type="submit">
          {modoRegistro ? 'Registrarse' : 'Entrar'}
        </button>
      </form>

      {error && (
        <p style={{ color: 'orangered', fontWeight: 'bold', marginTop: '10px' }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: '10px' }}>
        <button className="boton" onClick={() => loginConProveedor(googleProvider)}>
          Iniciar con Google
        </button>
        <button className="boton" onClick={() => loginConProveedor(githubProvider)}>
          Iniciar con GitHub
        </button>
        <button className="boton" onClick={() => loginConProveedor(facebookProvider)}>
          Iniciar con Facebook
        </button>
      </div>

      <button
        className="boton"
        onClick={() => setModoRegistro(!modoRegistro)}
        style={{ marginTop: '10px' }}
      >
        {modoRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
      </button>
    </div>
  );
};

export default Login;


