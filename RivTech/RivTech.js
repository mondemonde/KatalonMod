
/* #region  Req.js ------------------------------------------------------------*/

//import { ReversibleCommandDecorator } from "../Common/Assets/Katalon5/panel/js/UI/models/command/reversible-command-decorator";

//import { makeCaseSortable } from "../Common/Assets/Katalon5/panel/js/UI/view/testcase-grid/make-case-sortable";

/* #endregion */

/* #region  input - command.js ---------------------------------------------------------------------*/
class clsInputCommand {
    static changeTdOfTable(event) {
        let temp, value;
        if (event.target) {
            temp = $(event.target).parents('tr').attr('id');
            value = event.target.value;
        } else {
            temp = $(event).parents('tr').attr('id');
            value = $(event).val();
        }

        if (temp) {
            var div = getTdRealValueNode(document.getElementById(temp), 1);
            // set innerHTML = ""
            if (div.childNodes && div.childNodes[0]) {
                div.removeChild(div.childNodes[0]);
            }
            div.appendChild(document.createTextNode(value));

            var command_command = value;
            div = getTdShowValueNode(document.getElementById(temp), 1);
            if (div.childNodes && div.childNodes[1]) {
                div.removeChild(div.childNodes[1]);
            }
            div.appendChild(document.createTextNode(command_command));

            // store command to in-memory data object
            const s_case = getSelectedCase();
            if (s_case) {
                const testCaseID = s_case.id;
                const testCase = findTestCaseById(testCaseID);
                //record index start with 1
                const commandIndex = parseInt(temp.substring(8)) - 1;
                const testCommand = testCase.commands[commandIndex];
                testCommand.name = value;
                modifyCaseSuite();
            }
        }
    }

    static saveWhenInsideInput(event) {
        //capture Ctrl+S when inside input
        let keyNum;
        if (window.event) { // IE
            keyNum = event.keyCode;
        } else if (event.which) { // Netscape/Firefox/Opera
            keyNum = event.which;
        }
        if (event.ctrlKey || event.metaKey) {
            if (keyNum === 83 || keyNum === 229) {
                //disable browser default Ctrl + S event handler
                event.preventDefault();
                event.stopPropagation();
                const element = event.target;
                $(element).blur();
                saveData();
                removeDirtyMarks();
                resetFocus();
            }
        }
    }

    static removeInputCommand() {
        if ($('#records-grid').find('#command-command').length > 0) {
            const foundInput = $('#records-grid').find('#command-command');
            changeTdOfTable(foundInput);
            foundInput.remove();
        }
    }

    static inputCommand(node) {
        const supportedCommand = _loadSeleniumCommands();

        clsInputCommand.removeInputCommand();

        if ($(node).find('#command-command').length > 0) {
            $(node).text($(node).find('#command-command').val());
            $(node).find('#command-command').remove();
        }
        node.childNodes[1].innerText = '';

        const $target = $(node);

        const input = document.createElement("INPUT");
        input.id = "command-command";
        input.type = "text";
        input.setAttribute("class", "command-command");
        generateDropdownCommandToolbarCommand().execute();

        node.childNodes[1].prepend(input);

        //interactive input
        const inputCommand = $target.find("#command-command");
        inputCommand.css({
            'font': '13px Roboto',
            'height': '25px',
            'padding-left': '5px',
            'width': '94%'
        });

        inputCommand.autocomplete({
            minLength: 0,
            source: supportedCommand,
            select: function (event, ui) {
                event.stopPropagation();
                $(this).parents('#dropdown-command').show();
                $(this).val(ui.item.value);
            }
        });

        inputCommand.val($target.children().eq(0).text());
        inputCommand.focus();

        inputCommand.on('keyup', function (event) {
            event.preventDefault();
            if (event.which == 13 || event.keyCode == 13) {
                changeTdOfTable(event);
                generateDropdownCommandToolbarCommand().execute();
                $(this).remove();
                $('.toolbar-command-btn').hide();
            }
        });

        inputCommand.dblclick(function (event) {
            event.preventDefault();
            this.select();
        })

        inputCommand.on("keydown", saveWhenInsideInput);
    }
}
/* #endregion */

/* #region   input - target.js-----------------------------------------------------------------------------*/

class clsInputTarget {

    static timeout = null;

    static changeTdOfTable(event, isSaved) {
        let temp, value;
        if (event.target) {
            temp = $(event.target).parents('tr').attr('id');
            value = event.target.value;
        } else {
            temp = $(event).parents('tr').attr('id');
            value = $(event).val();
        }

        if (temp) {
            var div = getTdRealValueNode(document.getElementById(temp), 2);
            // Check hidden value and target value
            if (!(div.childNodes[0] && div.childNodes[0].textContent.includes("d-XPath") && value.includes("tac"))) {
                var real_command_target = value;
                if (real_command_target == "auto-located-by-tac") {
                    // Real tac value is hidden
                    var real_tac = getTargetDatalist(document.getElementById(temp)).options[0].text;
                    if (real_tac == "") real_tac = "auto-located-by-tac";
                    real_command_target = real_tac;
                }
                if (div.childNodes && div.childNodes[0]) {
                    div.removeChild(div.childNodes[0]);
                }
                div.appendChild(document.createTextNode(real_command_target));

                var command_target = value;
                div = getTdShowValueNode(document.getElementById(temp), 2);
                /* KAT-BEGIN remove tac
                if (command_target.includes("tac")) {
                    command_target = "auto-located-by-tac";
                }
                KAT-END */
                if (div.childNodes && div.childNodes[1]) {
                    div.removeChild(div.childNodes[1]);
                }
                div.appendChild(document.createTextNode(command_target));
            }
            modifyCaseSuite();

            if (isSaved) {
                //need a time out here to make sure user finnish typing before sava new target to in-memory object
                clearTimeout(timeout);
                // store command to in-memory data object
                const s_case = getSelectedCase();
                if (s_case) {
                    const testCaseID = s_case.id;
                    const testCase = findTestCaseById(testCaseID);
                    //record index start with 1
                    const commandIndex = parseInt(temp.substring(8)) - 1;
                    const testCommand = testCase.commands[commandIndex];
                    // timeout = setTimeout(function() {
                    testCommand.defaultTarget = value;
                    if (!testCommand.targets.includes(value)) {
                        testCommand.targets.push(value);

                        //add to datalist on record-grid
                        let datalist = getTargetDatalist(document.getElementById(temp));

                        let option = document.createElement('option');
                        option.innerText = value;
                        datalist.appendChild(option);

                        //add to data list on command target
                        let targetDropdown = $('#' + temp).find("#target-dropdown");
                        let optionDrop = document.createElement('option');
                        optionDrop.innerText = value;
                        optionDrop.value = value;
                        targetDropdown.append(optionDrop);
                    }
                    // }, 500);
                    modifyCaseSuite();

                    //hide dropdown target
                    // $(event.target).parent().hide();
                    // $(event.target).parents('tr').find('img[data-state2="open"]').attr('src', 'icons/close-command.svg');
                    // $(event.target).parents('tr').find('img[data-state2="open"]').attr('data-state2', 'close');
                }
            }
        }
    }

    static removeInputTarget() {
        if ($('#records-grid').find('#command-target').length > 0) {
            const foundInput = $('#records-grid').find('#command-target');
            changeTdOfTable(foundInput, true);
            foundInput.remove();
            $('#records-grid .target-dropdown:visible').hide();
        }
    }

    static dropdownTarget(node) {
        let $target = $(node);

        if ($target.find('#target-dropdown').is(':visible')) {
            $target.find('#target-dropdown').hide();
        }

        const htmlCommand = `<div id="target-dropdown" class="w3-dropdown-content w3-bar-block target-dropdown"></div>`;

        if ($target.find('#target-dropdown').length == 0) {
            $target.append(htmlCommand)
        }

        let $dropdownTarget = $target.find('#target-dropdown');

        //add to data list on command target
        const s_case = getSelectedCase();
        if (s_case) {
            const testCaseID = s_case.id;
            const testCase = findTestCaseById(testCaseID);
            //record index start with 1
            const commandIndex = parseInt($target.parents('tr').attr('id').substring(8)) - 1;
            const testCommand = testCase.commands[commandIndex];
            let datalist = $target.find('datalist')[0];
            $(datalist).empty();
            $dropdownTarget.empty();

            if (testCommand) {
                for (const element of testCommand.targets) {
                    if (element) {
                        let optionData = document.createElement('option');
                        optionData.innerText = element;
                        datalist.appendChild(optionData);

                        let option = document.createElement('option');
                        option.innerText = element;
                        option.value = element;
                        $dropdownTarget.append(option);
                    }
                }
            }

        }
    }

    static inputTarget(node) {
        clsInputTarget.removeInputTarget();

        if ($(node).find('#command-target').length > 0) {
            $(node).text($(node).find('#command-target').val());
            $(node).find('#command-target').remove();
        }
        node.childNodes[1].innerText = '';

        let $target = $(node);
        //interactive input
        const input = document.createElement("INPUT");
        input.id = "command-target";
        input.type = "text";
        input.setAttribute("class", "command-target");
        generateDropdownCommandToolbarCommand().execute();

        const img = document.createElement("img");
        img.id = "action1";
        img.src = "icons/close-command.svg";

        node.childNodes[1].append(input);
        node.childNodes[1].append(img);

        //load value to input
        const $inputTarger = $target.find("#command-target");
        $inputTarger.css({
            'font': '13px Roboto',
            'height': '25px',
            'padding-left': '5px',
            'width': '96%',
            'border-radius': '5px'
        });

        $inputTarger.val($target.children().eq(0).text());
        $inputTarger.focus();

        // $inputTarger.on("input", function(event) { changeTdOfTable(event, false) });

        $inputTarger.on('keyup', function (event) {
            event.preventDefault();
            if (event.which == 13 || event.keyCode == 13) {
                changeTdOfTable(event, true);
                generateDropdownCommandToolbarCommand().execute();
                $(this).remove();
                $(node).find('#target-dropdown').hide();
            }
        });

        $inputTarger.dblclick(function (event) {
            event.preventDefault();
            this.select();
        })

        $inputTarger.on("focusin", function () {
            let ID = getSelectedRecord();
            $(this).data('oldVal', $(this).val());
            $(this).data();
            $(this).data('ID', ID);
        }).on("focusout", function () {
            let oldValue = $(this).data("oldVal");
            if (oldValue !== $(this).val()) {
                const index = parseInt($(this).parents('tr').attr('id').substring(8)) - 1;
                generateEditTargetToolbarCommand(index, oldValue).execute();
            }
        }).on("keydown", saveWhenInsideInput);

        //interact dropdown target
        let $dropdownTarget = $target.find('#target-dropdown');
        $target.find('#action1').click(function () {
            if ($dropdownTarget.is(':visible')) {
                $dropdownTarget.hide();
            } else {
                $dropdownTarget.css({
                    'top': $(this).position().top + 45,
                    'width': $inputTarger.width() + 20
                })
                $dropdownTarget.show();
            }
        });

        $dropdownTarget.click(function (e) {
            let option = e.target;
            if (option.nodeName === "OPTION") {
                $inputTarger.val(option.value);
                $dropdownTarget.hide();
                $inputTarger.focus();
            }
        });
    }

}


/* #endregion */



/* #region   input - value.js----------------------------------------------------------------*/

class clsInputValue {

    static async changeTdOfTable(event) {
        let temp, value;
        if (event.target) {
            temp = $(event.target).parents('tr').attr('id');
            value = event.target.value;
        } else {
            temp = $(event).parents('tr').attr('id');
            value = $(event).val();
        }

        if (temp) {
            var div = getTdRealValueNode(document.getElementById(temp), 3);
            // set innerHTML = ""
            if (div.childNodes && div.childNodes[0]) {
                div.removeChild(div.childNodes[0]);
            }
            div.appendChild(document.createTextNode(value));

            var command_value = value;
            div = getTdShowValueNode(document.getElementById(temp), 3);
            if (div.childNodes && div.childNodes[0]) {
                div.removeChild(div.childNodes[0]);
            }
            $(div).prepend(document.createTextNode(command_value));

            const s_case = getSelectedCase();
            if (s_case) {
                const testCaseID = s_case.id;
                const testCase = findTestCaseById(testCaseID);
                //record index start with 1
                const commandIndex = parseInt(temp.substring(8)) - 1;
                const testCommand = testCase.commands[commandIndex];
                testCommand.value = value;
                modifyCaseSuite();
            }
            await addProfileLinkForCommandValue(document.getElementById(temp));
        }
    }

    static removeInputValue() {
        if ($('#records-grid').find('#command-value').length > 0) {
            const foundInput = $('#records-grid').find('#command-value');
            changeTdOfTable(foundInput);
            foundInput.remove();
        }
    }

    static inputValue(node) {
        //remove all #command-value exists
        clsInputValue.removeInputValue();

        if ($(node).find('#command-value').length > 0) {
            $(node).text($(node).find('#command-value').val());
            $(node).find('#command-value').remove();
        }
        node.childNodes[1].innerText = '';

        //init textarea
        const textarea = document.createElement('TEXTAREA');
        textarea.id = "command-value";
        textarea.setAttribute("class", "command-value");
        textarea.style = "width: 93%;font-family: 'Roboto', sans-serif;font-size: 12px;"
        textarea.rows = 6;
        textarea.placeholder = "Shift + Enter for a new line";

        generateDropdownCommandToolbarCommand().execute();
        node.childNodes[1].prepend(textarea);

        const $inputValue = $(node).find('#command-value');
        $inputValue.val(node.firstChild.innerText);
        $inputValue.focus();

        // $inputValue.on("input", changeTdOfTable);

        $inputValue.on('keyup', function (event) {
            event.preventDefault();
            if ((event.shiftKey && event.keyCode == 13) || (event.shiftKey && event.which == 13)) {
                event.stopPropagation();
            } else if (event.which == 13 || event.keyCode == 13) {
                changeTdOfTable(event);
                generateDropdownCommandToolbarCommand().execute();
                $(this).remove();
                $('.toolbar-value-btn').hide();
            }
        });

        $inputValue.keypress(function (event) {
            if (event.which == 13 && !event.shiftKey) {
                event.preventDefault();
            }
        });

        $inputValue.on("keydown", saveWhenInsideInput);
    }
}


/* #endregion */

/* #region   button - value.js------------------------------------------------------*/
class clsButtonValue {

    static copyBtn() {
        const div = document.createElement('div');
        div.id = 'grid-cell-copy-btn';
        div.setAttribute("class", "grid-cell-copy-btn tooltips");
        div.setAttribute("tooltip", "Copy");

        div.addEventListener('click', function (event) {
            const targetTd = $(this).parents('td');
            targetTd.find("#command-value").select();
            document.execCommand("copy");
            copyText = targetTd.find("#command-value").val();
        });

        const copyBtn = document.createElement('img');
        copyBtn.src = 'icons/copy.svg';
        div.appendChild(copyBtn);

        const span = document.createElement('span');
        div.appendChild(span);

        return div;
    }

    static cutBtn() {
        const div = document.createElement('div');
        div.id = 'grid-cell-cut-btn';
        div.setAttribute("class", "grid-cell-cut-btn tooltips");
        div.setAttribute("tooltip", "Cut");

        div.addEventListener('click', function (event) {
            const targetTd = $(this).parents('td');
            targetTd.find("#command-value").select();
            copyText = targetTd.find("#command-value").val();
            document.execCommand("cut");
        });

        const cutBtn = document.createElement('img');
        cutBtn.src = 'icons/cut.svg';
        div.appendChild(cutBtn);

        const span = document.createElement('span');
        div.appendChild(span);

        return div;
    }

    static pasteBtn() {
        const div = document.createElement('div');
        div.id = 'grid-cell-paste-btn';
        div.setAttribute("class", "grid-cell-paste-btn tooltips");
        div.setAttribute("tooltip", "Paste");

        div.addEventListener('click', function (event) {
            const targetTd = $(this).parents('td');
            targetTd.find("#command-value").val(copyText);
        });

        const pasteBtn = document.createElement('img');
        pasteBtn.src = 'icons/paste.svg';
        div.appendChild(pasteBtn);

        const span = document.createElement('span');
        div.appendChild(span);

        return div;
    }

    static deleteBtn() {
        //add btn delete
        const div = document.createElement('div');
        div.id = 'grid-cell-delete-btn';
        div.setAttribute("class", "grid-cell-delete-btn tooltips");
        div.setAttribute("tooltip", "Delete");

        div.addEventListener('click', function (event) {
            const targetTd = $(this).parents('td');
            targetTd.find("#command-value").val("");
        });

        const delBtn = document.createElement('img');
        delBtn.src = 'icons/delete-tag.svg';
        div.appendChild(delBtn);

        const span = document.createElement('span');
        div.appendChild(span);

        return div;
    }

    static toolbarValueBtn(i) {
        const div = document.createElement('div');
        div.id = 'toolbar-value-btn' + i;
        div.setAttribute('class', 'toolbar-value-btn');
        div.style = 'display:none;'

        const copy = clsButtonValue.copyBtn();
        const cut = clsButtonValue.cutBtn();
        const paste = clsButtonValue.pasteBtn();
        const deleteBt = clsButtonValue.deleteBtn();

        div.appendChild(copy);
        div.appendChild(cut);
        div.appendChild(paste);
        div.appendChild(deleteBt);

        return div;
    }


}


/* #endregion _________________________*/


/* #region   button - target.js______________________________________________*/

class clsButtonTarget {



    static selectBtn() {
        //add btn add
        const div = document.createElement('div');
        div.id = 'selectElementButton';
        div.setAttribute("class", "selectElementButton tooltips");
        div.setAttribute("tooltip", "Selector");

        div.addEventListener('click', function (event) {
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

    static showBtn() {
        //add btn add
        const div = document.createElement('div');
        div.id = 'showElementButton';
        div.setAttribute("class", "showElementButton tooltips");
        div.setAttribute("tooltip", "Finder");

        div.addEventListener('click', function (event) {
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

    static copyBtn() {
        const div = document.createElement('div');
        div.id = 'grid-cell-copy-btn';
        div.setAttribute("class", "grid-cell-copy-btn tooltips");
        div.setAttribute("tooltip", "Copy");

        div.addEventListener('click', function (event) {
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

    static cutBtn() {
        const div = document.createElement('div');
        div.id = 'grid-cell-cut-btn';
        div.setAttribute("class", "grid-cell-cut-btn tooltips");
        div.setAttribute("tooltip", "Cut");

        div.addEventListener('click', function (event) {
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

    static pasteBtn() {
        const div = document.createElement('div');
        div.id = 'grid-cell-paste-btn';
        div.setAttribute("class", "grid-cell-paste-btn tooltips");
        div.setAttribute("tooltip", "Paste");

        div.addEventListener('click', function (event) {
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

    static deleteBtn() {
        //add btn delete
        const div = document.createElement('div');
        div.id = 'grid-cell-delete-btn';
        div.setAttribute("class", "grid-cell-delete-btn tooltips");
        div.setAttribute("tooltip", "Delete");

        div.addEventListener('click', function (event) {
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

    static toolbarTargetBtn(i) {
        const div = document.createElement('div');
        div.id = 'toolbar-target-btn' + i;
        div.setAttribute('class', 'toolbar-target-btn');
        div.style = 'display:none;'

        const select = clsButtonTarget.selectBtn();
        const find = clsButtonTarget.showBtn();
        const copy = clsButtonTarget.copyBtn();
        const cut = clsButtonTarget.cutBtn();
        const paste = clsButtonTarget.pasteBtn();
        const deleteBt = clsButtonTarget.deleteBtn();

        div.appendChild(select);
        div.appendChild(find);
        div.appendChild(copy);
        div.appendChild(cut);
        div.appendChild(paste);
        div.appendChild(deleteBt);

        return div;
    }


}


/* #endregion */



/* #region  button - commands.js----------------------------------------------------- */

class clsButtonCommand {
    static copyText = "";

    static copyBtn() {
        const div = document.createElement('div');
        div.id = 'grid-cell-copy-btn';
        div.setAttribute("class", "grid-cell-copy-btn tooltips");
        div.setAttribute("tooltip", "Copy");

        div.addEventListener('click', function (event) {
            const targetTd = $(this).parents('td');
            targetTd.find("#command-command").select();
            document.execCommand("copy");
            copyText = targetTd.find("#command-command").val();
        });

        const copyBtn = document.createElement('img');
        copyBtn.src = 'icons/copy.svg';
        div.appendChild(copyBtn);

        const span = document.createElement('span');
        div.appendChild(span);

        return div;
    }

    static cutBtn() {
        const div = document.createElement('div');
        div.id = 'grid-cell-cut-btn';
        div.setAttribute("class", "grid-cell-cut-btn tooltips");
        div.setAttribute("tooltip", "Cut");

        div.addEventListener('click', function (event) {
            const targetTd = $(this).parents('td');
            targetTd.find("#command-command").select();
            copyText = targetTd.find("#command-command").val();
            document.execCommand("cut");
        });

        const cutBtn = document.createElement('img');
        cutBtn.src = 'icons/cut.svg';
        div.appendChild(cutBtn);

        const span = document.createElement('span');
        div.appendChild(span);

        return div;
    }

    static pasteBtn() {
        const div = document.createElement('div');
        div.id = 'grid-cell-paste-btn';
        div.setAttribute("class", "grid-cell-paste-btn tooltips");
        div.setAttribute("tooltip", "Paste");

        div.addEventListener('click', function (event) {
            const targetTd = $(this).parents('td');
            targetTd.find("#command-command").val(copyText);
        });

        const pasteBtn = document.createElement('img');
        pasteBtn.src = 'icons/paste.svg';
        div.appendChild(pasteBtn);

        const span = document.createElement('span');
        div.appendChild(span);

        return div;
    }

    static deleteBtn() {
        //add btn delete
        const div = document.createElement('div');
        div.id = 'grid-cell-delete-btn';
        div.setAttribute("class", "grid-cell-delete-btn tooltips");
        div.setAttribute("tooltip", "Delete");

        div.addEventListener('click', function (event) {
            const targetTd = $(this).parents('td');
            targetTd.find("#command-command").val("");
        });

        const delBtn = document.createElement('img');
        delBtn.src = 'icons/delete-tag.svg';
        div.appendChild(delBtn);

        const span = document.createElement('span');
        div.appendChild(span);

        return div;
    }

    static toolbarCommandBtn(i) {
        const div = document.createElement('div');
        div.id = 'toolbar-command-btn' + i;
        div.setAttribute('class', 'toolbar-command-btn');
        div.style = 'display:none;'

        const copy = clsButtonCommand.copyBtn();
        const cut = clsButtonCommand.cutBtn();
        const paste = clsButtonCommand.pasteBtn();
        const deleteBt = clsButtonCommand.deleteBtn();

        div.appendChild(copy);
        div.appendChild(cut);
        div.appendChild(paste);
        div.appendChild(deleteBt);

        return div;
    }

}

/* #endregion */

/* #region  Reversible - Command - Decorator.js---------------------------------------------------- */

class ReversibleCommandDecorator { //Implement ICommand, IReversibleCommand
    /**
     * @param command - command implement ICommand
     * @param {CommandHistory} commandHistory - object of CommandHistory class
     * @param {function} extractStateFunction - function to get old state before executing command
     * @param {function} restoreStateFunction - function to restore old state before executing
     */
    constructor(command, commandHistory, extractStateFunction, restoreStateFunction) {
        Interface.ensureImplement(command, [ICommand])
        this.command = command;
        this.commandHistory = commandHistory;
        this.undoState = [];
        this.redoState = [];
        this.timeStamp = Date.now();
        this.extractStateFunction = extractStateFunction;
        this.restoreStateFunction = restoreStateFunction;
    }
    execute() {
        this.undoState = this.extractStateFunction();
        this.command.execute();
        this.commandHistory.pushToUndoStack(this);
    }

    undo() {
        this.redoState = this.extractStateFunction();
        this.restoreStateFunction(this.undoState);
    }

    redo() {
        this.undoState = this.extractStateFunction();
        this.restoreStateFunction(this.redoState);
    }

}

/* #endregion __________________________________________________________________*/

class Command { //Implement ICommand
    constructor(action, ...params) {
        this.timeStamp = Date.now();
        this.action = action;
        this.params = params;
    }
    execute() {
        this.action(...this.params);
    }
}


/* #region   command - history.js------------------------------------------------------------*/

class CommandHistory {
    constructor() {
        this.limit = 100;
        this.undoStack = [];
        this.redoStack = [];
    }

    _isCommandExistedInRedoStack(command) {
        const latestCommand = this.redoStack[0];
        if (!latestCommand) return false;
        return command.timeStamp <= latestCommand.timeStamp;
    }


    pushToUndoStack(command) {
        Interface.ensureImplement(command, [ICommand, IReversibleCommand]);
        //check if the command is new then reset redo stack
        if (!this._isCommandExistedInRedoStack(command)) {
            this.redoStack = [];
        }
        this.undoStack.push(command);
        if (this.undoStack.length > this.limit) {
            this.undoStack.shift();
        }
    }

    popFromUndoStack() {
        let lastCommand = this.undoStack.pop();
        if (lastCommand) {
            this.redoStack.push(lastCommand);
        }
        return lastCommand;
    }

    popFromRedoStack() {
        return this.redoStack.pop();
    }

    reset() {
        this.undoStack = [];
        this.redoStack = [];
    }
}

const commandHistory = new CommandHistory();
const selfHealingCommandHistory = new CommandHistory();


/* #endregion ___________________________________________________________________*/


/* #region  command - generators.js------------------------------------------------------ */
const generateAddCommand = () => new ReversibleCommandDecorator(new Command(addAction), commandHistory, extractInformationFromRecordGrid, restoreRecords);
const generateDeleteAllCommand = () => new ReversibleCommandDecorator(new Command(deleteAllAction), commandHistory, extractInformationFromRecordGrid, restoreRecords);
const generateCopyCommand = () => new Command(copyAction);
const generatePasteCommand = () => new ReversibleCommandDecorator(new Command(pasteAction), commandHistory, extractInformationFromRecordGrid, restoreRecords);
const generateSetBreakpointCommand = () => new ReversibleCommandDecorator(new Command(setBreakpointAction), commandHistory, extractInformationFromRecordGrid, restoreRecords);
const generateDeleteSelectedCommand = () => new ReversibleCommandDecorator(new Command(deleteSelectedAction), commandHistory, extractInformationFromRecordGrid, restoreRecords);
const generateUndoCommand = () => new UndoCommand(commandHistory);
const generateRedoCommand = () => new RedoCommand(commandHistory);


const generatePlayFromHereCommand = (index) => {
    return () => new Command(playFromHereAction, index);
}
const generatePlaySpecificRecordCommand = (index) => {
    return () => new Command(playCommandAction, index);
}

const generatePlayToHereCommand = () => {
    return () => new Command(playToHereAction);
}

const generateRecordFromHereCommand = () => {
    return () => new Command(recordFromHereAction);
}

const generateSelectAllCommand = () => new Command(selectAllAction);

const generateEditCommandToolbarCommand = (commandToolbarID) => {
    return new ReversibleCommandDecorator(
        new Command(_ => { }),
        commandHistory,
        () => {
            return extractRecordGridWhenEditCommandToolBar(commandToolbarID);
        },
        restoreRecords
    );
}

const generateEditTargetToolbarCommand = (index, oldValue) => {
    return new ReversibleCommandDecorator(
        new Command(changeCommandTargetAction, index, oldValue),
        commandHistory,
        () => {
            return extractRecordGridWhenEditCommandToolBar("command-target");
        },
        restoreRecords
    );
}

const generateDropdownCommandToolbarCommand = () => {
    return new ReversibleCommandDecorator(
        new Command(() => { }),
        commandHistory,
        extractInformationFromRecordGrid,
        restoreRecords
    );
}

const generateDragAndDropCommand = () => {
    return new ReversibleCommandDecorator(
        new Command(_ => { }),
        commandHistory,
        extractInformationFromRecordGrid,
        restoreRecords);
}

const generateAddValuesToDefaultProfileACommand = () => {
    return new ReversibleCommandDecorator(new Command(addValuesToDefaultProfileAction), commandHistory, extractInformationFromRecordGrid, restoreRecords);
}


/* #endregion */

/* #region  button - selected - row.js------------------------------------------------- */
class clsButtonSelected {
    static deleteBtn(i) {
        //add btn delete
        const div = document.createElement('div');
        div.id = 'grid-delete-btn' + i;
        div.setAttribute("class", "grid-delete-btn tooltips");
        div.setAttribute("tooltip", "Delete");

        div.addEventListener('click', function (event) {
            const deleteSelected = generateDeleteSelectedCommand();
            deleteSelected.execute();
            trackingDeleteTestStep('UI');
            isUI = true;
        });

        div.addEventListener('mouseover', function (event) {
            $('.selectedRecord').addClass('removeRecord');
        });

        div.addEventListener('mouseout', function (event) {
            $('.selectedRecord').removeClass('removeRecord');
        });

        const delBtn = document.createElement('img');
        delBtn.src = 'icons/delete-tag.svg';
        div.appendChild(delBtn);

        const span = document.createElement('span');
        div.appendChild(span);

        return div;
    }

    static addBtn(i) {
        //add btn add
        const div = document.createElement('div');
        div.id = 'grid-add-btn' + i;
        div.setAttribute("class", "grid-add-btn tooltips");
        div.setAttribute("tooltip", "Add");

        div.addEventListener('click', function (event) {
            const addCommand = generateAddCommand();
            addCommand.execute();
            trackingAddTestStep('UI');
            isUI = true;
            $('#grid-add-btn').hide();
        });

        const addBtn = document.createElement('img');
        addBtn.src = 'icons/add-icon.svg';
        div.appendChild(addBtn);

        const span = document.createElement('span');
        div.appendChild(span);

        return div;
    }

    static copyBtn(i) {
        const div = document.createElement('div');
        div.id = 'grid-copy-btn' + i;
        div.setAttribute("class", "grid-copy-btn tooltips");
        div.setAttribute("tooltip", "Copy");

        div.addEventListener('click', function (event) {
            const copyCommand = generateCopyCommand();
            copyCommand.execute();
            trackingCopyTestStep('UI');
            isUI = true;
        });

        const copyBtn = document.createElement('img');
        copyBtn.src = 'icons/copy.svg';
        div.appendChild(copyBtn);

        const span = document.createElement('span');
        div.appendChild(span);

        return div;
    }

    static cutBtn(i) {
        const div = document.createElement('div');
        div.id = 'grid-cut-btn' + i;
        div.setAttribute("class", "grid-cut-btn tooltips");
        div.setAttribute("tooltip", "Cut");

        div.addEventListener('click', function (event) {
            const copyCommand = generateCopyCommand();
            copyCommand.execute();
            let deleteSelectedCommand = generateDeleteSelectedCommand();
            deleteSelectedCommand.execute();
            trackingCopyTestStep('UI');
            isUI = true;
        });

        const cutBtn = document.createElement('img');
        cutBtn.src = 'icons/cut.svg';
        div.appendChild(cutBtn);

        const span = document.createElement('span');
        div.appendChild(span);

        return div;
    }

    static pasteBtn(i) {
        const div = document.createElement('div');
        div.id = 'grid-paste-btn' + i;
        div.setAttribute("class", "grid-paste-btn tooltips");
        div.setAttribute("tooltip", "Paste");

        div.addEventListener('click', function (event) {
            const pasteCommand = generatePasteCommand();
            pasteCommand.execute();
            trackingPasteTestStep('UI');
            isUI = true;
        });

        const pasteBtn = document.createElement('img');
        pasteBtn.src = 'icons/paste.svg';
        div.appendChild(pasteBtn);

        const span = document.createElement('span');
        div.appendChild(span);

        return div;
    }

    static undoBtn(i) {
        const div = document.createElement('div');
        div.id = 'grid-undo-btn' + i;
        div.setAttribute("class", "grid-undo-btn tooltips");
        div.setAttribute("tooltip", "Undo");

        div.addEventListener('click', function (event) {
            const undoCommand = generateUndoCommand();
            undoCommand.execute();
        });

        const undoBtn = document.createElement('img');
        undoBtn.src = '/katalon/images/SVG/new-undo-arrow.svg';
        div.appendChild(undoBtn);

        const span = document.createElement('span');
        div.appendChild(span);

        return div;
    }

    static redoBtn(i) {
        const div = document.createElement('div');
        div.id = 'grid-redo-btn' + i;
        div.setAttribute("class", "grid-redo-btn tooltips");
        div.setAttribute("tooltip", "Redo");

        div.addEventListener('click', function (event) {
            const redoCommand = generateRedoCommand();
            redoCommand.execute();
        });

        const redoBtn = document.createElement('img');
        redoBtn.src = '/katalon/images/SVG/new-redo-arrow.svg';
        div.appendChild(redoBtn);

        const span = document.createElement('span');
        div.appendChild(span);

        return div;
    }

    static globalVarBtn(i) {
        const div = document.createElement('div');
        div.id = 'grid-add-global-variable-btn' + i;
        div.setAttribute("class", "grid-add-global-variable-btn");

        div.addEventListener('click', function (event) {
            const command = generateAddValuesToDefaultProfileACommand();
            command.execute();
        });

        const globalVarBtn = document.createElement('img');
        globalVarBtn.src = '/katalon/images/SVG/add-to-default-profile-icon.svg';
        div.appendChild(globalVarBtn);

        const span = document.createElement('span');
        div.appendChild(span);

        return div;
    }

    static toolbarBtn(i) {
        const div = document.createElement('div');
        div.id = 'toolbar-btn' + i;
        div.setAttribute('class', 'toolbar-btn');
        div.style = 'display:none;'

        const divAdd = clsButtonSelected.addBtn(i);
        const copy = clsButtonSelected.copyBtn(i);
        const cut = clsButtonSelected.cutBtn(i);
        const paste = clsButtonSelected.pasteBtn(i);
        const undo = clsButtonSelected.undoBtn(i);
        const redo = clsButtonSelected.redoBtn(i);
        const divDelete = clsButtonSelected.deleteBtn(i);
        // const globalVar = globalVarBtn(i);

        div.appendChild(divAdd);
        div.appendChild(copy);
        div.appendChild(cut);
        div.appendChild(paste);
        div.appendChild(undo);
        div.appendChild(redo);
        div.appendChild(divDelete);

        return div;
    }
}




/* #endregion ---------------------------------------------------------*/

/* #region   attach - event.js--------------------------------------------------------------*/

function makeTableSortable(table) {
    $(table).sortable({
        axis: "y",
        items: "tr",
        scroll: true,
        revert: 200,
        scrollSensitivity: 20,
        helper: function (e, tr) {
            let $originals = tr.children();
            let $helper = tr.clone();
            $helper.children().each(function (index) {
                $(this).width($originals.eq(index).width());
            });
            return $helper;
        },
        update: function (event, ui) {
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

    $(".tooltips").mouseenter(function () {
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
            const toolbarDiv = clsButtonSelected.toolbarBtn(i);
            node.firstChild.appendChild(toolbarDiv);
        }

        if ($(node.childNodes[2]).find('#toolbar-command-btn' + i).length == 0) {
            //add toolbar for target
            const div = clsButtonCommand.toolbarCommandBtn(i);
            node.childNodes[1].appendChild(div);
        }

        if ($(node.childNodes[2]).find('#toolbar-target-btn' + i).length == 0) {
            //add toolbar for target
            const div = clsButtonTarget.toolbarTargetBtn(i);
            node.childNodes[2].appendChild(div);
        }

        if ($(node.childNodes[2]).find('#toolbar-value-btn' + i).length == 0) {
            //add toolbar for target
            const div = clsButtonValue.toolbarValueBtn(i);
            node.lastChild.appendChild(div);
        }

        clsInputTarget.dropdownTarget(node.childNodes[2])

        // click firstchild to select row
        node.firstChild.addEventListener("click", function (event) {
            if (!$(event.target).parents('#toolbar-btn').hasClass('toolbar-btn')) {
                //remove all
                hideToolbar();
                clsInputCommand.removeInputCommand();
                clsInputTarget.removeInputTarget();
                clsInputValue.removeInputValue();

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
        node.addEventListener("contextmenu", function (event) {
            // use jquery's API to add and remove class property
            $('#records-grid .selectedRecord').removeClass('selectedRecord');
            $(".record-bottom").removeClass("active");
            //reset input
            hideToolbar();
            $('.selectedTd').removeClass('selectedTd');
            clsInputCommand.removeInputCommand();
            clsInputTarget.removeInputTarget();
            clsInputValue.removeInputValue();

            // show on grid toolbar
            var ref = event.target.parentNode;
            if (ref.tagName != "TR") {
                ref = ref.parentNode;
            }

            $(ref).addClass('selectedRecord');
        }, false);

        //interact with command
        node.childNodes[1].addEventListener("click", function (event) {
            //reset element
            hideToolbar();
            $('.selectedTd').removeClass('selectedTd');
            clsInputTarget.removeInputTarget();
            clsInputValue.removeInputValue();

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
        node.childNodes[2].addEventListener("click", function (event) {
            //reset element
            hideToolbar();
            $('.selectedTd').removeClass('selectedTd');
            // if ($(this).parents('.selectedRecord').find('.toolbar-btn').is(':visible')) {
            //     $('.toolbar-btn').hide();
            // }
            clsInputCommand.removeInputCommand();
            clsInputValue.removeInputValue();

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
        node.lastChild.addEventListener("click", function (event) {
            //reset element
            hideToolbar();
            $('.selectedTd').removeClass('selectedTd');
            clsInputCommand.removeInputCommand();
            clsInputTarget.removeInputTarget();

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

/* #endregion ----------------------------------------*/


/* #region  escape.js ---------------------------------------------------------------*/
function unescapeHtml(str) {
    return str
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, "\"")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&#39;/gi, "'");
}

function escapeAttr(str) {
    var spaceS = 0;
    var spaceE = -1;
    var tempStr = str;
    var tempAttr = "";
    var tempValue = "";
    var processedTag = "";
    var flag = false;

    do {
        spaceS = str.indexOf(" ");
        spaceE = str.indexOf(" ", spaceS + 1);

        if (spaceE >= 0) {
            while (str.charAt(spaceE - 1) != "\'" && str.charAt(spaceE - 1) != "\"") {
                spaceE = str.indexOf(" ", spaceE + 1);
                if (spaceE < 0)
                    break;
            }
        }

        //if there is space, then split string
        if (spaceS >= 0 && spaceE >= 0) {
            tempAttr = str.substring(spaceS + 1, spaceE);
            tempStr = str.substring(0, spaceS + 1);
            str = str.substring(spaceE);
        } else if (spaceS >= 0 && spaceE < 0) {
            tempAttr = str.substring(spaceS + 1, str.length - 1);
            tempStr = str.substring(0, spaceS + 1);
            str = "";
        } else {
            //flag is check that has string been processed
            if (flag)
                processedTag += ">";
            else
                processedTag = str;
            break;
        }

        flag = true;
        var equal = tempAttr.indexOf("=");

        if (tempAttr.charAt(equal + 1) == "\'") {
            //divide the single quote
            if (tempAttr.indexOf("\'") != -1) {
                var quotS = tempAttr.indexOf("\'");
                var quotE = tempAttr.lastIndexOf("\'");
                tempValue = tempAttr.substring(quotS + 1, quotE);
                tempAttr = tempAttr.substring(0, quotS + 1);
                tempValue = replaceChar(tempValue);
                tempAttr += tempValue + "\'";
            }
        }
        if (tempAttr.charAt(equal + 1) == "\"") {
            //divide the double quote
            if (tempAttr.indexOf("\"") != -1) {
                var dquotS = tempAttr.indexOf("\"");
                var dquotE = tempAttr.lastIndexOf("\"");
                tempValue = tempAttr.substring(dquotS + 1, dquotE);
                tempAttr = tempAttr.substring(0, dquotS + 1);
                tempValue = replaceChar(tempValue);
                tempAttr += tempValue + "\"";
            }
        }
        //merge the splited string
        processedTag += tempStr + tempAttr;
    } while (true)

    return processedTag;
};

//escape the character "<".">"."&"."'".'"'
function doEscape(str) {
    return str.replace(/[&"'<>]/g, (m) => ({ "&": "&amp;", '"': "&quot;", "'": "&#39;", "<": "&lt;", ">": "&gt;" })[m]);
}

//append
function checkType(cutStr, replaceStr, mode) {
    switch (mode) {
        case 1:
            return cutStr += replaceStr + "&amp;";
            break;
        case 2:
            return cutStr += replaceStr + "&quot;";
            break;
        case 3:
            return cutStr += replaceStr + "&#39;";
            break;
        case 4:
            return cutStr += replaceStr + "&lt;";
            break;
        case 5:
            return cutStr += replaceStr + "&gt;";
            break;
        default:
            return cutStr;
            break;
    }
}

//avoid &amp; to escape &amp;amp;
function replaceChar(str) {
    //escape the character
    var pos = -1;
    var cutStr = "";
    var replaceStr = "";
    var doFlag = 0;
    var charType;

    while (true) {
        pos = str.indexOf("&", pos + 1);
        charType = 0;
        if (pos != -1) {
            if (str.substring(pos, pos + 5) == "&amp;") {
                charType = 1;
                replaceStr = str.substring(0, pos);
                str = str.substring(pos + 5);
            } else if (str.substring(pos, pos + 6) == "&quot;") {
                charType = 2;
                replaceStr = str.substring(0, pos);
                str = str.substring(pos + 6);
            } else if (str.substring(pos, pos + 5) == "&#39;") {
                charType = 3;
                replaceStr = str.substring(0, pos);
                str = str.substring(pos + 5);
            } else if (str.substring(pos, pos + 4) == "&lt;") {
                charType = 4;
                replaceStr = str.substring(0, pos);
                str = str.substring(pos + 4);
            } else if (str.substring(pos, pos + 4) == "&gt;") {
                charType = 5;
                replaceStr = str.substring(0, pos);
                str = str.substring(pos + 4);
            }

            if (charType != 0) {
                //replaceStr = str.substring(0,pos);
                //str = str.substring(pos+5);
                pos = -1;
                //replaceStr = replaceStr.replace(/[&"'<>]/g, (m) => ({ "&": "&amp;", '"': "&quot;", "'": "&#39;", "<": "&lt;", ">": "&gt;" })[m]);
                replaceStr = doEscape(replaceStr);
                //cutStr += replaceStr + "&amp;";
                cutStr = checkType(cutStr, replaceStr, charType);
                doFlag = 1;
            }
        } else {
            cutStr += str;
            break;
        }
    }
    if (doFlag == 0)
        //return str.replace(/[&"'<>]/g, (m) => ({ "&": "&amp;", '"': "&quot;", "'": "&#39;", "<": "&lt;", ">": "&gt;" })[m]);
        return doEscape(str);
    else
        return cutStr;
}

//check the HTML value
function escapeHTML(str) {
    var smallIndex = str.indexOf("<");
    var greatIndex = str.indexOf(">");
    var tempStr = "";
    var tempTag = "";
    var processed = "";
    var tempSmallIndex = 0;

    while (true) {
        //find the less target
        if (smallIndex >= 0) {
            //find the greater target
            if (greatIndex >= 0) {
                do {
                    //split foreward string
                    smallIndex += tempSmallIndex;
                    tempStr = str.substring(0, smallIndex);
                    //split the tags
                    tempTag = str.substring(smallIndex, greatIndex + 1);
                    tempSmallIndex = tempTag.lastIndexOf("<");

                } while (tempSmallIndex != 0)

                //escape attributes in the tag
                tempTag = escapeAttr(tempTag);

                str = str.substring(greatIndex + 1);
                //check if the tag is script
                // if(tempTag.toLowerCase().indexOf("script")>=0)
                // tempTag = replaceChar(tempTag);

                //merge them up
                processed += replaceChar(tempStr) + tempTag;
            } else {
                replaceChar(str);
                break;
            }
        } else {
            replaceChar(str);
            break;
        }
        //going to do next tag
        smallIndex = str.indexOf("<");
        greatIndex = 0;
        do {
            //avoid other >
            greatIndex = str.indexOf(">", greatIndex + 1);
        } while (greatIndex < smallIndex && greatIndex != -1)
    }

    if (str != "")
        processed += replaceChar(str);

    return processed;
};

/* #endregion */

/* #region  models  --------------------------------------------------------------------------------*/
const generateUUID = () => {
    let d = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

class TestCommand {
    /**
     * Create a TestCommand
     *
     * @param {string} name
     * @param {string} defaultTarget
     * @param {string[]} targets
     * @param {string} value
     */
    constructor(name = "", defaultTarget = "", targets = [], value = "") {
        this.name = name;
        this.defaultTarget = defaultTarget;
        this.targets = targets;
        this.value = value;
        this.status = null;
        this.state = null;
    }

    setTestCommand(command) {
        let keys = ['name', 'defaultTarget', 'targets', 'value', 'status', 'state'];
        let newCommand = new TestCommand();

        for (const key of keys) {
            if (command[key]) {
                newCommand[key] = command[key];
            }
        }
        return newCommand;
    }
}


class TestCase {
    /**
     * Create a TestCase
     * TestCase's id will be an UUID string
     * @param {string} name - Test case name
     * @param {TestCommand[]} commands - List of commands belonging to test case
     * @param {tags[]} tags - List of tags belonging to test case
     */
    constructor(name = "", commands = [], tags = []) {
        this.id = generateUUID();
        this.name = name;
        this.commands = commands;
        this.tags = tags;
    }

    /***
     *
     * @returns {number}
     */
    getTestCommandCount() {
        return this.commands.length;
    }

    insertCommandToIndex(index, testCommand) {
        this.commands.splice(index, 0, testCommand);
    }

    removeCommandAtIndex(index) {
        return this.commands.splice(index, 1)[0];
    }

    setTestCase(testcase) {
        let keys = ['name', 'commands', 'tags'];
        let testCase = new TestCase();

        for (const key of keys) {
            if (testcase[key]) {
                testCase[key] = testcase[key];
            }
        }
        return testCase;
    }
}




class TestSuite {
    /**
     * Create a TestSuite
     * TestSuite's id will be an UUID string
     * @param {string} name - TestSuite's name
     * @param {string} status - TestSuite's status
     * @param {TestCase[]} testCases - List of TestCase objects belonging to test case
     */
    constructor(name = "", status = "", testCases = [], query = "") {
        if (testCases === undefined) {
            testCases = [];
        }
        this.id = generateUUID();
        this.name = name;
        this.status = status;
        this.testCases = testCases;
        this.query = query;
    }

    getTestCaseCount() {
        return this.testCases.length;
    }

    findTestCaseIndexByID(testCaseID) {
        return this.testCases.findIndex(testCase => testCase.id === testCaseID);
    }

    insertNewTestCase(index, testCase) {
        this.testCases.splice(index, 0, testCase);
    }

    setTestSuite(testsuite) {
        let keys = ['name', 'status', 'testCases', 'query'];
        let testSuite = new TestSuite();

        for (const key of keys) {
            if (testsuite[key]) {
                testSuite[key] = testsuite[key];
            }
        }
        return testSuite;
    }

}

/* #endregion */

/* #region  PARSE.js --------------------------------------------------------------------- */

const predefinedEntityMap = {
    "&amp;": "&",
    "&quot;": `"`,
    "&lt;": "<",
    "&gt;": ">"
}

function parsePredefinedEntity(value) {
    let changedValue = value;
    for (const entity of Object.keys(predefinedEntityMap)) {
        changedValue = changedValue.replaceAll(entity, predefinedEntityMap[entity]);
    }
    return changedValue;
}

/**
 * get default target and target list from <td> string
 * @param {HTMLElement} targetElement - a <td> pairs that contains data about command's target
 * @returns {{defaultTarget: string, targetList: string[]}}
 */
function parseTarget(targetElement) {
    const commandDefaultTarget = parsePredefinedEntity(targetElement.childNodes[0].data ?? "");
    const commandTargetList = [...targetElement.querySelectorAll("option")].map(element => {
        return parsePredefinedEntity(element.innerHTML);
    });
    return { defaultTarget: commandDefaultTarget, targetList: commandTargetList }
}

/**
 * parse HTML <table> string to TestCase object
 *
 * @param {HTMLElement} testCaseElement - HTML <table> string
 * @returns {null|TestCase} - parsed TestCase object
 */
function parseTestCase(testCaseElement) {
    const testCasetd = testCaseElement.querySelector("thead>tr>td");
    const testCaseTitle = testCasetd.innerHTML;
    let testCaseTags = [];
    if (testCasetd.dataset.tags) {
        testCaseTags = testCasetd.dataset.tags.indexOf(',') > -1 ? testCasetd.dataset.tags.split(',') : [testCasetd.dataset.tags];
    }
    const testCase = new TestCase();
    testCase.name = testCaseTitle;
    testCase.tags = testCaseTags.filter(e => e !== "");
    const commandElements = testCaseElement.querySelectorAll("tbody tr");
    for (const commandElement of commandElements) {
        const commandPartElements = commandElement.querySelectorAll("td");
        const commandName = parsePredefinedEntity(commandPartElements[0].innerHTML);
        const commandValue = parsePredefinedEntity(commandPartElements[2].innerHTML);
        const { defaultTarget: commandDefaultTarget, targetList: commandTargetList } = parseTarget(commandPartElements[1]);
        const command = new TestCommand(commandName, commandDefaultTarget, commandTargetList, commandValue);
        testCase.commands.push(command);
    }
    return testCase;
}

/**
 * parse HTML string to TestSuite object
 * @param suiteName
 * @param suiteHTLMString
 * @returns {TestSuite}
 */
const unmarshall = (suiteName, suiteHTLMString) => {
    if (!suiteHTLMString) {
        throw "Incorrect format";
    }
    try {
        let testSuite = new TestSuite(suiteName);
        const doc = new DOMParser().parseFromString(suiteHTLMString, "text/html");
        const testCaseElements = doc.getElementsByTagName("table");
        for (const testCaseElement of testCaseElements) {
            const testCase = parseTestCase(testCaseElement);
            testSuite.testCases.push(testCase);
        }
        return testSuite;
    } catch (e) {
        throw "Incorrect format";
    }

}


/**
 * convert TestCommand object to pre-defined HTML string format
 * @param {TestCommand} command
 * @returns {string}
 */
function marshallCommand(command) {
    let targetListHTML = command.targets.map(target => `<option>${target}</option>`).join('');
    return `<tr><td>${command.name}</td><td>${command.defaultTarget}<datalist>${targetListHTML}</datalist></td><td>${command.value}</td></tr>`
}

/**
 * convert TestCase object to pre-defined HTML string format
 * @param {TestCase} testCase
 * @returns {string}
 */
function marshallTestCase(testCase) {
    let commandsHTMLString = testCase.commands.map(command => marshallCommand(command)).join('\n');
    return `<table cellpadding="1" cellspacing="1" border="1">
<thead>
<tr><td rowspan="1" colspan="3" data-tags="${testCase.tags.toString()}">${testCase.name}</td></tr>
</thead>
<tbody>
${commandsHTMLString}
</tbody></table>`
}

/**
 * convert TestSuite object to pre-defined HTML string format
 * @param {TestSuite} testSuite
 * @returns {string}
 */
const marshall = (testSuite) => {
    let testCasesHTMLString = testSuite.testCases.map(testCase => marshallTestCase(testCase)).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta content="text/html; charset=UTF-8" http-equiv="content-type" />
<title>${testSuite.name}</title>
</head>
<body>
${testCasesHTMLString}
</body>
</html>`
}

/**
 * parse test suite name from HTML string
 * @param htmlString
 * @returns {string}
 */
const parseSuiteName = (htmlString) => {
    const pattern = /<title>(.*)<\/title>/gi;
    const suiteName = pattern.exec(htmlString)[1];
    return suiteName;
}



/* #endregion end parse----------------------------------------------------------------------------------------------------*/


/* #region  TEST-SUITES-SERVICE.JS ------------------------------------------------------------------------*/
/**
 * delete all TestSuite in in-memory data object and return the deleted TestCase object
 */
function deleteAllTestSuite() {
    return KRData.removeAllTestSuites();
}

/**
 * delete TestSuite in in-memory data object and return the deleted TestCase object
 * @param {string} testSuiteID - TestSuite's id
 * @returns {TestSuite} - delete TestCase object
 */
function deleteTestSuite(testSuiteID) {
    if (testSuiteID === undefined || testSuiteID === null) {
        throw "Null or undefined testSuiteID"
    }
    return KRData.removeTestSuite(testSuiteID);

}

/**
 * create a new TestSuite object and save it into in-memory data object
 * @param {string} title - TestSuite's name
 * @returns {TestSuite}
 */
const createTestSuite = (title = "Untitled Test Suite", status) => {
    title = title !== null ? title : "Untitled Test Suite";
    status = status !== undefined ? status : "normal";
    const testSuite = new TestSuite(title, status);
    KRData.testSuites.push(testSuite);
    return testSuite;
}


/**
 * add new TestSuite object to in-memory data object
 * @param {TestSuite} testSuite
 * @returns {string} sideex-id go with that TestSuite
 */
const addTestSuite = (testSuite) => {
    if (testSuite === undefined || testSuite === null) {
        throw "Null or undefined test suite";
    }
    KRData.testSuites.push(testSuite);
}

const getTestSuiteCount = () => {
    return KRData.getTestSuiteCount();
}

const getTextSuiteByIndex = (index) => {
    return KRData.testSuites[index];
}

const findTestSuiteById = (testSuiteID) => {
    return KRData.testSuites.find(testSuite => testSuite.id === testSuiteID);
}

const getAllTestSuites = () => {
    return KRData.testSuites.filter(e => e.status !== 'dynamic');
}

const getAllDynamicTestSuites = () => {
    return KRData.testSuites.filter(e => e.status === 'dynamic');
}

const getTagsData = () => {
    let tags = [];
    for (const testSuite of KRData.testSuites) {
        if (testSuite.status !== 'dynamic') {
            testSuite.testCases.find(e => {
                if (e.tags && e.tags.length > 0) {
                    tags.push(e.tags);
                }
            });
        }
    }

    tags = tags.flat(1);
    if (tags.length > 0) {
        tags = tags.filter(e => e !== "");
    }

    return [...new Set(tags)];
}

const getAllTestCases = () => {
    let testCases = [];
    for (const testSuite of KRData.testSuites) {
        if (testSuite.status !== 'dynamic') {
            testSuite.testCases.find(e => {
                e.testSuiteName = testSuite.name;
                testCases.push(e);
            });
        }
    }
    testCases = testCases.flat(1);
    return testCases;
}

const auditTags = () => {
    let tags = getTagsData();
    let testcaseList = getAllTestCases();
    let auditTag = [];

    auditTag = tags.map(element => {
        let testcases = testcaseList.filter(e => e.tags && e.tags.includes(element));
        return {
            tag: element,
            testcases: testcases
        }
    })

    return auditTag;
}

const findTestSuiteIndexByID = (testSuiteID) => {
    return KRData.testSuites.findIndex(testSuite => testSuite.id === testSuiteID);
}

const insertNewTestSuiteAtIndex = (index, testSuite) => {
    KRData.testSuites.splice(index, 0, testSuite);
}



/* #endregion */


/* #region   render - new- test - suites.js-------------------------------------------------------------------------------*/
function generateSuiteTitleElement(title) {
    const text = document.createElement("strong");
    text.classList.add("test-suite-title");
    text.innerHTML = escapeHTML(title);
    return text;
}

function testSuiteDropdownOpen(testSuiteID) {
    const testSuiteContainer = $(`#${testSuiteID}`)[0];
    const dropdownIcon = testSuiteContainer
        .getElementsByClassName("dropdown")[0]
        .getElementsByTagName("img")[0];
    $(dropdownIcon).attr("src", "/katalon/images/SVG/dropdown-arrow-on.svg");
    [...$(testSuiteContainer).find("p")].forEach(element => {
        $(element).css("display", "flex");
    });
}

function testSuiteDropdownClose(testSuiteID) {
    const testSuiteContainer = $(`#${testSuiteID}`)[0];
    const dropdownIcon = testSuiteContainer
        .getElementsByClassName("dropdown")[0]
        .getElementsByTagName("img")[0];
    $(dropdownIcon).attr("src", "/katalon/images/SVG/dropdown-arrow-off.svg");
    [...$(testSuiteContainer).find("p")].forEach(element => {
        $(element).css("display", "none");
    });
}


function testSuiteDropdownHandler(event) {
    const image = $(this).find("img");
    const src = $(image).attr("src");
    const id = this.parentNode.parentNode.id;
    if (src.includes("off")) {
        testSuiteDropdownOpen(id);
    } else {
        testSuiteDropdownClose(id);
    }
}

function generateDropdownIcon(status) {
    const dropdown = document.createElement("div");
    dropdown.classList.add("dropdown");

    let icon = document.createElement("img");
    if (status && status === 'dynamic') {
        icon.setAttribute("src", "");
    } else {
        dropdown.addEventListener("click", testSuiteDropdownHandler);

        icon.setAttribute("src", "/katalon/images/SVG/dropdown-arrow-off.svg");
    }

    dropdown.appendChild(icon);
    return dropdown;
}

function generateTestSuiteIcon() {
    const testSuiteIconDiv = document.createElement("div");
    testSuiteIconDiv.classList.add("testSuiteIcon");
    const icon = document.createElement("img");
    icon.setAttribute("src", "/katalon/images/SVG/paper-icon.svg");
    testSuiteIconDiv.appendChild(icon);
    return testSuiteIconDiv
}

function generateAddTestCaseIcon() {
    const testCasePlusDiv = document.createElement("div");
    testCasePlusDiv.setAttribute("class", "test-case-plus tooltip");

    const img = document.createElement("img");
    img.src = "/katalon/images/SVG/add-icon.svg";
    const span = document.createElement("span");
    span.classList.add("tooltiptext");
    span.innerText = "Create a new Test Case";

    testCasePlusDiv.appendChild(img);
    testCasePlusDiv.appendChild(span);

    testCasePlusDiv.addEventListener("click", function (event) {
        event.stopPropagation();
        $('#add-testCase').click();
    });
    return testCasePlusDiv;
}

function generateTestSuiteHeader() {
    const header = document.createElement("div");
    header.classList.add("test-suite-header");
    return header;
}

function generateTestSuiteContainerElement(id) {
    const container = document.createElement("div");
    container.setAttribute("id", id);
    container.setAttribute("contextmenu", "menu" + id);
    container.setAttribute("class", "message");
    return container;
}

function clickHandler(event) {
    //Users can undo changes made within a test case only
    //if user click on the current selected test suite and the current selected test case is also the first test case
    //in that test suite -> do not reset command history
    if (!this.classList.contains("selectedSuite") || getSelectedCase()?.id !== this.getElementsByTagName("p")[0]?.id) {
        commandHistory.reset();
        selfHealingCommandHistory.reset();
    }

    const testSuite = findTestSuiteById(this.id);
    const div_dynamic = document.getElementsByClassName('dynamic-test-suite')[0];
    if (testSuite.status === 'dynamic') {
        event.stopPropagation();
        saveOldCase();
        cleanSelected();
        this.classList.add("selectedSuite");

        if ($('#detail-dynamic').length > 0) {
            $('#detail-dynamic').remove();
        }
        const detail_div = generateDetailDynamicTestSuite(this.id);
        div_dynamic.appendChild(detail_div);

        div_dynamic.style.display = 'block';
        $('.command-section').hide();
        $('.title-testcase').hide();
        $("#profile-section").hide();
        $("#profileTitle").hide();
    } else {
        div_dynamic.style.display = 'none';;
        $('.command-section').show();
        $('.title-testcase').show();
        $("#profile-section").hide();
        $("#profileTitle").hide();
        $(".command-section").css("min-height", "30%");
        if (this.getElementsByTagName("p").length !== 0) {
            this.getElementsByTagName("p")[0].click();
        } else {
            event.stopPropagation();
            saveOldCase();
            cleanSelected();
            this.classList.add("selectedSuite");

            const testCaseList = this.getElementsByTagName("p");
            if (testCaseList.length > 0) {
                $(testCaseList[0]).click();
            }
        }
    }


}

function contextMenuHandler(event) {
    event.preventDefault();
    event.stopPropagation();
    saveOldCase();
    setSelectedSuite(this.id);
    let mid = "#" + "menu" + this.id;
    $(".menu").css("left", event.pageX).css("top", event.pageY);
    $(mid).show();
}


const renderNewTestSuite = (title, id, status) => {
    const dropdown = generateDropdownIcon(status);
    const testSuiteIcon = generateTestSuiteIcon();
    const suiteTitle = generateSuiteTitleElement(title);
    const addTestCase = generateAddTestCaseIcon();
    const header = generateTestSuiteHeader();

    header.appendChild(dropdown);
    header.appendChild(testSuiteIcon);
    header.appendChild(suiteTitle);
    if (!(status && status === 'dynamic')) {
        header.appendChild(addTestCase);
    }

    const container = generateTestSuiteContainerElement(id);
    container.append(header);

    //append new test suite container to testCase-grid
    if (status && status === 'dynamic') {
        document.getElementById("testCase-filter").appendChild(container);
    } else {
        let selectedTestSuite = getSelectedSuite();
        if (selectedTestSuite) {
            const testSuite = findTestSuiteById(selectedTestSuite.id);
            if (testSuite.status === status) {
                selectedTestSuite.parentNode.insertBefore(container, selectedTestSuite.nextSibling);
            } else {
                if (status === 'dynamic') {
                    document.getElementById("testCase-filter").appendChild(container);
                } else {
                    document.getElementById("testCase-grid").appendChild(container);
                }
            }
        } else {
            document.getElementById("testCase-grid").appendChild(container);
        }
    }
    //set added test suite as selected
    cleanSelected();
    container.classList.add("selectedSuite");
    const menu = generateTestSuiteContextMenu(id);
    container.appendChild(menu);
    // attach event
    container.addEventListener("click", clickHandler);
    container.addEventListener("contextmenu", contextMenuHandler);


    makeCaseSortable(container);
    //add context menu button
    addContextMenuButton(id, header, menu, 'suite');
    // enable play button
    enableButton("playSuites");
    enableButton("playSuite");
}
/* #endregion */

/* #region   REFERENCES-----------------------------------------------------------------*/
function enableButton(buttonId) {
    document.getElementById(buttonId).disabled = false;
}

function disableButton(buttonId) {
    document.getElementById(buttonId).disabled = true;
}

/* #endregion -----------------------------------------*/

var myConfig = {

    version: "0.8",
    rivImage: "https://drive.google.com/uc?export=view&id=1RiCH0CDRR1bCA3VNrlFkAuad6BaT3oKL",

    //defaultScript: "https://drive.google.com/file/d/1VY_J7vyIj8jemTvJNnUFlkl_rkuPMnpJ/view?usp=sharing",
    //defaultScript: "https://drive.google.com/file/d/1VY_J7vyIj8jemTvJNnUFlkl_rkuPMnpJ/view?usp=sharing",
    defaultScript: "https://drive.google.com/uc?export=view&id=1VY_J7vyIj8jemTvJNnUFlkl_rkuPMnpJ",




    devNoteRecorder_Create: "http://localhost:9870/api/record/create",
    devNoteRecorder_CreateOuput: "http://localhost:9870/api/record/result",
    devNoteRecorder_CreateLog: "http://localhost:9870/api/log2/create",
    devNoteRecorder_CreateErrorOuput: "http://localhost:9870/api/record/error",
    devNoteRecorder_Latest: "http://localhost:9870/api/playback/latest"

}

$(function () {

    initRivTech();
    initEnvironment();


    let xpathDialog = '/html/body/section/div[2]/article[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[3]/div/div[2]/div/div/div[1]';
    let caption = '/html/body/section/div[2]/article[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[3]/div/div[2]/div/div/div[2]/p';
    let myCaptionSelector = getElementByXpath(caption);
    let myTitleSelector = getElementByXpath(xpathDialog);
    let myTitle = $(myTitleSelector); //$('#test-suites-info-dialog > div > div > div.title');
    let myCaption = $(myCaptionSelector);
    if (myTitle[0]) {
        //console.log(myTitle[0].innerText);
        myTitle[0].innerText = "Update";
    }

    if (myCaption[0]) {
        //console.log(myTitle[0].innerText);
        myCaption[0].innerText = "Click to Update RivColl Test Suites";
    }

    $('test-suites-info').attr('style', { 'background': 'Black' });

    $('#test-suites-info').mouseover(function () {


        let xpathDialog = '/html/body/section/div[2]/article[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[3]/div/div[2]/div/div/div[1]';
        let caption = '/html/body/section/div[2]/article[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[3]/div/div[2]/div/div/div[2]/p';
        let myCaptionSelector = getElementByXpath(caption);
        let myTitleSelector = getElementByXpath(xpathDialog);
        let myTitle = $(myTitleSelector); //$('#test-suites-info-dialog > div > div > div.title');
        let myCaption = $(myCaptionSelector);
        if (myTitle[0]) {
            //console.log(myTitle[0].innerText);
            myTitle[0].innerText = "Update";
        }

        if (myCaption[0]) {
            //console.log(myTitle[0].innerText);
            myCaption[0].innerText = "Click to Update RivColl Test Suites";
        }

        //alert('Hello');
    });


    $('#testCase-container').click(function () {


        removeTags();
        //debugger;
        console.info('hide tags');
    });

    $('#workspace').mouseover(function () {

        removeTags();
    })

    $('#test-suites-info').click(async function () {

       
        let scriptList = await get_doc();
        let rawScript1 = scriptList.Scripts[0].testSuite;

        var decodedData = window.atob(rawScript1); 

        console.log(decodedData);
        await createBlob(decodedData);
        return;

    });

});

var updateResult;

async function get_doc() {
    var urlfile = myConfig.defaultScript;


    // Step 1: start the fetch and obtain a reader
    let response = await fetch(urlfile);

    const reader = response.body.getReader();

    // Step 2: get total length
    const contentLength = +response.headers.get('Content-Length');

    // Step 3: read the data
    let receivedLength = 0; // received that many bytes at the moment
    let chunks = []; // array of received binary chunks (comprises the body)
    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        chunks.push(value);
        receivedLength += value.length;

        console.log(`Received ${receivedLength} of ${contentLength}`)
    }

    // Step 4: concatenate chunks into single Uint8Array
    let chunksAll = new Uint8Array(receivedLength); // (4.1)
    let position = 0;
    for (let chunk of chunks) {
        chunksAll.set(chunk, position); // (4.2)
        position += chunk.length;
    }

    // Step 5: decode into a string
    let result = new TextDecoder("utf-8").decode(chunksAll);

    // We're done!
    let scriptList = JSON.parse(result);

    console.log(scriptList);
    //alert(commits[0].author.login);

    return scriptList;
}

async function createBlob(payload) {
    //chrome-extension://ljdobmomdgdljniojadhoplhkpialdid/panel/js/UI/services/html-service/load-html-file.js

    // require(['../../panel/js/UI/services/html-service/load-html-file.js'],async function (loadHTMLFile) {
    //     //foo is now loaded.

    // });

    let blob = new Blob([payload], { type: 'text/html' });
    blob["lastModifiedDate"] = "";
    blob["name"] = "Riv_SmokeTest.html";
    const testSuite = await loadHTMLFile(blob);

    addTestSuite(testSuite);
    displayNewTestSuite(testSuite);

    return testSuite;



}




const loadHTMLFile = (file) => {
    return new Promise((resolve, reject) => {
        if ((!file.name.includes(".krecorder") && !file.name.includes(".html")) && file.type !== "application/json") reject("Wrong file format");

        const reader = new FileReader();
        reader.readAsText(file);

        reader.onload = function () {
            let testSuiteHTMLString = reader.result;
            //testSuiteHTMLString = testSuiteHTMLString.split("\n").map(line => line.trim()).join("");
            let suiteName;
            if (file.name.lastIndexOf(".") >= 0) {
                suiteName = file.name.substring(0, file.name.lastIndexOf("."));
            } else {
                suiteName = file.name;
            }
            try {
                if (file.name.includes(".htm") || file.name.includes(".krecorder")) {
                    const testSuite = unmarshall(suiteName, testSuiteHTMLString);
                    resolve(testSuite);
                }
                if (file.name.includes(".json") && file.type === "application/json") {
                    const testSuite = JSON.parse(testSuiteHTMLString);
                    resolve(testSuite);
                }
            } catch (error) {
                reject(error);
            }

        };
        reader.onerror = function (e) {
            console.log("Error", e);
        };
    });
}

function initRivTech() {

    //$(document).attr('title', 'RivTech ver.' + manifestData.version + '.'+ config.version)     
    $('#workspace')[0].children[0].innerText = 'Rivtech ver.' + myConfig.version;
    let icon = $('#logo_kr_icon')[0];//.children[0].innerText ='Rivtech workspace';
    let image = icon.children[0];
    image.src = myConfig.rivImage;

    //     $('#logo_kr_icon').hide();
    //     setTimeout(function() { 
    //      $('#logo_kr_icon').show();
    //    }, 2000);

    let container_sel = '#toolbar-container > div > div.KR-logo';
    let $logoContainer = $(container_sel);
    //for adding clone elements
    var $selected_clone = $('#logo_kr_icon img').clone();
    $logoContainer.empty();
    $selected_clone.appendTo("#toolbar-container > div > div.KR-logo");
    $selected_clone.appendTo("#logo_kr_icon");

    $('#testCase-container-dynamic').hide();
    $('#profile-container').hide();
    $('#ka-upload').hide();
    $('#test-data-info')?.hide();
    $('#extension-script-info')?.hide();

    //$(document).attr('style', { 'background': 'Black' });
    $('#referral').hide();
    $('#notification').hide();
    $('#login-button').hide();
    $('#ka-open').hide();
    let adds_path = '/html/body/section/div[2]/article[1]/div[2]';
    let adds_selector = getElementByXpath(adds_path);
    $(adds_selector).hide();
}

function initEnvironment() {
    removeTags();
    //#steps-section > div.command-sample-section

    const cmdSection = document.querySelector("#steps-section > div.command-sample-section ");
    cmdSection.setAttribute('id', 'cmdSection1');

    //debugger;

    var options = [
        createElement('option', 'Test Environment', { value: 'Test' }),
        createElement('option', 'Prod-Test Environment', { value: 'Prod-Test' }),
        createElement('option', 'Dev Environment', { value: 'Dev' }),
        createElement('option', 'UAT Environment', { value: 'UAT' })
    ];

    // createElement('h1', 'Please Select 1 Option',
    //     { id: 'heading', style: 'color:skyblue;font-family:arial;text-align:center;' },
    //     null, 'wrapper') // append this one to #wrapper



    createElement('select', null,
        { id: 'SelectEnvironment1', name: 'SelectEnvironment1', style: 'width:100%;margin:0 0%; background: orange;' },
        [options[0], options[1], options[2], options[3]],
        'cmdSection1', '#steps-section > div.command-sample-section > div' // Append or prepend to body 
    );


}

function removeTags() {
    //#steps-section > div.command-sample-section > div.title-testcase
    //#div-add-tag-50b93be1-9bef-4c16-b27b-cd808890d485
    //#div-add-tag-50b93be1-9bef-4c16-b27b-cd808890d485 > span
    //#div-item-add-tag-50b93be1-9bef-4c16-b27b-cd808890d485

    let tag = $('#steps-section  div.command-sample-section  div.title-testcase div div');
    //debugger;

    tag.hide();
}



//LOADING SCRIPT

function getRecordLibrary() {

    //debugger;

    var url = myConfig.defaultScript;
    var settings = {
        "url": url,
        "method": "GET",
        "timeout": 0,
        "dataType": 'text/html'
    };
    $.ajax(settings).done(async function (response) {
        // var date = new Date();
        // console.log(date);

        //console.log(response);
        //debugger;
        await createBlob(response);


    });
}
function generateDropdownIcon(status) {
    const dropdown = document.createElement("div");
    dropdown.classList.add("dropdown");

    let icon = document.createElement("img");
    if (status && status === 'dynamic') {
        icon.setAttribute("src", "");
    } else {
        dropdown.addEventListener("click", testSuiteDropdownHandler);

        icon.setAttribute("src", "/katalon/images/SVG/dropdown-arrow-off.svg");
    }

    dropdown.appendChild(icon);
    return dropdown;
}

function generateTestSuiteIcon() {
    const testSuiteIconDiv = document.createElement("div");
    testSuiteIconDiv.classList.add("testSuiteIcon");
    const icon = document.createElement("img");
    icon.setAttribute("src", "/katalon/images/SVG/paper-icon.svg");
    testSuiteIconDiv.appendChild(icon);
    return testSuiteIconDiv
}
function generateSuiteTitleElement(title) {
    const text = document.createElement("strong");
    text.classList.add("test-suite-title");
    text.innerHTML = escapeHTML(title);
    return text;
}

function generateAddTestCaseIcon() {
    const testCasePlusDiv = document.createElement("div");
    testCasePlusDiv.setAttribute("class", "test-case-plus tooltip");

    const img = document.createElement("img");
    img.src = "/katalon/images/SVG/add-icon.svg";
    const span = document.createElement("span");
    span.classList.add("tooltiptext");
    span.innerText = "Create a new Test Case";

    testCasePlusDiv.appendChild(img);
    testCasePlusDiv.appendChild(span);

    testCasePlusDiv.addEventListener("click", function (event) {
        event.stopPropagation();
        $('#add-testCase').click();
    });
    return testCasePlusDiv;
}

function generateAddTestCaseIcon() {
    const testCasePlusDiv = document.createElement("div");
    testCasePlusDiv.setAttribute("class", "test-case-plus tooltip");

    const img = document.createElement("img");
    img.src = "/katalon/images/SVG/add-icon.svg";
    const span = document.createElement("span");
    span.classList.add("tooltiptext");
    span.innerText = "Create a new Test Case";

    testCasePlusDiv.appendChild(img);
    testCasePlusDiv.appendChild(span);

    testCasePlusDiv.addEventListener("click", function (event) {
        event.stopPropagation();
        $('#add-testCase').click();
    });
    return testCasePlusDiv;
}

function generateTestSuiteHeader() {
    const header = document.createElement("div");
    header.classList.add("test-suite-header");
    return header;
}

function generateTestSuiteContainerElement(id) {
    const container = document.createElement("div");
    container.setAttribute("id", id);
    container.setAttribute("contextmenu", "menu" + id);
    container.setAttribute("class", "message");
    return container;
}

const cleanSelected = () => {
    $('#testCase-grid .selectedCase').removeClass('selectedCase');
    $('#testCase-grid .selectedSuite').removeClass('selectedSuite');
    $('#testCase-filter .selectedSuite').removeClass('selectedSuite');
}

const getSelectedSuite = () => {
    let normalSelectedSuite = document.getElementById("testCase-grid").getElementsByClassName("selectedSuite");
    let dynamicSeletedSuite = document.getElementById("testCase-filter").getElementsByClassName("selectedSuite");

    if (normalSelectedSuite.length > 0) {
        return normalSelectedSuite[0];
    } else if (dynamicSeletedSuite.length > 0) {
        return dynamicSeletedSuite[0];
    } else {
        return null;
    }
}

const getSelectedCase = () => {
    if (document.getElementById("testCase-grid").getElementsByClassName("selectedCase")) {
        return document.getElementById("testCase-grid").getElementsByClassName("selectedCase")[0];
    } else {
        return null;
    }
}



const createTestCase = (title = "Untitled Test Case", testSuite) => {
    title = title !== null ? title : "Untitled Test Case";
    if (!testSuite) {
        throw "Null or undefined test suite"
    }

    const testCase = new TestCase(title);
    testSuite.testCases.push(testCase);
    return testCase;

}

/**
 * delete TestCase in in-memory data object and return the deleted TestCase object
 * @param {string} testCaseID - TestCase's id
 * @returns {TestCase} - delete TestCase object
 */
const deleteTestCase = (testCaseID) => {
    if (testCaseID === undefined || testCaseID === null) {
        throw "Null or undefined testCaseID"
    }
    return KRData.removeTestCase(testCaseID);
}

/**
 *
 * @param testCaseID
 * @returns {null|TestCase}
 */
const findTestCaseById = (testCaseID) => {
    const normalTestSuites = KRData.testSuites.filter(e => e.status !== "dynamic");
    for (const testSuite of normalTestSuites) {
        const testCase = testSuite.testCases.find(testCase => testCase.id === testCaseID);
        if (testCase !== undefined) return testCase;
    }
    return null;
}

/**
 *
 * @returns {number}
 */
const getAllTestCaseCount = (testCaseID) => {
    let count = 0;
    KRData.testSuites.forEach(testSuite => {
        count += testSuite.getTestCaseCount();
    });
    return count;
}

const getTag = (testCaseID) => {
    const testcaseObj = findTestCaseById(testCaseID);
    let tags = testcaseObj.tags && testcaseObj.tags.length > 0 ? testcaseObj.tags.filter(e => e !== "") : [];
    return tags;
}

/* #region   render - testcase - record - grid.js-----------------------------------------------------------------------------*/
const renderTestCaseToRecordGrid = (testCase) => {
    let recordGridContent = generateRecordGridHTML(testCase);
    if (recordGridContent) {
        clean_panel();
        if ($(".command-section").find("#records-grid").children().length > 0) {
            $(".command-section").css("min-height", "30%");
        }
        document.getElementById("records-grid").innerHTML = escapeHTML(recordGridContent);

        let count = testCase.getTestCommandCount();
        if (count !== 0) {
            reAssignId("records-1", "records-" + count);
            attachEvent(1, count);
            // addValueContextMenu(1, count);
            addProfileLinksForCommandValue(1, count);
        }
    } else {
        clean_panel();
    }
}

function generateHTMLOptionList(options) {
    return options.reduce((output, option) => {
        return output + `<option>${option}</option>`
    }, "");
}

function generateRecordGridHTML(testCase) {
    let output = "";
    testCase.commands.forEach(command => {
        let htmlOptionList = generateHTMLOptionList(command.targets);
        let commandClass = "",
            commandStateClass = "";
        if (command.status !== null) {
            commandClass = `class=${command.status}`;
        }
        if (command.state) {
            commandStateClass = `class=${command.state}`;
        }
        let new_tr = `<tr ${commandClass}>` + `<td></td><td ${commandStateClass}><div style="display: none;">` + command.name + '</div><div style="overflow:hidden;height:15px;">' + command.name + ' </div></td>' +
            '<td><div style="display: none;">' + command.defaultTarget + '</div><div style="overflow:hidden;height:15px;">' + command.defaultTarget + '</div>\n' + '<datalist>' + htmlOptionList + '</datalist>' + '</td>' +
            '<td><div style="display: none;">' + command.value + '</div><div class="value" style="display:flex">' + command.value + '</div></td>' + '</tr>';
        output = output + new_tr;
    });

    output = '<input id="records-count" value="' + ((!testCase.commands) ? 0 : testCase.commands.length) + '" type="hidden">' + output;
    return output;
}

/* #endregion */

var sideex_wait = {
    next_command_wait: false,
    done: true
};

var sideex_testCase = {
    count: 0
};

var sideex_testSuite = {
    count: 0
};

function clean_panel() {
    emptyNode(document.getElementById("records-grid"));
    // emptyNode(document.getElementById("command-target-list"));
    // emptyNode(document.getElementById("target-dropdown"));
    // document.getElementById("command-command").value = "";
    // document.getElementById("command-target").value = "";
    // document.getElementById("command-value").value = "";

    // document.getElementById("command-command").blur();
    // document.getElementById("command-target").blur();
    // document.getElementById("command-value").blur();

    // if (document.getElementById("target-dropdown").classList.contains('w3-show')) {
    //     document.getElementById("target-dropdown").classList.remove("w3-show");
    // }

    // if (document.getElementById("command-dropdown").classList.contains('w3-show')) {
    //     document.getElementById("command-dropdown").classList.remove("w3-show");
    // }

}

const setSelectedCase = (id) => {
    saveOldCase();
    const suite_id = document.getElementById(id).parentNode.id;
    setSelectedSuite(suite_id);
    $("#" + id).addClass('selectedCase');
    clean_panel();
    const testCaseContainer = document.getElementById(id);
    const testCaseID = testCaseContainer.id;
    const testCase = findTestCaseById(testCaseID);
    renderTestCaseToRecordGrid(testCase);
}

const setDynamicSelectedCase = (id) => {
    saveOldCase();
    $('#testCase-grid .selectedCase').removeClass('selectedCase');
    $("#" + id).addClass('selectedCase');
    clean_panel();
    const testCaseContainer = document.getElementById(id);
    const testCaseID = testCaseContainer.id;
    const testCase = findTestCaseById(testCaseID);
    renderTestCaseToRecordGrid(testCase);
}

const getRecordsArray = () => {
    return document.getElementById("records-grid").getElementsByTagName("tr");
}

/* #region  RECORD - utils.js------------------------------------------------------------------------------------------- */
function getTdRealValueNode(node, index) {
    return node.getElementsByTagName("td")[index].getElementsByTagName("div")[0];
}

function getTdShowValueNode(node, index) {
    return node.getElementsByTagName("td")[index].getElementsByTagName("div")[1];
}

function getTargetDatalist(node) {
    return node.getElementsByTagName("td")[2].getElementsByTagName("datalist")[0];
}

function getCommandName(tr, for_show) {
    if (for_show) {
        return getTdShowValueNode(tr, 1).textContent;
    }
    return getTdRealValueNode(tr, 1).textContent;
}

function getCommandTarget(tr, for_show) {
    if (for_show) {
        return getTdShowValueNode(tr, 2).textContent;
    }
    return getTdRealValueNode(tr, 2).textContent;
}

function getCommandValue(tr, for_show) {
    if (for_show) {
        return getTdShowValueNode(tr, 3).textContent;
    }
    return getTdRealValueNode(tr, 3).textContent;
}

function getCommandTargets(tr) {
    if (tr === undefined || !getTargetDatalist(tr)) {
        return [];
    }
    return [...getTargetDatalist(tr).getElementsByTagName("option")].map(ele => ele.textContent);
}

/* #endregion */


/* #region   global - profile - link -for-command - value.js-------------------------------------------*/
async function globalVariableClickHandler(event) {
    event.stopPropagation();
    if ($(event.target).hasClass("globalVariable")) {
        const defaultProfile = await getDefaultProfile();
        const regex = /(?<=\${GlobalVariable\.).+?(?=})/g
        const globalVariableName = event.target.innerHTML.match(regex)?.[0];
        const index = await defaultProfile.findIndexByName(globalVariableName);

        $(`#${defaultProfile.id}`)[0].selectedVariableIndex = index;
        $(`#${defaultProfile.id}`).click();
        openProfileList();
    }

}

const addProfileLinkForCommandValue = async (tr) => {
    const regex = /(?<=\${GlobalVariable\.).+?(?=})/g
    const commandValue = getCommandValue(tr);
    const globalVariable = commandValue.match(regex)?.[0];
    if (globalVariable) {
        const defaultProfile = await getDefaultProfile();
        const variable = await defaultProfile.findVariableByName(globalVariable);
        if (variable) {
            const htmlString = commandValue.replaceAll("${GlobalVariable", "<span class='globalVariable'>${GlobalVariable").replaceAll("}", "}</span>")
            getTdShowValueNode(tr, 3).innerHTML = "<span>" + htmlString + "</span>";
            getTdShowValueNode(tr, 3).addEventListener("click", globalVariableClickHandler);
            return;
        }
    }
    getTdShowValueNode(tr, 3).removeEventListener("click", globalVariableClickHandler);
    getTdShowValueNode(tr, 3).classList.remove("globalVariable");
}

const addProfileLinksForCommandValue = async (start, end) => {
    for (let i = start; i <= end; ++i) {
        const id = `records-${i}`;
        const trNode = document.getElementById(id);
        if (trNode !== null) {
            await addProfileLinkForCommandValue(trNode);
        }
    }

}
/* #endregion____________________________________________________________________*/


/* #region add - tag - to - testcase.js  */
var idTestCase;

function loadButtonTags() {
    if ($(`#button-tags${idTestCase}`).length > 0) {
        $(`#button-tags${idTestCase}`).remove();
        const buttonTag = generateButtonsTags();
        $("#add-tags-" + idTestCase).prepend(buttonTag);
    }

    if ($(`#div-button-tags${idTestCase}`).length > 0) {
        $(`#div-button-tags${idTestCase}`).remove();
        const buttonTag = addDivTagList();
        $("#div-item-add-tag-" + idTestCase).append(buttonTag);
    }
}

function addTagIntoTestcase(valueInput) {
    const testcaseObj = findTestCaseById(idTestCase);
    let tags = $(`#${idTestCase}`).attr('data-tags');
    let tagsString = valueInput.indexOf(',') > -1 ? valueInput.split(',') : [valueInput];
    tagsString = tagsString.filter(e => e !== "");

    if (tags) {
        let tagMap = tags.indexOf(',') > -1 ? tags.split(',') : [tags];
        for (const tag of tagsString) {
            if (tagMap.every(e => e !== tag)) {
                tagMap.push(tag);
            }
        }
        testcaseObj.tags = tagMap;
        tags = tagMap.join(',');
    } else {
        testcaseObj.tags = tagsString;
        tags = tagsString.toString();
        //show icon tag
        const iconTag = document.getElementById("tags-icon-" + idTestCase);
        iconTag.setAttribute("style", "visibility: visible;");
        iconTag.getElementsByTagName('img')[0].src = "/panel/icons/show-tag.svg";
    }

    loadButtonTags();

    $(`#${idTestCase}`).attr("data-tags", tags);
    trackingAddTag();
}

function quickDynamicDialog(query) {
    const div = document.createElement("div");
    div.setAttribute("id", "quick-actions");

    const filter = generateFilterTags(query, "Execute test case");
    const table = createTableDynamicTestSuite(query);

    const button = document.createElement("div");
    button.setAttribute("id", "button-quick-actions");
    button.setAttribute("style", "display: flex; margin-top: 20px; flex-direction: row; align-self: flex-end;");

    const span1 = document.createElement("span");
    span1.innerHTML = "Cancel";
    span1.setAttribute("style", "background: #F0F1F2;border-radius: 4px;padding: 5px 10px;font-family: Roboto;font-style: normal;font-size: 14px;line-height: 20px;cursor: pointer;");

    span1.addEventListener("click", function () {
        if ($('#quick-actions').is(":visible")) {
            $('#quick-actions').remove();
        }
    })

    const span2 = document.createElement("span");
    span2.innerHTML = "Execute";
    span2.setAttribute("style", "background: #276EF1;border-radius: 4px;padding: 5px 10px;font-family: Roboto;font-style: normal;font-size: 14px;line-height: 20px;color: #FFFFFF;margin-left: 10px;cursor: pointer;");

    span2.addEventListener("click", function () {
        let inputQuery;
        if ($('#quick-actions').is(":visible")) {
            inputQuery = $('#quick-actions').find("#input-dynamic").find("input").val();
            $('#quick-actions').remove();
        }

        createNewDynamicTestSuite(inputQuery);

        $("#play").click();
    })

    button.appendChild(span1);
    button.appendChild(span2);

    div.appendChild(filter);
    div.appendChild(table);
    div.appendChild(button);

    $(div)
        .dialog({
            dialogClass: "no-titlebar",
            autoOpen: false,
            resizable: true,
            height: "auto",
            width: 684,
            modal: true,
            open: function () {
                $(this).css("maxHeight", 400);
            }
        });
}

//add tag to contextmenu
const generateItemTag = (val) => {
    const box_item = document.createElement("div");
    box_item.innerHTML = val;

    box_item.addEventListener("click", function (e) {
        if (!e.target.src) {
            quickDynamicDialog(this.innerText);
            $("#quick-actions").dialog("open");
        }
    })

    const button_remove = document.createElement("img");
    button_remove.src = 'icons/remove.svg';

    button_remove.addEventListener("click", function (e) {
        let removeValue = this.parentNode.textContent;
        const testcaseObj = findTestCaseById(idTestCase);
        let tags = $(`#${idTestCase}`).attr('data-tags');
        let tagMap = tags.indexOf(',') > -1 ? tags.split(',') : [tags];

        tagMap = tagMap.filter(e => e !== removeValue);

        testcaseObj.tags = tagMap;
        $(`#${idTestCase}`).attr("data-tags", tagMap.toString());

        loadButtonTags();

        if (tagMap.length <= 0) {
            const iconTag = document.getElementById("tags-icon-" + idTestCase);
            iconTag.removeAttribute("style");
            iconTag.getElementsByTagName('img')[0].src = "/panel/icons/tags.svg";
        }
        trackingRemoveTag();

    });

    box_item.appendChild(button_remove);

    return box_item;
}

function generateButtonsTags() {
    const div_tag = document.createElement("div");
    div_tag.setAttribute("id", "button-tags" + idTestCase);
    div_tag.setAttribute("class", "button-tags");

    const span_tag = document.createElement("span");
    span_tag.innerHTML = "Click on a tag to filter and execute test cases"

    let tags = getTag(idTestCase);
    if (tags.length > 0) {
        div_tag.appendChild(span_tag)
        for (const val of tags) {
            const item_tags = generateItemTag(val);
            div_tag.appendChild(item_tags)
        }
    }

    return div_tag;
}

function generateAutocomplete() {
    const div_input = document.createElement("div");
    div_input.setAttribute("id", "div-input-tags");
    div_input.setAttribute("class", "div-input-tags");

    const span_input = document.createElement("span");
    span_input.setAttribute("id", "span-input-tags");
    span_input.setAttribute("class", "span-input-tags");
    span_input.innerHTML = "Tag this test case";

    const input_tag = document.createElement("INPUT");
    input_tag.setAttribute("id", "input-tags");
    input_tag.setAttribute("class", "input-tags");

    input_tag.addEventListener("keypress", function (e) {
        if (e.which == 13 || e.keyCode == 13) {
            addTagIntoTestcase(this.value);
            //clear input
            $("#add-tags-" + idTestCase).find('input').val('');
            $("#add-tags-" + idTestCase).find('input').focus();
        }
    }, false);

    div_input.appendChild(span_input);
    div_input.appendChild(input_tag);

    return div_input;
}

const generateAddTags = (id) => {
    idTestCase = id;
    const menu = document.createElement("div");
    menu.setAttribute("class", "menu");
    menu.setAttribute("id", "add-tags-" + id);
    menu.setAttribute("style", "width: 255px;");

    const inputTag = generateAutocomplete();
    const divTag = generateButtonsTags();
    menu.appendChild(divTag)
    menu.append(inputTag);

    return menu;
}

//add tag to record-grid
function renderButtonTag(divTag, tags, length) {
    if (tags.length > length) {
        for (let index = 0; index < length; index++) {
            const element = tags[index];
            const item_tags = generateItemTag(element);
            divTag.appendChild(item_tags);
        }

        const divMore = document.createElement("div");
        divMore.setAttribute("class", "more-div-tag");
        divMore.setAttribute("id", "more-button-tag-" + idTestCase);

        for (let index = length; index < tags.length; index++) {
            const element = tags[index];
            const item_tags = generateItemTag(element);
            divMore.appendChild(item_tags);
        }

        const moreButton = generateItemTagWithoutButton('...');
        moreButton.setAttribute("style", "cursor: pointer;");

        moreButton.addEventListener('click', (event) => {
            const moreTag = $(`#more-button-tag-${idTestCase}`);
            if (moreTag.is(':visible')) {
                moreTag.hide();
            } else {
                moreTag.show();
            }
        })

        divTag.appendChild(moreButton);
        divTag.appendChild(divMore);
    } else {
        for (const val of tags) {
            const item_tags = generateItemTag(val);
            divTag.appendChild(item_tags)
        }
    }
}

function addDivTagList() {
    const div_tag = document.createElement("div");
    div_tag.setAttribute("id", "div-button-tags" + idTestCase);
    div_tag.setAttribute("class", "button-tags");

    let tags = getTag(idTestCase);

    switch (true) {
        case (window.innerWidth < 726): //show 2 items and more button
            {
                renderButtonTag(div_tag, tags, 2);
                break;
            }
        case (window.innerWidth >= 726 && window.innerWidth < 814): //show 3 items and more button
            {
                renderButtonTag(div_tag, tags, 3);
                break;
            }
        case (window.innerWidth >= 814 && window.innerWidth < 1072): //show 4 items and more button
            {
                renderButtonTag(div_tag, tags, 4);
                break;
            }
        case (window.innerWidth >= 1072 && window.innerWidth < 1225): //show 5 items and more button
            {
                renderButtonTag(div_tag, tags, 5);
                break;
            }
        case (window.innerWidth >= 1225): //show 6 items and more button
            {
                renderButtonTag(div_tag, tags, 6);
                break;
            }
        default:
            break;
    }

    return div_tag;
}

function addTagtoInput() {
    const input_tag = document.createElement("INPUT");
    input_tag.setAttribute("id", "input-tags");
    input_tag.setAttribute("class", "input-tags");

    input_tag.addEventListener("keypress", function (e) {
        if (e.which == 13 || e.keyCode == 13) {
            addTagIntoTestcase(this.value);
            //clear input
            $(`#div-item-add-tag-${idTestCase}`).find('input').val('');
            $(`#div-item-add-tag-${idTestCase}`).find('input').focus();
        }
    }, false);
    return input_tag;
}

function addButtonTag() {
    const div_item = document.createElement("div");
    div_item.setAttribute("class", "button-item-add-tag");
    div_item.setAttribute("id", "button-item-add-tag-" + idTestCase);

    const button_add = document.createElement("img");
    button_add.src = 'icons/add-tag.svg';

    div_item.appendChild(button_add);

    div_item.addEventListener("click", function () {
        $(`#div-item-add-tag-${idTestCase}`).find('input').show();
        $(`#button-item-add-tag-${idTestCase}`).hide();
    })

    return div_item;
}

function generateDivItemAddTag() {
    const div_item = document.createElement("div");
    div_item.setAttribute("class", "div-item-add-tag");
    div_item.setAttribute("id", "div-item-add-tag-" + idTestCase);

    const div_item_tag = addDivTagList();
    const input_item_tag = addTagtoInput();
    const button_item_tag = addButtonTag();
    div_item.appendChild(button_item_tag);
    div_item.appendChild(input_item_tag);
    div_item.appendChild(div_item_tag);

    return div_item;
}

const generateAddTagsDiv = (id) => {
    idTestCase = id;
    const div = document.createElement("div");
    div.setAttribute("class", "div-add-tag");
    div.setAttribute("id", "div-add-tag-" + id);

    const testcaseObj = findTestCaseById(idTestCase);
    const span = document.createElement("span");
    span.innerHTML = testcaseObj.name;
    div.appendChild(span);

    const div_item = generateDivItemAddTag();
    div.appendChild(div_item);

    return div;
}
/* #endregion */



const saveOldCase = () => {
    const selectedCase = getSelectedCase();
    if (selectedCase) {
        const testCaseID = selectedCase.id;
        const testCase = findTestCaseById(testCaseID);
        const recordElements = getRecordsArray();
        for (let i = 0; i < recordElements.length; i++) {
            const testCommand = testCase.commands[i];
            const UICommandName = getCommandName(recordElements[i]);
            const UICommandDefaultTarget = getCommandTarget(recordElements[i]);
            const UICommandValue = getCommandValue(recordElements[i]);
            const UICommandTargets = getCommandTargets(recordElements[i])
            testCommand.name = UICommandName;
            testCommand.defaultTarget = UICommandDefaultTarget;
            testCommand.targets = UICommandTargets;
            testCommand.value = UICommandValue;

        }
    }
}

const getTestSuiteName = (testSuiteElement) => {
    return testSuiteElement.getElementsByTagName("strong")[0].innerHTML;
}

const getTestCaseName = (testCaseElement) => {
    return testCaseElement.getElementsByTagName("span")[0].innerHTML
}

const setSelectedSuite = (id) => {
    saveOldCase();
    cleanSelected();
    $("#" + id).addClass('selectedSuite');
    clean_panel();
}

let textFile = null;

const makeTextFile = (text) => {
    const data = new Blob([text], {
        type: 'text/*'
    });
    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
    }
    textFile = window.URL.createObjectURL(data);
    return textFile;
};

const makeTextFileJSON = (text) => {
    const data = new Blob([text], {
        type: 'application/json'
    });
    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
    }
    textFile = window.URL.createObjectURL(data);
    return textFile;
};

const downloadSuite = (testSuiteContainerElement, callback) => {
    if (testSuiteContainerElement) {
        const testSuiteID = testSuiteContainerElement.id;
        const testSuite = findTestSuiteById(testSuiteID);

        let output, fileName, link;
        if (testSuite.status === 'dynamic') {
            output = JSON.stringify({
                id: testSuite.id,
                name: testSuite.name,
                status: testSuite.status,
                testCases: [],
                query: testSuite.query
            });
            setSelectedSuite(testSuiteContainerElement.id);
            fileName = testSuite.name + ".json";
            link = makeTextFileJSON(output);
        } else {
            output = marshall(testSuite);
            let old_case = getSelectedCase();

            if (old_case) {
                setSelectedCase(old_case.id);
            } else {
                setSelectedSuite(testSuiteContainerElement.id);
            }

            fileName = testSuite.name + ".krecorder";
            link = makeTextFile(output);
        }

        const downloading = browser.downloads.download({
            filename: fileName,
            url: link,
            saveAs: true,
            conflictAction: 'overwrite'
        });

        const result = function (id) {
            browser.downloads.onChanged.addListener(function downloadCompleted(downloadDelta) {
                if (downloadDelta.id === id && downloadDelta.state &&
                    downloadDelta.state.current === "complete") {
                    browser.downloads.search({
                        id: downloadDelta.id
                    }).then(function (download) {
                        download = download[0];
                        fileName = download.filename.split(/\\|\//).pop();
                        testSuite.name = fileName.substring(0, fileName.lastIndexOf("."));
                        $(testSuiteContainerElement).find(".modified").removeClass("modified");
                        closeConfirm(false);
                        testSuiteContainerElement.getElementsByTagName("STRONG")[0].textContent = testSuite.name;
                        if (callback) {
                            callback();
                        }
                        browser.downloads.onChanged.removeListener(downloadCompleted);
                    })
                } else if (downloadDelta.id === id && downloadDelta.error) {
                    browser.downloads.onChanged.removeListener(downloadCompleted);
                }
            })
        };

        const onError = function (error) {
            console.log(error);
        };

        downloading.then(result, onError);
    } else {
        alert("Choose a test suite to download!");
    }
}

function generateDownloadTestSuiteContextItem() {
    const download_suite = document.createElement("li");
    const a = document.createElement("a");
    a.setAttribute("href", "#");
    a.textContent = "Download test suite";
    download_suite.appendChild(a);
    download_suite.addEventListener("click", function (event) {
        event.stopPropagation();
        const selectedTestSuite = getSelectedSuite();
        downloadSuite(selectedTestSuite);
    }, false);
    return download_suite;
}


/* #region   re - assign - id.js*/
const classifyRecords = (start, end) => {
    let i = start;
    let node;
    try {
        if (i % 2 === 1) {
            while (i <= end) {
                node = document.getElementById("records-" + i);
                if (!node.className || node.className === "odd" || node.className === "even") {
                    node.className = "odd";
                }
                i = parseInt(i) + 1;
                node = document.getElementById("records-" + i);
                if (!node.className || node.className === "odd" || node.className === "even") {
                    node.className = "even";
                }
                i = parseInt(i) + 1;
            }
        } else {
            while (i <= end) {
                node = document.getElementById("records-" + i);
                if (!node.className || node.className === "odd" || node.className === "even") {
                    node.className = "even";
                }
                i = parseInt(i) + 1;
                node = document.getElementById("records-" + i);
                if (!node.className || node.className === "odd" || node.className === "even") {
                    node.className = "odd";
                }
                i = parseInt(i) + 1;
            }
        }
    } catch (e) { }
}

// according to <tr> array's "order" to reassign id
const reAssignId = (start, end) => {
    const records = getRecordsArray();
    start = parseInt(start.split("-")[1]);
    end = parseInt(end.split("-")[1]);
    let len = end - start;

    if (len > 0) {
        records[end - 1].id = "records-" + end;
        for (let i = start; i < start + len; ++i) {
            records[i - 1].id = "records-" + i;
        }
        classifyRecords(start, end);
    } else if (len < 0) {
        records[end].id = "records-" + (end + 1);
        len *= -1;
        for (let i = end + 1; i < end + len; ++i) {
            records[i].id = "records-" + (i + 1);
        }
        classifyRecords(end, start);
    } else {
        records[start - 1].id = "records-" + start;
        classifyRecords(start, end);
    }
}

const reAssignIdForDelete = (delete_ID, count) => {
    const records = getRecordsArray();
    for (let i = delete_ID - 1; i < count; ++i) {
        records[i].id = "records-" + (i + 1);
    }
    classifyRecords(delete_ID, count);
}
/* #endregion */

/* #region  render - new- test - suites.js---------------------------------------------------------------------- */
function generateTestCaseContainerElement(id, tags) {
    const container = document.createElement("p");
    container.setAttribute("id", id);
    container.setAttribute("contextmenu", "menu" + id);
    container.setAttribute("data-tags", tags);
    container.classList.add("test-case-title");
    return container;
}

function generateTestCaseTitle(title) {
    const testCaseTitle = document.createElement("span");
    testCaseTitle.innerHTML = escapeHTML(title);
    return testCaseTitle;
}

function clickHandler(event) {
    event.stopPropagation();

    //Users can undo changes made within a test case only
    if (!this.classList.contains("selectedCase")) {
        commandHistory.reset();
        selfHealingCommandHistory.reset();
    }

    saveOldCase();
    saveData();
    //show testcase grid
    document.getElementsByClassName('dynamic-test-suite')[0].style.display = 'none';
    $('.command-section').show();
    $('.title-testcase').show();

    // use jquery's API to add and remove class property
    cleanSelected();
    this.classList.add("selectedCase");
    this.parentNode.classList.add("selectedSuite");
    $("#profile-section").css("display", "none");
    $("#profileTitle").css("display", "none");
    // $("#command-section")
    //     .css("display", "flex");
    // $("#command-grid").colResizable({ disable: true })
    //     .colResizable({ liveDrag: true, minWidth: 75 });
    clean_panel();
    const testCaseID = this.id;
    const testCase = findTestCaseById(testCaseID);

    const div = generateAddTagsDiv(this.id);
    if ($('.div-add-tag').length > 0) {
        $('.div-add-tag').remove();
    }
    document.getElementsByClassName('title-testcase')[0].append(div);

    let tagList = getTagsData().sort();
    $(`#div-item-add-tag-${this.id}`).find('input').autocomplete({
        source: tagList
    });

    renderTestCaseToRecordGrid(testCase);


    if (testCase.getTestCommandCount() > 0) {
        document.getElementById("records-1").scrollIntoView({
            behavior: 'auto',
            block: 'center',
        });
    }


}

function contextMenuHandler(event) {
    event.preventDefault();
    event.stopPropagation();
    saveOldCase();
    setSelectedCase(this.id);
    let mid = "#" + "menu" + this.id;
    $(".menu").css("left", event.pageX).css("top", event.pageY);
    $(mid).show();
}

function generateTagTestCaseIcon(id) {
    const tagTestcaseDiv = document.createElement("div");
    tagTestcaseDiv.classList.add("test-case-tag");
    tagTestcaseDiv.classList.add("tooltip");
    tagTestcaseDiv.setAttribute("id", "tags-icon-" + id);

    const img = document.createElement("img");
    const span = document.createElement("span");
    span.setAttribute('class', 'tooltiptext');
    span.innerText = "Tag this Test Case";
    span.style = "margin-left: -5px;";

    const tagsArr = findTestCaseById(id).tags;

    if (tagsArr && tagsArr.length > 0) {
        tagTestcaseDiv.setAttribute("style", "visibility: visible;");
        img.src = "/panel/icons/show-tag.svg";
    } else {
        img.src = "/panel/icons/tags.svg";
    }

    tagTestcaseDiv.appendChild(img);
    tagTestcaseDiv.appendChild(span);

    tagTestcaseDiv.addEventListener("click", function (event) {
        event.stopPropagation();
        //create menu
        const toogleTags = generateAddTags(id);
        if ($(`#add-tags-${id}`).length > 0) {
            $(`#add-tags-${id}`).remove();
        } else {
            tagTestcaseDiv.appendChild(toogleTags);
        }

        //listen key event of input
        let menuTag = $(`#add-tags-${id}`);
        menuTag.css("left", event.pageX);
        menuTag.css("top", event.pageY);
        menuTag.show();

        let tagList = getTagsData().sort();
        menuTag.find('input').autocomplete({
            source: tagList
        });

        menuTag.find('input').focus();
    });
    return tagTestcaseDiv;
}

const renderNewTestCase = (title, id, tags) => {
    tags = tags !== undefined ? tags : [];
    const container = generateTestCaseContainerElement(id, tags.toString());
    const testCaseTitle = generateTestCaseTitle(title);
    const tagTestcase = generateTagTestCaseIcon(id);
    container.appendChild(testCaseTitle);

    const selectedTestCase = getSelectedCase();
    if (selectedTestCase) {
        selectedTestCase.parentNode.insertBefore(container, selectedTestCase.nextSibling);
    } else {
        getSelectedSuite().appendChild(container);
    }
    //set added test case and its test suite as selected
    cleanSelected();
    container.classList.add("selectedCase");
    const menu = generateTestCaseContextMenu(id);
    container.parentNode.classList.add("selectedSuite");
    container.appendChild(menu);
    clean_panel();

    //attach event
    container.addEventListener("click", clickHandler);
    container.addEventListener("contextmenu", contextMenuHandler);

    container.appendChild(tagTestcase);
    addContextMenuButton(id, container, menu, 'case');
    closeConfirm(true);
    // enable play button
    enableButton("playback");
}
/* #endregion */


/* #region   genererate - test - suites - context - menu.js-------------------------------------------------------*/
function generateDownloadTestSuiteContextItem() {
    const download_suite = document.createElement("li");
    const a = document.createElement("a");
    a.setAttribute("href", "#");
    a.textContent = "Download test suite";
    download_suite.appendChild(a);
    download_suite.addEventListener("click", function (event) {
        event.stopPropagation();
        const selectedTestSuite = getSelectedSuite();
        downloadSuite(selectedTestSuite);
    }, false);
    return download_suite;
}

function generateSaveTestSuiteContextItem() {
    const save_suite = document.createElement("li");
    const a = document.createElement("a");
    a.setAttribute("href", "#");
    a.textContent = "Save test suite";
    save_suite.appendChild(a);
    save_suite.addEventListener("click", function (event) {
        event.stopPropagation();
        saveData();
        const selectedTestSuite = getSelectedSuite();
        [...selectedTestSuite.getElementsByTagName("p")].forEach(testCase => {
            $(testCase).removeClass("modified");

        });
        selectedTestSuite.getElementsByClassName("modified")[0]?.classList.remove("modified");
    }, false);
    return save_suite;
}

function generateRemoveSuiteContextItem() {
    const remove_suite = document.createElement("li");
    remove_suite.setAttribute("style", "border-top: 1px solid #E8EBED;");
    const a = document.createElement("a");
    a.setAttribute("href", "#");
    a.setAttribute("style", "color: #B41400;");
    a.textContent = "Delete test suite";
    remove_suite.appendChild(a);
    remove_suite.addEventListener("click", function (event) {
        event.stopPropagation();
        document.getElementById("close-testSuite").click();
    }, false);
    return remove_suite;
}

function generateCloseAllSuiteContextItem() {
    const close_all_suite = document.createElement("li");
    const a = document.createElement("a");
    a.setAttribute("href", "#");
    a.setAttribute("style", "color: #B41400;");
    a.textContent = "Delete all test suites";
    close_all_suite.appendChild(a);
    close_all_suite.addEventListener("click", function (event) {
        event.stopPropagation();
        document.getElementById("close-all-testSuites").click();
    }, false);
    return close_all_suite;
}

function generateDuplicateTestSuiteContextItem() {
    const duplicate_test_suite = document.createElement("li");
    const a = document.createElement("a");
    a.setAttribute("href", "#");
    a.textContent = "Duplicate test suite";
    duplicate_test_suite.appendChild(a);
    duplicate_test_suite.addEventListener("click", async function () {
        const s_suite = getSelectedSuite();
        const oldTestSuite = findTestSuiteById(s_suite.id);
        if (oldTestSuite) {
            const newTitle = oldTestSuite.name + " copy";
            //find corrected index to insert test case
            let index = getTestSuiteCount();
            if (s_suite) {
                index = findTestSuiteIndexByID(s_suite.id) + 1;
            }
            //insert new test suite
            const newTestSuite = new TestSuite().setTestSuite({
                name: newTitle,
                status: oldTestSuite.status,
                query: oldTestSuite.query,
            });

            newTestSuite.testCases = [];

            insertNewTestSuiteAtIndex(index, newTestSuite);
            renderNewTestSuite(newTitle, newTestSuite.id, newTestSuite.status);

            if (oldTestSuite.status === 'dynamic') {
                newTestSuite.testCases = [];
            } else {
                for (const oldTestCase of oldTestSuite.testCases) {
                    const newTestCase = new TestCase().setTestCase({
                        name: oldTestCase.name,
                        commands: oldTestCase.commands,
                        tags: oldTestCase.tags ? oldTestCase.tags : []
                    });
                    newTestSuite.testCases.push(newTestCase);
                    renderNewTestCase(newTestCase.name, newTestCase.id, newTestCase.tags);
                }
            }
        }
    }, false);
    return duplicate_test_suite;
}

function generateRenameTestSuiteContextItem() {
    const rename_suite = document.createElement("li");
    const a = document.createElement("a");
    a.setAttribute("href", "#");
    a.textContent = "Rename test suite";
    rename_suite.appendChild(a);
    rename_suite.addEventListener("click", function (event) {
        event.stopPropagation();
        let s_suite = getSelectedSuite();
        const testSuiteID = s_suite.id;
        let n_title = prompt("Please enter the Test Suite's name", testSuiteID.name);
        if (n_title) {
            // get text node
            s_suite.getElementsByTagName("STRONG")[0].textContent = n_title;
            $(s_suite).find("strong").addClass("modified");
            closeConfirm(true);

            const testSuiteID = s_suite.id;
            const testSuite = findTestSuiteById(testSuiteID);
            testSuite.name = n_title;
        }
    }, false);
    return rename_suite;
}


const generateTestSuiteContextMenu = (id) => {
    const menu = document.createElement("div");
    menu.setAttribute("class", "menu");
    menu.setAttribute("id", "menu" + id);
    const ul = document.createElement("ul");
    const download_suite = generateDownloadTestSuiteContextItem();

    const rename_suite = generateRenameTestSuiteContextItem();
    const save_suite = generateSaveTestSuiteContextItem();
    const remove_suite = generateRemoveSuiteContextItem();
    const close_all_suite = generateCloseAllSuiteContextItem();
    const duplicate_test_suite = generateDuplicateTestSuiteContextItem();

    ul.appendChild(download_suite);
    ul.appendChild(rename_suite);
    ul.appendChild(save_suite);
    ul.appendChild(duplicate_test_suite);
    ul.appendChild(remove_suite);
    ul.appendChild(close_all_suite);

    menu.appendChild(ul);
    return menu;
}

/* #endregion -----------------------------------------------------------------*/

/* #region   make -case -makeCaseSortable.js-----------------------------------------------------------------------------*/
let isUpdated = false;
// make case sortable when addTestSuite
const makeCaseSortable = (suite) => {
    let prevSuite = null;
    $(suite).sortable({
        axis: "y",
        items: "p",
        scroll: true,
        revert: 300,
        scrollSensitivity: 20,
        connectWith: ".message",
        start: function (event, ui) {
            ui.placeholder.html(ui.item.html()).css({ "visibility": "visible", "opacity": 0.3, "display": "flex" });
            prevSuite = event.target;
            isUpdated = true;
        },
        update: function (event, ui) {
            if (!isUpdated) {
                return;
            }
            if (prevSuite !== event.target)
                $(prevSuite).find("strong").addClass("modified");
            $(event.target).find("strong").addClass("modified");
            closeConfirm(true);

            const testCaseElement = ui.item[0];
            const destinationTestSuiteElement = ui.item.parent()[0];
            let nextTestCaseSiblingElement = $(testCaseElement).next();
            const testCase = findTestCaseById(testCaseElement.id);
            const destinationTestSuite = findTestSuiteById(destinationTestSuiteElement.id);

            deleteTestCase(testCase.id);
            let index = destinationTestSuite.getTestCaseCount();
            if (nextTestCaseSiblingElement.length !== 0) {
                nextTestCaseSiblingElement = nextTestCaseSiblingElement[0];
                const siblingTestCase = findTestCaseById(nextTestCaseSiblingElement.id);
                index = destinationTestSuite.findTestCaseIndexByID(siblingTestCase.id);
            }
            destinationTestSuite.insertNewTestCase(index, testCase);
            isUpdated = false;
        },
        over: function (event, ui) {
            const UUIDRegex = /\w{8}-\w{4}-4\w{3}-\w{4}-\w{12}/;
            let target = event.target;
            while (!UUIDRegex.test(target.id) || target.tagName !== "DIV") {
                target = target.parentNode;
            }
            const dropdownButton = target.getElementsByClassName("dropdown")[0];
            const icon = dropdownButton.getElementsByTagName("img")[0];
            if (icon.src.includes("off")) {
                $(dropdownButton).click();
            }
        }
    });
}
/* #endregion */

/* #region  generate - test -case -content - menu.js */
function generateRemoveTestCaseContextItem() {
    const remove_case = document.createElement("li");
    remove_case.setAttribute("style", "border-top: 1px solid #E8EBED;");
    const a = document.createElement("a");
    a.setAttribute("href", "#");
    a.setAttribute("style", "color: #B41400;");
    a.textContent = "Delete test case";
    remove_case.appendChild(a);
    remove_case.addEventListener("click", function (event) {
        event.stopPropagation();
        document.getElementById('delete-testCase').click();
    }, false);
    return remove_case;
}

function generateRenameTestCaseContextItem() {
    const rename_case = document.createElement("li");
    const a = document.createElement("a");
    a.setAttribute("href", "#");
    a.textContent = "Rename test case";
    rename_case.appendChild(a);
    rename_case.addEventListener("click", function (event) {
        event.stopPropagation();
        let s_case = getSelectedCase();
        const testCaseID = s_case.id
        const testCase = findTestCaseById(testCaseID);
        let n_title = prompt("Please enter the Test Case's name", testCase.name);
        if (n_title) {
            // get text node
            s_case.childNodes[0].textContent = n_title;
            const testCaseID = s_case.id;
            const testCase = findTestCaseById(testCaseID);
            testCase.name = n_title;
        }
    }, false);
    return rename_case;
}

function generatePlayCaseFromHereContextItem() {
    const play_case_from_here = document.createElement("li");
    const a = document.createElement("a");
    a.setAttribute("href", "#");
    a.textContent = "Play from here";
    play_case_from_here.appendChild(a);
    play_case_from_here.addEventListener("click", async function () {
        const result = await checkLoginOrSignupUserForPlayTestSuite();
        if (!result) {
            return;
        }
        saveData();
        emptyNode(document.getElementById("logcontainer"));
        document.getElementById("result-runs").textContent = "0";
        document.getElementById("result-failures").textContent = "0";
        recorder.detach();
        initAllSuite();
        //focus on window when playing test suite
        if (contentWindowId) {
            browser.windows.update(contentWindowId, { focused: true });
        }
        declaredVars = {};
        window.defaultProfile = await getDefaultProfile();
        for (const variable of defaultProfile.variables) {
            declaredVars[`GlobalVariable.${variable.name}`] = variable.value;
        }
        clearScreenshotContainer();

        let cases = getSelectedSuite().getElementsByTagName("p");
        let i = 0;
        while (i < cases.length) {
            let s_case = getSelectedCase();
            if (cases[i].id === s_case.id) {
                break;
            }
            i++;
        }
        playTestSuiteAction(i, false);
    }, false);
    return play_case_from_here;
}

function generateSaveCaseContextItem() {
    const save_case = document.createElement("li");
    const a = document.createElement("a");
    a.setAttribute("href", "#");
    a.textContent = "Save test case";
    save_case.appendChild(a);
    save_case.addEventListener("click", function (event) {
        event.stopPropagation();
        saveData();
        removeDirtyMarks('context');
        setTrackingLeftSidePanelData("saveTestCase",)
    }, false);
    return save_case;
}

function generateDuplicateTestCaseItem() {
    const duplicate_test_case = document.createElement("li");
    const a = document.createElement("a");
    a.setAttribute("href", "#");
    a.textContent = "Duplicate test case";
    duplicate_test_case.appendChild(a);
    duplicate_test_case.addEventListener("click", async function (event) {
        const s_case = getSelectedCase();
        const s_suite = getSelectedSuite();
        const testSuite = findTestSuiteById(s_suite.id);
        const oldTestCase = findTestCaseById(s_case.id);
        if (testSuite && oldTestCase) {
            const newTitle = oldTestCase.name + " copy";
            //find corrected index to insert test case
            let index = testSuite.getTestCaseCount();
            index = testSuite.findTestCaseIndexByID(oldTestCase.id) + 1;
            //insert new test case
            const newTestCase = new TestCase().setTestCase({
                name: newTitle,
                commands: [],
                tags: oldTestCase.tags ? oldTestCase.tags : []
            });

            for (const command of oldTestCase.commands) {
                newTestCase.commands.push(new TestCommand().setTestCommand(command));
            }

            testSuite.insertNewTestCase(index, newTestCase);
            //render UI
            renderNewTestCase(newTestCase.name, newTestCase.id, newTestCase.tags);
            const selectedTesSuite = getSelectedSuite();
            testSuiteDropdownOpen(selectedTesSuite.id);
        }
    }, false);
    return duplicate_test_case;
}

const generateTestCaseContextMenu = (id) => {
    const menu = document.createElement("div");
    menu.setAttribute("class", "menu");
    menu.setAttribute("id", "menu" + id);
    const ul = document.createElement("ul");
    const play_case_from_here = generatePlayCaseFromHereContextItem();
    const rename_case = generateRenameTestCaseContextItem();
    const save_case = generateSaveCaseContextItem();
    const remove_case = generateRemoveTestCaseContextItem();
    const duplicated_case = generateDuplicateTestCaseItem();

    ul.appendChild(play_case_from_here);
    ul.appendChild(rename_case);
    ul.appendChild(save_case);
    ul.appendChild(duplicated_case);
    ul.appendChild(remove_case);

    menu.appendChild(ul);
    return menu;
}
/* #endregion */

/* #region   save - data - js*/
const saveData = () => {
    saveOldCase();
    const data = {
        data: KRData
    };
    browser.storage.local.set(data);
}

const mappingTestDataToJSONObject = () => {
    return JSON.parse(JSON.stringify(KRData));
}

/**
 * maps JSON data object to TestData object and save to in-memory data object
 * returns list of sideex_id for testSuite
 * @param {Object} data
 * @returns {TestData}
 */
const mappingJSONObjectToTestData = (data) => {
    const testSuites = data.testSuites.map(testSuite => {
        const testCases = testSuite.testCases.map(testCase => {
            const commands = testCase.commands.map(command => new TestCommand().setTestCommand(command));
            testCase.commands = commands;
            const newTestCase = new TestCase().setTestCase(testCase);
            return newTestCase;
        });
        testSuite.testCases = testCases;
        const KRTestSuite = new TestSuite().setTestSuite(testSuite);
        return KRTestSuite;
    });
    const testData = new TestData(testSuites);

    return testData;
}

const setKRData = (data) => {
    KRData = data;
}
/* #endregion */

const closeConfirm = (bool) => {
    if (bool) {
        $(window).on("beforeunload", function (e) {
            var confirmationMessage = "You have a modified suite!";
            e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
            return confirmationMessage; // Gecko, WebKit, Chrome <34
        });
    } else {
        if (!$("#testCase-grid").find(".modified").length)
            $(window).off("beforeunload");
    }
}



const displayNewTestSuite = (testSuite) => {
    renderNewTestSuite(testSuite.name, testSuite.id, testSuite.status);
    if (testSuite.status !== 'dynamic') {
        testSuite.testCases.forEach(testCase => {
            renderTestCaseToRecordGrid(testCase);
            let case_title = testCase.name;
            let tags = testCase.tags && testCase.tags.length > 0 ? testCase.tags.join(',') : "";
            renderNewTestCase(case_title, testCase.id, tags);
        });
    }
    setSelectedSuite(testSuite.id);
    clean_panel();
}






//HELPERS
function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function createElement() {
    var element = document.createElement(arguments[0]),
        text = arguments[1],
        attr = arguments[2],
        append = arguments[3],
        appendTo = arguments[4],
        prepend = arguments[5];

    for (var key = 0; key < Object.keys(attr).length; key++) {
        var name = Object.keys(attr)[key],
            value = attr[name],
            tempAttr = document.createAttribute(name);
        tempAttr.value = value;
        element.setAttributeNode(tempAttr)
    }

    if (append) {
        for (var _key = 0; _key < append.length; _key++) {
            element.appendChild(append[_key]);
        }
    }

    if (text) element.appendChild(document.createTextNode(text));

    if (appendTo) {
        var target = appendTo === 'body' ? document.body : document.getElementById(appendTo);
        if (prepend) {
            let preElement = document.querySelector(prepend);
            target.insertBefore(element, preElement);
        }
        else {
            target.appendChild(element);
        }

    }

    return element;
}



// SAMPLE COMMANDS
Selenium.prototype.doScrapeHtmlSource = function (locator, text) {
    /** Returns the entire HTML source between the opening and
     * closing "html" tags.
     *
     * @return string the entire HTML source
     */
    let str = this.browserbot.getDocument().getElementsByTagName("html")[0].innerHTML;

    console.log("do scraping...");
    console.log("text=");
    console.log(text);

    console.log("locator=");
    console.log("locator=" + locator);





    var url = myConfig.devNoteRecorder_CreateLog;
    var settings = {
        "url": url,
        "method": "POST",
        "timeout": 0,
        "mode": "no-cors",
        "headers": {
            "Content-Type": "application/json"

        },
        "data": JSON.stringify({

            "info": str,
            "config": text
        })
    };
    $.ajax(settings).done(function (response) {
        console.log(response);
        // toggleLoader();
    });




};

Selenium.prototype.getTextLength = function (locator) {
    return this.getText(locator).length;
};

Selenium.prototype.doTypeRepeated = function (locator, text) {
    // All locator-strategies are automatically handled by "findElement"
    var element = this.page().findElement(locator);

    // Create the text to type
    var valueToType = text + text;

    // Replace the element text with the new text
    this.page().replaceText(element, valueToType);
};

Selenium.prototype.assertValueRepeated = function (locator, text) {
    var element = this.page().findElement(locator);
    // All locator-strategies are automatically handled by "findElement"

    // Create the text to verify
    var expectedValue = text + text;

    // Get the actual element value
    var actualValue = element.value;

    // Make sure the actual value matches the expected
    Assert.matches(expectedValue, actualValue);
};

/* #region   */

/* #endregion */
