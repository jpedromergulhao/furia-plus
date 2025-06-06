import React, { useState, useEffect } from "react";
import './Lives.css';
import { games } from "../../utils/games";
import { doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useDispatch } from "react-redux";
import { setFurias } from "../../slices/userSlice";

function Lives() {
    const [selectedTeam, setSelectedTeam] = useState("todos");
    const [selectedGame, setSelectedGame] = useState(null);
    const [timer, setTimer] = useState(0);
    const [showNotification, setShowNotification] = useState(false);
    const dispatch = useDispatch();

    // Função de filtro 
    const filteredGames = selectedTeam === "todos"
        ? games
        : games.filter(game => game.team === selectedTeam);

    useEffect(() => {
        let interval;
        if (selectedGame) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 60000);
        } else {
            setTimer(0);
        }

        return () => clearInterval(interval);
    }, [selectedGame]);

    // useEffect para dar pontos ao usuário a cada 30 minutos assistidos
    useEffect(() => {
        const givePoints = async () => {
            if (auth.currentUser) {
                const userRef = doc(db, "users", auth.currentUser.uid);

                try {
                    // Adiciona 20 furias ao firebase
                    await updateDoc(userRef, {
                        furias: increment(20)
                    });

                    // Atualiza a quantidade de furias no redux de acordo com o firebase
                    const updatedSnap = await getDoc(userRef);
                    dispatch(setFurias(updatedSnap.data().furias));

                    // Mostra o modal de +20 furias
                    setShowNotification(true);
                } catch (err) {
                    console.error("Erro ao salvar dados no Firebase:", err);
                }
                setTimeout(() => setShowNotification(false), 5000);
            }
        };

        if (timer !== 0 && timer % 1 === 0) {
            givePoints();
        }
    }, [timer, dispatch]);

    const getVideoId = (url) => {
        const match = url.match(/v=([^&]+)/);
        return match ? match[1] : null;
    };

    return (
        <div className="lives-container">
            <h1 className="lives-title">lives & Reprises</h1>

            <div className="filter-buttons">
                {["todos", "lol", "cs", "r6", "val", "fut", "redr"].map(team => (
                    <button
                        key={team}
                        onClick={() => setSelectedTeam(team)}
                        className={`filter-btn ${selectedTeam === team ? "active" : ""}`}
                    >
                        {team.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="games-grid">
                {filteredGames.map(game => {
                    const videoId = getVideoId(game.url);
                    const thumbUrl = videoId
                        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                        : "";

                    return (
                        <div data-aos='fade-right' key={game.id} className="game-card" onClick={() => setSelectedGame(game)}>
                            <img src={thumbUrl} alt={game.title} className="game-thumbnail" />
                            <div className="game-info">
                                <p className="game-title">{game.title}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedGame && (
                <div className="modal-overlay" onClick={() => setSelectedGame(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <iframe
                            key={selectedGame.id}
                            src={selectedGame.url.replace("watch?v=", "embed/")}
                            title="Live Stream"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="video-frame"
                        />
                        <button className="modal-close-btn" onClick={() => setSelectedGame(null)}>X</button>
                    </div>
                </div>
            )}

            {showNotification && (
                <div className="notification">
                    +20 furias!
                </div>
            )}
        </div>
    );
}

export default Lives;
