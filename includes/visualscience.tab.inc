<?php

/**
 * 
 * a class to represent tabs
 * @author Vahan
 *
 */
class Tab {
  private $title;
  private $name;
  private $list;
  private $weight;
  private static $tabs;
  
  /**
   * 
   * Class constructor
   * @param string $title	tab title
   * @param string $name	name og the module to be shown in this tab
   * @param array $list		list representing the content of the tab
   * @param int $weight		tab weight in the menu
   */
  function __construct($title, $name, $list, $weight) {
    $this->title = t($title);
    $this->name = $name;
    $this->list = $list;
    $this->weight = $weight;
    self::$tabs[$this->name] = $this; //stock all tabs in an array
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
    return module_invoke($this->name, "science_show_tab", $this->list);
  }
  
  /**
   * 
   * Returns the list of all tabs 
   */
  public static function get_tabs() {
    return self::$tabs;
  }
  
  /**
   * 
   * Returns the tab with the given name
   * @param string $tab_name	unique name for the tab
   */
  public static function get_tab($tab_name) {
    return self::$tabs[$tab_name];
  }
}


?>