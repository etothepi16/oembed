import { initializeApp } from "firebase/app"
import { connectAuthEmulator, getAuth, signInAnonymously } from "firebase/auth"
import { connectFunctionsEmulator, getFunctions } from "firebase/functions"
import { $HTTP } from "./HTTP"
import { firebaseConfig } from "./config"

initializeApp(firebaseConfig)

const auth = getAuth()
const functions = getFunctions()

if (window.location.hostname === "localhost") {
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

const embedButton = document.getElementById("embed") as HTMLButtonElement
const embedForm = document.getElementById("embed-form") as HTMLFormElement
const embedResult = document.getElementById(
  "embed-result"
) as HTMLTextAreaElement

const loading = document.getElementById("loading") as HTMLDivElement

function oEmbedConsumer() {
  const url = embedForm.url.value as string
  const maxwidth = embedForm.maxwidth.value
  const maxheight = embedForm.maxheight.value
  const format = embedForm.format.value as "json" | "xml"

  loading.classList.toggle("hidden")
  embedResult.value = "Loading..."
  if (!url) {
    window.alert("Missing URL parameter")
    return
  }

  const query: {
    url: string
    format?: string
    maxwidth?: string
    maxheight?: string
  } = { url }

  if (format) {
    query.format = format
  }
  if (maxwidth) {
    query.maxwidth = maxwidth
  }
  if (maxheight) {
    query.maxheight = maxheight
  }

  $HTTP({
    method: "GET",
    path: "oEmbedConsumer",
    query,
  })
    .then((response) => {
      console.log("response: %o", response)
      if (response.headers.get("Content-Type") === "application/json") {
        response.json().then((json) => {
          embedResult.value = JSON.stringify(json, null, 2)
        })
      } else {
        response.text().then((text) => {
          embedResult.value = text
        })
      }
    })
    .catch((error) => {
      console.error(error)
    })
    .finally(() => {
      loading.classList.toggle("hidden")
    })
}
embedButton.addEventListener("click", (e) => {
  e.preventDefault()
  oEmbedConsumer()
})
