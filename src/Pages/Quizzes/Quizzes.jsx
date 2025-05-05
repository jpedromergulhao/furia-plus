import React, { useState } from "react";
import './Quizzes.css';
import UserForm from "../../components/UserForm/UserForm";
import FuriaQuiz from "../../components/FuriaQuiz/FuriaQuiz";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function Quizzes() {
    const [activeQuiz, setActiveQuiz] = useState(null);
    const user = useSelector((state) => state.user);
    const userName = user.name?.split(" ")[0] || "FURIA Fan";

    const handleSelect = (level) => {
        setActiveQuiz(level);
    };

    const renderContent = () => {
        if (activeQuiz === 'personal') return <UserForm />;
        if (['easy', 'moderate', 'hard'].includes(activeQuiz)) {
            return <FuriaQuiz userName={userName} level={activeQuiz} />;
        }
        return null;
    };

    return (
        <div className="quizzes-container">
            <h2>Quizzes</h2>
            <span>
                Saldo atual de furias: <strong>{user.furias}</strong> ⚡️
            </span>

            {!activeQuiz && (
                <div className="quizzes">
                    <div className="quiz-options">
                        <button onClick={() => handleSelect('easy')}>Fácil</button>
                        <button onClick={() => handleSelect('moderate')}>Moderado</button>
                        <button onClick={() => handleSelect('hard')}>Difícil</button>
                        <button onClick={() => handleSelect('personal')}>Formulário Pessoal</button>
                    </div>
                    <Link to="/desafios">
                        Voltar aos desafios
                    </Link>
                </div>
            )}

            {activeQuiz && (
                <>
                    <button className="back-button" onClick={() => setActiveQuiz(null)}>Voltar</button>
                    {renderContent()}
                </>
            )}
        </div>
    );
}

export default Quizzes;