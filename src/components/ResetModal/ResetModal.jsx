import React from "react";
import './ResetModal.css';

function ResetModal({ email, onClose }) {
    return (
        <div className="reset-modal-overlay">
            <div className="reset-modal">
                <h2>Verifique seu e-mail 📩</h2>
                <p>Um link de redefinição de senha foi enviado para:</p>
                <p className="reset-email">{email}</p>
                <button className="close-button" onClick={onClose}>
                    Ok, entendi!
                </button>
            </div>
        </div>
    );
}

export default ResetModal;