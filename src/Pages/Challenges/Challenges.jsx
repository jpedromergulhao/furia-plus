import React, { useEffect, useState } from "react";
import "./Challenges.css";
import { useSelector, useDispatch } from "react-redux";
import { db } from "../../firebase"; 
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import dayjs from "dayjs";
import { setUser } from "../../slices/userSlice";
import { allChallenges } from '../../utils/challenges';
import { increment } from "firebase/firestore";


function Challenges() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    if (user.id) {
      getDoc(doc(db, "users", user.id)).then((docSnap) => {
        if (docSnap.exists()) {
          setCompleted(docSnap.data().completedChallenges || []);
        }
      });
    }
  }, [user.id]);

  const handleComplete = async (challenge) => {
    if (!user.id || completed.includes(challenge.id)) return;
  
    const userRef = doc(db, "users", user.id);
  
    try {
      await updateDoc(userRef, {
        furias: increment(challenge.furias),
        completedChallenges: arrayUnion(challenge.id),
      });
  
      const updatedSnap = await getDoc(userRef);
      dispatch(setUser({
        ...user,
        furias: updatedSnap.data().furias,
      }));
  
      setCompleted((prev) => [...prev, challenge.id]);
    } catch (err) {
      console.error("Erro ao completar desafio:", err);
    }
  };

  return (
    <div className="challenges-container">
      <h2>Desafios Ativos</h2>
      <div className="challenges-grid">
        {allChallenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`challenge-card ${completed.includes(challenge.id) ? "completed" : ""}`}
            data-aos="fade-right"
          >
            <h3>{challenge.title}</h3>
            <p>{challenge.description}</p>
            <span className="furia-points">+{challenge.furias} ⚡</span>
            <button
              onClick={() => handleComplete(challenge)}
              disabled={completed.includes(challenge.id)}
            >
              {completed.includes(challenge.id) ? "Concluído" : "Concluir"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Challenges;
