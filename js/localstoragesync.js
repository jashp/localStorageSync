var LocalStorageSync = function() {
	var prefix = "lss_";
	var lastSync = "lastSync";
	var pending = {};

	var _timestamp = function() {
		return Math.floor(new Date().getTime() / 1000);
	}

	var _getLastSync = function() {
		var ls = localStorage.getItem(lastSync);
		if (ls == null) return 0;
		return ls;
	}

	var _setLastSync = function(time) {
		if (time == null) time = _timestamp();
		localStorage.setItem(lastSync, time);
	}

	var _getPending = function() {
		var r = {};
		var lastSync = _getLastSync();
		for (var i = 0; i < localStorage.length; i++){
			prefixKey = localStorage.key(i);
			if (prefixKey.substring(0, prefix.length) == prefix) {
				var entry = localStorage.getItem(prefixKey);
				if (entry["ts"] > lastSync) {
					r[key.substring(prefix.length)] = entry;
				}
			}
		}
		return r;
	}

	var _getTime = function(key) {
		var o = JSON.parse(localStorage.getItem(prefix+key));
		if (o == null) return null
		return o["ts"];
	}

	this.getItem = function(key) {
		var o = JSON.parse(localStorage.getItem(prefix+key));
		if (o == null) return null
		return o["v"];
	}

	this.removeItem = function(key) {
		return localStorage.removeItem(prefix+key);
	}

	this.setItem = function(key, value) {
		var time = _timestamp();
		localStorage.setItem(prefix+key, JSON.stringify({v:value,ts:time}));
		pending[key] = {v:value,ts:time};
	}

	this.sync = function() {
		console.log(JSON.stringify(pending));
		console.log(_getLastSync());
		$.ajax({
			url: "/sync",
			type: "POST",
			data: {entries:JSON.stringify(pending), since:_getLastSync()},
		}).done(function(repsonse) {
			console.log(repsonse);
			response = JSON.parse(repsonse);
			for (key in response) {
				var clientTime = _getTime(key);
				var serverTime = response[key]["ts"];
				if (serverTime > clientTime) {
					localStorage.setItem(prefix+key, JSON.stringify(response[key]));
				}
			}
			pending = {}
			_setLastSync();
		});
	};

	pending = _getPending();
}

