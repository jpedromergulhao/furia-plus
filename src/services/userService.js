import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const updateUserFurias = async (userId, newFurias) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { furias: newFurias });
    console.log("Saldo de fúrias atualizado com sucesso.");
  } catch (error) {
    console.error("Erro ao atualizar fúrias:", error);
  }
};