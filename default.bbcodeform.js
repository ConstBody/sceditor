$(document).ready(function()
{
    $.Class.extend("Default.BBCodeForm",
    {
    },
    {
	escapeEntities: function(str, quote)
        {
            if(!str)
                return str;

            str = str.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/ {2}/g, ' &nbsp;')
                .replace(/\r\n|\r/g, '\n')
                .replace(/\n/g, '<br />');

            if (quote)
                str = str.replace(/"/g, '&#34;').replace(/'/g, '&#39;');

            return str;
	},
        init: function(instance)
        {
            this.instance = instance;
            this.content = $(this.instance + ' textarea');

            this.uploadImage = new Default.BBCodeForm.UploadImage(this);

            var widget = this;

            // quote bbcode
            $.sceditor.plugins.bbcode.bbcode.set('quote', {
                styles: {
                    'stylename': null
                },
                tags: {
                    blockquote: {
                        'class': ['quote'],
                        'author': null,
                        'link': null,
                        'date': null
                    }
                },
                isInline: false,
                quoteType: $.sceditor.BBCodeParser.QuoteType.never,
                format: function(element, content) {
                    var quote = $(element);
                    var quoteHeader = quote.children('div.quoteHeader').first();
                    var parameters = '';
                    // обрабатываем заголовок цитаты
                    if (quote.attr('author') && quote.attr('link') && quote.attr('date')) {
                        parameters = ' author=' + quote.attr('author') + ' link=' + quote.attr('link') + ' date=' + quote.attr('date');
                    // обрабатываем простой заголовок
                    } else {
                        parameters = '=' + quoteHeader.text();
                    }
                    quoteHeader.remove();
                    content = this.elementToBbcode(quote);
                    return '[quote' + parameters + ']' + $.trim(content) + '[/quote]';
                },
                html: function(token, attrs, content) {
                    var attributes = '';
                    content = content.replace(/^<br[\s]*\/>/g, '').replace(/<br[\s]*\/>$/g, '');
                    if (attrs.author && attrs.link && attrs.date) {
                        attributes = ' author="' + attrs.author + '" link="' + attrs.link + '" date="' + attrs.date + '"';
                        var timestamp = parseInt(attrs.date) * 1000 - 10800 * 1000;
                        var qdate = new Date(timestamp);
                        var hours = (qdate.getHours() < 10 ? '0' + qdate.getHours() : qdate.getHours());
                        var minutes = (qdate.getMinutes() < 10 ? '0' + qdate.getMinutes() : qdate.getMinutes());
                        var seconds = (qdate.getSeconds() < 10 ? '0' + qdate.getSeconds() : qdate.getSeconds());
                        var day = (qdate.getDate() < 10 ? '0' + qdate.getDate() : qdate.getDate());
                        var month = (qdate.getMonth() < 9 ? '0' + (qdate.getMonth() + 1) : (qdate.getMonth() + 1));
                        var year = qdate.getFullYear();
                        var fqdate = day + "." + month + "." + year + " " + hours + ":" + minutes + ":" + seconds;
                        content = '<div class="quoteHeader">Цитата: <a href="' + APP_URL + '/' + attrs.link + '" rel="nofollow">' + widget.escapeEntities(attrs.author) + ' от ' + fqdate + '</a></div>' + $.trim(content);
                    } else if (attrs.defaultattr) {
                        content = '<div class="quoteHeader">' + widget.escapeEntities(attrs.defaultattr) + '</div>' + $.trim(content);
                    } else {
                        content = '<div class="quoteHeader">Цитата</div>' + $.trim(content);
                    }
                    return '<blockquote class="quote"' + attributes + '>' + content + '</blockquote>';
                }
            });

            // spoiler bbcode
            $.sceditor.plugins.bbcode.bbcode.set('spoiler', {
                styles: {
                    'stylename': null
                },
                tags: {
                    blockquote: {
                        'class': ['spoiler']
                    }
                },
                quoteType: $.sceditor.BBCodeParser.QuoteType.never,
                isInline: false,
                breakBefore: true,
                breakAfter: true,
                format: function(element, content) {
                    var header = '';
                    var $spoiler = $(element);
                    var $spoilerHeader = $spoiler.children('div.spoilerHeader').first();

                    if($spoilerHeader.length === 1 || $spoiler.data('header')) {
			header = $spoilerHeader.text() || $spoiler.data('header');
                        $spoiler.data('header', header);
                        $spoilerHeader.remove();
                        content	= this.elementToBbcode($(element));
                        header  = '=' + header;
                        $spoiler.prepend($spoilerHeader);
                    }
                    return '[spoiler' + header + ']' + content + '[/spoiler]';
                },
                html: function(token, attrs, content) {
                    content = content.replace(/^<br[\s]*\/>/g, '').replace(/<br[\s]*\/>$/g, '');
                    if (attrs.defaultattr) {
                        content = '<div class="spoilerHeader">' + widget.escapeEntities(attrs.defaultattr) + '</div>' + content;
                    } else {
                        content = '<div class="spoilerHeader">Скрытый текст</div>' + content;
                    }
                    return '<blockquote class="spoiler">' + content + '</blockquote>';
                }
            });

            // movie bbcode
            $.sceditor.plugins.bbcode.bbcode.set('movie', {
                styles: {
                    'stylename': null
                },
                tags: {
                    iframe: {
                        'class': ['youtube','rutube'],
                        'width': null,
                        'height': null,
                        'src': null,
                        'frameborder': null,
                        'allowfullscreen': null
                    }
                },
                isInline: false,
                format: function(element, content) {
                    // youtube
                    if (/https?:\/\/www\.youtube\.com/i.test($(element).attr('src'))) {
                        var movieId = $(element).attr('src').match(/^https?:\/\/www\.youtube\.com\/embed\/([a-z0-9\-\=\_]+)/i)[1];
                        return '[movie=' + $(element).attr('width') + ',' + $(element).attr('height') + ']https://youtu.be/'+ movieId + '[/movie]';
                    }
                    // rutube
                    if (/https?:\/\/rutube\.ru/i.test($(element).attr('src'))) {
                        var movieId = $(element).attr('src').match(/^https?:\/\/rutube\.ru\/play\/embed\/([0-9]+)/i)[1];
                        return '[movie=' + $(element).attr('width') + ',' + $(element).attr('height') + ']https?://rutube.ru/play/embed/'+ movieId + '[/movie]';
                    }
                },
                html: function(token, attrs, content) {
                    var width = 400, height = 300;
                    if (attrs.defaultattr && /^[\d]+,[\d]+$/.test(attrs.defaultattr)) {
                        var matches = attrs.defaultattr.match(/^([\d]+),([\d]+)$/);
                        width = parseInt(matches[1]);
                        width = width > 800 ? 800 : width;
                        height = parseInt(matches[2]);
                        height = height > 600 ? 600 : height;
                    }
                    // youtube 1
                    if (/^https?:\/\/youtu\.be/i.test(content)) {
                        var movieId = content.match(/^https?:\/\/youtu\.be\/([a-z0-9\-\=\_]+)/i)[1];
                        return '<iframe class="youtube" width="' + width + '" height="' + height + '" src="https://www.youtube.com/embed/' + movieId + '?wmode=opaque" frameborder="0" allowfullscreen></iframe>';
                    }
                    // youtube 2
                    if (/^https?:\/\/www\.youtube\.com\/watch\?v=/i.test(content)) {
                        var movieId = content.match(/^https?:\/\/www\.youtube\.com\/watch\?v=([a-z0-9\-\=\_]+)/i)[1];
                        return '<iframe class="youtube" width="' + width + '" height="' + height + '" src="https://www.youtube.com/embed/' + movieId + '?wmode=opaque" frameborder="0" allowfullscreen></iframe>';
                    }
                    // rutube 1
                    if (/^http:\/\/rutube\.ru\/play\/embed\//i.test(content)) {
                        var movieId = content.match(/^http:\/\/rutube\.ru\/play\/embed\/([0-9]+)/i)[1];
                        return '<iframe class="rutube" width="' + width + '" height="' + height + '" src="http://rutube.ru/play/embed/' + movieId + '" frameborder="0" allowfullscreen></iframe>';
                    }
                    // rutube 2
                    if (/^http:\/\/rutube\.ru\/video/i.test(content)) {
                        var hash = content.match(/^http:\/\/rutube\.ru\/video\/([a-z0-9\-\=\_]+)/i)[1];
                        var html = '';
                        $.ajax(APP_URL + '/default/ajax/loadrutubemovieinfo/', {'async': false, 'data': {'hash': hash}, dataType: 'json'}).done(function(data) {
                            if (data.status) {
                                var url = data.data['embed_url'];
                                html = '<iframe class="rutube" width="' + width + '" height="' + height + '" src="' + url + '" frameborder="0" allowfullscreen></iframe>';
                            }
                        });
                        if (!html) {
                            alert('Истек таймаут к серверу Rutube. Повторите попытку позже!');
                        }
                        return html;
                    }
                    return '';
                }
            });

            // quote command
            $.sceditor.command.set("quote", {
                forceNewLineAfter: ['blockquote'],
                exec: function() {
                    var before = '<blockquote class="quote"><div class="quoteHeader">Цитата</div>';
                    var end = '<br /></blockquote>';
                    this.wysiwygEditorInsertHtml(before, end);
                },
                txtExec: ["[quote]", "[/quote]"],
                tooltip: "Цитата"
            });

            // spoiler command
            $.sceditor.command.set("spoiler", {
                forceNewLineAfter: ['blockquote'],
                exec: function() {
                    var before = '<blockquote class="spoiler"><div class="spoilerHeader">Скрытый текст</div>';
                    var end = '<br /></blockquote>';
                    this.wysiwygEditorInsertHtml(before, end);
                },
                txtExec: ["[spoiler]", "[/spoiler]"],
                tooltip: "Спойлер"
            });

            // youtube command
            $.sceditor.command.set("youtube", {
		_dropDown: function (editor, caller, action) {
		    var content = $('<div><label for="link">URL:</label> <input type="text" id="link" value="" /></div><div><label for="width">Ширина (необязательно):</label> <input type="text" id="width" size="4" maxlength="3" value="400" /></div><div><label for="height">Высота (необязательно):</label> <input type="text" id="height" size="4" maxlength="3" value="300" /></div><div><input type="button" class="button" value="Вставить" /></div>');
                    content.find('.button').click(function (e) {
                        var link = content.find('#link').val().replace('http://', '').replace('https://', '');;
                        var movieId = '';
                        if (/^youtu\.be/i.test(link)) {
                            movieId = link.match(/^youtu\.be\/([a-z0-9\-\=\_]+)/i)[1];
                        } else if (/^www\.youtube\.com\/watch\?v=/i.test(link)) {
                            movieId = link.match(/^www\.youtube\.com\/watch\?v=([a-z0-9\-\=\_]+)/i)[1];
                        }
                        if (!movieId) {
                            alert('Неверный URL видео Youtube!');
                        }
                        var width = parseInt(content.find('#width').val());
                        if (width <= 50 || width >= 800) {
                            width = 400;
                        }
                        var height = parseInt(content.find('#height').val());
                        if (height <= 50 || height >= 600) {
                            height = 300;
                        }
                        action(movieId, width, height);
                        editor.closeDropDown(true);
                        e.preventDefault();
                    });
                    editor.createDropDown(caller, 'insertlink', content);
                },
		exec: function (caller) {
		    var editor = this;
		    $.sceditor.command.get('youtube')._dropDown(editor, caller, function(id, width, height) {
                            var iframe='<iframe class="youtube" width="' + width + '" height="' + height + '" src="https://www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe>';
			    editor.wysiwygEditorInsertHtml(iframe);
			}
		    );
		},
                txtExec: ["[movie]", "[/movie]"],
                tooltip: "Видео Youtube"
            });

            // rutube command
            $.sceditor.command.set("rutube", {
		_dropDown: function (editor, caller, action) {
		    var content = $('<div><label for="link">URL:</label> <input type="text" id="link" value="" /></div><div><label for="width">Ширина (необязательно):</label> <input type="text" id="width" size="4" maxlength="3" value="400" /></div><div><label for="height">Высота (необязательно):</label> <input type="text" id="height" size="4" maxlength="3" value="300" /></div><div><input type="button" class="button" value="Вставить" /></div>');
                    content.find('.button').click(function (e) {
                        var link = content.find('#link').val().replace('http://', '');
                        var movieId = '';
                        if (/^rutube\.ru\/play\/embed\//i.test(link)) {
                            movieId = link.match(/^rutube\.ru\/play\/embed\/([0-9]+)/i)[1];
                        } else if (/^rutube\.ru\/video/i.test(link)) {
                            var hash = link.match(/^rutube\.ru\/video\/([a-z0-9\-\=\_]+)/i)[1];
                            $.ajax(APP_URL + '/default/ajax/loadrutubemovieinfo/', {'async': false, 'data': {'hash': hash}, dataType: 'json'}).done(function(data) {
                                if (data.status) {
                                    var url = data.data['embed_url'];
                                    movieId = url.match(/^http:\/\/rutube\.ru\/play\/embed\/([0-9]+)/i)[1];
                                }
                            });
                            if (!movieId) {
                                alert('Истек таймаут к серверу Rutube. Повторите попытку позже!');
                            }
                        }
                        if (!movieId) {
                            alert('Неверный URL видео Rutube!');
                        }
                        var width = parseInt(content.find('#width').val());
                        if (width <= 50 || width >= 800) {
                            width = 400;
                        }
                        var height = parseInt(content.find('#height').val());
                        if (height <= 50 || height >= 600) {
                            height = 300;
                        }
                        action(movieId, width, height);
                        editor.closeDropDown(true);
                        e.preventDefault();
                    });
                    editor.createDropDown(caller, 'insertlink', content);
                },
		exec: function (caller) {
		    var editor = this;
		    $.sceditor.command.get('rutube')._dropDown(editor, caller, function(id, width, height) {
                            var iframe='<iframe class="rutube" width="' + width + '" height="' + height + '" src="http://rutube.ru/play/embed/' + id + '" frameborder="0" allowfullscreen></iframe>';
			    editor.wysiwygEditorInsertHtml(iframe);
			}
		    );
		},
                txtExec: ["[movie]", "[/movie]"],
                tooltip: "Видео Rutube"
            });

            this.editor = $(this.instance).find('textarea').sceditor({
                toolbar: 'emoticon|pastetext|bold,italic,underline,strike,superscript,subscript|left,center,right,justify|bulletlist,orderedlist|horizontalrule|quote,spoiler|link,unlink,image|youtube,rutube|table|size,color|removeformat,maximize,source',
                style: '/themes/glav/styles/sceditor.editor.css',
                colors: 'aqua,black,blue,fuchsia|gray,green,lime,maroon|navy,olive,purple,red|silver,teal,white,yellow',
                locale: 'ru',
                emoticons: {
                    dropdown: {
                        ':smiley:': {'url': '/themes/glav/images/smileys/smiley.gif', 'tooltip': 'Улыбающийся'},
                        ':wink:': {'url': '/themes/glav/images/smileys/wink.gif', 'tooltip': 'Подмигивающий'},
                        ':cheesy:': {'url': '/themes/glav/images/smileys/cheesy.gif', 'tooltip': 'Веселый'},
                        ':grin:': {'url': '/themes/glav/images/smileys/grin.gif', 'tooltip': 'Смеющийся'},
                        ':sad:': {'url': '/themes/glav/images/smileys/sad.gif', 'tooltip': 'Грустный'},
                        ':undecided:': {'url': '/themes/glav/images/smileys/undecided.gif', 'tooltip': 'Непонимающий'},
                        ':shocked:': {'url': '/themes/glav/images/smileys/shocked.gif', 'tooltip': 'Шокированный'},
                        ':angry:': {'url': '/themes/glav/images/smileys/angry.gif', 'tooltip': 'Злой'},
                        ':cool:': {'url': '/themes/glav/images/smileys/cool.gif', 'tooltip': 'Крутой'},
                        ':cry:': {'url': '/themes/glav/images/smileys/cry.gif', 'tooltip': 'Плачущий'},
                        ':embarrassed:': {'url': '/themes/glav/images/smileys/embarrassed.gif', 'tooltip': 'Обеспокоенный'},
                        ':kiss:': {'url': '/themes/glav/images/smileys/kiss.gif', 'tooltip': 'Целующий'},
                        ':lipsrsealed:': {'url': '/themes/glav/images/smileys/lipsrsealed.gif', 'tooltip': 'Рот на замке'}
                    },
                    more: {
                        ':rolleyes:': {'url': '/themes/glav/images/smileys/rolleyes.gif', 'tooltip': 'Строит глазки'},
                        ':tongue:': {'url': '/themes/glav/images/smileys/tongue.gif', 'tooltip': 'Показывает язык'},
                        ':yes:': {'url': '/themes/glav/images/smileys/yes.gif', 'tooltip': 'Согласный'},
                        ':good:': {'url': '/themes/glav/images/smileys/good.gif', 'tooltip': 'Нравится'},
                        ':rofl:': {'url': '/themes/glav/images/smileys/rofl.gif', 'tooltip': 'Под столом'},
                        ':pleasantry:': {'url': '/themes/glav/images/smileys/pleasantry.gif', 'tooltip': 'Кавычки'},
                        ':yahoo:': {'url': '/themes/glav/images/smileys/yahoo.gif', 'tooltip': 'Кричащий'},
                        ':pioner:': {'url': '/themes/glav/images/smileys/pioner.gif', 'tooltip': 'Пионер'},
                        ':wall:': {'url': '/themes/glav/images/smileys/wall.gif', 'tooltip': 'Бьющийся об стену'},
                        ':thinking:': {'url': '/themes/glav/images/smileys/thinking.gif', 'tooltip': 'Думающий'},
                        ':unknow:': {'url': '/themes/glav/images/smileys/unknow.gif', 'tooltip': 'Незнающий'},
                        ':popcorn:': {'url': '/themes/glav/images/smileys/popcorn.gif', 'tooltip': 'Жующий попкорн'},
                        ':ushanka:': {'url': '/themes/glav/images/smileys/ushanka.gif', 'tooltip': 'Быдло'},
                        ':figa:': {'url': '/themes/glav/images/smileys/figa.gif', 'tooltip': 'Фига'},
                        ':dance:': {'url': '/themes/glav/images/smileys/dance.gif', 'tooltip': 'Танцующий'},
                        ':molitva:': {'url': '/themes/glav/images/smileys/molitva.gif', 'tooltip': 'Молящийся'},
                        ':negative:': {'url': '/themes/glav/images/smileys/negative.gif', 'tooltip': 'Не нравится'},
                        ':thanks:': {'url': '/themes/glav/images/smileys/thanks.gif', 'tooltip': 'Благодарный'},
                        ':fight:': {'url': '/themes/glav/images/smileys/fight.gif', 'tooltip': 'Расстреливающий'},
                        ':hi:': {'url': '/themes/glav/images/smileys/hi.gif', 'tooltip': 'Приветствующий'},
                        ':bad:': {'url': '/themes/glav/images/smileys/bad.gif', 'tooltip': 'Рыгающий'},
                        ':bita:': {'url': '/themes/glav/images/smileys/bita.gif', 'tooltip': 'С битой'},
                        ':isterika:': {'url': '/themes/glav/images/smileys/isterika.gif', 'tooltip': 'Истеричный'},
                        ':clapping:': {'url': '/themes/glav/images/smileys/clapping.gif', 'tooltip': 'Хлопающий'},
                        ':cleanglasses:': {'url': '/themes/glav/images/smileys/cleanglasses.gif', 'tooltip': 'В очках'},
                        ':crazy:': {'url': '/themes/glav/images/smileys/crazy.gif', 'tooltip': 'Сумашедший'},
                        ':boyan:': {'url': '/themes/glav/images/smileys/boyan.gif', 'tooltip': 'Боян'},
                        ':demand:': {'url': '/themes/glav/images/smileys/demand.gif', 'tooltip': 'Требующий'},
                        ':diablo:': {'url': '/themes/glav/images/smileys/diablo.gif', 'tooltip': 'Дьявол'},
                        ':facepalm:': {'url': '/themes/glav/images/smileys/facepalm.gif', 'tooltip': 'Позор'},
                        ':drinks:': {'url': '/themes/glav/images/smileys/drinks.gif', 'tooltip': 'Выпивающий'}
                    },
                    hidden: {
                        ':)': '/themes/glav/images/smileys/smiley.gif',
                        ':-)': '/themes/glav/images/smileys/smiley.gif',
                        ';)': '/themes/glav/images/smileys/wink.gif',
                        ';-)': '/themes/glav/images/smileys/wink.gif',
                        ':D': '/themes/glav/images/smileys/cheesy.gif',
                        ':-D': '/themes/glav/images/smileys/cheesy.gif',
                        ';D': '/themes/glav/images/smileys/grin.gif',
                        ';-D': '/themes/glav/images/smileys/grin.gif',
                        '>:(': '/themes/glav/images/smileys/angry.gif',
                        '>:-(': '/themes/glav/images/smileys/angry.gif',
                        ':(': '/themes/glav/images/smileys/sad.gif',
                        ':-(': '/themes/glav/images/smileys/sad.gif',
                        ':-/': '/themes/glav/images/smileys/undecided.gif',
                        ':o': '/themes/glav/images/smileys/shocked.gif',
                        ':-o': '/themes/glav/images/smileys/shocked.gif',
                        ':8': '/themes/glav/images/smileys/cool.gif',
                        ':-8': '/themes/glav/images/smileys/cool.gif',
                        ':\'(': '/themes/glav/images/smileys/cry.gif',
                        ':\'-(': '/themes/glav/images/smileys/cry.gif',
                        ':-[': '/themes/glav/images/smileys/embarrassed.gif',
                        ':-*': '/themes/glav/images/smileys/kiss.gif',
                        ':-X': '/themes/glav/images/smileys/lipsrsealed.gif',
                        '::)': '/themes/glav/images/smileys/rolleyes.gif',
                        ':P': '/themes/glav/images/smileys/tongue.gif',
                        ':-P': '/themes/glav/images/smileys/tongue.gif'
                    }
                },
                enablePasteFiltering: true,
                plugins: 'bbcode',
                width: '100%'
            });
        }
    });
});