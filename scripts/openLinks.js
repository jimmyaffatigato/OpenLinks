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

    const openLinks = (links) => {
        links.forEach((link) => {
            window.open(link, "_blank");
        });
    };

    browser.runtime.onMessage.addListener((message) => {
        if (message.command === "getLinks") {
            if (message.useRegex) {
                browser.runtime.sendMessage({
                    command: "links",
                    links: getLinks(
                        new RegExp(message.pattern),
                        message.caseSensitive
                    ),
                });
            } else {
                browser.runtime.sendMessage({
                    command: "links",
                    links: getLinks(message.pattern, message.caseSensitive),
                });
            }
        }
        if (message.command === "openLinks") {
            if (message.pattern != "") {
                if (message.useRegex) {
                    openLinks(
                        getLinks(
                            new RegExp(message.pattern),
                            message.caseSensitive
                        )
                    );
                    console.log(
                        `Opening all links matching RegEx: /${message.pattern}/.`
                    );
                } else {
                    openLinks(getLinks(message.pattern, message.caseSensitive));
                    console.log(
                        `Opening all links matching string: ${message.pattern}.`
                    );
                }
            }
        }
    });

    const links = getLinks("");
    browser.runtime.sendMessage({ command: "links", links: links });
})();
