import React, { useState } from "react";
import { db } from "../../firebase"; 
import { doc, getDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { setUser } from "../../slices/userSlice"; 
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/validation";
import { useAuth } from "../../context/AuthContext";
import './Login.css';

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
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();

                // Salva no Redux
                dispatch(setUser({
                    name: userData.name || "Usuário(a)",
                    surname: userData.surname,
                    email: user.email,
                    profilePic: userData.profilePic || null,
                    furias: userData.furias || Math.floor(Math.random() * 201),
                    id: user.uid,
                    availableRewards: userData.availableRewards || [],
                    availableChallenges: userData.availableChallenges || [],
                    availableQuizzes: userData.availableQuizzes || [],
                }));                

                navigate("/home");
            } else {
                alert("Parece que você não tem uma conta, que tal fazer uma?");
            }
        } catch (error) {
            console.error("Erro no login:", error.message);
            alert("Erro no login: " + error.message);
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
        </div>
    );
}

export default Login;