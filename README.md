# VisualScience

A module providing an easy-to-use intuitive search interface for your Drupal Database. With just a single search box you can get the targeted list of entities (users or nodes) within seconds. **No configuration needed!**

Features include:
+	Powerful search-engine with SQl-like functionnalities
+	LivingScience Search integration
+	Messages and Conferences 
+	Exporting users as CSV files
+	Comparison of multiple LivingScience searches
+	Ergonomic tab-based interface
+	Advanced administration page
+	Patterns Compatible


##Tweaks and Hacks
Here's a list of some "tweaks and hacks" we had to use, to make things work better, generally because the original ones were having performance issues.

 * ** jQuery UI Theme Replacement: ** The file SITE/misc/ui/jquery.ui.theme.css was making the page's checkboxes slow. Therefore we replace it with our own flavoured one. (VisualScience/css/visualscience.jquery.ui.theme.css)
