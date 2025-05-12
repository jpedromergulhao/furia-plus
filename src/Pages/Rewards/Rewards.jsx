import React, { useEffect, useMemo, useState } from "react";
import './Rewards.css';
import { initialRewards } from "../../utils/rewards";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import csWallpaper from '../../assets/CS_Wallpaper.png';
import lolWallpaper from '../../assets/LOL_Wallpaper.png';
import valWallpaper from '../../assets/Valorant_Wallpaper.png';
import r6Wallpaper from '../../assets/R6_Wallpaper.png';
import fcWallpaper from '../../assets/FC_Wallpaper.png';
import redWallpaper from '../../assets/RED_Wallpaper.png';
import { setUser } from "../../slices/userSlice";
import Loader from "../../components/Loader/Loader";

const cleanData = (obj) => {
    const newObj = {};
    for (const key in obj) {
        if (obj[key] !== undefined) {
            newObj[key] = obj[key];
        }
    }
    return newObj;
};

const saveUserData = async (cost, updatedRewards, userId, userRef, setUserData, dispatch) => {
    if (!userId) return;

    const snap = await getDoc(userRef);

    // Se não existir dados no firebase  saí
    if (!snap.exists()) return;

    const prevData = snap.data();

    // Saldo atualizado diminuindo o custo da recompensa
    const newBalance = (prevData.furias || 0) - cost;

    const usedCoupons = updatedRewards.filter(reward => reward.type === "Cupom" && reward.unlocked);
    const newWallpapers = updatedRewards.filter(reward => reward.type === "Wallpaper" && reward.unlocked);

    // Merge com wallpapers anteriores
    const existingWallpapers = prevData.unlockedWallpapers || [];

    const allWallpapers = [
        ...existingWallpapers,
        ...newWallpapers.filter(
            nw => !existingWallpapers.some(ew => ew.id === nw.id)
        )
    ];

    console.log("Updated rewards", JSON.stringify(updatedRewards, null, 2));
    console.log("Used coupons", JSON.stringify(usedCoupons, null, 2));
    console.log("All wallpapers", JSON.stringify(allWallpapers, null, 2));

    // Atualiza o firebase
    await updateDoc(userRef, {
        furias: newBalance,
        availableRewards: updatedRewards.map(cleanData),
        usedCoupons: (usedCoupons || []).map(cleanData),
        unlockedWallpapers: (allWallpapers || []).map(cleanData),
    });

    // Pega suário atualizado no firebase
    const updatedSnap = await getDoc(userRef);

    setUserData({
        ...updatedSnap.data(),
        furias: updatedSnap.data().furias,
        availableRewards: updatedSnap.data().availableRewards,
        usedCoupons: updatedSnap.data().usedCoupons,
        unlockedWallpapers: updatedSnap.data().unlockedWallpapers
    });

    // Atualiza o Redux
    dispatch(setUser({
        ...updatedSnap.data(),
        furias: updatedSnap.data().furias,
        availableRewards: updatedSnap.data().availableRewards,
        usedCoupons: updatedSnap.data().usedCoupons,
        unlockedWallpapers: updatedSnap.data().unlockedWallpapers
    }))
};

function getImage(src) {
    const images = {
        CS: csWallpaper,
        LOL: lolWallpaper,
        Val: valWallpaper,
        R6: r6Wallpaper,
        FC: fcWallpaper,
        RED: redWallpaper
    };
    return images[src] || '';
}

const Rewards = () => {
    const [rewards, setRewards] = useState(initialRewards);
    const [selectedReward, setSelectedReward] = useState(null);
    const [modalContent, setModalContent] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeType, setActiveType] = useState("all");
    const [userData, setUserData] = useState(null);
    const user = useSelector((state) => state.user);
    const userName = user.name?.split(" ")[0] || "FURIA Fan";
    const userEmail = user.email;
    const userId = user.id;
    const userRef = userId ? doc(db, "users", userId) : null;
    const dispatch = useDispatch()

    useEffect(() => { // Pega os dados atuais do firebase
        if (!userId) return;
        const fetchUserData = async () => {
            try {
                const snap = await getDoc(userRef);
                if (snap.exists()) {
                    setUserData(snap.data());
                }
            } catch (err) {
                console.error("Erro ao buscar os dados atualizados: " + err);
            }
        };
        fetchUserData();
    }, [userId, userRef]);

    useEffect(() => { // Sincroniza o estado local com o firebase
        if (userData) {
            const unlockedWallpaperIds = (userData.unlockedWallpapers || []).map(wp => wp.id);

            const updatedRewards = initialRewards.map(reward => {
                const isUnlocked = unlockedWallpaperIds.includes(reward.id)
                    || (reward.type === "Cupom" && userData.usedCoupons?.some(r => r.id === reward.id));

                return { ...reward, unlocked: isUnlocked };
            });

            setRewards(updatedRewards);
        }
    }, [userData]);

    // Memoiza o filtro de notícias
    const filteredRewards = useMemo(() => {
        const type = activeType === "all"
            ? rewards
            : rewards.filter((r) => r.type === activeType);
        return [...type];
    }, [activeType, rewards])

    const handleRewardClick = (reward) => {
        // Se já foi desbloqueada ou esta processando a recompensa
        if (reward.unlocked || isProcessing) return;

        // Se o usuário não tem saldo suficiente
        if (!userData || userData.furias < reward.cost) {
            setModalContent({
                title: "Saldo insuficiente",
                message: `${userName}, você não tem saldo suficiente para essa recompensa. Conquiste mais furias ou escolha outra recompensa.`
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
        // Se não selecionou a recompensa ou esta processando a recompensa
        if (!selectedReward || isProcessing) return;

        setIsProcessing(true);

        // Set unlocked da recompensa selecionada para true
        const updatedRewards = rewards.map(reward =>
            reward.id === selectedReward.id ? { ...reward, unlocked: true } : reward
        );

        setRewards(updatedRewards);

        console.log(selectedReward.cost);

        try {
            await saveUserData(selectedReward.cost, updatedRewards, userId, userRef, setUserData, dispatch);
        } catch (error) {
            console.error("Erro ao salvar os dados das recompensas no Firebase:", error);
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
        } catch {
            alert("Erro ao copiar.");
        }
    };

    const type = [
        { key: "all", label: "Todas" },
        { key: "Cupom", label: "Cupons" },
        { key: "Wallpaper", label: "Wallpapers" }
    ];

    const onCategoryChange = (key) => {
        setActiveType(key);
    };

    return (
        <div className="rewards-container">
            <h2>Recompensas</h2>

            <span>
                Saldo atual de furias: <strong>{user.furias}</strong> ⚡️
            </span>

            <div className="rewards-filters">
                {type.map((type) => (
                    <button
                        key={type.key}
                        role="tab"
                        aria-selected={activeType === type.key}
                        className={activeType === type.key ? "active" : ""}
                        onClick={() => onCategoryChange(type.key)}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            {filteredRewards.map(reward => (
                <div data-aos="fade-right" key={reward.id} className={`reward-card ${reward.unlocked ? "unlocked" : ""}`} onClick={() => handleRewardClick(reward)}>
                    <h3>{reward.name}</h3>
                    <p className="reward-type">Tipo: {reward.type}</p>
                    <p>{reward.description}</p>
                    <p className="reward-cost">Custa: {reward.cost} furias ⚡️</p>

                    {reward.type === "Cupom" ? (
                        reward.unlocked ? (
                            <div>
                                <p className="cupon-revealed">Cupom: <strong>{reward.coupon}</strong></p>
                                <button className="rewards-btn" onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(reward.coupon);
                                }}>Copiar código</button>
                                <a href="https://www.furia.gg/" target="_blank" rel="noopener noreferrer" className="cta-button-rewards">Ir para a loja</a>
                            </div>
                        ) : (
                            <div className="cupon-hidden">Cupom: <span>*******</span></div>
                        )
                    ) : (
                        reward.unlocked ? (
                            <div>
                                <img src={getImage(reward.src)} alt={reward.name} className="wallpaper-image" />
                                <a href={getImage(reward.src)} download className="cta-button-rewards">Baixar</a>
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

            {isProcessing && <Loader />}
        </div>
    );
};

export default Rewards;
