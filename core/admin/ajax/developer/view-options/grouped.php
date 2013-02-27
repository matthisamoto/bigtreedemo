<?
	// Defaults
	$sort = isset($options["sort"]) ? $options["sort"] : "id DESC";
	$group_field = isset($options["group_field"]) ? $options["group_field"] : "";
	$per_page = isset($options["per_page"]) ? $options["per_page"] : 15;
	$filter = isset($options["filter"]) ? $options["filter"] : "";
	$draggable = isset($options["draggable"]) ? $options["draggable"] : false;
	$other_table = isset($options["other_table"]) ? $options["other_table"] : false;
	$title_field = isset($options["title_field"]) ? $options["title_field"] : false;
	$ot_sort_field = isset($options["ot_sort_field"]) ? $options["ot_sort_field"] : false;
	$ot_sort_direction = isset($options["ot_sort_direction"]) ? $options["ot_sort_direction"] : false;
?>
<fieldset>
	<input type="checkbox" class="checkbox" name="draggable" <? if ($draggable) { ?>checked="checked" <? } ?>/>
	<label class="for_checkbox">Draggable</label>
</fieldset>

<fieldset>
	<label>Group Field</label>
	<select name="group_field">
		<? BigTree::getFieldSelectOptions($table,$group_field) ?>
	</select>
</fieldset>

<fieldset>
	<label>Sort By Inside Groups <small>(if not draggable)</small></label>
	<select name="sort">
		<? BigTree::getFieldSelectOptions($table,$sort,true) ?>
	</select>
</fieldset>

<h4>Optional Parameters</h4>

<fieldset>
	<label>Other Table</label>
	<select name="other_table" class="table_select">
		<option></option>
		<? BigTree::getTableSelectOptions($other_table) ?>
	</select>
</fieldset>

<fieldset>
	<label>Field to Pull for Title</label>
	<div data-name="title_field">
		<? if ($other_table) { ?>
		<select name="title_field">
			<? BigTree::getFieldSelectOptions($other_table,$title_field) ?>
		</select>
		<? } else { ?>
		&mdash;
		<? } ?>
	</div>
</fieldset>

<fieldset>
	<label>Field to Sort By</label>
	<div data-name="ot_sort_field">
		<? if ($other_table) { ?>
		<select name="ot_sort_field">
			<? BigTree::getFieldSelectOptions($other_table,$ot_sort_field) ?>
		</select>
		<? } else { ?>
		&mdash;
		<? } ?>
	</div>
</fieldset>

<fieldset>
	<label>Sort Direction</label>
	<select name="ot_sort_direction">
		<option>ASC</option>
		<option<? if ($ot_sort_direction == "DESC") { ?> selected="selected"<? } ?>>DESC</option>
	</select>
</fieldset>