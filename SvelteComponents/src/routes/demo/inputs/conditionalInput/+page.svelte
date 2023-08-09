<script lang="ts">
	import ConditionalInput from '$lib/Inputs/ConditionalInput.svelte';
	import { onMount } from 'svelte';

	let conditionalInput: ConditionalInput;
	let target: HTMLElement;

	onMount(() => {
		conditionalInput = new ConditionalInput({
			props: {
				metadata: {
					Condition: {
						Required: true,
						CustomProperties: {
							Options: [
								{
									CssClass: '',
									Icon: '',
									Label: 'Text',
									Tooltip: '',
									Value: 0
								},
								{
									CssClass: '',
									Icon: '',
									Label: 'Textarea',
									Tooltip: '',
									Value: 1
								},
								{
									CssClass: '',
									Icon: '',
									Label: 'Number',
									Tooltip: '',
									Value: 2
								},
								{
									CssClass: '',
									Icon: '',
									Label: 'Dropdown',
									Tooltip: '',
									Value: 3
								},
								{
									CssClass: '',
									Icon: '',
									Label: 'Checkbox',
									Tooltip: '',
									Value: 4
								}
							]
						},
						EventHandlers: [],
						Id: 'Condition',
						Label: 'Field type',
						Type: 'radio',
						Hidden: false,
						OrderIndex: 0
					},
					Views: [
						{
							Properties: [
								{
									Required: true,
									EventHandlers: [],
									Id: 'CheckboxName',
									Label: 'Checkbox name',
									Type: 'text',
									Hidden: false,
									OrderIndex: 10
								}
							],
							Required: true,
							CustomProperties: {
								showIfConditionIs: {
									SelectedValue: 4
								}
							},
							EventHandlers: [],
							Id: 'Checkbox',
							Label: 'Checkbox',
							Type: 'nested-input',
							Hidden: false,
							OrderIndex: 0
						},
						{
							Properties: [],
							Required: true,
							CustomProperties: {
								showIfConditionIs: {
									SelectedValue: 3
								}
							},
							EventHandlers: [],
							Id: 'Dropdown',
							Label: 'Dropdown',
							Type: 'nested-input',
							Hidden: false,
							OrderIndex: 0
						},
						{
							Properties: [
								{
									Required: true,
									EventHandlers: [],
									Id: 'MaxLength',
									Label: 'Maximum length',
									Type: 'number',
									Hidden: false,
									OrderIndex: 15
								},
								{
									Required: true,
									EventHandlers: [],
									Id: 'MinLength',
									Label: 'Minimum length',
									Type: 'number',
									Hidden: false,
									OrderIndex: 10
								}
							],
							Required: true,
							CustomProperties: {
								showIfConditionIs: {
									SelectedValue: 1
								}
							},
							EventHandlers: [],
							Id: 'TextareaField',
							Label: 'TextareaField',
							Type: 'nested-input',
							Hidden: false,
							OrderIndex: 0
						},
						{
							Properties: [
								{
									Required: true,
									EventHandlers: [],
									Id: 'MaxLength',
									Label: 'Maximum length',
									Type: 'number',
									Hidden: false,
									OrderIndex: 15
								},
								{
									Required: true,
									EventHandlers: [],
									Id: 'MinLength',
									Label: 'Minimum length',
									Type: 'number',
									Hidden: false,
									OrderIndex: 10
								}
							],
							Required: true,
							CustomProperties: {
								showIfConditionIs: {
									SelectedValue: 0
								}
							},
							EventHandlers: [],
							Id: 'TextField',
							Label: 'TextField',
							Type: 'nested-input',
							Hidden: false,
							OrderIndex: 0
						},
						{
							Properties: [
								{
									Required: true,
									EventHandlers: [],
									Id: 'MaxValue',
									Label: 'Maximum value',
									Type: 'number',
									Hidden: false,
									OrderIndex: 15
								},
								{
									Required: true,
									EventHandlers: [],
									Id: 'MinValue',
									Label: 'Minimum value',
									Type: 'number',
									Hidden: false,
									OrderIndex: 10
								}
							],
							Required: true,
							CustomProperties: {
								showIfConditionIs: {
									SelectedValue: 2
								}
							},
							EventHandlers: [],
							Id: 'NumberField',
							Label: 'NumberField',
							Type: 'nested-input',
							Hidden: false,
							OrderIndex: 0
						}
					],
					Required: true,
					EventHandlers: [],
					Id: 'FieldValueConfig',
					Label: 'Field value',
					Type: 'conditional-input',
					Hidden: false,
					OrderIndex: 10,
					$$hashKey: 'object:3350'
				}
			},
			target
		});
	});
</script>

<h1>Inputs / Conditional Input</h1>
<div bind:this={target} />
<button
	on:click={() => {
		console.log(conditionalInput.getValue());
	}}>Get Value</button
>
