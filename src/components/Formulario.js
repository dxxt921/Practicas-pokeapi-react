import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'react-toastify';

const Formulario = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [comentario, setComentario] = useState('');

  const manejarEnvio = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'comentarios'), {
        nombre,
        apellido,
        comentario,
        user_id: auth.currentUser ? auth.currentUser.uid : null,
        createdAt: serverTimestamp()
      });
      toast.success(`Gracias por tu comentario, ${nombre}`);
      setNombre('');
      setApellido('');
      setComentario('');
    } catch (error) {
      console.error('Error guardando comentario:', error);
      toast.error('Ocurrió un error al enviar tu comentario.');
    }
  };

  return (
    <>
      <h1 className="titulo">Deja tu Comentario</h1> {/* 🔥 Directo, sin div */}
      <form onSubmit={manejarEnvio}>
        <div>
          <label>Nombre:</label><br />
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Apellido:</label><br />
          <input
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Comentario:</label><br />
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="boton" style={{ marginTop: '10px' }}>
          Enviar Comentario
        </button>
      </form>
    </>
  );
};

export default Formulario;


