// src/components/GlobalLeaderboard.js
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import './GlobalLeaderboard.css';

const GlobalLeaderboard = () => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'scores'),
      orderBy('score', 'desc'),
      limit(5)
    );
    const unsub = onSnapshot(q, snap => {
      setScores(snap.docs.map(d => d.data().score));
    });
    return () => unsub();
  }, []);

  return (
    <div className="leaderboard-window">
      <h3>🏆 Top Global</h3>
      <ol>
        {scores.map((s, i) => (
          <li key={i}>{s} pts</li>
        ))}
      </ol>
    </div>
  );
};

export default GlobalLeaderboard;

