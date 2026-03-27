// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqQlKrgzEkIE5n2HR5pXR85A5TQVXNvvw",
  authDomain: "projeto-gestorbarbearia.firebaseapp.com",
  projectId: "projeto-gestorbarbearia",
  storageBucket: "projeto-gestorbarbearia.firebasestorage.app",
  messagingSenderId: "733060841611",
  appId: "1:733060841611:web:c14dc69fb614161522548e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);


