"use strict";

var stream = require('stream');
var request = require('request');
var parseString = require('xml2js').parseString;


/**
 * 音声合成APIHelperクラス
 */
class Text2Speech {

  static createDefault() {
    return new Text2Speech(
      process.env.RECAIUS_ID || 'YOUR_RECAIUS_ID',
      process.env.RECAIUS_PASSWORD || 'YOUR_RECAIUS_PASSWORD'
      );
  }
  
  /**
   * 初期化設定
   * @param {string} [url] - url of SpeechSystem 'http(s)://server_address:port_number/'
   * @param {string} [id] - id of SpeechSystem that used synthesize request
   * @param {string} [password] - password of SpeechSystem that used synthesize request
   */
  constructor(id, password) {
    this.url = 'https://api.recaius.jp/tts/v1';
    this.id = id;
    this.password = password;

    this.plainText2speechwavePath = '/plaintext2speechwave';
    this.phonetictext2speechwavePath = '/phonetictext2speechwave';
    this.getSpeakerListPath = '/get_speaker_list';
    this.plaintext2phonetictextPath = '/plaintext2phonetictext';

  }
  
  /**
   * プレーンテキスト→合成音声変換
   * @param {string} [text] - when default value, always fail
   * @param {?Object} options - by default, lang:ja_JP, speaker_id:ja_JP-TSB-f00002, codec:m4a 
   * @return {Promise<Stream, Object>} if successful, call resolve with read stream
   */
  plainText2speechwaveStream(
    text,
    options
    ) {
    //default settings
    var settings = {
      lang: 'ja_JP',
      speaker_id: 'ja_JP-TSB-f00002',
      codec: 'audio/x-m4a'
    };

    if (typeof options !== 'undefined') {
      Object.keys(options).forEach((key) => {
        settings[key] = options[key];
      });
    }

    return new Promise((resolve, reject) => {

      if (text.length == 0 || this.url.length == 0 || this.id.length == 0) {
        reject();
      } else {
        var uri = `${this.url}${this.plainText2speechwavePath}`;
        var body = {
          id: this.id,
          password: this.password,
          plain_text: text,
          lang: settings.lang,
          speaker_id: settings.speaker_id,
          speed: settings.speed,
          codec: settings.codec
        };

        var emotion = settings.emotion;
        switch (emotion) {
          case 'angry': body.angry = 100; break;
          case 'sad': body.sad = 100; break;
          case 'happy': body.happy = 100; break;
          case 'fear': body.fear = 100; break;
          case 'tender': body.tender = 100; break;
          default: ;
        }
        
        //RECAIUSからのレスポンスデータ保持オブジェクト
        var speechData = {};

        //RECAIUSへのリクエスト結果をストリームとして受け取る
        speechData.dataStream = request({
          uri: uri,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body),
          encoding: null
        })
          .on('error', function (error) {
            reject(error);
          })
          .pipe(new stream.PassThrough());

        resolve(speechData);
      }
    });
  }

  /**
   * 読み調整テキスト→合成音声変換
   * @param {string} [text] - when default value, always fail
   * @param {?Object} options - by default, lang:ja_JP, speaker_id:ja_JP-TSB-f00002, codec:m4a 
   * @return {Promise<Stream, Object>} if successful, call resolve with read stream
   */
  phoneticText2speechwaveStream(
    text,
    options
    ) {
    var settings = {
      lang: 'ja_JP',
      speaker_id: 'ja_JP-TSB-f00002',
      codec: 'audio/x-m4a'
    };

    if (typeof options !== 'undefined') {
      Object.keys(options).forEach((key) => {
        settings[key] = options[key];
      });
    }

    return new Promise((resolve, reject) => {

      if (text.length == 0 || this.url.length == 0 || this.id.length == 0) {
        reject();
      } else {
        var uri = `${this.url}${this.phonetictext2speechwavePath}`;

        var body = {
          id: this.id,
          password: this.password,
          phonetic_text: text,
          lang: settings.lang,
          speaker_id: settings.speaker_id,
          codec: settings.codec
        };    

        //RECAIUSからのレスポンスデータ保持オブジェクト
        var speechData = {};

        //RECAIUSにPOSTリクエスト
        speechData.dataStream = request({
          uri: uri,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body),
          encoding: null
        })
          .on('error', function (error) {
            reject(error);
          })
          .pipe(new stream.PassThrough());

        resolve(speechData);

      }

    });
  }

  /**
   * 話者リスト一覧
   * @param {?string} lang - speaker's lang
   * @return {Promise<[Object], Object>} if successful, call resolve with array of speakers
   */
  getSpeakerList(lang) {

    return new Promise((resolve, reject) => {
      var uri = `${this.url}${this.getSpeakerListPath}`;

      var body = {
        id: this.id,
        password: this.password
      };

      request({
        uri: uri,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      },
        (error, response, body) => {

          if (!error && response.statusCode == 200) {

            parseString(body, (error, result) => {
              if (error) {
                reject(error);
              } else {
                parseString(result.response.body[0], (error, result) => {
                  if (error) {
                    reject(error);
                  } else {
                    var speakers = result.speaker_group.speaker.map((speaker) => {
                      var regex = new RegExp("\\w{2}_\\w{2}:", 'g');
                      return {
                        speaker_id: speaker.speaker_id[0],
                        alias: speaker.alias[0].replace(regex, ''),
                        lang: speaker.lang[0],
                        style: speaker.style[0].replace(regex, ''),
                        emotion: speaker.emotion[0].replace(regex, ''),
                        description: speaker.description[0].replace(regex, '')
                      };
                    });

                    if (lang) {
                      speakers = speakers.filter((speaker) => {
                        if (speaker.lang == lang) {
                          return true;
                        } else {
                          return false;
                        }
                      });
                    }

                    resolve(speakers);
                  }
                });
              }
            });

          } else {
            reject(error);
          }

        });
    });

  }


  /**
   * プレーンテキスト→読み調整テキスト 
   * @param {string} [text] - when default value, always fail
   * @param {?Object} options - by default, lang:ja_JP 
   * @return {Promise<[Object], Object>} if successful, call resolve with phonetic text
   */
  plainText2PhoneticText(text, options) {

    return new Promise((resolve, reject) => {
      var uri = `${this.url}${this.plaintext2phonetictextPath}`;

      var settings = {
        lang: 'ja_JP'
      };

      if (typeof options !== 'undefined') {
        Object.keys(options).forEach((key) => {
          settings[key] = options[key];
        });
      }

      var body = {
        id: this.id,
        password: this.password,
        plain_text: text,
        lang: settings.lang
      };

      request({
        uri: uri,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      },
        (error, response, body) => {

          if (!error && response.statusCode == 200) {
            var phoneticText = {
              phoneticText: body
            };
            resolve(phoneticText);
          } else {
            reject(error);
          }
        });
    });
  }
};

module.exports = Text2Speech;
