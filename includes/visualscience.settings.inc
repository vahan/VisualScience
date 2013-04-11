<?php

/*
//Seb:
The help page, and a function to define the permissions. 
TODO: Replace both of the functions.
*/
/**
 * 
 * Implements hook_help()
 * TODO: Write a user friendly help
 */
function visualscience_help($path, $arg) {
  switch ($path) {
    case 'admin/help#visualscience':
    $output = '<h1>
    <a href="#visualscience" class="anchor" name="visualscience"></a>VisualScience</h1>

    <p>A module providing an easy-to-use intuitive search interface for your Drupal Database. With just a single search box and advanced autocomplete you can get the targeted list of entities (users or nodes) within several seconds. You can also save your searches to have quick access to commonly used lists. <strong>No configuration needed!</strong></p>

    <p>Features include:</p>

    <ul>
    <li>  Search</li>
    <li>  Smart Autocomplete (query building tool)</li>
    <li>  Save/Load Searches</li>
    <li>  Multiple Visualisation Mechamisms &amp; Extendability (see <strong>UserList</strong> module)</li>
    <li>  Multiple Searches on the same page (Window-based system)</li>
    </ul><h2>Search</h2>

    <p>Use Refine Search for filtering the list according to the given criteria. The search syntax is the following:</p>

    <p><strong>FIELD_NAME_1</strong>=[<strong>TERM_11</strong> AND <strong>TERM_12</strong> OR <strong>TERM_13</strong>...] OR <strong>FIELD_NAME_2</strong>=[<strong>TERM_21</strong>] AND ...</p>

    <p><strong>FIELD_NAME</strong> corresponds either to the name of the field in the database, declared as field_<strong>FIELD_NAME</strong>, or one of the following fields of the <strong>users</strong> table: <strong>name</strong>, <strong>email</strong>, <strong>role</strong>, <strong>date</strong> (of registration). For the date a special syntax is used: date=[START_DATE, END_DATE]. If the START_DATE is skipped, i.e. date=[,END_DATE], there won&#39;t be a START_DATE used, and if END_DATE is skipped, i.e. date=[START_DATE,], as the upper limit the current date will be used. If only one date is given, i.e. date=[DATE], then it will be used as the starting date. All the PHP supported syntaxes can be used to specify a date. A calendar is provided while typing.</p>

    <p>The same FIELD_NAME can be used several times. For <strong>AND</strong> and <strong>OR</strong> also "&amp;&amp;", "&amp;" and "||", "|" can be used accordingly. The search and the logical operators are <strong>not case sensitive</strong>. </p>

    <p><strong>Example:</strong> country=[Switzerland || Armenia] &amp;&amp; role=[scientist] OR institution=[ETH Zurich]. 
    This will result in a list of scientist from Switzerland and Armenia + everybody from ETH Zurich  </p>

    <p><strong>NOT</strong> logical operation can be also used with the terms, in the following form: <strong>NOT(TERM)</strong> </p>

    <h2>Autocomplete</h2>

    <p>While typing in the search box, smart autocomplete is provided. </p>

    <ul>
    <li>  After typing FIELD_NAME=, "[" is added automatically. </li>
    <li>  The list is provided according to your database entries. </li>
    <li>  <strong>Multiple options</strong> can be selected by checking (SPACEBAR must be used) the <strong>checkboxes</strong> in front of the terms. </li>
    <li>  To confirm the selection press ENTER. The multiple selected terms are added with <strong>AND</strong> logical operator. </li>
    <li>  For the "date" a calendar is provided.</li>
    </ul><h2>Save/Load</h2>

    <p>In the Save field you can save the current search query or load a previously saved search. </p>

    <ul>
    <li>  <strong>To save</strong>: Type the name of the search in the given text field and press Save button to save the current search in the database. </li>
    <li>  <strong>To load</strong>: Just select the name of the previously saved search from the given drop-down list.</li>
    </ul><h2>UserList Module</h2>

    <p>A visualisation module for the VisualScience module. It is responsible for displaying the search results.</p>

    <p>Features include but are not limited to:</p>

    <ul>
    <li>  Display of the search results in an interactive table</li>
    <li>  Customisation of the displayed fields/columns (ajax)</li>
    <li>  Possibility to export the results as a csv file</li>
    <li>  If searched for users, possibility of group emails</li>
    <li>  Extendable to add other visualisation mechanism and functions</li>
    <li>  If <strong>OpenTok</strong> module installed, possibility to invite the selected users (from your search results) to a conference</li>
    <li>  If <strong>Living Science</strong> modile installed, quick search for the publications by selected users through livingscience possible</li>
    </ul>

    <h2>Living Science Module</h2>

    <p>Adds livingscience visualisation functionality to the userlist module. By selecting a user (or several users) The administratior can visualize their publication data on the livingscience map, and also as a livingscience list.<br />';
    return t($output
      ,
      array('!admin' => l('admin/settings/userlist', 'admin/settings/userlist'), '!block' => l('admin/structure/block', 'admin/structure/block'), '!access' => l('admin/people/permissions', 'admin/people/permissions'), '!visualscience' => l('userlist', 'userlist'))
      );
  }
}

/**
 * Implementes hook_permission()
 * 
 */
function visualscience_permission() {
  return array(
  	'access visualscience' => array('title' => t('Access VisualScience page')), 
  	'administer visualscience' => array('title' => t('Administer VisualScience settings')),
    );
}