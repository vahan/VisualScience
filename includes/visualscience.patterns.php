<?php 

function visualscience_patterns ($data = NULL)  {
	$action['visualscience_config'] = array(
		PATTERNS_INFO   => t('Modify Configuration for VisualScience'),
		PATTERNS_MODIFY => array('patterns_visualscience_modify_config'),
		PATTERNS_EXPORT => array(
			PATTERNS_EXPORT_ALL => 'patterns_visualscience_export_config',
			),
		);
}

function patterns_visualscience_modify_config () {

}

function patterns_visualscience_export_config ($args = NULL, &$result = NULL) {
	return $actions;
}