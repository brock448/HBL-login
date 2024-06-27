jQuery(document).ready(function() {
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    var isFirefox = typeof InstallTrigger !== 'undefined';
    var isSafari = /constructor/i.test(window.HTMLElement) || (function(p) {
        return p.toString() === "[object SafariRemoteNotification]";
    })(!window['safari'] || safari.pushNotification);
    var isIE = /*@cc_on!@*/ false || !!document.documentMode;
    var isEdge = !isIE && !!window.StyleMedia;
    var isChrome = !!window.chrome && !!window.chrome.webstore;
    var isBlink = (isChrome || isOpera) && !!window.CSS;
    var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    if (iOS) {
        $(function() {
            $(".forpassword").on('touchstart', function(ev) {
                $(".forpassword").removeAttr("readonly");
            });
            $(".moneys").on('touchstart', function(ev) {
                $(".moneys").removeAttr("readonly");
            });
        });
    } else {
        $('body').on("focus", ".forpassword", function(event) {
            $(".forpassword").removeAttr("readonly");
        });
        $('body').on("click", ".forpassword", function(event) {
            $(".forpassword").removeAttr("readonly");
        });
        $('body').on("focus", ".moneys", function(event) {
            $(".moneys").removeAttr("readonly");
        });
        $('body').on("click", ".moneys", function(event) {
            $(".moneys").removeAttr("readonly");
        });
    }
    $(".fornumber").on("input change paste", function filterNumericAndDecimal(event) {
        if (jQuery(window).width() > 768) {
            var formControl;
            formControl = $(event.target);
            formControl.val(formControl.val().replace(/[^0-9.]+/g, ""));
        } else {
            var formControl;
            var dInput = this.value;
            var dat = $(this).attr('maxLength')
            formControl = $(event.target);
            if (dInput.length > dat) {
                formControl.val(formControl.val().substr(0, dat));
            } else {
                formControl = $(event.target);
                formControl.val(formControl.val().replace(/[^0-9.]+/g, ""));
            }
        }
    });
    $('body').on("keypress", ".moneys", function(event) {
        var $this = $(this);
        if ((event.which != 46 || $this.val().indexOf('.') != -1) && ((event.which < 48 || event.which > 57) && (event.which != 0 && event.which != 8))) {
            event.preventDefault();
        }
        var text = $(this).val();
        if ((event.which == 46) && (text.indexOf('.') == -1)) {
            setTimeout(function() {
                if ($this.val().substring($this.val().indexOf('.')).length > 3) {
                    $this.val($this.val().substring(0, $this.val().indexOf('.') + 3));
                }
            }, 1);
        }
        if ((text.indexOf('.') != -1) && (text.substring(text.indexOf('.')).length > 2) && (event.which != 0 && event.which != 8) && ($(this)[0].selectionStart >= text.length - 2)) {
            event.preventDefault();
        }
    });
    $('body').on("keyup paste", ".moneys", function(e) {
        if (e.originalEvent.clipboardData == undefined) {
            var text = this.value;
        } else {
            var text = e.originalEvent.clipboardData.getData('Text');
        }
        if ($.isNumeric(text)) {
            if ((text.substring(text.indexOf('.')).length > 3) && (text.indexOf('.') > -1)) {
                e.preventDefault();
                $(this).val(text.substring(0, text.indexOf('.') + 3));
            }
        } else {
            e.preventDefault();
        }
    });
    $('body').on("keyup paste", ".fortext", function(e) {
        var $this = $(this);
        setTimeout(function() {
            var data = $this.val();
            var dataFull = data.replace(/[^a-zA-Z\s]+/g, '');
            $this.val(dataFull);
        });
    });
    $('body').on("keyup paste", ".fornumber", function(e) {
        if (jQuery(window).width() > 993) {
            var $this = $(this);
            setTimeout(function() {
                var data = $this.val();
                var dataFull = data.replace(/[^0-9.]+/g, '');
                $this.val(dataFull);
            });
        }
    });
    $('body').on("keyup paste", ".pasteAlphaNumeric", function(e) {
        var $this = $(this);
        setTimeout(function() {
            var data = $this.val();
            var dataFull = data.replace(/[^a-zA-Z0-9\s]+/g, '');
            $this.val(dataFull);
        });
    });
});