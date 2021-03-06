interface FilterSettings {
    pattern: string;
    useRegex: boolean;
    ignoreCase: boolean;
    removeDuplicates: boolean;
}
// Run once
if (!window["hasRun"]) {
    window["hasRun"] = true;
    const getLinks = (filterSettings: FilterSettings): string[] => {
        const { pattern, useRegex, ignoreCase, removeDuplicates } = filterSettings;
        const linkElements = document.getElementsByTagName("a");
        let links = [] as string[];
        for (let i = 0; i < linkElements.length; i++) {
            links.push(linkElements[i].href);
        }
        if (removeDuplicates) {
            const set = new Set(links);
            links = [...set];
        }
        const matchingLinks = links.filter((link) => {
            if (useRegex) {
                return link.match(RegExp(pattern, `${ignoreCase ? "i" : ""}`));
            } else {
                if (ignoreCase) {
                    return link.toLowerCase().includes(pattern.toLowerCase());
                } else {
                    return link.includes(pattern);
                }
            }
        });
        return matchingLinks;
    };
    browser.runtime.onMessage.addListener((message: { command: string; filterSettings: FilterSettings }) => {
        if (message.command == "getLinks") {
            const { filterSettings } = message;
            return new Promise((res) => {
                res({ links: getLinks(filterSettings) });
            });
        }
    });
}
