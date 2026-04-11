import { db } from "../firebaseConfig";
import { ref, push } from "firebase/database";

let NODOS_MOCK = [
  { id: "HID-VZ-001", nombre: "Canal Ixmiquilpan Centro", lat: 20.4833, lng: -99.2167 },
  { id: "HID-VZ-002", nombre: "Canal Tlaxcoapan Sur", lat: 20.0931, lng: -99.2214 },
  { id: "HID-VZ-003", nombre: "Riego Actopan Norte", lat: 20.2681, lng: -98.9447 }
];

export const seedMockData = () => {
  NODOS_MOCK.forEach((nodo) => {
    const timestamp = Date.now();
    
    // Simulating movement (very slight changes in coordinates)
    nodo.lat += (Math.random() - 0.5) * 0.005;
    nodo.lng += (Math.random() - 0.5) * 0.005;

    const nuevaLectura = {
      nombre: nodo.nombre,
      ph: parseFloat((Math.random() * (8.5 - 6.0) + 6.0).toFixed(2)),
      ce: parseFloat((Math.random() * (3.0 - 0.5) + 0.5).toFixed(2)),
      temp: parseFloat((Math.random() * (26 - 18) + 18).toFixed(1)),
      turbidez: Math.floor(Math.random() * 200),
      lat: parseFloat(nodo.lat.toFixed(5)),
      lng: parseFloat(nodo.lng.toFixed(5)),
      timestamp: timestamp
    };

    const historialRef = ref(db, `historial/${nodo.id}`);
    push(historialRef, nuevaLectura);
  });
};
