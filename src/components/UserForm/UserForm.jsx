import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { setFurias } from "../../slices/userSlice";
import { getDoc, increment, updateDoc } from "firebase/firestore";
import './UserForm.css';
import Loader from "../Loader/Loader";

function UserForm({ userData, userRef }) {
    const dispatch = useDispatch();
    const { register, handleSubmit, reset } = useForm();
    const [isProcessing, setIsProcessing] = useState(false);
    const userName = userData?.userName;
    const isProfileCompleted = userData?.address;

    const onSubmit = async (data) => {
        setIsProcessing(true);

        try {
            // Adiciona 100 furias ao saldo no firebase
            await updateDoc(userRef, {
                furias: increment(100),
                ...data
            })

            // Atualiza a quantidade de furias no redux de acordo com o firebase
            const updatedSnap = await getDoc(userRef);
            dispatch(setFurias(updatedSnap.data().furias));

            reset();
        } catch (error) {
            console.error("Erro ao salvar dados no Firebase:", error);
        }

        setIsProcessing(false)
    };

    if (isProfileCompleted) {
        return (
            <div className="user-form-container completed-card">
                <h2>Formulário completo!</h2>
                <p>{userName} você já garantiu <strong>+100 Furias 🔥</strong>.<br />Tudo certo por aqui!</p>
                <div className="emoji-feedback">🎉</div>
            </div>
        );
    }

    return (
        <div className="user-form-container">
            <h2>Complete seu perfil e ganhe +100 Fúrias</h2>
            <form className="user-form" onSubmit={handleSubmit(onSubmit)}>

                <label>📍 Onde você mora? Apenas cidade, estado e país</label>
                <input {...register("address")} placeholder="Cidade, estado, país" required />

                <label>🎯 Quais são seus interesses? Seja criativo, queremos saber mais sobre você</label>
                <textarea
                    {...register("interests")}
                    placeholder="Ex: Gosto de CS2, academia..."
                    rows={3}
                />

                <label>🎟️ Eventos que você curte ou gostaria de ir?</label>
                <textarea
                    {...register("events")}
                    placeholder="Ex: Meet & Greet, bootcamps..."
                    rows={3}
                />

                <label>🐱‍👤 Qual time da FURIA você mais acompanha?</label>
                <input
                    {...register("team")}
                    placeholder="Ex: CS2, Valorant..."
                    required
                />

                <label>📱 Número de celular</label>
                <input
                    {...register("phone")}
                    placeholder="(99) 99999-9999"
                    type="tel"
                    required
                />

                <label>🌐 Suas redes sociais</label>
                <input
                    {...register("socials")}
                    placeholder="Instagram, Twitter..."
                    type="text"
                />

                <button type="submit" className="submit-button">
                    Enviar e ganhar Fúrias 🔥
                </button>
            </form>

            {isProcessing && <Loader />}
        </div>
    );
}

export default UserForm;
