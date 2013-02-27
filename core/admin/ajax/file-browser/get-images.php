<div class="file_browser_images">
	<?
		if ($_POST["query"]) {
			$items = $admin->searchResources($_POST["query"]);
			$perm = "e";
			$bc = array(array("name" => "Clear Results","id" => ""));
		} else {
			$perm = $admin->getResourceFolderPermission($_POST["folder"]);
			$items = $admin->getContentsOfResourceFolder($_POST["folder"]);
			$bc = $admin->getResourceFolderBreadcrumb($_POST["folder"]);
		}
		
		if (!$_POST["query"] && $_POST["folder"] > 0) {
			$folder = $admin->getResourceFolder($_POST["folder"]);
	?>
	<a href="#<?=$folder["parent"]?>" class="file folder"><span class="file_type file_type_folder file_type_folder_back"></span> Back</a>
	<?	
		}
	
		if ($perm != "n") {
		
			$minWidth = $_POST["minWidth"];
			$minHeight = $_POST["minHeight"];
			
			foreach ($items["folders"] as $folder) {
	?>
	<a href="#<?=$folder["id"]?>" class="file folder<? if ($folder["permission"] == "n") { ?> disabled<? } ?>"><span class="file_type file_type_folder"></span> <?=$folder["name"]?></a>		
	<?
			}
		
			foreach ($items["resources"] as $resource) {
				if ($resource["is_image"]) {
					$file = str_replace(array("{wwwroot}","{staticroot}"),SITE_ROOT,$resource["file"]);
					$thumbs = json_decode($resource["thumbs"],true);
					$thumb = $thumbs["bigtree_internal_list"];
					$margin = $resource["list_thumb_margin"];
					$thumb = str_replace(array("{wwwroot}","{staticroot}"),array(WWW_ROOT,STATIC_ROOT),$thumb);
					$disabled = (($minWidth && $minWidth !== "false" && $resource["width"] < $minWidth) || ($minHeight && $minHeight !== "false" && $resource["height"] < $minHeight)) ? " disabled" : "";
					
					// Find the available thumbnails for this image if we're dropping it in a WYSIWYG area.
					$available_thumbs = array();
					if (count($thumbs) > 0) {
						foreach ($thumbs as $tk => $tu) {
							if (substr($tk,0,17) != "bigtree_internal_") {
								$available_thumbs[] = array(
									"name" => $tk,
									"file" => $tu
								);
							}
						}
					}
					
					$data = htmlspecialchars(json_encode(array(
						"file" => $resource["file"],
						"thumbs" => $available_thumbs
					)));
	?>
	<a href="<?=$data?>" class="image<?=$disabled?>"><img src="<?=$thumb?>" alt="" style="margin-top: <?=$margin?>px;" /></a>
	<?
				}
			}
		}
		
		$crumb_contents = "";
		foreach ($bc as $crumb) {
			$crumb_contents .= '<li><a href="#'.$crumb["id"].'">'.$crumb["name"].'</a></li>';
		}
	?>
</div>
<script>
	<? if ($perm == "p") { ?>
	BigTreeFileManager.enableCreate();
	<? } else { ?>
	BigTreeFileManager.disableCreate();
	<? } ?>
	<? if ($_POST["query"]) { ?>
	BigTreeFileManager.setTitleSuffix(": Search Results");
	<? } else { ?>
	BigTreeFileManager.setTitleSuffix("");
	<? } ?>
	BigTreeFileManager.setBreadcrumb("<?=str_replace('"','\"',$crumb_contents)?>");
</script>