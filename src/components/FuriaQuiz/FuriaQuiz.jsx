import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addFurias } from "../../slices/userSlice";
import { QUESTIONS } from "../../utils/questions";
import './FuriaQuiz.css';

const SCORE_RULES = {
    easy: [0, 6, 6, 6, 10, 10],
    moderate: [0, 0, 6, 10, 10, 15],
    hard: [0, 0, 10, 15, 15, 20]
};

function FuriaQuiz({ userName, level }) {
    const dispatch = useDispatch();

    const [questions, setQuestions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [correctCount, setCorrectCount] = useState(0);
    const [finished, setFinished] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [timeLeft, setTimeLeft] = useState(30);

    const [canEarnPoints, setCanEarnPoints] = useState(true);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        generateRandomQuestions();

        const lastQuizTimestamp = localStorage.getItem("lastQuizTimestamp");
        const now = Date.now();
        const THREE_HOURS = 3 * 60 * 60 * 1000;

        if (lastQuizTimestamp && now - parseInt(lastQuizTimestamp) < THREE_HOURS) {
            const remaining = THREE_HOURS - (now - parseInt(lastQuizTimestamp));
            setCanEarnPoints(false);
            setCountdown(remaining);

            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1000) {
                        clearInterval(interval);
                        setCanEarnPoints(true);
                        return 0;
                    }
                    return prev - 1000;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [level]);

    useEffect(() => {
        if (!finished && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft <= 0) {
            finishQuiz();
        }
    }, [timeLeft, finished]);

    const generateRandomQuestions = () => {
        const shuffled = QUESTIONS[level]
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);
        setQuestions(shuffled);
        setCurrent(0);
        setSelected(null);
        setCorrectCount(0);
        setFinished(false);
        setStartTime(Date.now());
        setTimeLeft(30);
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
                finishQuiz();
            }
        }, 1000);
    };

    const finishQuiz = () => {
        setFinished(true);
        const score = SCORE_RULES[level][correctCount];
        const now = Date.now();
        const THREE_HOURS = 3 * 60 * 60 * 1000;

        const lastQuizTimestamp = localStorage.getItem("lastQuizTimestamp");
        if (!lastQuizTimestamp || now - parseInt(lastQuizTimestamp) >= THREE_HOURS) {
            if (score > 0) {
                dispatch(addFurias(score));
                localStorage.setItem("lastQuizTimestamp", now.toString());
            }
        }
    };

    const resetQuiz = () => {
        generateRandomQuestions();
    };

    const formatCountdown = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours}h ${minutes}m ${seconds}s`;
    };

    if (finished) {
        const timeTaken = Math.max(0, 30 - timeLeft);
        return (
            <div className="quiz-results">
                <h2>Quiz finalizado!</h2>
                <p>{userName}, você acertou {correctCount} de 5 perguntas.</p>
                <p>Tempo total: {timeTaken} segundos</p>
                <p>Fúrias ganhas: {SCORE_RULES[level][correctCount]}</p>

                {!canEarnPoints && (
                    <p className="countdown-message">
                        ⚠️ Você já fez o quiz recentemente. Para somar pontos, tente novamente em: <strong>{formatCountdown(countdown)}</strong>
                    </p>
                )}

                <button onClick={resetQuiz} className="retry-button">Tentar novamente</button>
            </div>
        );
    }

    if (!questions.length) return <p>Carregando perguntas...</p>;

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
        </div>
    );
}

export default FuriaQuiz;
