import { initializeApp } from "firebase/app"
import { connectAuthEmulator, getAuth, signInAnonymously } from "firebase/auth"
import { connectFunctionsEmulator, getFunctions } from "firebase/functions"
import { firebaseConfig } from "./config"

initializeApp(firebaseConfig)

const auth = getAuth()
const functions = getFunctions()

const isLocal = window.location.hostname === "localhost"
const projectId = firebaseConfig.projectId
const baseURL = isLocal
  ? `http://127.0.0.1:5001/${projectId}/us-central1`
  : `https://us-central1-${projectId}.cloudfunctions.net`

document.head.innerHTML += `<link rel="alternate" type="application/json+oembed" href="${baseURL}/oEmbed?url=${encodeURIComponent(
  window.location.href
)}&format=json" title="${document.title}" />`
document.head.innerHTML += `<link rel="alternate" type="application/xml+oembed" href="${baseURL}/oEmbed?url=${encodeURIComponent(
  window.location.href
)}&format=xml" title="${document.title}" />`

document.body.innerHTML += `<a href="${baseURL}/oEmbed?url=${encodeURIComponent(
  window.location.href
)}&format=json">JSON oEmbed</a>`
document.body.innerHTML += "<br />"
document.body.innerHTML += `<a href="${baseURL}/oEmbed?url=${encodeURIComponent(
  window.location.href
)}&format=xml">XML oEmbed</a>`

if (isLocal) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099")
  connectFunctionsEmulator(functions, "127.0.0.1", 5001)
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
