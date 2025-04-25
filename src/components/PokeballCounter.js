// src/components/PokeballCounter.js
import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import pokeballIcon from '../assets/pokeball.png';
import ultraballIcon from '../assets/ultraball.png';
import './PokeballCounter.css';

const PokeballCounter = ({ userId }) => {
  const [pokebolas, setPokebolas] = useState(0);
  const [ultraballs, setUltraballs] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const ref = doc(db, 'pokebolas', userId);

    const init = async () => {
      try {
        const snap = await getDoc(ref);
        const data = snap.data() || {};

        // Si no existe el doc, o le faltan campos pokebolas/ultraballs, inicialízalos:
        if (
          !snap.exists() ||
          data.pokebolas === undefined ||
          data.ultraballs === undefined
        ) {
          await setDoc(
            ref,
            {
              // Conserva cantidades existentes si las hubiera, 
              // de lo contrario usa 5 y 3 como valores por defecto
              pokebolas: data.pokebolas ?? 5,
              ultraballs: data.ultraballs ?? 3
            },
            { merge: true }
          );
          console.log(
            'PokeballCounter › inicializado:',
            `pokebolas=${data.pokebolas ?? 5}`,
            `ultraballs=${data.ultraballs ?? 3}`
          );
        }
      } catch (e) {
        console.error('PokeballCounter › error al inicializar:', e);
      }
    };

    init();

    const unsub = onSnapshot(
      ref,
      (snap) => {
        const d = snap.data() || {};
        setPokebolas(d.pokebolas ?? 0);
        setUltraballs(d.ultraballs ?? 0);
      },
      (err) => console.error('PokeballCounter › snapshot error:', err)
    );

    return () => unsub();
  }, [userId]);

  return (
    <div className="pokeball-counters">
      <div className="pokeball-counter">
        <img src={pokeballIcon} alt="Pokébola" className="pokeball-icon" />
        <span className="pokeball-count">{pokebolas}</span>
      </div>
      <div className="ultraball-counter">
        <img src={ultraballIcon} alt="Ultra Ball" className="ultraball-icon" />
        <span className="ultraball-count">{ultraballs}</span>
      </div>
    </div>
  );
};

export default PokeballCounter;

