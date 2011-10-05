<?php

/**
 * @file Includes functions to implement a filtering search from the given list and based on the given search string.
 *       The following search structure is used:
 *       keyword1=['value11' and 'value12' or not(value13)] and keyword2=['value21' and 'value22' or not(value23)] or ....
 *       note that and/or/not are case insencitive, even more, you can use &&/||/! and &/|/! accordingly
 *       also, '' are not compulsory, but if you have a reserved word in the searched value (e.g. 'Big and Cool') 
 *       you have to put the ''.
 *       For the date a bit different syntax is used:
 *       date=[start_date, end_date]. Any (but only one) limit date can be skipped provided that 
 *       you put the comma in the correct place. In that case, the limits are set to +/-infinity. 
 *       If there is one date without the comma, it will be used as start_date.
 * 
 *       Basicly you need only visualscience_search to use outside this function.
 */


include_once 'visualscience.search_form.inc';

/**
 * 
 * Implements search in the DB based on the given search string
 * @param string $search	user written text to be used for the search
 * @return					array of user objects
 */
function visualscience_search($search) {
  $users = array();
  //visualscience_search_query($search);
  $result = db_query(visualscience_search_query($search))->fetchAll();
  foreach ($result as $obj) {
    $users[] = user_load($obj->uid);
  }
  return $users;
}

/**
 * 
 * Creates a SQL query for the search based on the given string. SELECT users.uid
 * @param string $search	the string to be searched
 * @return					sql query of the search
 * 
 * TODO: inner not() is not handled properly
 */
function visualscience_search_query($search) {
  if ($search === "*") return "SELECT users.uid FROM {users}";
  $str = str_replace("\"", "\" ", $search); //temporary copy of the search string. There must be a space after each double-quote. The processed part is removed after each iteration.
  $query = "";
  $field_names = array();
  $field_number = 0; //the incremental number of each searched user created field
  if (strpos($search, "=") === FALSE) {
    //p("search in all query");
    $fields = visualscience_get_all_fields();
    foreach ($fields as $field) {
      $field_names[] = substr($field['field_name'], strlen("field_"));
    }
    $query = visualscience_search_in_all_query($search);
  } else {
    //p($search);
    while (strlen($str) > 0) {
      $dates = array(); //for start and end dates, if a date search is done
      $column = strtolower(trim(strstr($str, "[", true))); //current column to search
      $inner_str = substr($str, strpos($str, "[") + 1, strpos($str, "]") - strpos($str, "[") - 1); //the string inside [..]
      //p("column -> ".$column);
      //p("inner_str -> ".$inner_str);
      $inside = false; //if the current position is inside double quotes
      $word = ""; //current word, i.e. the string after the last space
      $value = ""; //current search value for the current column
      $operator = "";
      $inner_str = trim($inner_str); //remove the spaces from the begging and end
      $operators = visualscience_get_operators();
      if (strpos($column, ")") === 0) { //after not(..) the closing braket is left with the next column, so it must be removed
        $column = trim(substr($column, 1));
      }
      do { //handle the operators at the begining of the column. Cycle need for cases like AND NOT(..)
        $starting_operator = "";
        foreach ($operators as $op) { //check if $column starts with an operator
          if (stripos($column, $op) === 0) $starting_operator = $op;
        }
        if ($starting_operator === "") break; //if $str doesn't start with an operator break
        //p("starting operator -> ".$starting_operator);
        $query .= strtoupper($starting_operator).(strtolower($starting_operator) === "not"?"":" "); //for NOT don't put space afterwords
        $column = trim(substr($column, strpos($column, $starting_operator)+strlen($starting_operator)+(strtolower($starting_operator) === "not"?1:0))); //for NOT there is ( after the operator, so +1 the starting position
      } while ($starting_operator != "");
      if (empty($column)) { //with the emtpy inner_str an empty column is generated, and if not this BREAK, we get a forever cycle
        break;
      } elseif ($column === "role=") { //for role keyword search from `role` table
        $column = "role.name=";
      } elseif ($column === "date=") { //special handling for dates
        //TODO: dates handling
        if (strpos($inner_str, ",") !== FALSE) $dates = explode(",", $inner_str); //syntax:  date=[start_date, end_date]
        else { //if there is just one date, use it as a start date and for end date use the current date
          $dates[0] = $inner_str; //start date
          $dates[1] = ""; //end date
        }
        $column = "users.created";
      } elseif (in_array(strstr($column, "=", true), visualscience_get_user_data())) { //for other keywords use `users`
        $column = "users.".$column;
      } else { //for not keywords search in manually added fields
        array_push($field_names, strstr($column, "=", true));
        //p("ACHTUNG! ".$column." ".strlen());
        $column = "TTD_$field_number.name=";
        $field_number++;
      }
      //p("modified column -> ".$column);
      $query .= "("; //each column must be inside brakets
      if (count($dates) == 0) { //for dates a different handling is required
        for ($i = 0; $i < strlen($inner_str); ++$i) {
          if ($inner_str[$i] == '"') { //double-column indicates the start/end of a part which must be handled as a whole search value
            $inside = !$inside;
            continue;
          } 
          if ($inside) { //if inside double-brakets, add each symbol to the current word
            //p("inside double-quotes");
            $word .= $inner_str[$i];
            continue;
          }
          if ($inner_str[$i] === " ") //check the end of word
          {
            //p("space found!");
            if (in_array($word, visualscience_get_operators())) { //if the current word is a preserved operator (and|or|not)
              //p($word." is an operator!");
              $operator = $word;
              $query .= $column."'%".trim($value)."%'  ".strtoupper($operator)." "; //add to the query: column=value OPERATOR
              $value = ""; //start a new value after operators
            }
            else {
              $value .= $word." "; //if the current word is not an operator, add it to the current value
              $operator = ""; //reset operator after using
            }
            $word = ""; //start a new word after spaces
          }
          else {
            $word .= $inner_str[$i]; //if the symbol is not a space add to the current word
          }
          //p("i -> ".$i);
          //p("word -> ".$word);
          //p("value -> ".$value);
          //p("query -> ".$query);
        }
        $query .= $column."'%".trim($word)."%'".") "; //add the last word to the query
      } else { //handle dates
        $query .= visualscience_search_date_condition($dates, $column).") ";
      }
      $str = substr($str, strpos($str, "]")+1); //cut the first 'column=[...]' part
    }
  }
  $query = str_replace("=", " LIKE ", $query); //use LIKE statement
  $query = "SELECT users.uid FROM {users} users ".visualscience_search_role_joins().visualscience_search_field_joins($field_names)." WHERE ".$query; //Add the first part of the query
  //p("query -> ".$query);
  return $query;  
}

/**
 * 
 * Make a SQL search query condition for search among all columns
 * @param string $search	the string to be search for
 * @return					SQL query condition
 */
function visualscience_search_in_all_query($search) {
  $query = "";
  $data = visualscience_get_user_data();
  $is_first = true;
  foreach ($data as $column) {
    if (!$is_first) $query .= " OR ";
    else $is_first = false;
    if ($column == "role") $column = "role.name";
    else $column = "users.".$column;
    $query .= "(".$column."='%".$search."%')";
  }
  $fields = visualscience_get_all_fields();
  for ($i=0; $i<count($fields); ++$i) {
    $query .= " OR (TTD_".$i.".name='%".$search."%')";
  }
  return $query;
}

/**
 * 
 * Creates a WHERE claus of searched dates
 * @param array $dates		array of 2 elements: start_date and end_date
 * @param string $column	column in wich to search
 * @return					a string of SQL WHERE condition interval for the searched dates
 */
function visualscience_search_date_condition($dates, $column) {
  $query = "";
  if (count($dates) == 0) return "";
  if (!empty($dates[0])) {
    $start_date = new DateTime($dates[0]);
    $query = $column." > '".strtotime($start_date->format("d-m-Y"))."' ";
  }
  if (!empty($dates[1])) {
    $end_date = date_add(new DateTime($dates[1]), new DateInterval("P1D"))->format("d-m-Y"); //Add one day to include the given date in the search
    $query .= (empty($query)?"":"AND ").$column." < '".strtotime($end_date)."'";
  }
  //p("date query -> ".$query);
  return $query;
}

/**
 * 
 * Returns a string of SQL JOIN comands for all the fields
 */
function visualscience_search_role_joins() {
  $query = "LEFT JOIN {users_roles} users_roles ON users.uid=users_roles.uid LEFT JOIN {role} role ON users_roles.rid=role.rid "; //JOIN commands for roles
  return $query;
}

/**
 * 
 * Creates SQL JOIN commands for the given fields
 * @param array $field_names	array of field names that are used in the search
 * @return						string of SQL JOIN commands
 */
function visualscience_search_field_joins($field_names) {
  $query = "";
  $i = 0;
  foreach ($field_names as $field_name) {
    $field_table = "field_data_field_".$field_name;
    $query .= "LEFT JOIN {".$field_table."} ".$field_table." ON $field_table.entity_id=users.uid LEFT JOIN {taxonomy_term_data} TTD_".$i." ON ".$field_table.".field_".$field_name."_tid=TTD_".$i.".tid ";
    $i++;
  }
  return $query;
}

/**
 * 
 * Return an array of all possible logical operators (and|or|not)
 * @return	array("and", "or", "not")
 */
function visualscience_get_operators() {  
  return array("and", "or", "not");
}



































?>