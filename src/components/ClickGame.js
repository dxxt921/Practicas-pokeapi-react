/* src/components/ClickGame.js */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  doc,
  setDoc,
  increment,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import ScoreTable from './ScoreTable';
import { toast } from 'react-toastify';

const DURACION_JUEGO = 15; // segundos

const ClickGame = ({ usuario }) => {
  const [contador, setContador] = useState(0);
  const [tiempo, setTiempo] = useState(DURACION_JUEGO);
  const [jugando, setJugando] = useState(false);
  const [mejorScore, setMejorScore] = useState(0);
  const intervalRef = useRef(null);

  // cargar / escuchar mejor score
  useEffect(() => {
    if (!usuario) return;
    const q = query(
      collection(db, 'scores'),
      where('user_id', '==', usuario.uid),
      orderBy('score', 'desc'),
      limit(1)
    );
    const unsub = onSnapshot(q, snap => {
      const top = snap.empty ? 0 : snap.docs[0].data().score;
      setMejorScore(top);
    });
    return () => unsub();
  }, [usuario]);

  // iniciar juego
  const iniciarJuego = () => {
    setContador(0);
    setTiempo(DURACION_JUEGO);
    setJugando(true);
  };

  const handleClick = () => {
    if (jugando) setContador(c => c + 1);
  };

  // temporizador
  useEffect(() => {
    if (!jugando) return;
    intervalRef.current = setInterval(() => {
      setTiempo(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [jugando]);

  // fin del juego
  useEffect(() => {
    if (tiempo !== 0 || !jugando) return;
    setJugando(false);
    clearInterval(intervalRef.current);
    guardarPuntuacion(contador);
  }, [tiempo, jugando, contador]);

  // guardar score + premio Pokébola
  const guardarPuntuacion = async score => {
    if (!usuario) return;
    try {
      await addDoc(collection(db, 'scores'), {
        user_id: usuario.uid,
        score,
        timestamp: serverTimestamp()
      });
      toast.success(`Juego terminado. Puntos: ${score}`);

      if (score > mejorScore) {
        await setDoc(
          doc(db, 'pokebolas', usuario.uid),
          { pokebolas: increment(1) },
          { merge: true }
        );
        setMejorScore(score);
        toast.info('🥳 ¡Nuevo récord! +1 Pokébola');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar la puntuación');
    }
  };

  return (
    <div
      className="contenedor-juego"
      style={{ display: 'flex', alignItems: 'flex-start' }}
    >
      <div className="juego" style={{ flex: 1 }}>
        <h1>ClickGame</h1>
        <p><strong>Clicks:</strong> {contador}</p>
        <p><strong>Tiempo:</strong> {tiempo}s</p>

        {jugando ? (
          <button className="boton" onClick={handleClick}>¡Clic!</button>
        ) : (
          <button className="boton" onClick={iniciarJuego}>Iniciar juego</button>
        )}
      </div>

      <div className="tabla-scores" style={{ marginLeft: 20 }}>
        <h2>Tus puntuaciones</h2>
        <ScoreTable usuario={usuario} />
      </div>
    </div>
  );
};

export default ClickGame;











