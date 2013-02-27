<?
	$failure = false;
	if (isset($_POST["user"]) && isset($_POST["password"])) {
		if (!$admin->login($_POST["user"],$_POST["password"],$_POST["stay_logged_in"])) {
			$failure = true;
		}
	}
	
	$user = isset($_POST["user"]) ? htmlspecialchars($_POST["user"]) : "";
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
	<fieldset style="margin-top: 0;">
		<label>Sign in with your <img src="<?=WWW_ROOT?>images/google-logo.png" alt="Google"/> account</label>
		<div class="google_token">
			<label>Google API Token</label>
			<input type="text" id="token" name="token" class="text" />
		</div>
	</fieldset>
	<fieldset class="lower" style="margin-top: 0;">
		<a href="<?=$authenticate->Client->createAuthUrl()?>" class="button" id="google_button" target="_blank">Authenticate</a>
		<input type="submit" id="" class="button blue google_token" value="Save My Token" />
	</fieldset>
</form>
<script type="text/javascript">
	$('.google_token').hide();
	$('#google_button').bind({ click: function() {
		$(this).hide();
		$('.google_token').show();
	}});
</script>