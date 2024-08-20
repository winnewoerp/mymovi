window.addEventListener('load', () => {
	document.querySelectorAll('[data-mymovi-show-subfields]').forEach((elem) => {
		if (elem instanceof HTMLElement) {
			elem.addEventListener('input', (e) => {
				showSubfields(elem.name.replace("mymovi-field-", ""), e.target);
			});
		}
	});
});

/**
 * Shows the subfields of the field with the specified id according to the value of that field
 * @param {string} id
 * @param {HTMLElement} target
 */
export function showSubfields(id, target) {
	const subfields = document.querySelectorAll('#mymovi-' + id + '-subfields [data-mymovi-show-on]');

	for (const field of subfields) {
		const correctValue = field.dataset.mymoviShowOn.split('||').includes(target.value);
		const checked = (!['checkbox','radio'].includes(target.type) || (target.checked));

		if (target.type == 'checkbox') {
			if (correctValue)
				if (field instanceof HTMLDetailsElement) {
					field.open = checked;
				} else {
					field.style.display = checked ? '' : 'none';
				}
		} else {
			if (field instanceof HTMLDetailsElement) {
				field.open = correctValue && checked;
			} else {
				field.style.display = correctValue && checked ? '' : 'none';
			}
		}
	}
}
