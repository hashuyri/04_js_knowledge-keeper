import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot,
    query,
    orderBy
    // 1行目とバージョンを一致させる
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// GitHubにpushするときは下記情報を削除する
const firebaseConfig = {
    apiKey: "AIzaSyCcZtwaZn9SBjlKQYSQnhKo2Xh1wdlxk84",
    authDomain: "knowledge-keeper-app.firebaseapp.com",
    projectId: "knowledge-keeper-app",
    storageBucket: "knowledge-keeper-app.appspot.com",
    messagingSenderId: "145780451584",
    appId: "1:145780451584:web:21f11f847ad9576891abe5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 日時をいい感じの形式にする関数
function convertTimestampToDatetime(timestamp) {
    const _d = timestamp ? new Date(timestamp * 1000) : new Date();
    const Y = _d.getFullYear();
    const m = (_d.getMonth() + 1).toString().padStart(2, '0');
    const d = _d.getDate().toString().padStart(2, '0');
    const H = _d.getHours().toString().padStart(2, '0');
    const i = _d.getMinutes().toString().padStart(2, '0');
    const s = _d.getSeconds().toString().padStart(2, '0');
    return `${Y}/${m}/${d} ${H}:${i}:${s}`;
}

// プルダウンを作成する
function pullDownset(id) {
    const pullDown = [`
        <option value ="null"></option>
        <option value="pull1">法人税</option>
        <option value="pull2">消費税</option>
        <option value="pull3">地方税</option>
        <option value="pull4">相続税</option>
        <option value="pull5">贈与税</option>
        <option value="pull6">印紙税</option>
        <option value="pull7">共通</option>
    `];
    $(id).append(pullDown);
}

// プルダウンの設定
pullDownset(tax);
pullDownset(searchTax);

// 各項目の入力値を取り出し、要素を空にする
function sendContents() {
    // 「税目」か「ナレッジ」が入力されていなければアラートを出して強調する
    if ($("#tax option:selected").text() === "" || $("#text").val() === "") {
        if ($("#tax option:selected").text() === "") {
            alert("該当する税目を選んでください！");
            $("#tax").css("background-color", "rgb(248, 227, 227)");
        }
        if ($("#text").val() === "") {
            alert("共有したいナレッジを入力してください！");
            $("#text").css("background-color", "rgb(248, 227, 227)");
        }
        return;
    } else {
        const postData = {
            tax: $("#tax option:selected").text(),
            tittle: $("#tittle").val(),
            article: $("#article").val(),
            text: $("#text").val().replace(/\r\n|\r|\n/g, '<br>'), // 改行を<br>に変換する
            time: serverTimestamp()
        }
        addDoc(collection(db, "knowledgeKeeper"), postData);
        $("#tax").val("");
        $("#tittle").val("");
        $("#article").val("");
        $("#text").val("");
        $("#tax").css("background-color", "white");
        $("#text").css("background-color", "white");
    }
}

// Enterキーを押した場合
$(".contents").on("keydown", function (e) {
    // 「コントロール＋エンター」で送信
    if (e.keyCode === 13 && e.ctrlKey) {
        sendContents();
    }
});

// 「send」を押した場合
$("#send").on("click", function () {
    sendContents();
})

// オブジェクト配列化する
function getData(querySnapshot) {
    const documents = [];
    querySnapshot.docs.map(function (doc) {
        const document = {
            id: doc.id,
            data: doc.data(),
        };
        documents.push(document);
    });
    return documents;
}

// 画面に表示するためのhtmlを配列に格納する
function listContents(htmlElements, document) {
    htmlElements.push(`
    <li id="${document.id}">
    <p id="main_tittle">${document.data.tittle}</p>
    <p>＜${document.data.tax}＞　${document.data.article}</p>
    <p>${document.data.text}</p>
    <p id="timestamp">${convertTimestampToDatetime(document.data.time.seconds)}</p>
    </li>
    `);
}

// ファイヤーベースからデータを取得し画面に表示する
function display() {
    // onSnapshot：初期スナップショットからの変更分のみを取得する
    onSnapshot(q, (querySnapshot) => {
        const documents = getData(querySnapshot);

        const htmlElements = [];
        documents.forEach(function (document) {
            listContents(htmlElements, document);
        });

        $("#output").html(htmlElements);
    });
}

// データ取得処理
const q = query(collection(db, "knowledgeKeeper"), orderBy("time", "desc"));
console.log(q);
display();

// 条件を設定して検索する
function search() {
    const tax = $("#searchTax option:selected").text();
    const keyword = $("#searchWord").val();
    if (tax === "" && keyword === "") {
        display();
    } else {
        onSnapshot(q, (querySnapshot) => {
            const documents = getData(querySnapshot);
            const htmlElements = [];

            documents.forEach(function (document) {
                if (keyword === "") { // 税目と一致するコンテンツを取得
                    if (document.data.tax === tax) {
                        listContents(htmlElements, document);
                    }
                } else if (tax === "") { // 検索キーワードを含むコンテンツを取得
                    if (document.data.tittle.includes(keyword) || document.data.article.includes(keyword) ||
                        document.data.text.includes(keyword)) {
                        listContents(htmlElements, document);
                    }
                } else if (tax != "" && keyword != "") { // 税目と一致しかつ検索キーワードを含むコンテンツを取得
                    if (document.data.tax === tax && (document.data.tittle.includes(keyword) ||
                        document.data.article.includes(keyword) || document.data.text.includes(keyword))) {
                        listContents(htmlElements, document);
                    }
                }
            });

            $("#output").html(htmlElements);
        });
    }
}

$(".searchContents").on("keydown", function (e) {
    // 「コントロール＋エンター」で送信
    if (e.keyCode === 13 && e.ctrlKey) {
        search();
    }
});

$("#searchBtn").on("click", function () {
    search();
});

// 
$("#toggleBtn").on("click", function () {
    $("#togglebox").slideToggle();
    $(this).text("＋");
    // トグルボタンにクラスをつける（削除する）
    $(this).toggleClass("toggleorder");
    $("#toggleBtn.toggleorder").text("—");
});