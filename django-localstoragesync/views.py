from sync.models import * 
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseNotFound
import json
import time

def sync(request):
	if not request.user.is_authenticated():
		return HttpResponseForbidden()

	since = int(request.POST.get("since", 0))
	entries = json.loads(request.POST.get("entries", "{}"))

	# find the last time the server was updated
	if not SyncInfo.objects.filter(user=request.user).exists():
		syncInfo = SyncInfo()
		syncInfo.user = request.user
		lastUpdate = 0
	else:
		syncInfo = SyncInfo.objects.get(user=request.user)
		lastUpdate = syncInfo.lastUpdate

	# get the values that have been updated on the server since the last sync
	updates = {}
	if lastUpdate > since:
		for entry in Entry.objects.filter(time__gt=since).filter(user=request.user):
			updates[entry.key] = {"v":entry.value, "ts":entry.time}

	# update the server values if the client is more recent 
	for key,e in entries.iteritems():
		query_set = Entry.objects.filter(user=request.user).filter(key=key)
		if query_set.exists():
			entry = query_set.get()
			if e["ts"] > entry.time:
				entry.value = e["v"]
				entry.time = e["ts"]
				entry.save()
		else:
			entry = Entry()
			entry.user = request.user
			entry.key = key
			entry.value = e["v"]
			entry.time = e["ts"]
			entry.save()


	syncInfo.lastUpdate = int(time.time())
	syncInfo.save()

	return HttpResponse(json.dumps(updates))
