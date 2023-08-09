<h1><code>ComponentMetadata</code></h1>
<p class="lead">The base datatype of all components' Metadata</p>

<table class="table" style="width: 100%;">
	<thead>
		<tr>
			<th scope="col">Name</th>
			<th scope="col">Description</th>
			<th scope="col">Type</th>
			<th scope="col">Default value</th>
			<th scope="col">Notes</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th scope="row"><code>.Id</code></th>
			<td
				>The id of the component, used internaly, <strong
					>should not be modified after creation</strong
				></td
			>
			<td><code>string</code></td>
			<td><code>""</code></td>
			<td />
		</tr>
		<tr>
			<th scope="row"><code>.Required</code></th>
			<td
				>if <code>true</code>, the form will <strong>not</strong> be submitted if the component's value
				is null</td
			>
			<td><code>boolean</code></td>
			<td><code>false</code></td>
			<td />
		</tr>
		<tr>
			<th scope="row"><code>.Hidden</code></th>
			<td>if <code>true</code>, the component will not be rendered</td>
			<td><code>boolean</code></td>
			<td><code>false</code></td>
			<td
				>If <code>.Hidden == true</code>, the form will submit regardless if the component is
				<code>.Required</code> or not</td
			>
		</tr>
		<tr>
			<th scope="row"><code>.CustomProperties</code></th>
			<td>The custom properties of each components</td>
			<td><code>{'{[key:string]: any} | null'}</code></td>
			<td><code>null</code></td>
			<td>Please refer to each components' page for their CustomProperties specifics</td>
		</tr>
		<tr>
			<th scope="row"><code>.Label</code></th>
			<td>The label of the component in the form</td>
			<td><code>string</code></td>
			<td><code>""</code></td>
			<td />
		</tr>
		<tr>
			<th scope="row"><code>.Type</code></th>
			<td
				>Used to determine what type of component is this. <strong
					>should not be modified after creation</strong
				></td
			>
			<td><code>string</code></td>
			<td><code>"text"</code></td>
			<td />
		</tr>
		<tr>
			<th scope="row"><code>.OrderIndex</code></th>
			<td
				>Used to position the components in right order</td
			>
			<td><code>number</code></td>
			<td><code>0</code></td>
			<td />
		</tr>
	</tbody>
</table>

<style lang="ts">
	.my-form {
		padding: 2%;
	}

	.container {
		margin-top: 5%;
	}
</style>
