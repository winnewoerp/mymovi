/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { InspectorControls, useBlockProps, InnerBlocks } from '@wordpress/block-editor';

import { PanelBody, TextControl, ToggleControl, CustomSelectControl } from '@wordpress/components';

import { showSubfields } from './view.js';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit({ attributes, setAttributes }) {
	const { type, name, label, options, option_texts, minlength, maxlength, min, max, step, required, show_on } = {
		type: {
			key: "text",
			name: __("Text", 'mymovi'),
		},
		name: "",
		label: "",
		options: [], option_texts: [],
		minlength: 0, maxlength: 0,
		min: 0, max: 0, step: 0,
		required: false,
		show_on: "",
		...attributes // Override previous defaults if contained in the given attributes
	};

	const types = [
		{
			key: "text",
			name: __("Text", 'mymovi'),
		},
		{
			key: "textarea",
			name: __("Textarea", 'mymovi'),
		},
		{
			key: "number",
			name: __("Number", 'mymovi'),
		},
		{
			key: "range",
			name: __("Slider", 'mymovi'),
		},
		{
			key: "select",
			name: __("Selection", 'mymovi'),
		},
		{
			key: "checkbox",
			name: __("Checkboxes", 'mymovi'),
		},
		{
			key: "radio",
			name: __("Radio buttons", 'mymovi'),
		},
	];

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Form Field Settings', 'mymovi')}>
					<CustomSelectControl
						label={__('Field type', 'mymovi')}
						options={types}
						value={type}
						onChange={(value) =>
							setAttributes({ type: value.selectedItem })
						}
					/>
					<TextControl
						label={__('Internal Name (Unique)', 'mymovi')}
						value={name}
						onChange={(value) =>
							setAttributes({ name: value })
						}
					/>
					<TextControl
						label={__('Label', 'mymovi')}
						value={label}
						onChange={(value) =>
							setAttributes({ label: value })
						}
					/>
					{["range", "select", "checkbox", "radio"].includes(type.key) && (
						<>
							<TextControl
								label={__('Options (internal names)', 'mymovi')}
								value={options}
								onChange={(value) =>
									setAttributes({ options: value.split(',').map((value) => value.trim()) })
								}
							/>
							<TextControl
								label={__('Option names', 'mymovi')}
								value={option_texts}
								onChange={(value) =>
									setAttributes({ option_texts: value ? value.split(',').map((value) => value.trim()) : [] })
								}
							/>
						</>
					)}
					{["text", "textarea"].includes(type.key) && (
						<>
							<TextControl
								label={__('Minimum Length', 'mymovi')}
								value={minlength}
								onChange={(value) =>
									setAttributes({ minlength: parseInt(value) })
								}
							/>
							<TextControl
								label={__('Maxmium Length', 'mymovi')}
								value={maxlength}
								onChange={(value) =>
									setAttributes({ maxlength: parseInt(value) })
								}
							/>
						</>
					)}
					{["number", "range"].includes(type.key) && (
						<>
							<TextControl
								label={__('Minimum Input', 'mymovi')}
								value={min}
								onChange={(value) =>
									setAttributes({ min: parseInt(value) })
								}
							/>
							<TextControl
								label={__('Maximum Input', 'mymovi')}
								value={max}
								onChange={(value) =>
									setAttributes({ max: parseInt(value) })
								}
							/>
							<TextControl
								label={__('Step Size', 'mymovi')}
								value={step}
								onChange={(value) =>
									setAttributes({ step: parseInt(value) })
								}
							/>
						</>
					)}
					{["text", "textarea", "number", "select", "radio", "checkbox"].includes(type.key) && (
						<>
							<ToggleControl
								label={__('Required', 'mymovi') + (type.key == "checkbox" ? ' ' + __('(requires all checkboxes to be checked)', 'mymovi') : '')}
								checked={required}
								onChange={(value) =>
									setAttributes({ required: value })
								}
							/>
						</>
					)}
					<TextControl
						label={__('Show on parent\'s value', 'mymovi')}
						value={show_on}
						onChange={(value) =>
							setAttributes({ show_on: value })
						}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...useBlockProps()}>
				{show_on == "" ? outputWithSubfields(attributes) : (
					<details data-mymovi-show-on={show_on}>
						<summary>
							{__('Only shown on: ', 'mymovi') + show_on}
						</summary>
						{outputWithSubfields(attributes)}
					</details>
				)}
			</div>
		</>
	);
}

function outputWithSubfields(attributes) {
	const { type, name, label } = {
		type: {
			key: "text",
		},
		name: "",
		label: "",
		...attributes // Override previous defaults if contained in the given attributes
	};

	return (
		<>
			<div className={"mymovi-form-field input-field type-" + type.key}>
				<label>
					{label} <br />
					{outputForAttributes(attributes)}
				</label>
			</div>
			<div id={'mymovi-' + name + '-subfields'}>
				<InnerBlocks />
			</div>
		</>
	);
}

export function outputForAttributes(attributes) {
	const { type, name, options, option_texts, minlength, maxlength, min, max, step, required } = {
		type: {
			key: "text",
			name: __("Text", 'mymovi'),
		},
		name: "",
		options: [], option_texts: [],
		minlength: 0, maxlength: 0,
		min: 0, max: 0, step: 0,
		required: false,
		...attributes // Override any defaults if contained in the given attributes
	};

	const nameAttribute = "mymovi-field-" + name;

	switch (type.key) {
		case "text":
			return <input
				type="text"
				name={nameAttribute}
				minLength={minlength} maxLength={maxlength}
				required={required}
				data-mymovi-show-subfields
				onInput={(e) => {
					showSubfields(name, e.target);
				}}
			/>;
		case "textarea":
			return <textarea
				name={nameAttribute}
				minLength={minlength} maxLength={maxlength}
				required={required}
				data-mymovi-show-subfields
				onInput={(e) => {
					showSubfields(name, e.target);
				}}
			/>;
		case "number":
			return <input
				type="number"
				name={nameAttribute}
				min={min} max={max}
				required={required}
				data-mymovi-show-subfields
				onInput={(e) => {
					showSubfields(name, e.target);
				}} />;
		case "range":
			const datalistOptions = [];
			for (let i = 0; i < options.length; i++) {
				datalistOptions.push(<option key={i} value={options[i]}>{i < option_texts.length ? option_texts[i] : options[i]}</option>);
			}

			return (<>
				<input
					type="range"
					id={"range-" + name}
					name={nameAttribute}
					min={min} max={max} step={step}
					list={"datalist-" + name}
					data-mymovi-show-subfields
					onInput={(e) => {
						showSubfields(name, e.target);
					}}
				/>
				<datalist id={"datalist-" + name}>
					{datalistOptions}
				</datalist>
			</>);
		case "select":
			const optionTags = [];
			for (let i = 0; i < options.length; i++) {
				optionTags.push(<option key={i} value={options[i]}>{i < option_texts.length ? option_texts[i] : options[i]}</option>);
			}

			return (
				<select
					name={nameAttribute}
					required={required}
					data-mymovi-show-subfields
					onInput={(e) => {
						showSubfields(name, e.target);
					}}
				>
					<option value="">{__('Please select', 'mymovi')}</option>
					{optionTags}
				</select>
			);

		case "checkbox":
			const checkboxOptions = [];
			for (let i = 0; i < options.length; i++) {
				checkboxOptions.push((
					<label key={i}>
						<input
							type="checkbox"
							name={nameAttribute}
							value={options[i]}
							required={required}
							data-mymovi-show-subfields
							onInput={(e) => {
								showSubfields(name, e.target);
							}} />
						{i < option_texts.length ? option_texts[i] : options[i]} <br />
					</label>
				));
			}

			return (<>{checkboxOptions}</>);

		case "radio":
			const radioOptions = [];
			for (let i = 0; i < options.length; i++) {
				radioOptions.push((
					<label key={i}>
						<input
							type="radio"
							name={nameAttribute}
							value={options[i]}
							required={required}
							data-mymovi-show-subfields
							onInput={(e) => {
								showSubfields(name, e.target);
							}} />
						{i < option_texts.length ? option_texts[i] : options[i]} <br />
					</label>
				));
			}

			return (<>{radioOptions}</>);
		default:
			return;
	}
}
