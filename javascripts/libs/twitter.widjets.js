window.twttr = (function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0],
	t = window.twttr || {};
	if (d.getElementById(id)) return t;
	js = d.createElement(s);
	js.id = id;
	js.src = "https://platform.twitter.com/widgets.js";
	fjs.parentNode.insertBefore(js, fjs);
	
	t._e = [];
	t.ready = function(f) {
		t._e.push(f);
	};
	
	return t;
}(document, "script", "twitter-wjs"));
 
// Binding twitter widgets events
twttr.ready(function (twttr) {
// Occurs after twttr.widgets.load has initialized widgets in a page. 
// Includes an array of references to the newly created widget nodes.
//	twttr.events.bind('loaded', function (event) {
//		event.widgets.forEach(function (widget) {
//			console.log("Created widget", widget.id);
//		});
//	});
// Occurs after an individual widget in a page is rendered. Includes a 
// reference to the newly created widget node. Occurs at the same time 
// as loaded, but for each individual widget.
	twttr.events.bind('rendered', function (event) {
		if (event.target.classList.contains('twitter-tweet-error')) {
			event.target.innerHTML = event.target.innerHTML + '<br /><span style="color: #a00000;">Ошибка загрузки твита.<br />Попробуйте обновить страницу или используйте ссылку на твит.</span>';
		}
		if (event.target.classList.contains('twitter-video-error')) {
			event.target.innerHTML = event.target.innerHTML + '<br /><span style="color: #a00000;">Ошибка загрузки видео из твита.<br />Попробуйте обновить страницу или используйте ссылку на твит.</span>';
		}
		if( typeof window.$ === 'function' ){
			if( event.target.classList.contains('twitter-video') ){
				$(event.target).closest(".cBlockTwitter").css({
					'height': "auto",
					'background-color': "transparent"
				});
			}else{
				$(event.target).closest(".cBlockTwitter").css({
					'height': "auto",
					'background-color': "transparent"
				});
			}
		}
	});
});
