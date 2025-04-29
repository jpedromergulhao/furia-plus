import React from "react";
import './TermsModal.css';

function TermsModal({ onClose }) {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="terms-container">
                    <h1>Termos de Uso</h1>

                    <p>
                        Bem-vindo ao Furia+! Ao utilizar nossos serviços, você concorda com os seguintes termos:
                    </p>

                    <h2>1. Cadastro de Conta</h2>
                    <p>
                        Para utilizar o Furia+, você deverá fornecer informações verdadeiras e atualizadas.
                        Você é responsável por manter a confidencialidade da sua conta e senha.
                    </p>

                    <h2>2. Privacidade</h2>
                    <p>
                        Suas informações pessoais são importantes para nós. Elas serão utilizadas apenas conforme nossa política de privacidade, respeitando a LGPD (Lei Geral de Proteção de Dados).
                    </p>

                    <h2>3. Exclusão de Conta</h2>
                    <p>
                        Você pode solicitar a exclusão da sua conta a qualquer momento através da página de Perfil.
                        Ao excluir sua conta, todos os seus dados serão permanentemente apagados dos nossos sistemas.
                    </p>

                    <h2>4. Alterações nos Termos</h2>
                    <p>
                        Podemos atualizar estes termos periodicamente. Recomendamos que você revise os termos regularmente para se manter informado sobre quaisquer alterações.
                    </p>

                    <h2>5. Uso Indevido</h2>
                    <p>
                        O uso indevido da plataforma, como tentativa de violação de segurança ou atos ilícitos, poderá resultar no encerramento imediato da conta.
                    </p>

                    <h2>6. Contato</h2>
                    <p>
                        Em caso de dúvidas ou solicitações relacionadas aos termos de uso, entre em contato pelo nosso suporte.
                    </p>

                    <p className="thanks">Obrigado por fazer parte do Furia+!</p>
                    
                    <button onClick={onClose} className="close-button">
                        fechar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TermsModal;
