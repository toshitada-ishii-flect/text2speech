RECAIUS音声合成APIサンプルアプリケーション
====

このプロジェクトは、RECAIUSの音声合成APIの利用方法を理解するためのサンプルアプリケーションです。

## Description
このプロジェクトのアプリケーションを動作させる場合は、事前にRECAIUS APIのディベロッパー登録が必要です。
登録は、[こちらのサイト](https://developer.recaius.io/jp/top.html)から行えます。

ディレクトリの構成は下記のとおりです。

```
bin/
  www                 // 実行スクリプト
lib/                  // ライブラリ
  recaius/            // RECAIUS WebAPIのHelperクラス
    text2speech/      // 音声合成API
      index.js
public/               // フロント向けリソース
  javascript/
    text2speech.js
  styleseet/
    style.css
routes/               // ルーティング
  api/                // WebAPI
  page/               // Webページ
  index.js            // 
views/                // 画面のテンプレート
  layout.jade         // 共通テンプレート
  text2speech.jade    // 音声合成サンプル画面テンプレート
```
## Demo
このアプリケーションを起動すると下記のサイトと同じような機能を試せます。

[https://app.developer.recaius.io/text2speech](https://app.developer.recaius.io/text2speech)

## Requirement
[node.js](https://nodejs.org/en/)をインストールして下さい。
推奨バージョンは4.2.3です。(2016年2月現在)

## Usage & Install
[ディベロッパーサイトのチュートリアル](https://developer.recaius.io/jp/tutorial.html)を参考にして下さい。

RECAIUS Developerサイトから送られてくるログイン情報(ディベロッパーIDとパスワード)は、プログラムに直接書き込むのではなく、環境変数に設定することをおすすめします。

なお、ログイン情報は、/lib/recaius/text2speech/index.js で利用されています。

```js
    static createDefault() {
      return new Text2speech(
        process.env.RECAIUS_ID || 'YOUR_RECAIUS_DEVELOPER_ID',                 //RECAIUSの開発者ID
        process.env.RECAIUS_PASSWORD || 'YOUR_RECAIUS_DEVELOPER_PASSWORD'       //RECAIUSの開発者パスワード
        );
    }
```

## Licence
* MIT
    * This software is released under the MIT License, see LICENSE.txt.
本プログラムを利用して宣伝などを行う場合、[こちらのサイト](https://developer.recaius.io/jp/contact.html)からご連絡ください。

## Author

[recaius-dev-jp](https://github.com/recaius-dev-jp)
