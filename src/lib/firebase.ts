
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForInitialSetup",
  authDomain: "monochrome-mobile.firebaseapp.com",
  projectId: "monochrome-mobile",
  storageBucket: "monochrome-mobile.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
