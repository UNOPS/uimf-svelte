import type { CreateInputOptions, InputController } from "$lib/Infrastructure/InputController";
import { OutputController, type CreateOutputOptions } from "./OutputController";

// Inputs.
import * as InputText from '../Inputs/Text.svelte';
import * as FileUpload from '../Inputs/FileUpload.svelte';
import * as CheckBox from '../Inputs/CheckBox.svelte';
import * as DateTime from '../Inputs/DateTime.svelte';
import * as Radio from "../Inputs/Radio.svelte";
import * as NestedInput from "../Inputs/NestedInput.svelte";
import * as ConditionalInput from "../Inputs/ConditionalInput.svelte";
import * as MultiLevelPicker from "../Inputs/MultiLevelPicker.svelte";
import * as InputNumber from "../Inputs/Number.svelte";
import * as NumberRange from "../Inputs/NumberRange.svelte";
import * as Dropdown from "../Inputs/Dropdown.svelte";
import * as ArrayInput from "../Inputs/ArrayInput.svelte";
import * as DateRange from "../Inputs/DateRange.svelte";
import * as RichTextEditor from '../Inputs/RichTextEditor.svelte'
import * as Consent from '../Inputs/Consent.svelte';
import * as Paginator from '../Inputs/Paginator.svelte';
import * as ValueList from '../Inputs/ValueList.svelte';
import * as ToggledInput from '../Inputs/ToggledInput.svelte';

// Outputs.
import * as StateDiagram from "../Outputs/StateDiagram.svelte";
import * as OutputText from "../Outputs/Text.svelte";
import * as OutputImage from '../Outputs/Image.svelte';
import * as ImageOverlay from '../Outputs/ImageOverlay.svelte';
import * as PaginatedObjectList from '../Outputs/PaginatedObjectList.svelte';
import * as Money from '../Outputs/Money.svelte';
import * as TreeViewSelector from '../Outputs/TreeViewSelector.svelte';
import * as Grid from '../Outputs/Grid.svelte';
import * as Tabs from '../Outputs/Tabs.svelte';
import * as Slider from '../Outputs/Slider.svelte';
import * as Number from '../Outputs/Number.svelte';
import * as Password from '../Inputs/Password.svelte';
import * as PreformattedText from '../Outputs/PreformattedText.svelte';
import * as Html from '../Outputs/Html.svelte';
import * as DateTimeOutput from '../Outputs/DateTime.svelte';
import * as EventDescription from '../Outputs/EventDescription.svelte';
import * as Status from '../Outputs/Status.svelte';
import * as NestedObject from "../Outputs/NestedObject.svelte";

//To be deactivated until complete validation
import * as Typeahead from '../Inputs/Typeahead.svelte'
import * as Table from '../Outputs/Table.svelte';
import * as ObjectList from '../Outputs/ObjectList.svelte';
import * as FormLink from '../Outputs/FormLink.svelte';
import * as ActionList from '../Outputs/ActionList.svelte';
import * as MultiSelect from '../Inputs/Multiselect.svelte';
import * as Alert from '../Outputs/Alert.svelte';
import * as Expandable from '../Outputs/Expandable.svelte';
import * as Icon from '../Outputs/Icon.svelte';
import * as Tag from '../Outputs/Tag.svelte';
import * as Tuple from '../Outputs/Tuple.svelte';
import * as Link from '../Outputs/Link.svelte';
import * as Tabstrip from '../Outputs/Tabstrip.svelte';
import * as InlineForm from '../Outputs/InlineForm.svelte';
import * as PaginatedData from '../Outputs/PaginatedData.svelte';
import * as Sequence from '../Outputs/Sequence.svelte';
import * as CartItem from '../Outputs/CartItem.svelte';
import * as CartItemOe from '../Outputs/CartItemOe.svelte';
import * as Output from '../Outputs/Output.svelte';
import * as SlaTimer from '../Outputs/SlaTimer.svelte';
import * as ShipmentSize from '../Outputs/ShipmentSize.svelte';
import * as Boolean from '../Outputs/Boolean.svelte';
import * as EditableValue from "../Outputs/EditableValue.svelte";
import * as Flexbox from "../Outputs/Flexbox.svelte";

import UimfForm from '../Form.svelte';
import { FormController, type FormInstance } from "./FormController";

interface InputFieldControllerConstructor {
    new(options: CreateInputOptions): InputController<any>;
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

export interface CreateFormOptions {
    parentForm: FormController | null;
    form: FormInstance;
    onCancel: () => any;
    onFormLoaded: (arg0: any) => any;
    onFormFailed: (arg0: any) => any;
    target: HTMLElement;
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

/**
 * Keeps track of all UIMF svelte components. This class can be considered as
 * a dependency injection container.
 */
export class ControlRegister {
    public inputs: Record<string, InputRegistration> = {};
    public outputs: Record<string, OutputRegistration> = {};

    public registerInputComponent(metadataType: string, svelteComponent: any, config?: ComponentConfigurationOptions | null) {
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

    public registerOutputComponent(metadataType: string, svelteComponent: any, config?: ComponentConfigurationOptions | null) {
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

    createForm(options: CreateFormOptions) {
        const controller = new FormController(options.parentForm, options.form);

        return {
            target: options.target,
            controller: controller,
            component: new UimfForm({
                target: options.target,
                props: {
                    controller: controller,
                    onCancel: options.onCancel,
                    onFormLoaded: options.onFormLoaded,
                    onFormFailed: options.onFormFailed
                }
            })
        };
    };

    createInput(options: CreateInputOptions, renderTarget?: HTMLElement): CreateInputResult {
        const registration = this.inputs[options.metadata.Type];

        if (registration == null) {
            throw `Cannot find input component '${options.metadata.Type}'.`;
        }

        const controller = new registration.controller(options);

        return {
            target: renderTarget,
            controller: controller,
            component: renderTarget != null ? new registration.component({
                target: renderTarget,
                props: {
                    controller: controller
                }
            }) : registration.component
        };
    };

    createOutput(options: CreateOutputOptions, renderTarget?: HTMLElement): CreateOutputResult {
        const registration = this.outputs[options.metadata.Type];

        if (registration == null) {
            throw `Cannot find output component '${options.metadata.Type}'.`;
        }

        const controller = new OutputController<any>(options);

        return {
            target: renderTarget,
            controller: controller,
            component: renderTarget != null ? new registration.component({
                target: renderTarget,
                props: {
                    controller: controller
                }
            }) : registration.component
        };
    };
}

export const defaultControlRegister = new ControlRegister();

// Inputs.
defaultControlRegister.registerInputComponent('text', InputText);
defaultControlRegister.registerInputComponent('file-upload', FileUpload);
defaultControlRegister.registerInputComponent('boolean', CheckBox);
defaultControlRegister.registerInputComponent('datetime', DateTime);
defaultControlRegister.registerInputComponent('radio', Radio);
defaultControlRegister.registerInputComponent('nested-input', NestedInput);
defaultControlRegister.registerInputComponent('conditional-input', ConditionalInput);
defaultControlRegister.registerInputComponent('number', InputNumber);
defaultControlRegister.registerInputComponent('number-range', NumberRange);
defaultControlRegister.registerInputComponent('dropdown', Dropdown);
defaultControlRegister.registerInputComponent('rich-text-editor', RichTextEditor);
defaultControlRegister.registerInputComponent('array-input', ArrayInput);
defaultControlRegister.registerInputComponent('date-range', DateRange);
defaultControlRegister.registerInputComponent('consent', Consent, { alwaysHideLabel: true });
defaultControlRegister.registerInputComponent('paginator', Paginator);
defaultControlRegister.registerInputComponent('password', Password);
defaultControlRegister.registerInputComponent('value-list', ValueList);
defaultControlRegister.registerInputComponent('toggled-input', ToggledInput);
defaultControlRegister.registerInputComponent('typeahead', Typeahead);
defaultControlRegister.registerInputComponent('multiselect', MultiSelect);
defaultControlRegister.registerInputComponent('multilevel-picker', MultiLevelPicker);

// Outputs.
defaultControlRegister.registerOutputComponent('action-list', ActionList, { alwaysHideLabel: true });
defaultControlRegister.registerOutputComponent('alert', Alert, { alwaysHideLabel: true });
defaultControlRegister.registerOutputComponent('boolean', Boolean, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('datetime', DateTimeOutput, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('editable-value', EditableValue, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('formlink', FormLink, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('flexbox', Flexbox, { alwaysHideLabel: true });
defaultControlRegister.registerOutputComponent('grid', Grid, { displayAsBlock: true });
defaultControlRegister.registerOutputComponent('icon', Icon, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('image', OutputImage);
defaultControlRegister.registerOutputComponent('image-overlay', ImageOverlay);
defaultControlRegister.registerOutputComponent('money', Money, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('number', Number, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('paginated-object-list', PaginatedObjectList);
defaultControlRegister.registerOutputComponent('sequence', Sequence, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('sla-timer', SlaTimer, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('slider', Slider);
defaultControlRegister.registerOutputComponent('state-diagram', StateDiagram);
defaultControlRegister.registerOutputComponent('status', Status, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('tabs', Tabs, { alwaysHideLabel: true });
defaultControlRegister.registerOutputComponent('tabstrip', Tabstrip, { alwaysHideLabel: true });
defaultControlRegister.registerOutputComponent('tag', Tag, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('text', OutputText, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('tree-view-selector', TreeViewSelector);
defaultControlRegister.registerOutputComponent('html', Html, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('preformatted-text', PreformattedText);
defaultControlRegister.registerOutputComponent('link', Link, { displayAsBlock: false });

// App-specific components.
defaultControlRegister.registerOutputComponent('event-description', EventDescription, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('cart-item', CartItem, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('cart-item-oe', CartItemOe, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('shipment-size', ShipmentSize, { displayAsBlock: false });

// To be deactivated until complete validation
defaultControlRegister.registerOutputComponent('table', Table, { displayAsBlock: true });
defaultControlRegister.registerOutputComponent('inline-form', InlineForm, { displayAsBlock: true });
defaultControlRegister.registerOutputComponent('paginated-data', PaginatedData, { displayAsBlock: true });
defaultControlRegister.registerOutputComponent('output', Output, { displayAsBlock: false });

// These components can only be enabled once we are using the new Form as they depend on each others
defaultControlRegister.registerOutputComponent('expandable', Expandable, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('object-list', ObjectList, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('nested-object', NestedObject, { displayAsBlock: true });
defaultControlRegister.registerOutputComponent('tuple', Tuple, { displayAsBlock: false });