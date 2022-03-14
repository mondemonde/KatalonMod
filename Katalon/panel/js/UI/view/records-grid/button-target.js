import { commandFactory } from "../../../background/playback/service/command/CommandFactory.js";
import {
    trackingSelectTargetElement,
    trackingHightlightTargetElement
} from "../../services/tracking-service/segment-tracking-service.js";

function selectBtn() {
    //add btn add
    const div = document.createElement('div');
    div.id = 'selectElementButton';
    div.setAttribute("class", "selectElementButton tooltips");
    div.setAttribute("tooltip", "Selector");

    div.addEventListener('click', function(event) {
        $(this).css('background', '#F0F0F0');
        let command = commandFactory.createCommand("selectElement");
        command.execute();
        trackingSelectTargetElement();
    });

    const addBtn = document.createElement('img');
    addBtn.src = '/katalon/images/SVG/radar-icon.svg';
    div.appendChild(addBtn);

    const span = document.createElement('span');
    span.style = "width:50px";
    div.appendChild(span);

    return div;
}

function showBtn() {
    //add btn add
    const div = document.createElement('div');
    div.id = 'showElementButton';
    div.setAttribute("class", "showElementButton tooltips");
    div.setAttribute("tooltip", "Finder");

    div.addEventListener('click', function(event) {
        let command = commandFactory.createCommand("showElement");
        command.execute();
        trackingHightlightTargetElement();
    });

    const addBtn = document.createElement('img');
    addBtn.src = '/katalon/images/SVG/new-find-icon.svg';
    div.appendChild(addBtn);

    const span = document.createElement('span');
    div.appendChild(span);

    return div;
}

let copyText = "";

function copyBtn() {
    const div = document.createElement('div');
    div.id = 'grid-cell-copy-btn';
    div.setAttribute("class", "grid-cell-copy-btn tooltips");
    div.setAttribute("tooltip", "Copy");

    div.addEventListener('click', function(event) {
        const targetTd = $(this).parents('td');
        targetTd.find("#command-target").select();
        document.execCommand("copy");
        copyText = targetTd.find("#command-target").val();
    });

    const copyBtn = document.createElement('img');
    copyBtn.src = 'icons/copy.svg';
    div.appendChild(copyBtn);

    const span = document.createElement('span');
    div.appendChild(span);

    return div;
}

function cutBtn() {
    const div = document.createElement('div');
    div.id = 'grid-cell-cut-btn';
    div.setAttribute("class", "grid-cell-cut-btn tooltips");
    div.setAttribute("tooltip", "Cut");

    div.addEventListener('click', function(event) {
        const targetTd = $(this).parents('td');
        targetTd.find("#command-target").select();
        copyText = targetTd.find("#command-target").val();
        document.execCommand("cut");
    });

    const cutBtn = document.createElement('img');
    cutBtn.src = 'icons/cut.svg';
    div.appendChild(cutBtn);

    const span = document.createElement('span');
    div.appendChild(span);

    return div;
}

function pasteBtn() {
    const div = document.createElement('div');
    div.id = 'grid-cell-paste-btn';
    div.setAttribute("class", "grid-cell-paste-btn tooltips");
    div.setAttribute("tooltip", "Paste");

    div.addEventListener('click', function(event) {
        const targetTd = $(this).parents('td');
        targetTd.find("#command-target").val(copyText);
    });

    const pasteBtn = document.createElement('img');
    pasteBtn.src = 'icons/paste.svg';
    div.appendChild(pasteBtn);

    const span = document.createElement('span');
    div.appendChild(span);

    return div;
}

function deleteBtn() {
    //add btn delete
    const div = document.createElement('div');
    div.id = 'grid-cell-delete-btn';
    div.setAttribute("class", "grid-cell-delete-btn tooltips");
    div.setAttribute("tooltip", "Delete");

    div.addEventListener('click', function(event) {
        const targetTd = $(this).parents('td');
        targetTd.find("#command-target").val("");
    });

    const delBtn = document.createElement('img');
    delBtn.src = 'icons/delete-tag.svg';
    div.appendChild(delBtn);

    const span = document.createElement('span');
    div.appendChild(span);

    return div;
}

function toolbarTargetBtn(i) {
    const div = document.createElement('div');
    div.id = 'toolbar-target-btn' + i;
    div.setAttribute('class', 'toolbar-target-btn');
    div.style = 'display:none;'

    const select = selectBtn();
    const find = showBtn();
    const copy = copyBtn();
    const cut = cutBtn();
    const paste = pasteBtn();
    const deleteBt = deleteBtn();

    div.appendChild(select);
    div.appendChild(find);
    div.appendChild(copy);
    div.appendChild(cut);
    div.appendChild(paste);
    div.appendChild(deleteBt);

    return div;
}

export {
    toolbarTargetBtn
}