<?php 

require_once 'visualscience.searchtable.class.php';
require_once 'visualscience.config.class.php';

function visualscience_patterns ($data = NULL)  {
	$action['visualscience_config'] = array(
		PATTERNS_INFO   => t('Modify Configuration for VisualScience'),
		PATTERNS_MODIFY => array('visualscience_modify_config'),
		PATTERNS_EXPORT => array(
			PATTERNS_EXPORT_ALL => 'visualscience_export_config',
			),
		);

	return $action;
}

function visualscience_modify_config ($form_id, $form_state) {
	$config = new Config;
	$field = $form_state['values'];
	$config->savePatternConfig($field);
}

function visualscience_export_config ($args = NULL, &$result = NULL) {
	$actions = array();
	$action_type = PATTERNS_MODIFY;
	$search = new Search;
	$fields =  $search->getPatternConfiguration();
	foreach ($fields as $field) {
		$action = array($action_type => array(
			'tag' => 'visualscience_config', 
			'field_name' => $field['name'], 
			'field_mini' => $field['mini'], 
			'field_full' => $field['full'], 
			'field_first' => $field['first'], 
			'field_last' => $field['last']
			));

		array_push($actions, $action);
	}

	return $actions;
}