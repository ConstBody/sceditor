<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML+RDFa 1.1//EN" "http://www.w3.org/MarkUp/DTD/xhtml-rdfa-2.dtd">
<html version="XHTML+RDFa 1.1" xmlns="http://www.w3.org/1999/xhtml" xml:lang="ru" lang="ru">
<head>
<title>Прототип редактора ГА</title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width" />
<link href="https://glav.su/themes/glav/flex.css?t=1485603030" media="screen" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="jquery.js"></script>
<script type="text/javascript" src="jquery.class.js"></script>
<script type="text/javascript" src="jquery.sceditor.bbcode.1.5.2.js"></script>
<script type="text/javascript" src="jquery.sceditor.ru.js.source"></script>
<script type="text/javascript" src="default.bbcodeform.js"></script>
<script type="text/javascript" src="default.bbcodeform.uploadimage.js"></script>
<!--<script type="text/javascript" src="forum.messageform.bbcode.js"></script>-->
<script type="text/javascript" src="forum.messageform.js"></script>
<script type="text/javascript" src="twitter.widjets.js"></script>
<script type="text/javascript">
    //<![CDATA[
    APP_URL = "http://alvig.ru/sce";
	CSRF_TOKEN = "0f72438b1865d6ac10f83edbfbf33cdd7ea3611b";
    //]]>
</script>
<script type="text/javascript">
var gxhr;
$(document).ready(function()
{
    new Forum.MessageForm();
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
	
	twttr.widgets.load();
}
</script>
<style type="text/css">
/*forum css*/
ol {
	padding-left: 20px;
}
table.postTable td {
	padding: 0 5px;
}
.cBlockQuote, cBlockSpoiler {
	margin: 4px 0;
	position: relative;
}
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
.cBlockTwitter {
	display: block;
	height: auto;
}
hr {
	margin: 7px 0;
}
.twitter-logo {
	display: block;
	width: 16px;
	height: 16px;
	background-image: url('/themes/glav/images/twitter-logo.png');
}
</style>

<style type="text/css">
/*sceditor.css*/
.sceditor-button div {
    background-image: url('/themes/glav/images/sceditor2017-02-26.png');
}
.sceditor-button-qsplit div {
    background-position: -720px 0px;
}
.sceditor-button-twitter div {
    background-position: -768px 0px;
}
div.sceditor-dropdown label {
	display: inline;
    font-weight: normal;
    padding: 4px;
}
div.sceditor-dropdown .button {
	display: block;
	margin: auto;
}
</style>
</head>
<body>

<table class="l">
<tr>
<td class="lContentBackground">
    <div class="lCenter">
        <div class="lContent">

<table style="width: 100%;">
<tr>
    <td style="vertical-align: top; width: 100%; text-align: center;">
        <div id="messageBBCodeForm" class="bbCodeForm">
            <textarea id="messageFormContentFieldWidget" name="content" style="height: 320px; display: none;">
[twitter width=320 type=tweet hide_media=1]https://twitter.com/NASA/status/832607570107981824[/twitter]
[twitter]https://twitter.com/AstronomyNow/status/836543223384399873[/twitter]
[twitter width=300]https://twitter.com/AstronomyNow/status/836543223384399873[/twitter]
[twitter width=900 type=video]https://twitter.com/NASA/status/832607570107981824[/twitter]
           </textarea>
        </div>
        <input id="jsParseButton" type="button" value="Parse" class="cBlueButton" style="height: 26px; margin: 5px 0;" />
    </td>
</tr>
</table>

<div id="forumMessagesList" class="forumMessagesList">
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
    </div>
</td>
</tr>
</table>

</body>
</html>