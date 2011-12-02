<?php

/**
 * 
 * @file
 * This file contains several helping functions that are used for the module 
 */

/**
 * 
 * Helper function, returns which user data to search 
 * @return       data names wich are used for the search
 */
function visualscience_get_user_data() {
  return array('name', 'mail', 'role', 'status', 'created');
}

/**
 * 
 * Helper function, returns which node data to search 
 * @return       data names wich are used for the search
 */
function visualscience_get_node_data() {
  return array('type', 'language', 'title', 'created');
}

/**
 * 
 * Returns the appropriate search data
 * @param string $table	the DB table wich data is searched. Possible values are "users" and "node"
 */
function visualscience_get_data($table) {
  return $table=="users"?visualscience_get_user_data():($table=="node"?visualscience_get_node_data():FALSE);
}

/**
 * 
 * Redirects to visualscience page
 */
function visualscience_redirect_to_visualscience() {
  drupal_goto('visualscience');
}

/**
 *
 * Function determining the autocompletion procedure and printing the result as a json list
 * @param string $term the term to search for
 * @param string $search_type type of the search, which determines the db tables to search for the results
 */
function visualscience_autocomplete($term = '', $search_type = 'generic') {
    // The table and the column to search in (used not for all cases)
    $table="";
    $column="";

    // the array of returned data
    $result=array();
    // In some cases result is ready before the case switching is done
    $resultReady = FALSE;

    switch ($search_type) {
      case 'role':
        $table = "role";
        $column = "name";
        break;
      case 'mail':
        $table = "users";
        $column = "mail";
        break;
      case 'name':
        $table = "users";
        $column = "name";
        break;
      case 'date':
        // This should bring a date box with date selection...
        return;
        break;
      case 'generic':
        return;
        break;
      default:
        // $search_type should match with the name of the field
        $result = taxonomy_get_field_autocomplete("field_".$search_type, $term);
        $resultReady = TRUE;
        break;
    }
    if (!$resultReady) {
        drupal_json_output(visualscience_get_autocomplete_data($table, $column, $term));
    } else {
        drupal_json_output($result);
    }
    return;
}

// @TODO allow for additional conditions to be passed, in addition to table name and column
/**
 * visualscience_get_autocomplete_data
 * Function to get the autocomplete data
 * @param string $table the name of the db table to get the data from
 * @param string $column the name of the table column
 * @param string $term the term to search for
 * @return      the array containing result strings
 */
function visualscience_get_autocomplete_data($table, $column, $term) {
    $query = db_select($table, 't')
                ->fields("t", array($column))
                ->where("LOWER(t.".$column.") LIKE '%".$term."%'")
                ->orderBy('t.'.$column, 'ASC');
    $result = $query
          ->execute();
          
    $results = array();
    foreach ($result as $r) {
      if ($r->$column != "")
        $results[] = $r->$column;
    }
    return $results; 
}

/**
 * taxonomy_get_field_autocomplete
 * Function to get the taxonomy field names as an array, given the field name
 * @param string $field_name
 * @param string $tag
 * @return
 */
function taxonomy_get_field_autocomplete($field_name, $tag = '') {
try {
    $field = field_info_field($field_name);

    // Part of the criteria for the query come from the field's own settings.
    $vids = array();
    $vocabularies = taxonomy_vocabulary_get_names();
    foreach ($field['settings']['allowed_values'] as $tree) {
      $vids[] = $vocabularies[$tree['vocabulary']]->vid;
    }

    $query = db_select('taxonomy_term_data', 't');
    $query->addTag('translatable');
    $query->addTag('term_access');

	$field_table = "field_data_".$field_name;

    $query->fields('t', array("tid", "name"));
    
    // Select rows that match by term name.
    $query
      ->condition('t.vid', $vids)
      ->condition('t.name', '%' . db_like($tag) . '%', 'LIKE')
      //     ->leftJoin($field_table, "ft", "ft.entity_id=users.uid")
      //     ->leftJoin($field_table, "ft", "ft.entity_id=users.uid")
      ->range(0, 10);

    $query
      ->innerJoin($field_table, 'ft', "ft.".$field_name."_tid=t.tid");
      
    $tags_return = $query 
      ->execute()
      ->fetchAllKeyed();

    $term_matches = array();
    foreach ($tags_return as $tid => $name) {
      $n = $name;
      // Term names containing commas or quotes must be wrapped in quotes.
      if (strpos($name, ',') !== FALSE || strpos($name, '"') !== FALSE) {
        $n = '"' . str_replace('"', '""', $name) . '"';
      }
      else {
        $term_matches[] = check_plain($name);
      }
    }
    return $term_matches;
  } catch (Exception $e) {
    // If there is no such field name, or in case of any other exception
    return array();
  }
}

/**
 * returns an array containing all fields
 */
function visualscience_get_all_fields() {  
  return field_info_instances('user', 'user');
}

/**
 * function to load the searchform after 1 has already became a dialog
 */
function visualscience_searchform($node) {
  $_SESSION["searchNumber"] = $_SESSION["searchNumber"] + 1;
  $output = "<div class='visualscience-container' id='visualscience-container-".$_SESSION["searchNumber"]."'><div id='container-".$_SESSION["searchNumber"]."-0'>";
  $output .= drupal_render(drupal_get_form('visualscience_search_form_'.$_SESSION["searchNumber"]));
  $list = variable_get('visualscience_list');
  $output .= module_invoke('user_list', 'science_tab', $list, $_SESSION["searchNumber"]);
  // the span is put to activate the actions for the newly loaded textfield
  $output .= "<span id='activate_actions'></span></div></div>";
  return $output;
}

/**
 *
 * Case insensitive in_array
 * @param $needle
 * @param $haystack
 */
function in_arrayi($needle, $haystack) {
 return in_array(strtolower($needle), array_map('strtolower', $haystack));
}

/**
 * 
 * tired of typing the long line everytime
 */
function p($obj) {
  drupal_set_message(print_r($obj, true));
}
