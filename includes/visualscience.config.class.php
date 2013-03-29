<?php 
class Config {

	private function getIntroduction () {
		return t('Here you will be able to choose which fields you want to show when the user opens the VisualScience module. Note that every field that is in the minimized table will also be in the full one. And the last name and full name are required in the mini table.');

	}

	private function getUserFields () {
		return array(t('Id'), t('Name'), t('Email'), t('Signature'), t('CreationDate'), t('LastAccess'), t('Status'), t('Language'), t('Role'));
	}

	private function getCreatedFields () {
		$dbQuery = db_select('field_config', 'f');
		$dbQuery->fields('f', array('id', 'field_name'));
		$fields = $dbQuery->execute()->fetchAllKeyed();
		return $fields;
	}

	private function createRows ($list) {
		$rows = array();
		foreach ($list as $l) {
			$row = array(
				$l,
				'<input type="checkbox" name="'.$l.'-mini" value="1" />',  
				'<input type="checkbox" name="'.$l.'-full" value="1" />',  
				'<input type="radio" name="first" value="'.$l.'" />',  
				'<input type="radio" name="last" value="'.$l.'" />',
				);
			array_push($rows, $row);
		}
		return $rows;
	}

	private function createFieldsTable ($user, $fields) {
		$header = array(t('Field Name'), 
			t('Show in minimized table ?'), 
			t('Show in full table ?'), 
			t('Which one is the First Name field ?'), 
			t('Which one is the Last Name field ?'),
			);
		$rows = array_merge($this->createRows($user), $this->createRows($fields));
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
		$table = 'visualscience_search_config';
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

	}

	public function getHtmlConfigPage () {
		$userFields = $this->getUserFields();
		$otherFields = $this->getCreatedFields();
		$intro = $this->getIntroduction();
		$fieldsTable = $this->createFieldsTable($userFields, $otherFields);
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