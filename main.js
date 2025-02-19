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

function showAsHTML(ast) {
    if (ast.children.length == 0) {
        return stylePrefix(ast.value);
    } else {
        console.log(ast.children);
        let elm = document.createElement("div");
        elm.appendChild(stylePrefix(ast.value));

        let list = document.createElement("ul");
        for (i of ast.children) {
            let li = document.createElement("li");
            li.appendChild(showAsHTML(i));
            list.appendChild(li);
        }
        elm.appendChild(list);

        return elm;
    }
}

function styleHelper(text, color) {
    return `<span style="color: ${color}">${text}</span>`;
}

function stylePrefix(code) {
    let elm = document.createElement("p");
    if (code.startsWith("# ")) {
        code = code.replace("# ", "").trim();
        elm.innerHTML = `${styleHelper("命題", "blue")}${code}`;
    } else if (code.startsWith("@ ")) {
        code = code.replace("@ ", "").trim();
        elm.innerHTML = `${styleHelper("前提", "darkcyan")}${code}`;
    } else if (code.startsWith("! ")) {
        code = code.replace("! ", "").trim();
        elm.innerHTML = `${styleHelper("反論", "red")}${code}`;
    } else if (code.startsWith("/ ")) {
        code = code.replace("/ ", "").trim();
        elm.innerHTML = `${styleHelper("なぜなら", "cornflowerblue")}${code}`;
    } else if (code.startsWith("? ")) {
        code = code.replace("? ", "").trim();
        elm.innerHTML = `${styleHelper("もし", "blueviolet")}${code}？`;
    } else if (code.startsWith("+ ")) {
        code = code.replace("+ ", "").trim();
        elm.innerHTML = `${styleHelper("だとすると", "chocolate")}${code}`;
    } else if (code.startsWith("- ")) {
        code = code.replace("- ", "").trim();
        elm.innerHTML = `${styleHelper("でなければ", "violet")}${code}`;
    } else if (code.startsWith(", ")) {
        code = code.replace(", ", "").trim();
        elm.innerHTML = `${styleHelper("そして", "grey")}${code}`;
    } else if (code.startsWith("= ")) {
        code = code.replace("= ", "").trim();
        elm.innerHTML = `${styleHelper("故に", "green")}${code}`;
    } else if (code.startsWith("== ")) {
        code = code.replace("== ", "").trim();
        elm.innerHTML = `${styleHelper("結論", "goldenrod")}${code}`;
    } else {
        elm.innerHTML = `${code}`;
    }
    return elm;
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

function display() {
    let code = editor.value;
    let viewer = document.getElementById("viewer");
    let ast = new Node(" ", parseIndentBasedText(code.split("\n")));
    console.log(JSON.stringify(ast, null, 4));
    viewer.innerHTML = showAsHTML(ast).innerHTML;
}
