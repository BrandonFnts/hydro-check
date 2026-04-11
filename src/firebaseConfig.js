import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAo83elT2Rk-WjW4VQZOpYDniaHg_0H-jU",
  authDomain: "hydro-check-eb288.firebaseapp.com",
  databaseURL: "https://hydro-check-eb288-default-rtdb.firebaseio.com",
  projectId: "hydro-check-eb288",
  storageBucket: "hydro-check-eb288.firebasestorage.app",
  messagingSenderId: "26913487637",
  appId: "1:26913487637:web:5baaf88b934fa10a49471c",
  measurementId: "G-K6LX4MCEJY"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
