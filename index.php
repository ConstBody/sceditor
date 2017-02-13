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
}
</script>
<style type="text/css">
ol {
	padding-left: 20px;
}
table.postTable td {
	padding: 0 5px;
}
.cBlockQuote, cBlockSpoiler {
	margin: 4px 0;
}
hr {
	margin: 7px 0;
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
            <textarea id="messageFormContentFieldWidget" name="content" style="height: 320px; display: none;">[quote author=user link=forum/7-support/7/4268982-message/#message4268982 date=1486796541]В чащах юга жил бы цитрус? Да, но фальшивый экземпляр![/quote]

[b]Жирный[/b] [i]курсив[/i] [color=fuchsia][u]подчёркнутый[/u][/color] [s]зачёркнутый[/s] X[sup]2[/sup] X[sub]abc 
[/sub]
Таблица
[table][tr][td]td11[/td]
[td]td12[/td]
[/tr]
[tr][td]td21[/td]
[td]td22[/td]
[/tr]
[/table]
:smiley::undecided::cheesy:
[url=https://glav.su/forum/]https://glav.su/forum/[/url]
[url=https://glav.su/forum/]Ссылка[/url]
[spoiler=Скрытый текст]Спойлер
[img]https://glav.su/themes/glav/images/headerS.jpg[/img]
1313123 1233 2312 с[/spoiler]

[center][size=6]По центру[/size][/center]
[right]Quick brown fox jumps over the lazy dog.[/right]
[ul]
[li]список1[/li]
[li]список2[/li]
[/ul]

[hr]
[ol]
[li]список11[/li]
[li]список12[/li]
[/ol]
[hr]
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