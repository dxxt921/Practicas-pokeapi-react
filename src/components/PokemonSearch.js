// src/components/PokemonSearch.js
import React, { useState, useEffect, useRef } from 'react';
import './PokemonSearch.css';
import { toast } from 'react-toastify';

const POKEMON_LIST_URL  = 'https://pokeapi.co/api/v2/pokemon?limit=100000';
const POKEMON_TYPES_URL = 'https://pokeapi.co/api/v2/type';

export default function PokemonSearch({ onSelect }) {
  const [allNames, setAllNames]             = useState([]);
  const [types, setTypes]                   = useState([]);
  const [typePool, setTypePool]             = useState([]);
  const [query, setQuery]                   = useState('');
  const [selectedType, setSelectedType]     = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [suggestions, setSuggestions]       = useState([]);
  const [preview, setPreview]               = useState(null);
  const hoverTimer = useRef(null);

  // 1) Cargo lista completa de nombres y tipos
  useEffect(() => {
    async function loadData() {
      try {
        const [namesRes, typesRes] = await Promise.all([
          fetch(POKEMON_LIST_URL),
          fetch(POKEMON_TYPES_URL)
        ]);
        const namesJson = await namesRes.json();
        const typesJson = await typesRes.json();
        setAllNames(namesJson.results.map(p => p.name));
        setTypes(typesJson.results.map(t => t.name));
      } catch (err) {
        console.error(err);
        toast.error('Error cargando nombres o tipos');
      }
    }
    loadData();
  }, []);

  // 2) Cuando cambia tipo, cargo pool específico
  useEffect(() => {
    if (!selectedType) {
      setTypePool([]);
      return;
    }
    async function loadTypePool() {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
        const data = await res.json();
        setTypePool(data.pokemon.map(p => p.pokemon.name));
      } catch (err) {
        console.error(err);
        toast.error('Error cargando pool de tipo');
        setTypePool([]);
      }
    }
    loadTypePool();
  }, [selectedType]);

  // 3) Generar sugerencias al cambiar filtros o búsqueda
  useEffect(() => {
    async function buildSuggestions() {
      // si no hay filtros ni texto, limpio
      if (!query && !selectedType && !selectedRarity) {
        setSuggestions([]);
        return;
      }

      // base pool: todo o sólo del tipo
      let pool = selectedType ? typePool : allNames;

      // filtrar por texto si existe
      if (query) {
        const q = query.toLowerCase();
        pool = pool.filter(name => name.toLowerCase().startsWith(q));
      }

      // filtrar por rareza
      if (selectedRarity) {
        const ranges = {
          common:    [0, 100],
          uncommon:  [100, 200],
          rare:      [200, 300],
          legendary: [300, Infinity]
        };
        const [min, max] = ranges[selectedRarity];
        const filtered = [];
        // checar los primeros 300
        for (let name of pool.slice(0, 300)) {
          if (filtered.length >= 8) break;
          try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            const d   = await res.json();
            if (d.base_experience >= min && d.base_experience < max) {
              filtered.push(name);
            }
          } catch {
            // ignoro errores
          }
        }
        pool = filtered;
      } else {
        // sin rareza, tomo primeros 8
        pool = pool.slice(0, 8);
      }

      setSuggestions(pool);
    }
    buildSuggestions();
  }, [query, selectedType, selectedRarity, allNames, typePool]);

  // 4) Selección de Pokémon
  const handleSelect = name => {
    onSelect(name);
    setQuery('');
    setSelectedType('');
    setSelectedRarity('');
    setSuggestions([]);
    setPreview(null);
    clearTimeout(hoverTimer.current);
  };

  // 5) Preview al hacer hover prolongado
  const handleMouseEnter = name => {
    hoverTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const d   = await res.json();
        setPreview({ name, img: d.sprites.front_default });
      } catch {
        setPreview(null);
      }
    }, 700);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimer.current);
    setPreview(null);
  };

  return (
    <div className="pokemon-search">
      <div className="filters">
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={selectedRarity}
          onChange={e => setSelectedRarity(e.target.value)}
        >
          <option value="">Todas las rarezas</option>
          <option value="common">Común</option>
          <option value="uncommon">Poco común</option>
          <option value="rare">Raro</option>
          <option value="legendary">Legendario</option>
        </select>
      </div>

      <div className="search-wrapper">
        <input
          className="search-input"
          type="text"
          placeholder="Buscar Pokémon..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoComplete="off"
        />

        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map(n => (
              <li
                key={n}
                className="suggestion-item"
                onClick={() => handleSelect(n)}
                onMouseEnter={() => handleMouseEnter(n)}
                onMouseLeave={handleMouseLeave}
              >
                {n}
              </li>
            ))}
          </ul>
        )}

        {preview && (
          <div className="preview-popup">
            <strong>{preview.name.toUpperCase()}</strong>
            <img src={preview.img} alt={preview.name} />
          </div>
        )}
      </div>
    </div>
  );
}



