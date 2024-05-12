import { firebaseConfig } from "./config"

const isLocal = window.location.hostname === "localhost"
const projectId = firebaseConfig.projectId
const baseURL = isLocal
  ? `http://127.0.0.1:5001/${projectId}/us-central1`
  : `https://us-central1-${projectId}.cloudfunctions.net`

const validMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"]

export const $HTTP = function (options: {
  method: string
  path: string
  query?: Record<string, string>
  data?: any
  headers?: Record<string, string>
}) {
  if (!validMethods.includes(options.method)) {
    throw new Error(`Invalid method: ${options.method}`)
  }

  if (options.query) {
    const query = new URLSearchParams(options.query)
    options.path += `?${query}`
  }

  const init = {
    method: options.method,
  } as RequestInit

  if (options.headers) {
    init.headers = options.headers
  }

  if (options.data) {
    init.body = JSON.stringify(options.data)
  }

  return fetch(`${baseURL}/${options.path}`, init)
}
