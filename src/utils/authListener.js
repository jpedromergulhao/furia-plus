import { getAuth, onAuthStateChanged } from "firebase/auth";
import { store } from "../redux/store"; 
import { setUser, logoutUser } from "../slices/userSlice";
import defaultProfilePic from '../assets/user-icon.svg';

const auth = getAuth();

onAuthStateChanged(auth, (user) => { // Pega o nome e sobrenome do usuário
  if (user) {
    const fullName = user.displayName || "";
    const [firstName, surname] = fullName.trim().split(" ").reduce(
      (acc, part, idx) => {
        if (idx === 0) acc[0] = part;
        else acc[1] += `${acc[1] ? " " : ""}${part}`;
        return acc;
      },
      ["", ""]
    );

    store.dispatch(setUser({
      firstName,
      surname,
      email: user.email,
      id: user.uid,
      profilePic: user.photoURL || defaultProfilePic,
    }));
    
  } else {
    store.dispatch(logoutUser());
  }
});
