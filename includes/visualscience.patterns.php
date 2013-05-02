<?php 

require_once 'visualscience.searchtable.class.php';
require_once 'visualscience.config.class.php';

function visualscience_patterns ($data = NULL)  {
	$action['visualscience_config'] = array(
		PATTERNS_INFO   => t('Modify Configuration for VisualScience'),
		PATTERNS_CREATE => array('visualscience_insert_config'),
		PATTERNS_MODIFY => array('visualscience_modify_config'),
		PATTERNS_EXPORT => array(
			PATTERNS_EXPORT_ALL => 'visualscience_export_config',
			),
		);

	return $action;
}

function visualscience_insert_config ($form_id, $form_state) {
	$config = new Config;
	$field = $form_state['values'];
	$error = 'none';
	$error = $config->checkCompletefield($field);
	$error = $config->fieldExistsInDB($field);

	$status = PATTERNS_ERR;
	$msg = 'An error occured in your file.';

	switch ($error) {
		case 'exist' :
		$msg = 'The field already exists in the database.';
		break;

		case 'name' :
		$msg = 'The field "name" is not defined.';
		break;

		case 'full' :
		$msg = 'The field "full" is not defined.';
		break;

		case 'first' :
		$msg = 'The field "first" is not defined.';
		break;

		case 'last' :
		$msg = 'The field "last" is not defined.';
		break;

		case 'mini' :
		$msg = 'The field "mini" is not defined.';
		break;

		case 'none':
		default:
		$status = PATTERNS_SUCCESS;
		$msg = '';
		$config->insertPatternConfig($field);		
	}

	return patterns_results($status, $msg);
}

function visualscience_modify_config ($form_id, $form_state) {
	$config = new Config;
	$field = $form_state['values'];

	$error = 'none';
	$error = $config->checkCompletefield($field);
	$error = $config->fieldExistsInDB($field);

	$status = PATTERNS_ERR;
	$msg = 'An error occured in your file.';

	switch ($error) {
		case 'notExist' :
		$msg = 'The field does not already exist in the database.';
		break;

		case 'name' :
		$msg = 'The field "name" is not defined.';
		break;

		case 'full' :
		$msg = 'The field "full" is not defined.';
		break;

		case 'first' :
		$msg = 'The field "first" is not defined.';
		break;

		case 'last' :
		$msg = 'The field "last" is not defined.';
		break;

		case 'mini' :
		$msg = 'The field "mini" is not defined.';
		break;

		default:
		$status = PATTERNS_SUCCESS;
		$msg = '';
		$config->modifyPatternConfig($field);		
	}

	return patterns_results($status, $msg);
}

function visualscience_export_config ($args = NULL, &$result = NULL) {
	$actions = array();
	$action_type = PATTERNS_MODIFY; // pre-init 
	
	if (isset($args['type']) && $args['type'] == PATTERNS_CREATE) {
		$action_type = PATTERNS_CREATE;
	}

	$search = new Search;
	$fields =  $search->getPatternConfiguration();
	foreach ($fields as $field) {
		$action = array($action_type => array(
			'tag' => 'visualscience_config', 
			'name' => $field['name'], 
			'mini' => $field['mini'], 
			'full' => $field['full'], 
			'first' => $field['first'], 
			'last' => $field['last']
			));

		array_push($actions, $action);
	}

	return $actions;
}