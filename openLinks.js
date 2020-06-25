    const openLinks = (pattern) => {
        const as = document.getElementsByTagName("a");
        let links = [];
        for (let a of as) {
            links.push(a.href);
        }
        const set = new Set(links);
        links = [...set];
        links.forEach(link => {
            link.match(pattern) ? window.open(link, "_blank") : {};
        });
    }