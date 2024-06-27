$(document).ready(function() {
    DisableAutoComplete();
});

function AddRipples() {
    $('.dropdown-toggle').addClass('ripple');
    $('.btn').addClass('ripple');
    $("input[type=file]").removeClass('ripple');
}

function DisableAutoComplete() {
    try {
        $("form :input").attr("autocomplete", "off");
    } catch (e) {}
}

function DisableCopyPaste() {
    try {
        $('input').bind('copy paste', function(e) {
            e.preventDefault();
        });
    } catch (e) {}
}

function OpenDatepicker(arg) {
    try {
        $(arg).prev().focus();
    } catch (e) {}
}

function BindTooltip() {
    $('.hbl-required').each(function() {
        $(this).append("<span class=\"required\"> *</span>");
    });
    $('.required').each(function() {
        $(this).parent().attr("data-toggle", "tooltip");
        $(this).parent().attr("data-placement", "right");
        if ($(this).parent().next().length == 0) {} else {
            $(this).parent().attr("title", $(this).parent().next().attr('data-val-required'));
        }
    });
    $('[data-toggle="tooltip"]').tooltip();
}

function DisplaySnackBar(msg) {
    var x = document.getElementById("snackbar");
    x.innerText = msg;
    $('#snackbar').fadeIn(200);
    setTimeout(function() {
        $('#snackbar').fadeOut(500);
    }, 3000);
}

function cancelInquiry() {
    NextAction = __Action.INQUIRY;
    ShowLoading(false);
    $("#lblMessage").remove();
    $('#MPin').val("");
    $('#NewMPin').val("");
    $("#ConfirmMPin").val("");
    $("#divInquiry").hide(100);
    $("#divtransactions tbody").empty();
    $('#btnNext').show();
    $("#TransactionId").val('');
    $("#PassCode").val('');
    $("#txtpasscode").val('');
    $("#txtpasscode2").val('');
    $('.hbl-inquiry').removeAttr('disabled');
    $('#IsFatca').prop('checked', false);
    $('#IsMobileNumberOnName').prop('checked', false);
    $('#IsTermsConditionsSeen').prop('checked', false);
    try {
        ResetCamera();
        DisableCameraCapture(ImageTypes.CNIC);
    } catch (e) {
        (e.message);
    }
    try {
        ResetBiometricControl();
        $('#hblbiometrics').hide("swing");
    } catch (e) {}
    $('.validation-summary-errors ul').empty();
    DisplaySnackBar("Please make required changes in fileds and press Next to proceed the transaction.");
    ScrolltoId('#myNavbar');
}

function TransactionCompleted() {
    ShowLoading(false);
    $('#MPin').val("");
    $('#NewMPin').val("");
    $("#ConfirmMPin").val("");
    $("#divInquiry").hide(100);
    $("#divtransactions tbody").empty();
    $('#btnNext').show();
    $("#TransactionId").val('');
    $("#PassCode").val('');
    $("#txtpasscode").val('');
    $("#txtpasscode2").val('');
    $('.hbl-inquiry').removeAttr('disabled');
    $('#IsFatca').prop('checked', false);
    $('#IsMobileNumberOnName').prop('checked', false);
    $('#IsTermsConditionsSeen').prop('checked', false);
    try {
        ResetCamera();
        DisableCameraCapture(ImageTypes.CNIC);
    } catch (e) {}
    try {
        ResetBiometricControl();
        $('#hblbiometrics').hide("swing");
    } catch (e) {}
    $('.validation-summary-errors ul').empty();
    ScrolltoId('#myNavbar');
}

function handleWindowClose() {
    if ((window.event.clientX < 0) || (window.event.clientY < 0)) {
        event.returnValue = "If you have made any changes to the fields without clicking the Save button, your changes will be lost.";
    }
}

function LeftAlignTableFields(divName) {
    try {
        var __TableFields = ["AMOUNT", "FEE", "FEES", "FED", "TOTAL AMOUNT", "balance", "BILL AMOUNT", "BILLAMOUNT"];
        var __targetcolumns = [];
        for (var i = 0; i < __TableFields.length; i++) {
            $('#' + divName + ' th').each(function() {
                var myCol = $(this).index();
                if ($(this).text().toUpperCase().trim() == __TableFields[i]) {
                    __targetcolumns.push(myCol);
                }
            });
        }
        for (var i = 0; i < __targetcolumns.length; i++) {
            $('#' + divName + ' td').each(function() {
                var myCol = $(this).index();
                if (myCol == __targetcolumns[i]) {
                    $(this).css('text-align', 'right');
                }
            });
        }
    } catch (e) {}
}