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
                        'class': ['quote'],
                        'author': null,
                        'link': null,
                        'date': null
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
                        parameters = '=' + $quoteHeader.text().replace(/(^\s+|\s+$)/g, '');
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
                        content = '<div class="quoteHeader">' + widget.escapeEntities(attrs.defaultattr) + 
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
                        content	= this.elementToBbcode($spoiler);
                        header  = '=' + header;
                        $spoiler.prepend($spoilerHeader);
                    }
                    return '[spoiler' + header + ']' + content + '[/spoiler]';
                },
                html: function(token, attrs, content) {
                    var headerCaption = (attrs.defaultattr)? widget.escapeEntities(attrs.defaultattr) : 'Скрытый текст';
                    //content = content.replace(/^<br[\s]*\/>/g, '').replace(/<br[\s]*\/>$/g, '');
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
                txtExec: ["[spoiler]", "[/spoiler]"],
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
					var	content   = $('<div />'),
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
//							editor.execCommand('fontsize', fontSize);
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
						qSplit	+= (typeof (au = $(fBP).attr('author')) !== 'undefined')? ' author='+au : '';
						qSplit	+= (typeof (ln = $(fBP).attr('link')) !== 'undefined')? ' link='+ln : '';
						qSplit	+= (typeof (dt = $(fBP).attr('date')) !== 'undefined')? ' date='+dt : '';
						qSplit	+= ']';
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

            // Twitter command
            $.sceditor.command.set("twitter", {
				_dropDown: function (editor, caller, action) {
                    var $content = $('<div>')
                    	.append('<label for="link">URL:</label>',
                    		($link = $('<input type="text" id="link" value="https://twitter.com/NASA/status/832607570107981824" />')),
                    		'<br /><label for="width">Ширина:</label>',
                    		($width = $('<input type="text" id="width" size="4" maxlength="3" value="500" />')),
                    		'<br /><input type="radio" name="widget_type" value="tweet" id="twitter-tweet" checked />',
                    		'<label for="twitter-tweet">Твит</label>', 
                    		'<br /><input type="checkbox" id="hide_media" style="margin-left: 20px;" />',
                    		'<label for="hide_media">Без медиа (фото, видео и т.д.)</label>',
                    		'<br /><input type="checkbox" id="screenshot" style="margin-left: 20px;" disabled />',
                    		'<label for="screenshot" disabled>Скриншот</label>', 
                    		'<br /><input type="radio" name="widget_type" value="video" id="twitter-video" />',
                    		'<label for="twitter-video">Видео</label><br />', 
                    		$('<input type="button" class="button" value="Вставить" />')
                    			.click(function(e){
                    				var link = $link.val(), matches, tweetId = widget_type = '';
                    				if( (matches = link.match(/^https?:\/\/twitter\.com\/(\w+)\/status\/(\d+)/i)) && matches.length == 3 ){
                    					link = 'https://twitter.com/' + matches[1] + '/status/' + matches[2];
                    					tweetId = matches[2];
                    					widget_type = $("input[name=widget_type]:checked").val();
                    					var data = {'omit_script': "true", 'lang': "ru", 'url': encodeURIComponent(link)};
                    					//var data = {'lang': "ru", 'url': encodeURIComponent(link)};
                    					if( widget_type == 'tweet' ){
                    						if( $("#hide_media").prop('checked') ){
                    							data['hide_media'] = 'true';
                    						}
                    					}else{
                    						data['widget_type'] = 'video';
                    					}
                    					var api_url = APP_URL + '/twitter_api.php?'
                    					$.each(data, function(dkey, dval){
                    						api_url += api_url.match(/\?$/)? '' : '&';
                    						api_url += dkey + '=' + dval;
                    					});
                    					console.log(api_url);
										$.ajax({
											url: api_url,
											type: 'GET',
											dataType: 'json',
											success: function(result){
									            if( typeof result['error'] !== 'undefined' ){
					                                alert('Ошибка при проверке твита: '+result['error']+'\n'+result['req_url']);
												    e.preventDefault();
												    $content.find('#link').focus();
										            console.log(result);
											        return;
									            }else if( typeof result['tweet'] !== 'undefined' ){
									            	var width = parseInt($width.val());
									            	width = Math.max(width, 320);
									            	width = Math.min(width, 900);
							                        var hide_media = (widget_type == 'tweet') && $("#hide_media").prop('checked');
							                        action(api_url+'&iframe=true&maxwidth='+width, link, widget_type, hide_media, width);
							                        editor.closeDropDown(true);
							                        e.preventDefault();
									            }else{
					                                alert('Ошибка при проверке твита');
												    e.preventDefault();
												    $content.find('#link').focus();
										            console.log(result);
											        return;
								            	}
									            console.log(result);
											},
											error: function(xhr, status, errstr){
												gxhr = xhr;
												console.log(xhr);
				                                alert('Ошибка при проверке твита: ' + status + ': ' + errstr);
											    e.preventDefault();
											    $content.find('#link').focus();
										        return;
											}
										});
										e.preventDefault();
                    				}else{
		                                alert('Неверный формат URL');
									    e.preventDefault();
									    $content.find('#link').focus();
								        return;
                    				}
                    			})
                    		);
                    editor.createDropDown(caller, 'insertlink', $content);
                },
				exec: function (caller) {
				    var editor = this;
				    $.sceditor.command.get('twitter')._dropDown(editor, caller, function(api_url, link, widget_type, hide_media, width) {
				    	hide_media = hide_media? ' hide_media="1"' : '';
		                var tweet='<iframe class="twitter" width="' + width + '" src="' + api_url + '" widget_type="' + widget_type + '"' + hide_media + ' link="' + link + '" frameborder="0" allowfullscreen></iframe>';
					    editor.wysiwygEditorInsertHtml(tweet);
					});
				},
				txtExec: function (caller) {
				    var editor = this;
				    $.sceditor.command.get('twitter')._dropDown(editor, caller, function(api_url, link, widget_type, hide_media, width) {
		                var tweet='[twitter width=' + width + ' type=' + widget_type;
		                tweet += hide_media? ' hide_media=1' : '';
		                tweet += ']' + link + '[/twitter]';
					    editor.insertText(tweet);
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
                    iframe: {
                        'class': ['twitter'],
                    }
                },
                quoteType: $.sceditor.BBCodeParser.QuoteType.never,
                isInline: false,
                breakAfter: true,
                format: function(element, content) {
                	var link = $(element).attr('link') || '';
                	if( !(/^https?:\/\/twitter\.com\/(\w+)\/status\/(\d+)/i).test(link) ){
                		return '';
                	}
                	var width = $(element).attr('width') || '500';
	            	width = Math.max(width, 320);
	            	width = Math.min(width, 900);
                	var widget_type = ((wt = $(element).attr('widget_type')) && wt === 'video')? 'video' : 'tweet';
                	var hide_media = $(element).attr('hide_media')? ' hide_media=1' : '';
                	return '[twitter width=' + width + ' type=' + widget_type + hide_media + ']' + link + '[/twitter]';
                },
                html: function(token, attrs, content) {
					var link, width, api_url, widget_type, hide_media, matches;
					if( matches = content.match(/^https?:\/\/twitter\.com\/(\w+)\/status\/(\d+)/i) ){
						link = 'https://twitter.com/' + matches[1] + '/status/' + matches[2];
					}else{
						return '';
					}
					var data = {'omit_script': "true", 'lang': "ru", 'url': encodeURIComponent(link)};
					widget_type = attrs['type'] || 'tweet';
					hide_media = attrs['hide_media'] || false;
					if( widget_type == 'tweet' ){
						if( hide_media ){
							data['hide_media'] = 'true';
						}
					}else{
						data['widget_type'] = 'video';
						widget_type = 'video';
					}
					width = attrs['width'] || '500';
	            	width = Math.max(width, 320);
	            	width = Math.min(width, 900);
	            	data['maxwidth'] = width;
					var api_url = APP_URL + '/twitter_api.php?iframe=true'
					$.each(data, function(dkey, dval){
						api_url += '&' + dkey + '=' + dval;
					});
			    	hide_media = hide_media? ' hide_media="1"' : '';
	                var tweet='<iframe class="twitter" width="' + width + '" src="' + api_url + '" widget_type="' + widget_type + '"' + hide_media + ' link="' + link + '" frameborder="0" allowfullscreen></iframe><br />';
                    return tweet;
                }
            });

            this.editor = $(this.instance).find('textarea').sceditor({
                toolbar: 'emoticon|pastetext|bold,italic,underline,strike,superscript,subscript|left,center,right,justify|bulletlist,orderedlist|horizontalrule|quote,qsplit,spoiler|link,unlink,image|youtube,rutube,twitter|table|size,color|removeformat,maximize,source',
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
                bbcodeTrim: true,
                runWithoutWysiwygSupport: true,
                //emoticonsCompat: true,
            });
            var sceD = this.editor.sceditor('instance');
            sceD.bind('keypress', function(e){
            	var replace_list = [
            			['--', '–'],	// Двойной дефис на тире (ndash)
            			['---', '—'],	// Тройной дефис на длинное тире (mdash)
            		], mdepth = 3;
            	e = e.originalEvent;
            	if( !e.altKey && !e.ctrlKey && e.which == 32 ){
					if( sceD.inSourceMode() === true ){
						var src_start = sceD.val().substr(0, sceD.sourceEditorCaret().start),
							src_end = sceD.val().substr(sceD.sourceEditorCaret().start), re;
            			$.each(replace_list, function(idx, repl){
            				if( src_start.match( re = new RegExp('\\s' + repl[0] + '$') ) ){
            					src_start = src_start.replace(re, ' ' + repl[1]);
            					sceD.val(src_start + src_end);
            					return false;
            				}
            			});
	            	}else{
	            		sceD.getRangeHelper().replaceKeyword(
	            			replace_list, false, true, mdepth, true, String.fromCharCode(e.which)
	            		);
	            	}
            	}
            }, false, false);
        }
    });
});
