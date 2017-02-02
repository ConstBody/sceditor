$(document).ready(function()
{
    $.Class.extend("Forum.MessageForm.BBCode",
    {
        bold: '#forummessageformbbcode_bold',
        center: '#forummessageformbbcode_center',
        color: '#forummessageformbbcode_color',
        contentBBCode: '#messageFormContentBBCodeFieldWidget',
        hr: '#forummessageformbbcode_hr',
        img: '#forummessageformbbcode_img',
        italic: '#forummessageformbbcode_italic',
        left: '#forummessageformbbcode_left',
        list: '#forummessageformbbcode_list',
        movie: '#forummessageformbbcode_movie',
        pre: '#forummessageformbbcode_pre',
        quote: '#forummessageformbbcode_quote',
        right: '#forummessageformbbcode_right',
        size: '#forummessageformbbcode_size',
        smiley: '#forummessageformbbcode_smiley',
        smileysDialog: '#forummessageformbbcode_smileysDialog',
        spoiler: '#forummessageformbbcode_spoiler',
        strike: '#forummessageformbbcode_strike',
        sub: '#forummessageformbbcode_sub',
        sup: '#forummessageformbbcode_sup',
        table: '#forummessageformbbcode_table',
        td: '#forummessageformbbcode_td',
        tr: '#forummessageformbbcode_tr',
        underline: '#forummessageformbbcode_underline',
        url: '#forummessageformbbcode_url'
    },
    {
        init: function()
        {
            $(this.Class.bold).click(this.callback("onClickBold"));
            $(this.Class.center).click(this.callback("onClickCenter"));
            $(this.Class.color).change(this.callback("onChangeColor"));
            $(this.Class.hr).click(this.callback("onClickHr"));
            $(this.Class.img).click(this.callback("onClickImg"));
            $(this.Class.italic).click(this.callback("onClickItalic"));
            $(this.Class.left).click(this.callback("onClickLeft"));
            $(this.Class.list).click(this.callback("onClickList"));
            $(this.Class.movie).click(this.callback("onClickMovie"));
            $(this.Class.pre).click(this.callback("onClickPre"));
            $(this.Class.quote).click(this.callback("onClickQuote"));
            $(this.Class.right).click(this.callback("onClickRight"));
            $(this.Class.size).change( this.callback("onChangeSize"));
            $(this.Class.smiley).click(this.callback("onClickSmiley"));
            $(this.Class.spoiler).click(this.callback("onClickSpoiler"));
            $(this.Class.strike).click(this.callback("onClickStrike"));
            $(this.Class.sub).click(this.callback("onClickSub"));
            $(this.Class.sup).click(this.callback("onClickSup"));
            $(this.Class.table).click(this.callback("onClickTable"));
            $(this.Class.td).click(this.callback("onClickTd"));
            $(this.Class.tr).click(this.callback("onClickTr"));
            $(this.Class.underline).click(this.callback("onClickUnderline"));
            $(this.Class.url).click(this.callback("onClickUrl"));

            $(this.Class.smileysDialog).dialog({
                autoOpen: false,
                width: 640,
                height: 480,
                modal: true,
                buttons: {
                    'Закрыть': function() {
                        $(this).dialog('close');
                    }
                }
            });

            var smileys = [
                'smiley', 'wink', 'cheesy', 'grin',
                'sad', 'undecided', 'shocked', 'angry',
                'cool', 'cry', 'embarrassed', 'kiss',
                'lipsrsealed', 'rolleyes', 'tongue', 'yes',
                'good', 'rofl', 'pleasantry', 'yahoo',
                'pioner', 'wall', 'thinking', 'unknow',
                'popcorn', 'ushanka', 'figa', 'dance',
                'molitva', 'negative', 'thanks', 'fight',
                'hi', 'bad', 'bita', 'isterika',
                'clapping', 'cleanglasses', 'crazy', 'boyan',
                'demand', 'diablo', 'facepalm', 'drinks'
            ];

            for (var i in smileys) {
                var smile = smileys[i];
                var ucfirst = smile.charAt(0).toUpperCase() + smile.substr(1, smile.length - 1);
                $('#forummessageformbbcode_smiley' + ucfirst).click(this.callback('onClickSmileyFace'));
            }
        },
        onChangeColor: function(event)
        {
            var val = $(event.target).val();
            this.surroundText('[color=' + val + ']', '[/color]');
            $(event.target).val("");
        },
        onChangeSize: function(event)
        {
            var val = $(event.target).val();
            this.surroundText('[size=' + val + ']', '[/size]');
            $(event.target).val("");
        },
        onClickBold: function()
        {
            this.surroundText('[b]', '[/b]');
        },
        onClickCenter: function()
        {
            this.surroundText('[center]', '[/center]');
        },
        onClickHr: function()
        {
            this.replaceText('[hr]');
        },
        onClickImg: function()
        {
            this.surroundText('[img]', '[/img]');
        },
        onClickItalic: function()
        {
            this.surroundText('[i]', '[/i]');
        },
        onClickLeft: function()
        {
            this.surroundText('[left]', '[/left]');
        },
        onClickList: function()
        {
            this.surroundText('[list]\n[li]', '[/li]\n[li][/li]\n[/list]');
        },
        onClickMovie: function()
        {
            this.surroundText('[movie]', '[/movie]');
        },
        onClickPre: function()
        {
            this.surroundText('[pre]', '[/pre]');
        },
        onClickQuote: function()
        {
            this.surroundText('[quote]\n', '\n[/quote]');
        },
        onClickRight: function()
        {
            this.surroundText('[right]', '[/right]');
        },
        onClickSmiley: function()
        {
            $(this.Class.smileysDialog).dialog('open');
        },
        onClickSmileyFace: function(event)
        {
            var id = $(event.target).prop('id');
            var smile = id.substr(29).toLowerCase();

            this.replaceText(' :' + smile + ':');

            $(this.Class.smileysDialog).dialog('close');
        },
        onClickSpoiler: function()
        {
            this.surroundText('[spoiler]', '[/spoiler]');
        },
        onClickStrike: function()
        {
            this.surroundText('[s]', '[/s]');
        },
        onClickSub: function()
        {
            this.surroundText('[sub]', '[/sub]');
        },
        onClickSup: function()
        {
            this.surroundText('[sup]', '[/sup]');
        },
        onClickTable: function()
        {
            this.surroundText('[table]', '[/table]');
        },
        onClickTd: function()
        {
            this.surroundText('[td]', '[/td]');
        },
        onClickTr: function()
        {
            this.surroundText('[tr]', '[/tr]');
        },
        onClickUnderline: function()
        {
            this.surroundText('[u]', '[/u]');
        },
        onClickUrl: function()
        {
            this.surroundText('[url=', ']Ссылка[/url]');
        },
        replaceText: function(text)
        {
            var textarea = $(this.Class.contentBBCode).get(0);

            if (typeof(textarea.caretPos) != "undefined" && textarea.createTextRange) {
                var caretPos = textarea.caretPos;
                caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == ' ' ? text + ' ' : text;
                caretPos.select();
            } else if (typeof(textarea.selectionStart) != "undefined") {
                var begin = textarea.value.substr(0, textarea.selectionStart);
                var end = textarea.value.substr(textarea.selectionEnd);
                var scrollPos = textarea.scrollTop;

                textarea.value = begin + text + end;
                if (textarea.setSelectionRange) {
                    textarea.focus();
                    textarea.setSelectionRange(begin.length + text.length, begin.length + text.length);
                }
                textarea.scrollTop = scrollPos;
            } else {
                textarea.value += text;
                textarea.focus(textarea.value.length - 1);
            }
        },
        surroundText: function(text1, text2)
        {
            var textarea = $(this.Class.contentBBCode).get(0);

            if (typeof(textarea.caretPos) != "undefined" && textarea.createTextRange) {
                var caretPos = textarea.caretPos;
                caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == ' ' ? text1 + caretPos.text + text2 + ' ' : text1 + caretPos.text + text2;

                var temp_length = caretPos.text.length;
                if (temp_length == 0) {
                    caretPos.moveStart("character", -text2.length);
                    caretPos.moveEnd("character", -text2.length);
                    caretPos.select();
                } else {
                    textarea.focus(caretPos);
                }
            } else if (typeof(textarea.selectionStart) != "undefined") {
                var begin = textarea.value.substr(0, textarea.selectionStart);
                var selection = textarea.value.substr(textarea.selectionStart, textarea.selectionEnd - textarea.selectionStart);
                var end = textarea.value.substr(textarea.selectionEnd);
                var newCursorPos = textarea.selectionStart;
                var scrollPos = textarea.scrollTop;

                textarea.value = begin + text1 + selection + text2 + end;

                if (textarea.setSelectionRange) {
                    if (selection.length == 0) {
                        textarea.setSelectionRange(newCursorPos + text1.length, newCursorPos + text1.length);
                    } else {
                        textarea.setSelectionRange(newCursorPos, newCursorPos + text1.length + selection.length + text2.length);
                    }
                    textarea.focus();
                }
                textarea.scrollTop = scrollPos;
            } else {
                textarea.value += text1 + text2;
                textarea.focus(textarea.value.length - 1);
            }
        }
    });
});