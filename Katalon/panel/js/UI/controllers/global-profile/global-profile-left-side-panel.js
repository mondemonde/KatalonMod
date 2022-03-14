import {
  loadProfileData,
  saveProfileData
} from "../../services/global-profile-service/globla-profile-local-storage.js";
import { renderProfileList } from "../../view/global-profile/render-profile-list.js";
import { createNewProfile } from "../../services/global-profile-service/profile-data-service.js";
import { renderNewProfile } from "../../view/global-profile/render-new-profile.js";
import { closeProfileList, openProfileList } from "../../view/global-profile/dropdown-profile-panel.js";
import { trackingSegment } from "../../services/tracking-service/segment-tracking-service.js";

$(document).ready(function () {
  loadProfileData().then(async _ => {
    await renderProfileList();
  });

  $("#profileDropdown").click(function () {
    const image = $(this).find("img");
    const src = $(image).attr("src");
    if (src.includes("off")) {
      openProfileList();
    } else {
      closeProfileList();
    }
  });

  $("#profilePlus").click(async () => {
    const title = prompt("Please enter the Profile's title", "Untitled Profile");
    if (title) {
      const newProfile = await createNewProfile(title);
      renderNewProfile(newProfile);
      await saveProfileData();
    }

    trackingSegment("kru_new_profile", { source: "profile_context_menu"})
  });
});

