var app = app || {};

app.tooltip = document.getElementById('tooltip');
app.map = document.getElementById('map');
app.src = document.getElementById('srctext');
app.loading = document.getElementById('loading');
app.ttext = document.getElementById('ttext');

app.formatCountry = function (country) {
	var firstChar = country.substring(0, 1);
	firstChar = firstChar.toUpperCase();
	
	return firstChar + country.substring(1);
};

app.mapHover = function (evt) {
	if (evt.target.id === 'map') {
		return;
	}
	evt.stopPropagation();
	
	var dataLang;
	if (evt.target.dataset) {
		dataLang = evt.target.dataset.language;
	}else if (evt.target.getAttribute('data-language')) {
		dataLang = evt.target.getAttribute('data-language');
	}
	
	tooltip.innerHTML = '<b>' + evt.target.id + '</b><br>(' + dataLang + ')';
	tooltip.style.left = evt.clientX - 10 + 'px';
	tooltip.style.top = evt.clientY - 70 + 'px';
	tooltip.style.display = 'block';
};

app.mouseExit = function (evt) {
	var toElem = evt.relatedTarget || evt.toElement;
	if (!toElem || toElem.id === 'map') {
		tooltip.style.display = 'none';
	}
};

app.translate = function (evt) {
	var srctext = app.src.value;
   	if (!srctext) {
   		app.src.focus();
   		return;
   	}
   	
	var dstlang;
	if (evt.target.dataset) {
		dstlang = evt.target.dataset.lang;
	}else if (evt.target.getAttribute('data-lang')) {
		dstlang = evt.target.getAttribute('data-lang');
	}
	
	if (!dstlang) {
		app.showTranslation('Sorry, this region is not supported at the moment!');
		return;
	}else if (dstlang == 'en') {
		app.showTranslation(srctext);
		return;
	}
   	
   	// show loading
   	app.loading.style.display = 'block';
   	app.ttext.style.opacity = '0';
   	
   	var serviceUrl = 'http://api.mymemory.translated.net/get?q=' + srctext + 
	'&langpair=en|' + dstlang;
   
   	$.ajax({
   		url: serviceUrl, 
   		crossDomain: true
   	}).done(function (data) {
   		console.log(data);
   		var tr = data.responseData.translatedText;
   		if (!tr) {
   			tr = 'Oops, looks like this language isn\'t supported yet!';
   		}
   		// hide loading
   		app.loading.style.display = 'none';
   		// show translated text/message
   		app.showTranslation(tr);
   	});
};


app.showTranslation = function (txt) {
	var openbrace = document.getElementById('openbrace');
	var closebrace = document.getElementById('closebrace');
	var center = screen.width / 2;
	var margin = center;
	
	app.ttext.innerHTML = '';
	
	function animate() {
		if (margin > -100) {
			setTimeout(animate, 10);
			
			openbrace.style.left = margin + 'px';
			closebrace.style.right = margin + 'px';
			
			margin -= 20;
		}else {
			openbrace.style.left = '-100px';
			closebrace.style.right = '-100px';
			
			var opacity = 0.0;
			app.ttext.innerHTML = '"' + txt + '"';
			// vertical center
			app.ttext.style.top = document.body.clientHeight / 2 - app.ttext.offsetHeight / 2 + 30 + 'px';
			
			function fadeAppear() {
				if (opacity < 1.0) {
					setTimeout(fadeAppear, 10);
					opacity += 0.1;
					app.ttext.style.opacity = opacity;
				}else {
					app.ttext.style.opacity = 1.0;
				}
			};
			fadeAppear();
		}
	};
	animate();
};

app.hideTranslation = function (evt) {
	if (evt.keyCode == 27) {
		var opacity = 1.0;
		function animateFade() {
			if (opacity > 0) {
				setTimeout(animateFade, 10);
				opacity -= 0.1;
				app.ttext.style.opacity = opacity;
			}else {
				app.ttext.innerHTML = '';
				app.ttext.style.opacity = 1.0;
			}
		};
		animateFade();
	}
};



app.map.addEventListener('mouseover', app.mapHover, false);
app.map.addEventListener('mouseout', app.mouseExit, false);
app.map.addEventListener('click', app.translate, false);

document.addEventListener('keydown', app.hideTranslation);

app.showTranslation('Type your English text in the box above and click on any country to translate it to a language spoken in that country. Works best in 1366x768 resolution on Chrome & Safari. Hit the Escape key to dismiss this message. ')
