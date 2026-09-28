import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyChhOgm7rOHZSvovAwGZgXs8FEKdOL7MSo',
  authDomain: 'painel-rateio.firebaseapp.com',
  projectId: 'painel-rateio',
  storageBucket: 'painel-rateio.firebasestorage.app',
  messagingSenderId: '118266567866',
  appId: '1:118266567866:web:b80ec63b52531c451d3683',
}

export const app = initializeApp(firebaseConfig)
export const db  = getFirestore(app)
