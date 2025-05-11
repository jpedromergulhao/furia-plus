import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setFurias } from "../../slices/userSlice";
import { QUESTIONS } from "../../utils/questions";
import './FuriaQuiz.css';
import { getDoc, runTransaction } from "firebase/firestore";
import Loader from "../Loader/Loader";

const SCORE_RULES = {
    easy: [0, 6, 6, 6, 10, 10],
    moderate: [0, 0, 6, 10, 10, 15],
    hard: [0, 0, 10, 15, 15, 20]
};

function FuriaQuiz({ userRef, level }) {
    const dispatch = useDispatch();
    const QUIZ_TIME_LIMIT = 30;

    const [questions, setQuestions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [correctCount, setCorrectCount] = useState(0);
    const [finished, setFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_LIMIT);
    const [canEarnPoints, setCanEarnPoints] = useState(true);
    const [countdown, setCountdown] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [started, setStarted] = useState(false);
    const [lastQuizTimestamp, setLastQuizTimestamp] = useState(null);
    const intervalRef = useRef(null);

    const finishQuiz = useCallback(async (lastQuizTimestamp) => {
        setFinished(true);
        const score = SCORE_RULES[level][correctCount];
        const now = Date.now();
        const THREE_HOURS = 3 * 60 * 60 * 1000;

        // Se já passou três horas desde o último quizz, soma as furias ao saldo do usuário
        if (!lastQuizTimestamp || now - lastQuizTimestamp >= THREE_HOURS) {
            if (score > 0) {
                setIsProcessing(true);
                try {
                    //Atualiza a quantidade de furias no firebase
                    await runTransaction(userRef.firestore, async (transaction) => {
                        const userSnap = await transaction.get(userRef);
                        const currentFurias = userSnap.data().furias || 0;

                        transaction.update(userRef, {
                            furias: currentFurias + score,
                            lastQuizTimestamp: now
                        });
                    });

                    // Atualiza a quantidade de furias no redux de acordo com o firebase
                    const updatedSnap = await getDoc(userRef);
                    dispatch(setFurias(updatedSnap.data().furias));

                } catch (err) {
                    console.error("Erro ao incrementar furias do quizz:", err);
                }
                setIsProcessing(false);
            }
        }
    }, [level, correctCount, dispatch, userRef]);

    useEffect(() => {
        const fetchData = async () => {
            if (questions.length === 0 && !started) {
                setQuestions([]);
            }

            const userSnap = await getDoc(userRef);
            const lastTimestamp = userSnap.data()?.lastQuizTimestamp;
            setLastQuizTimestamp(lastTimestamp);
            const now = Date.now();
            const THREE_HOURS = 3 * 60 * 60 * 1000;

            if (lastTimestamp && now - lastTimestamp < THREE_HOURS) {
                const remaining = THREE_HOURS - (now - lastTimestamp);
                setCanEarnPoints(false);
                setCountdown(remaining);
            }
        };

        fetchData();
    }, [level, userRef, questions.length, started]);

    useEffect(() => {
        if (!canEarnPoints && countdown > 0 && !intervalRef.current) {
            intervalRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1000) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                        setCanEarnPoints(true);
                        return 0;
                    }
                    return prev - 1000;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [canEarnPoints, countdown]);

    useEffect(() => {
        if (!finished && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft <= 0) {
            finishQuiz(lastQuizTimestamp);
        }
    }, [timeLeft, finished, lastQuizTimestamp, finishQuiz]);

    // função para gerar as questões do quiz
    const generateRandomQuestions = () => {
        const shuffled = [...QUESTIONS[level]].sort(() => 0.5 - Math.random()).slice(0, 5);
        setQuestions(shuffled);
        setCurrent(0);
        setSelected(null);
        setCorrectCount(0);
        setFinished(false);
        setTimeLeft(30);
        setStarted(true);
    };

    const handleAnswer = (option) => {
        setSelected(option);
        if (option === questions[current].answer) {
            setCorrectCount(prev => prev + 1);
        }

        setTimeout(() => {
            if (current + 1 < questions.length) {
                setCurrent(prev => prev + 1);
                setSelected(null);
            } else {
                finishQuiz(lastQuizTimestamp);
            }
        }, 1000);
    };

    const resetQuiz = () => {
        setQuestions([]);
        setStarted(false);
    };

    const formatCountdown = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours}h ${minutes}m ${seconds}s`;
    };

    const quizLevel = (level) => {
        let currentLevel = "";

        switch (level) {
            case "easy":
                currentLevel = "fácil";
                break;
            case "moderate":
                currentLevel = "moderado";
                break;
            case "hard":
                currentLevel = "difícil";
                break;
            default:
                currentLevel = level;
        }

        return currentLevel;
    }

    if (!started) {
        const SCORE = SCORE_RULES[level];
        const LOWER_SCORE = SCORE[0];
        const MAX_SCORE = SCORE[SCORE.length - 1];

        return (
            <div className="quiz-start">
                <p>
                    Você terá <strong>30s</strong> para responder <strong>5 perguntas</strong> de nível <strong>{quizLevel(level)}</strong>.
                </p>
                <p>
                    A pontuação para esse quiz vai de <strong>{LOWER_SCORE}</strong> à <strong>{MAX_SCORE}</strong>.
                </p>
                <h3>Boa sorte!</h3>
                <button className="retry-button" onClick={generateRandomQuestions}>Começar Quiz</button>
            </div>
        );
    }

    if (finished) {
        const timeTaken = Math.max(0, 30 - timeLeft);
        return (
            <div className="quiz-results">
                <h2>Quiz finalizado!</h2>
                <p>Acertos: <strong>{correctCount}/5</strong></p>
                <p>Tempo total: <strong>{timeTaken}s</strong></p>

                {canEarnPoints && (
                    <p>Furias ganhas: <strong>{SCORE_RULES[level][correctCount]}</strong></p>
                )}

                {!canEarnPoints && (
                    <p className="countdown-message">
                        ⚠️ Para somar pontos, tente novamente em: <strong>{formatCountdown(countdown)}</strong>
                    </p>
                )}

                <button onClick={resetQuiz} className="retry-button">Tentar novamente</button>
            </div>
        );
    }

    if (!questions.length) return <Loader />;

    return (
        <div className="furia-quiz">
            <div className="timer">Tempo restante: {timeLeft}s</div>
            <h3>{questions[current].question}</h3>
            <div className="options">
                {questions[current].options.map((option, idx) => (
                    <button
                        key={idx}
                        className={`option-button ${selected === option ? (option === questions[current].answer ? 'correct' : 'wrong') : ''}`}
                        onClick={() => handleAnswer(option)}
                        disabled={!!selected}
                    >
                        {option}
                    </button>
                ))}
            </div>

            {isProcessing && <Loader />}
        </div>
    );
}

export default FuriaQuiz;
