var LocalStorageSync = function(options) {

	var prefix;
	var lastSyncKey;
	var syncOnChange;
	var pending;
	var context = this;

	var _nullCheck = function(objectToTest, valueIfNull) {
		// more readable version of "return objectToTest||valueIfNull"
		if (objectToTest == null) {
			return valueIfNull;
		} else { 
			return objectToTest;
		}
	}

	options = _nullCheck(options, {prefix:null,lastSyncKey:null,syncOnChange:null,syncDisabled:null,debounceEnabled:null,debounceTime:null,removedValue:null})
	prefix = _nullCheck(options["prefix"], "lss_");
	lastSyncKey = _nullCheck(options["lastSyncKey"], "lss_lastSync");
	syncOnChange = _nullCheck(options["syncOnChange"], false);
	syncDisabled = _nullCheck(options["syncDisabled"], false);
	debounceDisabled = _nullCheck(options["debounceDisabled"], false);
	debounceTime = _nullCheck(options["debounceTime"], 5000);
	removedValue = _nullCheck(options["removedValue"], "");
	

	// borrowed from underscore.js
	var _debounce = function(func, wait, immediate) {
		var result;
		var timeout = null;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) result = func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) result = func.apply(context, args);
			return result;
		};
	};

	var _timestamp = function() {
		return Math.floor(new Date().getTime() / 1000);
	}

	var _getLastSync = function() {
		var ls = localStorage.getItem(lastSyncKey);
		if (ls == null) return 0;
		return ls;
	}

	var _setLastSync = function(time) {
		if (time == null) time = _timestamp();
		localStorage.setItem(lastSyncKey, time);
	}

	var _getPending = function() {
		if (syncDisabled) return {};

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
		if (o == null || o["v"] == removedValue) return null;
		return o["v"];
	}

	this.removeItem = function(key) {
		if (syncDisabled) {
			localStorage.removeItem(prefix+key);
		} else if (localStorage.getItem(prefix+key) != null) {
			context.setItem(key, removedValue);
		}
	}

	this.setItem = function(key, value) {
		var time = _timestamp();
		localStorage.setItem(prefix+key, JSON.stringify({v:value,ts:time}));

		if (syncDisabled) return;

		pending[key] = {v:value,ts:time};
		if (syncOnChange) { 
			context.sync();
		}
	}

	this.sync = _debounce(function() {
		if (syncDisabled) return;

		// console.log(JSON.stringify(pending));
		// console.log(_getLastSync());
		$.ajax({
			url: "/sync",
			type: "POST",
			data: {entries:JSON.stringify(pending), since:_getLastSync()},
		}).done(function(repsonse) {
			// console.log(repsonse);
			response = JSON.parse(repsonse);
			for (key in response) {
				var clientTime = _getTime(key);
				var serverTime = response[key]["ts"];
				if (serverTime > clientTime) {
					if (response[key]["v"] == removedValue) {
						localStorage.removeItem(prefix+key);
					} else { 
						localStorage.setItem(prefix+key, JSON.stringify(response[key]));
					}
				}
			}

			// delete all pending "removed" items from local storage as they've been sent to server
			for (key in pending) {
				if (pending[key]["v"] == removedValue && pending[key]["ts"] == _getTime(key)) {
					localStorage.removeItem(prefix+key);
				}
			}

			pending = {}
			_setLastSync();
		});
	}, debounceTime, debounceDisabled);

	pending = _getPending();
}

