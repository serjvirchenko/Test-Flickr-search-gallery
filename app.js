document.getElementById('searchForm').addEventListener('submit', function(e){
	var value = this.text.value;

	e.preventDefault();

	myModyle.searchService(value);
});

document.addEventListener('click', function(e){
	var target = e.target;

	if(target.tagName == 'A' || (target.tagName == 'IMG' && target.parentNode.tagName == 'A')){
		var el = target.tagName == 'A' ? target : target.parentNode;

		e.preventDefault();
		myModyle.selectedImages(el);
	}

	if(target.id == 'add_to_the_gallery'){
		myModyle.addToTheGallery();
	}
});


var myModyle = (function(){
	var status_block = document.getElementById('status_loading'),
		results_block = document.getElementById('results'),
		errors_block = document.getElementById('errors_block'),
		add_ttgb = document.getElementById('add_to_the_gallery'),
		gallery = document.getElementById('gallery'),
		selectedArr = [],
		localArray = [];

	return {
		addToTheGallery: addToTheGallery,
		drawResults: drawResults,
		hasClass: hasClass,
		resetAllSelected: resetAllSelected,
		searchService: searchService,
		selectedImages: selectedImages,
		toggleClass: toggleClass
	};

	function addToTheGallery(){
		localArray = selectedArr.concat(localArray).unique();

		resetAllSelected();
		drawResults(localArray, gallery);
	}

	function drawResults(photos, block){
		block.innerHTML = '';

		for(var i=0;i<photos.length;i++){
			var p = photos[i],
				url = p.url || 'https://farm'+p.farm+'.staticflickr.com/'+p.server+'/'+p.id+'_'+p.secret+'_t.jpg';

			p.url ? block.innerHTML += '<img src="'+url+'">' : block.innerHTML += '<a href data-id="'+p.id+'" data-url="'+url+'"><img src="'+url+'"></a>';
		}
	}

	function hasClass(el, className){
		var a = new RegExp(className);

		return a.test(el.classList);
	}

	function resetAllSelected(){
		selectedArr = [];

		var arr = document.getElementsByTagName('a');

		for(var i=0;i<arr.length;i++){
			arr[i].classList.remove('selected');
		}
		add_ttgb.classList.remove('active');
	}

	function searchService(s){
		var xhr = new XMLHttpRequest(),
			method = 'flickr.photos.search',
			key = 'b54580f369a7eeebecb2004dc429d08f';

		toggleClass(status_block, 'active');

		xhr.open('GET', 'https://api.flickr.com/services/rest/?method='+ method +'&api_key='+key+'&text='+s+'&format=json&nojsoncallback=1', true);
		xhr.send();

		xhr.onload = function(){
			var res = JSON.parse(this.responseText);

			if (res.stat == 'ok'){
				status_block.innerHTML = '';
				if(res.photos.photo.length){
					drawResults(res.photos.photo, results_block);
				} else {
					errors_block.innerHTML = 'There is no photos with this search text';
				}
			} else {
				errors_block.innerHTML = 'Error: ' + res.code + '. ' + res.message;
			}
		};
		xhr.onerror = function(){
			errors_block.innerHTML = 'Error: ' + xhr.status + '. ' + xhr.statusText;
		};
		xhr.onloadend = function(){
			toggleClass(status_block, 'active');
		}
	}

	function selectedImages(el){
		var obj = {};

		if(!hasClass(el, 'selected')){
			toggleClass(el, 'selected');

			obj = {
				id: el.dataset.id,
				url: el.dataset.url
			};

			selectedArr.push(obj);
		} else {
			toggleClass(el, 'selected');

			for(var i=0;i<selectedArr.length;i++){
				if(selectedArr[i].id == el.dataset.id){
					selectedArr.splice(i, 1);
				}
			}
		}

		selectedArr.length ? add_ttgb.classList.add('active') : add_ttgb.classList.remove('active');
	}

	function toggleClass(el, className){
		var a = new RegExp(className);

		if(a.test(el.classList.value)){
			el.classList.remove(className);
		} else {
			el.classList.add(className);
		}
	}
})();

Array.prototype.unique = function() {
	var a = this.concat();
	for(var i=0; i<a.length; ++i) {
		for(var j=i+1; j<a.length; ++j) {
			if(a[i].id === a[j].id)
				a.splice(j--, 1);
		}
	}

	return a;
};