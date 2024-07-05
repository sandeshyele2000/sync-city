import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyA6HR73qqyEK1QIPuKiEOXhxaL6eo2bhZU",
  authDomain: "sync-city-93e1d.firebaseapp.com",
  projectId: "sync-city-93e1d",
  storageBucket: "sync-city-93e1d.appspot.com",
  messagingSenderId: "51610402944",
  appId: "1:51610402944:web:c17df5c4612d4fd9a5a665",
  measurementId: "G-C9EP21GFCZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth} ;