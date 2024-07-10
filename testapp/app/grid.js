Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.form.field.Number',
    'Ext.form.field.Date',
    'Ext.tip.QuickTipManager'
]);

Ext.define('Component', {
    extend: 'Ext.data.Model',
    idProperty: 'componentId',
    fields: [
        {name: 'componentId', type: 'string'},
        {name: 'groupName', type: 'string'},
        {name: 'name', type: 'string'},
        {name: 'placement', type: 'string'},
        {name: 'stampName', type: 'string'},
        {name: 'tier', type: 'string'},
        {name: 'type', type: 'string'},        
        {name: 'sla', type: 'float'}
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
        ftype: 'grouping',
        groupHeaderTpl: '{columnName}: {name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})',
        hideGroupedHeader: true,
        startCollapsed: false,
        id: 'serverGrouping'
    }],
    loadNewSlaData: function() {
        let componentId = 1;
        const refinedComponents = [];
        for (let i = 0; i < data.length; i++) {
            const components = data[i].components;
            const groupName = data[i].groupName;
            for (let j = 0; j < components.length; j++) {
                const component = components[j];
                refinedComponents.push({
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
        this.groupingFeature = this.view.getFeature('serverGrouping');
    },
    initComponent: function() {
        this.cellEditing = new Ext.grid.plugin.CellEditing({
            clicksToEdit: 1
        });

        Ext.apply(this, {
            plugins: [this.cellEditing],
            store:  new Ext.data.Store({
                model: 'Component',                
                data: [],
                groupField: 'groupName'
            }),
            columns: [{
                text: 'Group',
                flex: 1,
                dataIndex: 'groupName'
            },{
                text: 'name',
                flex: 1,
                editor: {
                    allowBlank: false
                },
                dataIndex: 'name'
            },{
                text: 'Sla',
                flex: 1,
                editor: {
                    allowBlank: false
                },
                dataIndex: 'sla'
            }]
        });
        this.callParent();
        setTimeout(() => {
            this.loadNewSlaData();
        }, 2000);
    }
});

