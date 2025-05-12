import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setFurias, setIsQuizFinished } from "../../slices/userSlice";
import { QUESTIONS } from "../../utils/questions";
import './FuriaQuiz.css';
import { getDoc, runTransaction } from "firebase/firestore";
import Loader from "../Loader/Loader";

// Regras de pontuação conforme nível e acertos
const SCORE_RULES = {
    easy: [0, 6, 6, 6, 10, 10],
    moderate: [0, 0, 6, 10, 10, 15],
    hard: [0, 0, 10, 15, 15, 20]
};

const FuriaQuiz = ({ userRef, level }) => {
    const dispatch = useDispatch();

    const QUIZ_TIME_LIMIT = 30;
    const THREE_HOURS = 3 * 60 * 60 * 1000;

    const [questions, setQuestions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [correctCount, setCorrectCount] = useState(0);
    const [finished, setFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_LIMIT);
    const [finalTime, setFinalTime] = useState(0); // Novo estado para o tempo final
    const [canEarnPoints, setCanEarnPoints] = useState(true);
    const [countdown, setCountdown] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [started, setStarted] = useState(false);
    const [lastQuizTimestamp, setLastQuizTimestamp] = useState(null);

    const intervalRef = useRef(null);
    const timerRef = useRef(null); // Ref para o timer do quiz
    const timeRef = useRef(QUIZ_TIME_LIMIT);

    // Finaliza o quiz e atualiza furias no Firestore se possível
    const finishQuiz = useCallback(async (lastTimestamp) => {
        setFinished(true);
        dispatch(setIsQuizFinished(true));
        setFinalTime(Math.max(0, QUIZ_TIME_LIMIT - timeRef.current)); // Captura o tempo final

        const now = Date.now();
        const score = SCORE_RULES[level][correctCount];

        if (!lastTimestamp || now - lastTimestamp >= THREE_HOURS) {
            if (score > 0) {
                setIsProcessing(true);

                try {
                    await runTransaction(userRef.firestore || userRef._firestore, async (transaction) => {
                        const userSnap = await transaction.get(userRef);
                        const currentFurias = userSnap.exists() ? (userSnap.data().furias || 0) : 0;

                        transaction.update(userRef, {
                            furias: currentFurias + score,
                            lastQuizTimestamp: now
                        });
                    });

                    const updatedSnap = await getDoc(userRef);
                    if (updatedSnap.exists()) {
                        dispatch(setFurias(updatedSnap.data().furias));
                    }
                } catch (err) {
                    console.error("Erro ao incrementar furias do quiz:", err);
                }

                setIsProcessing(false);
            }
        }
    }, [level, correctCount, dispatch, userRef, THREE_HOURS, QUIZ_TIME_LIMIT]);

    // Busca o último timestamp do quiz do usuário
    useEffect(() => {
        const fetchLastTimestamp = async () => {
            const userSnap = await getDoc(userRef);
            const lastTimestamp = userSnap.exists() ? userSnap.data()?.lastQuizTimestamp : null;
            setLastQuizTimestamp(lastTimestamp);

            const now = Date.now();
            if (lastTimestamp && now - lastTimestamp < THREE_HOURS) {
                setCanEarnPoints(false);
                setCountdown(THREE_HOURS - (now - lastTimestamp));
            }
        };

        fetchLastTimestamp();
    }, [userRef, THREE_HOURS]);

    // Controla o countdown para o usuário poder ganhar pontos novamente
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

    // Inicia o temporizador do quiz
    const startQuizTimer = () => {
        clearInterval(timerRef.current); // Limpa qualquer timer anterior
        setTimeLeft(QUIZ_TIME_LIMIT);
        timeRef.current = QUIZ_TIME_LIMIT;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    finishQuiz(lastQuizTimestamp);
                    setFinished(true);
                    dispatch(setIsQuizFinished(true));
                    timeRef.current = 0;
                    return 0;
                }
                timeRef.current = prev - 1;
                return prev - 1;
            });
        }, 1000);
        timerRef.current = timer;
    };

    // Gera as perguntas aleatórias e inicia o quiz
    const generateRandomQuestions = () => {
        const shuffled = [...QUESTIONS[level]].sort(() => 0.5 - Math.random()).slice(0, 5);
        setQuestions(shuffled);
        setCurrent(0);
        setSelected(null);
        setCorrectCount(0);
        setStarted(true);
        setFinished(false);
        dispatch(setIsQuizFinished(false));
        startQuizTimer(); // Inicia o cronômetro ao gerar as perguntas
    };

    // Limpeza do intervalo do quiz
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // Verifica a resposta e avança para a próxima
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

    // Reinicia o quiz
    const resetQuiz = () => {
        setQuestions([]);
        setStarted(false);
        setFinished(false);
        dispatch(setIsQuizFinished(false));
        setSelected(null);
        setCorrectCount(0);
        setTimeLeft(QUIZ_TIME_LIMIT);
        setFinalTime(0); // Reseta o tempo final ao reiniciar
        startQuizTimer(); // Inicia o cronômetro ao reiniciar o quiz
    };

    // Formata contagem regressiva para poder ganhar pontos
    const formatCountdown = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    // Tradução do nível
    const quizLevel = (level) => {
        switch (level) {
            case "easy": return "fácil";
            case "moderate": return "moderado";
            case "hard": return "difícil";
            default: return level;
        }
    };

    // Tela inicial
    if (!started) {
        const SCORE = SCORE_RULES[level];
        return (
            <div className="quiz-start">
                <p>Você terá <strong>30s</strong> para responder <strong>5 perguntas</strong> de nível <strong>{quizLevel(level)}</strong>.</p>
                <p>A pontuação para esse quiz vai de <strong>{SCORE[0]}</strong> à <strong>{SCORE[SCORE.length - 1]}</strong>.</p>
                <h3>Boa sorte!</h3>
                <button className="retry-button" onClick={generateRandomQuestions}>Começar Quiz</button>
            </div>
        );
    }

    // Tela final
    if (finished) {
        return (
            <div className="quiz-results">
                <h2>Quiz finalizado!</h2>
                <p>Acertos: <strong>{correctCount}/5</strong></p>
                <p>Tempo total: <strong>{finalTime}s</strong></p> {/* Usa o estado finalTime */}

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

    // Enquanto carrega
    if (!questions.length) return <Loader />;

    // Tela principal do quiz
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
};

export default FuriaQuiz;