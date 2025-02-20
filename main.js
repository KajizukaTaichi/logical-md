class Node {
    constructor(value, children = []) {
        this.value = value; // String
        this.children = children; // Array[Node]
    }
}

function parseIndentBasedText(lines, indentLevel = 0) {
    const nodes = [];

    while (lines.length > 0) {
        const line = lines[0];
        const currentIndentLevel = line.search(/\S/);
        const value = line.trim();

        if (currentIndentLevel < indentLevel) {
            break;
        }

        const node = new Node(value);
        lines.shift();

        if (lines.length > 0 && lines[0].search(/\S/) > currentIndentLevel) {
            node.children = parseIndentBasedText(lines, currentIndentLevel + 2);
        }

        nodes.push(node);
    }

    return nodes;
}

function showAsHTML(ast, idx = "link") {
    if (ast.children.length == 0) {
        let elm = document.createElement("p");
        elm.id = idx;
        elm.innerHTML = stylePrefix(ast.value);
        return elm;
    } else {
        let divElm = document.createElement("div");

        let textElm = document.createElement("p");
        textElm.id = idx;
        textElm.innerHTML = stylePrefix(ast.value);
        divElm.appendChild(textElm);

        let listElm = document.createElement("ul");
        let index = 1;
        for (i of ast.children) {
            let liElm = document.createElement("li");
            liElm.appendChild(showAsHTML(i, `${idx}-${index}`));
            listElm.appendChild(liElm);
            index += 1;
        }
        divElm.appendChild(listElm);

        return divElm;
    }
}

function styleHelper(text, color) {
    return `<span style="color: ${color}">${text}</span>`;
}

function stylePrefix(code) {
    if (code.startsWith("# ")) {
        code = code.replace("# ", "").trim();
        return `${styleHelper("命題", "blue")}${stylePrefix(code)}`;
    } else if (code.startsWith("@ ")) {
        code = code.replace("@ ", "").trim();
        return `${styleHelper("前提", "darkcyan")}${stylePrefix(code)}`;
    } else if (code.startsWith("! ")) {
        code = code.replace("! ", "").trim();
        return `${styleHelper("反論", "red")}${stylePrefix(code)}`;
    } else if (code.startsWith("/ ")) {
        code = code.replace("/ ", "").trim();
        return `${styleHelper("なぜなら", "cornflowerblue")}${stylePrefix(code)}`;
    } else if (code.startsWith("? ")) {
        code = code.replace("? ", "").trim();
        return `${styleHelper("疑問", "blueviolet")}${stylePrefix(code)}？`;
    } else if (code.startsWith("¥ ")) {
        code = code.replace("¥ ", "").trim();
        return `${styleHelper("仮定", "yellowgreen")}${stylePrefix(code)}`;
    } else if (code.startsWith("& ")) {
        code = `link-${code.replace("& ", "").trim()}`;
        let toShow = code.replace("link-", "").split("-").join("の");
        return `
            ${styleHelper("参照", "sandybrown")}
            <a
                href="#${code}"
                onmouseenter="refer(this, '${code}')"
                onmouseleave="this.innerHTML = '${toShow}'"
                onclick="focusElm('${code}');"
            >${toShow}</a>
        `;
    } else if (code.startsWith("; ")) {
        code = code.replace("; ", "").trim();
        return `${styleHelper("例えば", "darkkhaki")}${stylePrefix(code)}`;
    } else if (code.startsWith("+ ")) {
        code = code.replace("+ ", "").trim();
        return `${styleHelper("その場合", "chocolate")}${stylePrefix(code)}`;
    } else if (code.startsWith("- ")) {
        code = code.replace("- ", "").trim();
        return `${styleHelper("でなければ", "violet")}${stylePrefix(code)}`;
    } else if (code.startsWith(", ")) {
        code = code.replace(", ", "").trim();
        return `${styleHelper("そして", "grey")}${stylePrefix(code)}`;
    } else if (code.startsWith("= ")) {
        code = code.replace("= ", "").trim();
        return `${styleHelper("故に", "green")}${stylePrefix(code)}`;
    } else if (code.startsWith("== ")) {
        code = code.replace("== ", "").trim();
        return `${styleHelper("結論", "goldenrod")}${stylePrefix(code)}`;
    } else {
        return code;
    }
}

let editor = document.getElementById("editor");
editor.addEventListener("keydown", function (event) {
    if (event.key === "Tab") {
        event.preventDefault();

        let indent = "  ";
        let cousor = editor.selectionStart;
        let currentText = editor.value;

        editor.value =
            currentText.slice(0, cousor) + indent + currentText.slice(cousor);
        editor.selectionStart = cousor + indent.length;
        editor.selectionEnd = cousor + indent.length;
    }
});

function focusElm(id) {
    let elm = document.getElementById(id);
    elm.style.backgroundColor = "yellow";
    setTimeout((elm) => (elm.style.backgroundColor = "white"), 3000, elm);
}

function refer(from, to) {
    let elm = document.getElementById(to);
    console.log(elm.innerHTML);
    from.innerText = elm.innerText.slice(0, 8) + "...";
}

function display() {
    let code = editor.value;
    let viewer = document.getElementById("viewer");
    let ast = new Node(" ", parseIndentBasedText(code.split("\n")));
    console.log(JSON.stringify(ast, null, 4));
    viewer.innerHTML = showAsHTML(ast).innerHTML;
}
