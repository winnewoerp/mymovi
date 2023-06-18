<?php 
/*
Plugin Name: MyMoVi - My Mobility Vision
Plugin URI: https://perimobil.linieplus.de
Description: A tool for participatory mobility vision creation.
Version: 0.1
Requires at least: 6.1.1
Requires PHP: 8.0
Author: Linie Plus, Stadtkreation, and Perimobil project team
Author URI: https://perimobil.linieplus.de/about/
Textdomain: mymovi
Domain Path: /languages
License: GNU General Public License 3
License URI: https://www.gnu.org/licenses/gpl-3.0.en.html

	MyMoVi is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 2 of the License, or
	any later version.

	MyMoVi is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with MyMoVi. If not, see https://www.gnu.org/licenses/gpl-3.0.en.html.

*/

if ( !is_admin() ) {
    // we are not in admin mode
    require_once __DIR__ . '/public/class-mymovi-public.php';
}

if ( is_admin() ) {
    // we are in admin mode
    require_once __DIR__ . '/admin/class-mymovi-admin.php';
}

function mymovi_test($content) {
	$content .= wpautop('
	<h2>MyMoVi <br>My Mobility Vision plugin test section</h2> 
	<strong>TEST: Yes, MyMoVi plugin is working!</strong> This test output appears below all page and post contents. Start drawing (with routes calculated between points).
	<select class="form-select" id="select-geometry-type" name="geometry-type">
	<option value="Point">Point</option>
	<option value="LineString">LineString</option>
	<option value="Polygon">Polygon</option>
	<option value="Circle">Circle</option>
	<option value="None">None</option>
  </select>
  <input class="form-control" type="button" value="Remove last point (only for LineString and Polygon)" id="undo">
  	<p>Street distance: <span id="street-distance">0</span></p>
	<div id="ifl-map"></div>  
	');
	return $content;
}
add_filter('the_content', 'mymovi_test');

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-mymovi.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    0.1
 */
function mymovi_run() {

	$plugin = new MyMoVi();
	$plugin->run();

}
mymovi_run();