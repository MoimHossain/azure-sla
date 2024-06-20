

const canvas = document.getElementById('drawingCanvas');

const ctx = canvas.getContext('2d');
const updateButton = document.getElementById('btn-update');

updateButton.addEventListener('click', async function () {
    const imageData = window.lastImage;
    if (!imageData) {
        alert('No image detected!');
        return;
    }

    $(updateButton).hide();
    $('#loading-spinner').show();


    try {
        const response = await fetch('/api/SLA', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: imageData
            })
        });

        if (response.ok) {
            const jsonResponse = await response.json();
            console.log(JSON.stringify(jsonResponse))
        } else {
            alert('Error: ' + response.statusText);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
    $(updateButton).show();
    $('#loading-spinner').hide();
});

window.addEventListener('paste', function (event) {
    // Prevent the default paste action
    event.preventDefault();

    // Get the clipboard items
    const items = event.clipboardData.items;

    // Loop through the clipboard items
    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Check if the clipboard item is an image
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            const reader = new FileReader();

            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    // Clear the canvas before drawing the new image
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // Draw the image onto the canvas
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.src = event.target.result;
                window.lastImage = img.src;
            };

            // Read the image file as a data URL
            reader.readAsDataURL(file);
            break;
        }
    }
});

function updateCompositeSla(data) {
    let totalSla = 1;

    data.forEach((groupItem, groupIndex) => {
        if (groupItem && groupItem.components) {
            let groupCompositeSla = 1;

            groupItem.components.forEach((component, index) => {
                groupCompositeSla *= ((100 - component.sla) / 100);
            });

            const groupSla = ((1 - groupCompositeSla) * 100);
            const inputId = getGroupSlaInputId(groupIndex);
            $(`#${inputId}`).val(getSLAString(groupSla));

            totalSla *= groupSla;
        }
    });
    
    let quantum = totalSla;
    for (let x = 0; x < data.length - 1; ++x) {
        quantum = quantum / 100;
    }
    $(`#txt-totalSLA`).val(getSLAString(quantum));
}

function getSLAString(value) {
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
    }

    // If no zero is encountered, return the original string
    return strValue;
}

function getGroupSlaInputId(groupIndex) {
    return `txt-${groupIndex}`;
}

function getGroupRegionCountId(groupIndex) {
    return `txt-region-${groupIndex}`;
}

function createDom(data) {
    const tbody = $('#servicesTable tbody');
    tbody.empty();
    data.forEach((groupItem, groupIndex) => {
        if (groupItem && groupItem.components) {
            const groupRow = $('<tr></tr>');
            groupRow.append(`<td colSpan="4">${groupItem.groupName}</td>`);
            tbody.append(groupRow);
            groupItem.components.forEach((component, index) => {
                const row = $('<tr></tr>');
                row.append(`<td>&nbsp;</td>`);
                row.append(`<td>${component.name}</td>`);
                row.append(`<td style="text-align: right;"><input class="sla-input" type="number" data-gid="${groupIndex}" data-cid="${index}" value="${component.sla}" />%</td>`);
                tbody.append(row);
            });

            const groupCompositeSlaRow = $('<tr class="group-sla-row"></tr>');
            const inputId = getGroupSlaInputId(groupIndex);
            const regionInputId = getGroupRegionCountId(groupIndex);     

            groupCompositeSlaRow.append(`<td colSpan="1"></td>`);
            groupCompositeSlaRow.append(`<td colSpan="1">Composite SLA (Region: <input class="region-sla-input" type="number" id="${regionInputId}" value="" />)</td>`);            
            groupCompositeSlaRow.append(`<td colSpan="2"  style="text-align: right;"><input readonly class="group-sla-input" type="number" id="${inputId}" value="" />%</td>`);
            tbody.append(groupCompositeSlaRow);
        }
    });
    const totalSlaRow = $('<tr class="total-sla-row"></tr>');
    totalSlaRow.append(`<td colSpan="1"></td>`);
    totalSlaRow.append(`<td colSpan="1">Total SLA</td>`);
    totalSlaRow.append(`<td colSpan="2" style="text-align: right;"><input readonly class="group-sla-input" type="number" id="txt-totalSLA" value="" />%</td>`);
    tbody.append(totalSlaRow);
}

function renderTable(data) {
    createDom(data);
    updateCompositeSla(data);
    
    $('.sla-input').on('input', function () {
        try {
            const groupIndex = $(this).data('gid');
            const componentIndex = $(this).data('cid');
            const newSlaValue = $(this).val();

            const component = data[groupIndex].components[componentIndex];
            component.sla = parseFloat(newSlaValue);
            updateCompositeSla(data);
        }
        catch (error) {
            console.error(error);
        }
    });
}


$(document).ready(function () {
    const services = [
        {
            "groupName": "GLOBAL",
            "components": [
                {
                    "name": "Azure Front Door",
                    "placement": "GLOBAL",
                    "stampName": "",
                    "tier": "Networking",
                    "type": "Front Door",
                    "count": 1,
                    "location": "Global",
                    "slaString": "",
                    "sla": 99.95
                }
            ]
        },
        {
            "groupName": "STAMP",
            "components": [
                {
                    "name": "Azure Application Gateway",
                    "placement": "STAMP",
                    "stampName": "Stamp A",
                    "tier": "Networking",
                    "type": "Application Gateway",
                    "count": 1,
                    "location": "Stamp A",
                    "slaString": "",
                    "sla": 0
                },
                {
                    "name": "AKS",
                    "placement": "STAMP",
                    "stampName": "Stamp A",
                    "tier": "Compute",
                    "type": "Azure Kubernetes Service",
                    "count": 1,
                    "location": "Stamp A",
                    "slaString": "",
                    "sla": 0
                },
                {
                    "name": "Service Bus",
                    "placement": "STAMP",
                    "stampName": "Stamp A",
                    "tier": "Messaging",
                    "type": "Service Bus",
                    "count": 1,
                    "location": "Stamp A",
                    "slaString": "",
                    "sla": 0
                },
                {
                    "name": "Azure Blob Storage",
                    "placement": "STAMP",
                    "stampName": "Stamp A",
                    "tier": "Storage",
                    "type": "Blob Storage",
                    "count": 1,
                    "location": "Stamp A",
                    "slaString": "",
                    "sla": 0
                }
            ]
        },
        {
            "groupName": "REGIONAL",
            "components": [
                {
                    "name": "Azure SQL Business Critical",
                    "placement": "REGIONAL",
                    "stampName": "",
                    "tier": "Data",
                    "type": "SQL Database",
                    "count": 1,
                    "location": "West Europe",
                    "slaString": "",
                    "sla": 99.99
                },
                {
                    "name": "Azure Storage Queue",
                    "placement": "REGIONAL",
                    "stampName": "",
                    "tier": "Data",
                    "type": "Storage",
                    "count": 1,
                    "location": "West Europe",
                    "slaString": "",
                    "sla": 99.9
                }
            ]
        }
    ];
    renderTable(services);

});