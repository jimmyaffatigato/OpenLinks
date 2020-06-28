browser.browserAction.setBadgeBackgroundColor({ color: "#ffffff" });

const backgroundGetFilter = async (): Promise<FilterSettings> => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    const result = await browser.storage.local.get({
        [String(tab.id)]: { pattern: "", useRegex: false, ignoreCase: false, removeDuplicates: false },
    });
    return result[String(tab.id)];
};

const backgroundGetActiveTab = async (): Promise<browser.tabs.Tab> => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
};

const backgroundGetLinks = async (filterSettings: FilterSettings): Promise<string[]> => {
    const tab = await backgroundGetActiveTab();
    const response = await browser.tabs.sendMessage(tab.id, {
        command: "getLinks",
        filterSettings,
    });
    return response.links;
};

const backgroundUpdateBadge = (links: string[]) => {
    let r = Math.floor((links.length / 50) * 255);
    if (r > 255) {
        r = 255;
    }
    browser.browserAction.setBadgeTextColor({ color: `#${r.toString(16).padStart(2, "0")}0000` });
    browser.browserAction.setBadgeText({ text: String(links.length) });
};

browser.tabs.onUpdated.addListener(() => {
    browser.tabs.executeScript({ file: "scripts/openLinks.js" }).then(() => {
        backgroundGetFilter().then(backgroundGetLinks).then(backgroundUpdateBadge);
    });
});
