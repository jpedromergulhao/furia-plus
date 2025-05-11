import React, { useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { setFurias, setLastLoginDate, setLoginStreak, setUser } from "../../slices/userSlice";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/validation";
import { useAuth } from "../../context/AuthContext";
import './Login.css';
import Loader from "../Loader/Loader";
import { format } from "date-fns"

function Login() {
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false); // Controla o botão para o usuário não clicar mais de uma vez
    const { login } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateEmail(loginEmail)) {
            alert("Por favor, insira um e-mail válido.");
            return;
        }

        setIsLoading(true);

        if (!loginEmail || !loginPassword) {
            alert("Preencha todos os campos! 😅");
            setIsLoading(false);
            return;
        }

        try {
            // Login usando o AuthContext
            const userCredential = await login(loginEmail, loginPassword);
            const user = userCredential.user;

            // Verifica se o usuário fez a verificação de email
            if (!user.emailVerified) {
                alert("Você precisa verificar seu e-mail antes de entrar! 📧");
                setIsLoading(false);
                return;
            }

            // Dados adicionais no Firestore
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();

                // Atualiza as informações do usuário
                const updatedUser = {
                    name: userData.name || "Usuário(a)",
                    surname: userData.surname || "",
                    email: user.email || "",
                    profilePic: userData.profilePic || null,
                    furias: userData.furias || Math.floor(Math.random() * 201),
                    id: user.uid,
                    availableRewards: userData.availableRewards || [],
                    availableQuizzes: userData.availableQuizzes || [],
                    availableChallenges: userData.availableChallenges || [],
                    usedCoupons: userData.usedRewards || [],
                    unlockedWallpapers: userData.unlockedWallpapers || [],
                    loginStreak: userData.loginStreak || 0,
                    lasLoginDate: userData.lasLoginDate || null
                }

                try {
                    // Atualiza o usuáro no firebase 
                    await updateDoc(userRef, updatedUser);

                    // Salva no Redux
                    dispatch(setUser(updatedUser));

                    const today = format(new Date(), "yyyy-MM-dd");
                    const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");

                    const lastLoginDate = userData.lastLoginDate || null;
                    let loginStreak = userData.loginStreak || 0;

                    if (lastLoginDate === today) {
                        // Já logou hoje: não faz nada com loginStreak
                    } else if (lastLoginDate === yesterday) {
                        // Logou ontem: incrementa loginStreak
                        loginStreak += 1;
                    } else {
                        // Não logou ontem: reseta loginStreak
                        loginStreak = 1;
                    }

                    // Atualiza Firestore com loginStreak e a nova data
                    await updateDoc(userRef, {
                        loginStreak: loginStreak,
                        lastLoginDate: today
                    });

                    // Pega o usuário atualizado
                    const updatedSnap = await getDoc(userRef);
                    const updatedData = updatedSnap.data();

                    // Recompensa por dias seguidos de login
                    let furiasBonus = 0;

                    switch (loginStreak) {
                        case 3:
                            furiasBonus = 10;
                            break;
                        case 10:
                            furiasBonus = 50;
                            break;
                        case 30:
                            furiasBonus = 100;
                            break;
                        default:
                            break;
                    }

                    if (furiasBonus > 0) {
                        await updateDoc(userRef, {
                            furias: increment(furiasBonus)
                        });
                    }

                    // Atualiza Redux
                    dispatch(setLoginStreak(updatedData.loginStreak));
                    dispatch(setFurias(updatedData.furias));
                    dispatch(setLastLoginDate(updatedData.lastLoginDate));

                    navigate("/home");
                } catch (err) {
                    console.error("Erro ao atualizar o firebase no login do usuário:", err);
                }
            } else {
                alert("Parece que você não tem uma conta, que tal fazer uma?");
                setIsLoading(false);
                return;
            }
        } catch (error) {
            console.error("Erro no login:", error.message);
            alert("Erro ao fazer login, tente novamente");
        }

        setIsLoading(false);
    };

    return (
        <div className="login">
            <form className="login-form" onSubmit={handleLogin}>
                <input
                    type="email"
                    required
                    placeholder="E-mail"
                    className="texts"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                />
                <input
                    type="password"
                    required
                    placeholder="Senha"
                    className="texts"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button
                    type="submit"
                    className="btns"
                    disabled={isLoading}
                >
                    {isLoading ? "Carregando..." : "Entrar"}
                </button>
            </form>

            <Link to="/resetar-senha" className="forgot-password-link">
                Esqueceu sua senha?
            </Link>

            {isLoading && <Loader />}
        </div>
    );
}

export default Login;