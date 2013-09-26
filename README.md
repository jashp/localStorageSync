localStorageSync
================

localStorageSync allows you to sync client side storage on simple web apps. An example can be seen at http://episodes.io.

# Usage

Include the JS file. The only dependency is jQuery 1.5+.
Create a LocalStorageSync object and proceed to use it like you would localStorage.

    var localStorageSync = new LocalStorageSync();
    localStorageSync.setItem("key", "value");
    alert(localStorageSync.getItem("key"));


When you want to perform a sync (simultaneously pushes and pulls), call the appropriate function.

    localStorageSync.sync();


Currently, the server component is implemented as a Django app but can be ported to any backend. To add it for Django, copy/symlink it into your project directory, add it to your INSTALLED_APPS and run:

    python manage.py sql [app_name]
