<?php 
class Config {

	function __construct () {
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.config.js');
	}

	private function getIntroduction () {
		return t('Here you will be able to choose which fields you want to show when the user opens the VisualScience module. Note that every field that is in the minimized table will also be in the full one. And the last name and full name are required in the mini table.');

	}

	private function getUserFields () {
		//Don't put spaces -> problem when saving request
		return array(t('Id'), t('Name'), t('Email'), t('Signature'), t('CreationDate'), t('LastAccess'), t('Status'), t('Language'), t('Role'));
	}

	private function getCreatedFields () {
		$dbQuery = db_select('field_config', 'f');
		$dbQuery->fields('f', array('id', 'field_name'));
		$fields = $dbQuery->execute()->fetchAllKeyed();
		return $fields;
	}

	private function getOldUserFields () {
		$query = db_select('visualscience_search_config', 'f')
		->fields('f', array('name', 'mini', 'full', 'first', 'last'))
		->condition('field', 1, '<');
		$result = $query->execute();
		$final = array();
		while ($record = $result->fetchAssoc()) {
			$final[$record['name']] = $record;
		}
		return $final;
	}

	private function getOldCreatedFields () {
		$query = db_select('visualscience_search_config', 'f')
		->fields('f', array('name', 'mini', 'full', 'first', 'last'))
		->condition('field', 1, '>=');
		$result = $query->execute();
		$final = array();
		while ($record = $result->fetchAssoc()) {
			$final[$record['name']] = $record;
		}
		return $final;
	}

	private function createRows ($list, $oldList) {
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
				'<input class="mini" type="checkbox" name="'.$l.'-mini" value="1" '.$mini.' />',  
				'<input class="full" type="checkbox" name="'.$l.'-full" value="1" '.$full.' />',  
				'<input class="first" type="radio" name="first" value="'.$l.'" '.$first.' />',  
				'<input class="last" type="radio" name="last" value="'.$l.'" '.$last.' />',
				);
			array_push($rows, $row);
		}
		return $rows;
	}

	private function createFieldsTable ($user, $fields, $oldUser, $oldFields) {
		$header = array(t('Field Name'), 
			t('Show in minimized table ?'), 
			t('Show in full table ?'), 
			t('Which one is the First Name field ?'), 
			t('Which one is the Last Name field ?'),
			);
		$rows = array_merge($this->createRows($user, $oldUser), $this->createRows($fields, $oldFields));
		return theme('table', array('header' => $header, 'rows' => $rows));
	}

	private function createSaveButton () {
		$button = '<input type="submit" value="'.t('Save').'" class="form-submit" />';
		return $button;
	}

	private function emptyOldValues () {
		$query = db_delete('visualscience_search_config');
		$query->execute();
	}

	private function insertIntoSearchConfig ($name, $mini, $full, $first, $last, $field = 0) {
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

	private function saveUserFields () {
		$userFields = $this->getUserFields();
		foreach ($userFields as $field) {
			if (isset($_POST['first']) && $_POST['first'] == $field) {
				$this->insertIntoSearchConfig($field, 1, 1, 1, 0, 0);
			}
			else if (isset($_POST['last']) && $_POST['last'] == $field) {
				$this->insertIntoSearchConfig($field, 1, 1, 0, 1, 0);
			}
			else if (isset($_POST[$field.'-mini']) && intval($_POST[$field.'-mini']) == 1) {
				$this->insertIntoSearchConfig($field, 1, 1, 0, 0, 0);
			}
			else if (isset($_POST[$field.'-full']) && intval($_POST[$field.'-full']) == 1){
				$this->insertIntoSearchConfig($field, 0, 1, 0, 0, 0);
			}
		}
	}

	private function savedCreatedFields () {
		$createdFields = $this->getCreatedFields();
		foreach ($createdFields as $field) {
			if (isset($_POST['first']) && $_POST['first'] == $field) {
				$this->insertIntoSearchConfig($field, 1, 1, 1, 0, 1);
			}
			else if (isset($_POST['last']) && $_POST['last'] == $field) {
				$this->insertIntoSearchConfig($field, 1, 1, 0, 1, 1);
			}
			else if (isset($_POST[$field.'-mini']) && intval($_POST[$field.'-mini']) == 1) {
				$this->insertIntoSearchConfig($field, 1, 1, 0, 0, 1);
			}
			else if (isset($_POST[$field.'-full']) && intval($_POST[$field.'-full']) == 1){
				$this->insertIntoSearchConfig($field, 0, 1, 0, 0, 1);
			}
		}
	}

	public function getHtmlConfigPage () {
		$userFields = $this->getUserFields();
		$otherFields = $this->getCreatedFields();
		$oldUserFields = $this->getOldUserFields();
		$oldOtherFields = $this->getOldCreatedFields();
		$intro = $this->getIntroduction();
		$fieldsTable = $this->createFieldsTable($userFields, $otherFields, $oldUserFields, $oldOtherFields);
		$saveButton = $this->createSaveButton();
		$formStart = '<form action="" method="POST" id="visualscience_config_form" >';
		$formEnd = '<input type="hidden" name="visualscience_config_form" /></form>';
		return $formStart.$intro.$fieldsTable.$saveButton.$formEnd;
	}

	public function saveSentValues () {
		$this->emptyOldValues();
		$this->saveUserFields();
		$this->savedCreatedFields();
	}
}