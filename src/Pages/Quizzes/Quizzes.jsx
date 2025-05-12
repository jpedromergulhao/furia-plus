import React, { useEffect, useState } from "react";
import './Quizzes.css';
import UserForm from "../../components/UserForm/UserForm";
import FuriaQuiz from "../../components/FuriaQuiz/FuriaQuiz";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import Particles from "react-tsparticles";
import { loadFirePreset } from "tsparticles-preset-fire";

function Quizzes() {
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [showParticles, setShowParticles] = useState(false);
    const [userData, setUserData] = useState(null);
    const user = useSelector((state) => state.user);
    const userRef = doc(db, "users", user.id);

    useEffect(() => { // Pega os dados atuais do firebase
        const fetchUserData = async () => {
            const snap = await getDoc(userRef);
            if (snap.exists()) {
                setUserData(snap.data());
            }
        };

        fetchUserData();
    }, [userRef]);

    const handleSelect = (level) => {
        setActiveQuiz(level);
    };

    const particlesInit = async (engine) => {
        await loadFirePreset(engine);
    };

    const renderContent = () => {
        if (activeQuiz === 'personal') return <UserForm userData={userData} userRef={userRef} />;
        if (['easy', 'moderate', 'hard'].includes(activeQuiz)) {
            return <FuriaQuiz userRef={userRef} level={activeQuiz} />;
        }
        return null;
    };

    useEffect(() => {
        if (userData?.address || user.isQuizFinished) {
            setShowParticles(true)
        } else (
            setShowParticles(false)
        )
    }, [userData, activeQuiz, user.isQuizFinished])

    return (
        <>
            {showParticles && (
                <Particles
                    id="tsparticles"
                    init={particlesInit}
                    options={{
                        fullScreen: { enable: true, zIndex: 0 },
                        background: { color: "#000" },
                        particles: {
                            number: {
                                value: 20,
                            },
                            color: { value: "#410e98" },
                            shape: { type: "circle" },
                            opacity: { value: 0.6 },
                            size: { value: { min: 2, max: 4 } },
                            move: {
                                enable: true,
                                speed: 1.5,
                                direction: "top",
                                outModes: { default: "out" }
                            },
                            life: {
                                duration: { sync: false, value: 5 },
                                count: 1
                            }
                        },
                        emitters: {
                            direction: "top",
                            position: { x: 50, y: 100 },
                            rate: {
                                delay: 0.1,
                                quantity: 2
                            },
                            size: {
                                width: 100,
                                height: 0
                            }
                        }
                    }}
                />
            )}

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
        </>
    );
}

export default Quizzes;