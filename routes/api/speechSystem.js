"use strict";

var express = require('express');
var router = express.Router();

var recaius = require('../../lib/recaius/text2speech');


/**
* RECAIUSのAPIをラップするAPI
* RECAIUSの音声合成APIはID/passwordを常に送る必要があるため、ブラウザから直接利用しない。
* RECAIUSのAPIはPOSTインターフェースなので、ブラウザのaudioタグから直接呼び出せるようにGetでインターフェースを用意する
*/
router.get('/', function (req, res, next) {

	var speaker_id = req.query.speaker_id;
	var text = req.query.text;
	var speeking_rate = req.query.speeking_rate;
	var emotion = req.query.emotion;

	var speechSystem = recaius.createDefault();

	if (text && text.length <= 1500) {
		var options = {
			speaker_id: speaker_id,
			speed: speeking_rate,
			emotion: emotion
        };

		speechSystem.plainText2speechwaveStream(text, options)
			.then(
				(speechData) => {
				
					//RECAIUSから受けたストリームを動的に配信
					res.setHeader("Transfer-Encoding", "chunked");
                                        res.setHeader("Content-Type", "audio/x-m4a");
					speechData.dataStream
						.on('data', function (chunk) {
							res.write(chunk, "binary");
						})
						.on('end', function () {
							res.end();
						});
				},
				(error) => {
					res.status(500).send({
						message: 'Unknown error'
					});
				}
				);
	} else {
		res.status(400).send({
			message: 'Bad Request'
		});
	}

});

module.exports = router;
