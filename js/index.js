import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";

//Authentication関連コード
// Firebase Authenticationのインポート
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";

// GitHubにpushするときは下記情報を削除する
const firebaseConfig = {
    apiKey: "",
    authDomain: "knowledge-keeper-app.firebaseapp.com",
    projectId: "knowledge-keeper-app",
    storageBucket: "knowledge-keeper-app.appspot.com",
    messagingSenderId: "145780451584",
    appId: "1:145780451584:web:21f11f847ad9576891abe5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 新規登録関数
function signUpUser(email, password) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // 新規登録成功
            console.log("Account created for: ", userCredential.user);
        })
        .catch((error) => {
            //新規登録失敗
            console.error("Error in account creation: ", error);
        });
}

// ログイン関数
function loginUser(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // ログイン成功
            window.location.href = "main.html";
            console.log("Logged in as: ", userCredential.user);
        })
        .catch((error) => {
            //ログイン失敗
            console.error("Login failed: ", error);
        });
}

// ログイン状況確認
onAuthStateChanged(auth, (user) => {
    if (user) {
        // ログイン状態
        console.log("User is logged in: ", user);
    } else {
        // ログアウト状態
        console.log("User is logged out");
    }
});

// ログアウト関数
function logoutUser() {
    signOut(auth)
        .then(() => {
            window.location.href = "index.html";
            console.log("User logged out");
        })
        .catch((error) => {
            console.error("Error in logging out: ", error);
        });
}

// 新規登録ボタンのイベント
$('#signup-button').on('click', function () {
    const email = $('#signup-email').val();
    const password = $('#signup-password').val();
    signUpUser(email, password);
});

// ログインボタンのイベント
$('#login-button').on('click', function () {
    const email = $('#email').val();
    const password = $('#password').val();
    loginUser(email, password);
});

// ログアウトボタンのイベント
$('#logout-button').on('click', function () {
    logoutUser();
});