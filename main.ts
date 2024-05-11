import { initializeApp } from "firebase/app"
import { connectAuthEmulator, getAuth, signInAnonymously } from "firebase/auth"
import { firebaseConfig } from "./config"

initializeApp(firebaseConfig)

const auth = getAuth()

if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099")
}

auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("Signed in as", user.uid)
  } else {
    console.log(
      "There was no anonymous session. Creating a new anonymous user."
    )
    signInAnonymously(auth).catch((error) => {
      if (error.code === "auth/operation-not-allowed") {
        window.alert(
          "Anonymous Sign-in failed. Please make sure that you have enabled anonymous " +
            "sign-in on your Firebase project."
        )
      } else {
        console.error(error)
      }
    })
  }
})
