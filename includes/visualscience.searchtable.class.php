<?php
class Search {
	public function mySuperFunction () {

	}

	private function mySecondSuperFunction () {

	}

	public getClientSideFiles () {
		global $user;
		drupal_add_library('system', 'ui.autocomplete');
		drupal_add_library('system', 'ui.datepicker');
		drupal_add_library('system', 'ui.dialog');
		drupal_add_library('system', 'ui.tabs');

		drupal_add_css(drupal_get_path('module', 'visualscience') .'/css/visualscience.css');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/lib/visualscience.jquery.layout.js');
		drupal_add_css(drupal_get_path('module', 'visualscience') .'/css/visualscience.jquery.layout.css');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/lib/visualscience.jquery.tablesorter.js');
		drupal_add_css(drupal_get_path('module', 'visualscience') .'/css/visualscience.jquery.tablesorter.css');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/lib/visualscience.handlebars.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/lib/visualscience.nddb.js');
  		//Settings necessary to VisualScience:
		drupal_add_js(array('installFolder' => url(drupal_get_path('module', 'visualscience')).'/'), 'setting');
		drupal_add_js(array('username' => $user->name), 'setting');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.utils.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.database.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.interface.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.search.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.message.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.csv.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.userlist.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.lscomparison.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.search.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.conference.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.livingscience.js');
	}
}