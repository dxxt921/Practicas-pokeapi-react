import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUX9etS5Qhw66TtJTGb0cavc3cmhJTEts",
  authDomain: "mi-proyecto-f7ede.firebaseapp.com",
  projectId: "mi-proyecto-f7ede",
  storageBucket: "mi-proyecto-f7ede.firebasestorage.app",
  messagingSenderId: "620023104741",
  appId: "1:620023104741:web:bbc635500147216950800c",
  measurementId: "G-FYHYF5Q3X9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
