// firebase.js
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyDVmp6c4_9gg_nyIvkLPvy9BE4U5DlDP2w",
    authDomain: "royal-booking-e6050.firebaseapp.com",
    projectId: "royal-booking-e6050",
    storageBucket: "royal-booking-e6050.firebasestorage.app",
    messagingSenderId: "868870824428",
    appId: "1:868870824428:web:58442b53ee5fbd847960c9"
  });
}

const db = firebase.firestore();