import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions"

const firebaseConfig = {
  apiKey: "AIzaSyDal8-pYCVDPzK7CM7GHKY7iBscnE2HWJo",
  authDomain: "mfactory-68974.firebaseapp.com",
  projectId: "mfactory-68974",
  storageBucket: "mfactory-68974.appspot.com",
  messagingSenderId: "991783660349",
  appId: "1:991783660349:web:59b46bd9c088c17b693354",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth();
const db = getFirestore();
const functions = getFunctions(app)

connectAuthEmulator(auth, "http://127.0.0.1:9099");
connectFirestoreEmulator(db, "localhost", 8080);
connectFunctionsEmulator(functions, "localhost", 5001)

export { auth, db, functions };
