import React, { useRef, useState } from "react";
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

// Função para recortar imagem
const getCroppedImg = async (imageSrc, maxSize = 1024) => {
    const image = await createImage(imageSrc);
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
    const [uploading, setUploading] = useState(false);

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

        try {
            await reauthenticateUser(currentUser);
            await deleteDoc(doc(db, "users", user.id));
            await deleteUser(currentUser);
            dispatch(logoutUser());
            localStorage.clear();
            setTimeout(() => navigate("/"), 100);
        } catch (error) {
            console.error("Erro ao deletar conta:", error);
            alert("🛑 Erro ao apagar a conta. Se ainda quiser continuar, tente mais uma vez.");
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith("image/")) {
            return alert("👉 Por favor, escolha uma imagem para enviar!");
        }

        setUploading(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const cropped = await getCroppedImg(reader.result, 1024);
                    const storage = getStorage();
                    const storageRef = ref(storage, `profilePics/${user.id}.jpg`);
                    await uploadString(storageRef, cropped, "data_url");
                    const downloadURL = await getDownloadURL(storageRef);
                    dispatch(setProfilePic(downloadURL));
                } catch (err) {
                    console.error("Erro ao recortar ou fazer upload da imagem:", err);
                    alert("🚫 Erro ao carregar a imagem. Experimente outra foto! 🤳");
                } finally {
                    setUploading(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Erro ao processar imagem:", error);
            alert("Erro ao enviar imagem.");
            setUploading(false);
        }
    };

    const fakeRanking = [
        { name: "Lucas", points: 730 },
        { name: "Marina", points: 700 },
        { name: "Bruno", points: 680 },
        { name: "Carla", points: 670 },
        { name: "Rafael", points: 560 },
    ];

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
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
                    {uploading && <p>Atualizando foto...</p>}
                    <h2>{user.name}</h2>
                </div>

                <div className="profile-info">
                    <p><strong>Fúrias:</strong> {user.furias}⚡️</p>
                </div>

                <div className="profile-actions">
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                    <button className="delete-btn" onClick={handleDeleteAccount}>Deletar</button>
                </div>
            </div>

            <div className="ranking-card">
                <h3>🏆 Ranking Semanal (Top 5)</h3>
                <ul>
                    {fakeRanking.map((user, index) => (
                        <li key={index}>
                            {index === 0 && "🥇 "}
                            {index === 1 && "🥈 "}
                            {index === 2 && "🥉 "}
                            {index > 2 && `${index + 1}º `}
                            {user.name} — {user.points} pts
                        </li>
                    ))}
                </ul>

                <div className="rewards-info">
                    <p>🥇 1º lugar: +20 pts</p>
                    <p>🥈 2º lugar: +10 pts</p>
                    <p>🥉 3º lugar: +5 pts</p>
                </div>
            </div>
        </div>
    );
}

export default Profile;
