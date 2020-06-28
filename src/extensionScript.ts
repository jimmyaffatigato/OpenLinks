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

// Manifest
const manifest = browser.runtime.getManifest();
version.textContent = `v${manifest.version}`;
version.href = manifest.homepage_url;

let links = [];

const openLinks = (links: string[]) => {
    links.forEach((link) => {
        browser.tabs.create({ url: link, active: false });
    });
};

const saveFilter = () => {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs: browser.tabs.Tab[]) => {
        const tab = tabs[0];
        browser.storage.local.set({
            [String(tab.id)]: {
                pattern: patternInput.value,
                useRegex: useRegexCheckbox.checked,
                ignoreCase: ignoreCaseCheckbox.checked,
                removeDuplicates: removeDuplicatesCheckbox.checked,
            },
        });
    });
};

const pollLinks = (): void => {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs: browser.tabs.Tab[]) => {
        const tab = tabs[0];
        browser.tabs
            .sendMessage(tab.id, {
                command: "getLinks",
                filterSettings: {
                    pattern: patternInput.value,
                    useRegex: useRegexCheckbox.checked,
                    ignoreCase: ignoreCaseCheckbox.checked,
                    removeDuplicates: removeDuplicatesCheckbox.checked,
                },
            })
            .then((response) => {
                let r = Math.floor((response.links.length / 50) * 255);
                if (r > 255) {
                    r = 255;
                }
                links = response.links;
                linkCountNumber.textContent = `${response.links.length}`;
                linkCountNumber.style.color = `#${r.toString(16).padStart(2, "0")}0000`;
                plural.textContent = `${response.links.length !== 1 ? "s" : ""}`;
                document.getElementById("links").innerHTML = response.links
                    .map((link: string) => {
                        return `<a class="link" title="${link}" href="${link}">${link}</a>`;
                    })
                    .join("\n");
            });
    });
};
browser.tabs.executeScript({ file: "scripts/openLinks.js" }).then(() => {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs: browser.tabs.Tab[]) => {
        const tab = tabs[0];
        browser.storage.local
            .get({
                [String(tab.id)]: { pattern: "", useRegex: false, ignoreCase: false, removeDuplicates: false },
            })
            .then((result) => {
                const { pattern, useRegex, ignoreCase, removeDuplicates } = result[String(tab.id)]
                    ? result[String(tab.id)]
                    : { pattern: "", useRegex: false, ignoreCase: false, removeDuplicates: false };
                patternInput.value = pattern;
                useRegexCheckbox.checked = useRegex;
                ignoreCaseCheckbox.checked = ignoreCase;
                removeDuplicatesCheckbox.checked = removeDuplicates;
                pollLinks();
            });
    });
});

openLinksButton.addEventListener("click", () => {
    openLinks(links);
});
patternInput.addEventListener("input", () => {
    saveFilter();
    pollLinks();
    console.log("input");
});
useRegexCheckbox.addEventListener("change", () => {
    saveFilter();
    pollLinks();
});
ignoreCaseCheckbox.addEventListener("change", () => {
    saveFilter();
    pollLinks();
});
removeDuplicatesCheckbox.addEventListener("change", () => {
    saveFilter();
    pollLinks();
});
