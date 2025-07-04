import type { CreateInputOptions } from '../Infrastructure/InputController';
import { InputController } from '../Infrastructure/InputController';
import { OutputController, type CreateOutputOptions } from './OutputController';

// Inputs.
import * as ArrayInput from '../Inputs/ArrayInput/ArrayInput.svelte';
import * as InputText from '../Inputs/Text/Text.svelte';
import * as FileUpload from '../Inputs/FileUpload/FileUpload.svelte';
import * as FlexboxInput from '../Inputs/FlexboxInput/FlexboxInput.svelte';
import * as ConditionalValue from '../Inputs/ConditionalValue/ConditionalValue.svelte';
import * as BooleanInput from '../Inputs/Boolean/Boolean.svelte';
import * as DateTime from '../Inputs/DateTime/DateTime.svelte';
import * as Radio from '../Inputs/Radio/Radio.svelte';
import * as ComplexInput from '../Inputs/ComplexInput/ComplexInput.svelte';
import * as ConditionalInput from '../Inputs/ConditionalInput/ConditionalInput.svelte';
import * as MultilevelPicker from '../Inputs/MultilevelPicker/MultilevelPicker.svelte';
import * as InputNumber from '../Inputs/Number/Number.svelte';
import * as NumberRange from '../Inputs/NumberRange/NumberRange.svelte';
import * as Dropdown from '../Inputs/Dropdown/Dropdown.svelte';
import * as DateRange from '../Inputs/DateRange/DateRange.svelte';
import * as RichTextEditor from '../Inputs/RichTextEditor/RichTextEditor.svelte';
import * as Consent from '../Inputs/Consent/Consent.svelte';
import * as Paginator from '../Inputs/Paginator/Paginator.svelte';
import * as Password from '../Inputs/Password/Password.svelte';
import * as TableInput from '../Inputs/TableInput/TableInput.svelte';
import * as ToggledInput from '../Inputs/ToggledInput/ToggledInput.svelte';
import * as JsonObject from '../Inputs/JsonObject/JsonObject.svelte';
import * as ListInput from '../Inputs/ListInput/ListInput.svelte';
import * as MoneyInput from '../Inputs/Money/Money.svelte';
import * as Groups from '../Inputs/Groups/Groups.svelte';
import * as InputOrOutput from '../Inputs/InputOrOutput/InputOrOutput.svelte';

// Outputs.
import * as StateDiagram from '../Outputs/StateDiagram/StateDiagram.svelte';
import * as OutputText from '../Outputs/Text/Text.svelte';
import * as OutputImage from '../Outputs/Image/Image.svelte';
import * as ImageOverlay from '../Outputs/ImageOverlay/ImageOverlay.svelte';
import * as PaginatedObjectList from '../Outputs/PaginatedObjectList/PaginatedObjectList.svelte';
import * as PieChart from '../Outputs/PieChart/PieChart.svelte';
import * as Matrix from '../Outputs/Matrix/Matrix.svelte';
import * as Money from '../Outputs/Money/Money.svelte';
import * as TreeViewSelector from '../Outputs/TreeViewSelector/TreeViewSelector.svelte';
import * as Grid from '../Outputs/Grid/Grid.svelte';
import * as Tabs from '../Outputs/Tabs/Tabs.svelte';
import * as Slider from '../Outputs/Slider/Slider.svelte';
import * as Number from '../Outputs/Number/Number.svelte';
import * as PreformattedText from '../Outputs/PreformattedText/PreformattedText.svelte';
import * as Html from '../Outputs/Html/Html.svelte';
import * as DateTimeOutput from '../Outputs/DateTime/DateTime.svelte';
import * as EventDescription from '../Outputs/EventDescription/EventDescription.svelte';
import * as Status from '../Outputs/Status/Status.svelte';
import * as ComplexOutput from '../Outputs/ComplexOutput/ComplexOutput.svelte';
import * as TidyTree from '../Outputs/TidyTree/TidyTree.svelte';
import * as LineChart from '../Outputs/LineChart/LineChart.svelte';
import * as BarChart from '../Outputs/BarChart/BarChart.svelte';
import * as Timeline from '../Outputs/Timeline/Timeline.svelte';
import * as ConversationTimeline from '../Outputs/ConversationTimeline/ConversationTimeline.svelte';
import * as DynamicInput from '../Inputs/DynamicInput/DynamicInput.svelte';
import * as Typeahead from '../Inputs/Typeahead/Typeahead.svelte';
import * as Table from '../Outputs/Table/Table.svelte';
import * as ObjectFlexbox from '../Outputs/ObjectFlexbox/ObjectFlexbox.svelte';
import * as ObjectGrid from '../Outputs/ObjectGrid/ObjectGrid.svelte';
import * as ObjectList from '../Outputs/ObjectList/ObjectList.svelte';
import * as ActionList from '../Outputs/ActionList/ActionList.svelte';
import * as MultiSelect from '../Inputs/Multiselect/Multiselect.svelte';
import * as Alert from '../Outputs/Alert/Alert.svelte';
import * as Expandable from '../Outputs/Expandable/Expandable.svelte';
import * as Icon from '../Outputs/Icon/Icon.svelte';
import * as Tag from '../Outputs/Tag/Tag.svelte';
import * as Link from '../Outputs/Link/Link.svelte';
import * as Tabstrip from '../Outputs/Tabstrip/Tabstrip.svelte';
import * as InlineForm from '../Outputs/InlineForm/InlineForm.svelte';
import * as PaginatedTable from '../Outputs/PaginatedTable/PaginatedTable.svelte';
import * as ProgressTracker from '../Outputs/ProgressTracker/ProgressTracker.svelte';
import * as Sequence from '../Outputs/Sequence/Sequence.svelte';
import * as CartItemOe from '../Outputs/CartItemOe/CartItemOe.svelte';
import * as Output from '../Outputs/Output/Output.svelte';
import * as SlaTimer from '../Outputs/SlaTimer/SlaTimer.svelte';
import * as ShipmentSize from '../Outputs/ShipmentSize/ShipmentSize.svelte';
import * as BooleanOutput from '../Outputs/Boolean/Boolean.svelte';
import * as Breadcrumbs from '../Outputs/Breadcrumbs/Breadcrumbs.svelte';
import * as Flexbox from '../Outputs/Flexbox/Flexbox.svelte';
import * as FormDocumentation from '../Outputs/FormDocumentation/FormDocumentation.svelte';
import * as FormInputs from '../Outputs/FormInputs/FormInputs.svelte';
import * as FormLink from '../Outputs/FormLink/FormLink.svelte';
import * as FormTitle from '../Outputs/FormTitle/FormTitle.svelte';
import * as ParentFieldDocumentation from '../Outputs/ParentFieldDocumentation/ParentFieldDocumentation.svelte';
import * as ParentFieldLabel from '../Outputs/ParentFieldLabel/ParentFieldLabel.svelte';

import * as OutputWrapper from '../Output.svelte';

interface InputFieldControllerConstructor {
	new (options: CreateInputOptions): InputController<any>;
}

interface InputRegistration {
	type: string;
	component: any;
	controller: InputFieldControllerConstructor;
	config: ComponentConfiguration;
}

interface OutputRegistration {
	type: string;
	component: any;
	config: ComponentConfiguration;
}

/**
 * Configures display options for an output control.
 */
export interface ComponentConfiguration {
	/**
	 * If `true` then this control won't ever have a label rendered for it.
	 */
	alwaysHideLabel: boolean;

	/** Indicates if the element should be rendered with `display:block` or `display:inline`. */
	displayAsBlock: boolean;

	/**
	 * If `true`, then it will indicate that the control should not be rendered if the
	 * data to be passed is `null`. Controls that cannot render `null` data should set
	 * this property to `true`.
	 */
	hideIfNull: boolean;
}

export interface ComponentConfigurationOptions {
	alwaysHideLabel?: boolean;
	displayAsBlock?: boolean;
	hideIfNull?: boolean;
}

export interface CreateInputResult {
	target?: HTMLElement;
	controller: InputController<any>;
	component: any;
}

export interface CreateOutputResult {
	target?: HTMLElement;
	controller: OutputController<any>;
	component: any;
}

export interface AttachControllerOptions {
	controller: InputController<any> | OutputController<any>;
	element: HTMLElement;
}

/**
 * Keeps track of all UIMF svelte components. This class can be considered as
 * a dependency injection container.
 */
export class ControlRegister {
	public inputs: Record<string, InputRegistration> = {};
	public outputs: Record<string, OutputRegistration> = {};

	public registerInputComponent(
		metadataType: string,
		svelteComponent: any,
		config?: ComponentConfigurationOptions | null
	) {
		this.inputs[metadataType] = {
			type: metadataType,
			component: svelteComponent.default,
			controller: svelteComponent.Controller,
			config: {
				alwaysHideLabel: config?.alwaysHideLabel ?? false,
				displayAsBlock: config?.displayAsBlock ?? true,
				hideIfNull: config?.hideIfNull ?? false
			}
		};
	}

	public registerOutputComponent(
		metadataType: string,
		svelteComponent: any,
		config?: ComponentConfigurationOptions | null
	) {
		this.outputs[metadataType] = {
			type: metadataType,
			component: svelteComponent.default,
			config: {
				alwaysHideLabel: config?.alwaysHideLabel ?? false,
				displayAsBlock: config?.displayAsBlock ?? true,
				hideIfNull: config?.hideIfNull ?? false
			}
		};
	}

	public hasInputComponent(metadataType: string) {
		return this.inputs[metadataType] != null;
	}

	public hasOutputComponent(metadataType: string) {
		return this.outputs[metadataType] != null;
	}

	createInput(options: CreateInputOptions, renderTarget?: HTMLElement): CreateInputResult {
		const registration = this.inputs[options.metadata.Component.Type];

		if (registration == null) {
			throw `Cannot find input component '${options.metadata.Component.Type}'.`;
		}

		const controller = new registration.controller(options);

		return {
			target: renderTarget,
			controller: controller,
			component:
				renderTarget != null
					? new registration.component({
							target: renderTarget,
							props: {
								controller: controller
							}
					  })
					: registration.component
		};
	}

	createOutput(options: CreateOutputOptions, renderTarget?: HTMLElement): CreateOutputResult {
		const registration = this.outputs[options.props.metadata.Component.Type];

		if (registration == null) {
			throw `Cannot find output component '${options.props.metadata.Component.Type}'.`;
		}

		const controller = new OutputController<any>(options.props);

		let component: any = registration.component;

		if (options.wrap != null) {
			component = OutputWrapper.default;
		}

		return {
			target: renderTarget,
			controller: controller,
			component:
				renderTarget != null
					? new component({
							target: renderTarget,
							props: {
								controller: controller,
								nolayout: options.wrap?.nolayout
							}
					  })
					: component
		};
	}

	attachControllerToElement(options: AttachControllerOptions) {
		let isInput = options.controller instanceof InputController;

		const registration = isInput
			? this.inputs[options.controller.metadata.Component.Type]
			: this.outputs[options.controller.metadata.Component.Type];

		if (registration == null) {
			throw `Cannot find ${isInput ? 'input' : 'output'} component '${
				options.controller.metadata.Component.Type
			}'.`;
		}

		return new registration.component({
			target: options.element,
			props: {
				controller: options.controller
			}
		});
	}
}

export const defaultControlRegister = new ControlRegister();

// Inputs.
defaultControlRegister.registerInputComponent('array-input', ArrayInput);
defaultControlRegister.registerInputComponent('text', InputText);
defaultControlRegister.registerInputComponent('file-upload', FileUpload);
defaultControlRegister.registerInputComponent('flexbox-input', FlexboxInput);
defaultControlRegister.registerInputComponent('boolean', BooleanInput);
defaultControlRegister.registerInputComponent('datetime', DateTime);
defaultControlRegister.registerInputComponent('radio', Radio);
defaultControlRegister.registerInputComponent('complex-input', ComplexInput);
defaultControlRegister.registerInputComponent('conditional-input', ConditionalInput);
defaultControlRegister.registerInputComponent('conditional-value', ConditionalValue);
defaultControlRegister.registerInputComponent('number', InputNumber);
defaultControlRegister.registerInputComponent('number-range', NumberRange);
defaultControlRegister.registerInputComponent('dropdown', Dropdown);
defaultControlRegister.registerInputComponent('rich-text-editor', RichTextEditor);
defaultControlRegister.registerInputComponent('date-range', DateRange);
defaultControlRegister.registerInputComponent('consent', Consent, { alwaysHideLabel: true });
defaultControlRegister.registerInputComponent('paginator', Paginator);
defaultControlRegister.registerInputComponent('password', Password);
defaultControlRegister.registerInputComponent('table-input', TableInput);
defaultControlRegister.registerInputComponent('toggled-input', ToggledInput);
defaultControlRegister.registerInputComponent('typeahead', Typeahead);
defaultControlRegister.registerInputComponent('multiselect', MultiSelect);
defaultControlRegister.registerInputComponent('multilevel-picker', MultilevelPicker);
defaultControlRegister.registerInputComponent('dynamic-input', DynamicInput, {
	displayAsBlock: false
});
defaultControlRegister.registerInputComponent('json-object', JsonObject);
defaultControlRegister.registerInputComponent('list-input', ListInput);
defaultControlRegister.registerInputComponent('money', MoneyInput);
defaultControlRegister.registerInputComponent('groups', Groups);
defaultControlRegister.registerInputComponent('input-or-output', InputOrOutput);

// Outputs.
defaultControlRegister.registerOutputComponent('action-list', ActionList, {
	alwaysHideLabel: true
});
defaultControlRegister.registerOutputComponent('alert', Alert, { alwaysHideLabel: true });
defaultControlRegister.registerOutputComponent('boolean', BooleanOutput, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('breadcrumbs', Breadcrumbs, {
	displayAsBlock: true
});
defaultControlRegister.registerOutputComponent('datetime', DateTimeOutput, {
	displayAsBlock: false
});
defaultControlRegister.registerOutputComponent('flexbox', Flexbox, {
	alwaysHideLabel: false,
	displayAsBlock: false
});
defaultControlRegister.registerOutputComponent('form-documentation', FormDocumentation, {
	alwaysHideLabel: true,
	displayAsBlock: true
});
defaultControlRegister.registerOutputComponent('form-inputs', FormInputs, { displayAsBlock: true });
defaultControlRegister.registerOutputComponent('formlink', FormLink, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('form-title', FormTitle, {
	alwaysHideLabel: true,
	displayAsBlock: true
});
defaultControlRegister.registerOutputComponent('grid', Grid, { displayAsBlock: true });
defaultControlRegister.registerOutputComponent('icon', Icon, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('image', OutputImage, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('image-overlay', ImageOverlay);
defaultControlRegister.registerOutputComponent('matrix', Matrix, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('money', Money, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('number', Number, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('paginated-object-list', PaginatedObjectList);
defaultControlRegister.registerOutputComponent('pie-chart', PieChart, {
	displayAsBlock: true,
	hideIfNull: true
});
defaultControlRegister.registerOutputComponent('tidy-tree', TidyTree, { displayAsBlock: true });
defaultControlRegister.registerOutputComponent('line-chart', LineChart, { displayAsBlock: true });
defaultControlRegister.registerOutputComponent('progress-tracker', ProgressTracker, {
	displayAsBlock: true
});
defaultControlRegister.registerOutputComponent('sequence', Sequence, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('sla-timer', SlaTimer, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('slider', Slider);
defaultControlRegister.registerOutputComponent('state-diagram', StateDiagram);
defaultControlRegister.registerOutputComponent('timeline', Timeline);
defaultControlRegister.registerOutputComponent('conversation-timeline', ConversationTimeline);
defaultControlRegister.registerOutputComponent('status', Status, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('tabs', Tabs, { alwaysHideLabel: true });
defaultControlRegister.registerOutputComponent('tabstrip', Tabstrip, { alwaysHideLabel: true });
defaultControlRegister.registerOutputComponent('tag', Tag, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('text', OutputText, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('tree-view-selector', TreeViewSelector);
defaultControlRegister.registerOutputComponent('html', Html, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('preformatted-text', PreformattedText, {
	displayAsBlock: true
});
defaultControlRegister.registerOutputComponent('link', Link, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('table', Table, { displayAsBlock: true });
defaultControlRegister.registerOutputComponent('inline-form', InlineForm, { displayAsBlock: true });
defaultControlRegister.registerOutputComponent('paginated-table', PaginatedTable, {
	displayAsBlock: true
});
defaultControlRegister.registerOutputComponent('output', Output, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('expandable', Expandable, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('object-flexbox', ObjectFlexbox, {
	displayAsBlock: false
});
defaultControlRegister.registerOutputComponent('object-grid', ObjectGrid, { displayAsBlock: true });
defaultControlRegister.registerOutputComponent('object-list', ObjectList, {
	displayAsBlock: false
});
defaultControlRegister.registerOutputComponent('complex-output', ComplexOutput, {
	displayAsBlock: true
});

// App-specific components.
defaultControlRegister.registerOutputComponent('event-description', EventDescription, {
	displayAsBlock: false
});
defaultControlRegister.registerOutputComponent('cart-item-oe', CartItemOe, {
	displayAsBlock: false
});
defaultControlRegister.registerOutputComponent('shipment-size', ShipmentSize, {
	displayAsBlock: false
});
defaultControlRegister.registerOutputComponent('bar-chart', BarChart, { displayAsBlock: true });
defaultControlRegister.registerOutputComponent('parent-field-doc', ParentFieldDocumentation, {
	alwaysHideLabel: true,
	displayAsBlock: true
});
defaultControlRegister.registerOutputComponent('parent-field-label', ParentFieldLabel, {
	alwaysHideLabel: true,
	displayAsBlock: false
});
