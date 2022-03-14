import { setBackupDataInterval } from "../../services/test-ops-service/test-ops-service.js";
import { trackingSegment } from "../../services/tracking-service/segment-tracking-service.js"

$(document).ready(function(){
  $('#ka-open').on('click', function() {
    window.open(testOpsEndpoint);
  });

  $("#test-ops-back-up-data").click(function(){
    getProjects().then(() => {
      backupData();
      updateBackupStatus(`Backing up data …`);
      $("#backup-restore-btn").css("display", "none");
      setTimeout(() => {
        showBackupEnabledStatus();
        trackingSegment("kru_backup_data_to_testops", {success: true});
      }, 2000);
    }).catch(() =>{
      showTestOpsLoginDialog();
      showBackupDisabledStatus();
      trackingSegment("kru_backup_data_to_testops", {success: false});
    })
  });

  setBackupDataInterval();
})