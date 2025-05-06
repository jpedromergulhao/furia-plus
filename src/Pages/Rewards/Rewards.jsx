import React, { useState } from "react";
import './Rewards.css';
import { initialRewards } from "../../utils/rewards";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useSelector } from "react-redux";
import csWallpaper from '../../assets/CS_Wallpaper.png';
import lolWallpaper from '../../assets/LOL_Wallpaper.png';
import valWallpaper from '../../assets/Valorant_Wallpaper.png';
import r6Wallpaper from '../../assets/R6_Wallpaper.png';

const saveUserData = async (furiaPoints, rewards, userId) => {
    if (!userId) return;
    const dataToSave = {
        furiaPoints,
        usedRewards: rewards.filter(r => r.type === "Cupom" && r.unlocked),
        unlockedWallpapers: rewards.filter(r => r.type === "Wallpaper" && r.unlocked)
    };

    await setDoc(doc(db, "users", userId), dataToSave);
};

function getImage(src) {
    const images = {
        CS: csWallpaper,
        LOL: lolWallpaper,
        Val: valWallpaper,
        R6: r6Wallpaper
    };
    return images[src] || '';
}

const Rewards = () => {
    const [furiaPoints, setFuriaPoints] = useState(100);
    const [rewards, setRewards] = useState(initialRewards);
    const [selectedReward, setSelectedReward] = useState(null);
    const [modalContent, setModalContent] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const user = useSelector((state) => state.user);
    const userName = user.name?.split(" ")[0] || "FURIA Fan";
    const userEmail = user.email;
    const userId = user.id;

    const handleRewardClick = (reward) => {
        if (reward.unlocked || isProcessing) return;

        if (furiaPoints < reward.cost) {
            setModalContent({
                title: "Saldo insuficiente",
                message: `${userName}, você não tem saldo suficiente para essa recompensa. Conquiste mais fúrias ou escolha outra recompensa.`
            });
            return;
        }

        setSelectedReward(reward);
        setModalContent({
            title: "Confirmar resgate",
            message: `Essa recompensa vai custar ${reward.cost} fúrias. Tem certeza de que quer resgatar?`,
            description: reward.name,
            confirm: true
        });
    };

    const confirmUnlock = async () => {
        if (!selectedReward || isProcessing) return;
        setIsProcessing(true);

        const updatedRewards = rewards.map(r =>
            r.id === selectedReward.id ? { ...r, unlocked: true } : r
        );
        const newPoints = furiaPoints - selectedReward.cost;

        setFuriaPoints(newPoints);
        setRewards(selectedReward.type === "Cupom"
            ? updatedRewards.filter(r => r.id !== selectedReward.id)
            : updatedRewards
        );

        try {
            await saveUserData(newPoints, updatedRewards, userId);
        } catch (error) {
            console.error("Erro ao salvar dados no Firebase:", error);
        }

        setModalContent({
            title: "Recompensa desbloqueada",
            message: selectedReward.type === "Cupom"
                ? `Cupom: ${selectedReward.cupon}. Cupom enviado para o email ${userEmail}`
                : `Wallpaper desbloqueado com sucesso!`
        });

        setIsProcessing(false);
    };

    const closeModal = () => {
        setModalContent(null);
        setSelectedReward(null);
        setIsProcessing(false);
    };

    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            alert("Código copiado!");
        } catch {
            alert("Erro ao copiar.");
        }
    };

    return (
        <div className="rewards-container">
            <h2>Recompensas</h2>

            <span>
                Saldo atual de furias: <strong>{user.furias}</strong> ⚡️
            </span>

            <span>
                Use os cuponos na nossa <br/>
                <a href="https://www.furia.gg/" target="_blank" rel="noopener noreferrer"> LOJA OFICIAL</a>
            </span>

            {rewards.map(reward => (
                <div data-aos="fade-right" key={reward.id} className={`reward-card ${reward.unlocked ? "unlocked" : ""}`} onClick={() => handleRewardClick(reward)}>
                    <h3>{reward.name}</h3>
                    <p className="reward-type">Tipo: {reward.type}</p>
                    <p>{reward.description}</p>
                    <p className="reward-cost">Custa: {reward.cost} fúrias ⚡️</p>

                    {reward.type === "Cupom" ? (
                        reward.unlocked ? (
                            <div>
                                <p className="cupon-revealed">Cupom: <strong>{reward.cupon}</strong></p>
                                <button className="rewards-btn" onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(reward.cupon);
                                }}>Copiar código</button>
                                <a href="https://www.furia.gg/" target="_blank" rel="noopener noreferrer" className="cta-button">Ir para loja</a>
                            </div>
                        ) : (
                            <div className="cupon-hidden">Cupom: <span>*******</span></div>
                        )
                    ) : (
                        reward.unlocked ? (
                            <div>
                                <img src={getImage(reward.src)} alt={reward.name} className="wallpaper-image" />
                                <a href={getImage(reward.src)} download className="cta-button">Baixar</a>
                            </div>
                        ) : (
                            <div className="wallpaper-blurred">
                                <img src={getImage(reward.src)} alt={reward.name} className="blurred" />
                            </div>
                        )
                    )}
                </div>
            ))}

            {modalContent && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{modalContent.title}</h2>
                        <h3>{modalContent.description}</h3>
                        <p>{modalContent.message}</p>
                        {modalContent.confirm ? (
                            <>
                                <button onClick={confirmUnlock} disabled={isProcessing}>Confirmar</button>
                                <button onClick={closeModal}>Cancelar</button>
                            </>
                        ) : (
                            <button className="rewards-btn" onClick={closeModal}>Fechar</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rewards;
