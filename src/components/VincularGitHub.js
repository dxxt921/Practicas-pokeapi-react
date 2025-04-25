import React from 'react';
import { auth, githubProvider } from '../firebase';
import { linkWithPopup } from 'firebase/auth';

function VincularGitHub() {
  const handleLink = async () => {
    if (!auth.currentUser) return;
    try {
      await linkWithPopup(auth.currentUser, githubProvider);
      alert('¡Cuenta de GitHub vinculada exitosamente! 🎉');
    } catch (error) {
      console.error(error);
      alert('Error al vincular GitHub: ' + error.message);
    }
  };

  return (
    <button
      className="github-icon"
      onClick={handleLink}
      title="Vincular GitHub"
      aria-label="Vincular cuenta de GitHub"
    >
      {/* Icono de GitHub */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.44 9.8 8.207 11.387.6.11.793-.26.793-.577v-2.234c-3.338.726-4.033-1.61-4.033-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.085 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.996.107-.775.418-1.305.762-1.605-2.665-.304-5.467-1.333-5.467-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.019.005 2.045.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.624-5.479 5.921.43.372.823 1.103.823 2.222v3.293c0 .32.192.694.8.576C20.565 21.796 24 17.302 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    </button>
  );
}

export default VincularGitHub;

