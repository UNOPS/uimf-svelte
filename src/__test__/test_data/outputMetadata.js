const testData = [
    {
        metadata: {
            Type: "text"
        },
        values: [
            "Across the Great Wall and we reach every corner of the world.",
            "Beyond the Great Wall and we reach every corner of the world"
        ]
    },
    {
        metadata: {
            Type: "number"
        },
        values: [
            null,
            1,
            3.5
        ]
    },
    {
        metadata: {
            Type: "preformatted-text"
        },
        values: [
            null,
            {
                Text: null
            }, {
                Text: "This is a preformatted text"
            }
        ]
    },
    {
        metadata: {
            Type: "image"
        },
        values: [
            {
                Source: "https://upload.wikimedia.org/wikipedia/en/thumb/b/bd/Doraemon_character.png/220px-Doraemon_character.png",
                MaxWidth: "100%"
            },
            {
                Source: "https://static.wikia.nocookie.net/doraemon/images/0/06/Doraemon_%281979%29_-_Rotate_1.png/revision/latest?cb=20180623010152&path-prefix=en",
                MaxWidth: "50%"
            },
            {
                Source: null,
                MaxWidth: null
            },
            {
                Source: null,
                MaxWidth: "100%"
            }
        ],
    },
    // Will not do unit test for state diagram for now because Panzoom requires an element to be actually rendered in DOM
    // {
    //     metadata: {
    //         Type: "state-diagram",
    //         Required: true,
    //     },
    //     value: {
    //         States: [
    //             {
    //                 Id: 0,
    //                 Name: "A"
    //             },
    //             {
    //                 Id: 1,
    //                 Name: "B"
    //             },
    //             {
    //                 Id: 2,
    //                 Name: "C"
    //             }
    //         ],
    //         Transitions: [
    //             {
    //                 From: 0,
    //                 To: 1,
    //                 Name: "A to B",
    //                 Position: null
    //             },
    //             {
    //                 From: 1,
    //                 To: 2,
    //                 Name: "B to C",
    //                 Position: null
    //             },
    //             {
    //                 From: 2,
    //                 To: 1,
    //                 Name: "B to A",
    //                 Position: null
    //             }
    //         ],
    //         CurrentStateId: 0
    //     },
    //     anotherValue: null
    // },
    {
        metadata: {
            Type: "money"
        },
        values: [{
            RoeDate: "2021-01-01T00:00:00.000Z",
            Amount: 25,
            Currency: "USD",
            Precision: 2,
            Components: [
                {
                    Amount: 12,
                    Currency: "USD"
                }
            ]
        },
        {
            RoeDate: "2021-01-01T00:00:00.000Z",
            Amount: 25,
            Currency: "USD",
            Precision: 2,
            Components: [
                {
                    Amount: 12,
                    Currency: "USD"
                }
            ]
        },
        {
            RoeDate: "2021-01-01T00:00:00.000Z",
            Amount: 77.99283729221,
            Currency: "JPY",
            Precision: 4,
            Components: [
            ]
        }]
    },
    {
        metadata: {
            Type: "formlink",
            disabled: false
        },
        values: [{
            Label: "ssss",
            Form: "contracts"
        }]
    },
    {
        metadata: {
            Type: "action-list"
        },
        values: [{
            Actions: [
                {
                    metadata: {
                        Type: "formlink",
                        Required: true,
                        disabled: false
                    },
                    value: null
                },
                {
                    metadata: {
                        Type: "formlink",
                        Required: true,
                        disabled: false
                    },
                    value: {
                        Label: "ssss",
                        Form: "contracts"
                    }
                },
            ]
        }]
    },
    {
        metadata: {
            Type: "alert"
        },
        values: [{
            Icon: null,
            Text: "This is an alert",
            CssClass: ""
        }]
    },
    {
        metadata: {
            Type: "icon"
        },
        values: [
            null, {
                Name: "aaaaa",
                Tooltip: null
            },
            {
                Name: "aaaaa",
                Tooltip: "tooltip"
            }]
    },
    {
        metadata: { Type: "html" },
        values: [
            { Value: null },
            { Value: "<span>hello</span>" }
        ]
    },
    {
        metadata: {
            Type: "nested-output",
            CustomProperties: {
                Properties: [
                    {
                        Id: "A",
                        Type: "text",
                    }
                ]
            }
        },
        values: [{
            Value: {
                A: "some text"
            }
        }]
    },
    {
        metadata: {
            Type: "expandable",
            CustomProperties: {
                ItemTypes: [
                    {
                        Type: "text",
                    },
                    {
                        Type: "text",
                    }
                ]
            }
        },
        values: [
            {
                ShowButton: false,
                toggle: null,
                Visible: {
                    Value: "aaaaa"
                },
                Hidden: {
                    Value: "bbbbb"
                }
            }]
    },
    {
        metadata: {
            Type: "icon",
        },
        values: [
            null,
            {
                Icon: null,
                Text: "",
                CssClass: ""
            },
            {
                Icon: "null",
                Text: "aaaaa",
                CssClass: "aaaaa"
            }]
    },
    {
        metadata: {
            Type: "tag",
        },
        values: [
            null,
            {
                Color: "",
                Tooltip: null,
                Label: "aaa"
            }]
    },
    {
        metadata: {
            Type: "tuple",
            CustomProperties: {
                ItemTypes:[
                    {
                        Type: "text",
                    },
                    {
                        Type: "number",
                    }
                ]
            }
        },
        values: [
            {
                'm_Item1': null,
                'm_Item2': null
            },
            {
                'm_Item1': "aaa",
                'm_Item2': 12345
            }]
    },
    {
        metadata: { Type: "tree-view-selector" },
        values: 
             [
                {
                    Url: "#/form/public-products?Category=catalog-1258",
                    Id: 1258,
                    Name: "Motor Vehicles",
                    Children: [
                        {
                            Url: "#/form/public-products?Category=category-1681",
                            Id: 1681,
                            Name: "Sedans",
                            Children: []
                        },
                        {
                            Url: "#/form/public-products?Category=category-1682",
                            Id: 1682,
                            Name: "Trucks",
                            Children: []
                        }
                    ]
                }
            ]

    },
    {
        metadata: {
            Type: "slider", CustomProperties: {
                ItemTypes:
                {
                    Type: "image",
                }
            }
        },
        values: [
            {
                Items: [
                    {
                        m_Item1:
                        {
                            Source: "https://martinfowler.com/articles/bottlenecks-of-scaleups/observability-communication-anti-patterns.png",
                            MaxWidth: "80%"
                        },
                        m_Item2:
                        {
                            Source: "https://martinfowler.com/articles/bottlenecks-of-scaleups/observability-communication-anti-patterns.png",
                            MaxWidth: "50%"
                        }
                    },
                    {
                        m_Item1:
                        {
                            Source: "/api/photo/get/ee5d039a-8c01-43dc-a8b2-05e961e99a0b",
                            MaxWidth: "70%"
                        },
                        m_Item2:
                        {
                            Source: "/api/photo/get/ee5d039a-8c01-43dc-a8b2-05e961e99a0b",
                            MaxWidth: "50%"
                        }
                    }]
            }
        ]

    },
    {
        metadata: {
            Type: "image-overlay"
        },
        values: [
            {
                Items:
                {
                    Results: [
                        {
                            Description1: null,
                            Description2: null,
                            InnerContent:
                                [
                                    "Supplier: Toyota",
                                    "Brand: qui",
                                    "Moq: 9",
                                    "Delivery terms: CFR Peking CHN",
                                    "Production time: 44 days"],
                            InnerTitle: "Fish",
                            MaxWidth: "100%",
                            Source: "https://testext.unwebbuyplus.org/Images/no-image-thumbnail.jpeg",
                            Title: "Fish",
                            Url: "../#/form/public-product-overview?Id=2567"
                        }, {
                            Description1: null,
                            Description2: null,
                            InnerContent:
                                [
                                    "Supplier: Toyota",
                                    "Brand: qui",
                                    "Moq: 9",
                                    "Delivery terms: CFR Peking CHN",
                                    "Production time: 44 days"],
                            InnerTitle: "Fish",
                            MaxWidth: "100%",
                            Source: "https://testext.unwebbuyplus.org/Images/no-image-thumbnail.jpeg",
                            Title: "Fish",
                            Url: "../#/form/public-product-overview?Id=2567"
                        }],
                    TotalCount: 7
                }
            }
        ],
    },
]

module.exports = testData;