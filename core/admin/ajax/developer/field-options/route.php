<?
	// Stop notices
	$data["source"] = isset($data["source"]) ? $data["source"] : "";
	$data["not_unique"] = isset($data["not_unique"]) ? $data["not_unique"] : "";
	$data["keep_original"] = isset($data["keep_original"]) ? $data["keep_original"] : "";
?>
<fieldset>
	<label>Source Field <small>(the column name of the field to use to generate the route)</small></label>
	<input type="text" name="source" value="<?=htmlspecialchars($data["source"])?>" />
</fieldset>

<fieldset>
	<input type="checkbox" name="not_unique" <? if ($data["not_unique"]) { ?>checked="checked" <? } ?>/>
	<label class="for_checkbox">Disregard Uniqueness<small>(if this box is checked duplicate routes can exist)</small></label>
</fieldset>

<fieldset>
	<input type="checkbox" name="keep_original" <? if ($data["keep_original"]) { ?>checked="checked" <? } ?>/>
	<label class="for_checkbox">Keep Original Route<small>(check to keep the first generated route)</small></label>
</fieldset>