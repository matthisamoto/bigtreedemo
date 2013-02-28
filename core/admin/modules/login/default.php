<?
	$failure = false;
	$google_failure = false;
	if (isset($_POST["user"]) && isset($_POST["password"])) {
		if (!$admin->login($_POST["user"],$_POST["password"],$_POST["stay_logged_in"])) {
			$failure = true;
		}
	}
	
	$user = isset($_POST["user"]) ? htmlspecialchars($_POST["user"]) : "";
	$token = isset($_GET['code']) ? $_GET['code'] : "";
	
	if ($token) {
		try {
			if( $authenticate->Client->authenticate() ) {
				$userinfo = $authenticate->API->userinfo->get();
				if(!$admin->loginWithGoogle($userinfo->email)) {
					$google_failure = true;
				}
			}
		} catch (Exception $e) {
			$google_failure = true;
		}
	}
?>
<form method="post" action="" class="module">
	<? if ($failure) { ?><p class="error_message clear">You've entered an invalid email address and/or password.</p><? } ?>
	<fieldset>
		<label>Email</label>
		<input type="email" id="user" name="user" class="text" value="<?=$user?>" />
	</fieldset>
	<fieldset>
		<label>Password</label>
		<input type="password" id="password" name="password" class="text" />

		<p><input type="checkbox" name="stay_logged_in" checked="checked" /> Remember Me</p>
	</fieldset>
	<fieldset class="lower">
		<a href="<?=ADMIN_ROOT?>login/forgot-password/" class="forgot_password">Forgot Password?</a>
		<input type="submit" class="button blue" value="Login" />
	</fieldset>
</form>
<form method="post" action="<?=$mroot?>set-token/" class="module" style="margin-top: 30px;">
	<? if ($google_failure) { ?><p class="error_message clear">There is no account associated with your Google email address</p><? } ?>
	<fieldset style="margin-top: 0;">
		<label>Sign in with your <img src="<?=ADMIN_ROOT?>images/google-logo.png" alt="Google"/> account</label>
	</fieldset>
	<fieldset class="lower" style="margin-top: 0;">
		<a href="<?=$authenticate->Client->createAuthUrl()?>" class="button blue" id="google_button">Authenticate</a>
	</fieldset>
</form>