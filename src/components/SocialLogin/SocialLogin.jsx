import React from "react";
import './SocialLogin.css';
import googleIcon from '../../assets/Google.png';
import facebookIcon from '../../assets/facebook.png';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { auth, db, googleProvider, facebookProvider } from "../../firebase";
import { setUser } from "../../slices/userSlice";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function SocialLogin() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const loginSocial = async (provider) => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Pega dados do Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            let userData = {};

            if (userDoc.exists()) {
                userData = userDoc.data();
            }

            const completeUser = {
                name: user.displayName || userData.name || "Usuário",
                surname: userData.surname || "",
                email: user.email,
                profilePic: user.photoURL || userData.profilePic || "",
                furias: userData.furias || Math.floor(Math.random() * 201),
                id: user.uid,
                availableRewards: userData.availableRewards || [],
                availableChallenges: userData.availableChallenges || [],
                availableQuizzes: userData.availableQuizzes || []
            };

            dispatch(setUser(completeUser));
            navigate("/home");

        } catch (error) {
            console.error("Erro no login social:", error);
            alert("⚠️ Não foi possível entrar. Que tal tentar de novo ou usar outro método?");
        }
    };

    return (
        <div className="social-login">
            <button aria-label="Login com o Google" onClick={() => loginSocial(googleProvider)}>
                <img src={googleIcon} alt="Google" loading="lazy" />
            </button>
            <button aria-label="Login com o Facebook" onClick={() => loginSocial(facebookProvider)}>
                <img src={facebookIcon} alt="Facebook" loading="lazy" />
            </button>
        </div>
    );
}

export default SocialLogin;