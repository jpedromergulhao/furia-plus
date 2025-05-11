import React from "react";
import './SocialLogin.css';
import googleIcon from '../../assets/Google.png';
import facebookIcon from '../../assets/facebook.png';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { auth, db, googleProvider, facebookProvider } from "../../firebase";
import { setFurias, setLastLoginDate, setLoginStreak, setUser } from "../../slices/userSlice";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc, increment } from "firebase/firestore";
import { format } from "date-fns"

function SocialLogin() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const loginSocial = async (provider) => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Pega dados do Firestore
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
                    usedCoupons: userData.usedCoupons || [],
                    unlockedWallpapers: userData.unlockedWallpapers || [],
                    loginStreak: userData.loginStreak || 0,
                    lastLoginDate: userData.lastLoginDate || null,
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
                    console.error("Erro ao atualizar o firebase no login social: ", err);
                }
            } else {
                const displayName = user.displayName || "";
                const nameParts = displayName.trim().split(" ");
                const name = nameParts[0] || "Usuário(a)";
                const surname = nameParts.slice(1).join(" ") || "";

                // Cria um novo usuário
                const newUser = {
                    name: name,
                    surname: surname,
                    email: user.email || "",
                    profilePic: user.photoURL || null,
                    furias: Math.floor(Math.random() * 201),
                    id: user.uid,
                    availableRewards: [],
                    availableQuizzes: [],
                    availableChallenges: [],
                    usedCoupons: [],
                    unlockedWallpapers: [],
                    loginStreak: 1,
                    lastLoginDate: format(new Date(), "yyyy-MM-dd")
                };

                try {
                    // Cria o usuáro no firebase 
                    await setDoc(userRef, newUser);

                    // Salva no Redux
                    dispatch(setUser(newUser));

                    // Pega o usuário atualizado
                    const updatedSnap = await getDoc(userRef);
                    const updatedData = updatedSnap.data();

                    // Atualiza Redux
                    dispatch(setLoginStreak(updatedData.loginStreak));
                    dispatch(setLastLoginDate(updatedData.lastLoginDate));

                    navigate("/home");
                } catch (err) {
                    console.error("Erro ao criar o usuário: " + err)
                }
            }
        } catch (error) {
            console.error("Erro no login social:", error);
            alert("⚠️ Não foi possível entrar. Que tal tentar de novo ou usar outro método?");
        }
    };

    return (
        <div className="social-login">
            <button aria-label="Fazer login com o Google" onClick={() => loginSocial(googleProvider)}>
                <img src={googleIcon} alt="Google" loading="lazy" />
            </button>
            <button aria-label="Fazer login com o Facebook" onClick={() => loginSocial(facebookProvider)}>
                <img src={facebookIcon} alt="Facebook" loading="lazy" />
            </button>
        </div>
    );
}

export default SocialLogin;