// KAT-BEGIN show docs on install or upgrade from 1.0
browser.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        browser.cookies.getAll({
            name: "wp_user_katone_token"
        }).then((cookies) => {
            let checkedUser = undefined;
            for (let cookie of cookies) {
                checkedUser = cookie.value;
            }
            if (checkedUser) {
                browser.tabs.create({
                    url: 'https://docs.katalon.com/katalon-recorder/docs/automate-scenarios.html#add-commands-to-interact-with-websites'
                });
            } else {
                browser.tabs.create({
                    url: 'https://www.katalon.com/sign-up/?utm_source=browser%20store&utm_campaign=installed%20KR'
                });
            }
        });
        segment().then(service => service.trackingInstallApp());
        browser.storage.local.set({ firstTime: true })
    } else if (details.reason === 'update') {
        browser.storage.local.set({
            tracking: {
                isUpdated: true
            }
        });
        // notificationUpdate("Katalon Recorder has been updated", "Find out about new bug fixes and enhancements!");
    }

});

browser.runtime.onMessage.addListener(function(message) {
    browser.storage.local.get('segment').then(function(result) {
        if (result.segment) {
            let segment = result.segment;
            browser.runtime.setUninstallURL(`${browser.runtime.getManifest().segment_url}/segment-kr/tracking?userId=${segment.userId || ''}&user=${encodeURI(segment.user) || ''}`);
        } else {
            browser.runtime.setUninstallURL(`${browser.runtime.getManifest().segment_url}/segment-kr/tracking`);
        }
    });
});

// KAT-END

async function segment() {
    const segmentSer = await
    import ('../panel/js/UI/services/tracking-service/segment-tracking-service.js');
    return segmentSer;
}


const notify = "Katalon-update";

function notificationUpdate(title, content) {
    browser.notifications.create(notify, {
        "type": "basic",
        "iconUrl": "/katalon/images/branding/branding_48.png",
        "title": title,
        "message": content
    });

    setTimeout(function() {
        browser.notifications.clear(notify);
    }, 5000);
}