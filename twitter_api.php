<?php

$api_url = 'https://publish.twitter.com/oembed';
$api_params = array(
	'url' => array(
		'pattern' => '!^https://twitter\.com/(\w+)/status/(\d+)$!i',
		'data' => '',
	), 
	'maxwidth' => array(
		'pattern' => '/^\d{3}$/',
		'data' => ' data-width="{0}"',
	), 
	'hide_media' => array(
		'pattern' => '/^(true|t|1)$/i',
		'data' => ' data-cards="hidden"',
	), 
	'hide_thread' => array(
		'pattern' => '/^(true|t|1)$/i',
		'data' => ' data-conversation="none"',
	), 
	'omit_script' => array(
		'pattern' => '/^(true|t|1)$/i',
		'data' => '',
	), 
	'align' => array(
		'pattern' => '/^(left|right|center)$/i',
		'data' => ' data-align="{0}"',
	), 
	'related' => array(
		'pattern' => '/^[\w,]+$/',
		'data' => '',
	), 
	'lang' => array(
		'pattern' => '/^\w{2}$/',
		'data' => ' data-lang="{0}"',
	), 
	'theme' => array(
		'pattern' => '/^dark$/i',
		'data' => ' data-theme="{0}"',
	), 
	'link_color' => array(
		'pattern' => '/^#[[:xdigit:]]{6}$/',
		'data' => ' data-link-color="{0}"',
	), 
	'widget_type' => array(
		'pattern' => '/^video$/i',
		'data' => 'twitter-video',
	),
);
$tweet_link = '';
$widget_class = 'twitter-tweet';
$widget_attributes = '';
$request_url = $api_url.'?';
foreach($api_params as $p_key => $p_param){
	if( isset($_GET[$p_key]) && preg_match($p_param['pattern'], $_GET[$p_key]) ){
		$request_url .= preg_match('/\?$/', $request_url)? '' : '&';
		$request_url .= $p_key.'='.$_GET[$p_key];
		if( $p_key == 'url' ){
			$tweet_link = $_GET[$p_key];
		}elseif( $p_key == 'widget_type' ){
			$widget_class = $p_param['data'];
		}else{
			$widget_attributes .= str_replace('{0}', $_GET[$p_key] ,$p_param['data']);
		}
	}
}
if( isset($_GET['iframe']) && preg_match('/^(true|1)$/', $_GET['iframe']) ){
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML+RDFa 1.1//EN" "http://www.w3.org/MarkUp/DTD/xhtml-rdfa-2.dtd">
<html version="XHTML+RDFa 1.1" xmlns="http://www.w3.org/1999/xhtml" xml:lang="ru" lang="ru">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<script type="text/javascript" src="twitter.widjets.js"></script>
	<script type="text/javascript">
		twttr.ready(function (twttr) {
			twttr.events.bind('rendered', function (event) {
				var arrFrames = parent.document.getElementsByTagName("IFRAME");
				for (var i = 0; i < arrFrames.length; i++) {
					if (arrFrames[i].contentWindow.document === document) {
						arrFrames[i].style.width = document.body.scrollWidth + 'px';
						arrFrames[i].style.height = document.body.scrollHeight + 'px';
					}
				}
				if (event.target.classList.contains('twitter-tweet-error')) {
					event.target.innerHTML = event.target.innerHTML + '<br /><span class="err-message">Ошибка загрузки твита.<br />Возможно твита с таким адресом не существует.</span>';
				}
				if (event.target.classList.contains('twitter-video-error')) {
					event.target.innerHTML = event.target.innerHTML + '<br /><span class="err-message">Ошибка загрузки видео из твита.<br />Возможно твит не содержит видео.</span>';
				}
				//console.log("Created widget", event.target);
			});
		});
	</script>
	<style type="text/css">
		.twitter-logo {
			display: block;
			width: 16px;
			height: 16px;
			background-image: url('/themes/glav/images/twitter-logo.png');
		}
		.err-message {
			color: #a00000;
		}
	</style>
</head>
<body style="border: 1px solid #eee;">
	<blockquote class="<?php echo $widget_class; ?>"<?php echo $widget_attributes; ?>>
		<a href="<?php echo $tweet_link; ?>"><span class="twitter-logo"></span></a>
	</blockquote>
</body>
</html>
<?php
}else{
	$resp = array();
	$resp['req_url'] = $request_url;
	$resp['tweet_link'] = $tweet_link;
	$resp['widget_class'] = $widget_class;
	$resp['widget_attributes'] = $widget_attributes;
	$r = new HttpRequest($request_url, HttpRequest::METH_GET);
	$r->setHeaders(array('Content-Type' => 'application/json'));
	try {
		$r->send();
		if ($r->getResponseCode() == 200) {
			$resp['tweet'] = $r->getResponseBody();
		}else{
			$resp['error'] = 'ResponseCode: '.$r->getResponseCode();
		}
	
	} catch (HttpException $ex) {
		$resp['error'] = 'Exception: '.$ex;
	}
	echo json_encode( $resp );
}
?>