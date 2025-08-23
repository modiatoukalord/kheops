// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBszUJS1QdD3c2BVnH5HQZ9a-16NVHOBR4",
  authDomain: "kheops-hub.firebaseapp.com",
  projectId: "kheops-hub",
  storageBucket: "kheops-hub.appspot.com",
  messagingSenderId: "444707922937",
  appId: "1:444707922937:web:9a1f03c413e0f8b1995328"
};


// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export { app };
