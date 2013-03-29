<?php 
class Config {

	private function getIntroduction () {
		return t('Here you will be able to choose which fields you want to show when the user opens the VisualScience module.');

	}

	private function getUserFields () {
		return array(t('Id'), t('Name'), t('Email'), t('Signature'), t('Creation Date'), t('Last Access'), t('Status'), t('Language'), t('Role'));
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
				'<input type="checkbox" name="'.$l.'-mini" />',  
				'<input type="checkbox" name="'.$l.'-full" />',  
				'<input type="radio" name="first" value="'.$l.'-first" />',  
				'<input type="radio" name="last" value="'.$l.'-last" />',
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
}