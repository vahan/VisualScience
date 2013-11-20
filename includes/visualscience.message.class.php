<?php
/**
 * @file(visualscience.message.class.php)
 * The class that manages the backend to send a mail through the Drupal instance.
 */
class Message {
  /**
   * Allows the sending of a mail through this Drupal instance
   * @return print 1 if everything went fine, else 0
   */
  public function visualscience_send_message() {
    $subject =  check_plain($_POST['subject']);
    $email = check_plain($_POST['recipients']['email']);
    $name =  check_plain($_POST['recipients']['name']);
    $message =  check_plain($_POST['message']);
    $attachments =  $this->sanitizeArray($_POST['attachments']);// [0][0] will give the name of object n°0, while [0][1] will give its URL
    if ($attachments[0]) {
      $attachmentsText = t('<br /><h3>Attached Files</h3>');
      foreach ($attachments as $entry) {
        $attachmentsText .= t('- <a href="' . $entry[1] . '" _target="blank">' . $entry[0] . '</a><br />');
      }
    }
    else {
      $attachmentsText = '';
    }
    $final_text = $message . check_plain($attachmentsText);


    global $user;
    $module = 'VisualScience';
    $key = uniqid('mail');
    $language = language_default();
    $params = array();
    $from = $user->mail;
    $send = FALSE;
    $message = drupal_mail($module, $key, $email, $language, $params, $from, $send);

    $message['headers']['Content-Type'] = 'text/html; charset=UTF-8; format=flowed';
    $message['headers']['From'] = $message['headers']['Sender'] = $message['headers']['Return-Path'] = $from;
    $message['subject'] = $subject;
    $message['body'] = $final_text;

    // Retrieve the responsible implementation for this message.
    $system = drupal_mail_system($module, $key);

    // Send e-mail.
    $message['result'] = $system->mail($message);
  //If no errors, let's add file access to the user.
    if ($message['result'] == 1) {
    //getting user id from email.
      $users = db_query_range('SELECT uid FROM {users} WHERE mail = :mail', 0, 1, array(':mail' => $email, ));
    //In the "impossible" case where two emails are the same in the db
      $users = $users->fetchObject();
      $uid = $users->uid;
    //actually adding the access to the user.
      if (!is_null($uid) && isset($uid)) {
        foreach ($attachments as $file) {
          $query = db_insert('visualscience_uploaded_files')->fields(array(
            'uid' => $uid,
            'email' => $from,
            'name' => $file[0],
            'url' => $file[1],
            ));
          $query->execute();
        }
      }
      echo '1';
    }
    else {
      echo '0';
    }
  }

  /**
   * Sanitzes the content of an array recursively
   * @param  array $unSafeArray the array to sanitize.
   * @return array              the array sanitized
   */
  private function sanitizeArray($unSafeArray) {
    $safeArray = array();
    foreach ($unSafeArray as $entry) {
      if (gettype($entry) == 'array') {
        array_push($safeArray, $this->sanitizeArray($entry));
      }
      else {
        array_push($safeArray, check_plain($entry));
      }
    }
    return $safeArray;
  }
}