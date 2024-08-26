# MyMoVi - My Mobility Vision public transportation participation plugin for WordPress
This plugin has been developed within PeriMobil research project of [IfL - Leibniz Institut für Länderkunde](https://leibniz-ifl.de/) (Leipzig, Germany) in 2023/2024.

This is an intermediate state, several additions will follow during the last phase of the project.

## Usage

To use this plugin in your own WordPress installation, download it as a .zip file and install it using the "Upload Plugin" functionality.

When the plugin is installed no further configuration is needed, and the blocks/shortcodes can be used in any desired place.

### The Form

Use **[mymovi-form]** and **[/mymovi-form]** in shortcode blocks to open and close the form respectively.
The supported attributes (that can be set as key="value" pairs in the opening tag) are:
- **stop-at-page**: *(integer)* How many pages to show to the user. Can be used to make changes to the form in private while the form is already public. Default is no limit.
- **stop-at-page-text**: *(text)* Which text to show the user when the page limit has been reached. Default is "Next pages not yet activated".
- **fgcolor**: *(CSS color)* The foreground color of the form.
- **bgcolor**: *(CSS color)* The background color of the form.

#### Pages

To break up the form into several pages, use the self-closing **[mymovi-form-pagebreak]** shortcode.

### The map

To add the map, use the **[mymovi-the-map]** shortcode. Only one map can be shown per WordPress page! The map can either be used as a self-closing tag, 
or it can be used with a closing **[/mymovi-the-map]** tag. In the latter case, the content between opening and closing tag will be displayed as an overlay over the map, that can be opened and closed by the user.
The supported attributes are:
- **geometry-text-field**: *(text)* Which text to show when a user inputs data for a map feature. Default is "Description".
- **features**: *(geojson)* Which features to show in the map. Default is no features.
- **map-center-lon**: *(floating-point number)* On which longtitude to center the map on initially. Default is 12.47245.
- **map-center-lat**: *(floating-point number)* On which latitude to center the map on initially. Default is 51.34671.
- **map-default-zoom**: *(integer)* Which OSM zoom level to use for the map initially. Default is 12.
- **name**: *(text)* Any unique text to identify the map. Default is "".
- **fgcolor**: *(CSS color)* The foreground color of the map.
- **bgcolor**: *(CSS color)* The background color of the map.

#### Map with fixed position

To have a fixed map layout with scrollable text section, e.g. with the map on the left hand side and the text on the right hand side, create a two-column section with 50%/50% column widths. Put the **[mymovi-the-map]** shortcode in the left column and the scrollable questionnaire into the right column (using **[mymovi-form]** shortcode, see above) and **"Mymovi Form Input"** Gutenberg blocks or **[mymovi-form-field]** shortcodes (see below). You will then have to add some lines of CSS (not part of the plugin so far), in order to achieve the desired behavior.

In our example usecase, we used the following CSS (with **the-map** automatically set as ID for the map element by the plugin): 

```
.wp-block-columns #the-map {
	top: 0;
	left: 0;
	width: 100%;
	height: calc(100vh - 80px);
	position: absolute;
}
```

### Input fields

To add form inputs, there are two options present: the more modern Gutenberg-Blocks (that show you how the form will look in the editor) and the older shortcodes. The "map" input is only supported once per page and as a shortcode, for everything else it is recommended to use the Gutenberg-Blocks.

#### Using Gutenberg-Blocks (recommended)

To add a form input as a Gutenberg Block, just add the **"Mymovi Form Input"** block. The Gutenberg editor will show you all the options you can choose from on the side. For more details about individual attributes, refer to the explanation in the shortcode section below.

#### Using shortcodes

To add a form input as a shortcode, use the self-closing **[mymovi-form-field]** shortcode. To make the field required use the **[mymovi-form-field*]** shortcode. The possible attributes are:
- **type**: *(one of: text, textarea, number, range, select, checkbox, radio, map)* Which type of input to show the user. Depending on which type is chosen, different further attributes can be set. This attribute can also be set as the first keyless attribute. Default is "text".
- **name**: *(text)* Any unique text to identify the input. Default is "".
- **geometry-text-field**: *(text)* Which text to show when a user inputs data for feature for this map input. Default is "Description".
- **geometries**: *(comma-separated list of: Point, LineString, Circle, Polygon, None)* Which features to allow drawing for this map input. Default is all specified options.
- **features**: *(geojson)* Which features to show for this map input. Default is no features.
- **color**: *(CSS color)* The color of the drawn features for this map input. Default is rgb(230, 19, 126).
- **icon**: *(URL)* The icon to show at the place this map input is at. Default is [draw-in-map.png](images/draw-in-map.png).
- **icon-text**: *(text)* The text to show for the icon. Default is "Map input".
- **single-layer**: *(boolean)* Whether to show only features inputted for this map input or for all inputs. Defaults to showing all (false).
- **options**: *("||"-separated unique option list)* A list of internal option names for this checkbox, radio, select or range input. For the range input, these need to be integers. In the Gutenberg-Block this list is comma-separated. Defaults to none.
- **option_texts**: *("||"-seperated option list)* A list of public option names, behaves like **options**. Defaults to the internal name of the option.
- **minlength**: *(integer|"")* The minimum length of characters to input into this text or textarea input field. Defaults to unlimited ("").
- **maxlength**: *(integer|"")* The maximum length of characters to input into this text or textarea input field. Defaults to unlimited ("").
- **min**: *(integer|"")* The minimum input for this number or range input field. Defaults to unlimited ("").
- **max**: *(integer|"")* The maximum input for this number or range input field. Defaults to unlimited ("").
- **step**: *(integer|"")* The step size for this range input field. Defauls to "" which means 1.

### Conditionally showing input fields

It is supported to only show certain input fields ("subfields") when another "parent" input field has one of a list of values set.

On the subfield the **show_on** *("||"-separated list of values)* attribute has to be set. The subfield will be hidden unless one of the specified values matches the parent's value.

- When using a shortcode, the parent field has to use the **[mymovi-form-field-subfields]** / **[mymovi-form-field-subfields*]** shortcodes, and all subfields have to be contained betweeen this and the closing tag. This shortcode only supports the "select", "checkbox" and "radio" types and their respective attributes excluding the **show_on** one, and is the same as **[mymovi-form-field]** otherwise.
- When using Gutenberg Blocks, each field has a place to input more blocks, where all subfields need to be placed. This method allows nested subfields and subfields for every field type, though only the ones supported on the shortcode are guaranteed to work correctly.
