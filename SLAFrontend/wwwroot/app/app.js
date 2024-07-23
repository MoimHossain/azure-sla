
Ext.require([
    'Ext.tip.QuickTipManager'
]);

const resizeImage = (image, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        image.onload = () => {
            let width = image.width;
            let height = image.height;

            // Calculate new dimensions while maintaining aspect ratio
            if (width > maxWidth || height > maxHeight) {
                if (width / maxWidth > height / maxHeight) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                } else {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(image, 0, 0, width, height);
            const resizedImageUrl = canvas.toDataURL('image/png');
            const resizedImage = new Image();

            resizedImage.onload = () => {
                resolve(resizedImage);
            };

            resizedImage.onerror = (err) => {
                reject(err);
            };

            resizedImage.src = resizedImageUrl;
        };

        image.onerror = (err) => {
            reject(err);
        };
        // Trigger image load
        image.src = image.src;
    });
}


Ext.onReady(async function () {
    Ext.tip.QuickTipManager.init();

    const auth0Client = await auth0.createAuth0Client({
        domain: "cloudoven.eu.auth0.com",
        clientId: "6go82kJxDqiMS1kWDAFL1HWmPVqVn7dI",
        useRefreshTokens: false,
        authorizationParams: {
            redirect_uri: window.location.origin,
            audience: "https://sla.octo-lamp.nl/"
        }
    });

    if (location.search.includes("state=") &&
        (location.search.includes("code=") ||
            location.search.includes("error="))) {
        await auth0Client.handleRedirectCallback();
        window.history.replaceState({}, document.title, "/");
    }

    const isAuthenticated = await auth0Client.isAuthenticated();
    if (isAuthenticated !== true) {
        auth0Client.loginWithRedirect();
        return;
    }


    Ext.create('Ext.container.Viewport', {
        layout: 'border',

        items: [{
            region: 'center',
            collapsible: false,
            xtype: 'grouped-grid',
            auth0Client: auth0Client
        }, {
            region: 'north',
            cls: 'x-panel-header',            
            border: false,
            height: 60,
            margins: '0 0 5 0',
            items: [{
                xtype: 'container',
                region: 'center',
                html: '<h1>Azure SLA calculator</h1><h5>Calculate SLA for Azure resources directly from Architecture diagram</h5>'
            }, {
                region: 'east',
                width: 160,
                listeners: {
                    afterrender: {
                        delay: 100,
                        fn: async (containerComponent) => {
                            const userProfile = await auth0Client.getUser();                            
                            containerComponent.update(`<div class="user-container"><img src="${userProfile.picture}" alt="${userProfile.name}" /><div class="name-content">${userProfile.name}</div><br/><div class="logout-content">Logout</div></div>`);
                            const containerEl = containerComponent.getEl();                            
                            containerEl.on('click', function (event, target) {
                                if (Ext.fly(target).is('div') && event.target.className === 'logout-content') {
                                    auth0Client.logout();
                                    document.location.reload();
                                }
                            }, containerEl);
                        }
                    }
                },
                frame: false,
                border: false,
                xtype: 'container'
            }],
            layout: 'border'
        }, {
            region: 'south',
            cls: 'x-app-footer',
            html: 'SLAs are calcualted using AI and Machine Learning algorithms. The results are approximate and may vary. Please consult with Azure SLA documentation for accurate SLA values. <br/>Copyright © 2024 Moim Hossain. All rights reserved. ',            
            border: false,
            xtype: 'container',
            height: 60,
            padding: '10 0 5 10'
        }, {
            region: 'west',
            collapsible: false,
            width: 600,
            html: '<div id="lc" style="height:100%;"></div>',
            listeners: {
                afterrender: {
                    delay: 100,
                    fn: (tp) => {
                        var wrapper = document.getElementById("lc");
                        tp.doLayout();
                        window.lc = LC.init(wrapper, {
                            imageURLPrefix: './_assets/lc-images',
                            toolbarPosition: 'top',
                            defaultStrokeWidth: 2,
                            imageSize: { height: null },
                            strokeWidths: [1, 2, 3, 5, 30]
                        });
                        var canvasElements = wrapper.getElementsByTagName("canvas");
                        for (var i = 0; i < canvasElements.length; i++) {
                            if (i == 0) {
                                window.canvas = canvasElements[i];
                            }
                            canvasElements[i].style.height = "100%";
                        }
                        tp.doLayout();
                    }
                }
            }
        }]
    });


    window.addEventListener('paste', function (event) {
        event.preventDefault();
        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                const reader = new FileReader();

                reader.onload = function (event) {
                    const img = new Image();

                    LC.util.addImageOnload(img, async () => {

                        const canvas = window.canvas;
                        const width = img.width < canvas.width ? img.width : canvas.width;
                        const height = img.height < canvas.height ? img.height : canvas.height;
                        const resizedImage = await resizeImage(img, width, height);


                        window.lc.saveShape(LC.createShape('Image', {
                            x: 0,
                            y: 0,
                            width: 200,
                            height: 200,
                            image: resizedImage
                        }));
                    });
                    img.src = event.target.result;
                    window.lastImage = img.src;
                };
                reader.readAsDataURL(file);
                break;
            }
        }
    });


});