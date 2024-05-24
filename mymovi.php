<?php 
/*
Plugin Name: MyMoVi - My Mobility Vision
Plugin URI: https://perimobil.linieplus.de
Description: A tool for participatory mobility vision creation.
Version: 0.3
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
			'name' => 'mymovi-survey-entry',
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
			'taxonomies' 		 => array('category','post_tag'),
			'supports'           => array( 'title', 'editor', 'author', 'thumbnail', 'excerpt', 'comments', 'custom-fields', 'revisions'  )
		);

		register_post_type( $mymovi_posttype['name'], $args );
	}
}
add_action( 'init', 'mymovi_posttype_init' );

function mymovi_form_shortcode($atts, $content) {
	$output = '';
	
	$a = shortcode_atts( 
		array(
			'stop-at-page' => 9999,
			'stop-at-page-text' => esc_html__('Next pages not yet activated','mymovi'),
		), 
		$atts
	);
		
	$form_pages = explode('[mymovi-form-pagebreak]', $content);
	
	$err = false;
	
	if(isset($_POST['mymovi-submit']) && $_POST['mymovi-submit']) {
		$output .= '
		<div class="mymovi-message success">
			<p>' . esc_html__('You have successfully submitted your data.', 'mymovi') . '</p>
		</div>';
		
		$post = array(
			'post_title'	=> esc_html__('Entry','mymovi') . ' ' . current_datetime()->format('Y-m-d H:i:s'),
			'post_status'	=> 'draft',
			'post_type'	=> 'mymovi-survey-entry'
		);
		
		$postid = wp_insert_post($post);
		
		// add custom field with title of current survey
		add_post_meta($postid,'mymovi-field-survey-name',get_the_title());
		
		// add all custom meta from survey form
		foreach($_POST as $key => $value) {
			if(str_starts_with($key, 'mymovi-field')) {
				if(is_array($value)) $value = implode('||', $value);
				add_post_meta($postid,$key,$value);
			}
		}
	}
	else {
		$output .= '
		<div class="wp-block-group has-global-padding">
			<form class="mymovi-form" method="post" action="">
				<div class="mymovi-form-pages-wrapper">
					<div id="page-1" class="mymovi-form-page page-1">
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
				if($index < $a['stop-at-page']) {
					$output .= '
								<div class="wp-block-button"><a class="wp-block-button__link wp-element-button mymovi-button" data-showpage="page-' . ($index + 1) . '" href="#">' . esc_html__('Next', 'mymovi'). '</a></div>';
				} else {
					$output .= '
								<p>' . $a['stop-at-page-text'] . '</p>';
				}
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
					<div id="page-' . ($index + 1) . '" class="mymovi-form-page page-' . ($index + 1) . '">';
			}
			
			if($index == $a['stop-at-page']) break;
			
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

function mymovi_form_field_shortcode($atts, $content, $tag) {
	$output = '';
	
	$a = shortcode_atts( 
		array(
			'type' => 'text',
			'geometry-text-field' => esc_html__('Description','mymovi'),
			'geometries' => 'Point,LineString,Circle,Polygon,None',
			'map-center-lon' => 12.47245,
			'map-center-lat' => 51.34671,
			'map-default-zoom' => 12,
			'name' => '',
			'options' => '',
			'option_texts' => '',
			'minlength' => '',
			'maxlength' => '',
			'min' => '',
			'max' => '',
			'color' => 'rgb(230, 19, 126)',
			'icon' => '',
			'pagenum' => '1',
			'single-layer' => 'false',
		),
		$atts
	);
	
	$required = '';
	if(str_contains($tag, '*')) $required = ' required';
	
	$options = explode('||', $a['options']);
	$option_texts = explode('||', $a['option_texts']);
	
	$geometries = explode(',', $a['geometries']);
	
	$geometry_labels = array(
		'Point' => esc_html__('Location', 'mymovi'),
		'LineString' => esc_html__('Route', 'mymovi'),
		'Circle' => esc_html__('Radius', 'mymovi'),
		'Polygon' => esc_html__('Area', 'mymovi'),
		'None' => esc_html__('None', 'mymovi')
	);
	
	$type = 'text';
	$label = '';
	
	if(is_array($atts) && $atts) {
		if(isset($atts[0]) && $atts[0]) $type = $atts[0];
		if(isset($atts[1]) && $atts[1]) $name = $atts[1];
		if(isset($atts[2]) && $atts[2]) $label = $atts[2];
		
	}	
	
	switch($type) {
		case 'text':
			$output .= '
			<div class="mymovi-form-field input-field type-text">
				<label>' . $label . '<br>
					<input type="text" name="mymovi-field-' . $name . '" minlength="' . $a['minlength'] . '" maxlength="' . $a['minlength'] . '"' . $required . '>
				</label>
			</div>';
			break;
			
		case 'textarea':
			$output .= '
			<div class="mymovi-form-field input-field type-textarea">
				<label>' . $label . '<br>
					<textarea name="mymovi-field-' . $name . '" minlength="' . $a['minlength'] . '" maxlength="' . $a['minlength'] . '"' . $required . '></textarea>
				</label>
			</div>';
			break;
			
		case 'number':
			$output .= '
			<div class="mymovi-form-field input-field type-number">
				<label>' . $label . '<br>
					<input type="number" name="mymovi-field-' . $name . '" min="' . $a['min'] . '" max="' . $a['min'] . '"' . $required . '>
				</label>
			</div>';
			break;
		case 'select':
			$output .= '
			<div class="class="mymovi-form-field input-field type-select">
				<label>' . $label . '<br>
					<select name="mymovi-field-' . $name . '"' . $required . '>
						<option value="">' . esc_html__('Please select','mymovi') . '</option>';
			$count = 0;
			foreach($options as $option) {
				$output .= '
					    <option value="' . $option . '"> ' . (isset($option_texts[$count]) && $option_texts[$count] ? $option_texts[$count] : $option) . '</option>';
				$count++;
			}
			$output .= '
					</select>
				</label>
			</div>';
			break;
			
		case 'checkbox':
			$output .= '
			<p class="mymovi-form-field-wrapper type-checkbox">';
			if(sizeof($options) == 1) {
				$output .= '
				<label>
					<input type="checkbox" name="mymovi-field-' . $name . '[]"' . $required . '> ' . $label . '
				</label>';
			} else {
				$output .= '		
				<strong>' . $label . '</strong><br>';
				$count = 0;
				foreach($options as $option) {
					$output .= '
				<label>
					<input type="checkbox" name="mymovi-field-' . $name . '[]"' . $required . ' value="' . $option . '"> ' . (isset($option_texts[$count]) && $option_texts[$count] ? $option_texts[$count] : $option) . '<br>
				</label>';
					$count++;
				}
			}
			$output .= '
			</p>';
			break;
		
		case 'radio':
			$output .= '
			<p class="mymovi-form-field-wrapper type-radio">
				<strong>' . $label . '</strong><br>';
			$count = 0;
			foreach($options as $option) {
				$output .= '
				<label>
					<input type="radio" name="mymovi-field-' . $name . '"' . $required . ' value="' . $option . '"> ' . (isset($option_texts[$count]) && $option_texts[$count] ? $option_texts[$count] : $option) . '<br>
				</label>';
				$count++;
			}
			$output .= '
			</p>';
			break;
		
		case 'the_map':
			$output .= '
			<div class="mymovi-form-the-map-wrapper">';
			
			$output .= '
				<input class="form-control edit-button" type="button" value="✐ ' . esc_html__('Edit text or delete', 'mymovi') . '" id="mymovi-button-select-' . $name .'">
				' . (in_array('LineString',$geometries) ? '<input class="form-control remove-last-point" type="button" value="⌫ ' . esc_html__('Remove last point','mymovi') . '" id="undo-' . $name  . '">' : '') .'
				<div class="mymovi-form-field mymovi-map map-field type-map" id="' . $name . '">
					<div class="properties-input">
						<p>
							<label id="geometry-text-field" for="mymovi-property-description-'. $name .'">' .$a['geometry-text-field'] . '</label>
							<textarea id="mymovi-property-description-' . $name . '" name="mymovi-property-description-' . $name . '"></textarea>
						</p>
						<p class="close-wrapper"><a href="#" class="close">' . esc_html__('Save and close','mymovi') . '</a></p>
						<p class="delete-feature-warpper"><a href="#" class="delete-feature">' . esc_html__('Delete feature','mymovi') . '</a></p>
					</div>
				</div>
				<script> addMap("' . $name . '", ' . $a['map-center-lon'] . ', ' . $a['map-center-lat'] . ', ' . $a['map-default-zoom'] . ');
				geometryText["0"] = "'. $a['geometry-text-field'] .'"; </script>
			</div>';
			break;

		case 'map':
			$output .= '
			<div class="mymovi-form-map-wrapper">';
			
			if($a['icon']) {
				$output .= '
				<div class="map-icon" style="background:' . $a['color'] . '">
					<div class="map-icon-inner">
						<img src="' . $a['icon'] . '" alt="map icon ' . $a['name'] . '">
					</div>
				</div>';
			}
			
			if (count($geometries) > 1) {
				$output .= '
					<p><select class="form-select select-drawing-tools" id="select-geometry-type-' . $a['pagenum'] . '" name="geometry-type">';
				
				foreach($geometries as $geometry) {
					$output .= '
						<option value="' . $geometry . '">' . $geometry_labels[$geometry] . '</option>';
				}
				$output .= '
					</select>';
			} else {
				$output .= '
					<input type="hidden" id="select-geometry-type-' . $a['pagenum'] . '" name="geometry-type" value="'. $geometries[0] .'">';
			}
			$output .= '
				<input type="hidden" name="mymovi-field-' . $name . '-geojson" id="' . $a['pagenum'] . '-geojson" value="{&quot;type&quot;:&quot;FeatureCollection&quot;,&quot;features&quot;:[]}"></p>
				<script type="text/javascript"> document.addEventListener("DOMContentLoaded", () => {addLayer("' . $a['pagenum'] . '", "' . $a['color'] . '");});
				singleLayer["'. $a['pagenum'] .'"] = '. $a['single-layer'] .';
				geometryText["'. $a['pagenum'] .'"] = "'. $a['geometry-text-field'] .'"; </script>
			</div>';

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