const HIGHLIGHTS = [
    ["=&gt;", "arrow"],
    ["#[0-9A-Fa-f]{3,6}", "color"],
    [":=", "defined"],
    ["\\w*:\\S*", "tag"],
    ["[*?]", "symbol"],
    ["@[^,\\n]*", "index"],
    ["[!\\[\\],]", "grouping"],
    ["\\w+", "name"],
];

const highlighted = document.getElementById("code-highlighted");

function splitParts(code) {
    let parts = [];
    let pos = 0;
    while (pos < code.length) {
        let end;
        if (code.slice(pos).startsWith("<span")) {
            end = code.indexOf("</span>", pos + 1);
            if (end < 0) break;
            end += 7;
        } else {
            end = code.indexOf("<span", pos + 1);
            if (end < 0) end = code.length;
        }
        parts.push(code.slice(pos, end));
        pos = end;
    }
    return parts;
}

function highlightWithRegex(code, regex, name) {
    let parts = splitParts(code);
    return parts.map(x => x.startsWith("<span") ? x : x.replaceAll(
        new RegExp("(" + regex + ")", "g"),
        "<span class=\"highlight-" + name + "\">$1</span>"
    )).join("");
}

function highlight(code) {
    for (let [regex, name] of HIGHLIGHTS)
        code = highlightWithRegex(code, regex, name);
    return code;
}

function highlightCode() {
    let html = codeArea.innerHTML;
    html = highlight(html);
    highlighted.innerHTML = html.replaceAll("<br>", "");
    highlighted.scrollTop = codeArea.scrollTop;
}