<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML+RDFa 1.1//EN" "http://www.w3.org/MarkUp/DTD/xhtml-rdfa-2.dtd">
<html version="XHTML+RDFa 1.1" xmlns="http://www.w3.org/1999/xhtml" xml:lang="ru" lang="ru">
<head>
<title>Прототип редактора ГА</title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width" />
<link href="https://glav.su/themes/glav/flex.css" media="screen" rel="stylesheet" type="text/css" />
<link href="/themes/glav/styles/zoombox.css" media="screen" rel="stylesheet" type="text/css" />
<link href="/themes/glav/styles/sceditor.css" media="screen" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="jquery.3.1.1.min.js"></script>
<script type="text/javascript" src="jquery.ui.1.12.1.min.js"></script>
<script type="text/javascript" src="jquery.class.js"></script>
<script type="text/javascript" src="jquery.sceditor.bbcode.1.5.2.js"></script>
<script type="text/javascript" src="jquery.sceditor.ru.js.source"></script>
<script type="text/javascript" src="default.bbcodeform.js"></script>
<script type="text/javascript" src="default.bbcodeform.uploadimage.js"></script>
<script type="text/javascript" src="forum.messageform.js"></script>
<script type="text/javascript" src="forum.imgzoombox.js"></script>
<script type="text/javascript" src="/javascripts/libs/twitter.widjets.js"></script>
<script type="text/javascript">
    //<![CDATA[
    APP_URL = "http://sce.ru";
//    APP_URL = "http://alvig.ru/sce";
	CSRF_TOKEN = "0f72438b1865d6ac10f83edbfbf33cdd7ea3611b";
    //]]>
</script>
<script type="text/javascript">
var gxhr, zbox;
$(document).ready(function()
{
    new Forum.MessageForm();
    zbox = new Forum.ImgZoomBox();
    $('#jsParseButton').click(function()
    {
        var bbCode = $('#messageBBCodeForm textarea').sceditor('instance').val();
		$.ajax({
			url: APP_URL + '/ajax.php',
			type: 'POST',
			data: {'bbCode': bbCode},
			dataType: 'json',
			success: function(result){
	            console.log(result);
	            $('#postContent').empty().html(result.html);
	            //$('#postContent').append($(result.html));
	            init_funcs();
			},
			error: function(xhr, status, errstr){
				gxhr = xhr;
				console.log(xhr);
				console.log(status+': '+errstr);
			}
		});

    });
    // Затычка для upload-а картинок. Возвращает случайную из уже имеющихся на сервере.
    $.ajaxUpload = function(setts){
        setts['type'] = 'POST';
        $.ajax(setts);
        console.log(setts);
    };
//    var eD = $("#messageBBCodeForm").find("textarea").sceditor("instance");
//    $("#messageFormContentFieldWidget").change(function(){
//    	console.log($(this).val());
//    });

//	twttr.ready(function (twttr) {
//		twttr.events.bind('rendered', function (event) {
//			$(event.target).closest(".cBlockTwitter").css({
//				'width': "auto",
//				'height': "auto",
//				'background-color': "transparent"
//			});
//		});
//		twttr.widgets.load();
//	});

});

var init_funcs = function(){
	// спойлер
	$(".cBlockSpoilerHeaderOff").click(function(){
		var bc = ['cBlockSpoilerHeaderOn', 'cBlockSpoilerHeaderOff'],
			isVisible = +( $(this).next("div").toggle().is(":visible") );
		$(this).removeClass(bc[isVisible]).addClass(bc[+(!isVisible)]);
	});
	
	// Окукливание длинных цитат
	$(".cBlockQuoteContent").each(function(idx, bqc){
		if( bqc.scrollHeight > bqc.clientHeight ){
			$(bqc).parent().find(".cBlockQuoteFooter")
				.css({display: 'block'}).attr('state', "closed")
				.click(function(){
					if( $(this).attr('state') == "closed" ){
						$(bqc).css({'max-height': "none"});
						$(this).css('width', "24px").attr('state', "open");
						$(this).find(".cBlockQuoteToggle").css('background-position', "0 -20px");
					}else{
						$(bqc).css('max-height', "10em");
						$(this).css('width', "100%").attr('state', "closed");
						$(this).find(".cBlockQuoteToggle").css('background-position', "center 8px");
					}
				});
		}
	});

	if( twttr && twttr.widgets ){
		twttr.widgets.load();
	}
	
    //new Forum.ImgZoomBox();
    zbox.procImages();
}
</script>
<style>
* { border: 0; margin: 0; outline: 0; padding: 0; vertical-align: baseline; }
body, input, option, select, textarea { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.25em; }
table { border-collapse: collapse; border-spacing: 0px; }
td { vertical-align: top; }
.l { width: 100%; }
.l-b { margin: 10px 15px; }
.l-b a { color: #666; }
.l-b li { color: #666; display: inline; font-size: 90%; margin-right: 5px; }
.l-b ol { list-style-type: none; padding: 0px; }
.l-c { margin: 0px auto; max-width: 1010px; width: 100%; width: expression(document.body.clientWidth > 1011 ? "1010px" : "100%"); }
.l-f { margin: 0px 5px; padding: 20px 0px; }
.l-f-b { background-color: #ccc; }
.l-fm { margin: 0px 5px; padding: 10px 0px; }
.l-fm-b { background-color: #eee; }
.l-h { margin: 0px 5px; }
.l-h-b { background-color: #147; color: #fff; height: 50px; }
.l-mm-m-b { background-color: #036; height: 31px; }
.l-mm-m table { border-top: 1px solid #036; height: 30px; margin: 0px 5px; }
.l-mm-m a, .l-mm-m a:link, .l-mm-m a:visited { color: #fff; display: block; height: 30px; line-height: 30px; padding: 0px 10px; text-decoration: none; }
a.l-mm-m-i:hover, a.l-mm-m-i-a, a.l-mm-m-i-a:link, a.l-mm-m-i-a:visited, a.l-mm-m-i-h:hover { background-color: #eee; color: #036; text-decoration: none; }
a.l-mm-m-i-h { background-color: #c00; }
a.l-mm-m-i-asm, a.l-mm-m-i-asm:visited { background-color: #eee; }
.l-mm-sm a.l-mm-sm-i-a { font-weight: bold; }
.l-mm-sm table { height: 30px; margin: 0px 15px; }
.l-mm-sm td { padding-right: 10px; vertical-align: middle; }
.l-mm-sm td:last-child { padding-right: 0px; }
.l-mm-sm-b { background-color: #eee; height: 30px; }
.l-mm-s { display: none; }
.l-up { margin: 0px 5px; }
.l-up-b { background-color: #000; color: #fff; height: 30px; }
.l-h { display: none; }
.l-h-b { height: auto; }
.l-mm { display: none; }
.l-mm table { border: 0px; height: auto; margin: 0px; }
.l-mm tr.fRow { padding: 10px; }
.l-mm td.fItem { width: 100%; }
.l-mm a.l-mm-m-i-h { display: none; }
.l-mm-b { height: auto; }
.l-mm-s { align-items: center; background-color: #036; height: 44px; padding: 0px 10px; }
.l-mm-s-b { border: 1px solid #003; margin-left: auto; }
.l-mm-sm table { height: auto; }
.l-mm-sm tr.fRow { align-items: center; padding: 10px; }
.l-mm-sm td.fItem { margin-bottom: 5px; padding: 0px; width: 100%; }
.l-mm-sm-b { height: auto; }
.l-up { display: none; }
.l-up-b { height: auto; }
@media (min-width: 800px) {
    .l-h { display: block; }
    .l-h-b { height: 50px; }
    .l-mm { display: block; }
    .l-mm table { border-top: 1px solid #036; display: block; height: 30px; margin: 0px 5px; }
    .l-mm tr.fRow { padding: 0px; }
    .l-mm td.fItem { width: auto; }
    .l-mm a.l-mm-m-i-h { display: block; }
    .l-mm-b { height: 31px; }
    .l-mm-s { display: none; }
    .l-mm-sm table { height: 30px; margin: 0px 10px; }
    .l-mm-sm tr.fRow { align-items: center; height: 30px; padding: 0px 5px; }
    .l-mm-sm td.fItem { display: block; margin-right: 10px; padding: 0px; width: auto; }
    .l-mm-sm td.fItem:last-child { margin-right: 0px; }
    .l-mm-sm-b { height: 30px; }
    .l-up { display: block; }
    .l-up-b { height: 30px; }
}
@media (min-width: 1210px) {
    .l-c { max-width: 1210px; width: expression(document.body.clientWidth > 1211 ? "1210px" : "100%"); }
}
</style>
<style type="text/css">
/*forum css*/
div.video-wrapper{
    position: relative;
    display: inline-block;
}
div.video-player-play{
    position: absolute;
    background: url(/themes/glav/images/play.png) center center no-repeat;
    width: 100%;
    height: 100%;
    cursor: pointer;
    top: 0px;
}
span.video-sticker{
    padding: 0 4px;
    background-color: #fff;
    border-radius: 5px 5px 0 0;
    border: 1px solid #ccc;
    color: #555;
    border-bottom: none;
    font-size: 12px;
}
/*end forum css*/

/* Для окукливания длинных цитат */
.cBlockQuoteContent {
	max-height: 10em;
	overflow: hidden;
}
.cBlockQuoteFooter {
	display: none;
	position: absolute;
	bottom: 0px;
	left: 0px;
	width: 100%;
	height: 32px;
	cursor: pointer;
	text-align: center;
	background: linear-gradient(to top, #ddd, rgba(221, 221, 221, 0.9), rgba(221, 221, 221, 0.0)) repeat scroll 0% 0% transparent;
}
.cBlockQuoteToggle {
	display: block;
	height: 100%;
	width: 100%;
	background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAwCAYAAAACYxrZAAAACXBIWXMAAC4jAAAuIwF4pT92AAABNmlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjarY6xSsNQFEDPi6LiUCsEcXB4kygotupgxqQtRRCs1SHJ1qShSmkSXl7VfoSjWwcXd7/AyVFwUPwC/0Bx6uAQIYODCJ7p3MPlcsGo2HWnYZRhEGvVbjrS9Xw5+8QMUwDQCbPUbrUOAOIkjvjB5ysC4HnTrjsN/sZ8mCoNTIDtbpSFICpA/0KnGsQYMIN+qkHcAaY6addAPAClXu4vQCnI/Q0oKdfzQXwAZs/1fDDmADPIfQUwdXSpAWpJOlJnvVMtq5ZlSbubBJE8HmU6GmRyPw4TlSaqo6MukP8HwGK+2G46cq1qWXvr/DOu58vc3o8QgFh6LFpBOFTn3yqMnd/n4sZ4GQ5vYXpStN0ruNmAheuirVahvAX34y/Axk/96FpPYgAAACBjSFJNAAB6JQAAgIMAAPn/AACA6AAAUggAARVYAAA6lwAAF2/XWh+QAAAAj0lEQVR42uzWSw6AIAxF0da4z66tKy0jE6J8KmCN5nWGDE6IIVw2M4qcjYIHIECAAAHOz54vVPWRp0NEuAgS0bGxCubmCRfCXN0oPcCqev5ko5CI9MEBuAu5QAfshm6BuPgAAQIECBDgn7r09cQIi6iwTJyAmnCO1v7hbMqZN/VXN+MFRpd+H0wAAAD//wMAUNJBSc1FQBMAAAAASUVORK5CYII=') no-repeat center 8px;
}

</style>

<style type="text/css">
/*sceditor.css*/

</style>
</head>
<body>

<table class="l">
<tr>
<td>
        <div class="l-c">
<form id="forumMessageForm" method="post">
            <table style="width: 100%;">
            <tr>
                <td style="vertical-align: top; width: 100%; text-align: center;">
                    <div id="messageBBCodeForm" class="bbCodeForm">
                        <textarea id="messageFormContentFieldWidget" name="content" style="height: 320px; display: none;"></textarea>
                        <table class="defaultBBCodeFormUploadImageList" style="background-color: #eee; border: 1px solid #ccc; display: none;">
                        </table>
                        <table class="defaultBBCodeFormUploadImageForm f" style="margin-top: 5px;">
                        <tr class="fRow">
                            <td class="fItem"><b>Прикрепить изображение:</b></td>
                            <td class="fItem">&nbsp;</td>
                            <td class="fItem"><input class="defaultBBCodeFormUploadImageTypeUrl" type="radio" value="1" checked="checked" style="vertical-align: top;" /></td>
                            <td class="fItem">&nbsp;</td>
                            <td class="fItem"><label class="defaultBBCodeFormUploadImageTypeUrlLabel">Ссылка</label></td>
                            <td class="fItem">&nbsp;</td>
                            <td class="fItem"><input class="defaultBBCodeFormUploadImageTypeFile" type="radio" value="2" style="vertical-align: top;" /></td>
                            <td class="fItem">&nbsp;</td>
                            <td class="fItem"><label class="defaultBBCodeFormUploadImageTypeFileLabel">Файл</label></td>
                            <td class="fItem">&nbsp;</td>
                            <td class="fItem"><input class="defaultBBCodeFormUploadImageUrlInput" type="text" style="border: 1px solid #ccc;"/></td>
                            <td class="fItem"><input class="defaultBBCodeFormUploadImageFileInput" type="file" name="image" /></td>
                            <td class="fItem">&nbsp;</td>
                            <td class="fItem">
                                <div class="defaultBBCodeFormUploadImageUploadLoader" style="display: none;">
                                    <table cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td width="20"><img src="/themes/glav/images/loading.gif" style="vertical-align: top;" /></td>
                                        <td>Загружается...</td>
                                    </tr>
                                    </table>
                                </div>
                                <a class="defaultBBCodeFormUploadImageUploadButton blueButton" href="" onclick="return false;" style="width: 70px;">Загрузить</a>
                            </td>
                        </tr>
                        </table>            
                    </div>
                </td>
            </tr>
            </table>
</form>            
<br />
                    <input id="jsParseButton" type="button" value="Parse" class="cBlueButton" style="height: 26px; margin: 5px 0;" />
            <div id="forumMessagesList" class="forumMessagesList ml">
                <div id="forumMessagesListMessageXXX" class="forumMessagesListMessage">
                <div class="forumMessagesListMessageBlock">
                    <table class="f" width="100%">
                    <tbody>
                    <tr class="fRow fRowJCSB">
            		<td id="forumMessagesListMessage4267592Author" class="fItem forumMessagesListMessageAuthor">
                        <div class="cBlock">
                        <table class="f">
                        <tbody>
                        <tr class="fRow">
                            <td class="fItem forumMessagesListMessageAuthorOffline" title="Не в сети">&nbsp;</td>
                            <td id="forumMessagesListMessage4267592AuthorName" class="fItem forumMessagesListMessageAuthorName">
                            	<a href="#" rel="nofollow"><b>user</b></a>
                            </td>
                            <td class="fItem" style="margin-left: auto;">
                                <table class="cButtonsPanel f">
                                <tbody>
                                <tr class="fRow">
                                	<td class="fItem forumMessagesListMessageAuthorInfoSwitch">
                                    	<span id="forumMessagesListMessageXXXAuthorInfoSwitchButton" class="cBlueButton forumMessagesListMessageAuthorInfoSwitchButton icoButton iconizeUserSwitchButton">
                                                &nbsp;
                                        </span>
                                    </td>
                                    <td class="fItem forumMessagesListMessageButtonsSwitch">
                                    	<span id="forumMessagesListMessageXXXButtonsSwitchButton" class="cBlueButton forumMessagesListMessageButtonsSwitchButton icoButton iconizeMenuSwitchButton">
                                                &nbsp;
                                        </span>
                                    </td>
                                </tr>
                                </tbody>
                                </table>
                            </td>
                        </tr>
                        </tbody>
                        </table>
                        </div>
                    </td>
                    <td class="fSeparator">&nbsp;</td>
                    <td id="forumMessagesListMessageXXXDate" class="fItem forumMessagesListMessageDate">
            	        <div class="cBlock">
            				<a href="#" id="messageXXX" rel="nofollow"><b>Сегодня</b> в 12:00</a>
            	        </div>
                    </td>
                    <td class="fSeparator">&nbsp;</td>
            		<td id="forumMessagesListMessageXXXButtons" class="fItem forumMessagesListMessageButtons">
                        <div class="cBlock">
                            <table class="cButtonsPanel f">
                            <tbody>
                            <tr class="fRow">
                            	<td class="fItem"><a class="cBlueButton" href="#" rel="nofollow" title="Ответить на сообщение">ответить</a></td>
                                <td class="fItem"><span id="forumMessagesListMessageXXXArchiveButton" class="cBlueButton forumMessagesListMessageArchiveButton icoButton icoArchiveButton" title="Сохранить в архив">&nbsp;</span></td>
            					<td class="fItem"><span id="forumMessagesListMessageXXXComplainButton" class="forumMessagesListMessageComplainButton icoButton icoComplainButton cRedButton" title="Пожаловаться модератору">&nbsp;</span></td>
                            </tr>
                            </tbody>
                            </table>
                        </div>
                    </td>
                    </tr>
                    </tbody>
                    </table>
                    
                    <table class="f forumMessagesListMessageBody" width="100%">
                    <tbody>
                    <tr class="fRow fRowJCSB">
                    	<td id="forumMessagesListMessageXXXAuthorInfo" class="fItem forumMessagesListMessageAuthorInfo">
                        	<div class="cBlock">
                            	<table>
                                <tr>
                                	<td style="width: 74px;">
                                    	<img src="https://glav.su/themes/glav/images/img_avatar64.png" width="64" height="64" alt="vkbru" style="border: 1px solid #ccc;" />
                                    </td>
                                    <td>&nbsp;</td>
                                    <td>
                                    	<img src="https://glav.su/themes/glav/images/flags/russia.gif" width="27" height="14" alt="Россия" title="Россия" /><br />
                                        <div style="overflow: hidden; width: 100px;">
                                                                                        Москва<br />
                                                                                </div>
                                                                                                    32
                                                                                года
                                    </td>
                                </tr>
                                </table>
                                <br />
                                Карма: +0.00<br />
                                Регистрация: 01.01.2011<br />
                                Сообщений: 100<br />
                                Читатели: 0<br />
                                                                                                                                            			</div>
                        </td>
                        <td class="fSeparator">&nbsp;</td>
                        <td id="forumMessagesListMessageXXXContent" class="fItem forumMessagesListMessageContent">
            				<div id="postContent" class="cBlock">
            <!--				<video>
            	<source src="https://video.twimg.com/tweet_video/C6vGcCvWkAENGpF.mp4" type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"' />
            				</video>
            <video poster="star.png" autoplay="autoplay" loop="loop" controls="controls" tabindex="0">
            <video loop="loop" controls="controls" tabindex="0" width="500">
            	<source src="https://video.twimg.com/tweet_video/C6gmqSMXEAI6iTa.mp4" type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"' />
            </video>
            <video id="vid1" controls="controls" tabindex="0" width="500">
            	<source src="https://video.twimg.com/ext_tw_video/846718503084183552/pu/pl/tewiCnELOkeD2xHo.m3u8" type='application/x-mpegURL"' />
            </video>
            -->
            				</div>
                        </td>
                    </tr>
                    </tbody>
                    </table>
                    <table class="f" width="100%">
                    <tbody>
                    <tr class="fRow fRowJCSB">
                    	<td id="forumMessagesListMessageXXXAuthorButtons" class="fItem forumMessagesListMessageAuthorButtons">
                        <div class="cBlock">
                        	<table class="cButtonsPanel f">
                            <tbody>
                            <tr class="fRow">
                            	<td class="fItem">
                                	<span id="forumMessagesListMessageXXXPersonalMessageButton" class="forumMessagesListMessagePersonalMessageButton" title="Отправить личное сообщение"><a class="icoButton icoPersonalMessageButton cWhiteButton" href="#" rel="nofollow">&nbsp;</a></span>
                                </td>
                            </tr>
                            </tbody>
                            </table>
                        </div>
                        </td>
                        <td class="fSeparator">&nbsp;</td>
                        <td class="fItem forumMessagesListMessageVoteSwitch">
                        <div class="cBlock">
                            <table>
                            <tr>
                                <td>
            						<table id="forumMessagesListMessageXXXVote" class="forumMessagesListMessageVote">
            						<tr>
            						<td><span id="forumMessagesListMessageXXXXVoteInfoButton" class="forumMessagesListMessageVoteInfoButton cWhiteButton">+ 0.00 / 0</span></td>
                					</tr>
            						</table>            
            					</td>
                            </tr>
                            </table>
                        </div>
                        </td>
                        <td class="fSeparator">&nbsp;</td>
                        <td class="fItem forumMessagesListMessageShareSwitch">
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </div>
                </div>
            </div>

        </div>
</td>
</tr>
</table>
<!--
[twitter width=320 type=tweet hide_media=1]https://twitter.com/NASA/status/832607570107981824[/twitter]<br />
[twitter]https://twitter.com/AstronomyNow/status/836543223384399873[/twitter]<br />
[twitter width=300]https://twitter.com/AstronomyNow/status/836543223384399873[/twitter]<br />
[twitter width=900 type=video]https://twitter.com/NASA/status/832607570107981824[/twitter]<br />
https://www.facebook.com/likeWrld/videos/244707235937804/<br />

[img=600x406]https://glav.su/files/messages/2017/03/23/4326504_c1d4e85648714f243bd14f3f30e59018.jpg[/img]
[img=300x198]https://scontent.xx.fbcdn.net/v/t1.0-9/17308766_1658415701129495_1094287122308594812_n.jpg?oh=6ff8e29c9c3fdead23b6bec0a513710b&oe=59269E48[/img]
[img]http://heroicrelics.org/info/saturn-v/saturn-v-inboard-profiles/s-ic-inboard-profile-med.jpg[/img]
[img=200x112]https://scontent-arn2-1.xx.fbcdn.net/v/t31.0-8/p960x960/17492394_428886714113369_599513088484696170_o.jpg?oh=3d154c41c8e03dc8c4e6996921811d03&oe=59680E4F[/img]
[img]http://i.imgur.com/fdoVMVL.jpg[/img]
-->
</body>
</html>