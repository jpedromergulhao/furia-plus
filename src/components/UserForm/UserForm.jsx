import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { addFurias } from "../../slices/userSlice";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import Particles from "react-tsparticles";
import { loadFirePreset } from "tsparticles-preset-fire";

import './UserForm.css';

function UserForm() {
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.user);
    const { register, handleSubmit, reset } = useForm();
    const userName = currentUser.name?.split(" ")[0] || "FURIA Fan";
    const isProfileCompleted = currentUser?.address;

    const [showParticles, setShowParticles] = useState(false);

    const particlesInit = async (engine) => {
        await loadFirePreset(engine);
    };

    const onSubmit = async (data) => {
        try {
            const updatedUser = {
                ...currentUser,
                ...data,
                furias: currentUser.furias + 100,
            };

            await setDoc(doc(db, "users", currentUser.id), updatedUser);
            dispatch(addFurias(100));
            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 5000); 
            reset();
        } catch (error) {
            console.error("Erro ao salvar dados no Firebase:", error);
        }
    };

    if (isProfileCompleted) {
        return (
            <div className="user-form-container completed-card">
                <h2>Formulário completo!</h2>
                <p>{userName} você já garantiu <strong>+100 Fúrias 🔥</strong>.<br />Tudo certo por aqui!</p>
                <div className="emoji-feedback">🎉</div>
                {showParticles && (
                    <Particles
                        id="tsparticles"
                        init={particlesInit}
                        options={{
                            preset: "fire",
                            background: { color: "#000000" },
                            fullScreen: { enable: true, zIndex: 1 },
                            particles: {
                                color: { value: "#7C3AED" } 
                            }
                        }}
                    />
                )}
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
            {showParticles && (
                <Particles
                    id="tsparticles"
                    init={particlesInit}
                    options={{
                        preset: "fire",
                        background: { color: "#000000" },
                        fullScreen: { enable: true, zIndex: 1 },
                        particles: {
                            color: { value: "#7C3AED" } 
                        }
                    }}
                />
            )}
        </div>
    );
}

export default UserForm;
