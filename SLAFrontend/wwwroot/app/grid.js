Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.form.field.Number',
    'Ext.form.field.Date',
    'Ext.tip.QuickTipManager'
]);

var dataXXX = [
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
        { name: 'regionCount', type: 'int' },
        { name: 'included', type: 'boolean' }
    ]
});

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
    getGroupRegionCount: function (groupName) {
        // create a const key for the group name that has not whitespeace in it
        const key = groupName.trim().replace(/\s/g, '-');

        // chek if 'this' has a property called 'regionCountMap'
        // if not create an empty object
        // then with in that object if there is map for the given group name
        // if not then return 1
        // else return the value of the map
        if (!this.regionCountMap) {
            this.regionCountMap = {};
        }
        if (!this.regionCountMap[key]) {
            return 1;
        }
        return this.regionCountMap[key];
    },
    setGroupRegionCount: function (groupName, value) {
        // create a const key for the group name that has not whitespeace in it
        const key = groupName.trim().replace(/\s/g, '-');
        // chek if 'this' has a property called 'regionCountMap'
        // if not create an empty object
        // then with in that object set the value of the map for the given group name
        if (!this.regionCountMap) {
            this.regionCountMap = {};
        }
        this.regionCountMap[key] = value;
    },
    getDistinctGroupNames: function () {
        const store = this.getStore();
        const recordsCount = store.getCount();
        const distrinctGroupNames = [];
        for (let i = 0; i < recordsCount; i++) {
            const record = store.getAt(i);
            record.commit();
            const groupName = record.get('groupName');
            if (distrinctGroupNames.indexOf(groupName) === -1) {
                distrinctGroupNames.push(groupName);
            }
        }
        return distrinctGroupNames;
    },
    getRecordsByGroupName: function (groupName) {
        const store = this.getStore();
        const recordsCount = store.getCount();
        const records = [];
        for (let i = 0; i < recordsCount; i++) {
            const record = store.getAt(i);
            const recordGroupName = record.get('groupName');
            if (recordGroupName === groupName && record.get('included') === true) {
                records.push(record);
            }
        }
        return records;
    },
    updateSlas: function (force) {
        if (force === true) {

            const store = this.getStore();
            const recordsCount = store.getCount();
            const dataSet = [];
            for (let i = 0; i < recordsCount; i++) {
                const record = store.getAt(i);
                dataSet.push(record.data);
            }
            console.log(dataSet);
            store.removeAll();

            setTimeout(() => {
                store.loadData(dataSet);
                //this.updateSlas(false);                
            }, 100);
            //return;
        }
    },
    updateGrandTotalSla: function (value) {
        const SLACache = this.groupSlaCache;
        const groupName = value.groupName;
        const sla = value.sla;
        const atleastOneIncluded = value.atleastOneIncluded;

        const cacheItem = SLACache.find(c => c.groupName === groupName);
        if (cacheItem) {
            cacheItem.sla = sla;
            cacheItem.atleastOneIncluded = atleastOneIncluded;
        } else {
            SLACache.push({ groupName: groupName, sla: sla, atleastOneIncluded: atleastOneIncluded });
        }
        let totalSla = 1;
        let totalIncluded = 0;
        for (let i = 0; i < SLACache.length; i++) {
            const item = SLACache[i];
            if (item.atleastOneIncluded === true) {
                ++totalIncluded;
                totalSla *= item.sla;
            }
        }        
        let quantum = totalSla;
        for (let x = 0; x < totalIncluded - 1; ++x) {
            quantum = quantum / 100;
        }        
        const grandTotalSlaString = this.getSLAString(quantum);
        Ext.getCmp('grandTotalSla').update(`${grandTotalSlaString}%`);
    },
    loadNewSlaData: function (data) {
        let componentId = 1;
        const refinedComponents = [];
        for (let i = 0; i < data.length; i++) {
            const components = data[i].components;
            const groupName = data[i].groupName;
            for (let j = 0; j < components.length; j++) {
                const component = components[j];
                refinedComponents.push({
                    included: true,
                    regionCount: 1,
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
    getSLAString: function (value) {
        // Convert the input value to a string
        let strValue = value.toString();
        // Find the position of the decimal point
        let decimalPos = strValue.indexOf('.');
        // If there is no decimal point, return the value as is
        if (decimalPos === -1) {
            return strValue;
        }
        // Traverse the string starting from the character after the decimal point
        for (let i = decimalPos + 1; i < strValue.length; i++) {
            // Check if the character is '0'            
            if (strValue[i] === '0') {
                // Return the substring up to the position of the first '0'
                return strValue.substring(0, i);
            }

            if (i > decimalPos + 2) {
                const currentDigit = parseInt(strValue[i]);
                const previousDigit = parseInt(strValue[i - 1]);
                if (currentDigit === 9 && previousDigit < 9) {
                    return strValue.substring(0, i);
                }
            }

            if ((i - (decimalPos + 1)) > 8) {
                // when there are more than 8 digits after the decimal point return the string
                return strValue.substring(0, i);
            }
        }
        return strValue;
    },
    listeners: {
        afterrender: function (grid) {
            const gridEl = grid.getEl();
            gridEl.dom.addEventListener('input', function (event) {
                if (event.target
                    && event.target.nodeName === 'INPUT'
                    && event.target.classList.contains('region-sla-input')) {

                    console.log('Input value changed to:', event.target.value);
                    console.log('Input Event Group:', event.target.dataset.group);

                    const groupName = event.target.dataset.group;
                    const value = event.target.value;
                    grid.setGroupRegionCount(groupName, value);

                    grid.getView().refresh();
                }
            });
        }
    },
    initComponent: function () {
        const GRID = this;
        this.cellEditing = new Ext.grid.plugin.CellEditing({
            clicksToEdit: 1,
            listeners: {
                beforeedit: function (editor, e) {
                    const record = e.record;
                    Ext.apply(GRID.groupCombo, {
                        activeRecord: record
                    });
                }
            }
        });

        Ext.apply(this, {
            groupSlaCache: [],
            groupStore: Ext.create('Ext.data.Store', {
                fields: ['groupName'],
                data: [],
                addNewGroup: function (groupName) {
                    const groupNames = this.data.items.map(g => g.data.groupName);
                    if (groupNames.indexOf(groupName) > -1) {
                        return false;
                    }
                    this.add({ groupName: groupName });
                    return true;
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
                listeners: {
                    scope: this,
                    blur: (combo, eOpts) => {
                        let rawValue = combo.getRawValue();
                        rawValue = rawValue.trim().replace(/\s/g, '-');
                        if (rawValue.length <= 0) {
                            rawValue = 'Untitled';
                        }
                        if (rawValue && rawValue.trim().length > 0) {
                            combo.setValue(rawValue);
                            const newGroupAdded = this.groupStore.addNewGroup(rawValue.trim());
                            if (combo.activeRecord) {
                                combo.activeRecord.set('groupName', rawValue);
                                GRID.updateSlas(true);
                            }
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
            tbar: [{
                xtype: 'button',
                iconCls: 'fa fa-calculator',
                text: 'Calculate SLA',                
                scale: 'medium',
                handler: async () => {
                    let imageSnapShot = null;
                    try {
                        const lcCanvas = window.lc.getImage();
                        imageSnapShot = lcCanvas.toDataURL();
                        console.log('Image Snap Shot:', imageSnapShot);
                    } catch (error) {                        
                        Ext.Msg.show({
                            title: 'Error',
                            msg: `Please draw solution diagram, or paste (Ctrl+v) an image of diagram on canvas.<br/>${error.message}`,
                            buttons: Ext.Msg.OK,
                            icon: Ext.Msg.ERROR
                        });
                        return;
                    }

                    Ext.Msg.show({
                        msg: 'Analyzing diagram, please wait...',
                        progressText: 'Analyzing...',
                        width: 300,
                        wait: true,
                        waitConfig: { interval: 200 },
                        icon: 'ext-mb-download', 
                        iconHeight: 50
                    });

                    try {
                        const auth0Client = GRID.auth0Client;
                        const userProfile = await auth0Client.getUser();
                        const accessToken = await auth0Client.getTokenSilently();

                        GRID.loadNewSlaData([]);

                        const response = await fetch('/api/SLA', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`
                            },
                            body: JSON.stringify({
                                image: imageSnapShot
                            })
                        });
                        Ext.MessageBox.hide();
                        if (response.ok) {
                            const services = await response.json();                            
                            console.log(services);
                            GRID.loadNewSlaData(services);                            
                        } else {
                            Ext.Msg.show({
                                title: 'Error',
                                msg: response.statusText,
                                buttons: Ext.Msg.OK,
                                icon: Ext.Msg.ERROR
                            });
                        }
                    } catch (error) {
                        Ext.MessageBox.hide();
                        // show the error using extjs error message box
                        Ext.Msg.show({
                            title: 'Error',
                            msg: error.message,
                            buttons: Ext.Msg.OK,
                            icon: Ext.Msg.ERROR
                        });
                    }
                }
            }],
            fbar: Ext.create('Ext.container.Container', {
                frame: false,
                height: 60,
                cls: 'sla-footer',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: [{
                    xtype: 'container',
                    padding: '10 0 0 10',
                    html: '<b>Total SLA</b>',
                    flex: 1
                }, {
                    xtype: 'container',
                    padding: '8 6 0 0',
                    align: 'right',
                    id: 'grandTotalSla',
                    flex: 0.4
                }]
            }),
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
                hideable: false,
                sortable: false,
                width: 60
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
                width: 120,
                hideable: false,
                sortable: false,
                dataIndex: 'groupName',
                editor: this.groupCombo
            }, {
                text: 'Region',
                width: 60,
                hideable: false,
                sortable: false,
                groupable: false,
                align: 'right',
                editor: {
                    allowBlank: false
                },
                renderer: function (value, metaData, record, rowIdx, colIdx, store, view) {
                    return '';
                },
                summaryType: function (records) {
                    return records;
                },
                summaryRenderer: function (records) {
                    if (records && records.length > 0) {
                        const groupName = records[0].get('groupName');
                        const regionCount = GRID.getGroupRegionCount(groupName);
                        return `<input class="region-sla-input" type="number" data-group="${groupName}" min="1" max="10" value="${regionCount}" />`;
                    }
                    return '';
                },
                dataIndex: 'regionCount'
            }, {
                text: 'SLA (%)',
                width: 140,
                hideable: false,
                sortable: false,
                groupable: false,
                align: 'right',
                editor: {
                    allowBlank: false
                },
                field: {
                    xtype: 'numberfield',
                    maxValue: 100,
                    minValue: 0
                },
                renderer: function (value, metaData, record, rowIdx, colIdx, store, view) {
                    return GRID.getSLAString(value) + ' %';
                },
                summaryType: function (records) {
                    let groupName = 'Untitled';
                    let calculatedGroupSLA = 0;
                    let atleastOneIncluded = false;

                    if (records.length > 0) {
                        groupName = records[0].get('groupName');
                        let groupCompositeSla = 1;
                        for (let j = 0; j < records.length; j++) {
                            const record = records[j];
                            const included = record.get('included');
                            const sla = record.get('sla');
                            if (included === true) {
                                atleastOneIncluded = true;
                                groupCompositeSla *= ((100 - sla) / 100);
                            }
                        }
                        let groupSla = ((1 - groupCompositeSla) * 100);
                        const regionCount = GRID.getGroupRegionCount(groupName);
                        if (regionCount > 1) {
                            const slaWithRegionalRedundancy = (1 - Math.pow((1 - (groupSla / 100)), regionCount)) * 100;
                            groupSla = slaWithRegionalRedundancy;
                        }
                        calculatedGroupSLA = groupSla;
                    }
                    return { groupName: groupName, sla: calculatedGroupSLA, atleastOneIncluded: atleastOneIncluded };
                },
                summaryRenderer: function (value, summaryData, dataIndex) {
                    GRID.updateGrandTotalSla(value);
                    return `<b>${GRID.getSLAString(value.sla)}%</b>`;
                },
                dataIndex: 'sla'
            }]
        });
        this.callParent();
        //setTimeout(() => {
        //    this.loadNewSlaData(dataXXX);
        //}, 200);
    }
});

