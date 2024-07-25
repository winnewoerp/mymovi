import { useBlockProps } from '@wordpress/block-editor';

import { outputForAttributes } from './edit'

export default function save({ attributes }) {
	const { type, name, label, options, option_texts, minlength, maxlength, min, max, step, required } = {
		type: "",
		name: "",
		label: "",
		options: [], option_texts: [],
		minlength: 0, maxlength: 0,
		min: 0, max: 0, step: 0,
		required: false,
		...attributes // Override previous defaults if contained in the given attributes
	};

	return (
		<div {...useBlockProps.save()}>
			<div className={"mymovi-form-field input-field type-"+type.key}>
				<label>
					{label} <br />
					{outputForAttributes(attributes)}
				</label>
			</div>
		</div>
	);
}