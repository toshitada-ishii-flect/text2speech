"use strict";

var express = require('express');
var router = express.Router();

var recaius = require('../../lib/recaius/text2speech');

/**
 * 音声合成サンプルアプリケーションページ
 */ 
router.get('/', function (req, res, next) {

  
  //話者リストを取得して画面をレンダリング
  var speechSystem = recaius.createDefault();
  speechSystem.getSpeakerList('ja_JP').then(
    (speakers) => {

      res.render('text2speech', {
        speakers: speakers
      });

    },
    (error) => {
      next(error);
    }
    );

});


module.exports = router;
