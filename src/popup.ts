interface FilterSettings {
    pattern: string;
    useRegex: boolean;
    ignoreCase: boolean;
    removeDuplicates: boolean;
}

import { getActiveTab, getFilter, getLinks, updateBadge } from "./background.js";

// Elements
const openLinksButton = document.getElementById("openLinksButton") as HTMLButtonElement;
const patternInput = document.getElementById("patternInput") as HTMLInputElement;
const useRegexCheckbox = document.getElementById("useRegex") as HTMLInputElement;
const ignoreCaseCheckbox = document.getElementById("ignoreCase") as HTMLInputElement;
const removeDuplicatesCheckbox = document.getElementById("removeDuplicates") as HTMLInputElement;
const version = document.getElementById("version") as HTMLAnchorElement;
const linkCountNumber = document.getElementById("linkCountNumber") as HTMLSpanElement;
const plural = document.getElementById("plural") as HTMLSpanElement;
const linksElement = document.getElementById("links") as HTMLDivElement;

const buildNo = (): string => {
    const now = new Date();
    return `${now.getFullYear().toString().slice(2)}${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${now.getDate()}${now.getHours()}${now.getMinutes()}`;
};

// Manifest
const manifest = browser.runtime.getManifest();
version.textContent = `v${manifest.version}`;
version.title = `Version ${manifest.version}, Build ${buildNo()}`;
version.href = manifest.homepage_url;

// Tab Functions
const openLinks = (links: string[]) => {
    links.forEach((link) => {
        browser.tabs.create({ url: link, active: false });
    });
};

// Filter Functions
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

const saveFilter = async (filterSettings: FilterSettings): Promise<void> => {
    const tab = await getActiveTab();
    browser.storage.local.set({
        [String(tab.id)]: filterSettings,
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
const main = async () => {
    const filterSettings = await getFilter();
    loadFilter(filterSettings);
    const links = await getLinks(filterSettings);
    updateLinksElement(links);
};
main();

export {};
