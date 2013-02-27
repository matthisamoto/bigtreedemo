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

			// Setup Google API info.
			require_once(BigTree::path("inc/lib/google/apiClient.php"));
			// require_once(BigTree::path("inc/lib/google/contrib/apiAnalyticsService.php"));
			$this->Client = new apiClient;
			$this->Client->setClientId('423602902679-h7bva04vid397g496l07csispa6kkth3.apps.googleusercontent.com');
			$this->Client->setClientSecret('lCP25m_7s7o5ua3Z2JY67mRe');
			$this->Client->setRedirectUri('urn:ietf:wg:oauth:2.0:oob');
			$this->Client->setScopes(array('https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'));
			$this->Client->setAccessType('online');
			// $this->Client->setScopes(array('https://www.googleapis.com/auth/analytics.readonly'));
			$this->Client->setUseObjects(true);
			/*
			$settings = $cms->getSetting("bigtree-internal-google-analytics");
			if (isset($settings["token"]) && $settings["token"]) {
				$this->Client->setAccessToken($settings["token"]);
				$this->API = new apiAnalyticsService($this->Client);
			}
			if (isset($settings["profile"]) && $settings["profile"]) {
				$this->Profile = $settings["profile"];
			}
			*/
		}
	}
?>