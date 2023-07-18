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

function mymovi_posttype_init() {
	$mymovi_posttypes = array(
		array(
			'name' => 'mmv-survey-entry',
			'slug' => 'survey-entry',
			'singular' => __('Survey entry','mymovi'),
			'plural' => __('Survey entries','mymovi')
		),
	);
	foreach($mymovi_posttypes as $mymovi_posttype) {
		$menu_name = (isset($mymovi_posttype['menu']) ? $mymovi_posttype['menu'] : $mymovi_posttype['plural']);
		$labels = array(
			'name'               => _x( $mymovi_posttype['plural'], 'post type general name', 'mymovi' ),
			'singular_name'      => _x( $mymovi_posttype['singular'], 'post type singular name', 'mymovi' ),
			'menu_name'          => _x( $menu_name, 'admin menu', 'mymovi' ),
			'name_admin_bar'     => _x( $mymovi_posttype['singular'], 'add new on admin bar', 'mymovi' ),
			'add_new'            => _x( 'Add New', 'mymoviproposal', 'mymovi' ),
			'add_new_item'       => sprintf(__( 'Add New %s', 'mymovi' ),$mymovi_posttype['singular']),
			'new_item'           => sprintf(__( 'New %s', 'mymovi' ),$mymovi_posttype['singular']),
			'edit_item'          => sprintf(__( 'Edit %s', 'mymovi' ),$mymovi_posttype['singular']),
			'view_item'          => sprintf(__( 'View %s', 'mymovi' ),$mymovi_posttype['singular']),
			'all_items'          => sprintf(__( 'All %s', 'mymovi' ),$mymovi_posttype['plural']),
			'search_items'       => sprintf(__( 'Search %s', 'mymovi' ),$mymovi_posttype['plural']),
			'parent_item_colon'  => sprintf(__( 'Parent %s:', 'mymovi' ),$mymovi_posttype['plural']),
			'not_found'          => sprintf(__( 'No %s found.', 'mymovi' ),$mymovi_posttype['plural']),
			'not_found_in_trash' => sprintf(__( 'No %s found in Trash.', 'mymovi' ),$mymovi_posttype['plural'])
		);

		$args = array(
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'show_in_rest'		 => true,
			'query_var'          => true,
			'rewrite'            => array( 'slug' => $mymovi_posttype['slug'] ),
			'capability_type'    => 'post',
			'has_archive'        => true,
			'hierarchical'       => false,
			'menu_position'      => 5,
			'taxonomies' => array('category','post_tag'),
			'supports'           => array( 'title', 'editor', 'author', 'thumbnail', 'excerpt', 'comments', 'custom-fields', 'revisions'  )
		);

		register_post_type( $mymovi_posttype['name'], $args );
		add_post_type_support( $mymovi_posttype['name'],  array( 'title', 'editor', 'author', 'thumbnail', 'excerpt', 'comments', 'custom-fields', 'revisions' ) );
	}
}
add_action( 'init', 'mymovi_posttype_init' );

function mymovi_test_shortcode($content) {
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
	<div class="mymovi-map" id="ifl-map"></div>
	<script> addMap("ifl-map"); </script>
	');
	return $content;
}
add_shortcode('mymovi-test', 'mymovi_test_shortcode');

function mymovi_form_shortcode($atts, $content) {
	$output = '';
	
	$form_pages = explode('[mymovi-form-pagebreak]', $content);
	
	$err = false;
	
	if(isset($_POST['mymovi-submit']) && $_POST['mymovi-submit']) {
		$output .= '
		<div class="mymovi-message success">
			<p>' . esc_html__('You have successfully submitted your data.', 'mymovi') . '</p>
		</div>';
		$output .= '<p>The following fields will be saved:</p><p>';
		foreach($_POST as $key => $value) {
			if(str_starts_with($key, 'mmv-field')) {
				$output .= $key . ': ' . $value;
			}
		}
		$output .= '</p>';
		
		$post = array(
			'post_title'	=> esc_html__('Entry','mymovi') . ' ' . current_datetime()->format('Y-m-d H:i:s'),
			'post_status'	=> 'draft',
			'post_type'	=> 'mmv-survey-entry'
		);
		
		$postid = wp_insert_post($post);
		
		foreach($_POST as $key => $value) {
			if(str_starts_with($key, 'mmv-field')) {
				add_post_meta($postid,$key,$value);
			}
		}
	}
	else {
		$output .= '
		<div class="wp-block-group has-global-padding">
			<form class="mymovi-form" method="post" action="">
				<div class="mymovi-form-pages-wrapper">
					<div class="mymovi-form-page page-1">
				';
		$index = 1;
		foreach($form_pages as $form_page) {
			$output .= do_shortcode($form_page);
			
			// submit button for last page
			if($index == sizeof($form_pages)) {
				$output .= '
						<div class="mymovi-form-submit wp-block-buttons">
							<div class="wp-block-button">
								<input class="wp-block-button__link wp-element-button" type="submit" name="mymovi-submit" value="'. esc_html__('Submit data', 'mymovi') . '">
							</div>
						</div>';
			}
				
			$output .= '<div class="mymovi-nav-wrapper">
							<div class="mymovi-nav prev wp-block-buttons">';
			
			// previous page button
			if($index > 1) {
				$output .= '
								<div class="wp-block-button"><a class="wp-block-button__link wp-element-button mymovi-button" data-showpage="page-' . ($index - 1) . '" href="#">' . esc_html__('Prev', 'mymovi'). '</a></div>';
			}
			
			$output .= '
							</div>
							<div class="mymovi-nav next wp-block-buttons">';
						
			// next page button
			if($index < sizeof($form_pages)) {
				$output .= '
								<div class="wp-block-button"><a class="wp-block-button__link wp-element-button mymovi-button" data-showpage="page-' . ($index + 1) . '" href="#">' . esc_html__('Next', 'mymovi'). '</a></div>';
			}
			
			// close nav wrapper
			$output .= '
							</div>
						</div>';
			
			// current page indicator
			$output .= '
						<div class="mymovi-form-page-counter">
							<p>' . sprintf(esc_html__('Page %1$s of %2$s','mymovi'), $index, sizeof($form_pages)) . '</p>
						</div>';
			
			// close/open next page
			if($index < sizeof($form_pages)) {
				$output .= '
					</div>
					<div class="mymovi-form-page page-' . ($index + 1) . '">';
			}
			$index++;
		}
		$output .= '
					</div>
				</div>
			 </form>
		</div>';
	}
	
	return $output;
}
add_shortcode('mymovi-form', 'mymovi_form_shortcode');

function mymovi_form_field_shortcode($atts, $content) {
	$output = '';
	
	/*$a = shortcode_atts( 
		array(
			'type' => 'text',
			'name' => '',
		), 
		$atts
	);*/
	
	$type = 'text';
	$label = '';
	
	if(is_array($atts) && $atts) {
		if(isset($atts[0]) && $atts[0]) $type = $atts[0];
		if(isset($atts[1]) && $atts[1]) $name = $atts[1];
		if(isset($atts[2]) && $atts[2]) $label = $atts[2];
		
	}	
	
	$label_output = array(
		'<label>' . $label,
		'</label>'
	);
	
	switch($type) {
		case 'text':
			$output .= '
			<div class="mymovi-form-field input-field type-text">
				' . $label_output[0] . '<br>
					<input type="text" name="mmv-field-' . $name . '">
				' . $label_output[1] . '
			</div>';
			break;
		case 'map':
			$output .= '
			<select class="form-select" id="select-geometry-type" name="geometry-type">
				<option value="Point">Point</option>
				<option value="LineString">LineString</option>
				<option value="Polygon">Polygon</option>
				<option value="Circle">Circle</option>
				<option value="None">None</option>
  			</select>
 			<input class="form-control" type="button" value="Remove last point (only for LineString and Polygon)" id="undo">
			<div class="mymovi-form-field mymovi-map map-field type-map" id="' . $name . '"></div>
			<button id="show-geojson">GeoJSON anzeigen</button>
			<script> addMap("' . $name . '", true); </script>';

			break;
	}
	return $output;
}
add_shortcode('mymovi-form-field','mymovi_form_field_shortcode');
add_shortcode('mymovi-form-field*','mymovi_form_field_shortcode');


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

add_filter( 'acf/settings/remove_wp_meta_box', '__return_false' );