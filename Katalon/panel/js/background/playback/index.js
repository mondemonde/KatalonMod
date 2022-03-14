import { ExtCommand } from "../window-controller.js";
import { commandFactory } from "./service/command/CommandFactory.js";

window.isSelecting = false;
window.extCommand = new ExtCommand();
window.currentPlayingFromHereCommandIndex = 0;
window.defaultProfile = null;

window.segmentService = async function() {
    return await
    import ('../../UI/services/tracking-service/segment-tracking-service.js');
}


window.onload = function() {

    $("#refercontainer").hide();
    if ($('#command-command')) {
        $('#command-command').on('input change', function() {
            scrape(document.getElementById("command-command").value);
        });
    }

    $("#record").click(function() {
        let command = commandFactory.createCommand("record");
        command.execute();
    });
    $("#playback").click(function() {
        setTimeout(() => {
            let command = commandFactory.createCommand("playTestCase");
            command.execute();
        }, 500);
    });
    $("#stop").click(function() {
        let command = commandFactory.createCommand("stop");
        command.execute();
    });
    $("#pause").click(function() {
        let command = commandFactory.createCommand("pause");
        command.execute();
    });
    $("#resume").click(function() {
        let command = commandFactory.createCommand("resume");
        command.execute();
    });
    $("#playSuite").click(function() {
        setTimeout(() => {
            let command = commandFactory.createCommand("playTestSuite");
            command.execute();
        }, 500);
    });
    $("#playSuites").click(function() {
        setTimeout(() => {
            let command = commandFactory.createCommand("playAll");
            command.execute();
        }, 500);
    });
    // $("#showElementButton").click(function () {
    //   let command = commandFactory.createCommand("showElement");
    //   command.execute();
    // });
    // $("#selectElementButton").click(function () {
    //   let command = commandFactory.createCommand("selectElement");
    //   command.execute();
    // });

    $(document).dblclick(function(event) {
        $(event.target).find('.grid-delete-btn').hide();
        $(event.target).find('.toolbar-btn').hide();
        if ($("#records-grid").find('#command-command').length == 0 && $("#records-grid").find('#command-target').length == 0 && $("#records-grid").find('#command-value').length == 0) {
            let command = commandFactory.createCommand("executeTestStep", event);
            command.execute();
        }
    });
};