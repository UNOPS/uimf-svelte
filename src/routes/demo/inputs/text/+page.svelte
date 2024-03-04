<script lang="ts" type="module">
	import { defaultControlRegister as controlRegister } from '$lib/Infrastructure/ControlRegister';
	import type IUimfApp from '$lib/Infrastructure/UimfApp';
	import type { IFieldMetadata } from '$lib/Infrastructure/uimf';
	import CodeEditor from '../../../../docs/CodeEditor.svelte';
	import MetadataCompatibilityTable from '../../../../docs/MetadataCompatibilityTable.svelte';

	const componentRegistry = controlRegister.inputs['text'];
	const fakeApp = {} as IUimfApp;
	let metadata = {
		Required: true,
		CustomProperties: {
			multiline: false
		}
	} as IFieldMetadata;

	$: rawMetadata = processMetadata(metadata);

	let controller = updateController();

	function processMetadata(metadata: any) {
		let toReturn =
			' var metadata = ' +
			JSON.stringify(metadata)
				.replaceAll('"', '')
				.replaceAll(',', ',\n\t')
				.replaceAll('{', ' {\n\t')
				.replaceAll('}', '}\n\t');
		return toReturn;
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		controller = updateController();
	}

	function updateController() {
		return new componentRegistry.controller(metadata, null, null, fakeApp);
	}

	function serializeMetadata(code: string) {
		let customProperties: { [key: string]: any } = {};
		try {
			code = code.replace('var', '').replace('metadata', '').replace('=', '');
			let lastbracketIndex = code.lastIndexOf('}');
			code = code.slice(0, lastbracketIndex);
			let customPropertiesMetadata = code.split('CustomProperties');
			lastbracketIndex = customPropertiesMetadata[1].lastIndexOf('}');
			customPropertiesMetadata[1] = customPropertiesMetadata[1].slice(0, lastbracketIndex);

			customPropertiesMetadata = customPropertiesMetadata[1]
				.replace(':', '')
				.replace('{', '')
				.split('\n')
				.map((item) => item.replaceAll('\t', ''))
				.filter((item) => item.trim().length != 0);

			for (const item of customPropertiesMetadata) {
				let nameAndValue = item.split(':');
				customProperties[nameAndValue[0]] = parseValue(nameAndValue[1]);
			}
			return customProperties;
		} catch (e: any) {
			alert("error occured during compilation, please check the code's syntax: " + e.message);
		}
	}

	function parseValue(value: string) {
		switch (value) {
			case 'true':
				return true;
			case 'false':
				return false;
			default:
				break;
		}

		if (!Number.isNaN(value)) {
			return parseInt(value);
		}
		return value;
	}

	function handleUpdateCode(code: string) {
		let customProperties = serializeMetadata(code);
		metadata.CustomProperties = customProperties;
		controller = updateController();
	}
</script>

<h1>Inputs / Text</h1>
<p class="lead">An input textbox, something every form has.</p>

<strong>Component</strong>
<svelte:component this={componentRegistry.component} {controller} />

<div style="margin-top: 2%;"><CodeEditor code={rawMetadata} onUpdateCode={handleUpdateCode} /></div>

<div class="container">
	<h4>CustomProperties</h4>
	<table class="table">
		<thead>
			<tr>
				<th scope="col">Name</th>
				<th scope="col">Description</th>
				<th scope="col">Type</th>
				<th scope="col">Default value</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<th scope="row"><code>.multiline</code></th>
				<td>if <code>true</code>, the component will be rendered as a <code>textarea</code></td>
				<td><code>boolean</code></td>
				<td><code>false</code></td>
			</tr>
		</tbody>
	</table>
</div>

<MetadataCompatibilityTable />

<style lang="ts">
	.my-form {
		padding: 2%;
	}

	.container {
		margin-top: 5%;
	}
</style>
