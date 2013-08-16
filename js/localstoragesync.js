var LocalStorageSync = function() {
	var suffix = ":ts";
	var lastSync = "ls";

	if (localStorage.getItem(lastSync) == null)
		localStorage.setItem(lastSync, 0);

	var _timestamp() {
		return int(new Date().getTime() / 1000);
	}
	var _getPending = function() {
		var r = {};
		var lastSync = localStorage.getItem(lastSync);
		for (var i = 0; i < localStorage.length; i++){
			key = localStorage.key(i);
			keySuffix = key.substring(key.length - suffix.length, key.length);
			if (keySuffix == suffix) {
				var time = _getTime(key);
				if (time > lastSync) {
					r[key] = {v:localStorage.getItem(key),ts:time};
				}
			}
		}
		return r;
	}

	var _setTime = function(key, value) {
		return localStorage.setItem(key+suffix, value);
	}

	var _getTime = function(key) {
		return localStorage.getItem(key+suffix);
	}

	this.getItem = function(key) {
		return localStorage.getItem(key);
	}

	this.removeItem = function(key) {
		return localStorage.removeItem(key);
	}

	this.setItem = function(key, value) {
		var time = _timestamp();
		localStorage.setItem(key, value);
		_setTime(key, time);
		pending[key] = {v:value,ts:time};
	}

	this.sync = function() {
		console.log(JSON.stringify(pending));
		console.log(localStorage.getItem(lastSync));
		$.ajax({
			url: "/sync",
			type: "POST",
			data: {entries:JSON.stringify(pending), since:localStorage.getItem(lastSync)},
		}).done(function(repsonse) {
			console.log(repsonse);
			response = JSON.parse(repsonse);
			for (key in response) {
				var clientTime = _getTime(key);
				var serverTime = response[key]["ts"];
				if (serverTime > clientTime) {
					localStorage.setItem(key, response[key]["v"]);
					_setTime(key, serverTime);
				}
			}
			pending = {}
			localStorage.setItem(lastSync, _timestamp());
		});
	};

	var pending = getPending();
}

