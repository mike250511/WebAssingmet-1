// fireBaseConfig.js 
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyDt3yMm5fJIK6iYLvkEjr5LuQOpaGaGLw8",
    authDomain: "booklog-2f147.firebaseapp.com",
    projectId: "booklog-2f147",
    storageBucket: "booklog-2f147.firebasestorage.app",
    messagingSenderId: "146206631513",
    appId: "1:146206631513:web:10769ec8bebdc1ca2f7348",
    measurementId: "G-BDYR402VXB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log("fireBaseConfig.js file initialized");