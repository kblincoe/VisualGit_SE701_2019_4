export function setAllCheckboxes(sourceCheckbox) {
    const divElement = document.getElementById("file-panel");
    const inputElements = divElement.getElementsByTagName("input");
    for (let i = 0; i < inputElements.length; i++) {
        if (inputElements[i].type !== "checkbox") {
            continue;
        }
        inputElements[i].checked = sourceCheckbox.checked;
    }
}
