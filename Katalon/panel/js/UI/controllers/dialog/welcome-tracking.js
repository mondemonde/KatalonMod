let htmlWhatsnews = `
    <div class="header">
      <div class="title">Katalon Recorder 5.7.5</div>
    </div>
    <div class="content">
      <div class="message">
        <ul>
          <li><strong>Enhancements</strong>
            <ul>
              <li>Introduced the ability to pause or continue a test execution upon error</li>
              <li>Added more options to select multiple cells using Ctrl + Shift + Key Up/Down</li>
              <li>Introduced the ability to use Tab button to navigate between cells</li>
            </ul>
          </li>
          <li><strong>Bug fixes</strong>
            <ul>
              <li>[Profiles] Fixed an issue where “Warning for duplicates” kept popping up</li>
              <li>[Self-healing] Fixed an issue where approved locators show up in Command section instead of Target section</li>
              <li>Fixed an issue where Katalon Recorder jumps during navigation between cells</li>
              <li>Fixed an issue where wrong cells are highlighted during Copy and Paste</li>
              <li>Fixed an issue where double click selects all the text values in a field</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
    <div class="footer">
    <button id="whats-news-release-note">Release note</button>
    <button id="whats-news-close">Close</button>
    </div>
`;

function displayWhatsNewDialog() {
  let newsDialog = $("<div id='whatsNews'></div>")
    .html(htmlWhatsnews)
    .dialog({
      title: `Everything is up to date`,
      resizable: true,
      autoOpen: true,
      dialogClass: 'newStyleDialog',
      height: "auto",
      width: "500",
      modal: true,
      open: function () {
        $(this.parentElement.childNodes[0]).css("display", "block");
      }
    });
  $("#whats-news-release-note").click(() => {
    window.open(
      "https://docs.katalon.com/katalon-recorder/docs/release-notes.html"
    );
  });
  $("#whats-news-close").click(() => {
    newsDialog.remove();
  })
}

$(document).ready(function () {
  browser.storage.local.get("tracking").then(function (result) {
    if (result.tracking) {
      if (result.tracking.isUpdated
        && (result.tracking.hasShownWhatsNewDialog === undefined
          || result.tracking.hasShownWhatsNewDialog === false)) {
        displayWhatsNewDialog();
        result.tracking.hasShownWhatsNewDialog = true;
        browser.storage.local.set(result);
      }
    }
  });
});
