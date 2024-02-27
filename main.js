let codeTextObject;
let setCells = new Map();

function onLoad() {
    let table = document.getElementById("spreadsheet");
    codeTextObject = document.getElementById("codeText");
    let tr, td, input;
    for (row = 0; row < 21; row++) {
        tr = document.createElement('tr');
        for (cell = 0; cell < 27; cell++) {
            td = document.createElement('td');
            tr.appendChild(td);
            if (cell == 0) {
                if (row != 0) {
                    td.innerHTML = row;
                }
            } else if (row == 0) {
                td.innerHTML = String.fromCharCode(64 + cell);
            } else {
                input = document.createElement("input");
                input.setAttribute("type", "text");
                input.setAttribute("id", "cell" + String.fromCharCode(64 + cell) + String(row));
                input.setAttribute("class", "spreadsheetCell");
                input.addEventListener("change", updateCodeFromSpreadsheet);
                td.appendChild(input);
            }
        }
        table.appendChild(tr);
    }
}

function generateCellValues() {
    let values = "";
    for (const cellValue of setCells) {
        values += "let " + cellValue[0].replace(/^codeLine/, '') + "=" + cellValue[1]+";";
    }
    
    return values;
}

function updateCodeFromSpreadsheet(event) {
    let eventObject = event.target;
    let cellValue = eventObject.value;
    let cellId = eventObject.id.replace(/^cell/, '');

    let codeLineId = "codeLine" + String(cellId);

    if (cellValue == "") {
        let codeLineText = document.getElementById(codeLineId);
        codeTextObject.removeChild(codeLineText);
        codeLineText.remove();
        setCells.delete(codeLineId);
        return;
    }

    if (setCells.has(codeLineId)) {
        document.getElementById(codeLineId).remove();
    }
    let codeLine = document.createElement("div");

    let cellText;
    let cellCommentText = "";

    if (isNumeric(cellValue)) {
        cellText = cellValue;
        cellValue = Number(cellValue);
    } else if (cellValue.startsWith("=")) {
        let condensedFormula = cellValue.replace(/\s/g, "").replace(/^=/, '');
        cellText = condensedFormula;
        let evaluatedValue = eval(generateCellValues() + condensedFormula);
        if (!isNumeric(evaluatedValue)) {
            evaluatedValue = "\"" + evaluatedValue.replace(/"/g, "\\\"") + "\"";
        }
        cellCommentText = evaluatedValue;
        cellValue = evaluatedValue;
    } else {
        cellValue = "\"" + cellValue.replace(/"/g, "\\\"") + "\"";
        cellText = cellValue;
    }

    let codeLineText = "let " + cellId + " = " + cellText + ";";

    codeLine.innerHTML = codeLineText;

    if (cellCommentText != "") {
        let codeCommentObject = document.createElement("span");
        codeCommentObject.setAttribute("class", "tooltiptext");
        codeCommentObject.innerHTML = cellCommentText;
        codeLine.appendChild(codeCommentObject);
        codeLine.setAttribute("class", "tooltip");
    }
    codeLine.setAttribute("id", codeLineId);
    codeTextObject.appendChild(codeLine);
    setCells.set(codeLineId, cellValue);
    if (cellCommentText != "") {
        codeTextObject.appendChild(document.createElement("br"));
    }
}

function isNumeric(str) {
    if (typeof str == "number") {
        return true;
    }

    if (typeof str != "string") {
        return false;
    }
    
    return !isNaN(str) && !isNaN(parseFloat(str));
}
