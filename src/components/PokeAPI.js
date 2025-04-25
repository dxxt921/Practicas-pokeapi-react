// src/components/PokeAPI.js
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  addDoc,
  query,
  where,
  doc,
  deleteDoc,
  onSnapshot,
  setDoc,
  getDoc,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import './PokeAPI.css';
import { toast } from 'react-toastify';
import PokeballCounter from './PokeballCounter';
import PokemonSearch from './PokemonSearch';
import ultraballIcon from '../assets/ultraball.png';

/***************************************************
 * Componente MinimalAudio (sin cambios)
 ***************************************************/
function MinimalAudio({ audioUrl }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audioElem = audioRef.current;
    if (!audioElem) return;
    const handleEnded = () => setIsPlaying(false);
    audioElem.addEventListener('ended', handleEnded);
    return () => audioElem.removeEventListener('ended', handleEnded);
  }, []);

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="minimal-audio">
      <audio ref={audioRef} src={audioUrl} />
      <button onClick={handleTogglePlay}>
        {isPlaying ? '⏸️' : '▶️'}
      </button>
    </div>
  );
}

/***************************************************
 * Componente CaptureModal (sin cambios)
 ***************************************************/
function CaptureModal({
  pokemon,
  onClose,
  ballType = 'poke',
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

         {ballType === 'ultra' ? (
           <img
             src={ultraballIcon}
             alt="Ultra Ball"
             className={`ultraball ${throwing ? 'ultraball-throw' : ''}`}
           />
         ) : (
           <div className={`pokeball ${throwing ? 'pokeball-throw' : ''}`}>
             <div className="center-button"></div>
           </div>
         )}
        </div>

        {!throwing && (
          <button onClick={handleLanzar} style={{ marginTop: 15 }}>
            Lanzar {ballType === 'ultra' ? 'Ultra Ball' : 'Poké Ball'}
          </button>
        )}
      </div>
    </div>
  );
}
/***************************************************
 * Componente Principal: PokeAPI
 ***************************************************/
const PokeAPI = ({ usuario }) => {
  /* estados originales */
  const [pokemon, setPokemon] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const [recientes, setRecientes] = useState([]);

  /* captura */
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [pokemonToCapture, setPokemonToCapture] = useState(null);

  /* inventario */
  const [pokebolas, setPokebolas] = useState(0);
  const [ultraballs, setUltraballs] = useState(0);
  const [ballType, setBallType] = useState('poke');
  const [berryUsed, setBerryUsed] = useState(false);

  /* buscador */
  const [searchTerm, setSearchTerm] = useState('');

  /***************************************************
   * 0) Inventario en vivo (Poké + Ultra)
   ***************************************************/
  
  useEffect(() => {
    if (!usuario) return;
    const ref = doc(db, 'pokebolas', usuario.uid);
    let unsub;

    // 1) inicialización condicional
    getDoc(ref)
      .then(snap => {
        if (!snap.exists()) {
        }
      })
      .catch(console.error)
      .finally(() => {
        // 2) suscripción en vivo
        unsub = onSnapshot(
          ref,
          snap => {
            const data = snap.data() || {};
            setPokebolas(data.pokebolas ?? 0);
            setUltraballs(data.ultraballs ?? 0);
          },
          err => {
            console.error('Error en onSnapshot pokebolas:', err);
          }
        );
      });

    return () => {
      if (unsub) unsub();
    };
  }, [usuario]);

  /***************************************************
   * 1) Favoritos en vivo
   ***************************************************/
  useEffect(() => {
    if (!usuario) return;
    const q = query(
      collection(db, 'favoritos'),
      where('user_id', '==', usuario.uid)
    );
    const unsub = onSnapshot(q, snap => {
      setFavoritos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => {
      console.error('Error suscribiendo favoritos:', err);
      toast.error('No se pudo cargar favoritos en vivo');
    });
    return () => unsub();
  }, [usuario]);

  /***************************************************
   * 2) Búsqueda avanzada
   ***************************************************/
  useEffect(() => {
    if (!searchTerm) return;
    (async () => {
      try {
        const res = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPokemon({
          nombre: data.name,
          id: data.id,
          imagen: data.sprites.front_default,
          tipos: data.types.map(t => t.type.name),
          habilidades: data.abilities.map(h => h.ability.name),
          base_experience: data.base_experience,
          height: data.height,
          weight: data.weight,
          stats: JSON.stringify(data.stats),
          cries: JSON.stringify(data.cries || {}),
          held_items: JSON.stringify(data.held_items),
          moves: JSON.stringify(data.moves),
          sprites: JSON.stringify(data.sprites),
          game_indices: JSON.stringify(data.game_indices),
          forms: JSON.stringify(data.forms),
          species: JSON.stringify(data.species),
          pokemon_data: data
        });
        setRecientes([]); // limpia recientes al buscar
      } catch {
        toast.error('No se encontró ese Pokémon.');
      }
    })();
  }, [searchTerm]);

  /***************************************************
   * 3) Obtener Pokémon aleatorio
   ***************************************************/
  const obtenerPokemonAleatorio = async () => {
    try {
      const idAleatorio = Math.floor(Math.random() * 1010) + 1;
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${idAleatorio}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPokemon({
        nombre: data.name,
        id: data.id,
        imagen: data.sprites.front_default,
        tipos: data.types.map(t => t.type.name),
        habilidades: data.abilities.map(h => h.ability.name),
        base_experience: data.base_experience,
        height: data.height,
        weight: data.weight,
        stats: JSON.stringify(data.stats),
        cries: JSON.stringify(data.cries || {}),
        held_items: JSON.stringify(data.held_items),
        moves: JSON.stringify(data.moves),
        sprites: JSON.stringify(data.sprites),
        game_indices: JSON.stringify(data.game_indices),
        forms: JSON.stringify(data.forms),
        species: JSON.stringify(data.species),
        pokemon_data: data
      });
    } catch {
      toast.error('No se pudo cargar el Pokémon.');
    }
  };
  useEffect(() => {
    obtenerPokemonAleatorio();
  }, []);

  /***************************************************
   * 4) Agregar a favoritos
   ***************************************************/
  const agregarAFavoritosPokemon = async poke => {
    if (!poke || !usuario) return;
    try {
      await addDoc(collection(db, 'favoritos'), {
        nombre: poke.nombre,
        tipo: poke.tipos.join(', '),
        habilidades: poke.habilidades.join(', '),
        imagen: poke.imagen,
        user_id: usuario.uid,
        base_experience: poke.base_experience,
        height: poke.height,
        weight: poke.weight,
        stats: poke.stats,
        cries: poke.cries,
        held_items: poke.held_items,
        moves: poke.moves,
        sprites: poke.sprites,
        game_indices: poke.game_indices,
        forms: poke.forms,
        species: poke.species,
        pokemon_data: poke.pokemon_data
      });
      toast.success(`${poke.nombre} agregado a favoritos`);
    } catch {
      toast.error('No se pudo guardar el favorito');
    }
  };

  /***************************************************
   * 5) Remover favorito
   ***************************************************/
  const removeFavorite = async id => {
    try {
      await deleteDoc(doc(db, 'favoritos', id));
      toast.success('Eliminado de favoritos');
    } catch {
      toast.error('Error eliminando favorito');
    }
  };

  /***************************************************
   * 6) Historial de recientes
   ***************************************************/
  const verSiguientePokemon = () => {
    if (pokemon) {
      setRecientes(prev => [pokemon, ...prev].slice(0, 3));
    }
    obtenerPokemonAleatorio();
  };

  /***************************************************
   * 7) Consumir Poké/Ultra Ball
   ***************************************************/
  const consumePokeball = async () => {
    const campo = ballType === 'poke' ? 'pokebolas' : 'ultraballs';
    const cuenta = ballType === 'poke' ? pokebolas : ultraballs;
    if (cuenta <= 0) {
      toast.error(`¡No tienes ${ballType === 'poke' ? 'Poké' : 'Ultra'} Balls!`);
      return false;
    }
    await setDoc(
      doc(db, 'pokebolas', usuario.uid),
      { [campo]: increment(-1) },
      { merge: true }
    );
    return true;
  };

  /***************************************************
   * 8) Manejo de captura
   ***************************************************/
  const handleCapturaClick = poke => {
    if (
      (ballType === 'poke' && pokebolas <= 0) ||
      (ballType === 'ultra' && ultraballs <= 0)
    ) {
      toast.error('Sin bolas disponibles');
      return;
    }
    setPokemonToCapture(poke);
    setShowCaptureModal(true);
  };

  const onCaptureResult = success => {
    setShowCaptureModal(false);
    if (success && pokemonToCapture) {
      agregarAFavoritosPokemon(pokemonToCapture);
      toast.success(`¡Capturaste a ${pokemonToCapture.nombre}!`);
    } else {
      toast.error(`${pokemonToCapture?.nombre} escapó…`);
    }
    setBerryUsed(false);
    setPokemonToCapture(null);
  };

  /***************************************************
   * Renderizado
   ***************************************************/
  return (
    <div className="contenedor-formulario battlefield-bg">
      {/* Buscador Avanzado */}
      {usuario && (
        <div style={{ marginBottom: 10 }}>
          <PokemonSearch onSelect={name => setSearchTerm(name)} />
        </div>
      )}

      <h1 className="titulo">Pokémon Aleatorio</h1>

      {/* Contador de bolas */}
      {usuario && <PokeballCounter userId={usuario.uid} />}

      {/* Controles */}
      <div style={{ margin: '10px 0' }}>
        <button className="boton" onClick={verSiguientePokemon}>
          Ver siguiente
        </button>
        <button
          className="boton"
          onClick={() =>
            setBallType(bt => (bt === 'poke' ? 'ultra' : 'poke'))
          }
          style={{ background: ballType === 'ultra' ? '#ffb347' : undefined }}
        >
          Cambiar a {ballType === 'poke' ? 'Ultra Ball' : 'Poké Ball'}
        </button>
        <button
          className="boton"
          onClick={() => setBerryUsed(true)}
          disabled={berryUsed}
        >
          {berryUsed ? 'Baya usada' : 'Usar Baya Frambu'}
        </button>
      </div>

      {/* Pokémon actual */}
      {pokemon && (
        <div style={{ marginTop: 20 }}>
          <h2>
            #{pokemon.id} {pokemon.nombre.toUpperCase()}
          </h2>
          <img src={pokemon.imagen} alt={pokemon.nombre} />
          <p>
            <strong>Tipo(s):</strong> {pokemon.tipos.join(', ')}
          </p>
          <p>
            <strong>Habilidades:</strong> {pokemon.habilidades.join(', ')}
          </p>
          <p>
            <strong>Exp. base:</strong> {pokemon.base_experience}
          </p>
          <p>
            <strong>Altura:</strong> {pokemon.height}
          </p>
          <p>
            <strong>Peso:</strong> {pokemon.weight}
          </p>
          <p>
            <strong>Estadísticas:</strong>
          </p>
          <ul>
            {JSON.parse(pokemon.stats).map((st, i) => (
              <li key={i}>
                {st.stat.name.toUpperCase()}: {st.base_stat}
              </li>
            ))}
          </ul>
          <p>
            <strong>Sonido:</strong>
          </p>
          <MinimalAudio audioUrl={JSON.parse(pokemon.cries).latest || ''} />
          <p>
            <strong>Movimientos:</strong>{' '}
            {JSON.parse(pokemon.moves)
              .slice(0, 5)
              .map(m => m.move.name)
              .join(', ')}
            ...
          </p>
          <p>
            <strong>Ítems que puede sostener:</strong>{' '}
            {JSON.parse(pokemon.held_items).length > 0
              ? JSON.parse(pokemon.held_items)
                  .map(it => it.item.name)
                  .join(', ')
              : 'Ninguno'}
          </p>
          <button
            className="boton"
            onClick={() => handleCapturaClick(pokemon)}
            style={{ marginTop: 10 }}
          >
            Agregar a favoritos
          </button>
        </div>
      )}

      {/* Recientes */}
      {recientes.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h2>Últimos Pokémon vistos</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            {recientes.map((poke, idx) => (
              <div
                key={idx}
                style={{ border: '1px solid #ccc', padding: 10 }}
              >
                <h3>
                  #{poke.id} {poke.nombre.toUpperCase()}
                </h3>
                <img src={poke.imagen} alt={poke.nombre} width="80" />
                <MinimalAudio audioUrl={JSON.parse(poke.cries).latest || ''} />
                <button
                  className="boton"
                  onClick={() => handleCapturaClick(poke)}
                >
                  Capturar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ver favoritos */}
      <button
        className="boton"
        onClick={() => setMostrarFavoritos(true)}
        style={{ marginTop: 20 }}
      >
        Ver favoritos
      </button>
      {mostrarFavoritos && (
        <div style={{ marginTop: 20 }}>
          <h2>Favoritos</h2>
          <div className="favoritos-container">
            {favoritos.map(fav => {
              const stats = JSON.parse(fav.stats);
              const cries = JSON.parse(fav.cries);
              const moves = JSON.parse(fav.moves);
              const items = JSON.parse(fav.held_items);
              return (
                <div key={fav.id} className="pokedex-card-fav">
                  <button
                    className="eliminar-btn"
                    onClick={() => removeFavorite(fav.id)}
                  >
                    ✖
                  </button>
                  <h3>{fav.nombre.toUpperCase()}</h3>
                  <img src={fav.imagen} alt={fav.nombre} width="100" />
                  <p>
                    <strong>Tipo(s):</strong> {fav.tipo}
                  </p>
                  <p>
                    <strong>Habilidades:</strong> {fav.habilidades}
                  </p>
                  <p>
                    <strong>Exp. base:</strong> {fav.base_experience}
                  </p>
                  <p>
                    <strong>Altura:</strong> {fav.height}
                  </p>
                  <p>
                    <strong>Peso:</strong> {fav.weight}
                  </p>
                  <p>
                    <strong>Estadísticas:</strong>
                  </p>
                  <ul>
                    {stats.map((st, i) => (
                      <li key={i}>
                        {st.stat.name.toUpperCase()}: {st.base_stat}
                      </li>
                    ))}
                  </ul>
                  <p>
                    <strong>Sonido:</strong>
                  </p>
                  <MinimalAudio audioUrl={cries.latest || ''} />
                  <p>
                    <strong>Movimientos:</strong>{' '}
                    {moves
                      .slice(0, 5)
                      .map(m => m.move.name)
                      .join(', ')}
                    ...
                  </p>
                  <p>
                    <strong>Ítems:</strong>{' '}
                    {items.length > 0 ? items.map(it => it.item.name).join(', ') : 'Ninguno'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de captura */}
      {showCaptureModal && (
        <CaptureModal
          pokemon={pokemonToCapture}
          onClose={onCaptureResult}
          ballType={ballType}
          berryUsed={berryUsed}
          consumePokeball={consumePokeball}
        />
      )}
    </div>
  );
};

export default PokeAPI;








