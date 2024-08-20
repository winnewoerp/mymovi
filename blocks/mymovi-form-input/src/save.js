import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

import { outputForAttributes } from './edit'

export default function save({ attributes }) {
	const { show_on } = {
		show_on: "",
		...attributes // Override previous defaults if contained in the given attributes
	};

	return (
		<div {...useBlockProps.save()}>
			{show_on == "" ? outputWithSubfields(attributes) : (
				<div data-mymovi-show-on={show_on} style={{ display: 'none' }}>
					{outputWithSubfields(attributes)}
				</div>
			)}
		</div>
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
				<InnerBlocks.Content />
			</div>
		</>
	);
}