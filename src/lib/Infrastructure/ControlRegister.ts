import type { ComponentMetadata } from "$lib/Infrastructure/uimf";
import type { CreateInputOptions, Deferrer, InputController } from "$lib/Infrastructure/InputController";
import { OutputController, type CreateOutputOptions } from "./OutputController";

// Inputs.
import * as InputText from '../Inputs/Text.svelte';
import * as FileUpload from '../Inputs/FileUpload.svelte';
import * as CheckBox from '../Inputs/CheckBox.svelte';
import * as DateTime from '../Inputs/DateTime.svelte';
import * as Radio from "../Inputs/Radio.svelte";
import * as NestedInput from "../Inputs/NestedInput.svelte";
import * as ConditionalInput from "../Inputs/ConditionalInput.svelte";
import * as InputNumber from "../Inputs/Number.svelte";
import * as Dropdown from "../Inputs/Dropdown.svelte";
import * as ArrayInput from "../Inputs/ArrayInput.svelte";
import * as DateRange from "../Inputs/DateRange.svelte";
import * as RichTextEditor from '../Inputs/RichTextEditor.svelte'
import * as Consent from '../Inputs/Consent.svelte';
import * as Paginator from '../Inputs/Paginator.svelte';


// Outputs.
import * as StateDiagram from "../Outputs/StateDiagram.svelte";
import * as OutputText from "../Outputs/Text.svelte";
import * as OutputImage from '../Outputs/Image.svelte';
import * as ImageOverlay from '../Outputs/ImageOverlay.svelte';
import * as PaginatedObjectList from '../Outputs/PaginatedObjectList.svelte';
import * as Money from '../Outputs/Money.svelte';
import type IUimfApp from "./UimfApp";
import * as TreeViewSelector from '../Outputs/TreeViewSelector.svelte';
import * as NestedOutput from '../Outputs/NestedOutput.svelte';
import * as Tabs from '../Outputs/Tabs.svelte';
import * as Slider from '../Outputs/Slider.svelte';
import * as Number from '../Outputs/Number.svelte';
import * as Password from '../Inputs/Password.svelte';
import * as PreformattedText from '../Outputs/PreformattedText.svelte';
import * as Html from '../Outputs/Html.svelte';
import * as DateTimeOutput from '../Outputs/DateTime.svelte';
import * as EventDescription from '../Outputs/EventDescription.svelte';

//To be deactivated until complete validation
// import * as Typeahead from '../Inputs/Typeahead.svelte'
// import * as Table from '../Outputs/Table.svelte';
// import * as ObjectList from '../Outputs/ObjectList.svelte';
import * as FormLink from '../Outputs/FormLink.svelte';
// import * as ActionList from '../Outputs/ActionList.svelte';
// import * as MultiSelect from '../Inputs/Multiselect.svelte';
import * as Alert from '../Outputs/Alert.svelte';
// import * as Expandable from '../Outputs/Expandable.svelte';
import * as Icon from '../Outputs/Icon.svelte';
import * as Tag from '../Outputs/Tag.svelte';
// import * as Tuple from '../Outputs/Tuple.svelte';
import * as Link from '../Outputs/Link.svelte';
import * as Tabstrip from '../Outputs/Tabstrip.svelte';
// import * as Form from '../Outputs/InlineForm.svelte';
// import * as PaginatedData from '../Outputs/PaginatedData.svelte';
import * as Sequence from '../Outputs/Sequence.svelte';

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

    createInput(options: CreateInputOptions, renderTarget: HTMLElement) {
        const registration = this.inputs[options.metadata.Type];
        const controller = new registration.controller(options);

        return {
            target: renderTarget,
            controller: controller,
            component: new registration.component({
                target: renderTarget,
                props: {
                    controller: controller
                }
            })
        };
    };

    createOutput(
        options: CreateOutputOptions,
        renderTarget: HTMLElement) {
        const registration = this.outputs[options.metadata.Type];
        const controller = new OutputController<any>(options);

        return {
            target: renderTarget,
            controller: controller,
            component: new registration.component({
                target: renderTarget,
                props: {
                    controller: controller
                }
            })
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
defaultControlRegister.registerInputComponent('dropdown', Dropdown);
defaultControlRegister.registerInputComponent('rich-text-editor', RichTextEditor);
defaultControlRegister.registerInputComponent('array-input', ArrayInput);
defaultControlRegister.registerInputComponent('date-range', DateRange);
defaultControlRegister.registerInputComponent('consent', Consent);
defaultControlRegister.registerInputComponent('paginator', Paginator);
defaultControlRegister.registerInputComponent('password', Password);

// Outputs.
defaultControlRegister.registerOutputComponent('image-overlay', ImageOverlay);
defaultControlRegister.registerOutputComponent('state-diagram', StateDiagram);
defaultControlRegister.registerOutputComponent('image', OutputImage);
defaultControlRegister.registerOutputComponent('text', OutputText, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('paginated-object-list', PaginatedObjectList);
defaultControlRegister.registerOutputComponent('money', Money, { displayAsBlock: false });
defaultControlRegister.registerOutputComponent('tree-view-selector', TreeViewSelector);
defaultControlRegister.registerOutputComponent('nested-output', NestedOutput);
defaultControlRegister.registerOutputComponent('tabs', Tabs);
defaultControlRegister.registerOutputComponent('tabstrip', Tabstrip);
defaultControlRegister.registerOutputComponent('slider', Slider);
defaultControlRegister.registerOutputComponent('number', Number);
defaultControlRegister.registerOutputComponent('preformatted-text', PreformattedText);
defaultControlRegister.registerOutputComponent('html', Html);
defaultControlRegister.registerOutputComponent('datetime', DateTimeOutput);
defaultControlRegister.registerOutputComponent('event-description', EventDescription);
defaultControlRegister.registerOutputComponent('alert', Alert);
defaultControlRegister.registerOutputComponent('icon', Icon);
defaultControlRegister.registerOutputComponent('tag', Tag);
defaultControlRegister.registerOutputComponent('link', Link);
//defaultControlRegister.registerOutputComponent('formlink', FormLink, { displayAsBlock: false });

// To be deactivated until complete validation
// defaultControlRegister.registerOutputComponent('table', Table);
// defaultControlRegister.registerInputComponent('typeahead', Typeahead);
// defaultControlRegister.registerInputComponent('multiselect', MultiSelect);
// defaultControlRegister.registerOutputComponent('inline-form', Form);
// defaultControlRegister.registerOutputComponent('paginated-data', PaginatedData);
//defaultControlRegister.registerOutputComponent('sequence', Sequence);

//These components can only be enabled once we are using the new Form as they depend on each others
// defaultControlRegister.registerOutputComponent('action-list', ActionList);
// defaultControlRegister.registerOutputComponent('expandable', Expandable);
// defaultControlRegister.registerOutputComponent('object-list', ObjectList);
// defaultControlRegister.registerOutputComponent('tuple', Tuple);