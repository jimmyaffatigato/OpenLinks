browser.browserAction.setBadgeBackgroundColor({ color: "#ffffff" });

export const getFilter = async (): Promise<FilterSettings> => {
    const tab = await getActiveTab();
    const result = await browser.storage.local.get({
        [String(tab.id)]: { pattern: "", useRegex: false, ignoreCase: false, removeDuplicates: false },
    });
    return result[String(tab.id)];
};

export const getActiveTab = async (): Promise<browser.tabs.Tab> => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
};

export const getLinks = async (filterSettings: FilterSettings): Promise<string[]> => {
    const tab = await getActiveTab();
    const response = await browser.tabs.sendMessage(tab.id, {
        command: "getLinks",
        filterSettings,
    });
    return response.links;
};

export const updateBadge = (links: string[]): void => {
    let r = Math.floor((links.length / 50) * 255);
    if (r > 255) {
        r = 255;
    }
    browser.browserAction.setBadgeTextColor({ color: `#${r.toString(16).padStart(2, "0")}0000` });
    browser.browserAction.setBadgeText({ text: String(links.length) });
};

browser.tabs.onUpdated.addListener(
    async (): Promise<void> => {
        await browser.tabs.executeScript({ file: "scripts/content.js" });
        const filterSettings = await getFilter();
        const links = await getLinks(filterSettings);
        updateBadge(links);
    }
);
