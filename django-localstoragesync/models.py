from django.db import models
from django.contrib.auth.models import User

class Entry(models.Model):
	user = models.ForeignKey(User, related_name="entries")
	key = models.CharField(max_length=100)
	value = models.CharField(max_length=100)
	time = models.IntegerField(default=0)
	class Meta:
		index_together = [
			["user", "key"],
		]
		unique_together = ("user", "key")
	def __unicode__(self):
		return "{u:%s,k:%s}"%(self.user.username,self.key)

class SyncInfo(models.Model):
	user = models.OneToOneField(User)
	lastUpdate = models.IntegerField()
	def __unicode__(self):
		return "{u:'%s',ls:%d}"%(self.user.username,lastUpdate)
