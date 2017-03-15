<?php

/*
 * Method for loading remote url
 * @param string $url Remote url
 * @return mixed $data Results of an request
 * */
function Curl($url = '') {
	if (empty($url)) {return false;}
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_FAILONERROR, 1);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
	curl_setopt($ch, CURLOPT_TIMEOUT, 3);
	curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows; U; Windows NT 5.1; ru-RU; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');
	$data = curl_exec($ch);
	return $data;
}

$resp = array();
$url = '';
$video_type = ( isset($_GET['vt']) && preg_match("/^(youtube|rutube|facebook|vimeo|ustream)$/", $_GET['vt']) )? $_GET['vt'] : '';
switch( $video_type ){
	case 'youtube' :
		$video_id = ( isset($_GET['id']) )? $_GET['id'] : '';
		if($video_id == ''){
			exit( json_encode( array('error' => "Empty video Id") ) );
		}
		$url = 'https://www.youtube.com/oembed?url='.urlencode('https://youtu.be/'.$video_id).'&format=json';
		$jdata = Curl($url);
		if( $jdata ){
			$resp['data'] = $jdata;
		}else{
			$resp['error'] = "Error get youtube data. ".$url;
		}
		break;
	case 'rutube' : 
		$video_url = ( isset($_GET['url']) )? $_GET['url'] : '';
		if($video_url == ''){
			exit( json_encode( array('error' => "Empty video url") ) );
		}
		$url = 'http://rutube.ru/api/oembed/?url='.urlencode($video_url).'&format=json';
		$jdata = Curl($url);
		if( $jdata ){
			$resp['data'] = $jdata;
		}else{
			$resp['error'] = "Error get rutube data. ".$url;
		}
		break;
	case 'facebook' :
		$video_url = ( isset($_GET['url']) )? $_GET['url'] : '';
		if($video_url == ''){
			exit( json_encode( array('error' => "Empty video url") ) );
		}
		$url = 'https://www.facebook.com/plugins/video/oembed.json/?url='.urlencode($video_url).'&omitscript=true';
		$jdata = Curl($url);
		if( $jdata ){
			$resp['data'] = $jdata;
		}else{
			$resp['error'] = "Error get facebook data. ".$url;
		}
		break;
	case 'vimeo' :
		$video_url = ( isset($_GET['url']) )? $_GET['url'] : '';
		if($video_url == ''){
			exit( json_encode( array('error' => "Empty video url") ) );
		}
		$url = 'https://vimeo.com/api/oembed.json?url='.urlencode($video_url);
		$jdata = Curl($url);
		if( $jdata ){
			$resp['data'] = $jdata;
		}else{
			$resp['error'] = "Error get vimeo data. ".$url;
		}
		break;
	case 'ustream' :
		$video_id = ( isset($_GET['id']) )? $_GET['id'] : '';
		if($video_id == ''){
			exit( json_encode( array('error' => "Empty video/channel Id") ) );
		}
		if( preg_match('!^recorded/(\d+)!', $video_id, $matches) ){
			$url = 'https://api.ustream.tv/videos/'.$matches[1].'.json';
		}else{
			$url = 'https://api.ustream.tv/channels/'.$video_id.'.json?detail_level=minimal';
		}
		$jdata = Curl($url);
		if( $jdata ){
			$resp['data'] = $jdata;
		}else{
			$resp['error'] = "Error get ustream data. ".$url;
		}
		break;
	default :
		$resp['error'] = "Unknown video type";
}

echo json_encode( $resp );

?>