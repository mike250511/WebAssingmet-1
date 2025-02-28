//auth.js
import { auth } from "./fireBaseConfig.js";
import { signInWithCredential, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";


export async function getUser() {
    let storedCredential = localStorage["credential"];

    try {
        let credential = GoogleAuthProvider.credential(
            JSON.parse(storedCredential).idToken,
        );
        
        let result = await signInWithCredential(auth, credential);
        return result.user;
    }   catch (error) {
        console.log("Something went wrong: " + error);
    }
}

console.log("auth.js initialized");

