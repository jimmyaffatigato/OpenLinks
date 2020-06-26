(() => {
    const getLinks = (pattern, caseSensitive) => {
        const as = document.getElementsByTagName("a");
        let links = [];
        for (let a of as) {
            links.push(a.href);
        }
        const set = new Set(links);
        return [...set].filter((link) => {
            if (typeof pattern == "string") {
                if (caseSensitive) {
                    return link.includes(pattern);
                } else {
                    return link.toLowerCase().includes(pattern.toLowerCase());
                }
            }
            return link.match(pattern);
        });
    };

    browser.runtime.onMessage.addListener((message) => {
        const { command, pattern, useRegex, caseSensitive } = message;
        if (command === "getLinks") {
            browser.runtime.sendMessage({
                command: "links",
                links: getLinks(
                    useRegex ? new RegExp(pattern) : pattern,
                    caseSensitive
                ),
            });
        }
    });

    const links = getLinks("");
    browser.runtime.sendMessage({ command: "links", links: links });
})();
