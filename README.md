BigTree + Google
================
Attempting to create a Google OpenID login for BigTree CMS users.

How it Works
------------
Uses included Google apiClient to authenticate an access token to login to the admin
BigTree retrieves the Google email address, cross-references it against a user in the database
If everything matches up, open sesame

A Few Notes
-----------
* User must be added to system using an email address associated with a Google account by an admin
* Developer must [set up an api project with Google][1] and use the client ID and secret in *core/inc/bigtree/google_authenticate.php* 
[1]: https://code.google.com/apis/console/ "Google API Console"