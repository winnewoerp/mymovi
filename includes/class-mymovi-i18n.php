<?php

/**
 * Define the internationalization functionality
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @link       https://perimobil.linieplus.de
 * @since      0.1
 *
 * @package    MyMoVi
 * @subpackage MyMoVi/includes
 */

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      0.1
 * @package    MyMoVi
 * @subpackage MyMoVi/includes
 * @author     Stadtkreation <wp@stadtkreation.de>
 */
class MyMoVi_i18n {


	/**
	 * Load the plugin text domain for translation.
	 *
	 * @since    0.1
	 */
	public function load_plugin_textdomain() {

		load_plugin_textdomain(
			'mymovi',
			false,
			dirname( dirname( plugin_basename( __FILE__ ) ) ) . '/languages/'
		);

	}



}