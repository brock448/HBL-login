function agreeOnScroll() {
    jQuery('.register-content.terms,.insure-detail,.tnc-popup .tnc-detail').on('scroll', function() {
        if (jQuery(this).scrollTop() + jQuery(this).innerHeight() >= jQuery(this)[0].scrollHeight - 20) {
            jQuery(".wrapper .register .btn.accept-dis,.form-group.insure-agree .btn.accept-dis,.tnc-popup .modal-footer .btn.accept-dis").hide();
            jQuery(".wrapper .register .btn.accept,.form-group.insure-agree .btn.accept,.tnc-popup .modal-footer .btn.accept").show();
        } else {
            jQuery(".wrapper .register .btn.accept-dis,.form-group.insure-agree .btn.accept-dis,.tnc-popup .modal-footer .btn.accept-dis").show();
            jQuery(".wrapper .register .btn.accept,.form-group.insure-agree .btn.accept,.tnc-popup .modal-footer .btn.accept").hide();
        }
    });
}

function clearit() {
    $("form").trigger("reset");
    $("form input:text").focus();
}

function enterBtn() {
    $("body").on("keyup", ".form-group input,.form-group select", function(event) {
        if (event.keyCode === 13) {
            event.stopPropagation();
            $(this).blur();
            $(this).closest(".enable-ent").find(".submit-btn").filter(':visible').click().focus();
            $("body").find("#fadeDiv").click();
        }
    });
}

function enterPop() {
    $("body").on("keyup", ".custom-pop", function(event) {
        if (event.keyCode === 13) {
            event.stopPropagation();
            $(this).closest(".enable-ent").find(".btn").filter(':visible').click();
            $("body").find(".login input[name='Username']").focus();
            $(this).blur();
        } else if (event.keyCode === 27) {
            event.stopPropagation();
        }
    });
}
jQuery(document).ready(function() {
    if (window.navigator && window.navigator.msSaveBlob) {
        setTimeout(function() {
            $("body").removeAttr("style");
        }, 100);
    }

    function login() {
        window.location = "/Login";
    }
    $(document).on("click", ".has-child", function(event) {
        event.preventDefault();
    });
    jQuery(document).on("click", ".sidenav .menu li a", function() {
        if (jQuery(this).next('ul').length > 0) {
            if (jQuery('.sidenav .menu li a').not(this).next("ul").is(':visible')) {
                jQuery('.sidenav .menu li a').next("ul").slideUp();
                jQuery('.sidenav .menu li a').removeClass("active");
            }
            jQuery(this).toggleClass("active");
            jQuery(this).next('ul').slideToggle();
            var ele = jQuery(this);
            if (ele.parent().hasClass('information')) {
                jQuery('.sidenav .menu').animate({
                    scrollTop: jQuery('.sidenav .menu').offset().top + $('.sidenav').height()
                }, 2000, function() {});
            }
        }
    });
    jQuery(".top-bar .sidenav-toggle,.side-overlay").click(function() {
        if (jQuery(window).width() < 993) {
            jQuery('.sidebar').toggleClass('show');
            jQuery('.side-overlay').toggle();
            jQuery(".wrapper .register .btn.accept,.form-group.insure-agree .btn.accept,.tnc-popup .modal-footer .btn.accept").show();
        }
        if ((jQuery(window).width() < 993) && (jQuery('.sidebar.show').show())) {
            jQuery('body').toggleClass('over-flow-none')
        }
    });
    jQuery(".service-float").click(function() {
        jQuery('.service-float ul').toggle();
    });
    $('.tool-tip').tooltip();
    $('.blockCountryBtn').click(function() {
        $('.blockCountryDiv').toggleClass('show hide');
        $.fn.extend({
            toggleText: function(a, b) {
                return this.text(this.text() == b ? a : b);
            }
        });
        $('.blockCountryBtn2').toggleText('Cancel', 'Add Country');
        $('.blockCountryDiv').find('select').addClass('multiCustom');
        $('.multiCustom').selectpicker();
    });
    jQuery("body").on("click", ".list .list-items h2.head", function() {
        jQuery(this).next('.list .list-items ul').slideToggle();
    });
    jQuery("body").on("click", ".collapse-sec", function() {
        jQuery(this).next('.collapse-div').slideToggle();
    });
    jQuery("body").on("click", ".collapse-que", function() {
        jQuery(this).next('.collapse-ans').slideToggle();
        $(this).parent().siblings().children().next().slideUp();
        if ($(window).width() < 991) {
            var scrollPos = jQuery(this).offset().top;
            var scrollHeight = $(document).height();
            var scrollPosition = $(window).height() + $(window).scrollTop();
            if ((scrollHeight - scrollPosition) / scrollHeight === 0) {
                var $panel = $(this).closest('.card');
                $('html,body').animate({
                    scrollTop: $panel.offset().top
                }, 800);
            }
            $(window).scrollTop(scrollPos);
            return false;
        }
    });
    jQuery("body").on("click", ".valid-error .close-error", function() {
        jQuery(".valid-error").hide();
    });
    jQuery(".login .form.off .form-group input").keyup(function(event) {
        if (event.keyCode === 13) {
            jQuery(".login .btnSubmit").click();
            jQuery(this).blur();
        }
    });
    jQuery(".loan-statinfo-cont .form-group input").keyup(function(event) {
        if (event.keyCode === 13) {
            jQuery(".submit-btn ").click();
            jQuery(this).blur();
        }
    });
    $('.IBForm').attr('autocomplete', 'off');
    $('MainForm').attr('autocomplete', 'off');
    setTimeout(function() {
        $('.tcnlinks a').attr('ng-click', 'GetTermsConditions()');
        var maxHeight = 0;
        $("body").each(function() {
            if ($(this).height() > maxHeight) {
                maxHeight = $(this).height() - 96;
            }
        }).resize();
        $(".height-owl-card").height(maxHeight);
        $('.card-bundle-columns').delegate('div', 'click', function() {
            $(this).addClass('active').siblings().removeClass('active');
        });
    }, 8000);
    jQuery("#fbchatbot").click(function() {
        $(window).scrollTop($('.tab-pane.active'))
    });
    setTimeout(function() {
        $('.disclosurelinks a').attr('ng-click', 'GetDisclosures()');
    }, 3000);
    agreeOnScroll();
    if (jQuery(window).width() > 993) {
        $('.carousel.slide').on('slide.bs.carousel', function() {
            $("html").on('mouseover', 'body', function() {
                $(".register-content.terms").niceScroll({
                    autohidemode: false,
                    cursorcolor: "#424242",
                    cursorborder: "1px solid #424242"
                }).resize();
            });
        });
        $(".scrollby,.stat-wrapper").niceScroll({
            autohidemode: false,
            cursorcolor: "#424242",
            cursorborder: "1px solid #424242"
        }).resize();
        $(".scrollby,.stat-wrapper").scroll(function() {
            jQuery(".scrollby,.stat-wrapper").niceScroll({
                autohidemode: false,
                cursorcolor: "#424242",
                cursorborder: "1px solid #424242"
            }).resize();
        });
        $('.custom-pop').on('shown.bs.modal', function(e) {
            $("body").css('overflow', 'hidden');
        });
        $('.custom-pop').on('hidden.bs.modal', function(e) {});
    } else {
        $('.custom-pop').on('shown.bs.modal', function(e) {
            $("body").css('overflow', 'hidden');
        });
        $('.custom-pop').on('hidden.bs.modal', function(e) {
            $("body").css('overflow', 'auto');
        });
    }
    jQuery("input.forpassword").hover(function() {
        var placeholderText = jQuery("input.forpassword").attr("placeholder");
        jQuery(this).attr("title", placeholderText);
    });
    jQuery(function() {
        jQuery('[data-toggle="tooltip"]').tooltip()
    });
    if (jQuery(window).width() >= 768) {
        jQuery(".custom-pop,.general-popup.fail").draggable({
            handle: ".modal-content"
        });
    } else {}
    $('.IBForm').keypress(preventEnterSubmit);

    function preventEnterSubmit(e) {
        if (e.which == 13) {
            return false;
        }
    }
    enterPop();
    enterBtn();
    $('.toggleTncBtn').click(function() {
        $('.toggleTncDiv').toggleClass('showEnglish showUrdu');
    });
    setTimeout(function() {
        $('.btn-updateLimit').click(function() {
            $('.view-limits-cont').addClass('blurOn');
            $('.overlap-disable').addClass('display-block');
        });
        $('.btn-removeBlur').click(function() {
            $('.view-limits-cont').removeClass('blurOn');
            $('.overlap-disable').removeClass('display-block');
        });
        $('.nav-tabs a').on("click", function(event) {
            $("html, body").find('#hitrun').click();
            $("html, body").find('.checquebook').click();
            $("html, body").find('.resetform').click();
            $('input#showtransactionPassword').change(function() {
                var type = ($(this).is(':checked') ? 'text' : 'password'),
                    input = $('input#TransactionPassword'),
                    replace = input.clone().attr('type', type)
                input.replaceWith(replace);
            });
        });
    }, 2000);
});
jQuery(document).ready(function() {
    'use strict';
    $(activate);

    function activate() {
        $('.nav-tabs-custom-scroll').scrollingTabs().on('ready.scrtabs', function() {
            $('.tab-content').show();
        });
    }
}());
jQuery(window).on('load', function() {
    if (jQuery(window).width() > 993) {
        $("html").on('mouseover', 'body', function() {
            $(".scrollby,.stat-wrapper").niceScroll({
                autohidemode: false,
                cursorcolor: "#424242",
                cursorborder: "1px solid #424242"
            }).resize();
        });
    } else {}
    if (jQuery(window).width() < 768) {
        $('.nav-tabs a').on("click", function(event) {
            $(window).scrollTop($('.tab-pane.active').offset().top - 20)
        });
    } else {}
});