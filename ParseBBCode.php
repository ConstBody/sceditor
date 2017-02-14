<?php

/**
 * API
 * Парсит BBCode
 */
class Forum_Api_ParseBBCode
{
    /**
     * Константы типов
     */
    const TYPE_CLOSED = 1; // [tag], [tag/], [tag /]
    const TYPE_PARSED_CONTENT = 2; // [tag]parsed content[/tag]
    const TYPE_UNPARSED_CONTENT = 3; // [tag]unparsed content[/tag]
    const TYPE_PARSED_PARAMETER  = 4; // [tag=parsed parameter]parsed content[/tag]
    const TYPE_UNPARSED_PARAMETER = 5; // [tag=unparsed parameter]parsed content[/tag]
    const TYPE_UNPARSED_PARAMETER_UNPARSED_CONTENT = 6; // [tag=unparsed parameter]unparsed content[/tag]
    const TYPE_UNPARSED_PARAMETERS = 7; // [tag=unparsed parameters]parsed content[/tag]
    const TYPE_UNPARSED_PARAMETERS_UNPARSED_CONTENT = 8; // [tag=unparsed parameters]unparsed content[/tag]
    const TYPE_UNPARSED_ATTRIBUTES = 9; // [tag unparsed attributes]parsed content[/tag]
    const TYPE_UNPARSED_ATTRIBUTES_UNPARSED_CONTENT = 10; // [tag unparsed attributes]unparsed content[/tag]

    /**
     * Константа длинной строки
     */
    const LONG_WORD_LENGTH = 30;

    /**
     * Константа неразрывного пробела
     */
    const NON_BREAKING_SPACE = "\xC2\xA0";

    /**
     * Текст в формате BBCode
     * @var string
     */
    protected $_textBBCode = '';

    /**
     * Текст в формате HTML
     * @var string
     */
    protected $_textHtml = '';

    /**
     * Структура BBCode
     * @var array
     */
    protected $_bbCodes = array(
        'a' => array(
            'abbr' => array(
                'tag' => 'abbr',
                'type' => self::TYPE_UNPARSED_PARAMETER,
                'before' => '<abbr title="$1">',
                'after' => '</abbr>',
                'quoted' => 'optional',
                'disabled_after' => ' ($1)'
            ),
            'acronym' => array(
                'tag' => 'acronym',
                'type' => self::TYPE_UNPARSED_PARAMETER,
                'before' => '<acronym title="$1">',
                'after' => '</acronym>',
                'quoted' => 'optional',
                'disabled_after' => ' ($1)'
            ),
            'anchor' => array(
                'tag' => 'anchor',
                'type' => self::TYPE_UNPARSED_PARAMETER,
                'test' => '[#]?([A-Za-z][A-Za-z0-9_\-]*)\]',
                'before' => '<span id="post_$1" />',
                'after' => ''
            )
        ),
        'b' => array(
            'b' => array(
                'tag' => 'b',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<b>',
                'after' => '</b>'
            ),
            'black' => array(
                'tag' => 'black',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<span style="color: black;">',
                'after' => '</span>'
            ),
            'blue' => array(
                'tag' => 'blue',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<span style="color: blue;">',
                'after' => '</span>'
            ),
            'br' => array(
                'tag' => 'br',
                'type' => self::TYPE_CLOSED,
                'content' => '<br />'
            )
        ),
        'c' => array(
            'code1' => array(
                'tag' => 'code',
                'type' => self::TYPE_UNPARSED_CONTENT,
                'content' => '<div class="cBlockCode"><div class="cBlockCodeHeader">Код:</div><div class="cBlockCodeContent"><pre>$1</pre></div></div>',
                'isBlock' => true
            ),
            'code2' => array(
                'tag' => 'code',
                'type' => self::TYPE_UNPARSED_PARAMETER_UNPARSED_CONTENT,
                'content' => '<div class="cBlockCode"><div class="cBlockCodeHeader">Код: ($2)</div><div class="cBlockCodeContent"><pre>$1</pre></div></div>',
                'isBlock' => true
            ),
            'center' => array(
                'tag' => 'center',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<div align="center">',
                'after' => '</div>',
                'isBlock' => true
            ),
            'color' => array(
                'tag' => 'color',
                'type' => self::TYPE_UNPARSED_PARAMETER,
                'test' => '(#[\da-fA-F]{3}|#[\da-fA-F]{6}|[A-Za-z]{1,12})\]',
                'before' => '<span style="color: $1;">',
                'after' => '</span>'
            )
        ),
        'e' => array(
            'email1' => array(
                'tag' => 'email',
                'type' => self::TYPE_UNPARSED_CONTENT,
                'content' => '<a href="mailto:$1">$1</a>'
            ),
            'email2' => array(
                'tag' => 'email',
                'type' => self::TYPE_UNPARSED_PARAMETER,
                'before' => '<a href="mailto:$1">',
                'after' => '</a>',
                'disallow_children' => array('email', 'ftp', 'url', 'iurl'),
                'disabled_after' => ' ($1)'
            )
        ),
        'f' => array(
            'ftp1' => array(
                'tag' => 'ftp',
                'type' => self::TYPE_UNPARSED_CONTENT,
                'content' => '<a href="$1" rel="nofollow" onclick="window.open(\'$1\'); return false;">$1</a>'
            ),
            'ftp2' => array(
                'tag' => 'ftp',
                'type' => self::TYPE_UNPARSED_PARAMETER,
                'before' => '<a href="$1" rel="nofollow" onclick="window.open(\'ftp://glav.su\'); return false;">',
                'after' => '</a>',
                'disallow_children' => array('email', 'ftp', 'url', 'iurl'),
                'disabled_after' => ' ($1)'
            ),
            'font' => array(
                'tag' => 'font',
                'type' => self::TYPE_UNPARSED_PARAMETER,
                'test' => '[A-Za-z0-9_,\-\s"\']+?\]',
                'before' => '<span style="font-family: $1;">',
                'after' => '</span>'
            )
        ),
        'g' => array(
            'green' => array(
                'tag' => 'green',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<span style="color: green;">',
                'after' => '</span>',
            ),
            'glow' => array(
                'tag' => 'glow',
                'type' => self::TYPE_UNPARSED_PARAMETERS,
                'test' => '[#0-9a-zA-Z\-]{3,12},([012]\d{1,2}|\d{1,2})(,[^]]+)?\]',
                'before' => '<span style="background-color: $1;">',
                'after' => '</span>',
            )
        ),
        'h' => array(
            'hr' => array(
                'tag' => 'hr',
                'type' => self::TYPE_CLOSED,
                'content' => '<hr />',
                'isBlock' => true,
            )
        ),
        'i' => array(
            'img1' => array(
                'tag' => 'img',
                'type' => self::TYPE_UNPARSED_ATTRIBUTES_UNPARSED_CONTENT,
                'parameters' => array(
                    'alt' => array('optional' => true),
                    'width' => array('optional' => true, 'value' => ' width="$1"', 'match' => '(\d+)'),
                    'height' => array('optional' => true, 'value' => ' height="$1"', 'match' => '(\d+)'),
                ),
                'content' => '<img src="$1" alt="{alt}"{width}{height} />',
                'disabled_content' => '($1)'
            ),
            'img2' => array(
                'tag' => 'img',
                'type' => self::TYPE_UNPARSED_CONTENT,
                'content' => '<img src="$1" alt="" />',
                'disabled_content' => '($1)'
            ),
            'img3' => array(
                'tag' => 'img',
                'type' => self::TYPE_UNPARSED_PARAMETERS_UNPARSED_CONTENT,
                'test' => '\d+(,|x)\d+\]',
                'content' => '<img src="$1" alt="" width="$2" height="$3" />',
                'disabled_content' => '($1)'
            ),
            'i' => array(
                'tag' => 'i',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<i>',
                'after' => '</i>'
            )
        ),
        'j' => array(
            'justify' => array(
                'tag' => 'justify',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<div style="text-align: justify;">',
                'after' => '</div>',
                'isBlock' => true
            )
        ),
        'l' => array(
            'li' => array(
                'tag' => 'li',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<li>',
                'after' => '</li>',
                'trim' => 'outside',
                'require_parents' => array('list', 'ul', 'ol'),
                'isBlock' => true,
                'disabled_before' => '',
                'disabled_after' => '<br />'
            ),
            'list1' => array(
                'tag' => 'list',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<ul>',
                'after' => '</ul>',
                'trim' => 'inside',
                'require_children' => array('li'),
                'isBlock' => true
            ),
            'list2' => array(
                'tag' => 'list',
                'type' => self::TYPE_UNPARSED_ATTRIBUTES,
                'parameters' => array(
                    'type' => array('match' => '(none|disc|circle|square|decimal|decimal-leading-zero|lower-roman|upper-roman|lower-alpha|upper-alpha|lower-greek|lower-latin|upper-latin|hebrew|armenian|georgian|cjk-ideographic|hiragana|katakana|hiragana-iroha|katakana-iroha)'),
                ),
                'before' => '<ul style="list-style-type: {type};">',
                'after' => '</ul>',
                'trim' => 'inside',
                'require_children' => array('li'),
                'isBlock' => true
            ),
            'left' => array(
                'tag' => 'left',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<div style="text-align: left;">',
                'after' => '</div>',
                'isBlock' => true
            ),
            'ltr' => array(
                'tag' => 'ltr',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<div dir="ltr">',
                'after' => '</div>',
                'isBlock' => true
            )
        ),
        'm' => array(
            'me' => array(
                'tag' => 'me',
                'type' => self::TYPE_UNPARSED_PARAMETER,
                'before' => '<div class="cBlockMeAction">* $1 ',
                'after' => '</div>',
                'quoted' => 'optional',
                'isBlock' => true,
                'disabled_before' => '/me ',
                'disabled_after' => '<br />'
            ),
            'move' => array(
                'tag' => 'move',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<marquee>',
                'after' => '</marquee>',
                'isBlock' => true
            ),
            'movie1' => array(
                'tag' => 'movie',
                'type' => self::TYPE_UNPARSED_CONTENT,
                'test' => '\s*(https?://(www\.)?youtu\.be/[0-9a-zA-Z\?\-\_\=]+|https?://(www\.)?youtube\.com/watch\?v=[0-9a-zA-Z\?\-\_\=]+.*)\s*\[/movie\]',
                'content' => '<iframe width="640" height="480" src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>',
                'disabled_content' => '($1)'
            ),
            'movie2' => array(
                'tag' => 'movie',
                'type' => self::TYPE_UNPARSED_PARAMETERS_UNPARSED_CONTENT,
                'test' => '\d+,\d+\]\s*(https?://(www\.)?youtu\.be/[0-9a-zA-Z\?\-\_\=]+|https?://(www\.)?youtube\.com/watch\?v=[0-9a-zA-Z\?\-\_\=]+.*)\s*\[/movie\]',
                'content' => '<iframe width="$2" height="$3" src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>',
                'disabled_content' => '($1)'
            ),
            'movie3' => array(
                'tag' => 'movie',
                'type' => self::TYPE_UNPARSED_CONTENT,
                'test' => '\s*https?://rutube\.ru/play/embed/\d+\s*\[/movie\]',
                'content' => '<iframe width="640" height="480" src="https://rutube.ru/play/embed/$1" frameborder="0" allowfullscreen></iframe>',
                'disabled_content' => '($1)'
            ),
            'movie4' => array(
                'tag' => 'movie',
                'type' => self::TYPE_UNPARSED_PARAMETERS_UNPARSED_CONTENT,
                'test' => '\d+,\d+\]\s*https?://rutube\.ru/play/embed/\d+\s*\[/movie\]',
                'content' => '<iframe width="$2" height="$3" src="https://rutube.ru/play/embed/$1" frameborder="0" allowfullscreen></iframe>',
                'disabled_content' => '($1)'
            )
        ),
        'n' => array(
            'nobbc' => array(
                'tag' => 'nobbc',
                'type' => self::TYPE_UNPARSED_CONTENT,
                'content' => '$1'
            )
        ),
        'o' => array(
            'ol' => array(
                'tag' => 'ol',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<ol>',
                'after' => '</ol>',
                'trim' => 'inside',
                'require_children' => array('li'),
                'isBlock' => true
            )
        ),
        'p' => array(
            'pre' => array(
                'tag' => 'pre',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<pre>',
                'after' => '</pre>'
            ),
            'php' => array(
                'tag' => 'php',
                'type' => self::TYPE_UNPARSED_CONTENT,
                'content' => '<div class="cBlockPhpCode">$1</div>',
                'isBlock' => true,
                'disabled_content' => '$1'
            )
        ),
        'q' => array(
            'quote1' => array(
                'tag' => 'quote',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<div class="cBlockQuote"><div class="cBlockQuoteHeader">Цитата</div><div class="cBlockQuoteContent">',
                'after' => '</div></div>',
                'isBlock' => true
            ),
            'quote2' => array(
                'tag' => 'quote',
                'type' => self::TYPE_UNPARSED_ATTRIBUTES,
                'parameters' => array(
                    'author' => array('match' => '(.{1,192}?)', 'quoted' => true/*, 'validate' => 'parse_bbc'*/),
                ),
                'before' => '<div class="cBlockQuote"><div class="cBlockQuoteHeader">Цитата: {author}</div><div class="cBlockQuoteContent">',
                'after' => '</div></div>',
                'isBlock' => true
            ),
            'quote3' => array(
                'tag' => 'quote',
                'type' => self::TYPE_PARSED_PARAMETER,
                'before' => '<div class="cBlockQuote"><div class="cBlockQuoteHeader">Цитата: $1</div><div class="cBlockQuoteContent">',
                'after' => '</div></div>',
                'quoted' => 'optional',
                'isBlock' => true
            ),
            'quote4' => array(
                'tag' => 'quote',
                'type' => self::TYPE_UNPARSED_ATTRIBUTES,
                'parameters' => array(
                    'author' => array('match' => '([^<>]{1,192}?)'),
                    'link' => array('match' => '(forum/[\d\w-]+/[\d\w-]+/(?:\d+-message/#message\d+|threads/\d+/#message\d+|message/\d+/#msg\d+))'),
                    'date' => array('match' => '(\d+)', 'validate' => 'date', 'validateParams' => array('d.m.Y H:i:s')),
                ),
                'before' => '<div class="cBlockQuote"><div class="cBlockQuoteHeader">Цитата: <a href="/{link}" rel="nofollow">{author} от {date}</a></div><div class="cBlockQuoteContent">',
                'after' => '</div></div>',
                'isBlock' => true
            ),
            'quote5' => array(
                'tag' => 'quote',
                'type' => self::TYPE_UNPARSED_ATTRIBUTES,
                'parameters' => array(
                    'author' => array('match' => '(.{1,192}?)'),
                ),
                'before' => '<div class="cBlockQuote"><div class="cBlockQuoteHeader">Цитата: {author}</div><div class="cBlockQuoteContent">',
                'after' => '</div></div>',
                'isBlock' => true
            )
        ),
        'r' => array(
            'right' => array(
                'tag' => 'right',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<div style="text-align: right;">',
                'after' => '</div>',
                'isBlock' => true
            ),
            'red' => array(
                'tag' => 'red',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<span style="color: red;">',
                'after' => '</span>'
            ),
            'rtl' => array(
                'tag' => 'rtl',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<div dir="rtl">',
                'after' => '</div>',
                'isBlock' => true
            )
        ),
        's' => array(
            's' => array(
                'tag' => 's',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<span style="text-decoration: line-through;">',
                'after' => '</span>',
            ),
            'size1' => array(
                'tag' => 'size',
                'type' => self::TYPE_UNPARSED_PARAMETER,
                'test' => '([1-9][\d]?p[xt]|(?:x-)?small(?:er)?|(?:x-)?large[r]?)\]',
                'before' => '<span style="font-size: $1; line-height: 1.3em;">',
                'after' => '</span>',
            ),
            'size2' => array(
                'tag' => 'size',
                'type' => self::TYPE_UNPARSED_PARAMETER,
                'test' => '[1-9]\]',
                'before' => '<font size="$1" style="line-height: 1.3em;">',
                'after' => '</font>',
            ),
            'spoiler1' => array(
                'tag' => 'spoiler',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<div class="cBlockSpoiler"><div class="cBlockSpoilerHeaderOff">Скрытый текст</div><div class="cBlockSpoilerContent" style="display: none;">',
                'after' => '</div></div>',
                'isBlock' => true
            ),
            'spoiler2' => array(
                'tag' => 'spoiler',
                'type' => self::TYPE_PARSED_PARAMETER,
                'before' => '<div class="cBlockSpoiler"><div class="cBlockSpoilerHeaderOff">$1</div><div class="cBlockSpoilerContent" style="display: none;">',
                'after' => '</div></div>',
                'quoted' => 'optional',
                'isBlock' => true
            ),
            'sub' => array(
                'tag' => 'sub',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<sub>',
                'after' => '</sub>',
            ),
            'sup' => array(
                'tag' => 'sup',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<sup>',
                'after' => '</sup>'
            )
        ),
        't' => array(
            'tt' => array(
                'tag' => 'tt',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<tt>',
                'after' => '</tt>'
            ),
            'table' => array(
                'tag' => 'table',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<table class="postTable">',
                'after' => '</table>',
                'trim' => 'inside',
                'require_children' => array('tr'),
                'isBlock' => true
            ),
            'tr' => array(
                'tag' => 'tr',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<tr>',
                'after' => '</tr>',
                'require_parents' => array('table'),
                'require_children' => array('td'),
                'trim' => 'both',
                'isBlock' => true,
                'disabled_before' => '',
                'disabled_after' => ''
            ),
            'td' => array(
                'tag' => 'td',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<td>',
                'after' => '</td>',
                'require_parents' => array('tr'),
                'trim' => 'outside',
                'isBlock' => true,
                'disabled_before' => '',
                'disabled_after' => ''
            )
        ),
        'u' => array(
            'ul' => array(
                'tag' => 'ul',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<ul>',
                'after' => '</ul>',
                'trim' => 'inside',
                'require_children' => array('li'),
                'isBlock' => true
            ),
            'url1' => array(
                'tag' => 'url',
                'type' => self::TYPE_UNPARSED_CONTENT,
                'content' => '<a href="$1" rel="nofollow" onclick="window.open(\'$1\'); return false;">$1</a>'
            ),
            'url2' => array(
                'tag' => 'url',
                'type' => self::TYPE_UNPARSED_PARAMETER,
                'before' => '<a href="$1" rel="nofollow" onclick="window.open(\'$1\'); return false;">',
                'after' => '</a>',
                'disallow_children' => array('email', 'ftp', 'url', 'iurl'),
                'disabled_after' => ' ($1)'
            ),
            'u' => array(
                'tag' => 'u',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<span style="text-decoration: underline;">',
                'after' => '</span>'
            )
        ),
        'w' => array(
            'white' => array(
                'tag' => 'white',
                'type' => self::TYPE_PARSED_CONTENT,
                'before' => '<span style="color: white;">',
                'after' => '</span>'
           )
        )
    );

    /**
     * Экземпляр
     * @var Forum_Api_ParseBBCode
     */
    protected static $_instance = null;

    /**
     * Теги в которых запрещен autolink
     * @var array
     */
    protected $_disabledAutolinkTags = array(
        'url',
        'ftp',
        'email',
        'movie'
    );

    /**
     * Возвращает экземпляр
     * @return Forum_Api_ParseBBCode
     */
    public static function getInstance()
    {
        if (null === self::$_instance) {
            self::$_instance = new self();
        }

        $validateCodeFunction = create_function('&$tag, &$data', '
            global $context;
            $php_parts = preg_split(\'~(&lt;\?php|\?&gt;)~\', $data, -1, PREG_SPLIT_DELIM_CAPTURE);
            for ($php_i = 0, $php_n = count($php_parts); $php_i < $php_n; $php_i++) {
                // Do PHP code coloring?
                if ($php_parts[$php_i] != \'&lt;?php\')
                    continue;
                $php_string = \'\';
                while ($php_i + 1 < count($php_parts) && $php_parts[$php_i] != \'?&gt;\') {
                    $php_string .= $php_parts[$php_i];
                    $php_parts[$php_i++] = \'\';
                }
                //$php_parts[$php_i] = highlight_php_code($php_string . $php_parts[$php_i]);
                $php_parts[$php_i] = $php_string . $php_parts[$php_i];
            }
            // Fix the PHP code stuff...
            $data = str_replace("<pre style=\"display: inline;\">\t</pre>", "\t", implode(\'\', $php_parts));
            $data = str_replace("\t", "<span style=\"white-space: pre;\">\t</span>", $data);
        ');
        self::$_instance->_bbCodes['c']['code1']['validate'] = $validateCodeFunction;
        self::$_instance->_bbCodes['c']['code2']['validate'] = $validateCodeFunction;

        $validateEmailFunction = create_function('&$tag, &$data', '
            $data = strtr($data, array(\'<br />\' => \'\'));
        ');
        self::$_instance->_bbCodes['e']['email1']['validate'] = $validateEmailFunction;
        self::$_instance->_bbCodes['f']['ftp1']['validate'] = $validateEmailFunction;
        self::$_instance->_bbCodes['i']['img1']['validate'] = $validateEmailFunction;
        self::$_instance->_bbCodes['i']['img2']['validate'] = $validateEmailFunction;
        self::$_instance->_bbCodes['u']['url1']['validate'] = $validateEmailFunction;

        $validateMovieYoutubeFunction = create_function('&$tag, &$data', '
            $data = preg_replace(\'~^\s*https?://(?:www\.)?youtu\.be/([0-9a-zA-Z\?\-\_\=]+)\s*$~i\', \'$1\', $data);
            $data = preg_replace(\'~^\s*https?://(?:www\.)?youtube\.com/watch\?v=([0-9a-zA-Z\?\-\_\=]+).*\s*$~i\', \'$1\', $data);
        ');
        self::$_instance->_bbCodes['m']['movie1']['validate'] = $validateMovieYoutubeFunction;
        self::$_instance->_bbCodes['m']['movie2']['validate'] = $validateMovieYoutubeFunction;

        $validateMovieRutubeFunction = create_function('&$tag, &$data', '
            $data = preg_replace(\'~^\s*https?://(?:www\.)?rutube\.ru/play/embed/(\d+)\s*$~i\', \'$1\', $data);
        ');
        self::$_instance->_bbCodes['m']['movie3']['validate'] = $validateMovieRutubeFunction;
        self::$_instance->_bbCodes['m']['movie4']['validate'] = $validateMovieRutubeFunction;

        $validatePHPFunction = create_function('&$tag, &$data', '
            $add_begin = substr(trim($data), 0, 5) != \'&lt;?\';
            //$data = highlight_php_code($add_begin ? \'&lt;?php \' . $data . \'?&gt;\' : $data);
            if ($add_begin)
                $data = preg_replace(array(\'~^(.+?)&lt;\?.{0,40}?php(&nbsp;|\s)~\', \'~\?&gt;((?:</(font|span)>)*)$~\'), \'$1\', $data, 2);
        ');
        self::$_instance->_bbCodes['p']['php']['validate'] = $validatePHPFunction;

        return self::$_instance;
    }

    /**
     * Парсит BBCode
     */
    protected function _parse($bbCode)
    {
        // удаляем теги html
        $bbCode = trim(strip_tags($bbCode));
        // заменяем перевод новой строки, табуляцию
	$bbCode = strtr($bbCode, array("\n" => '<br />', "\t" => '&nbsp;&nbsp;&nbsp;'));

        // массив текущих открытых тегов
	$openTags = array();

	$posStartTag = -1;
	while ($posStartTag !== false) {
            // сохраняем предыдущую позицию
            $lastPos = isset($lastPos) ? max($posStartTag, $lastPos) : $posStartTag;
            // ищем начало следующего кода
            $posStartTag = strpos($bbCode, '[', $posStartTag + 1);
            if ($posStartTag === false || $lastPos > $posStartTag) {
                $posStartTag = strlen($bbCode) + 1;
            }

            if ($lastPos < $posStartTag - 1) {
                // откатываем последнюю позицию назад (для смайлов)
                $lastPos = max($lastPos - 1, 0);
                // выбираем подстроку между позициями
                $data = substr($bbCode, $lastPos, $posStartTag - $lastPos + 1);

                // анализируем autolinks
                $isAutoLinkArea = true;
                foreach ($openTags as $openTag) {
                    if (in_array($openTag['tag'], $this->_disabledAutolinkTags)) {
                        $isAutoLinkArea = false;
                    }
                }
                if ($isAutoLinkArea) {
                    // парсим url
                    if ((strpos($data, '://') !== false || strpos($data, 'www.') !== false)) {
                        $data = strtr($data, array('&#039;' => '\'', '&nbsp;' => "\xC2\xA0", '&quot;' => '>">', '"' => '<"<', '&lt;' => '<lt<'));
                        $pattern = array(
                          '~(?<=[\s>\.(;\'"]|^)((?:http|https|ftp)://[\w\-_%@:|]+(?:\.[\w\-_%]+)*(?::\d+)?(?:/[\w\-_\~%\.@,\?&;=#+:\'\\\\]*|[\(\{][\w\-_\~%\.@,\?&;=#(){}+:\'\\\\]*)*[/\w\-_\~%@\?;=#}\\\\])~iu',
                          '~(?<=[\s>(\'<]|^)(www(?:\.[\w\-_]+)+(?::\d+)?(?:/[\w\-_\~%\.@,\?&;=#+:\'\\\\]*|[\(\{][\w\-_\~%\.@,\?&;=#(){}+:\'\\\\]*)*[/\w\-_\~%@\?;=#}\\\\])~iu'
                        );
                        $replacement = array(
                            '[url]$1[/url]',
                            '[url=http://$1]$1[/url]'
                        );
                        $data = preg_replace($pattern, $replacement, $data);
                        $data = strtr($data, array('\'' => '&#039;', "\xC2\xA0" => '&nbsp;', '>">' => '&quot;', '<"<' => '"', '<lt<' => '&lt;'));
                    }
                    // парсим emails
                    if (strpos($data, '@') !== false) {
                        $pattern = array(
                            '~(?<=[\?\s' . self::NON_BREAKING_SPACE . '\[\]()*\\\;>]|^)([\w\-\.]{1,80}@[\w\-]+\.[\w\-\.]+[\w\-])(?=[?,\s' . self::NON_BREAKING_SPACE . '\[\]()*\\\]|$|<br />|&nbsp;|&gt;|&lt;' .
                            '|&quot;|&#039;|\.(?:\.|;|&nbsp;|\s|$|<br />))~u',
                            '~(?<=<br />)([\w\-\.]{1,80}@[\w\-]+\.[\w\-\.]+[\w\-])(?=[?\.,;\s' . self::NON_BREAKING_SPACE . '\[\]()*\\\]|$|<br />|&nbsp;|&gt;|&lt;|&quot;|&#039;)~u'
                        );
                        $replacement = array(
                            '[email]$1[/email]',
                            '[email]$1[/email]'
                        );
                        $data = preg_replace($pattern, $replacement, $data);
                    }
                }

                // анализируем длинные слова
                /*                
                $breaker = ' ';
                $data = strtr($data, array($breaker => '< >', '&nbsp;' => self::NON_BREAKING_SPACE));
                $data = preg_replace(
                    '~(?<=[>;:!? ' . self::NON_BREAKING_SPACE . '\]()]|^)([\w\.]{' . self::LONG_WORD_LENGTH . ',})~eu',
                    "preg_replace('/(.{" . (self::LONG_WORD_LENGTH - 1) . '})/u' . "', '\\\$1< >', '\$1')",
                    $data
                );
                $data = strtr($data, array('< >' => $breaker, self::NON_BREAKING_SPACE => '&nbsp;'));
                */
                $data = strtr($data, array(self::NON_BREAKING_SPACE => ' '));

                // парсим смайлы
                $data = $this->_parseSmileys($data);

                // проверяем изменение подстроки предыдущими манипуляциями
                if ($data != substr($bbCode, $lastPos, $posStartTag - $lastPos + 1)) {
                    $bbCode = substr($bbCode, 0, $lastPos) . $data . substr($bbCode, $posStartTag + 1);
                    $oldPos = strlen($data) + $lastPos - 1;
                    $posStartTag = strpos($bbCode, '[', $lastPos);
                    $posStartTag = $posStartTag === false ? $oldPos : min($posStartTag, $oldPos);
                }
            }

            // проверяем конец строки
            if ($posStartTag >= strlen($bbCode) - 1) {
                break;
            }

            // получаем первый символ тега
            $tagFirstChar = strtolower(substr($bbCode, $posStartTag + 1, 1));

            // анализируем закрывающий тег
            if ($tagFirstChar == '/' && !empty($openTags)) {
                // получаем позицию конца закрывающего тега
                $posEndTag = strpos($bbCode, ']', $posStartTag + 1);
                // пропускаем пустой закрывающий тег [/]
                if ($posEndTag == $posStartTag + 2) {
                    continue;
                }
                // получаем закрывающий тег
                $closeTag = strtolower(substr($bbCode, $posStartTag + 2, $posEndTag - $posStartTag - 2));

                $tagsToClose = array();
                $isBlock = null;
                do {
                    $tag = array_pop($openTags);
                    if (!$tag) {
                        break;
                    }

                    if (!empty($tag['isBlock'])) {
                        // Only find out if we need to.
                        if ($isBlock === false) {
                            array_push($openTags, $tag);
                            break;
                        }

                        // The idea is, if we are LOOKING for a block level tag, we can close them on the way.
                        if (strlen($closeTag) > 0 && isset($this->_bbCodes[$closeTag{0}])) {
                            foreach ($this->_bbCodes[$closeTag{0}] as $temp)
                                if ($temp['tag'] == $closeTag) {
                                    $isBlock = !empty($temp['isBlock']);
                                    break;
                                }
                        }

                        if ($isBlock !== true) {
                            $isBlock = false;
                            array_push($openTags, $tag);
                            break;
                        }
                    }

                    $tagsToClose[] = $tag;
                }
                while ($tag['tag'] != $closeTag);

                // Did we just eat through everything and not find it?
                if ((empty($openTags) && (empty($tag) || $tag['tag'] != $closeTag))) {
                    $openTags = $tagsToClose;
                    continue;
                } elseif (!empty($tagsToClose) && $tag['tag'] != $closeTag) {
                    if ($isBlock === null && isset($closeTag{0}, $this->_bbCodes[$closeTag{0}])) {
                        foreach ($this->_bbCodes[$closeTag{0}] as $temp)
                            if ($temp['tag'] == $closeTag) {
                                $isBlock = !empty($temp['isBlock']);
                                break;
                            }
                    }

                    // We're not looking for a block level tag (or maybe even a tag that exists...)
                    if (!$isBlock) {
                        foreach ($tagsToClose as $tag)
                            array_push($openTags, $tag);
                        continue;
                    }
                }

                foreach ($tagsToClose as $tag) {
                    $bbCode = substr($bbCode, 0, $posStartTag) . $tag['after'] . substr($bbCode, $posEndTag + 1);
                    $posStartTag += strlen($tag['after']);
                    $posEndTag = $posStartTag - 1;

                    // See the comment at the end of the big loop - just eating whitespace ;).
                    if (!empty($tag['isBlock']) && substr($bbCode, $posStartTag, 6) == '<br />')
                        $bbCode = substr($bbCode, 0, $posStartTag) . substr($bbCode, $posStartTag + 6);
                    if (!empty($tag['trim']) && $tag['trim'] != 'inside' && preg_match('~(<br />|&nbsp;|\s)*~', substr($bbCode, $posStartTag), $matches) != 0)
                        $bbCode = substr($bbCode, 0, $posStartTag) . substr($bbCode, $posStartTag + strlen($matches[0]));
                }

                if (!empty($tagsToClose)) {
                    $tagsToClose = array();
                    $posStartTag--;
                }

                continue;
            }

            // проверяем хеш BBCode
            if (!isset($this->_bbCodes[$tagFirstChar])) {
                continue;
            }

            $parentTag = empty($openTags) ? null : $openTags[count($openTags) - 1];
            $tag = null;
            // перебираем возможные теги
            foreach ($this->_bbCodes[$tagFirstChar] as $key => $possibleTag) {
                // сравниваем возможный тег
                if (strtolower(substr($bbCode, $posStartTag + 1, strlen($possibleTag['tag']))) != $possibleTag['tag']) {
                    continue;
                }
                // получаем следующий символ после тега
                $nextChar = substr($bbCode, $posStartTag + 1 + strlen($possibleTag['tag']), 1);

                // тестируем тег
                if (isset($possibleTag['test']) && preg_match('~^' . $possibleTag['test'] . '~', substr($bbCode, $posStartTag + 1 + strlen($possibleTag['tag']) + 1)) == 0) {
                    continue;
                }

                switch ($possibleTag['type']) {
                case self::TYPE_CLOSED:
                    if ($nextChar != ']' && substr($bbCode, $posStartTag + 1 + strlen($possibleTag['tag']), 2) != '/]' && substr($bbCode, $posStartTag + 1 + strlen($possibleTag['tag']), 3) != ' /]') {
                        continue 2;
                    }
                    break;
                case self::TYPE_PARSED_PARAMETER:
                case self::TYPE_UNPARSED_PARAMETER:
                case self::TYPE_UNPARSED_PARAMETER_UNPARSED_CONTENT:
                case self::TYPE_UNPARSED_PARAMETERS:
                case self::TYPE_UNPARSED_PARAMETERS_UNPARSED_CONTENT:
                    if ($nextChar != '=') {
                        continue 2;
                    }
                    break;
                case self::TYPE_UNPARSED_ATTRIBUTES:
                case self::TYPE_UNPARSED_ATTRIBUTES_UNPARSED_CONTENT:
                    if ($nextChar != ' ') {
                        continue 2;
                    }
                    break;
                case self::TYPE_PARSED_CONTENT:
                case self::TYPE_UNPARSED_CONTENT:
                    if ($nextChar != ']') {
                        continue 2;
                    }
                    break;
                }

                // проверяем дерево тегов
                if (isset($possibleTag['require_parents']) && ($parentTag === null || !in_array($parentTag['tag'], $possibleTag['require_parents']))) {
                    continue;
                } elseif (isset($parentTag['require_children']) && !in_array($possibleTag['tag'], $parentTag['require_children'])) {
                    continue;
                } elseif (isset($parentTag['disallow_children']) && in_array($possibleTag['tag'], $parentTag['disallow_children'])) {
                    continue;
                }

                // получаем позицию начала параметров/атрибутов
                $posStartParameters = $posStartTag + 1 + strlen($possibleTag['tag']) + 1;

                // проверяем параметры
                if (!empty($possibleTag['parameters'])) {
                    $preg = array();
                    foreach ($possibleTag['parameters'] as $p => $info) {
                        $quote = empty($info['quoted']) ? '' : '&quot;';
                        $optional = empty($info['optional']) ? '' : '?';
                        $preg[] = '(\s+' . $p . '=' . $quote . (isset($info['match']) ? $info['match'] : '(.+?)') . $quote . ')' . $optional;
                    }
                    $isMatch = false;
                    // формируем все возможные комбинации параметров
                    $orders = array($preg);
                    $n = count($preg);
                    $p = range(0, $n);
                    for ($i = 1; $i < $n; null) {
                        $p[$i]--;
                        $j = $i % 2 != 0 ? $p[$i] : 0;
                        $temp = $preg[$i];
                        $preg[$i] = $preg[$j];
                        $preg[$j] = $temp;
                        for ($i = 1; $p[$i] == 0; $i++) {
                            $p[$i] = 1;
                        }
                        $orders[] = $preg;
                    }
                    foreach ($orders as $p) {
                        if (preg_match('~^' . implode('', $p) . '\]~i', substr($bbCode, $posStartParameters - 1), $matches) != 0) {
                            $isMatch = true;
                            break;
                        }
                    }

                    // Didn't match our parameter list, try the next possible.
                    if (!$isMatch) {
                        continue;
                    }
                    $params = array();
                    for ($i = 1, $n = count($matches); $i < $n; $i += 2) {
                        $key = strtok(ltrim($matches[$i]), '=');
                        if (isset($possibleTag['parameters'][$key]['value'])) {
                            $params['{' . $key . '}'] = strtr($possibleTag['parameters'][$key]['value'], array('$1' => $matches[$i + 1]));
                        } elseif (isset($possibleTag['parameters'][$key]['validate'])) {
                            $validateParams = array();
                            if (isset($possibleTag['parameters'][$key]['validateParams'])) {
                                $validateParams = $possibleTag['parameters'][$key]['validateParams'];
                            }
                            $validateParams[] = $matches[$i + 1];
                            $params['{' . $key . '}'] = call_user_func_array($possibleTag['parameters'][$key]['validate'], $validateParams);
                        } else {
                            $params['{' . $key . '}'] = $matches[$i + 1];
                        }

                        // Just to make sure: replace any $ or { so they can't interpolate wrongly.
                        $params['{' . $key . '}'] = strtr($params['{' . $key . '}'], array('$' => '&#036;', '{' => '&#123;'));
                    }

                    foreach ($possibleTag['parameters'] as $p => $info) {
                        if (!isset($params['{' . $p . '}']))
                            $params['{' . $p . '}'] = '';
                    }

                    $tag = $possibleTag;

                    // Put the parameters into the string.
                    if (isset($tag['before'])) {
                        $tag['before'] = strtr($tag['before'], $params);
                    }
                    if (isset($tag['after'])) {
                        $tag['after'] = strtr($tag['after'], $params);
                    }
                    if (isset($tag['content'])) {
                        $tag['content'] = strtr($tag['content'], $params);
                    }

                    $posStartParameters += strlen($matches[0]) - 1;
                } else {
                    $tag = $possibleTag;
                }
                break;
            }

            // проверяем тег
            if (is_null($tag)) {
                continue;
            }

            // Propagate the list to the child (so wrapping the disallowed tag won't work either.)
            if (isset($parentTag['disallow_children'])) {
                $tag['disallow_children'] = isset($tag['disallow_children']) ? array_unique(array_merge($tag['disallow_children'], $parentTag['disallow_children'])) : $parentTag['disallow_children'];
            }

            // закрываем все не-блоковые теги до текущего блокового тега
            if (!empty($tag['isBlock']) && $tag['tag'] != 'html' && empty($parentTag['isBlock'])) {
                $n = count($openTags) - 1;
                while (empty($openTags[$n]['isBlock']) && $n >= 0) {
                    $n--;
                }
                for ($i = count($openTags) - 1; $i > $n; $i--) {
                    $bbCode = substr($bbCode, 0, $posStartTag) . $openTags[$i]['after'] . substr($bbCode, $posStartTag);
                    $posStartTag += strlen($openTags[$i]['after']);
                    $posStartParameters += strlen($openTags[$i]['after']);
                    // Trim or eat trailing stuff... see comment at the end of the big loop.
                    if (!empty($openTags[$i]['isBlock']) && substr($bbCode, $posStartTag, 6) == '<br />') {
                        $bbCode = substr($bbCode, 0, $posStartTag) . substr($bbCode, $posStartTag + 6);
                    }
                    if (!empty($openTags[$i]['trim']) && $tag['trim'] != 'inside' && preg_match('~(<br />|&nbsp;|\s)*~', substr($bbCode, $posStartTag), $matches) != 0) {
                        $bbCode = substr($bbCode, 0, $posStartTag) . substr($bbCode, $posStartTag + strlen($matches[0]));
                    }
                    array_pop($openTags);
                }
            }

            // заменяем startTag на before
            switch ($tag['type']) {
            case self::TYPE_PARSED_CONTENT:
            case self::TYPE_UNPARSED_ATTRIBUTES:
                $openTags[] = $tag;
                $bbCode = substr($bbCode, 0, $posStartTag) . $tag['before'] . substr($bbCode, $posStartParameters);
                $posStartTag += strlen($tag['before']) - 1;
                break;
            case self::TYPE_UNPARSED_ATTRIBUTES_UNPARSED_CONTENT:
            case self::TYPE_UNPARSED_CONTENT:
                $posEndTag = stripos($bbCode, '[/' . substr($bbCode, $posStartTag + 1, strlen($tag['tag'])) . ']', $posStartParameters);
                if ($posEndTag === false) {
                    continue;
                }
                $data = substr($bbCode, $posStartParameters, $posEndTag - $posStartParameters);
                if (!empty($tag['isBlock']) && substr($data, 0, 6) == '<br />') {
                    $data = substr($data, 6);
                }
                if (isset($tag['validate'])) {
                    $tag['validate']($tag, $data);
                }
                $code = strtr($tag['content'], array('$1' => $data));
                $bbCode = substr($bbCode, 0, $posStartTag) . $code . substr($bbCode, $posEndTag + 3 + strlen($tag['tag']));
                $posStartTag += strlen($code) - 1;
                break;
            case self::TYPE_UNPARSED_PARAMETER_UNPARSED_CONTENT:
                if (isset($tag['quoted'])) {
                    $quoted = substr($bbCode, $posStartParameters, 6) == '&quot;';
                    if ($tag['quoted'] != 'optional' && !$quoted) {
                        continue;
                    }
                    if ($quoted) {
                        $posStartParameters += 6;
                    }
                } else {
                    $quoted = false;
                }
                $posEndTag = strpos($bbCode, $quoted == false ? ']' : '&quot;]', $posStartParameters);
                if ($posEndTag === false) {
                    continue;
                }
                $pos3 = stripos($bbCode, '[/' . substr($bbCode, $posStartTag + 1, strlen($tag['tag'])) . ']', $posEndTag);
                if ($pos3 === false) {
                    continue;
                }
                $data = array(
                    substr($bbCode, $posEndTag + ($quoted == false ? 1 : 7), $pos3 - ($posEndTag + ($quoted == false ? 1 : 7))),
                    substr($bbCode, $posStartParameters, $posEndTag - $posStartParameters)
                );
                if (!empty($tag['isBlock']) && substr($data[0], 0, 6) == '<br />') {
                    $data[0] = substr($data[0], 6);
                }
                if (isset($tag['validate'])) {
                    $tag['validate']($tag, $data[0]);
                }
                $code = strtr($tag['content'], array('$1' => $data[0], '$2' => $data[1]));
                $bbCode = substr($bbCode, 0, $posStartTag) . $code . substr($bbCode, $pos3 + 3 + strlen($tag['tag']));
                $posStartTag += strlen($code) - 1;
                break;
            case self::TYPE_CLOSED:
                $posEndTag = strpos($bbCode, ']', $posStartTag);
                $bbCode = substr($bbCode, 0, $posStartTag) . $tag['content'] . substr($bbCode, $posEndTag + 1);
                $posStartTag += strlen($tag['content']) - 1;
                break;
            case self::TYPE_UNPARSED_PARAMETERS_UNPARSED_CONTENT:
                $posEndTag = strpos($bbCode, ']', $posStartParameters);
                if ($posEndTag === false) {
                    continue;
                }
                $pos3 = stripos($bbCode, '[/' . substr($bbCode, $posStartTag + 1, strlen($tag['tag'])) . ']', $posEndTag);
                if ($pos3 === false) {
                    continue;
                }
                // We want $1 to be the content, and the rest to be csv.
                //$data = explode(',', ',' . substr($bbCode, $posStartParameters, $posEndTag - $posStartParameters));
                $data = preg_split('~(,|x)~', ',' . substr($bbCode, $posStartParameters, $posEndTag - $posStartParameters));
                $data[0] = substr($bbCode, $posEndTag + 1, $pos3 - $posEndTag - 1);
                if (isset($tag['validate'])) {
                    $tag['validate']($tag, $data);
                }
                $code = $tag['content'];
                foreach ($data as $k => $d) {
                    $code = strtr($code, array('$' . ($k + 1) => trim($d)));
                }
                $bbCode = substr($bbCode, 0, $posStartTag) . $code . substr($bbCode, $pos3 + 3 + strlen($tag['tag']));
                $posStartTag += strlen($code) - 1;
                break;
            case self::TYPE_UNPARSED_PARAMETERS:
                $posEndTag = strpos($bbCode, ']', $posStartParameters);
                if ($posEndTag === false) {
                    continue;
                }
                $data = explode(',', substr($bbCode, $posStartParameters, $posEndTag - $posStartParameters));
                if (isset($tag['validate'])) {
                    $tag['validate']($tag, $data);
                }
                // Fix after, for disabled code mainly.
                foreach ($data as $k => $d) {
                    $tag['after'] = strtr($tag['after'], array('$' . ($k + 1) => trim($d)));
                }
                $openTags[] = $tag;
                // Replace them out, $1, $2, $3, $4, etc.
                $code = $tag['before'];
                foreach ($data as $k => $d) {
                    $code = strtr($code, array('$' . ($k + 1) => trim($d)));
                }
                $bbCode = substr($bbCode, 0, $posStartTag) . $code . substr($bbCode, $posEndTag + 1);
                $posStartTag += strlen($code) - 1;
                break;
            case self::TYPE_PARSED_PARAMETER:
            case self::TYPE_UNPARSED_PARAMETER:
                // The value may be quoted for some tags - check.
                if (isset($tag['quoted'])) {
                    $quoted = substr($bbCode, $posStartParameters, 6) == '&quot;';
                    if ($tag['quoted'] != 'optional' && !$quoted) {
                        continue;
                    }
                    if ($quoted) {
                        $posStartParameters += 6;
                    }
                } else {
                    $quoted = false;
                }
                $posEndTag = strpos($bbCode, $quoted == false ? ']' : '&quot;]', $posStartParameters);
                if ($posEndTag === false) {
                    continue;
                }
                $data = substr($bbCode, $posStartParameters, $posEndTag - $posStartParameters);
                // Validation for my parking, please!
                if (isset($tag['validate'])) {
                    $tag['validate']($tag, $data);
                }
                // For parsed content, we must recurse to avoid security problems.
                if ($tag['type'] != self::TYPE_UNPARSED_PARAMETER) {
                    $data = $this->_parse($data);
                }
                $tag['after'] = strtr($tag['after'], array('$1' => $data));
                $openTags[] = $tag;
                $code = strtr($tag['before'], array('$1' => $data));
                $bbCode = substr($bbCode, 0, $posStartTag) . $code . substr($bbCode, $posEndTag + ($quoted == false ? 1 : 7));
                $posStartTag += strlen($code) - 1;
                break;
            }

            // If this is block level, eat any breaks after it.
            if (!empty($tag['isBlock']) && substr($bbCode, $posStartTag + 1, 6) == '<br />') {
                $bbCode = substr($bbCode, 0, $posStartTag + 1) . substr($bbCode, $posStartTag + 7);
            }

            // Are we trimming outside this tag?
            if (!empty($tag['trim']) && $tag['trim'] != 'outside' && preg_match('~(<br />|&nbsp;|\s)*~', substr($bbCode, $posStartTag + 1), $matches) != 0) {
                $bbCode = substr($bbCode, 0, $posStartTag + 1) . substr($bbCode, $posStartTag + 1 + strlen($matches[0]));
            }
	}

	// Close any remaining tags.
	while ($tag = array_pop($openTags)) {
            $bbCode .= $tag['after'];
        }

	if (substr($bbCode, 0, 1) == ' ') {
            $bbCode = '&nbsp;' . substr($bbCode, 1);
        }

	// очищаем пробелы
	$bbCode = strtr($bbCode, array('  ' => ' &nbsp;', "\r" => '', "\n" => '<br />', '<br /> ' => '<br />&nbsp;', '&#13;' => "\n"));
        while (preg_match('~<br /><br /><br />~', $bbCode)) {
            $bbCode = preg_replace('~<br /><br /><br />~', '<br /><br />',  $bbCode);
        }
        while (preg_match('~</div><br /><br />~', $bbCode)) {
            $bbCode = preg_replace('~</div><br /><br />~', '</div><br />',  $bbCode);
        }

        $comments = preg_split( '((>)|(<))', $bbCode, - 1, PREG_SPLIT_DELIM_CAPTURE);
        $n = count($comments); 
        for($i = 0; $i < $n; $i ++) { 
            if ($comments[$i] == "<") { 
                $i ++; 
                continue; 
            } 
            $comments[$i] = preg_replace( "#([^\s\n\r]{" .  self::LONG_WORD_LENGTH . "})#iu", "\\1 ", $comments[$i]);
        } 
        $bbCode = join("", $comments); 

        return $bbCode;
    }

    /**
     * Парсит смайлы
     * @param string $text
     * @return string
     */
    protected function _parseSmileys($text)
    {
        $theme = 'glav';

        // получаем новые смайлы
        $getSmileysService = new Forum_Service_GetSmileys();
        $oldSmileys = $getSmileysService->getOldSmileys();

        $smileys = array();
        foreach ($oldSmileys as $smiley) {
            $smileys[$smiley['regexp']] = '$1<img src="/themes/' . $theme . '/images/smileys/' . $smiley['name'] . '.gif" alt="" />';
        }

        $text = preg_replace(array_keys($smileys), array_values($smileys), $text);

        // получаем новые смайлы
        $newSmileys = $getSmileysService->getSmileys();

        // парсим новые смайлы
        $smileys = array();
        foreach ($newSmileys as $smiley) {
            $name = $smiley['name'];
            $tooltip = $smiley['tooltip'];
            $smileys['/:' . $name . ':/'] = '<img src="/themes/' . $theme . '/images/smileys/' . $name . '.gif" alt="' . $tooltip . '" title="' . $tooltip . '" />';
        }

        $text = preg_replace(array_keys($smileys), array_values($smileys), $text);

        return $text;
    }

    /**
     * Возвращает HTML
     * @return string
     */
    public function getHtml()
    {
        return $this->_textHtml;
    }

    /**
     * Парсит BBCode
     */
    public function parse()
    {
        $this->_textHtml = $this->_parse($this->_textBBCode);
    }

    /**
     * Выболняет API
     * @param string $textBBCode
     * @return string
     */
    public function parseBBCode($textBBCode)
    {
        $this->_textBBCode = $textBBCode;
        return $this->_parse($this->_textBBCode);
    }

    /**
     * Устанавливает BBCode
     * @param string $bbCode
     */
    public function setBBCode($bbCode)
    {
        $this->_textBBCode = $bbCode;  
    }
}