import { trackingSegment } from "../../services/tracking-service/segment-tracking-service.js";
import { GenericDialog } from "../../view/dialog/generic-dialog.js";

const htmlString = `
    <div class="header">
        <div class="title">Feedback</div>
         <button class="dialog-close" id="feedback-close">
              <img src="/katalon/images/SVG/close-icon.svg" alt="Close"/>
          </button>
    </div>
    <div class="content">
        <div class="message">
            Hello there, we redesigned Katalon Recorder and would really appreciate to hear your feedbacks!
        </div>
        <textarea id="feedback-content"></textarea>
    </div>
    <div class="footer">
        <div id="feedback-status">Thank you for your feedback!</div>
        <button id="feedback-cancel">Cancel</button>
        <button class="disable" id="feedback-send">Send</button>
    </div>
`;

async function renderFeedbackDialog(){
  const height = 336;
  const width = 400;
  const dialog = new GenericDialog({id: "feedbackDialog",
    html: htmlString,
    height: height,
    width: width
  });

  await dialog.render();

  $("#feedback-cancel").click(() => {
    $("#feedbackDialog").dialog('close');
    $("#feedback-status").css("display", "none");
  });

  $("#feedback-close").click(() => {
    $("#feedbackDialog").dialog('close');
    $("#feedback-status").css("display", "none");
  });

  $("#feedback-content").on("input", (event) => {
    if (event.target.value.length > 0){
      $("#feedback-send").removeClass("disable");
    } else {
      $("#feedback-send").addClass("disable");
    }
  });

  $("#feedback-send").click(function(){
    const feedbackContent = $("#feedback-content").val();
    if (feedbackContent.length > 0){
      trackingSegment("kr_feedback", {
        feedback: feedbackContent
      });
      $("#feedback-status").css("display", "block");
    }
  });
}

$(document).ready(function(){

  $("#feedback").click(function(){
    renderFeedbackDialog()
  });

})