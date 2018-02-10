$(document).ready(function()
{
    Number.prototype.dd = function(){ return (this<10)? '0'+this : this.toString(); }
    Number.prototype.rr = function(min, max){ var ret = Math.max(min, this); return Math.min(max, ret); }
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

            //$.sceditor.plugins.bbcode.bbcode.set('font', {
            //    tags: {
            //        font: null
            //    },
            //    isInline: false,
            //    format: function(element, content) {
            //        return content;
            //    },
            //    html: function(token, attrs, content) {
            //        return content;
            //    }
            //});

            // quote bbcode
            $.sceditor.plugins.bbcode.bbcode.set('quote', {
                styles: {
                    'stylename': null
                },
                tags: {
                    blockquote: {
                        'class': ['quote']
                    }
                },
                isInline: false,
                quoteType: $.sceditor.BBCodeParser.QuoteType.never,
                format: function(element, content) {
                    var $quote = $(element);
                    var $quoteHeader = $quote.children('div.quoteHeader').first();
                    var parameters = '';
                    // обрабатываем заголовок цитаты
                    if ($quote.attr('author') && $quote.attr('link') && $quote.attr('date')) {
                        parameters = ' author=' + $quote.attr('author') + ' link=' + $quote.attr('link') + ' date=' + $quote.attr('date');
                    // обрабатываем простой заголовок
                    } else {
                        parameters = ($quoteHeader.text() == 'Цитата')? '' : '=' + $quoteHeader.text().replace(/^Цитата:/i, '').replace(/(^\s+|\s+$)/g, '');
                    }
                    $quoteHeader.remove();
                    content = this.elementToBbcode($quote);
                    $quote.prepend($quoteHeader);
                    return '[quote' + parameters + ']' + $.trim(content) + '[/quote]';
                },
                html: function(token, attrs, content) {
                    var attributes = '';
                    //content = content.replace(/^<br[\s]*\/>/g, '').replace(/<br[\s]*\/>$/g, '');
                    if (attrs.author && attrs.link && attrs.date) {
                        attributes = ' author="' + attrs.author + '" link="' + attrs.link + 
                                '" date="' + attrs.date + '"';
                        Number.prototype.dd = function(){ return (this<10)? '0'+this : this.toString(); }
                        var zShift = (new Date()).getTimezoneOffset() * 60;
                        var timestamp = parseInt(attrs.date) * 1000 + ( zShift + 4*60*60 ) * 1000;
                        var qd = new Date(timestamp);
                        var fqdate = [qd.getDate().dd(), (qd.getMonth() + 1).dd(), qd.getFullYear()].join('.') +
                            ' ' + [qd.getHours().dd(), qd.getMinutes().dd(), qd.getSeconds().dd()].join(':');
                        content = '<div class="quoteHeader">Цитата: <a href="' + APP_URL + '/' + attrs.link + 
                                '" rel="nofollow">' + widget.escapeEntities(attrs.author) + ' от ' + fqdate + 
                                '</a></div>' + $.trim(content);
                    } else if (attrs.defaultattr) {
                        content = '<div class="quoteHeader">Цитата: ' + widget.escapeEntities(attrs.defaultattr) + 
                                '</div>' + $.trim(content);
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
                format: function(element, content) {
                    var header = '';
                    var $spoiler = $(element);
                    var $spoilerHeader = $spoiler.children('div.spoilerHeader').first();

                    if($spoilerHeader.length === 1 || $spoiler.data('header')) {
                        header = $spoilerHeader.text() || $spoiler.data('header');
                        $spoiler.data('header', header);
                        $spoilerHeader.remove();
                        content    = this.elementToBbcode($spoiler);
                        header  = '=' + header;
                        $spoiler.prepend($spoilerHeader);
                    }
                    return '[spoiler' + header + ']' + content + '[/spoiler]';
                },
                html: function(token, attrs, content) {
                    var headerCaption = (attrs.defaultattr)? widget.escapeEntities(attrs.defaultattr) : 'Скрытый текст';
                    return '<blockquote class="spoiler"><div class="spoilerHeader spoilerHeaderOn" onclick="var $=window.parent.$, s=[\'spoilerHeaderOn\',\'spoilerHeaderOff\'], v=+($(this).next(\'div\').toggle().is(\':visible\')); $(this).removeClass( s[v]).addClass(s[+(!v)]);">' + headerCaption + '</div><div class="spoilerContent">' + content + '</div></blockquote>';
                }
            });

            // movie bbcode
            $.sceditor.plugins.bbcode.bbcode.set('movie', {
                styles: {
                    'stylename': null
                },
                tags: {
                    iframe: {
                        'class': ['youtube','rutube']
                    }
                },
                isInline: false,
                format: function(element, content) {
                    var matches,
                        ytReg = /^https?:\/\/www\.youtube\.com\/embed\/([a-z0-9\-\=\_]+)/i,
                        rtReg = /^https?:\/\/rutube\.ru\/play\/embed\/([0-9]+)/i;
                    // youtube
                    if( (matches = $(element).attr('src').match(ytReg)) && matches.length == 2 ){
                        return '[movie=' + $(element).attr('width') + ',' + $(element).attr('height') + ']https://youtu.be/'+ matches[1] + '[/movie]';
                    }
                    // rutube
                    if( (matches = $(element).attr('src').match(rtReg)) && matches.length == 2 ){
                        return '[movie=' + $(element).attr('width') + ',' + $(element).attr('height') + ']https?://rutube.ru/play/embed/'+ matches[1] + '[/movie]';
                    }
                },
                html: function(token, attrs, content) {
                    var width = 400, height = 300, matches;
                    if (attrs.defaultattr && /^[\d]+,[\d]+$/.test(attrs.defaultattr)) {
                        var matches = attrs.defaultattr.match(/^([\d]+),([\d]+)$/);
                        width = parseInt(matches[1]);
                        width = width > 800 ? 800 : width;
                        height = parseInt(matches[2]);
                        height = height > 600 ? 600 : height;
                    }
                    // youtube 1,2
                    $.each([/^https?:\/\/youtu\.be\/([a-z0-9\-\=\_]+)/i,
                            /^https?:\/\/www\.youtube\.com\/watch\?v=([a-z0-9\-\=\_]+)/i],
                        function(idx, reg){
                            if ( (matches = content.match(reg)) && matches.length == 2 ) return false;
                        }
                    );
                    if ( matches.length == 2 ) {
                        return '<iframe class="youtube" width="' + width + '" height="' + height + '" src="https://www.youtube.com/embed/' + matches[1] + '?wmode=opaque" frameborder="0" allowfullscreen></iframe>';
                    }
                    // rutube 1
                    if ( (matches = content.match(/^http:\/\/rutube\.ru\/play\/embed\/([0-9]+)/i)) && matches.length == 2 ) {
                        return '<iframe class="rutube" width="' + width + '" height="' + height + '" src="http://rutube.ru/play/embed/' + matches[1] + '" frameborder="0" allowfullscreen></iframe>';
                    }
                    // rutube 2
                    if ( (matches = content.match(/^http:\/\/rutube\.ru\/video\/([a-z0-9\-\=\_]+)/i)) && matches.length == 2 ) {
                        var hash = matches[1];
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

            // size bbcode
            $.sceditor.plugins.bbcode.bbcode.set('size', {
                tags: {
                    'span': {
                        'class': ['size']
                    }
                },
                styles: {
                    'stylename': null
                },
                format: function(element, content) {
                    var fontSize = parseInt(element.css('fontSize'));
                    if (fontSize <= 1) {
                        fontSize = '10px';
                    } else if (fontSize > 1 && fontSize < 7) {
                        fontSize = '14px';
                    } else if (fontSize == 7) {
                        fontSize = '18px';
                    } else if (fontSize > 7 && fontSize <= 11) {
                        fontSize = '10px';
                    } else if (fontSize > 11 && fontSize <= 14) {
                        fontSize = '14px';
                    } else if (fontSize > 14) {
                        fontSize = '18px';
                    }
                    return '[size=' + fontSize + ']' + content + '[/size]';
                },
                html: function(token, attrs, content) {
                    var fontSize = '14px';
                    content = content.replace(/^<br[\s]*\/>/g, '').replace(/<br[\s]*\/>$/g, '');
                    if (attrs.defaultattr) {
                        fontSize = parseInt(attrs.defaultattr);
                        if (fontSize <= 1) {
                            fontSize = '10px';
                        } else if (fontSize > 1 && fontSize < 7) {
                            fontSize = '14px';
                        } else if (fontSize == 7) {
                            fontSize = '18px';
                        } else if (fontSize > 7 && fontSize <= 11) {
                            fontSize = '10px';
                        } else if (fontSize > 11 && fontSize <= 14) {
                            fontSize = '14px';
                        } else if (fontSize > 14) {
                            fontSize = '18px';
                        }
                    }
                    return '<span class="size" style="font-size: ' + fontSize + '">' + content + '</span>';
                }
            });

            // link command
            $.sceditor.command.set("link", {
                _dropDown: function (editor, caller, selected, action) {
                    var    content = $('<div>')
                            .append(
                                '<label for="link">URL:</label> ',
                                '<input type="text" id="link" placeholder="http://" /></div>',
                                '<div><label for="des">Заголовок (необязательно):</label> ',
                                '<input type="text" id="des" value="' + selected + '" /></div>',
                                '<div><input type="button" class="button" value="Вставить" /></div>'
                            );

                    content.find('.button').click(function (e) {
                        var    val         = content.find('#link').val(),
                            description = content.find('#des').val();

                        if (val) {
                            // needed for IE to restore the last range
                            editor.focus();

                            // If there is no selected text then must set the URL as
                            // the text. Most browsers do this automatically, sadly
                            // IE doesn't.
                            if (!editor.getRangeHelper().selectedHtml() ||
                                description) {
//                                description = description || val;
                                description = description || 
                                    ( (val.length > 50)? val.replace(/^(.{30}).*?(.{10})$/, '$1…$2') : val );

                                action(val, description);
                            } else {
                                editor.execCommand('createlink', val);
                            }
                        }

                        editor.closeDropDown(true);
                        e.preventDefault();
                    });

                    editor.createDropDown(caller, 'insertlink', content);
                },
                exec: function (caller) {
                    var editor = this;
                    $.sceditor.command.get('link')._dropDown(editor, caller, '', function(url, desc) {
                        editor.wysiwygEditorInsertHtml('<a href="' + url + '">' + desc + '</a>');
                    });
                },
                txtExec: function (caller, selected) {
                    var editor = this;
                    $.sceditor.command.get('link')._dropDown(editor, caller, selected, function(url, desc) {
                        editor.insertText('[url=' + url + ']' + desc + '[/url]');
                    });
                },
                tooltip: 'Insert a link'
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
                    var before = '<blockquote class="spoiler"><div class="spoilerHeader spoilerHeaderOn" onclick="var $=window.parent.$, s=[\'spoilerHeaderOn\',\'spoilerHeaderOff\'], v=+($(this).next(\'div\').toggle().is(\':visible\')); $(this).removeClass( s[v]).addClass(s[+(!v)]);">Скрытый текст</div><div class="spoilerContent">';
                    var end = '<br /></div></blockquote>';
                    this.wysiwygEditorInsertHtml(before, end);
                },
                txtExec: ["[spoiler=Скрытый текст]", "[/spoiler]"],
                tooltip: "Спойлер"
            });

            // youtube command
            $.sceditor.command.set("youtube", {
                _dropDown: function (editor, caller, action) {
                    var content = $('<div><label for="link">URL:</label> <input type="text" id="link" value="" /></div><div><label for="width">Ширина (необязательно):</label> <input type="text" id="width" size="4" maxlength="3" value="400" /></div><div><label for="height">Высота (необязательно):</label> <input type="text" id="height" size="4" maxlength="3" value="300" /></div><div><input type="button" class="button" value="Вставить" /></div>');
                    content.find('.button').click(function (e) {
                        var link = content.find('#link').val();
                        var movieId = '', matches;
                        $.each([/^https?:\/\/youtu\.be\/([a-z0-9\-\=\_]+)/i,
                                /^https?:\/\/www\.youtube\.com\/watch\?v=([a-z0-9\-\=\_]+)/i],
                            function(idx, reg){
                                if ( (matches = link.match(reg)) && matches.length == 2 ){
                                    movieId = matches[1];
                                    return false;
                                }
                            }
                        );
                        if (movieId === '') {
                            alert('Неверный URL видео Youtube!');
                            e.preventDefault();
                            content.find('#link').focus();
                            return;
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
                    });
                },
                txtExec: ["[movie]", "[/movie]"],
                tooltip: "Видео Youtube"
            });

            // rutube command
            $.sceditor.command.set("rutube", {
                _dropDown: function (editor, caller, action) {
                    var content = $('<div><label for="link">URL:</label> <input type="text" id="link" value="" /></div><div><label for="width">Ширина (необязательно):</label> <input type="text" id="width" size="4" maxlength="3" value="400" /></div><div><label for="height">Высота (необязательно):</label> <input type="text" id="height" size="4" maxlength="3" value="300" /></div><div><input type="button" class="button" value="Вставить" /></div>');
                    content.find('.button').click(function (e) {
                        var link = content.find('#link').val();
                        var movieId = '', matches;
                        if ( (matches = link.match(/^http:\/\/rutube\.ru\/video\/([a-z0-9\-\=\_]+)/i)) && matches.length == 2 ) {
                            var hash = matches[1];
                            link = '';
                            $.ajax(APP_URL + '/default/ajax/loadrutubemovieinfo/', {'async': false, 'data': {'hash': hash}, dataType: 'json'}).done(function(data) {
                                if (data.status) {
                                    link = data.data['embed_url'];
                                }
                            });
                            if (!link) {
                                alert('Истек таймаут к серверу Rutube. Повторите попытку позже!');
                                e.preventDefault();
                                content.find('#link').focus();
                                return;
                            }
                        }
                        if ( (matches = link.match(/^http:\/\/rutube\.ru\/play\/embed\/([0-9]+)/i)) && matches.length == 2 ) {
                            movieId = matches[1];
                        }
                        if (!movieId) {
                            alert('Неверный URL видео Rutube!');
                            e.preventDefault();
                            content.find('#link').focus();
                            return;
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
                    });
                },
                txtExec: ["[movie]", "[/movie]"],
                tooltip: "Видео Rutube"
            });

            // Size command
            $.sceditor.command.set("size", {
                _dropDown: function (editor, caller, callback) {
                    var    content   = $('<div />'),
                        /** @private */
                        clickFunc = function (e) {
                            callback($(this).data('size'));
                            editor.closeDropDown(true);
                            e.preventDefault();
                        };
                    var sizeTmpl = '<a class="sceditor-fontsize-option" data-size="{size}" href="#"><span style="font-size: {size}">{label}</span></a>';
                    $.each([{size: '10px', label: 'Мелкий'},
                            {size: '14px', label: 'Обычный'},
                            {size: '18px', label: 'Крупный'}],
                            function(idx, sopt){
                                var sizeopt = sizeTmpl;
                                $.each(sopt, function (name, val) {
                                    sizeopt = sizeopt.replace(new RegExp('\\{' + name + '\\}', 'g'), val);
                                });
                                content.append($(sizeopt).click(clickFunc));
                            }
                    );

                    editor.createDropDown(caller, 'fontsize-picker', content);
                },
                exec: function (caller) {
                    var editor = this;

                    $.sceditor.command.get('size')._dropDown(
                        editor,
                        caller,
                        function (fontSize) {
//                            editor.execCommand('fontsize', fontSize);
                            editor.wysiwygEditorInsertHtml('<span class="size" style="font-size: ' + fontSize + '">', '</span>');
                        }
                    );
                },
                tooltip: 'Font Size'
            });

            // Qsplit command
            $.sceditor.command.set("qsplit", {
                exec: function (caller) {
                    var editor = this;
                    if( (fBP = editor.getRangeHelper().getFirstBlockParent()).nodeName == 'BLOCKQUOTE' ){
                        var qSplit = '[/quote]<br /><br />[quote';
                        qSplit    += (typeof (au = $(fBP).attr('author')) !== 'undefined')? ' author='+au : '';
                        qSplit    += (typeof (ln = $(fBP).attr('link')) !== 'undefined')? ' link='+ln : '';
                        qSplit    += (typeof (dt = $(fBP).attr('date')) !== 'undefined')? ' date='+dt : '';
                        qSplit    += ']';
                        editor.wysiwygEditorInsertHtml(qSplit);
                        editor.toggleSourceMode();
                        editor.toggleSourceMode();
                    }
                },
                txtExec: function (caller) {
                    var editor = this;
                    var caret = editor.sourceEditorCaret().start;
                    var getQouteSplit = function(c, src, s, lock){
                            if( c < 0 ) return '';
                            s = src[c] + s;
                            if( mch = s.match(/^\[\/quote\]/) ) lock++;
                            if( mch = s.match(/^\[quote.*?\]/) ){
                                if( lock == 0 ){
                                    return '[/quote]\n\n' + mch[0];
                                }else{
                                    lock--;
                                }
                            }
                            return getQouteSplit(--c, src, s, lock);
                        };
                    editor.sourceEditorInsertText( getQouteSplit(caret, editor.val(), '', 0) );
                },
                tooltip: 'Разбить цитату'
            });

            // SpecSymbol command
            $.sceditor.command.set("specsymbol", {
                _dropDown: function (editor, caller, callback) {
                    var symbols = [
                        {s: '©', d: 'Copyright'},{s: '®', d: 'Reserved'},{s: '™', d: 'Trade Mark'},{s: '€', d: 'Евро'},{s: '£', d: 'Фунт'},{s: '¥', d: 'Йена'},
                        {s: '§', d: 'Параграф'},{s: '«', d: 'Кавычка «уголки»'},{s: '»', d: 'Кавычка «уголки»'},{s: '́', d: 'Ударение'},{s: '–', d: 'Тире En Dash'},{s: '—', d: 'Тире Em Dash'},
                        {s: '¹', d: 'Первая степень'},{s: '²', d: 'Квадрат'},{s: '³', d: 'Куб'},{s: '·', d: 'Точка по центру'},{s: '•', d: 'Большая точка (bullet)'},{s: '…', d: 'Троеточие'},
                        {s: '±', d: 'Плюс-минус'},{s: '≈', d: 'Примерно равно'},{s: '≠', d: 'Не равно'},{s: '≡', d: 'Тождественно равно'},{s: '≤', d: 'Меньше или равно'},{s: '≥', d: 'Больше или равно'},
                        {s: '°', d: 'Градус'},{s: '√', d: 'Корень'},{s: '∫', d: 'Интеграл'},{s: 'µ', d: 'Мю'},{s: 'π', d: 'Пи'},{s: 'ω', d: 'Омега'},
                        {s: '∑', d: 'Сумма'},{s: 'λ', d: 'Лямбда'},{s: '∆', d: 'Дельта'},{s: '∂', d: 'Дифференциал'},{s: '∞', d: 'Бесконечность'},{s: 'ε', d: 'Эпсилон'},
                        {s: '¼', d: 'Четверть'},{s: '½', d: 'Одна вторая'},{s: '¾', d: 'Три четверти'},{s: '⅓', d: 'Одна треть'},{s: '⅔', d: 'Две трети'},{s: '⅛', d: 'Одна восьмая'},
                        {s: '←', d: 'Стрелка влево'},{s: '↑', d: 'Стрелка вверх'},{s: '→', d: 'Стрелка вправо'},{s: '↓', d: 'Стрелка вниз'},{s: '↔', d: 'Стрелка влево-вправо'},{s: '↕', d: 'Стрелка вверх-вниз'}
                    ];
                    var    $content = $('<div />').append('<span style="display: block; width: 100%; text-align: center;"><input type="checkbox" id="noclose" /><label class="inline" for="noclose">не закрывать</label></span>'), 
                        i = 0;
                    $.each(symbols, function(sidx, sym){
                        $('<span class="specsym" title="'+sym.d+'">'+sym.s+'</span>')
                            .click(function(e){
                                callback(sym.s);
                                if( !$("#noclose").prop('checked') ){
                                    editor.closeDropDown(true);
                                }
                                e.preventDefault();
                            })
                            .appendTo($content);
                        if( ++i % 6 == 0 ) $content.append('<br />');
                    });
                    editor.createDropDown(caller, 'specsymbols', $content);
                },
                exec: function(caller){
                    var editor = this;
                    $.sceditor.command.get('specsymbol')._dropDown(editor, caller, function(html){
                            editor.wysiwygEditorInsertHtml(html);
                        }
                    );
                },
                txtExec: function(caller){
                    var editor = this;
                    $.sceditor.command.get('specsymbol')._dropDown(editor, caller, function(text){
                            editor.sourceEditorInsertText(text);
                        }
                    );
                },
                tooltip: 'Вставить спецсимвол'
            });

            // Twitter command
            $.sceditor.command.set("twitter", {
                _checkURL: function(url, data, callback){
                    var link, matches, tweetId = '';
                       if( (matches = url.match(/^https?:\/\/twitter\.com\/(\w+)\/status\/(\d+)/i)) && matches.length == 3 ){
                        link = 'https://twitter.com/' + matches[1] + '/status/' + matches[2];
                        tweetId = matches[2];
                        data.url = encodeURIComponent(link);
                        if( data.widget_type == 'video' ){
                            data.extra_info = 'true';
                        }
                        var api_url = APP_URL + '/twitter_api.php?';
                        $.each(data, function(dkey, dval){
                            api_url += api_url.match(/\?$/)? '' : '&';
                            api_url += dkey + '=' + dval;
                        });
                        $.ajax({
                            url: api_url,
                            type: 'GET',
                            dataType: 'json',
                            success: function(result){
                                if( typeof result['error'] !== 'undefined' ){
                                    callback({ error:'Ошибка при проверке твита: '+result['error']+'\n'+result['req_url'] });
                                    return;
                                }else if( typeof result['tweet'] !== 'undefined' ){
                                    var tweet = JSON.parse(result.tweet);
                                    if( data.widget_type == 'video' ){
                                        var vd = JSON.parse(result.player_data.replace(/&quot;/g, '"'));
                                        var vtype = 'twitter', video_url = result.tweet_link;
                                        if( vd.source_type == 'gif' && vd.content_type == 'video/mp4' && typeof vd.video_url !== 'undefined' ){
                                            vtype = 'html5';
                                            video_url = vd.video_url;
                                        }
                                        tweet.extra_info = vd;
                                        callback({
                                            type: vtype,
                                            link: video_url,
                                            title: '<span style="font-weight: bold;">' + vd.user.name + '.</span> ' + vd.status.text,
                                            width: tweet.width,
                                            height: null,
                                            aspectRatio: 'none',
                                            thumb: vd.image_src,
                                            tweet: tweet
                                        });
                                    }else{
                                        callback({
                                            link: result.tweet_link,
                                            tweet: tweet
                                        });
                                    }
                                    return;
                                }else{
                                    callback({ error:'Ошибка при проверке твита.' });
                                    console.log(result);
                                    return;
                                }
                            },
                            error: function(xhr, status, errstr){
                                callback({ error:'Ошибка при проверке твита: ' + status + ': ' + errstr });
                                console.log(xhr);
                                return;
                            }
                        });
                           return 0;
                       }else{
                        return 1; // Not twitter url
                       }
                },
                _dropDown: function (editor, caller, action) {
                    var $content = $('<div>')
                        .append('<label class="inline" for="link">URL:</label>',
                            ($link = $('<input type="text" id="link" value="" />')),
                            '<br /><label class="inline" for="width">Ширина:</label>',
                            ($width = $('<input class="number" type="text" id="width" size="4" maxlength="3" value="500" />')),
                            '<br /><input type="radio" name="widget_type" value="tweet" id="twitter-tweet" checked />',
                            '<label class="inline" for="twitter-tweet">Твит</label>', 
                            '<br /><input type="checkbox" id="hide_media" style="margin-left: 20px;" />',
                            '<label class="inline" for="hide_media">Без медиа (фото, видео и т.д.)</label>',
                            '<br /><input type="checkbox" id="text_only" style="margin-left: 20px;" />',
                            '<label class="inline" for="text_only">Только текст (без виджета)</label>', 
                            '<br /><input type="radio" name="widget_type" value="video" id="twitter-video" />',
                            '<label class="inline" for="twitter-video">Видео</label>', 
                            '<br /><input type="checkbox" id="direct_link" style="margin-left: 20px;" />',
                            '<label class="inline" for="direct_link">Добавить ссылку на видео</label>', 
                            $('<input type="button" class="button" value="Вставить" />')
                                .click(function(e){
                                    var link = $link.val(), matches, tweetId = '', hide_media,
                                        widget_type = $("input[name=widget_type]:checked").val();
//                                    var data = {'omit_script': "true", 'lang': "ru", 'url': encodeURIComponent(link)};
                                    var data = {'omit_script': "true", 'hide_thread': "true", 'lang': "ru"};
                                    if( widget_type == 'tweet' ){
                                        if( $("#hide_media").prop('checked') ){
                                            data['hide_media'] = 'true';
                                            hide_media = true;
                                        }
                                    }else{
                                        data['widget_type'] = 'video';
                                    }
                                    $.sceditor.command.get('twitter')._checkURL( $link.val(), data, function(result){
                                        if( typeof result.error !== 'undefined' ){
                                            alert(result.error);
                                            e.preventDefault();
                                            $content.find('#link').focus();
                                            return;
                                        }
                                        if( typeof result.type !== 'undefined' && result.type == 'html5' ){
                                            alert('Данный тип видео нельзя вставить как виджет твиттера. Попробуйте вставить его как видео.');
                                            e.preventDefault();
                                            $content.find('#link').focus();
                                            return;
                                        }
                                        var width = parseInt($width.val());
                                        width = isNaN(width)? 500 : width.rr(320, 900);
                                        var text_only = ( widget_type == 'tweet' && $("#text_only").prop('checked') );
                                        var thumb = ( typeof result.thumb !== 'undefined' )? result.thumb : '';
                                        var direct_link = $("#direct_link").prop('checked');
                                        action(result.link, widget_type, hide_media, width, text_only, result.tweet, thumb, direct_link);
                                        editor.closeDropDown(true);
                                        e.preventDefault();
                                        return;
                                    });
                                })
                            );
                    editor.createDropDown(caller, 'insertlink', $content);
                },
                forceNewLineAfter: ['div'],
                exec: function (caller) {
                    var editor = this, thtml;
                    $.sceditor.command.get('twitter')._dropDown(editor, caller, function(link, widget_type, hide_media, width, text_only, tweet, thumb, direct_link) {
                        if( text_only ){
                            thtml = '<blockquote class="quote"><div class="quoteHeader">Цитата: @' + tweet.author_name + '</div>' + tweet.html.replace(/<blockquote.+?>([\s\S]+?)<\/blockquote>/i, '$1') + '</blockquote>';
                        }else{
                            hide_media = hide_media? ' data-cards="hidden"' : '';
                            //thumb = ( thumb === '' )? '' : ' background: url(\'' + thumb + '\') center no-repeat; background-size: contain;';
                            thumb = '';
                            direct_link = ( direct_link && tweet.extra_info && typeof (vu = tweet.extra_info.video_url) !== 'undefined' )?
                                '<a href="' + vu + '">Прямая ссылка на видео (' + 
                                tweet.extra_info.content_type.replace(/application\/x-mpegURL/, '.m3u8').replace(/video\/mp4/, '.mp4') + ')</a>' : '';
                            thtml = '<div contentEditable="false" class="twitter-div" style="width: ' + width + 'px;' + thumb + '" widget_type="' + widget_type + '"' + hide_media + ' link="' + link + '" data-width="' + width + '"><blockquote class="twitter-' + widget_type + '" data-lang="ru" data-width="' + width + '"' + hide_media + ' data-conversation="none"><a href="' + link + '"><span class="twitter-logo" style="display: inline-block;"></span>&nbsp;Ссылка на твит</a></blockquote></div>' + direct_link + '<br />';
                        }
                        editor.wysiwygEditorInsertHtml(thtml);
                        var win = editor.document.defaultView || editor.document.parentWindow;
                        if( win && win.twttr && win.twttr.widgets ){
                            win.twttr.widgets.load();
                        }
                    });
                },
                txtExec: function (caller) {
                    var editor = this, ttext;
                    $.sceditor.command.get('twitter')._dropDown(editor, caller, function(link, widget_type, hide_media, width, text_only, tweet, thumb, direct_link) {
                        if( text_only ){
                            ttext = tweet.html.replace(/<blockquote.+?>([\s\S]+?)<\/blockquote>/i, '$1').replace(/<[\s\S]+?>/ig, '');
                        }else{
                            direct_link = ( direct_link && tweet.extra_info && typeof (vu = tweet.extra_info.video_url) !== 'undefined' )?
                                '\n[url=' + vu + ']Прямая ссылка на видео (' + 
                                tweet.extra_info.content_type.replace(/application\/x-mpegURL/, '.m3u8').replace(/video\/mp4/, '.mp4') + ')[/url]' : '';
                            ttext = '[twitter width=' + width + ' type=' + widget_type;
                            ttext += hide_media? ' hide_media=1' : '';
                            ttext += ']' + link + '[/twitter]' + direct_link;
                        }
                        editor.insertText(ttext);
                    });
                },
                tooltip: 'Вставить твит'
            });

            // twitter bbcode
            $.sceditor.plugins.bbcode.bbcode.set('twitter', {
                styles: {
                    'stylename': null
                },
                tags: {
                    div: {
                        'class': ['twitter-div']
                    }
                },
                quoteType: $.sceditor.BBCodeParser.QuoteType.never,
                isInline: false,
                format: function(element, content) {
                    var link = $(element).attr('link') || '';
                    if( !(/^https?:\/\/twitter\.com\/(\w+)\/status\/(\d+)/i).test(link) ){
                        return '';
                    }
                    var width = parseInt($(element).attr('data-width'));
                    width = isNaN(width)? 500 : width.rr(320, 900);
                    var height = parseInt($(element).attr('data-height'));
                    height = isNaN(height)? '' : ' height='+height;
                    var widget_type = $(element).attr('widget_type');
                    var hide_media = $(element).attr('data-cards')? ' hide_media=1' : '';
                    return '[twitter width=' + width + height + ' type=' + widget_type + hide_media + ']' + link + '[/twitter]';
                },
                html: function(token, attrs, content) {
                    var link, width, height, widget_type, hide_media, matches;
                    if( matches = content.match(/^https?:\/\/twitter\.com\/(\w+)\/status\/(\d+)/i) ){
                        link = 'https://twitter.com/' + matches[1] + '/status/' + matches[2];
                    }else{
                        return '';
                    }
                    widget_type = (attrs['type'] && attrs['type'] === 'video')? 'video' : 'tweet';
                    hide_media = attrs['hide_media'] || false;
                    hide_media = hide_media? ' data-cards="hidden"' : '';
                    width = (typeof attrs['width'] !== 'undefined')? parseInt(attrs['width']) : 500;
                    width = isNaN(width)? 500 : width.rr(320, 900);
                    height = (typeof attrs['height'] !== 'undefined')? parseInt(attrs['height']) : '';
                    height = isNaN(height)? '' : ' style="height: ' + height + 'px;"';
                    var tweet='<div contentEditable="false" class="twitter-div" style="width: ' + width + 'px;" widget_type="' + widget_type + '"' + hide_media + ' link="' + link + '" data-width="' + width + '"><blockquote class="twitter-' + widget_type + '" data-lang="ru" data-width="' + width + '"' + hide_media + height + ' data-conversation="none"><a href="' + link + '"><span class="twitter-logo" style="display: inline-block;"></span>&nbsp;Ссылка на твит</a></blockquote></div>';
                    return tweet;
                }
            });

            // Video command
            $.sceditor.command.set("video", {
                _checkURL: function(url, callback){
                    var videoId = videoURL = '', matches, params={};
                    // youtube 
                    $.each([/^https?:\/\/youtu\.be\/([a-z0-9\-\=\_]+)((\?.+[&#]|\?)t=(\d+m\d{1,2}s|\d+[sm]))?/i,
                            /^https?:\/\/www\.youtube\.com\/embed\/([a-z0-9\-\=\_]+)((\?.+[&#]|\?)start=(\d+))?/i,
                            /^https?:\/\/www\.youtube\.com\/watch\?v=([a-z0-9\-\=\_]+)([&#](.*[&#])?t=(\d+m\d{1,2}s|\d+[sm]))?/i],
                        function(idx, reg){
                            if ( (matches = url.match(reg)) && matches.length == 5 ){
                                videoId = matches[1];
                                if( typeof matches[4] !== 'undefined' ){
                                    params['start'] = eval( matches[4].replace(/m/i, '*60+').replace(/s/i, '').replace(/\+$/, '') );
                                }
                                return false;
                            }
                        }
                    );
                    if( videoId !== '' ){
                        $.ajax({
                            url: APP_URL + '/video_api.php?vt=youtube&id=' + videoId,
                            type: 'GET',
                            dataType: 'json',
                            success: function(result){
                                if( typeof result['error'] !== 'undefined' ){
                                    callback(result);
                                    return;    
                                }
                                var vdata = JSON.parse(result['data']);
                                callback({
                                    type: 'youtube',
                                    id: videoId,
                                    title: '<span style="font-weight: bold;">' + vdata.author_name + '.</span> ' + vdata.title,
                                    width: vdata.width, 
                                    height: vdata.height,
                                    aspectRatio: vdata.width / vdata.height,
                                    thumb: vdata.thumbnail_url,
                                    start: (typeof params['start'] !== 'undefined')? params['start'] : 0
                                });
                                return;
                            },
                            error: function(xhr, status, errstr){
                                console.log(xhr);
                                callback( {error: 'Ошибка при запросе video_api.php: ' + status + ': ' + errstr} );
                                return;
                            }
                        });
                        return;
                    }
                    // rutube
                    $.each([/^(https?:\/\/rutube\.ru\/play\/embed\/([0-9]+))/i,
                            /^(https?:\/\/rutube\.ru\/tracks\/[0-9]+\.html)/i,
                            /^(https?:\/\/rutube\.ru\/video\/[a-z0-9\-\=\_]+)/i],
                        function(idx, reg){
                            if ( (matches = url.match(reg)) ){
                                if( matches.length == 3 ){
                                    videoURL = 'https://rutube.ru/tracks/' + matches[2] + '.html';
                                }else{
                                    videoURL = matches[1] + '/';
                                }
                                return false;
                            }
                        }
                    );
                    if( videoURL !== '' ){
                        $.ajax({
                            url: APP_URL + '/video_api.php?vt=rutube&url=' + encodeURIComponent(videoURL),
                            type: 'GET',
                            dataType: 'json',
                            success: function(result){
                                if( typeof result['error'] !== 'undefined' ){
                                    callback(result);
                                    return;    
                                }
                                var vdata = JSON.parse(result['data']);
                                callback({
                                    type: 'rutube',
                                    html: vdata.html,
                                    frameSrc: vdata.html.replace(/^.*?src="(.+?)".*?$/i, "$1"),
                                    title: '<span style="font-weight: bold;">' + vdata.author_name + '.</span> ' + vdata.title,
                                    width: vdata.width, 
                                    height: vdata.height,
                                    aspectRatio: vdata.width/vdata.height,
                                    thumb: vdata.thumbnail_url
                                });
                                return;
                            },
                            error: function(xhr, status, errstr){
                                console.log(xhr);
                                callback( {error: 'Ошибка при запросе video_api.php: ' + status + ': ' + errstr} );
                                return;
                            }
                        });
                        return;
                    }
                    // facebook
                    $.each([/^(https?:\/\/www\.facebook\.com\/(.+?)\/videos\/([0-9]+))/i,
                            /^(https?:\/\/www\.facebook\.com\/video\.php\?(id|v)=([0-9]+))/i,
                            /^(https?:\/\/www\.facebook\.com\/video\/embed\?(video_id)=([0-9]+))/i],
                        function(idx, reg){
                            if ( (matches = url.match(reg)) ){
                                videoURL = 'https://www.facebook.com/video.php?v=' + matches[3];
                                videoId = matches[3];
                                return false;
                            }
                        }
                    );
                    if( videoURL !== '' ){
                        $.ajax({
                            url: APP_URL + '/video_api.php?vt=facebook&url=' + encodeURIComponent(videoURL),
                            type: 'GET',
                            dataType: 'json',
                            success: function(result){
                                if( typeof result['error'] !== 'undefined' ){
                                    callback(result);
                                    return;    
                                }
                                var vdata = JSON.parse(result['data']);
                                var description = vdata.html.replace(/<blockquote.+?>([\s\S]+?)<\/blockquote>/i, '$1').replace(/<[\s\S]+?>/ig, '');
                                callback({
                                    type: 'facebook',
                                    html: vdata.html,
                                    frameSrc: 'https://www.facebook.com/video/embed?video_id=' + videoId,
                                    title: '<span style="font-weight: bold;">' + vdata.author_name + '.</span> ' + description,
                                    width: vdata.width, 
                                    height: vdata.height,
                                    aspectRatio: vdata.width/vdata.height,
                                    thumb: 'https://facebookbrand.com/wp-content/themes/fb-branding/prj-fb-branding/assets/images/fb-art.png',
                                    thumb_style: 'display: block; height: 60px;'
                                });
                                return;
                            },
                            error: function(xhr, status, errstr){
                                console.log(xhr);
                                callback( {error: 'Ошибка при запросе video_api.php: ' + status + ': ' + errstr} );
                                return;
                            }
                        });
                        return;
                    }
                    // twitter
                    var tweet_check = $.sceditor.command.get('twitter')._checkURL( url, { 
                            'omit_script': "true", 
                            'hide_thread': "true", 
                            'lang': "ru", 
                            'widget_type': "video" 
                        }, function(result){
                            callback(result);
                        }
                    );
                    if( tweet_check == 0 ){
                        return;
                    }
                    // html5
                    $.each([/^(https?:\/\/video\.twimg\.com\/tweet_video\/[a-z0-9\-\=\_]+\.mp4)/i, /(.+\.mp4)/i],
                        function(idx, reg){
                            if ( (matches = url.match(reg)) ){
                                videoURL = matches[1];
                                return false;
                            }
                        }
                    );
                    if( videoURL !== '' ){
                        callback({
                            direct: true, // прямой вызов callback-a
                            type: 'html5',
                            link: videoURL
                        });
                        return;
                    }
                    // vimeo
                    $.each([/^(https?:\/\/vimeo\.com\/([0-9]+))/i,
                            /^(https?:\/\/vimeo\.com\/album\/.+?\/video\/([0-9]+))/i,
                            /^(https?:\/\/vimeo\.com\/channels\/.+?\/([0-9]+))/i,
                            /^(https?:\/\/vimeo\.com\/groups\/.+?\/videos\/([0-9]+))/i,
                            /^(https?:\/\/vimeo\.com\/ondemand\/.+?\/([0-9]+))/i,
                            /^(https?:\/\/player\.vimeo\.com\/video\/([0-9]+))/i],
                        function(idx, reg){
                            if ( (matches = url.match(reg)) ){
                                videoURL = 'https://vimeo.com/' + matches[2];
                                return false;
                            }
                        }
                    );
                    if( videoURL !== '' ){
                        $.ajax({
                            url: APP_URL + '/video_api.php?vt=vimeo&url=' + encodeURIComponent(videoURL),
                            type: 'GET',
                            dataType: 'json',
                            success: function(result){
                                if( typeof result['error'] !== 'undefined' ){
                                    callback(result);
                                    return;    
                                }
                                var vdata = JSON.parse(result['data']);
                                var thumb_style = ( vdata.thumbnail_height > vdata.thumbnail_width )? 'display: block; height: 60px;' : 'display: block; width: 75px;'
                                callback({
                                    type: 'vimeo',
                                    html: vdata.html,
                                    id: vdata.video_id,
                                    frameSrc: 'https://player.vimeo.com/video/' + vdata.video_id,
                                    title: '<span style="font-weight: bold;">' + vdata.author_name + '.</span> ' + vdata.description,
                                    width: vdata.width, 
                                    height: vdata.height,
                                    aspectRatio: vdata.width/vdata.height,
                                    thumb: vdata.thumbnail_url,
                                    thumb_style: thumb_style
                                });
                                return;
                            },
                            error: function(xhr, status, errstr){
                                console.log(xhr);
                                callback( {error: 'Ошибка при запросе video_api.php: ' + status + ': ' + errstr} );
                                return;
                            }
                        });
                        return;
                    }
                    // ustream
                    $.each([/https?:\/\/www\.ustream\.tv\/channel\/(\d+)/i,
                            /<iframe[\s\S]+src="https?:\/\/www\.ustream\.tv\/embed\/(\d+)(\?.+?)?"[\s\S]+><\/iframe>/im,
                            /https?:\/\/www\.ustream\.tv\/embed\/(\d+)(\?.+)?/i,
                            /https?:\/\/www\.ustream\.tv\/(recorded\/\d+)/i,
                            /<iframe[\s\S]+src="https?:\/\/www\.ustream\.tv\/embed\/(recorded\/\d+)(\?.+?)?"[\s\S]+><\/iframe>/im,
                            /https?:\/\/www\.ustream\.tv\/embed\/(recorded\/\d+)(\?.+)?/i],
                        function(idx, reg){
                            if ( (matches = url.match(reg)) ){
                                videoId = matches[1];
                                videoURL = url;
                                return false;
                            }
                        }
                    );
                    if( videoId !== '' ){
                        var frameParams = ( matches.length == 3 && typeof matches[2] !== 'undefined' )? matches[2] : '?html5ui',
                            awidth = ( matches = videoURL.match(/width="(\d+)"/) )? matches[1] : 480,
                            aheight = ( matches = videoURL.match(/height="(\d+)"/) )? matches[1] : 270;
                        //console.log('frameParams: ' + frameParams);
                        $.ajax({
                            url: APP_URL + '/video_api.php?vt=ustream&id=' + encodeURIComponent(videoId),
                            type: 'GET',
                            dataType: 'json',
                            success: function(result){
                                if( typeof result['error'] !== 'undefined' ){
                                    callback(result);
                                    return;    
                                }
                                var vdata = JSON.parse(result['data']), thumb, thumb_style, username, title;
                                if( typeof vdata.video !== 'undefined' ){
                                    thumb = vdata.video.thumbnail['default'];
                                    thumb_style = 'display: block; width: 75px;';
                                    vdata = vdata.video;
                                }else{
                                    thumb = vdata.channel.picture['66x66'];
                                    thumb_style = 'display: block; height: 60px;';
                                    vdata = vdata.channel;
                                }
                                var thumb_style = ( vdata.thumbnail_height > vdata.thumbnail_width )? 'display: block; height: 60px;' : 'display: block; width: 75px;'
                                callback({
                                    type: 'ustream',
                                    id: videoId,
                                    frameSrc: 'https://www.ustream.tv/embed/' + videoId + frameParams,
                                    title: '<span style="font-weight: bold;">' + vdata.owner.username + '.</span> ' + vdata.title,
                                    width: awidth, 
                                    height: aheight,
                                    aspectRatio: awidth/aheight,
                                    thumb: thumb,
                                    thumb_style: thumb_style
                                });
                                return;
                            },
                            error: function(xhr, status, errstr){
                                console.log(xhr);
                                callback( {error: 'Ошибка при запросе video_api.php: ' + status + ': ' + errstr} );
                                return;
                            }
                        });
                        return;
                    }
                    callback( {error: 'Неизвестный видео-URL: ' + url} );
                },
                _dropDown: function (editor, caller, action) {
                    var vdata;
                    var $content = $('<div>')
                        .append($('<div id="wiz_page1"></div>') // Первая страница wizard-а
                            .append(
                                $('<div class="video_data_block" style="display: block;">')
                                    .append('<label class="inline" for="link">URL:</label>',
                                        ($link = $('<input type="text" id="link" style="width: 260px;" value="" />'))
                                    ),
                                '<div class="video_data_block" style="display: block;">Поддерживаемые видео: youtube, rutube, twitter, facebook, vimeo, ustream</div>',
                                $('<input type="button" class="button" value="Далее" />')
                                    .click(function(e){
                                        $("#dd_lock").show();
                                        $.sceditor.command.get('video')._checkURL( $link.val(), function(vid){
                                            if( typeof vid.error !== 'undefined' ){
                                                alert(vid.error);
                                                $content.find('#link').focus();
                                                e.preventDefault();
                                                $("#dd_lock").hide();
                                                return;
                                            }
                                            vdata = vid;
                                            vdata.id = ( typeof vdata.id == 'undefined' )? '' : vdata.id;
                                            vdata.frameSrc = ( typeof vdata.frameSrc == 'undefined' )? '' : vdata.frameSrc;
                                            vdata.link = ( typeof vdata.link == 'undefined' )? '' : vdata.link;
                                            vdata.thumb_style = ( typeof vdata.thumb_style == 'undefined' )? 'display: block; width: 75px;' : vdata.thumb_style;
                                            $("#p2_title").empty()
                                                .append('<div style="float: left;"><img style="' + vdata.thumb_style + '" src="' + vid.thumb + '"/></div>',
                                                     '<div style="margin-left: 85px; color: #888; position: relative; overflow: hidden; height: 60px;">' + vid.title + '<span class="title_footer"></span></div>'
                                                );
                                            $("#video_width").attr('ar', vid.aspectRatio).val(vid.width).change();
                                            if( typeof vid.start !== 'undefined' ){
                                                if(vid.start > 0){
                                                    $("#video_start").val( [(m = Math.floor(vid.start / 60)), (vid.start - m * 60).dd()].join(':') );
                                                }
                                            }else{
                                                $("#p2_start").hide();
                                            }
                                            if( vid.type == 'twitter' ) $("#p2_direct_link").css({'display': "block"});
                                            $("#dd_lock").hide();
                                            $("#wiz_page1").hide();
                                            $("#wiz_page2").show();
                                        });
                                        e.preventDefault();
                                        return;
                                    })
                            )
                        )
                        .append($('<div id="wiz_page2" style="display: none;"></div>') // Вторая страница wizard-а
                            .append('<div class="video_data_block" id="p2_title" style="display: block;">',
                                $('<div class="video_data_block" id="p2_width">')
                                    .append('<label class="inline" for="video_width">Размер:</label>',
                                        $('<input class="number" type="text" id="video_width" size="4" maxlength="3" value="480" ar="1.333" />')
                                            .change(function(){
                                                if($(this).attr('ar') == 'none'){
                                                    $("#video_height").val('-?-');
                                                    return;
                                                }
                                                var ar = parseFloat( $(this).attr('ar') ), val = parseInt( $(this).val() );
                                                if( isNaN(ar) ){
                                                    $(this).attr('ar', ar = 1.333);
                                                }
                                                if( isNaN(val) ){
                                                    $(this).val(val = 500);
                                                }
                                                $("#video_height").val( Math.round(val/ar) );
                                            })
                                            .keyup(function(){
                                                if($(this).attr('ar') == 'none'){
                                                    $("#video_height").val('-?-');
                                                    return;
                                                }
                                                var ar = parseFloat( $(this).attr('ar') ), val = parseInt( $(this).val() );
                                                if( isNaN(ar) ){
                                                    $(this).attr('ar', ar = 1.333);
                                                }
                                                if( isNaN(val) ){
                                                    return;
                                                }
                                                $("#video_height").val( Math.round(val/ar) );
                                            }),
                                        '&nbsp;X&nbsp;<input class="number" type="text" id="video_height" size="4" maxlength="3" value="" disabled />'
                                    ),
                                $('<div class="video_data_block" id="p2_start">')
                                    .append('<label class="inline" for="video_start">Начало:</label>',
                                        $('<input class="number" type="text" id="video_start" size="6" maxlength="6" value="0:00" intval="0" />')
                                            .change(function(){
                                                var val = $(this).val().split(':'), intval = 0, strval = '';
                                                for(var i = 0; i < 2 && i < val.length; i++){
                                                    val[i] = parseInt(val[i]);
                                                    val[i] = isNaN(val[i])? 0 : val[i];
                                                    if( i == 1 || val.length == 1 ){
                                                        val[i] = val[i].rr(0, 59);
                                                    }
                                                    intval += (i == 0 && val.length > 1)? 60 * val[i] : val[i];
                                                    strval += (i == 1)? ':'+val[i].dd() : val[i];
                                                }
                                                $(this).attr('intval', intval).val(strval);
                                            })
                                    ),
                                $('<div class="video_data_block" id="p2_direct_link" style="display: none;">')
                                    .append(
                                        '<input type="checkbox" id="direct_link" style="margin-left: 20px;" />',
                                        '<label class="inline" for="direct_link">Добавить прямую ссылку на видео</label>'
                                    ),
                                $('<input type="button" class="button" value="Вставить" />')
                                    .click(function(e){
                                        $("#dd_lock").show();
                                        var width = parseInt($("#video_width").val()), height = parseInt($("#video_height").val()),
                                            frameSrc = vdata.frameSrc.replace(
                                                /^\/\//, 'https://'
                                            );
                                        width = isNaN(width)? 480 : width;
                                        height = isNaN(height)? 270 : height;
                                        vdata.direct_link = $("#direct_link").prop("checked");
                                        action( vdata.type, vdata.id, frameSrc, vdata.link, width, height, $("#video_start").change().attr('intval'), vdata );
                                        editor.closeDropDown(true);
                                        e.preventDefault();
                                    })
                            )
                        )
                        .append('<div id="dd_lock" class="drop_down_lock"><span class="ajax_loader"></span></div>');
                    editor.createDropDown(caller, 'video_wizard', $content);
                    var dd_top = $(".bbCodeForm").offset().top * 1 + 40 * 1,
                        dd_left = $(".bbCodeForm").offset().left * 1 + 
                                $(".bbCodeForm")[0].clientWidth / 2 - 
                                $(".sceditor-dropdown")[0].clientWidth / 2;
                    $(".sceditor-dropdown").css({
                        top: dd_top + 'px',
                        left: dd_left + 'px'
                    });
                },
                forceNewLineAfter: ['iframe'],
                exec: function (caller) {
                    var editor = this;
                    $.sceditor.command.get('video')._dropDown(editor, caller, function(vtype, videoId, frameSrc, videoLink, width, height, start, vdata) {
                        var vhtml = '';
                        switch(vtype){
                            case 'youtube' :
                                start = (start > 0)? '?start='+start : '';
                                vhtml = '<iframe class="youtube-video" width="' + width + '" height="' + height + '" src="https://www.youtube.com/embed/' + videoId + start + '" frameborder="0" allowfullscreen></iframe>';
                                break;
                            case 'rutube' :
                                vhtml = '<iframe class="rutube-video" width="' + width + '" height="' + height + '" src="' + frameSrc + '" frameborder="0" allowfullscreen></iframe>';
                                break;
                            case 'facebook' :
                                vhtml = '<iframe class="facebook-video" width="' + width + '" height="' + height + '" src="' + frameSrc + '" frameborder="0" allowfullscreen></iframe>';
                                break;
                            case 'twitter' :
                                var direct_link = ( vdata.direct_link && vdata.tweet.extra_info && typeof (vu = vdata.tweet.extra_info.video_url) !== 'undefined' )?
                                    '<a href="' + vu + '">Прямая ссылка на видео (' + 
                                    vdata.tweet.extra_info.content_type.replace(/application\/x-mpegURL/, '.m3u8').replace(/video\/mp4/, '.mp4') + ')</a>' : '';
                                vhtml = '<div contentEditable="false" class="twitter-div" style="width: ' + width + 'px;" widget_type="video" link="' + videoLink + '" data-width="' + width + '"><blockquote class="twitter-video" data-lang="ru" data-width="' + width + '" data-conversation="none"><a href="' + videoLink + '"><span class="twitter-logo" style="display: inline-block;"></span>&nbsp;Ссылка на твит</a></blockquote></div>' + direct_link + '<br />';
                                break;
                            case 'html5' :
                                vhtml = '<video class="html5-video" loop="loop" controls="controls" tabindex="0" width="' + width + '"><source src="' + videoLink + '" type=\'video/mp4; codecs="avc1.42E01E, mp4a.40.2"\' /></video><br />';
                                break;
                            case 'vimeo' :
                                vhtml = '<iframe class="vimeo-video" width="' + width + '" height="' + height + '" src="' + frameSrc + '" frameborder="0" allowfullscreen></iframe>';
                                break;
                            case 'ustream' :
                                vhtml = '<iframe class="ustream-video" width="' + width + '" height="' + height + '" src="' + frameSrc + '" frameborder="0" allowfullscreen></iframe>';
                                break;
                            default :
                                vhtml = '<span style="color: #a00;">Неизвестный тип видео</span>';
                        }
                        editor.wysiwygEditorInsertHtml(vhtml);
                        if( vtype == 'twitter' ){
                            var win = editor.document.defaultView || editor.document.parentWindow;
                            if( win && win.twttr ){
                                win.twttr.widgets.load();
                            }
                        }
                    });
                },
                txtExec: function (caller) {
                    var editor = this;
                    $.sceditor.command.get('video')._dropDown(editor, caller, function(vtype, videoId, frameSrc, videoLink, width, height, start, vdata) {
                        var vtext = '';
                        switch(vtype){
                            case 'youtube':
                                start = (start > 0)? ' start='+start : '';
                                vtext = '[video type=youtube width=' + width + ' height=' + height + start + ']https://www.youtube.com/embed/' + videoId + '[/video]';
                                break;
                            case 'rutube':
                                vtext = '[video type=rutube width=' + width + ' height=' + height + ']' + frameSrc + '[/video]';
                                break;
                            case 'facebook':
                                vtext = '[video type=facebook width=' + width + ' height=' + height + ']' + frameSrc + '[/video]';
                                break;
                            case 'twitter':
                                var direct_link = ( vdata.direct_link && vdata.tweet.extra_info && typeof (vu = vdata.tweet.extra_info.video_url) !== 'undefined' )?
                                    '\n[url=' + vu + ']Прямая ссылка на видео (' + 
                                    vdata.tweet.extra_info.content_type.replace(/application\/x-mpegURL/, '.m3u8').replace(/video\/mp4/, '.mp4') + ')[/url]' : '';
                                vtext = '[twitter width=' + width + ' type=video]' + videoLink + '[/twitter]' + direct_link;
                                break;
                            case 'html5':
                                vtext = '[video type=html5 width=' + width + ']' + videoLink + '[/video]';
                                break;
                            case 'vimeo':
                                vtext = '[video type=vimeo width=' + width + ' height=' + height + ']' + frameSrc + '[/video]';
                                break;
                            case 'ustream':
                                vtext = '[video type=ustream width=' + width + ' height=' + height + ']' + frameSrc + '[/video]';
                                break;
                            default:
                                vtext = 'Неизвестный тип видео';
                        }
                        editor.insertText(vtext);
                    });
                },
                tooltip: 'Вставить видео'
            });

            // video bbcode
            $.sceditor.plugins.bbcode.bbcode.set('video', {
                styles: {
                    'stylename': null
                },
                tags: {
                    iframe: {
                        'class': ['youtube-video', 'rutube-video', 'facebook-video', 'vimeo-video', 'ustream-video']
                    },
                    video: {
                        'class': ['html5-video']
                    }
                },
                quoteType: $.sceditor.BBCodeParser.QuoteType.never,
                isInline: false,
                format: function(element, content) {
                    var vtext = vtype = '', matches;
                    $.each(['youtube-video', 'rutube-video', 'facebook-video', 'html5-video', 'vimeo-video', 'ustream-video'], function(idx, val){
                        if( $(element).hasClass(val) ){
                            vtype = val.replace(/-video/, '');
                            return false;
                        }
                    });
                    switch(vtype){
                        case 'youtube':
                            if( (matches = $(element).attr('src').match(/^https?:\/\/www\.youtube\.com\/embed\/([a-z0-9\-\=\_]+)(\?start=(\d+))?/i)) ){
                                var start = (typeof matches[3] !== 'undefined')? ' start=' + matches[3] : '';
                                vtext = '[video type=youtube width=' + $(element).attr('width') + ' height=' + $(element).attr('height') + start + ']https://www.youtube.com/embed/' + matches[1] + '[/video]';
                            }
                            break;
                        case 'rutube':
                            if( (matches = $(element).attr('src').match(/^(https?:\/\/rutube\.ru\/play\/embed\/([0-9]+))/i)) ){
                                vtext = '[video type=rutube width=' + $(element).attr('width') + ' height=' + $(element).attr('height') + ']' + matches[1] + '[/video]';
                            }
                            break;
                        case 'facebook':
                            if( (matches = $(element).attr('src').match(/^(https?:\/\/www\.facebook\.com\/video\/embed\?(video_id)=([0-9]+))/i)) ){
                                vtext = '[video type=facebook width=' + $(element).attr('width') + ' height=' + $(element).attr('height') + ']' + matches[1] + '[/video]';
                            }
                            break;
                        case 'html5':
                            if( (matches = $(element).find('source').attr('src').match(/^(https?:\/\/video\.twimg\.com\/tweet_video\/[a-z0-9\-\=\_]+\.mp4)/i)) ){
                                vtext = '[video type=html5 width=' + $(element).attr('width') + ']' + matches[0] + '[/video]';
                            }
                            break;
                        case 'vimeo':
                            if( (matches = $(element).attr('src').match(/^(https?:\/\/player\.vimeo\.com\/video\/[0-9]+)/i)) ){
                                vtext = '[video type=vimeo width=' + $(element).attr('width') + ' height=' + $(element).attr('height') + ']' + matches[1] + '[/video]';
                            }
                            break;
                        case 'ustream':
                            if( (matches = $(element).attr('src').match(/^(https?:\/\/www\.ustream\.tv\/embed\/(recorded\/)?(\d+)(\?.+)?)/i)) ){
                                vtext = '[video type=ustream width=' + $(element).attr('width') + ' height=' + $(element).attr('height') + ']' + matches[1] + '[/video]';
                            }
                            break;
                    }
                    return vtext;
                },
                html: function(token, attrs, content) {
                    var tmp_id = Math.random().toString(36).substr(2, 5), // Генерируем случайную строку из 5 символов
                        vhtml = '', content = content.replace(/<.*>$/, '');
                    $.sceditor.command.get('video')._checkURL( content, function(vid){
                        if( typeof vid.error !== 'undefined' ){
                            console.log(vid.error);
                            // всё равно пытаемся преобразовать bbcode [video] в html, т.к. некоторые oembed api (например facebook) часто отвечают через раз.
                            vid.type = (typeof attrs.type !== 'undefined')? attrs.type : '';
                        }
                        switch(vid.type){
                            case 'youtube' :
                                var start = (typeof attrs.start !== 'undefined' && attrs.start > 0)? '?start=' + attrs.start : '';
                                    start = (start == '' && typeof vid.start !== 'undefined' && vid.start > 0)? '?start=' + vid.start : start;
                                var width = (typeof attrs.width !== 'undefined')? attrs.width : vid.width, 
                                    height = (typeof attrs.height !== 'undefined')? attrs.height : vid.height;
                                vid.id = (typeof vid.id !== 'undefined')? 
                                    vid.id : 
                                    content.replace(/^.*?https?:\/\/www\.youtube\.com\/embed\/([a-z0-9\-\=\_]+).*?$/i, '$1'); 
                                vhtml = '<iframe class="youtube-video" width="' + width + '" height="' + height + '" src="https://www.youtube.com/embed/' + vid.id + start + '" frameborder="0" allowfullscreen></iframe>';
                                break;
                            case 'rutube' :
                                var width = (typeof attrs.width !== 'undefined')? attrs.width : vid.width, 
                                    height = (typeof attrs.height !== 'undefined')? attrs.height : vid.height,
                                    frameSrc = (typeof vid.frameSrc !== 'undefined')? 
                                        vid.frameSrc.replace(/^\/\//, 'https://') : 
                                        'https://rutube.ru/play/embed/' + content.replace(/^.*?https?:\/\/rutube\.ru\/play\/embed\/([0-9]+).*?$/i, '$1'); 
                                vhtml = '<iframe class="rutube-video" width="' + width + '" height="' + height + '" src="' + frameSrc + '" frameborder="0" allowfullscreen></iframe>';
                                break;
                            case 'facebook' :
                                var width = (typeof attrs.width !== 'undefined')? attrs.width : vid.width, 
                                    height = (typeof attrs.height !== 'undefined')? attrs.height : vid.height;
                                    frameSrc = (typeof vid.frameSrc !== 'undefined')? 
                                        vid.frameSrc.replace(/^\/\//, 'https://') : 
                                        'https://www.facebook.com/video/embed?video_id=' + content.replace(/^.*?https?:\/\/www\.facebook\.com\/video\/embed\?video_id=([0-9]+).*?$/i, '$1'); 
                                vhtml = '<iframe class="facebook-video" width="' + width + '" height="' + height + '" src="' + frameSrc + '" frameborder="0" allowfullscreen></iframe>';
                                break;
                            case 'html5' :
                                var width = (typeof attrs.width !== 'undefined')? attrs.width : 500,
                                    videoLink = vid.link; 
                                vhtml = '<video class="html5-video" loop="loop" controls="controls" tabindex="0" width="' + width + '"><source src="' + videoLink + '" type=\'video/mp4; codecs="avc1.42E01E, mp4a.40.2"\' /></video><br />';
                                break;
                            case 'vimeo' :
                                var width = (typeof attrs.width !== 'undefined')? attrs.width : vid.width, 
                                    height = (typeof attrs.height !== 'undefined')? attrs.height : vid.height;
                                    frameSrc = (typeof vid.frameSrc !== 'undefined')? 
                                        vid.frameSrc.replace(/^\/\//, 'https://') : 
                                        'https://player.vimeo.com/video/' + content.replace(/^.*?https?:\/\/player\.vimeo\.com\/video\/([0-9]+).*?$/i, '$1'); 
                                vhtml = '<iframe class="vimeo-video" width="' + width + '" height="' + height + '" src="' + frameSrc + '" frameborder="0" allowfullscreen></iframe>';
                                break;
                            case 'ustream' :
                                var width = (typeof attrs.width !== 'undefined')? attrs.width : vid.width, 
                                    height = (typeof attrs.height !== 'undefined')? attrs.height : vid.height;
                                    frameSrc = (typeof vid.frameSrc !== 'undefined')? 
                                        vid.frameSrc.replace(/^\/\//, 'https://') : 
                                        'https://www.ustream.tv/embed/' + content.replace(/^https?:\/\/www\.ustream\.tv\/embed\/(recorded\/)?(\d+)(\?.+)?$/i, '$1$2$3'); 
                                vhtml = '<iframe class="ustream-video" width="' + width + '" height="' + height + '" src="' + frameSrc + '" frameborder="0" allowfullscreen></iframe>';
                                break;
                            default :
                                vhtml = '<span style="color: #a00;">Неизвестный тип видео</span>';
                        }
                        if( typeof vid.direct == 'undefined' ){
                            // Заменяем временный div на код видео
                            $(sceD.document).find("#"+tmp_id).replaceWith(vhtml);
                        }
                    });
                    if( vhtml === '' ){
                        // Так как код нужно вернуть сразу, а он ещё возможно проверяется в _checkURL и будет готов только в callBack-функции,
                        // возвращаем временный div с уникальным id, по готовности заменим его напрямую в редакторе 
                        return '<div id="' + tmp_id + '" style="display: none;"></div>';
                    }else{
                        return vhtml;
                    }
                }
            });
            //End vodeo bbcode

            // Image command
            $.sceditor.command.set("image", {
                _dropDown: function (editor, caller, action) {
                    var $inplink, $inpfile, $imglist, isz, $newImg = $('<img style="max-height: none; max-width: none; display: block;">');
                    var imgSizes = function(img){
                        return {
                            w: isNaN(w = parseInt(Math.round(img.naturalWidth)))? 0 : w,
                            h: isNaN(h = parseInt(Math.round(img.naturalHeight)))? 0 : h,
                            ar: ( !isNaN(ar = parseFloat(img.naturalWidth / img.naturalHeight)) && isFinite(ar) )? ar: 0
                        };
                    };
                    var afterImgLoad = function(img, success, error, cnt){
                        if( !img || --cnt < 0 ){
                            if(typeof error === 'function') error();
                            return;
                        }
                        if( img.complete || (img.naturalWidth && img.naturalWidth !== 0) ){
                            success();
                        }else{
                            setTimeout(function(){afterImgLoad(img, success, error, cnt)}, 100);
                        }
                    };
                    var switchWizard = function(imgSrc){
                        $newImg.attr('src', imgSrc);
                        afterImgLoad($newImg[0], function(){
                            isz = imgSizes($newImg[0]);
                            ( isz.ar < 1 )? 
                                $newImg.css({ 'height': "100%", 'margin': "0 auto" }) :
                                $newImg.css({ 'width': "100%", 'margin-top': (0.5 * (120 - (isz.h * 120 / isz.w))) + "px" });
                            $("#new-image-info").html( 'Оригинальный размер:<br />' + isz.w + 'px X ' + isz.h + 'px&nbsp;' );
                            $("#wiz_page1").hide();
                            $("#wiz_page2").show();
                            $("#dd_lock").hide();
                        }, function(){
                            console.log($newImg);
                            alert("Не удалось получить картинку. \n" + imgSrc);
                            $("#dd_lock").hide();
                        }, 100);
                    };
                    var $content = $('<div>')
                        .append($('<div id="wiz_page1">') // Первая страница wizard-а
                            .append(
                                $('<div class="wizard_data_block" style="display: block;">')
                                    .append(
                                        '<input type="radio" name="image_type" value="url" id="image-url-radio" checked />',
                                        '<label class="inline" for="image-url-radio">Ссылка</label>', 
                                        '<input type="radio" name="image_type" value="file" id="image-file-radio" style="margin-left: 20px;" />',
                                        '<label class="inline" for="image-file-radio">Файл</label>', 
                                        '<input type="radio" name="image_type" value="loaded" id="image-loaded-radio" style="margin-left: 20px;" />',
                                        '<label class="inline" for="image-loaded-radio" id="image-loaded-radio-label">Загруженные</label>'
                                    ), 
                                $('<div id="url-block" class="wizard_data_block image_params_block" style="display: block;">')
                                    .append(
                                        ($inplink = $('<input type="text" id="image-url" style="width: 280px;" value="" />')),
                                        '<br /><input type="checkbox" id="load-image-chb" style="margin-left: 20px;" />',
                                        '<label class="inline" for="load-image-chb">Загрузить на сервер</label>'
                                    ),
                                $('<div id="file-block" class="wizard_data_block image_params_block" style="display: none;">')
                                    .append(
                                        ($inpfile = $('<input name="image" type="file" id="image-file" accept=".jpg, .jpeg, .png, .gif" style="width: 280px;" value="" />'))
                                    ),
                                $('<div id="loaded-block" class="wizard_data_block image_params_block" style="display: none; width: 290px; height: 106px; overflow-x: auto;">')
                                    .append(
                                        ($imglist = $('<ol id="image-loaded-list"></ol>'))
                                    ),
                                $('<input type="button" class="button" value="Далее" style="margin-top: 10px;" />')
                                    .click(function(e){
                                        $("#dd_lock").show();
                                        switch( $("input[name=image_type]:checked").val() ){
                                            case "url": 
                                                if( $inplink.val() === '' ){
                                                    $("#dd_lock").hide();
                                                    e.preventDefault();
                                                    $inplink.focus();
                                                    return;
                                                }
                                                if( $("#load-image-chb").prop("checked") ){
                                                    $.ajax({
                                                        type: "POST",
                                                        url: APP_URL + '/forum/message/uploadimage/source/url/',
                                                        data: {'url': $inplink.val()},
                                                        dataType: 'json',
                                                        success: function(result){
                                                            if (result.status) {
                                                                $inplink.val('');
                                                                widget.uploadImage.addImg(result.image);
                                                                switchWizard(APP_URL + '/files/messages/' + result.image);
                                                            } else {
                                                                if( result.errors ){
                                                                    alert(result.errors[0]);
                                                                }else{
                                                                    alert("Ошибка загрузки.");
                                                                    console.log(result);
                                                                }
                                                                $("#dd_lock").hide();
                                                                $inplink.focus();
                                                                return;
                                                            }
                                                        },
                                                        error: function(xhr, status, errstr){
                                                            console.log(xhr);
                                                            alert("Ошибка загрузки. \n" + status + ' ' + errstr);
                                                            $("#dd_lock").hide();
                                                            $inplink.focus();
                                                            return;
                                                        }
                                                    });
                                                }else{
                                                    switchWizard($inplink.val());
                                                } 
                                                break;
                                            case "file":
                                                if( $inpfile.val() === '' ){
                                                    $("#dd_lock").hide();
                                                    e.preventDefault();
                                                    $inpfile.focus();
                                                    return;
                                                }
                                                // Если браузер поддерживает File API, проверяем файл
                                                if(window.FileReader){
                                                    var fext = ( fext = $inpfile[0].files[0].name.match(/\.([a-z]+)$/i) )? fext[1] : '';
                                                    if( ( ['image/png', 'image/gif', 'image/jpeg'].indexOf($inpfile[0].files[0].type) == -1
                                                            && ['png', 'gif', 'jpg', 'jpeg'].indexOf(fext) == -1 )
                                                            || $inpfile[0].files[0].size > 500 * 1024 ){
                                                        alert("Данный файл не может быть загружен.\nДопустимые файлы: картинки форматов jpeg, png или gif, размером не более 500 кБ.");
                                                        $("#dd_lock").hide();
                                                        e.preventDefault();
                                                        $inpfile.focus();
                                                        return;
                                                    }
                                                }else{ // Проверяем только по расширению
                                                    var fext = ( fext = $inpfile.val().match(/\.([a-z]+)$/i) )? fext[1] : '';
                                                    if( ['png', 'gif', 'jpg', 'jpeg'].indexOf(fext) == -1 ){
                                                        alert("Данный файл не может быть загружен.\nДопустимые файлы: картинки форматов jpeg, png или gif, размером не более 500 кБ.");
                                                        $("#dd_lock").hide();
                                                        e.preventDefault();
                                                        $inpfile.focus();
                                                        return;
                                                    }
                                                }
                                                $.ajaxUpload({
                                                    url: APP_URL + '/forum/message/uploadimage/source/file/',
                                                    data: $inpfile,
                                                    dataType: 'json',
                                                    success: function(result) {
                                                        if (result.status) {
                                                            $inpfile.val('');
                                                            widget.uploadImage.addImg(result.image);
                                                            switchWizard(APP_URL + '/files/messages/' + result.image);
                                                        } else {
                                                            if( result.errors ){
                                                                alert(result.errors[0]);
                                                            }else{
                                                                alert("Ошибка загрузки файла.");
                                                                console.log(result);
                                                            }
                                                            $("#dd_lock").hide();
                                                            $inpfile.focus();
                                                            return;
                                                        }
                                                    },
                                                    error: function(xhr, status, errstr){
                                                        console.log(xhr);
                                                        alert("Ошибка загрузки файла. \n" + status + ' ' + errstr);
                                                        $("#dd_lock").hide();
                                                        $inpfile.focus();
                                                        return;
                                                    }
                                                });
                                                break;
                                            case "loaded": 
                                                switchWizard($imglist.children('.ui-selected').first().find('img').attr('src'));
                                                break;
                                        }
                                    })
                            )
                        )
                        .append($('<div id="wiz_page2" style="display: none;">') // Вторая страница wizard-а
                            .append(
                                $('<div class="wizard_data_block" style="display: block; width: 290px; height: 125px; position: relative;">')
                                    .append(
                                        $('<div style="display: inline-block; width: 120px; height: 120px; overflow: hidden; float: left; margin-right: 10px; background-color: #000;">')
                                            .append($newImg),
                                        '<span id="new-image-info" style="float: right; text-align: right; margin-bottom: 10px;">',
                                        $('<div style="display: inline-block; text-align: right; width: 160px;">')
                                            .append(
                                                '<label class="inline" for="new-image-width">Ширина</label>', 
                                                $('<input type="text" id="new-image-width" placeholder="оригинал" maxlength="4" style="width: 70px; margin-bottom: 5px;" />')
                                                    .on('change keyup', function(){
                                                        var val = isNaN( val = parseInt( $(this).val() ) )? '' : val;
                                                        $(this).val(val);
                                                        if( isz.ar == 0 || !$("#new-image-keep-ar").prop("checked") ) return;
                                                        $("#new-image-height").val( (val == '')? val : Math.round(val/isz.ar) );
                                                    }),
                                                '<br /><label class="inline" for="new-image-height">Высота</label>', 
                                                $('<input type="text" id="new-image-height" placeholder="оригинал" maxlength="4" style="width: 70px; margin-bottom: 10px;" />')
                                                    .on('change keyup', function(){
                                                        var val = isNaN( val = parseInt( $(this).val() ) )? '' : val;
                                                        $(this).val(val);
                                                        if( isz.ar == 0 || !$("#new-image-keep-ar").prop("checked") ) return;
                                                        $("#new-image-width").val( (val == '')? val : Math.round(val * isz.ar) );
                                                    }),
                                                '<br /><label class="inline" for="new-image-keep-ar">Сохр. пропорции</label>',
                                                '<input type="checkbox" id="new-image-keep-ar" style="margin: 0 3px 0 0;" checked />'
                                            )
                                    ), 
                                $('<input type="button" class="button" value="Вставить" style="margin-top: 10px;" />')
                                    .click(function(e){
                                        $("#new-image-width").change();
                                        action( $newImg.attr('src'), $("#new-image-width").val(), $("#new-image-height").val() );
                                        editor.closeDropDown(true);
                                        e.preventDefault();
                                    })
                            )
                        )
                        .append('<div id="dd_lock" class="drop_down_lock"><span class="ajax_loader"></span></div>');
                    editor.createDropDown(caller, 'image_wizard', $content);
                    if( widget.uploadImage.images.length > 0){
                        $imglist.css({ width: (108 * widget.uploadImage.images.length) + 'px' });
                        $.each(widget.uploadImage.images, function(idx, image){
                            var $aImg = $('<img src="' + APP_URL + '/files/messages/' + image + '" style="max-height: none; max-width: none;">');
                            afterImgLoad($aImg[0], function(){
                                ($aImg[0].naturalWidth * 4/5 > $aImg[0].naturalHeight)? $aImg.css({'height': "100%"}) : $aImg.css({'width': "100%"});
                                $imglist.append(
                                    $('<li class="ui-state-default">').append(
                                            $('<div style="display: block; width: 100%; height: 100%; overflow: hidden;">')
                                                .append($aImg)
                                        )
                                );
                            }, function(){
                                console.log('Ошибка загрузки изображения. ' + $aImg.attr('src'));
                            }, 100);
                        });
                        $imglist.selectable({
                            stop:function(event, ui){
                                $(event.target).children('.ui-selected').not(':first').removeClass('ui-selected');
                            }
                        });
                        $imglist.children('.ui-state-default').first().addClass('ui-selected');
                    }else{
                        $("#image-loaded-radio").hide();
                        $("#image-loaded-radio-label").hide();
                    }
                    $("input[name=image_type]").change(function(){
                        $(".image_params_block").hide();
                        $("#" + $("input[name=image_type]:checked").val() + '-block').show();
                    });
                    var dd_top = $(".bbCodeForm").offset().top * 1 + 40 * 1,
                        dd_left = $(".bbCodeForm").offset().left * 1 + 
                                $(".bbCodeForm")[0].clientWidth / 2 - 
                                $(".sceditor-dropdown")[0].clientWidth / 2;
                    $(".sceditor-dropdown").css({
                        top: dd_top + 'px',
                        left: dd_left + 'px'
                    });
                    setTimeout(function(){$inplink.focus()}, 300);
                },
                exec: function (caller) {
                    var editor = this;
                    $.sceditor.command.get('image')._dropDown(
                        editor,
                        caller,
                        function (img_src, width, height) {
                            var attribs = ( width !== '' && height !== '' )? ' width="' + width + '" height="' + height + '"' : '';
                            editor.wysiwygEditorInsertHtml('<img' + attribs + ' src="' + img_src + '" />');
                        }
                    );
                },
                txtExec: function (caller) {
                    var editor = this;
                    $.sceditor.command.get('image')._dropDown(
                        editor,
                        caller,
                        function (img_src, width, height) {
                            var attribs = ( width !== '' && height !== '' )? '=' + width + 'x' + height : '';
                            editor.insertText('[img' + attribs + ']' + img_src + '[/img]');
                        }
                    );
                },
                tooltip: 'Вставить изображение'
            });

            // Img bbcode
            $.sceditor.plugins.bbcode.bbcode.set('img', {
                allowsEmpty: true,
                tags: {
                    img: {
                        src: null
                    }
                },
                allowedChildren: ['#'],
                quoteType: $.sceditor.BBCodeParser.QuoteType.never,
                format: function ($element, content) {
                    var    width, height,
                        attribs   = '',
                        element   = $element[0],
                        style     = function (name) {
                            return element.style ? element.style[name] : null;
                        };
    
                    // check if this is an emoticon image
                    if ($element.attr('data-sceditor-emoticon')) {
                        return content;
                    }
    
                    width = $element.attr('width') || style('width');
                    height = $element.attr('height') || style('height');
    
                    // only add width and height if one is specified
                    if ((element.complete && (width || height)) ||
                        (width && height)) {
                        attribs = '=' + Math.round($element.width()) + 'x' + Math.round($element.height());
                    }
    
                    return '[img' + attribs + ']' + $element.attr('src') + '[/img]';
                },
                html: function (token, attrs, content) {
                    var    undef, width, height, match,
                        attribs = '';
    
                    // handle [img width=340 height=240]url[/img]
                    width  = attrs.width;
                    height = attrs.height;
    
                    // handle [img=340x240]url[/img]
                    if (attrs.defaultattr) {
                        match = attrs.defaultattr.split(/x/i);
    
                        width  = match[0];
                        height = (match.length === 2 ? match[1] : match[0]);
                    }
    
                    if (width !== undef) {
                        attribs += ' width="' + $.sceditor.escapeEntities(width, true) + '"';
                    }
    
                    if (height !== undef) {
                        attribs += ' height="' + $.sceditor.escapeEntities(height, true) + '"';
                    }
    
                    return '<img' + attribs +
                        ' src="' + $.sceditor.escapeUriScheme(content) + '" />';
                }
            });
            // END Img bbcode

            this.editor = $(this.instance).find('textarea').sceditor({
                toolbar: 'emoticon,specsymbol|pastetext|bold,italic,underline,strike,superscript,subscript|left,center,right,justify|bulletlist,orderedlist|horizontalrule|quote,qsplit,spoiler|link,unlink,image|video,twitter|table|size,color|removeformat,maximize,source',
                toolbarExclude: 'font',
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
                width: '100%',
                bbcodeTrim: false,
                runWithoutWysiwygSupport: true
                //autoUpdate: true
                //emoticonsCompat: true
            });
            var sceD = this.editor.sceditor('instance');
            if (sceD.getBody) {
                sceD.document = sceD.getBody()[0].ownerDocument;
                var script = sceD.document.createElement('script');  
                script.type = 'text/javascript';  
                script.src = '/javascripts/libs/twitter.widjets.js';  
                $(sceD.document).find('head')[0].appendChild(script);
                sceD.bind('keypress', function(e){
                    var replace_list = [
                        ['--', '–'],    // Двойной дефис на тире (ndash)
                        ['---', '—']    // Тройной дефис на длинное тире (mdash)
                    ], mdepth = 3;
                    e = e.originalEvent;
                    if( !e.altKey && !e.ctrlKey && e.which == 32 ){
                        if( typeof $.sceditor.ie == 'undefined'){
                            if( sceD.inSourceMode() === true ){
                                var caret = sceD.sourceEditorCaret(),
                                src_start = sceD.val().substr(0, caret.start),
                                src_end = sceD.val().substr(caret.start), re;
                                $.each(replace_list, function(idx, repl){
                                    if( src_start.match( re = new RegExp('\\s' + repl[0] + '$') ) ){
                                        src_start = src_start.replace(re, ' ' + repl[1]);
                                        sceD.val(src_start + src_end);
                                        sceD.sourceEditorCaret( {start: (st = caret.start - repl[0].length + repl[1].length), end: st} );
                                        return false;
                                    }
                                });
                            }else{
                                sceD.getRangeHelper().replaceKeyword(
                                    replace_list, false, true, mdepth, true, String.fromCharCode(e.which)
                                );
                            }
                        }
                    }
                }, false, false);
                (function(){
                    $.each( {'ctrl+alt+-': '–', 'ctrl+shift+_': '—', 'ctrl+\'': '́'}, 
                            function(shcat, str){
                                sceD.addShortcut(shcat, function(){
                                    if( this.inSourceMode() === true ){
                                        this.insertText(str);
                                    }else{
                                        this.wysiwygEditorInsertHtml(str);
                                    }
                                });
                            }
                          );
                })();
                sceD.bind('focus', function(e){
                    var win = sceD.document.defaultView || sceD.document.parentWindow;
                    if( win && win.twttr && win.twttr.widgets ){
                        win.twttr.widgets.load();
                    }
                }, false, true);
                sceD.bind('blur', function(e){
                    sceD.getBody().find(".twitter-div").each(function(idx, tw_div){ 
                        $(tw_div).attr('data-height', tw_div.clientHeight);
                    });
                }, false, true);
            }
        }
    });
});
