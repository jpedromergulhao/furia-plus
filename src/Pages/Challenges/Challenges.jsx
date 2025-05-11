import React, { useEffect, useState } from "react";
import "./Challenges.css";
import { useSelector, useDispatch } from "react-redux";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  increment
} from "firebase/firestore";
import { setFurias } from "../../slices/userSlice";
import { allChallenges } from '../../utils/challenges';
import { Link, useNavigate } from "react-router-dom";


function Challenges() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [completed, setCompleted] = useState([]);
  const navigate = useNavigate();

  // Monta os desafios concluidos
  useEffect(() => {
    if (user.id) {
      getDoc(doc(db, "users", user.id)).then((docSnap) => {
        if (docSnap.exists()) {
          setCompleted(docSnap.data().completedChallenges || []);
        }
      });
    }
  }, [user.id]);

  // Função para lidar com a atualização dos desafios e furias no firestore e redux
  const handleUpdate = async (userRef, challenge) => {

    try { //Atualiza a quantidade de furias e os desafios completados no firebase
      await updateDoc(userRef, {
        furias: increment(challenge.furias),
        completedChallenges: arrayUnion(challenge.id),
      });

      // Atualiza a quantidade de furias no redux de acordo com o firebase
      const updatedSnap = await getDoc(userRef);
      dispatch(setFurias(updatedSnap.data().furias));

      setCompleted((prev) => [...prev, challenge.id]);
    } catch (err) {
      console.error("Erro ao completar desafio:", err);
    }

  }

  const handleComplete = async (challenge) => {
    if (!user.id || completed.includes(challenge.id)) return;

    const userRef = doc(db, "users", user.id);

    // Verifica se o desafio tem algum link
    if (challenge.link) {

      // Verifica se é um link externo
      if (/^https?:\/\//.test(challenge.link)) {
        await handleUpdate(userRef, challenge);

        // Redireciona o usuário
        window.open(challenge.link, "_blank", "noopener noreferrer");

      } else {
        try { //Atualiza os desafios completados no firebase
          await updateDoc(userRef, {
            completedChallenges: arrayUnion(challenge.id),
          });

          setCompleted((prev) => [...prev, challenge.id]);

          // Redireciona o usuário
          navigate(challenge.link);
        } catch (err) {
          console.error("Erro ao completar desafio:", err);
        }
      }
    } else {
      await handleUpdate(userRef, challenge);
    }

  };

  return (
    <div className="challenges-container">
      <h2>Desafios Ativos</h2>
      <Link to='/quizzes'>
        Ver Quizzes
      </Link>
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
