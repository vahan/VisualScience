<?php

/**
 * 
 * a class to represent tabs
 * @author Vahan
 *
 */
class Tab {
  private $tid; //tab id
  private $title;
  private $content;
  private $weight;
  
  /**
   * 
   * Class constructor
   * @param int $tid      tab id
   * @param string $title    tab title
   * @param string $content  tab HTML content 
   * @param int $weight    tab weight in the menu
   */
  function __construct($tid, $title, $content, $weight) {
    $this->title = $title;
    $this->content = $content;
    $this->weight = $weight;
    $this->tid = $tid;
  }
  
  /**
   * 
   * magic function to make the private members readable form outside
   * @param string $varName  name of the var
   */
  public function __get($varName) {
    return $this->$varName;
  }
  
  /**
   * 
   * magic function to make private members writable from outside, but here it is empty to make the members readonly
   * @param string $varName  name of the var
   * @param mixed $varValue  set value of the var
   */
  public function __set($varName, $varValue) {
    //Keep empty
  }
}


/**
 * 
 * Hook function for adding tabs, must be overridden by modules that want to have their tabs in this module
 * @return  a Tab objects
 */
function hook_add_tab() {
  
}

/**
 * 
 * Used to show the tab content
 * @param Tab $tab  the tab object to be shown
 */
function visualscience_show_tab() {
  $tid = arg(1); //Get the current tab id from the url path
  $tab = visualscience_get_tab($tid);
  
  return $tab->content;
}

/**
 * 
 * Loads the specified tab from the DB
 * @param int $tid	tid of the tab to be found
 * @return  		the found Tab object, otherwise FALSE
 */
function visualscience_get_tab($tid) {
  $query = "SELECT * FROM  WHERE ".visualscience_get_tabs_table_name()." tid = :tid";
  $result = db_query($query, array(':tid' => $tid));
  if (empty($result[0])) return FALSE;
  return new Tab($result[0]->tid, $result[0]->title, $result[0]->content, $result[0]->weight);
}

/**
 * 
 * Returns the name of the DB table where the tab information is stored
 */
function visualscience_get_tabs_table_name() {
  return "visualscience_tabs";
}


?>