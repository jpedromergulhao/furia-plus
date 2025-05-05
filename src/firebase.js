import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, FacebookAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDXxY1Q9IRgwFBMQtMGqbwghUhbFw73WYA",
  authDomain: "furia-plus.firebaseapp.com",
  projectId: "furia-plus",
  storageBucket: "furia-plus.appspot.com", 
  messagingSenderId: "767988798819",
  appId: "1:767988798819:web:6542453ad69db7c28e2f56",
  measurementId: "G-G5RZSL6RJC"
};

// Inicializa o app e a autenticação
const app = initializeApp(firebaseConfig);

// Inicializa Auth
const auth = getAuth(app);

// Configura persistência local (manter login mesmo após refresh)
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("Persistência configurada: local"))
  .catch((error) => console.error("Erro ao configurar persistência:", error));

// Inicializa Firestore
const db = getFirestore(app); //

// Provedores de login
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, db, googleProvider, facebookProvider };

