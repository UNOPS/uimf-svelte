// @ts-nocheck
require("../../build/bundle");
const componentTestMetadata = require("./test_data/outputMetadata");

const SvelteComponents = window.SvelteComponents;

function createComponent(metadata, value) {
    // Remove eveything from the body.
    var div = document.createElement("div");
    document.body.appendChild(div);

    // Append the component to the body.
    return SvelteComponents.controlRegister.createOutput(
        metadata,
        value,
        null,
        null,
        div);
}

for (let testData of componentTestMetadata) {
    if (SvelteComponents.controlRegister.outputs[testData.metadata.Type] == null) {
        // The component is not registered in the control register,
        // so we don't need to test it.
        continue;
    }

    describe(`output/${testData.metadata.Type}`, () => {
        const metadata = testData.metadata;

        let component = createComponent(metadata, null);

        test(`initialize to a null value`, () => {
            expect(component.controller.value).toStrictEqual(null);
        });

        for (let i = 0; i < testData.values.length; ++i) {
            describe(`value[${i}]`, () => {
                const value = testData.values[i];

                test(`setValue(value)`, () => {
                    component.controller.setValue(value);

                    // Should be appended to DOM.
                    expect(component.target.hasChildNodes).toBeTruthy();

                    // Value should be set.
                    expect(component.controller.value).toStrictEqual(value);
                });

                test(`setValue(null)`, () => {
                    component.controller.setValue(null);
                    expect(component.controller.value).toStrictEqual(null);
                });
            })
        }
    });
}

