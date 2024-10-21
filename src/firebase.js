import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions"

const firebaseConfig = {
  apiKey: "AIzaSyB4LHzdT6ijbtVwNxniUcL4rwRiHbxKevU",
  authDomain: "mfactory-ede9a.firebaseapp.com",
  projectId: "mfactory-ede9a",
  storageBucket: "mfactory-ede9a.appspot.com",
  messagingSenderId: "36006178748",
  appId: "1:36006178748:web:6c096f84920481467f85b9"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth();
const db = getFirestore();
const functions = getFunctions(app)

connectAuthEmulator(auth, "http://127.0.0.1:9099");
connectFirestoreEmulator(db, "localhost", 8080);
connectFunctionsEmulator(functions, "localhost", 5001)

export { auth, db, functions };
