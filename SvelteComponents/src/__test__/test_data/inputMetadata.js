const testData = [
    {
        metadata: {
            Type: "text",
            Required: true,
            CustomProperties: {
                multiline: false
            }
        },
        value: "Across the Great Wall and we reach every corner of the world."
    },
    {
        metadata: {
            Type: "text",
            Required: true,
            CustomProperties: {
                multiline: false
            }
        },
        value: null
    },
    {
        metadata: {
            Type: "radio",
            Required: true,
            CustomProperties: {
                Options: [
                    {
                        Label: "A",
                        Value: 0
                    },
                    {
                        Label: "B",
                        Value: 1
                    }
                ]
            }
        },
        value: {
            Value: 0
        }
    },
    {
        metadata: {
            Type: "radio",
            Required: true,
            CustomProperties: {
                Options: [
                ]
            }
        },
        value: null
    },
    {
        metadata: {
            Type: "radio",
            Required: true,
            CustomProperties: {
                Options: [
                    {
                        Label: "A",
                        Value: 0
                    },
                    {
                        Label: "B",
                        Value: 1
                    }
                ]
            }
        },
        value: null
    },
    {
        metadata: {
            Type: "boolean",
            Required: true,
        },
        value: true
    },
    {
        metadata: {
            Type: "boolean",
            Required: true,
        },
        value: false
    },
    // {
    //     metadata: {
    //         Type: "datetime",
    //         Required: true,
    //     },
    //     value: '2023-5-15'
    // },
    {
        metadata: {
            Type: "datetime",
            Required: true,
        },
        value: null
    },
    {
        metadata: {
            Type: "file-upload",
            Required: true,
            CustomProperties: {
                NeedFileName: true
            }
        },
        value: null
    },
    {
        metadata: {
            Type: "number",
            Required: true,
        },
        value: null
    },
    {
        metadata: {
            Type: "number",
            Required: true,
        },
        value: 20
    },
    {
        metadata: {
            Type: "number",
            Required: true,
        },
        value: Infinity
    },
    {
        metadata: {
            Type: "number",
            Required: true,
        },
        value: -Infinity
    },
    {
        metadata: {
            Type: "number",
            Required: true,
        },
        value: 9.990123234
    },
    {
        metadata: {
            Type: "dropdown",
            Required: true,
            CustomProperties: {
                Items:
                    [
                        {
                            Label: "aaaaa",
                            Value: 0
                        },
                        {
                            Label: "bbbbb",
                            Value: 1
                        },
                        {
                            Label: "ccccc",
                            Value: 2
                        }
                    ]
            }
        },
        value: null
    },
    // {
    //     metadata: {
    //         Type: "dropdown",
    //         Required: true,
    //         CustomProperties: {
    //             Items:
    //                 [
    //                     {
    //                         Label: "aaaaa",
    //                         Value: "0"
    //                     },
    //                     {
    //                         Label: "bbbbb",
    //                         Value: "1"
    //                     },
    //                     {
    //                         Label: "ccccc",
    //                         Value: "2"
    //                     }
    //                 ]
    //         }
    //     },
    //     value: {
    //         Label: "aaaaa",
    //         Value: "0"
    //     }
    // },
    // {
    //     metadata: {
    //         Condition: {
    //             Required: true,
    //             CustomProperties: {
    //                 Options: [
    //                     { Label: "Readonly", Tooltip: "", Value: 0 },
    //                     { Label: "Not readonly", Tooltip: "", Value: 1 }
    //                 ]
    //             },
    //             Label: "Readonly option", Type: "radio"
    //         },
    //         Views: [
    //             {
    //                 Required: false,
    //                 CustomProperties: { showIfConditionIs: { SelectedValue: 1 } },
    //                 Id: "NotReadonly",
    //                 Label: "NotReadonly",
    //                 Type: "nested-input",
    //                 Properties: []
    //             },
    //             {
    //                 Required: false,
    //                 CustomProperties: { showIfConditionIs: { SelectedValue: 0 } },
    //                 Id: "Readonly",
    //                 Label: "Readonly",
    //                 Type: "nested-input",
    //                 Properties: [
    //                     {
    //                         Required: true,
    //                         CustomProperties: {
    //                             AcceptedFileTypes: "image/*, .docx, .excel, .pdf",
    //                             NeedFileName: true
    //                         },
    //                         Type: "file-upload",
    //                         Id: "FileUpload"
    //                     }
    //                 ]
    //             },
    //         ],
    //         Required: true,
    //         Id: "FieldValueConfig",
    //         Label: "Readonly configuration",
    //         Type: "conditional-input"
    //     },
    //     value: {
    //         Condition: {
    //             Value: 0
    //         },
    //         Readonly: {
    //             Value: {
    //                 FileUpload: {
    //                     Value: {
    //                         dataUrl: "aaaaa",
    //                         name: null,
    //                         fileName: null,
    //                         type: "image"
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // },
    {
        metadata: {
            Type: "nested-input",
            Properties: [
                {
                    Required: true,
                    Type: "text",
                    Id: "FileUpload"
                }
            ]
        },
        value: { Value: { FileUpload: null } }
    },
    {
        metadata: {
            Type: "nested-input",
            Properties: [
                {
                    Required: true,
                    CustomProperties: {
                        AcceptedFileTypes: "image/*, .docx, .excel, .pdf",
                        NeedFileName: true
                    },
                    Type: "text",
                    Id: "FileUpload"
                }
            ]
        },
        value: {
            Value: {
                FileUpload: "aaaaa"
            }
        }
    },
    {
        metadata: {
            Type: "nested-input",
            Properties: [
                {
                    Type: "boolean",
                    Id: "FileUpload"
                },
                {
                    Required: true,
                    CustomProperties: {
                        multiline: false
                    },
                    Type: "text",
                    Id: "TextBox"
                }
            ]
        },
        value: {
            Value: {
                FileUpload: null,
                TextBox: null
            }
        }
    },
    {
        metadata: {
            Type: "nested-input",
            Properties: [
                {
                    Required: true,
                    CustomProperties: {
                        multiline: false
                    },
                    Type: "text",
                    Id: "TextBox"
                }
            ]
        },
        value: {
            Value: {
                TextBox: "test"
            }
        }
    },
    {
        metadata: {
            Type: "nested-input",
            Properties: [
                {
                    Required: true,
                    CustomProperties: {
                        multiline: false
                    },
                    Type: "text",
                    Id: "TextBox"
                },
                {
                    Type: "nested-input",
                    Id: "AnotherNestedInput",
                    Properties: [
                        {
                            Required: true,
                            CustomProperties: {
                                multiline: false
                            },
                            Type: "text",
                            Id: "TextBox"
                        }
                    ]
                }
            ]
        },
        value: {
            Value: {
                TextBox: "test",
                AnotherNestedInput: {
                    Value: {
                        TextBox: "test",
                    }
                }
            }
        }
    },
    {
        metadata: {
            Type: "array-input",
            AllowNewItems: true,
            ItemMetadata: [{
                Type: "text",
                Required: true,
                CustomProperties: {
                    multiline: false
                },
                Id: "TextBox1"
            },
            {
                Type: "text",
                Required: true,
                CustomProperties: {
                    multiline: false
                },
                Id: "TextBox2"
            },
            ]
        },
        value: {
            Items: [{
                Header: "test header",
                Comment: "test comment",
                TextBox1: "aaaa",
                TextBox2: "bbbb",

            }]
        }
    },
    // { cannot test typeahead because form is only available from the server that requires login
    //     metadata: {
    //         Type: "typeahead",
    //         CustomProperties: {
    //             Source: "contracts"
    //         }
    //     },
    //     value: null
    // },
    {
        metadata: {
            Type: "password",
        },
        value: null
    },
    {
        metadata: {
            Type: "password",
        },
        value: "asdsdsdv"
    },
    {
        metadata: {
            Type: "rich-text-editor",
        },
        value: {
            Value: "<p>Hello rich text editor</p>"
        }
    },
    {
        metadata: {
            Type: "date-range",
        },
        value: {
            Min: new Date("2023-05-21"),
            Max: new Date("2023-06-21")
        }
    },
    {
        metadata: {
            Type: "date-range",
        },
        value: null
    },
    {
        metadata: {
            Type: "consent",
            Explanation: ""
        },
        value: null
    },
    {
        metadata: {
            Type: "consent",
            Explanation: "Some explanations"
        },
        value: {
            Consented: false
        }
    },

]

module.exports = testData;