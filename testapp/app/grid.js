Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.form.field.Number',
    'Ext.form.field.Date',
    'Ext.tip.QuickTipManager'
]);

Ext.define('Ext.ux.CheckColumn', {
    extend: 'Ext.grid.column.Column',
    alias: 'widget.checkcolumn',

    constructor: function () {
        this.addEvents(
            /**
             * @event checkchange
             * Fires when the checked state of a row changes
             * @param {Ext.ux.CheckColumn} this
             * @param {Number} rowIndex The row index
             * @param {Boolean} checked True if the box is checked
             */
            'checkchange'
        );
        this.callParent(arguments);
    },

    /**
     * @private
     * Process and refire events routed from the GridView's processEvent method.
     */
    processEvent: function (type, view, cell, recordIndex, cellIndex, e) {
        if (type == 'mousedown' || (type == 'keydown' && (e.getKey() == e.ENTER || e.getKey() == e.SPACE))) {
            var record = view.panel.store.getAt(recordIndex),
                dataIndex = this.dataIndex,
                checked = !record.get(dataIndex);

            record.set(dataIndex, checked);
            this.fireEvent('checkchange', this, recordIndex, checked);
            // cancel selection.
            return false;
        } else {
            return this.callParent(arguments);
        }
    },

    // Note: class names are not placed on the prototype bc renderer scope
    // is not in the header.
    renderer: function (value) {
        var cssPrefix = Ext.baseCSSPrefix,
            cls = [cssPrefix + 'grid-checkheader'];

        if (value) {
            cls.push(cssPrefix + 'grid-checkheader-checked');
        }
        return '<div class="' + cls.join(' ') + '">&#160;</div>';
    }
});



Ext.define('Component', {
    extend: 'Ext.data.Model',
    idProperty: 'componentId',
    fields: [
        { name: 'componentId', type: 'string' },
        { name: 'groupName', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'placement', type: 'string' },
        { name: 'stampName', type: 'string' },
        { name: 'tier', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'sla', type: 'float' },
        { name: 'included', type: 'boolean' }
    ]
});

var data = [
    {
        "groupName": "Global",
        "components": [
            {
                "name": "Azure Front Door",
                "placement": "GLOBAL",
                "stampName": "Global",
                "tier": "Networking",
                "type": "Front Door",
                "count": 1,
                "location": "Global",
                "slaString": "",
                "sla": 99.99
            }
        ]
    },
    {
        "groupName": "Web",
        "components": [
            {
                "name": "Azure App Service",
                "placement": "Group",
                "stampName": "Web",
                "tier": "Compute",
                "type": "App Service",
                "count": 1,
                "location": "West Europe",
                "slaString": "",
                "sla": 99.95
            }
        ]
    },
    {
        "groupName": "Database",
        "components": [
            {
                "name": "Azure SQL Database",
                "placement": "STAMP",
                "stampName": "Database",
                "tier": "Storage",
                "type": "SQL Database",
                "count": 1,
                "location": "West Europe",
                "slaString": "",
                "sla": 99.99
            },
            {
                "name": "Azure Storage Queue",
                "placement": "STAMP",
                "stampName": "Database",
                "tier": "Messaging",
                "type": "Storage Queue",
                "count": 1,
                "location": "West Europe",
                "slaString": "",
                "sla": 99.9
            }
        ]
    }
];




var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
    clicksToEdit: 1
});
var showSummary = true;

Ext.define('KitchenSink.view.grid.GroupedGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'grouped-grid',
    requires: [
        'Ext.grid.feature.Grouping'
    ],
    collapsible: true,
    frame: true,
    minHeight: 200,
    resizable: true,

    features: [{
        id: 'group',
        ftype: 'groupingsummary',
        groupHeaderTpl: '{columnName}: {name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})',
        hideGroupedHeader: true,
        startCollapsed: false,
        enableGroupingMenu: false
    }],
    loadNewSlaData: function () {
        let componentId = 1;
        const refinedComponents = [];
        for (let i = 0; i < data.length; i++) {
            const components = data[i].components;
            const groupName = data[i].groupName;
            for (let j = 0; j < components.length; j++) {
                const component = components[j];
                refinedComponents.push({
                    included: true,
                    componentId: componentId++,
                    groupName: groupName,
                    name: component.name,
                    placement: component.placement,
                    stampName: component.stampName,
                    tier: component.tier,
                    type: component.type,
                    sla: component.sla
                });
            }
        }

        const store = this.getStore();
        store.removeAll();
        store.loadData(refinedComponents);

        // get the unique groupNames from the refinedComponents
        // and construct an array that has [{ groupName: 'gp name'}]
        const groupNames = refinedComponents.map(c => c.groupName);
        const uniqueGroupNames = groupNames.filter((v, i, a) => a.indexOf(v) === i);
        const groupStore = this.groupStore;
        groupStore.removeAll();
        groupStore.loadData(uniqueGroupNames.map(gn => ({ groupName: gn })));




    },
    initComponent: function () {
        this.cellEditing = new Ext.grid.plugin.CellEditing({
            clicksToEdit: 1
        });

        Ext.apply(this, {
            groupStore: Ext.create('Ext.data.Store', {
                fields: ['groupName'],
                data: [],
                addNewGroup: function (groupName) {
                    // check if the groupName already exists
                    const groupNames = this.data.items.map(g => g.data.groupName);
                    if (groupNames.indexOf(groupName) > -1) {
                        return;
                    }
                    this.add({ groupName: groupName });
                }
            })
        });
        Ext.apply(this, {
            groupCombo: Ext.create('Ext.form.ComboBox', {
                store: this.groupStore,
                queryMode: 'local',
                typeAhead: true,
                triggerAction: 'all',
                selectOnTab: true,
                lazyRender: true,
                listeners:{
                    scope: this,
                    blur: ( combo, eOpts ) => {
                        // get the value from the raw input text
                        const rawValue = combo.getRawValue();
                        console.log('blur', rawValue);
                        if(rawValue && rawValue.trim().length > 0){
                            this.groupStore.addNewGroup(rawValue.trim());
                        }

                    },
                    select: (combo, records, eOpts) => {
                        console.log('selected', records[0].data.groupName);


                    }
                },
                listClass: 'x-combo-list-small',
                displayField: 'groupName',
                valueField: 'groupName'
            })
        });

        Ext.apply(this, {
            fbar:
            {
                xtype: 'panel',
                frame: false,
                height: 60,
                html: '<div>THIS IS A GAGA</div>'
            },
            plugins: [this.cellEditing],
            store: new Ext.data.Store({
                model: 'Component',
                data: [],
                groupField: 'groupName'
            }),
            columns: [{
                text: 'Group',
                flex: 1,
                hideable: false,
                sortable: false,
                dataIndex: 'groupName'
            }, {
                xtype: 'checkcolumn',
                header: 'Include',
                dataIndex: 'included',
                width: 55
            }, {
                text: 'Azure Resource',
                flex: 0.7,
                hideable: false,
                sortable: false,
                groupable: false,

                renderer: function (value, metaData, record, rowIdx, colIdx, store, view) {
                    return `${value} (${record.data.tier})`;
                },
                dataIndex: 'name',
                summaryType: 'count',
                summaryRenderer: function (value, summaryData, dataIndex) {
                    return 'Composite SLA';
                }
            }, {
                text: 'Resiliency Unit',
                flex: 0.4,
                hideable: false,
                sortable: false,
                dataIndex: 'groupName',
                editor: this.groupCombo
            }, {
                text: 'SLA (%)',
                flex: 0.2,
                hideable: false,
                sortable: false,
                groupable: false,
                align: 'right',
                editor: {
                    allowBlank: false
                },
                field: {
                    xtype: 'numberfield'
                },
                renderer: function (value, metaData, record, rowIdx, colIdx, store, view) {
                    return value + ' %';
                },
                summaryType: 'count',
                summaryRenderer: function (value, summaryData, dataIndex) {
                    return '<b>99.9%</b>';
                },
                dataIndex: 'sla'
            }]
        });
        this.callParent();
        setTimeout(() => {
            this.loadNewSlaData();
        }, 200);
    }
});

