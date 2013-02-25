<?php

/**
 * @file
 * Include file to create the search form
 */

/**
 * 
 * Creates the search form
 */
function visualscience_search_form($form, &$form_state, $formId) {
  global $user;
  $def_value = "";
  //search load
  if (isset($_GET['s'])) {//Why 's' instead of 'search' ? Magic !?
    $search = visualscience_get_search($_GET['search']);
    if ($search->uid != $user->uid) exit(0); //Security check =)
    $url_combine = variable_get("clean_url") ? "?" : "&";
    $url = "http://".$_SERVER['HTTP_HOST'].substr(request_uri(), 0, strrpos(request_uri(), "visualscience")+strlen("visualscience"));
    drupal_goto($url.$url_combine."search=".urlencode($search->search));
  }
  if (!isset($_SESSION["searchNumber"])) {
  	$_SESSION["searchNumber"] = 0;
  }
  if (isset($_GET['search'])) {
    $def_value = urldecode($_GET['search']);
    $form_state['values']['text'] = $def_value; //make the search be refined after loading
  }
  
  $idSuffix = substr($formId, strpos($formId, "search_form_") + strlen("search_form_"));
  
  //end of search load
  $form_state['page_num'] = 1;
  $form['search'] = array(
    '#title' => t('Refine Search'),
    '#type' => 'fieldset',
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
  );
  
  $form['search']['text'] = array(
    '#title' => t(''),
    '#type' => 'textfield',
  	'#id' => 'visualscience-search-query-'.$idSuffix,
    '#ajax' => array(
      // #ajax has two required keys: callback and wrapper.
      // 'callback' is a function that will be called when this element changes.
      'callback' => 'visualscience_search_callback',
      // 'wrapper' is the HTML id of the page element that will be replaced.
      'wrapper' => "visualscience-".variable_get("visualscience_current_tab")."-".$idSuffix,
      // There are also several optional keys - see ajax_example_autocheckboxes
      // below for details on 'method', 'effect' and 'speed' and
      // ajax_example_dependent_dropdown for 'event'.
      'event' => 'die', //bug 1, see visualscience.module. Kill all events to add only ENTER button
      'keypress' => TRUE, //Search when ENTER is pressed
      ),
  	  '#attributes' => array('class' => array('visualscience-search-query')),
      '#default_value' => $def_value,
      '#maxlength' => 1024,
      '#prefix' => "<table id='search-box-table'><tr><td style='padding-right: 3px;'>",
      '#suffix' => "<div id='vs-datepicker-".$idSuffix."' class='vs-datepicker'></div></td>"
  );
  
  $form['search']['search_button'] = array(
    '#value' => t('Go'),
    '#type' => 'button',
    '#ajax' => array(
      'callback' => 'visualscience_search_callback',
      'wrapper' => "visualscience-".variable_get("visualscience_current_tab")."-".$idSuffix,
    ),
	'#submit' => array(),
	'#validate' => array(),
	'#prefix' => '<td style="padding-left: 0;">',
	'#suffix' => '</td>',
  );
  
  $form['search']['table'] = array(
    '#type' => 'radios',
    '#options' => array('users'=>t('Users'), 'node'=>t('Nodes')),
  	'#default_value' => 'users',
  	'#prefix' => '<td style="padding-left: 0; width: 100%; visibility: hidden;">', //TODO: temporarily hidden
  	'#suffix' => '</td>',
  );

  $form['search']['help'] = array(
    '#type' => 'item',
    '#title' => l(t("Help"), "admin/help/visualscience"),
  	'#prefix' => '<td>',
  	'#suffix' => '</td></tr></table>',
  );
  
  //TODO: create a normal settings page 
  /*$form['search']['settings'] = array(
    '#type' => 'item',
    '#title' => l(t("Settings"),"admin/settings/visualscience"),
    '#prefix' => '<td>',
    '#suffix' => '</td></tr></table>',
  );*/
  
  $form['search']['save'] = array(
    '#title' => t('Save or Load'),
    '#type' => 'fieldset',
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
    '#prefix' => '<div id="save">',
    '#suffix' => '</div>',
  );
  
  $form['search']['save']['search_name'] = array(
    '#type' => 'textfield',
    '#title' => t(''),
    '#size' => '20',
  	'#maxlength' => 64,
    '#prefix' => '<table id="save-load-table"><tr><td>',
    '#suffix' => '</td>',
  );
  
  $form['search']['save']['button_save'] = array(
    '#value' => t('Save Search'),
    '#type' => 'button',
    '#ajax' => array(
      'callback' => 'visualscience_search_save_callback',
      'wrapper' => 'save',
    ),
  	'#submit' => array(),
    '#validate' => array(),
  	'#prefix' => '<td style="width: 100%">',
    '#suffix' => '</td><td><nobr>or load:</nobr></td>',
  );
  
  $options = array(0 => 'select');
  $searches = visualscience_get_all_searches();
  foreach ($searches as $search) {
    $options[$search->name] = t($search->name);
  }
  $is_clean_url = variable_get("clean_url");
  
  $form['search']['save']['load'] = array(
    '#type' => 'select',
    '#options' => $options,
    '#attributes' => array ('onchange' => '{
      if (this.selectedIndex == 0) return;
      if ('.$is_clean_url.' > 0) {
        window.location = window.location.href.substring(0, window.location.href.indexOf("?",0))+"?search="+this.options[this.selectedIndex].value;
      } else {
        window.location = window.location.href+"&search="+this.options[this.selectedIndex].value;
      }
    }'),
    '#prefix' => '<td>',
    '#suffix' => '</td></tr></table>',
  );
  
  return $form;
}

/**
 * 
 * Ajax callback for the search.
 * @param array $form		the form for wich this function is used.
 * @param array $form_state	refernce on the array representing the state of the form
 * @return					renderable array
 */
function visualscience_search_callback($form, $form_state) {
  $_GET["q"] = "visualscience"; //TODO: -what/why is this? -Magic!
  
  // get the id of the searched textfield, to determine where to load the results
  $fieldId = $form['search']['text']['#id'];
  $idSuffix = substr($fieldId, strpos($fieldId, "query-") + strlen("query-"));
  
  $text = trim($form_state['values']['text']);
  $table = $form_state['values']['table'];
  $list = visualscience_search($text, $table);
  $current_tab = variable_get("visualscience_current_tab");
  variable_set('visualscience_list', $list);
  
  return "<script type='text/javascript' class='.remove_after_loaded'>vsInterface.openUserListTab(".$idSuffix.");</script>".module_invoke($current_tab, 'science_tab', $list, $idSuffix);
}

/**
 * 
 * Ajax callback for search saving 
 * @param array $form    	the form for wich this function is used.
 * @param array $form_state refernce on the array representing the state of the form
 * @return           		modified form 
 */
function visualscience_search_save_callback($form, $form_state) {
  global $user;
  $search_name = $form_state['values']['search_name'] != '' ? $form_state['values']['search_name'] : 'default';
  $search_text = $form_state['values']['text'];
  
  $save_schema = drupal_get_schema(visualscience_get_save_table_name());
  $result = visualscience_get_search($search_name);

  if (count($result) == 0) {  
    db_query("INSERT INTO {".$save_schema['name']."} (uid, name, search) VALUES ($user->uid, '$search_name', '$search_text')");
  } else {
    db_query("UPDATE ".$save_schema['name']." SET search='$search_text' WHERE name='$search_name'");
  }
  return $form['users']['save'];
}

/**
 * Returns the name of the table where the saved searches are stored.
 * @return	the name of the table where the saved searches are stored.
 */
function visualscience_get_save_table_name() {
  return 'visualscience_searches';
}

/**
 * 
 * Returns an array of the current user's saved searches.
 * @return  all the saved searched of the logged in user.
 */
function visualscience_get_all_searches() {
  global $user;
  $save_schema = drupal_get_schema(visualscience_get_save_table_name());
  $result = db_select($save_schema['name'], 's')
        ->fields('s', array('sid', 'uid', 'name', 'search'))
        ->condition("uid", $user->uid)
        ->execute();

  $searches = array();
  foreach ($result as $row) {
    array_push($searches, $row);
  }
  return $searches;
}

/**
 * 
 * Returns an array with saved search details.
 * @param string $search_name	the name of the saved search.
* @return						array with the following keys: 'sid', 'uid', 'name', 'search', 'url'.
 */
function visualscience_get_search($search_name) {
  global $user;
  $save_schema = drupal_get_schema(visualscience_get_save_table_name());
  $result = db_select($save_schema['name'], 's')
        ->fields('s', array('sid', 'uid', 'name', 'search'))
        ->condition("name", $search_name)
        ->condition("uid", $user->uid)
        ->execute();

  foreach ($result as $row) {
    return $row;
  }
}



?>