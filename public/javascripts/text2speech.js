var ua = window.navigator.userAgent.toLowerCase();
 
// IE かどうか判定
var isIE = (ua.indexOf('msie') >= 0 || ua.indexOf('trident') >= 0 || ua.indexOf('edge') >= 0);

var speechButton //Speechボタン
var textFormGroup //テキストフィールドDiv
var textTextView//テキストフォーム
var speekingRate 　//話す早さスライダー
var speakerSelector //話者セレクター
var emotionSelecter //話者毎対応感情
var emotion //感情
var playingFlag = false; //再生中フラグ

$(function () {

	speechButton = $('#js-speech-button');
	textFormGroup = $('#js-text-form-group');
	textTextView = $('#js-text-textview');
	speekingRate = $('#js-speeking-rate');
	speakerSelector = $('#js-speaker-selector');
	emotionSelecter = $('#js-emotion-selector');
	emotion = $('#js-emotion');
	
	// 感情リスト更新
	setEmotionList();
	
	// 話者変更時に感情リスト更新
	speakerSelector.on('change', function (e) {
		setEmotionList();
	});
	
	// IEはWebAudioが使えないため、Audioエレメントを利用
	if (isIE) {
		playOnTheAudio();
	} else {
		// IE以外はWebAudio利用
		playOnTheWebAudio();
	}
});
	
/**
 * 話者毎の感情リストを設定する
 */
function setEmotionList() {

	emotionSelecter.val(speakerSelector.val());
	var emotionList = $('#js-emotion-selector option:selected').text();
	emotion.children().remove();
	emotion.append($('<option>').html("標準").val("default"));
	if (emotionList.indexOf('happy') != -1) {
		emotion.append($('<option>').html("喜び").val("happy"));
	}
	if (emotionList.indexOf('angry') != -1) {
		emotion.append($('<option>').html("怒り").val("angry"));
	}
	if (emotionList.indexOf('sad') != -1) {
		emotion.append($('<option>').html("悲しみ").val("sad"));
	}
	if (emotionList.indexOf('fear') != -1) {
		emotion.append($('<option>').html("怖れ").val("fear"));
	}
	if (emotionList.indexOf('tender') != -1) {
		emotion.append($('<option>').html("優しさ").val("tender"));
	}
}

/**
 * Audio要素を作って再生する
 */
function playOnTheAudio() {
	
	//合成音声再生用オーディオエレメント
	var audioElement = document.createElement('audio');
	audioElement.autoplay = false;
	audioElement.preload = "none";

	speechButton.on('click', function (e) {
		var speechRequest = {};
		speechRequest.text = textTextView.val();
		speechRequest.speaker_id = speakerSelector.val();
		speechRequest.speeking_rate = speekingRate.val();
        speechRequest.emotion = emotion.val();

		if (audioElement.paused || audioElement.ended) {
			var isValid = validateForm();
			
			//audioのソースに音声合成APIのラッピングAPIを指定
			if (isValid) {
				var apiRequest = '/api/speechSystem?speaker_id=' + speechRequest.speaker_id + '&text=' + encodeURIComponent(speechRequest.text) + '&speeking_rate=' + speechRequest.speeking_rate + '&emotion=' + speechRequest.emotion;
				audioElement.src = apiRequest;
				audioElement.play();
				showStopButton();
			}
		} else {
			audioElement.pause();
			showSpeechButton();
		}
	});
	
	//再生が終了したらボタンのラベルを変更
	audioElement.addEventListener("ended", function () {
		showSpeechButton();
	});
};



/**
 * AudioContext要素(WebAudio)を作って再生する
 */
function playOnTheWebAudio() {

	var context;
	speechButton.on('click', function (e) {

		if (!playingFlag) {

			var isValid = validateForm();
			if (isValid) {
				var AudioContext;
				try {
					AudioContext = window.AudioContext || window.webkitAudioContext;
				} catch (e) {
					throw new Error('Web Audio API is not supported.');
				}
				context = new AudioContext();

				playingFlag = true; //再生中フラグON
				
				//iOS用のおまじない
				//Clickイベント内で一度BufferSourceを再生させておく
				context.createBufferSource().start(0);
			
				//APIリクストクエリ
				var speechRequest = {};
				speechRequest.text = textTextView.val();
				speechRequest.speaker_id = speakerSelector.val();
				speechRequest.speeking_rate = speekingRate.val();
				speechRequest.emotion = emotion.val();
				// 音声データバッファ
				var audioBuffer;
				// APIリクエストURL
				var synthesizerUrl = '/api/speechSystem?speaker_id=' + speechRequest.speaker_id + '&text=' + encodeURIComponent(speechRequest.text) + '&speeking_rate=' + speechRequest.speeking_rate + '&emotion=' + speechRequest.emotion;
	
				// 音声ファイルのロード
				var request = new XMLHttpRequest();
				request.open('GET', synthesizerUrl, true);
				request.responseType = 'arraybuffer'; // ArrayBufferとしてロード
				request.send();
				request.onload = function () {
					var source = context.createBufferSource();
					// contextにArrayBufferを渡し、decodeさせる
					context.decodeAudioData(request.response, function (buf) {
						audioBuffer = buf;
						source.buffer = audioBuffer;
						source.connect(context.destination);
						source.start(0);
						source.onended = function () {
							//再生が終了したらボタンのラベルを変更
							playingFlag = false;
							//コンテキストは都度破棄
							context.close();
							showSpeechButton();

						}

						showStopButton();

					});
				};
				request.onerror = function () {
					playingFlag = false;
					showSpeechButton();
				}

			}

		} else {
			playingFlag = false;
			context.close();
			showSpeechButton();
		}
	});
}

/**
 * バリデーション
 */
var validateForm = function () {
	var isValid = true;

	if (textTextView.val().length == 0) {
		textFormGroup.addClass('has-error');
		isValid = false;
	} else {
		textFormGroup.removeClass('has-error');
	}
	return isValid;

}

/**
 * 停止ボタン表示
 */
function showStopButton() {
	speechButton.html("Stop");
	speechButton.removeClass('btn-primary');
	speechButton.addClass('btn-info');
}

/**
 * 再生ボタン表示
 */
function showSpeechButton() {
	speechButton.html("Speech");
	speechButton.removeClass('btn-info');
	speechButton.addClass('btn-primary');
}