let heightElement = 0;

$(() => {
    $('#action-act').click(async function(e) {
        const elementAction = ["#export", "#test-ops-back-up-data", "#ka-upload", "#tagging-features"];
        if (this.src.includes('collapse')) {
            this.src = 'icons/expand.svg';
            await elementAction.forEach(i => $(i).hide());
            $("#actions").css("min-height", "100px");
        } else {
            this.src = 'icons/collapse.svg';
            await elementAction.forEach(i => $(i).show());
            $("#actions").css("min-height", "200px");
        }
    })
})

$(window).resize(function() {
    let height = $(window).height();
    if (height < 723) {
        heightElement = 280;
    } else if (height > 724 && height < 839) {
        heightElement = 380;
    } else {
        heightElement = 540;
    }
    $('#workspace').css('max-height', heightElement);
});