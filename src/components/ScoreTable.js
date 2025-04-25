import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

const ScoreTable = ({ usuario }) => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    if (!usuario) return;

    const q = query(
      collection(db, 'scores'),
      where('user_id', '==', usuario.uid),
      orderBy('timestamp', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setScores(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, [usuario]);

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={th}>Puntuación</th>
          <th style={th}>Fecha</th>
        </tr>
      </thead>
      <tbody>
        {scores.map((s) => (
          <tr key={s.id}>
            <td style={td}>{s.score}</td>
            <td style={td}>
              {s.timestamp ? s.timestamp.toDate().toLocaleString() : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const th = { borderBottom: '2px solid #999', padding: 6 };
const td = { borderBottom: '1px solid #ccc', padding: 6 };

export default ScoreTable;




