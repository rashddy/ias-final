import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { resolve } from 'path'

let initialized = false

export function initFirebaseAdmin() {
  if (initialized) return admin

  const credentialsPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  const credentialsJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON

  if (credentialsJson) {
    const serviceAccount = JSON.parse(credentialsJson)
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  } else if (credentialsPath) {
    const absolutePath = resolve(credentialsPath)
    const serviceAccount = JSON.parse(readFileSync(absolutePath, 'utf8'))
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  } else {
    throw new Error(
      'Firebase Admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON.'
    )
  }

  initialized = true
  return admin
}

export function getAuth() {
  return initFirebaseAdmin().auth()
}
