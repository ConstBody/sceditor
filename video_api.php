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
	$data = curl_exec($ch);
	return $data;
}

$resp = array();
$video_type = ( isset($_GET['vt']) && preg_match("/^(youtube|rutube|twitter)$/", $_GET['vt']) )? $_GET['vt'] : '';
switch( $video_type ){
	case 'youtube' :
		$video_id = ( isset($_GET['id']) )? $_GET['id'] : '';
		if($video_id == ''){
			exit( json_encode( array('error' => "Empty video Id") ) );
		}
		$url = 'https://www.youtube.com/oembed?url=https://youtu.be/'.$video_id.'&format=json';
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
		$url = 'http://rutube.ru/api/oembed/?url='.$video_url.'&format=json';
		$jdata = Curl($url);
		if( $jdata ){
			$resp['data'] = $jdata;
		}else{
			$resp['error'] = "Error get rutube data. ".$url;
		}
		break;
	case 'vimeo' :
		
		break;
	default :
		$resp['error'] = "Unknown video type";
}

echo json_encode( $resp );

?>