interface FilterSettings {
    pattern: string;
    useRegex: boolean;
    ignoreCase: boolean;
    removeDuplicates: boolean;
}

// Elements
const openLinksButton = document.getElementById("goButton") as HTMLButtonElement;
const patternInput = document.getElementById("patternInput") as HTMLInputElement;
const useRegexCheckbox = document.getElementById("useRegex") as HTMLInputElement;
const ignoreCaseCheckbox = document.getElementById("ignoreCase") as HTMLInputElement;
const removeDuplicatesCheckbox = document.getElementById("removeDuplicates") as HTMLInputElement;
const version = document.getElementById("version") as HTMLAnchorElement;
const linkCountNumber = document.getElementById("linkCountNumber") as HTMLSpanElement;
const plural = document.getElementById("plural") as HTMLSpanElement;
const linksElement = document.getElementById("links") as HTMLDivElement;

// Manifest
const manifest = browser.runtime.getManifest();
version.textContent = `v${manifest.version}`;
version.href = manifest.homepage_url;

// Tab Functions
const openLinks = (links: string[]) => {
    links.forEach((link) => {
        browser.tabs.create({ url: link, active: false });
    });
};

const getLinks = async (filterSettings: FilterSettings): Promise<string[]> => {
    return getActiveTab().then(async (tab) => {
        const response = await browser.tabs.sendMessage(tab.id, {
            command: "getLinks",
            filterSettings,
        });
        return response.links;
    });
};

const getActiveTab = async (): Promise<browser.tabs.Tab> => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
};

// Filter Functions
const getFilter = async (): Promise<FilterSettings> => {
    const tab = await getActiveTab();
    const result = await browser.storage.local.get({
        [String(tab.id)]: { pattern: "", useRegex: false, ignoreCase: false, removeDuplicates: false },
    });
    return result[String(tab.id)];
};

const loadFilter = (filterSettings: FilterSettings): FilterSettings => {
    const { pattern, useRegex, ignoreCase, removeDuplicates } = filterSettings
        ? filterSettings
        : { pattern: "", useRegex: false, ignoreCase: false, removeDuplicates: false };
    patternInput.value = pattern;
    useRegexCheckbox.checked = useRegex;
    ignoreCaseCheckbox.checked = ignoreCase;
    removeDuplicatesCheckbox.checked = removeDuplicates;
    return filterSettings;
};

const saveFilter = (filterSettings: FilterSettings) => {
    getActiveTab().then((tab) => {
        browser.storage.local.set({
            [String(tab.id)]: filterSettings,
        });
    });
};

// UI Functions
const updateLinksElement = (links: string[]) => {
    let r = Math.floor((links.length / 50) * 255);
    if (r > 255) {
        r = 255;
    }
    linkCountNumber.textContent = `${links.length}`;
    linkCountNumber.style.color = `#${r.toString(16).padStart(2, "0")}0000`;
    plural.textContent = `${links.length !== 1 ? "s" : ""}`;

    while (linksElement.children.length > 0) {
        linksElement.firstChild.remove();
    }

    links.forEach((link) => {
        const linkElement = document.createElement("a");
        linkElement.className = "link";
        linkElement.textContent = link;
        linkElement.href = link;
        linkElement.title = link;
        linkElement.target = "_blank";
        linkElement.onclick = () => {
            setTimeout(() => {
                window.close();
            }, 10);
        };
        linksElement.appendChild(linkElement);
    });
    updateBadge(links);
};

const updateBadge = (links: string[]) => {
    let r = Math.floor((links.length / 50) * 255);
    if (r > 255) {
        r = 255;
    }
    browser.browserAction.setBadgeTextColor({ color: `#${r.toString(16).padStart(2, "0")}0000` });
    browser.browserAction.setBadgeText({ text: String(links.length) });
};

const handleFilterChange = async () => {
    const filterSettings = {
        pattern: patternInput.value,
        useRegex: useRegexCheckbox.checked,
        ignoreCase: ignoreCaseCheckbox.checked,
        removeDuplicates: removeDuplicatesCheckbox.checked,
    };
    saveFilter(filterSettings);
    const links = await getLinks(filterSettings);
    updateLinksElement(links);
};

// Event Listeners
openLinksButton.addEventListener("click", async () => {
    const filterSettings = await getFilter();
    const links = await getLinks(filterSettings);
    openLinks(links);
});
patternInput.addEventListener("input", handleFilterChange);
useRegexCheckbox.addEventListener("change", handleFilterChange);
ignoreCaseCheckbox.addEventListener("change", handleFilterChange);
removeDuplicatesCheckbox.addEventListener("change", handleFilterChange);

// Main
getFilter().then(loadFilter).then(getLinks).then(updateLinksElement);

export {};
