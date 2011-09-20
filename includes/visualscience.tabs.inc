<?php

/**
 * 
 * a class to represent tabs
 * @author Vahan
 *
 */
class Tab {
  private $title;
  private $url;
  private $content;
  private $weight;
  private static $tabs;
  
  /**
   * 
   * Class constructor
   * @param string $title	tab title
   * @param string $url		tab url identifier
   * @param string $content	content of the tab
   * @param int $weight		tab weight in the menu
   */
  function __construct($title, $url, $content, $weight) {
    $this->title = $title;
    $this->url = $url;
    $this->content = $content;
    $this->weight = $weight;
    self::$tabs[$this->url] = $this; //stock all tabs in an array
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
  
  /**
   * 
   * Used to show the tab's content
   */
  public function show() {
    p("Tab -> show");
    return $this->content;
  }
  
  public static function get_tabs() {
    return self::$tabs;
  }
}

/**
 * 
 * Used to show the tab content
 * @param Tab $tab  the tab object to be shown
 */
/*function visualscience_show_tab() {
  $tab_name = arg(1); //Get the current tab id from the url path
  $tab = visualscience_get_tab($tab_name);
  
  return $tab->content;
}*/

/**
 * 
 * Loads the specified tab from the DB
 * @param string $tab_name	name of the tab to be found
 * @return  				the found Tab object, otherwise FALSE
 */
/*function visualscience_get_tab($tab_name) {
  $query = "SELECT * FROM  WHERE ".visualscience_get_tabs_table_name()." name = :name";
  $result = db_query($query, array(':name' => $tab_name));
  if (empty($result[0])) return FALSE;
  return new Tab($result[0]->title, $result[0]->content, $result[0]->weight);
}*/

/**
 * 
 * Returns the name of the DB table where the tab information is stored
 */
/*function visualscience_get_tabs_table_name() {
  return "visualscience_tabs";
}*/


?>