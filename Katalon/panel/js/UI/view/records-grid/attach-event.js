import { getSelectedRecord } from "./selected-records.js";
import { getSelectedCase } from "../testcase-grid/selected-case.js";
import { findTestCaseById } from "../../services/data-service/test-case-service.js";

import { toolbarBtn } from "./button-selected-row.js";
import { toolbarCommandBtn } from "./button-command.js";
import { toolbarTargetBtn } from "./button-target.js";
import { toolbarValueBtn } from "./button-value.js";
import { inputValue, removeInputValue } from "./input-value.js";
import { inputTarget, removeInputTarget, dropdownTarget } from "./input-target.js";
import { inputCommand, removeInputCommand } from "./input-command.js";


function makeTableSortable(table) {
    $(table).sortable({
        axis: "y",
        items: "tr",
        scroll: true,
        revert: 200,
        scrollSensitivity: 20,
        helper: function(e, tr) {
            let $originals = tr.children();
            let $helper = tr.clone();
            $helper.children().each(function(index) {
                $(this).width($originals.eq(index).width());
            });
            return $helper;
        },
        update: function(event, ui) {
            let selectedTestCaseID = getSelectedRecord();
            let selectedTestCase = $(`#${selectedTestCaseID}`);
            //remove old target list
            let datalist = selectedTestCase.find("datalist")[0];
            $(datalist).remove();
            //update new target list
            let valueList = [...$("#target-dropdown").find("tr")].map(element => element.innerText);
            let newDatalist = $('<datalist></datalist>');
            for (let i = 0; i < valueList.length; i++) {
                let option = $("<option></option>").html(valueList[i]);
                newDatalist.append($(option));
            }
            let targetRow = selectedTestCase.children()[1];
            $(targetRow).append($(newDatalist));
        }
    });
}

function getTargetOptionTable(targetList) {
    let optionList = [...$(targetList).find("option")];
    let table = $("<table><tbody></tbody></table>");
    for (let i = 0; i < optionList.length; i++) {
        let tr = $("<tr></tr>");
        $(tr).html(`<td>${targetList.options[i].innerHTML}</td>`);
        $(table).append(tr);
    }
    makeTableSortable(table[0]);
    let div = $("<div></div>");
    $(div).append(table);
    return div[0];
}

function hideToolbar() {
    $('.toolbar-btn').hide();
    $('.toolbar-target-btn').hide();
    $('.toolbar-command-btn').hide();
    $('.toolbar-value-btn').hide();
}

function resetTable() {
    // $('#records-grid .selectedRecord').removeClass('selectedRecord');
    $('#records-grid .toolbar-btn').hide();
    $('#records-grid .toolbar-command-btn').hide();
    $('#records-grid .toolbar-target-btn').hide();
    $('#records-grid .toolbar-value-btn').hide();
    $('#records-grid .selectedTd').removeClass('selectedTd');
}

function loadTooltip(element) {
    if ($(element).index() == 1) {
        $(element).find('.tooltips:not([tooltip-position])').attr('tooltip-position', 'bottom');
    } else {
        $(element).find('.tooltips:not([tooltip-position])').attr('tooltip-position', 'top');
    }

    $(".tooltips").mouseenter(function() {
        $(this).find('span').empty().append($(this).attr('tooltip'));
    });
}

function loadToolbarForTeststep(ref) {
    let selectedElement = $('.selectedRecord');

    if (selectedElement.length > 0) {
        $('.toolbar-target-btn').hide();
        $('.selectedTd').removeClass('selectedTd');

        let setTopTool = $(selectedElement[0]).position().top - 37;
        $(ref).find('.toolbar-btn').css({
            'display': 'flex',
            'top': setTopTool
        }).show();
        loadTooltip(selectedElement);
        scrape(selectedElement.find('td:nth-child(2)').find('div:first').text());
    }
}
// attach event on <tr> (records)
var firstSelectedTrId = undefined;

function attachEvent(start, end) {
    for (var i = start; i <= end; ++i) {
        var node = document.getElementById("records-" + i);
        // sometimes target will be <td> or <tr>
        //remove all
        hideToolbar();

        //init element to first td
        if ($(node.firstChild).find('#toolbar-btn' + i).length == 0) {
            const toolbarDiv = toolbarBtn(i);
            node.firstChild.appendChild(toolbarDiv);
        }

        if ($(node.childNodes[2]).find('#toolbar-command-btn' + i).length == 0) {
            //add toolbar for target
            const div = toolbarCommandBtn(i);
            node.childNodes[1].appendChild(div);
        }

        if ($(node.childNodes[2]).find('#toolbar-target-btn' + i).length == 0) {
            //add toolbar for target
            const div = toolbarTargetBtn(i);
            node.childNodes[2].appendChild(div);
        }

        if ($(node.childNodes[2]).find('#toolbar-value-btn' + i).length == 0) {
            //add toolbar for target
            const div = toolbarValueBtn(i);
            node.lastChild.appendChild(div);
        }

        dropdownTarget(node.childNodes[2])

        // click firstchild to select row
        node.firstChild.addEventListener("click", function(event) {
            if (!$(event.target).parents('#toolbar-btn').hasClass('toolbar-btn')) {
                //remove all
                hideToolbar();
                removeInputCommand();
                removeInputTarget();
                removeInputValue();

                // use jquery's API to add and remove class property
                if (firstSelectedTrId == undefined && $(".selectedRecord").length > 0) {
                    firstSelectedTrId = parseInt($(".selectedRecord")[0].id.substring(8));
                }

                if (!event.ctrlKey && !event.shiftKey) {
                    $('#records-grid .selectedRecord').removeClass('selectedRecord');
                    firstSelectedTrId = undefined;
                }

                if (event.shiftKey || event.ctrlKey) {
                    if (firstSelectedTrId != undefined) {
                        let thisSelectedTrId = parseInt($(this).parent()[0].id.substring(8));
                        $('#records-grid .selectedRecord').removeClass('selectedRecord');
                        if (firstSelectedTrId < thisSelectedTrId) {
                            for (let i = firstSelectedTrId; i < thisSelectedTrId; i++) {
                                $("#records-" + i).addClass("selectedRecord");
                            }

                        } else {
                            for (let i = firstSelectedTrId; i > thisSelectedTrId; i--) {
                                $("#records-" + i).addClass("selectedRecord");
                            }
                        }
                    }
                }
                $(".record-bottom").removeClass("active");

                var ref = event.target;
                while (ref.tagName.toLowerCase() != "tr") {
                    ref = ref.parentNode;
                }
                $(ref).addClass('selectedRecord');

                loadToolbarForTeststep(ref);
            }
        }, false);

        // right click
        node.addEventListener("contextmenu", function(event) {
            // use jquery's API to add and remove class property
            $('#records-grid .selectedRecord').removeClass('selectedRecord');
            $(".record-bottom").removeClass("active");
            //reset input
            hideToolbar();
            $('.selectedTd').removeClass('selectedTd');
            removeInputCommand();
            removeInputTarget();
            removeInputValue();

            // show on grid toolbar
            var ref = event.target.parentNode;
            if (ref.tagName != "TR") {
                ref = ref.parentNode;
            }

            $(ref).addClass('selectedRecord');
        }, false);

        //interact with command
        node.childNodes[1].addEventListener("click", function(event) {
            //reset element
            hideToolbar();
            $('.selectedTd').removeClass('selectedTd');
            removeInputTarget();
            removeInputValue();

            //add input
            $(this).addClass('selectedTd');
            let setTopTool = $(this).position().top - 37;
            $(this).find('.toolbar-command-btn').css({
                'display': 'flex',
                'top': setTopTool
            }).show();
            loadTooltip($(this).parent());
            if (event.target.id !== "command-command" && !["grid-cell-copy-btn", "grid-cell-cut-btn", "grid-cell-paste-btn", "grid-cell-delete-btn"].includes(event.target.parentElement.id)) {
                inputCommand(this);
            }
        });

        //interact with target
        node.childNodes[2].addEventListener("click", function(event) {
            //reset element
            hideToolbar();
            $('.selectedTd').removeClass('selectedTd');
            // if ($(this).parents('.selectedRecord').find('.toolbar-btn').is(':visible')) {
            //     $('.toolbar-btn').hide();
            // }
            removeInputCommand();
            removeInputValue();

            //add new element
            $(this).addClass('selectedTd');
            let setTopTool = $(this).position().top - 37;
            $(this).find('.toolbar-target-btn').css({
                'display': 'flex',
                'top': setTopTool
            }).show();
            loadTooltip($(this).parent());

            let btnMap = ["selectElementButton", "showElementButton", "target-dropdown", "grid-cell-copy-btn", "grid-cell-cut-btn", "grid-cell-paste-btn", "grid-cell-delete-btn"];
            if (!["action1", "command-target"].includes(event.target.id) &&
                !btnMap.includes(event.target.parentElement.id)) {
                inputTarget(this);
            }
        });

        //interact with value
        node.lastChild.addEventListener("click", function(event) {
            //reset element
            hideToolbar();
            $('.selectedTd').removeClass('selectedTd');
            removeInputCommand();
            removeInputTarget();

            //add new element
            $(this).addClass('selectedTd');
            let setTopTool = $(this).position().top - 37;
            $(this).find('.toolbar-value-btn').css({
                'display': 'flex',
                'top': setTopTool
            }).show();
            loadTooltip($(this).parent());
            if (event.target.id !== "command-value" && !["grid-cell-copy-btn", "grid-cell-cut-btn", "grid-cell-paste-btn", "grid-cell-delete-btn"].includes(event.target.parentElement.id)) {
                inputValue(this);
            }
        });
    }
}

export { attachEvent, hideToolbar, resetTable, loadToolbarForTeststep }