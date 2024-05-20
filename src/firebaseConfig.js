import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Importa getFirestore

const firebaseConfig = {
    apiKey: "AIzaSyAhWcbw4XfuSy64Oci2N_FEJu2NEOLfDkY",
    authDomain: "comercio-1d5e9.firebaseapp.com",
    projectId: "comercio-1d5e9",
    storageBucket: "comercio-1d5e9.appspot.com",
    messagingSenderId: "377310177753",
    appId: "1:377310177753:web:447071ced5ac82918711c8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app); // Inicializa el módulo de Firestore

export { app, auth, firestore }; // Exporta la variable 'app', 'auth' y 'firestore'
