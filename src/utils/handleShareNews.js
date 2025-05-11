import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";
import { setFurias } from "../slices/userSlice";

// Função para lidar com o compartilhamento
export const handleShareNews = async ({ userId, newsId, dispatch, addFuriaPoints }) => {
  try {
    const sharedRef = doc(db, "sharedNews", `${userId}_${newsId}`);
    const userRef = doc(db, "users", userId);
    const sharedDoc = await getDoc(sharedRef);

    // Soma a recompensa penas se o usuário não tiver compartilhado a notícia anteriormente
    if (!sharedDoc.exists()) {
      // Marca como compartilhado no Firestore
      await setDoc(sharedRef, {
        userId,
        newsId,
        timestamp: Date.now(),
      });

      // Adiciona +2 furias
      try {
        // Adiciona no firebase
        await updateDoc(userRef, {
          furias: increment(2),
        });

        // Pega os dados atualizados do usuário
        const updatedSnap = await getDoc(userRef);
        
        // Set a quantidade de furias de acordo com os dados atuais do firebase
        dispatch(setFurias(updatedSnap.data().furias));

      } catch (err) {
        console.error("Erro ao incrementar as furias:", err);
      }

      if (addFuriaPoints) addFuriaPoints();
    }

  } catch (error) {
    console.error("Erro ao compartilhar notícia:", error);
  }
};
