import { initializeApp } from "firebase/app"
import {
  connectFirestoreEmulator,
  doc,
  getFirestore,
  setDoc,
} from "firebase/firestore"

import { connectAuthEmulator, getAuth, signInAnonymously } from "firebase/auth"
import { connectFunctionsEmulator, getFunctions } from "firebase/functions"
import { firebaseConfig } from "./config"

const app = initializeApp(firebaseConfig)

const auth = getAuth()
const functions = getFunctions()
const db = getFirestore(app)

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
  connectFirestoreEmulator(db, "127.0.0.1", 8080)
}

auth.onAuthStateChanged((user) => {
  if (user) {
    const uid = user.uid
    let pageName = window.location.pathname
    if (pageName != "/") {
      pageName = pageName.replace("/", "")
      setDoc(doc(db, "users", uid), { uid, [pageName]: true }, { merge: true })
        .then(() => console.log("visit logged!"))
        .catch((e) => console.error(e))
    }
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
