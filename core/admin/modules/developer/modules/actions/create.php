<?
	$admin->createModuleAction(end($bigtree["path"]),$_POST["name"],$_POST["route"],$_POST["in_nav"],$_POST["class"],$_POST["form"],$_POST["view"],$_POST["level"]);
	
	$admin->growl("Developer","Created Action");
	BigTree::redirect($developer_root."modules/edit/".end($bigtree["path"])."/");
?>