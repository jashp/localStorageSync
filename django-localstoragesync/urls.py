from django.conf.urls import patterns, url
from sync import views

urlpatterns = patterns('sync.views',
    url(r'^sync$', "sync"),
)