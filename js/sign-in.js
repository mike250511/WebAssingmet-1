import { auth } from "./fireBaseConfig.js";
import { signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";


const provider = new GoogleAuthProvider();

const signInBtn = document.getElementById("sign-in");

function signIn () {
    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            localStorage.setItem("credential", JSON.stringify(credential));
            window.location = "booklog.html";
        }) 
        .catch((error) => {
            console.log("Something went wrong" + error);
        });
}

signInBtn.addEventListener("click", function (event) {
    console.log("Sing In button is pressed");
    signIn(auth, provider);
});

console.log("signIn.js initialized");



