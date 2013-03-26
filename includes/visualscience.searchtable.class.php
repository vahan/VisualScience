<?php
class Search {

	private function ensureSearchSafety ($search) {
		return $search;
	}

	public function getHtmlSearchBar (searchValue= "") {
		$safeSearchVal = $this->ensureSearchSafety($searchValue);

		return '<div align="center">
		<input type="search" placeholder="Search..." val="'.$safeSearchVal.'" class="visualscience-search-main" id="visualscience-search-bar" onKeyUp="vsUserlist.search();" />
		<div style="width:48%;" align="left">
		<a class="visualscience-right" align="right">Help</a>
		<a class="visualscience-left" align="left">Save/Load</a>
		</div>
		</div>';
	}

	public function getHtmlSearchTable () {
		return '<p>Here there will be the table witht the users.</p>';
	}

	public function getClientSideFiles () {
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