import React, { useState } from "react";
import './ResetPassword.css';
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/validation";
import ResetModal from "../../components/ResetModal/ResetModal";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";

function ResetPassword() {
    const [resetEmail, setResetEmail] = useState('');
    const [isSending, setIsSending] = useState(false); // Controla o botão para o usuário não clicar mais de uma vez
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const resetPassword = async (email) => {
        setIsSending(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setShowModal(true);
        } catch (error) {
            console.error("Erro ao enviar e-mail de redefinição:", error);
            alert("Erro ao enviar e-mail. Verifique o endereço de e-mail e tente novamente.");
        } finally {
            setIsSending(false);
        }
    };

    const handleReset = (e) => {
        e.preventDefault();

        if (!validateEmail(resetEmail)) {
            alert("Por favor, insira um e-mail válido.");
            return;
        }

        resetPassword(resetEmail);
    }

    const handleCloseModal = () => {
        setShowModal(false);
        navigate("/"); 
    }

    return (
        <div className="reset-password">
            <div className="reset-password-container">
                <Link to='/'>{'<'}</Link>

                <h1>
                    Esqueceu sua senha?
                </h1>
                <p>
                    Por favor, digite o seu email de registro para resetar a sua senha.
                </p>
                <form className="reset-password-form" onSubmit={handleReset}>
                    <input
                        type="email"
                        required
                        placeholder="E-mail"
                        className="texts"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="btns"
                        disabled={isSending}
                    >
                        {isSending ? "Carregando..." : "Recuperar minha senha"}
                    </button>
                </form>
            </div>

            {showModal &&
                <ResetModal
                    email={resetEmail}
                    onClose={handleCloseModal}
                />}
        </div>
    );
}

export default ResetPassword;