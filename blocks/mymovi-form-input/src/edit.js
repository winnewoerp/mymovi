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
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';

import { PanelBody, TextControl, ToggleControl, CustomSelectControl } from '@wordpress/components';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit({ attributes, setAttributes }) {
	const { type, name, label, options, option_texts, minlength, maxlength, min, max, step, required } = {
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
				</PanelBody>
			</InspectorControls>

			<div {...useBlockProps()}>
				<div className={"mymovi-form-field input-field type-" + type.key}>
					<label>
						{label} <br />
						{outputForAttributes(attributes)}
					</label>
				</div>
			</div>
		</>
	);
}

export function outputForAttributes(attributes) {
	const { type, name, options, option_texts, minlength, maxlength, min, max, step, required } = {
		type: "",
		name: "",
		options: [], option_texts: [],
		minlength: 0, maxlength: 0,
		min: 0, max: 0, step: 0,
		required: false,
		...attributes // Override any defaults if contained in the given attributes
	};

	switch (type.key) {
		case "text":
			return <input
				type="text"
				name={"mymovi-field-" + name}
				minLength={minlength} maxLength={maxlength}
				required={required}
			/>;
		case "textarea":
			return <textarea
				name={"mymovi-field-" + name}
				minLength={minlength} maxLength={maxlength}
				required={required}
			/>;
		case "number":
			return <input type="number" name={"mymovi-field-" + name} min={min} max={max} required={required} />;
		case "range":
			const datalistOptions = [];
			for (let i = 0; i < options.length; i++) {
				datalistOptions.push(<option key={i} value={options[i]}>{i < option_texts.length ? option_texts[i] : options[i]}</option>);
			}

			return (<>
				<input
					type="range"
					id={"range-" + name}
					name={"range-" + name}
					min={min} max={max} step={step}
					list={"datalist-" + name}
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
				<select name={"mymovi-field-" + name} required={required}>
					<option value="">{__('Please select', 'mymovi')}</option>
					{optionTags}
				</select>
			);

		case "checkbox":
			const checkboxOptions = [];
			for (let i = 0; i < options.length; i++) {
				checkboxOptions.push((
					<label key={i}>
						<input type="checkbox" name={"mymovi-field-" + name} value={options[i]} required={required} />
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
						<input type="radio" name={"mymovi-field-" + name} value={options[i]} required={required} />
						{i < option_texts.length ? option_texts[i] : options[i]} <br />
					</label>
				));
			}

			return (<>{radioOptions}</>);
		default:
			return;
	}
}
