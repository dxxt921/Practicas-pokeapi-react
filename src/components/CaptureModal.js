// src/components/CaptureModal.js
import React, { useState } from 'react';
import pokeballIcon from '../assets/pokeball.png';
import ultraballIcon from '../assets/ultraball.png';
import './CaptureModal.css';

export default function CaptureModal({
  pokemon,
  onClose,
  ballType = 'poke',   // 'poke' o 'ultra'
  berryUsed = false,
  consumePokeball
}) {
  const [throwing, setThrowing] = useState(false);
  if (!pokemon) return null;

  const calcChance = () => {
    const base = 0.4 + 50 / (pokemon.base_experience + 50);
    const mult = ballType === 'ultra' ? 1.5 : 1;
    const berry = berryUsed ? 0.25 : 0;
    return Math.min(0.95, base * mult + berry);
  };

  const handleLanzar = async () => {
    const ok = await consumePokeball();
    if (!ok) return;
    setThrowing(true);
    setTimeout(() => {
      const success = Math.random() < calcChance();
      onClose(success);
      setThrowing(false);
    }, 1800);
  };

  return (
    <div className="capture-overlay fade-in">
      <div className="capture-modal">
        <h2>¡Intentando capturar a {pokemon.nombre.toUpperCase()}!</h2>
        <div className="capture-scene">
          <img
            src={pokemon.imagen}
            alt={pokemon.nombre}
            className={`capture-pokemon ${!throwing ? 'pokemon-entry' : ''}`}
          />

          <div className="pokeball-container">
            <img
              src={ballType === 'ultra' ? ultraballIcon : pokeballIcon}
              alt={ballType === 'ultra' ? 'Ultra Ball' : 'Poké Ball'}
              className={`pokeball ${throwing ? 'pokeball-throw' : ''}`}
            />
            <div className="center-button"></div>
          </div>
        </div>

        {!throwing && (
          <button onClick={handleLanzar}>
            Lanzar {ballType === 'ultra' ? 'Ultra Ball' : 'Poké Ball'}
          </button>
        )}
      </div>
    </div>
  );
}

