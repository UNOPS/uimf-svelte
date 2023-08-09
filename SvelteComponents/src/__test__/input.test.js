// @ts-nocheck
require("../../build/bundle");
const componentTestMetadata = require("./test_data/inputMetadata");

const SvelteComponents = window.SvelteComponents;

for (let testData of componentTestMetadata) {
    let tester = SvelteComponents.controlRegister.createInput(
        testData.metadata,
        null,
        null,
        null,
        document.createElement('div'));

    test(`${testData.metadata.Type}: element showing up`, () => {
        expect(tester.target).not.toBeNull();
    });

    test(`${testData.metadata.Type}: get value and set value`, () => {
        return tester.controller.setValue(testData.value).then(() => {
            tester.controller.getValue().then((v) => {
                expect(v).toStrictEqual(testData.value);
            })
        })
    });

    test(`${testData.metadata.Type}: serialize and deserialize`, () => {
        return tester.controller.deserialize(tester.controller.serialize(testData.value)).then((v) => {
            expect(v).toStrictEqual(testData.value);
        })
    });
}

