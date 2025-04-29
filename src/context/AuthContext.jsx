import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, facebookProvider } from "../firebase"; 
import { signInWithEmailAndPassword, signOut, deleteUser, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import LoadingScreen from "../components/LoadingScreen/LoadingScreen";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Monitora o status de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Funções de login
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
  const loginWithFacebook = () => signInWithPopup(auth, facebookProvider);
  const logout = () => signOut(auth);

  // funcção para deletar a conta
  const deleteAccount = async () => {
    if (auth.currentUser) {
      try {
        await deleteUser(auth.currentUser);
        setUser(null);
      } catch (error) {
        console.error("Erro ao deletar conta:", error);
        alert("Houve um erro ao deletar a sua conta, tente novamente")
        throw error; 
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, loginWithFacebook, logout, deleteAccount }}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );  
}

// Hook para usar o contexto
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }
    return context;
  }
  
