import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { setUser } from "../slices/userSlice";

// Função para lidar com o compartilhamento
export const handleShareNews = async ({ userId, newsId, dispatch, user, addFuriaPoints }) => {
  try {
    const sharedRef = doc(db, "sharedNews", `${userId}_${newsId}`);
    const sharedDoc = await getDoc(sharedRef);

    if (!sharedDoc.exists()) {
      // Marca como compartilhado no Firestore
      await setDoc(sharedRef, {
        userId,
        newsId,
        timestamp: Date.now(),
      });

      // Adiciona +2 furias
      const updatedUser = {
        ...user,
        furias: user.furias + 2,
      };

      dispatch(setUser(updatedUser));
      if (addFuriaPoints) addFuriaPoints(); 
    }
  } catch (error) {
    console.error("Erro ao compartilhar notícia:", error);
  }
};
