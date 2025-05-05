import React, { useState } from "react";
import './Register.css';
import furiaPlus from '../../assets/app_name_white.svg';
import { validateEmail } from "../../utils/validation";
import { Link, useNavigate } from "react-router-dom";
import TermsModal from "../../components/TermsModal/TermsModal";
import { auth } from "../../firebase"; 
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";


function Register() {
    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [confirmEmail, setConfirmrEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showTermsModal, setShowTermsModal] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
    
        if (!validateEmail(registerEmail)) {
            alert("Por favor, insira um e-mail válido.");
            return;
        }
    
        if (registerEmail !== confirmEmail) {
            alert("Os emails são diferentes!");
            return;
        }
    
        if (registerPassword !== confirmPassword) {
            alert("As senhas não coincidem!");
            return;
        }
    
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
            const user = userCredential.user;
        
            // Enviar e-mail de verificação
            await sendEmailVerification(user);
            alert("Cadastro realizado! Verifique seu e-mail antes de fazer login.");
        
            navigate("/"); 
        } catch (error) {
            console.error("Erro ao cadastrar usuário:", error);
            alert("Houve um erro ao te registrar: " + error.message + ". Tente novamente!");
        }
    };

    return (
        <div className="register">
            <div className="register-container">
                <img src={furiaPlus} alt="Furia +" data-aos="zoom-in" />

                <form onSubmit={handleRegister}>
                    <input
                        type="text"
                        required
                        placeholder="Nome completo"
                        aria-label="Nome completo para cadastro"
                        className="inputs"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                    />
                    <input
                        type="email"
                        required
                        placeholder="E-mail"
                        aria-label="E-mail para cadastro"
                        className="inputs"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                    />
                    <input
                        type="email"
                        required
                        placeholder="Confirme seu e-mail"
                        aria-label="Confirmar e-mail"
                        className="inputs"
                        value={confirmEmail}
                        onChange={(e) => setConfirmrEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        required
                        placeholder="Senha"
                        aria-label="Senha para cadastro"
                        className="inputs"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        required
                        placeholder="Confirme sua senha"
                        aria-label="Confirmar senha"
                        className="inputs"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            required
                            className="checkbox"
                        />
                        Eu aceito os{" "}
                        <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            className="link-terms"
                        >
                            termos de uso
                        </button>
                    </label>

                    <button type="submit" className="register-btn">
                        Cadastrar
                    </button>
                </form>

                <span>
                    Já tem uma conta? <Link to="/">Entre</Link>
                </span>
            </div>

            {showTermsModal && <TermsModal onClose={() => setShowTermsModal(false)} />}
        </div>
    );
}

export default Register;
