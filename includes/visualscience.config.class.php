<?php
/**
 * @file
 * Configuration class for VisualScience module
 */
class Config {
  /**
   * Initialisation procedure.
   * Only adds the needed JS
   */
  function __construct() {
    drupal_add_js(drupal_get_path('module', 'visualscience') . '/javascript/visualscience.config.js');
  }

  /**
   * Introductory text for the configuration page.
   * @return string The introductory text
   */
  private function getIntroduction() {
    return t('Here you will be able to choose which fields you want to show when the user opens the VisualScience module. Note that every field that is in the minimized table will also be in the full one. And the last name and full name are required in the mini table.<br /> <b>At the moment, the full table option is not used, but we are working hard on it.<b>');
  }
  /**
   * The settings HTML for configuration's numbers
   * @return string HTML containing fields and form.
   */
  private function getNumberSettingsHTML() {
    return '<table><tr><td>' . t('Number of users to display on first search (Default: 150) :') . '</td><td><input type="number" name="nbUsersPerPage" id="nbUsersPerPage" value="' . variable_get('visualscience_user_per_search_page', 150) . '" /></td><td>' . t('Number of users sent for each Ajax request (Default: 500) :') . '</td><td><input type="number" name="nbUsersPerAjax" id="nbUsersPerAjax" value="' . variable_get('visualscience_user_sent_per_ajax_request', 500) . '" /></td></tr></table>';
  }

  /**
   * HTML Form for configuration's buttons
   * @return string the HTML
   */
  private function getButtonSettingsHTML() {
    $csv = variable_get('visualscience_show_csv_button') ? 'checked' : '';
    $messages = variable_get('visualscience_show_messages_button') ? 'checked' : '';
    $livingscience = variable_get('visualscience_show_livingscience_button') ? 'checked' : '';
    $conference = variable_get('visualscience_show_conference_button') ? 'checked' : '';
    $buttons_with_conferences = '<table><tbody><tr><td>Messages Button:</td><td><input type="checkbox" name="vs_show_messages" id="vs_show_messages" ' . $messages . ' /></td><td>Export CSV Button:</td><td><input type="checkbox" name="vs_show_csv" id="vs_show_csv" ' . $csv . ' /></td><td>LivngScience Button:
    </td><td><input type="checkbox" name="vs_show_livingscience" id="vs_show_livingscience" ' . $livingscience . ' /></td><td>Conference Button:</td><td><input type="checkbox" name="vs_show_conference" id="vs_show_conference" ' . $conference . ' /></td></tr></tbody></table>';

    $buttons = '<table><tbody><tr><td>Messages Button:</td><td><input type="checkbox" name="vs_show_messages" id="vs_show_messages" ' . $messages . ' /></td><td>Export CSV Button:</td><td><input type="checkbox" name="vs_show_csv" id="vs_show_csv" ' . $csv . ' /></td><td>LivngScience Button:
    </td><td><input type="checkbox" name="vs_show_livingscience" id="vs_show_livingscience" ' . $livingscience . ' /></td></tr></tbody></table>';
    return $buttons;
  }

  /**
   * Creates a 2D array containing the display inputs for each field
   * @param  array $list    list of fields
   * @param  array $oldList Values in DB to know how to fill the fields
   * @return array          contains inputs for each field
   */
  private function createRows($list, $oldList) {
    $rows = array();
    foreach ($list as $l) {
      $mini = '';
      $full = '';
      $first = '';
      $last = '';
      if (isset($oldList[$l])) {
        $actual = $oldList[$l];
        $mini = $actual['mini'] == 1 ? 'checked': '';
        $full = $actual['full'] == 1 ? 'checked': '';
        $first = $actual['first'] == 1 ? 'checked': '';
        $last = $actual['last'] == 1 ? 'checked': '';
      }
      $row = array(
        $l,
        '<input class="mini" type="checkbox" name="' . $l . '-mini" value="1" ' . $mini . ' />',
        '<input class="full" type="checkbox" name="' . $l . '-full" value="1" ' . $full . ' />',
        '<input class="first" type="radio" name="first" value="' . $l . '" ' . $first . ' />',
        '<input class="last" type="radio" name="last" value="' . $l . '" ' . $last . ' />',
        );
      array_push($rows, $row);
    }
    return $rows;
  }

  /**
   * Creates a table containing the form with all the fields to show/hide
   * @param  array $fields    fields in form
   * @param  array $oldFields fields that were shown previously
   * @return string            Drupal-generated HTML table
   */
  private function createFieldsTable($fields, $oldFields) {
    $header = array(t('Field Name'),
      t('Show in minimized table ?'),
      t('Show in full table ?'),
      t('Which one is the First Name field ?'),
      t('Which one is the Last Name field ?'),
      );
    $rows = $this->createRows($fields, $oldFields);
    return theme('table', array('header' => $header, 'rows' => $rows));
  }

  /**
   * Save button to register values of form
   * @return string HTML of the button
   */
  private function createSaveButton() {
    $button = '<input type="submit" value="' . t('Save') . '" class="form-submit" />';
    return $button;
  }

  /**
   * Deletes from the DB the registered previously shown fields
   * @return none nothing returned
   */
  private function emptyOldValues() {
    $query = db_delete('visualscience_search_config');
    $query->execute();
  }

  /**
   * Inserts a new field to be shown in the configuration's DB
   * @param  string  $name  name of the field
   * @param  bool  $mini  wether to show it or not in the mini table
   * @param  bool  $full  shown or not in full table
   * @param  bool  $first is it the firstname field ?
   * @param  bool  $last  is it the lastname field ?
   * @param  integer $field wether it is a custom field from the install or not
   * @return none         nothing returned
   */
  private function insertIntoSearchConfig($name, $mini, $full, $first, $last, $field = 0) {
    $table = 'visualscience_search_config';
    $query = db_insert($table)->fields(array(
      'name' => $name,
      'mini' => $mini,
      'full' => $full,
      'first' => $first,
      'last' => $last,
      'field' => $field,
      ));
    $query->execute();
  }

  /**
   * Updates the search config DB with which fields to be shown or not
   * @param  string  $name  name of the field
   * @param  bool  $mini  show or not in the mini table
   * @param  bool  $full  show or not in the full table
   * @param  bool  $first is it the firstname field ?
   * @param  bool  $last  is it the astname field ?
   * @param  integer $field is it a custom field from the install or not ?
   * @return none         nothign returned
   */
  private function updateSearchConfig($name, $mini, $full, $first, $last, $field = 0) {
    $table = 'visualscience_search_config';
    $query = db_update($table)->fields(array(
      'mini' => $mini,
      'full' => $full,
      'first' => $first,
      'last' => $last,
      'field' => $field,
      ));

    $query->condition('name', $name);
    $query->execute();
  }

  /**
   * Gets the list of default fields possible
   * @return array array of the fields
   */
  private function getListOfFields() {
    $listFields = array();
    $userFields = user_load(0);
    return array_keys(get_object_vars($userFields));
  }

  /**
   * Gets the fields that were previously shown from the DB
   * @return array fields that were previously shown
   */
  private function getSelectedFields() {
    $query = db_select('visualscience_search_config', 'f')
    ->fields('f', array('name', 'mini', 'full', 'first', 'last'));
    $result = $query->execute();
    $final = array();
    while ($record = $result->fetchAssoc()) {
      $final[$record['name']] = $record;
    }
    return $final;
  }

  /**
   * Saves the number settings of the configuration page
   * @return none nothing returned
   */
  private function saveNumbersSettings() {
    $nbUsersPerPage = filter_xss(check_plain($_POST['nbUsersPerPage']));
    $nbUsersPerAjax = filter_xss(check_plain($_POST['nbUsersPerAjax']));
    if (isset($nbUsersPerPage) && $nbUsersPerPage !== 0) {
      $this->updateNbUsersPerPage($nbUsersPerPage);
    }
    if (isset($nbUsersPerAjax) && $nbUsersPerAjax !== 0) {
      $this->updateNbUsersPerAjax($nbUsersPerAjax);
    }
  }

  /**
   * Saves the visibility settings of actionbar's buttons
   * @return none nothing returned
   */
  private function saveVisibilitySettings() {
    if (isset($_POST['vs_show_csv'])) {
      variable_set('visualscience_show_csv_button', 1);
    }
    else {
      variable_set('visualscience_show_csv_button', 0);
    }
    if (isset($_POST['vs_show_messages'])) {
      variable_set('visualscience_show_messages_button', 1);
    }
    else {
      variable_set('visualscience_show_messages_button', 0);
    }
    if (isset($_POST['vs_show_livingscience'])) {
      variable_set('visualscience_show_livingscience_button', 1);
    }
    else {
      variable_set('visualscience_show_livingscience_button', 0);
    }
    if (isset($_POST['vs_show_conference'])) {
      variable_set('visualscience_show_conference_button', 1);
    }
    else {
      variable_set('visualscience_show_conference_button', 0);
    }
  }

  /**
   * Saves each field that has to be shown in the Database
   * @return none nothing returned
   */
  private function saveFields() {
    $fieldsList = $this->getListOfFields();
    foreach ($fieldsList as $field) {
      if (isset($_POST['first']) && $_POST['first'] == $field) {
        if (isset($_POST['last']) && $_POST['last'] == $field) {
          $this->insertIntoSearchConfig($field, 1, 1, 1, 1, 0);
        }
        else {
          $this->insertIntoSearchConfig($field, 1, 1, 1, 0, 0);
        }
      }
      elseif (isset($_POST['last']) && $_POST['last'] == $field) {
        $this->insertIntoSearchConfig($field, 1, 1, 0, 1, 0);
      }
      elseif (isset($_POST[$field . '-mini']) && intval($_POST[$field . '-mini']) == 1) {
        $this->insertIntoSearchConfig($field, 1, 1, 0, 0, 0);
      }
      elseif (isset($_POST[$field . '-full']) && intval($_POST[$field . '-full']) == 1) {
        $this->insertIntoSearchConfig($field, 0, 1, 0, 0, 0);
      }
    }
  }

  /**
   * Creates the HTML of the configuration page
   * @return string HTML of the config page
   */
  public function getHtmlConfigPage() {
    $fieldsList = $this->getListOfFields();
    $oldFields = $this->getSelectedFields();
    $intro = $this->getIntroduction();
    $fieldsTable = $this->createFieldsTable($fieldsList, $oldFields);
    $numberSettings = $this->getNumberSettingsHTML();
    $buttonSettings = $this->getButtonSettingsHTML();
    $saveButton = $this->createSaveButton();
    $formStart = '<form action="" method="POST" id="visualscience_config_form" >';
    $formEnd = '<input type="hidden" name="visualscience_config_form" /></form>';
    return $formStart . $intro . $fieldsTable . $numberSettings . $buttonSettings . $saveButton . $formEnd;
  }

  /**
   * Registers a submit configuration form
   * @return none nothing returned
   */
  public function saveSentValues() {
    $this->emptyOldValues();
    $this->saveFields();

    $this->saveNumbersSettings();
    $this->saveVisibilitySettings();
  }

  /**
   * Inserts a pattern config line into DB
   * @param  array $field the field to be inserted into the DB
   * @return none        nothing
   */
  public function insertPatternConfig($field) {
    $this->insertIntoSearchConfig($field['name'], $field['mini'], $field['full'], $field['first'], $field['last']);
  }

  /**
   * Updates a field in the DB from a pattern file
   * @param  array $field field to be updated
   * @return none        nothing returned
   */
  public function modifyPatternConfig($field) {
    $this->updateSearchConfig($field['name'], $field['mini'], $field['full'], $field['first'], $field['last']);
  }

  /**
   * Updates the number of users shown per visualscience page setting
   * @param  integer $value number of user shown
   * @return none        nothing returned
   */
  public function updateNbUsersPerPage($value) {
    variable_set('visualscience_user_per_search_page', intval($value));
  }

  /**
   * Updates the number of user sent per ajax request when loading the users
   * @param  integer $value the number of users to send
   * @return none        nothing returned
   */
  public function updateNbUsersPerAjax($value) {
    variable_set('visualscience_user_sent_per_ajax_request', intval($value));
  }

  /**
   * Checks wether a field has everything needed to be inserted in the DB
   * @param  array $field field to be checkd
   * @return mix        false if there was no error, else the missing field's entry
   */
  public function checkCompleteField($field) {
    if (!(isset($field['name']))) {
      return 'name';
    }
    if (!(isset($field['mini']))) {
      return 'mini';
    }
    if (!(isset($field['full']))) {
      return 'full';
    }
    if (!(isset($field['last']))) {
      return 'last';
    }
    if (!(isset($field['first']))) {
      return 'first';
    }
    return FALSE;
  }

  /**
   * Wether a given fields is already int he database or not.
   * @param  array $field field to check if in db or not
   * @return bool        wether it is in the db or not
   */
  public function fieldExistsInDB($field) {
    $result = db_select('visualscience_search_config', 'c')
    ->fields('c', array('name'))
    ->condition('name', $field['name'])
    ->range(0, 1)
    ->execute()
    ->rowCount();

    if ($result) {
      return TRUE;
    }
    return FALSE;
  }

  /**
   * Checks if the field have correct value type or not
   * @param  array $field field whose values have to be checked
   * @return mix        false if everything is correct, else it is the name of the faulty field's entry
   */
  public function checkCorrectValueTypes($field) {
    if (gettype($field['name']) != 'string') {
      return 'name';
    }
    if ($field['first'] != '0' && $field['first'] != '1') {
      return 'first';
    }
    if ($field['last'] != '0' && $field['last'] != '1') {
      return 'last';
    }
    if ($field['full'] != '0' && $field['full'] != '1') {
      return 'full';
    }
    if ($field['mini'] != '0' && $field['mini'] != '1') {
      return 'mini';
    }
    return FALSE;
  }
}