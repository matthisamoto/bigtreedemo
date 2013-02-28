<?
	/*
		Class: BigTreeGoogleAuth
			Allow BigTree to authenticate users via their Google Account
	*/
	
	class BigTreeGoogleAuth {
		
		/*
			Constructor:
				Connects to Google to retrieve an Authorization Key for future transactions.
		*/
		
		function __construct() {
			global $cms;

			// Setup Google API info
			require_once(BigTree::path("inc/lib/google/apiClient.php"));
			require_once(BigTree::path("inc/lib/google/contrib/apiOauth2Service.php"));
			$this->Client = new apiClient;
			$this->Client->setClientId('954414869458.apps.googleusercontent.com');
			$this->Client->setClientSecret('W6_I73nMOEbDFAbLH2CZ6-CP');
			$this->Client->setRedirectUri('http://localhost/admin/login');
			$this->Client->setScopes(array('https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'));
			$this->Client->setUseObjects(true);
			$this->API = new apiOauth2Service($this->Client);
		}
	}
?>