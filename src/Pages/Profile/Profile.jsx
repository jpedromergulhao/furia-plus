import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser, setProfilePic } from "../../slices/userSlice";
import {
    getAuth,
    deleteUser,
    GoogleAuthProvider,
    FacebookAuthProvider,
    EmailAuthProvider,
    reauthenticateWithPopup,
    reauthenticateWithCredential
} from "firebase/auth";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "./Profile.css";
import defaultPhoto from "../../assets/user-icon.svg";
import Loader from "../../components/Loader/Loader";
import csWallpaper from '../../assets/CS_Wallpaper.png';
import lolWallpaper from '../../assets/LOL_Wallpaper.png';
import valWallpaper from '../../assets/Valorant_Wallpaper.png';
import r6Wallpaper from '../../assets/R6_Wallpaper.png';

// Função para recortar imagem
const getCroppedImg = async (imageSrc, maxSize = 1024) => {
    let image = null;
    try {
        image = await createImage(imageSrc);
    } catch (error) {
        console.error("Erro ao processar a foto: " + error);
        return null;
    }
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    const size = Math.min(image.naturalWidth, image.naturalHeight);
    const safeX = (image.naturalWidth - size) / 2;
    const safeY = (image.naturalHeight - size) / 2;

    canvas.width = maxSize;
    canvas.height = maxSize;

    ctx.drawImage(image, safeX, safeY, size, size, 0, 0, maxSize, maxSize);

    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (!blob) return reject(new Error("Erro ao converter a imagem."));
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => resolve(reader.result);
        }, "image/jpeg", 0.7);
    });
};

const createImage = (url) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
});

const fakeRanking = [
    { name: "Lucas", points: [731, 800, 450, 640] },
    { name: "Marina", points: [602, 410, 690, 740] },
    { name: "Bruno", points: [480, 382, 922, 550] },
    { name: "Carla", points: [518, 623, 680, 860] },
    { name: "Rafael", points: [825, 850, 560, 770] },
    { name: "Lara", points: [840, 360, 720, 710] },
    { name: "José", points: [310, 426, 825, 900] },
    { name: "Amanda", points: [430, 830, 805, 600] },
    { name: "Bruna", points: [822, 783, 432, 771] },
    { name: "Tiago", points: [675, 876, 343, 395] },
];

// Função de reautenticação
const reauthenticateUser = async (user) => {
    if (!user) throw new Error("Nenhum usuário autenticado.");
    const providerId = user.providerData[0]?.providerId;
    let provider;

    if (providerId === "google.com") {
        provider = new GoogleAuthProvider();
        return reauthenticateWithPopup(user, provider);
    }

    if (providerId === "facebook.com") {
        provider = new FacebookAuthProvider();
        return reauthenticateWithPopup(user, provider);
    }

    if (providerId === "password") {
        const email = user.email;
        const password = prompt("Antes de seguir, precisamos da sua senha para confirmar que você realmente deseja excluir sua conta. 😢");

        if (!password) throw new Error("Senha não fornecida.");
        const credential = EmailAuthProvider.credential(email, password);
        return reauthenticateWithCredential(user, credential);
    }

    throw new Error("Provedor de login não suportado.");
};

function Profile() {
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isProcesing, setIsProcessing] = useState(false);
    const [unlockedWallpapers, setUnlockedWallpapers] = useState([]);

    const generateWeeklyRanking = () => {
        const shuffled = [...fakeRanking].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5).map(person => ({
            name: person.name,
            points: person.points[Math.floor(Math.random() * person.points.length)]
        }));
        return selected.sort((a, b) => b.points - a.points);
    };

    const [weeklyRanking, setWeeklyRanking] = useState(JSON.parse(localStorage.getItem("weeklyRanking")) || []);

    useEffect(() => {
        const savedRanking = JSON.parse(localStorage.getItem("weeklyRanking"));
        const lastUpdated = localStorage.getItem("rankingLastUpdated");

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const isSunday = today.getDay() === 0;

        setUnlockedWallpapers(user.unlockedWallpapers);

        // Se for domingo e ainda não foi atualizado hoje, gera novo ranking
        if (isSunday && lastUpdated !== todayStr) {
            const newRanking = generateWeeklyRanking();
            localStorage.setItem("weeklyRanking", JSON.stringify(newRanking));
            localStorage.setItem("rankingLastUpdated", todayStr);
            setWeeklyRanking(newRanking);
        } else if (savedRanking) {
            setWeeklyRanking(savedRanking);
        } else {
            // Primeira vez acessando (qualquer dia)
            const initialRanking = generateWeeklyRanking();
            localStorage.setItem("weeklyRanking", JSON.stringify(initialRanking));
            localStorage.setItem("rankingLastUpdated", todayStr);
            setWeeklyRanking(initialRanking);
        }
    }, [user.unlockedWallpapers]);

    const handleLogout = () => {
        dispatch(logoutUser());
        getAuth().signOut();
        navigate("/");
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm("😢 Tem certeza? Ao deletar sua conta, você perderá todas as informações salvas. Deseja continuar?");
        if (!confirmed) return;

        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) return alert("🚫 Ops! Parece que ninguém está autenticado no momento.");

        setIsProcessing(true)
        try {
            await reauthenticateUser(currentUser);
            await deleteDoc(doc(db, "users", user.id));
            await deleteUser(currentUser);
            dispatch(logoutUser());
            localStorage.clear();
            setTimeout(() => navigate("/"), 100);
        } catch (error) {
            setIsProcessing(false);
            console.error("Erro ao deletar conta:", error);
            alert("🛑 Erro ao apagar a conta. Se ainda quiser continuar, tente mais uma vez.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith("image/")) {
            return alert("👉 Por favor, escolha uma imagem para enviar!");
        }

        setIsProcessing(true)
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const cropped = await getCroppedImg(reader.result, 1024);
                    if (cropped === null){
                        setIsProcessing(false);
                        return alert("⚠️ Erro ao processar a imagem. Tente novamente")
                    }
                    const storage = getStorage();
                    const storageRef = ref(storage, `profilePics/${user.id}.jpg`);
                    await uploadString(storageRef, cropped, "data_url");
                    const downloadURL = await getDownloadURL(storageRef);
                    dispatch(setProfilePic(downloadURL));
                } catch (err) {
                    console.error("Erro ao recortar ou fazer upload da imagem:", err);
                    alert("🚫 Erro ao carregar a imagem. Experimente outra foto! 🤳");
                } finally {
                    setIsProcessing(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Erro ao processar imagem:", error);
            alert("Erro ao enviar imagem.");
            setIsProcessing(false);
        }
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

    return (
        <div className="profile-container">
            <h1>Perfil</h1>
            <div className="profile-header">
                <div className="profile-img" data-aos="zoom-in">
                    <img
                        src={user.profilePic || defaultPhoto}
                        alt="Foto de perfil"
                        className="profile-pic"
                        onClick={() => fileInputRef.current.click()}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />
                </div>
                <div className="profile-info" data-aos="fade-left">
                    <h2>{user.name} {user.surname?.split(" ")[0]}</h2>
                    <div className="furias">
                        <span>Furias:</span>
                        <span className="user-data">{user.furias}⚡️</span>
                    </div>
                    <div className="login-streak">
                        <span>Login Streak:</span>
                        <span className="user-data">{user.loginStreak}🔥</span>
                    </div>
                </div>
            </div>

            <div className="profile-actions">
                <button className="logout-btn" data-aos="fade-right" onClick={handleLogout}>Logout</button>
                <button className="delete-btn" data-aos="fade-left" onClick={handleDeleteAccount}>Deletar</button>
            </div>

            <div className="unlocked-wallpapers" >
                <h3 data-aos="fade-right">Wallpapers desbloqueados</h3>
                <div className="wallpapers-container">
                    {unlockedWallpapers.map((wallpaper) => (
                        <img data-aos="flip-left" key={wallpaper.id} src={getImage(wallpaper.src)} alt={wallpaper.name} />
                    ))}
                </div>
            </div>

            <div className="ranking">
                <h3 data-aos="fade-right">Ranking Semanal</h3>
                <div className="ranking-info">
                    <div>
                        <span data-aos="fade-right">🥇 1º</span>
                        <span data-aos="fade-left">+50 furias</span>
                    </div>
                    <div>
                        <span data-aos="fade-right">🥈 2º</span>
                        <span data-aos="fade-left">+25 furias</span>
                    </div>
                    <div>
                        <span data-aos="fade-right">🥉 3º</span>
                        <span data-aos="fade-left">+10 furias</span>
                    </div>
                </div>

                <div className="weekly-ranking">
                    <ul>
                        {weeklyRanking.map((person, index) => (
                            <li key={index}>
                                <span data-aos="fade-right">
                                    <strong>{index + 1}º</strong> {person.name}
                                </span>
                                <span data-aos="fade-left">
                                    {person.points} ⚡
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {isProcesing && <Loader />}
        </div>
    );
}

export default Profile;
