import { OnBoardingDialog } from "../../view/dialog/onboarding-dialog.js";
import { trackingSegment } from "../../services/tracking-service/segment-tracking-service.js";

const onBoardingUserChoice = {};

function generateFirstDialog() {
  const content = `
  <h3>Are you looking to?</h3>
  <div>
    <label> 
      <input type="radio" name="use_case" value="kickstart-automation"/>
        Kickstart test automation in your project
    </label>
  </div>
  <div>
    <label>
      <input type="radio" name="use_case" value="generate-selenium-tests"/> 
      Generate Selenium automated tests
    </label>
  </div>
  <div>
    <label>
      <input type="radio" name="use_case" value="generate-synthetic-scripts"/> 
      Generate Synthetic Scripts for APM tools
    </label>
  </div>
  <div>
    <label>
      <input type="radio" name="use_case" value="automate-browser-tasks"/> 
      Automate boring and repetitive browser tasks
    </label>
  </div>
  <div>
    <label>
      <input type="radio" name="use_case" value="none-of-the-above"/> 
      None of the above
    </label>
  </div>
`
  const firstDialog = new OnBoardingDialog({
    id: "firstDialog",
    content: content,
    contentClass: "dialog1",
    pageNum: 2,
    pageTotal: 4,
    attachEvent: function () {
      const self = this;
      $(this.dialog).find("input[name=use_case]").click(function () {
        $(self.dialog).find(".nextBtn").removeClass("disabled");
      })
    }
  });
  return firstDialog;
}

function generateUserChooseSeleniumDialog() {
  const languageObj = {
    "java-unit": "Java JUnit",
    "java-testng": "Java TestNG",
    "java-wrc-unit": "Java WRC Unit",
    "cs-xunit": "C# xUnit",
    "cs-nunit": "C# NUnit",
    "cs-mstest": "C# MSTest",
    "js-mocha": "JavaScript Mocha",
    "python-unittest": "Python Unittest",
    "python-test": "Python ptest",
    "ts-protractor": "Typescript Protractor",
    "robot": "Robot Framework",
    "ruby-rspec": "Ruby Rspec",
    "js-webdriverio": "JavaScript WebDriver.io",
    "js-puppeteer": "JavaScript Puppeteer",
    "xml": "XML",
    "json-puppeteer": "JSON Puppeteer",
    "none": "None of the above",
  }

  const tag = Object.entries(languageObj).reduce((prev, [key, value]) => {
    prev += `<div class="tag" data-value="${key}">${value}</div>`;
    return prev;
  }, "")

  const content = `
  <div>
    <p>What is the test framework and library that you are using? </p>
    <p>Choose one option in below answers. </p>
  </div>
  <div class="tagContainer">
    ${tag}
  </div>
  <div>
  <textarea id="valueOfnone3" placeholder="Please let us know more" style="margin-top:10px; margin-down:10px; width: 100%;height: 100%;font-size: 14px;"></textarea>
  </div>
`
  const secondDialog = new OnBoardingDialog({
    id: "secondOnBoardingDialog",
    content: content,
    contentClass: "dialog2",
    pageNum: 3,
    pageTotal: 4,
    attachEvent: function () {
      const self = this;
      $(this.dialog).find(".tag").click(function () {
        const selectedTag = $(this);
        if (selectedTag.hasClass("selected")) {
          selectedTag.removeClass("selected");
        } else {
          $(self.dialog).find('.selected').removeClass("selected");
          selectedTag.addClass("selected");

        }
        if ($(self.dialog).find(".selected").length > 0) {
          $(self.dialog).find(".nextBtn").removeClass("disabled");
        } else {
          $(self.dialog).find(".nextBtn").addClass("disabled");
        }

      });
    }
  });
  return secondDialog;
}

function generateUserChooseSyntheticDialog() {
  const content = `
  <div>
    <p>What APM tool are you using? </p>
    <p>Choose one option in below answers. </p>
  </div>
  <div>
    <label>
      <input type="radio" name="current_solution" value="app-dynamices"/> 
      App dynamics
    </label>
  </div>
  <div>
    <label>
        <input type="radio" name="current_solution" value="new-relic"/> 
        New Relic
    </label>
  </div>
  <div>
    <label>
      <input type="radio" name="current_solution" value="dynatrace"/> 
      Dynatrace
    </label>
  </div>
  <div>
    <label>
      <input type="radio" name="current_solution" value="None"/> 
      None of the above
    </label>
  </div>
  <div>
    <textarea id="valueOfnone1" placeholder="Please let us know more" style="margin-top:10px; margin-down:10px; width: 100%;height: 100%;font-size: 14px;"></textarea>
  </div>
`
  const dialog = new OnBoardingDialog({
    id: "thirdDialog",
    content: content,
    contentClass: "dialog3",
    pageNum: 3,
    pageTotal: 4,
    attachEvent: function () {
      const self = this;
      $(this.dialog).find("input[name=current_solution]").click(function () {
        $(self.dialog).find(".nextBtn").removeClass("disabled");
      })
    }
  });
  return dialog;
}

function generateUserChooseOtherDialog() {
  const content = `
  <div>
    <p>What was the last automation tool/framework that you used?</p>
    <p>Choose one option in below answers. </p>
  </div>
  <div>
    <label>
        <input type="radio" name="current_solution" value="katalon-studio"/> 
        Katalon Studio
    </label>
  </div>
  <div>
    <label>
      <input type="radio" name="current_solution" value="selenium-ide"/> 
      Selenium IDE
    </label>
  </div>
  <div>
    <label>
      <input type="radio" name="current_solution" value="selenium-webdriver"/> 
      Selenium WebDriver
    </label>
  </div>
  <div>
    <label>
      <input type="radio" name="current_solution" value="none"/> 
      None of the above
    </label>
  </div>
  <div>
    <textarea id="valueOfnone2" placeholder="Please let us know more" style="margin-top:10px; margin-down:10px; width: 100%;height: 100%;font-size: 14px;"></textarea>
  </div>
`
  const dialog = new OnBoardingDialog({
    id: "forthDialog",
    content: content,
    contentClass: "dialog4",
    pageNum: 3,
    pageTotal: 4,
    attachEvent: function () {
      const self = this;
      $(this.dialog).find("input[name=current_solution]").click(function () {
        $(self.dialog).find(".nextBtn").removeClass("disabled");
      })
    }
  });
  return dialog;
}

function generateLastDialog() {
  const keywords = {
    "social-media": "Social Media",
    "referred-by-friends": "Referred by friends/colleagues",
    "search-engine": "Search Engine (Google, Bing, etc)",
    "blog-webminar-publication": "Blog, Webinar or Publication",
    "other": "Other",
  }

  const tag = Object.entries(keywords).reduce((prev, [key, value]) => {
    prev += `<div class="tag" data-value="${key}">${value}</div>`;
    return prev;
  }, "")

  const content = `
  <div>
    <p>How did you find Katalon Recorder?</p>
  </div>
  <div class="tagContainer">
    ${tag}
  </div>
  <textarea id="keywords-feedback-content" placeholder="Pease share any related URLs or information (optional)"></textarea>
`;
  const dialog = new OnBoardingDialog({
    id: "fifthDialog",
    content: content,
    contentClass: "dialog5",
    pageNum: 4,
    pageTotal: 4,
    attachEvent: function () {
      const self = this;
      $(this.dialog).find(".tag").click(function () {
        const selectedTag = $(this);
        if (selectedTag.hasClass("selected")) {
          selectedTag.removeClass("selected");
        } else {
          $(self.dialog).find('.selected').removeClass("selected");
          selectedTag.addClass("selected");

        }
        if ($(self.dialog).find(".selected").length > 0) {
          $(self.dialog).find(".nextBtn").removeClass("disabled");
        } else {
          $(self.dialog).find(".nextBtn").addClass("disabled");
        }

      });
    }
  });

  return dialog;
}

function generatePrivacyDialog() {
  const content = `
  <h3>Privacy</h3>
  <p>
    We're asking to collect the following Personally Identifiable Information:
        <ul>
            <li><b>If you consent and sign in with a Katalon account</b>, we will collect the email address associated with that account.</li>
            <li><b>If you consent</b>, we will collect data about the actions that you perform within the application.</li>
            <li><b>Whether your consent or not</b>, we DO NOT track or collect the content of your test cases, test suites or your execution logs.</li>
        </ul>
  </p>
  <p>You can read more about our <a href="https://www.katalon.com/terms/#license-agreement-katalon-recorder">License Agreement</a>.</p>  
  <p>Do you allow us to collect these information in accord with our data privacy?</p> 
  `
  const privacyDialog = new OnBoardingDialog({
    id: "privacyDialog",
    content: content,
    contentClass: "dialog1",
    pageNum: 1,
    pageTotal: 2,
    isPrivacyDialog: true,
  });
  return privacyDialog;
}

async function renderOnBoardingDialog() {
  const privacyDialog = generatePrivacyDialog();
  const firstDialog = generateFirstDialog();
  const userChooseSeleniumDialog = generateUserChooseSeleniumDialog();
  const userChooseSyntheticDialog = generateUserChooseSyntheticDialog();
  const userChooseOtherDialog = generateUserChooseOtherDialog();
  const lastDialog = generateLastDialog();

  privacyDialog.onNext = function () {
    privacyDialog.close();
    firstDialog.render();
  }

  firstDialog.onNext = function () {
    const userChoice = $(this.dialog).find("input[name=use_case]:checked").val();
    onBoardingUserChoice["use_case"] = userChoice;
    if (userChoice === "generate-selenium-tests") {
      userChooseSeleniumDialog.render();
    } else if (userChoice === "generate-synthetic-scripts") {
      userChooseSyntheticDialog.render();
    } else {
      userChooseOtherDialog.render();
    }
    firstDialog.close();
  }

  userChooseSeleniumDialog.onNext = function () {
    const currentSolutions = [...$(this.dialog).find(".tag.selected")].map(element => element.getAttribute("data-value"))
    onBoardingUserChoice["current_solution"] = currentSolutions[0];
    if (currentSolutions.some(e => e === 'none')) {
      onBoardingUserChoice["custom_current_solution"] = $('#valueOfnone3').val();
    }
    lastDialog.render();
    userChooseSeleniumDialog.close();
  }

  userChooseSyntheticDialog.onNext = function () {
    const userChoice = $(this.dialog).find("input[name=current_solution]:checked").val();
    onBoardingUserChoice["current_solution"] = userChoice;
    if (userChoice === 'None') {
      onBoardingUserChoice["custom_current_solution"] = $('#valueOfnone1').val();
    }
    lastDialog.render();
    userChooseSyntheticDialog.close();
  }

  userChooseOtherDialog.onNext = function () {
    const userChoice = $(this.dialog).find("input[name=current_solution]:checked").val();
    onBoardingUserChoice["current_solution"] = userChoice;
    if (userChoice === 'none') {
      onBoardingUserChoice["custom_current_solution"] = $('#valueOfnone2').val();
    }
    lastDialog.render();
    userChooseOtherDialog.close();
  }

  lastDialog.onNext = function () {
    const keywords = [...$(this.dialog).find(".tag.selected")].map(element => element.getAttribute("data-value"))
    const feedbackContent = $("#keywords-feedback-content").val();
    onBoardingUserChoice["keywords"] = keywords[0];
    onBoardingUserChoice["feedback"] = feedbackContent;
    trackingSegment("kru_on_boarding_v1", onBoardingUserChoice);
    lastDialog.close();
    browser.storage.local.set(
      { "onBoardingUserChoice": onBoardingUserChoice }
    );
  }

  if (bowser.name === "Firefox") {
    await privacyDialog.render();
    return;
  }
  await firstDialog.render();
}

/*** KR435: https://katalon.atlassian.net/browse/KR-435 ***/
function generateFirstDialogKR435() {
  const content = `
  <h3>Are you looking to?</h3>
  <div>
    <label> 
      <input type="radio" name="use_case" value="kickstart-automation"/>
        Kickstart test automation in your project
    </label>
  </div>
  <div>
    <label>
      <input type="radio" name="use_case" value="generate-selenium-tests"/> 
      Generate Selenium automated tests
    </label>
  </div>
  <div>
    <label>
      <input type="radio" name="use_case" value="generate-synthetic-scripts"/> 
      Generate Synthetic Scripts for APM tools
    </label>
  </div>
  <div>
    <label>
      <input type="radio" name="use_case" value="automate-browser-tasks"/> 
      Automate boring and repetitive browser tasks
    </label>
  </div>
  <div>
    <label>
      <input type="radio" name="use_case" value="none-of-the-above"/> 
      None of the above
    </label>
  </div>
`
  return new OnBoardingDialog({
    id: "firstDialog",
    content: content,
    pageNum: 2,
    pageTotal: 2,
    contentClass: "dialog1",
    attachEvent: function () {
      const self = this;
      $(this.dialog).find("input[name=use_case]").click(function () {
        $(self.dialog).find(".nextBtn").removeClass("disabled");
      })
    }
  });
}

async function renderOnBoardingDialogKR435() {
  const privacyDialog = generatePrivacyDialog();
  const firstDialog = generateFirstDialogKR435();

  privacyDialog.onNext = function () {
    privacyDialog.close();
    firstDialog.render();
  }

  firstDialog.onNext = function () {
    const userChoice = $(this.dialog).find("input[name=use_case]:checked").val();
    onBoardingUserChoice["use_case"] = userChoice;
    firstDialog.close();
    browser.storage.local.set(
      { "onBoardingUserChoice": onBoardingUserChoice }
    );
  }

  if (bowser.name === "Firefox") {
    await privacyDialog.render();
    return;
  }
  await firstDialog.render();
}

$(document).ready(function () {
  browser.storage.local.get("firstTime").then(result => {
    if (result.firstTime) {
      // renderOnBoardingDialog();

      /*** Update for KR-435 ***/
      renderOnBoardingDialogKR435();
    }
  })
})