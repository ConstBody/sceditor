<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML+RDFa 1.1//EN" "http://www.w3.org/MarkUp/DTD/xhtml-rdfa-2.dtd">
<html version="XHTML+RDFa 1.1" xmlns="http://www.w3.org/1999/xhtml" xml:lang="ru" lang="ru">
<head>
<title>Глобальная Авантюра</title>
<meta name="viewport" content="width=device-width" />
<link href="https://glav.su/themes/glav/flex.css?t=1485603030" media="screen" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="jquery.js"></script>
<script type="text/javascript" src="jquery.class.js"></script>
<script type="text/javascript" src="jquery.sceditor.bbcode.js.source"></script>
<script type="text/javascript" src="jquery.sceditor.ru.js.source"></script>
<script type="text/javascript" src="default.bbcodeform.js"></script>
<script type="text/javascript" src="default.bbcodeform.uploadimage.js"></script>
<script type="text/javascript" src="forum.messageform.bbcode.js"></script>
<script type="text/javascript" src="forum.messageform.js"></script>
<script type="text/javascript">
$(document).ready(function()
{
    new Forum.MessageForm();
    $('#jsParseButton').click(function()
    {
        var bbCode = $('#messageBBCodeForm textarea').sceditor('instance').getWysiwygEditorValue();
        $.post('ajax.php', {'bbCode': bbCode}, function(result) {
            $('#jsPHPHtml').html(result.html);
        }, 'json');
    });
});
</script>
</head>
<body>
<table>
<tr>
    <td style="vertical-align: top; width: 50%;">
        <div id="messageBBCodeForm" class="bbCodeForm">
            <textarea id="messageFormContentFieldWidget" name="content" style="height: 360px; display: none;"></textarea>
        </div>
         <input id="jsParseButton" type="button" value="Parse" />
    </td>
    <td style="vertical-align: top;">
        <div id="jsPHPHtml" style="padding: 10px;"></div>
    </td>
</tr>
</table>
</body>
</html>