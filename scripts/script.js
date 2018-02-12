// Author : R.M.Shale
// Software Developer / Enginner @ SBS Softel GoSolutions
// Project : GoRoad Transporter App

// globlas

var endpoint = "";
var latitude = "";
var longitude = "";
var bookingsToUse = {};
var booking = "";
var local = false;
var inAppState = "";
var events = ["En Route To Empty Depot",  "Arrived At Empty Depot" , "En Route to Pack Depot" ,"Arrived At Pack Depot", "En Route To Terminal" , "Arrived At Terminal" , "Container Offloaded"];
var backButtonCapturealreadyFired  = 0 // instances where function refires
var pushNotificationRequstInQueue = [];
var password = "";
var username = "";
var liveEndpoint = "http://goroadapis20170825122713.azurewebsites.net/api/";
var devEndpoint = "http://goroadmobileapp.azurewebsites.net/api/";
// for caching purposes
var logoutCount = 0;
var cachedObjects = [];
var cachedObj = {};
var cacheEndpoint = "";
var cacheStatusLocation = [];
var statusToCache = "";
var wasItChached = false;
// functions

function cleanStorage(clean)
{
debugger;
  //localStorage.setItem("refreshBookings",true);
  var localStorageItems = ["TaskAccpeted","containerCache","cacheStatusLocation","status","bookingAndId","taskAlreadyInProgress","VGMinfo","booking","containerInfo","VGMinfoTwo","VGMinfoThree","VGMinfoFour","VGMinfoFive","fromCaptureBookings","fromWeighBridge","Weighbridge","dualLoad","trippleLoad","fourLoad","fiveLoad","FromThirdPack","FromForthPack"];
  var morelocal = ["FromFithPack","homeButtonFired","handledFromPush","handledBooking","pushNotificationRequstInQueue"];
    for (var i = 0; i < localStorageItems.length; i++)
    {
      localStorage.removeItem(localStorageItems[i]);
    }

    for (var i = 0; i < morelocal.length; i++)
    {
      localStorage.removeItem(morelocal[i]);
    }

  localStorage.setItem("refreshBookings",true);

}

function emailNotificationSuccess (promise)
{

  $('body').removeClass('ui-loading');
  var bookingreference = JSON.parse(localStorage.getItem("currentBookingObj")).bookingRef;
  alert("Cto information for Booking Reference: "  + bookingreference +  " sent");
  console.log(promise);

}

function refreshBookings()
{
  alert("updating bookings..");
  endpoint = localStorage.getItem("endpoint");
  debugger;

  var driverNameObj = JSON.parse(localStorage.getItem("credentials"));

  var driverName = document.getElementById('driverName');
  var number = document.getElementById('number');
  var mzansi = document.getElementById('mzansi');
  var namibia = document.getElementById('namibia');
  var fullDriverNumber;
  driverName.innerHTML = driverNameObj.driverName;
  // set country code

  if (driverNameObj.country == "South Africa")
  {
    number.innerHTML = "+27 " + driverNameObj.number;
    mzansi.style.display = "block";
    namibia.style.display = "none"; // incase re-displays for some weird reason
    fullDriverNumber ="+27" + driverNameObj.number;
  }
  else
  {
    number.innerHTML = "+264 "+ driverNameObj.number;
    mzansi.style.display = "none";
    namibia.style.display = "block"; // incase re-displays for some weird reason
    fullDriverNumber ="+264" + driverNameObj.number;
  }
  // debugger;


  // get current booking tasks  for specific driver
  var driverData = JSON.parse(localStorage.getItem("credentials"));
  driverData.DriverNumber = fullDriverNumber;


  // reset section

  $.ajax({

      url: endpoint + "Booking",
      type: "POST",
      data: JSON.stringify(driverData),
      dataType: "json",
      timeout: 30000,
      async:false,
      contentType: "application/json",
      success: successRefresh,
      error: function (jqXHR, textStatus, errorThrown) {
        alert("There is a technical problem or you have coverage");
  $('body').removeClass('ui-loading'); console.log(errorThrown);
        console.log(errorThrown); }
  })


}

function successFireLocation (position) {
debugger;
var currentEventTracking = {};


console.log("on going location fire");
console.log(position);

var currentEventTracking = {};
if (window.cordova.platformId == "browser")
{
    trackEvent.UUID = "f3a62c91a1df6d1e";
    trackEvent.GPSCoordinates = "-33.9298105" + "," + "18.5047628";
}
else
{
    // alert(device.uuid)
    currentEventTracking.UUID = device.uuid;
    currentEventTracking.GPSCoordinates = latitude + "," + longitude;
}

currentEventTracking.EventName = "Current Location being Traced";
currentEventTracking.BookingReference = "no specific reference";
currentEventTracking.BookingreferenceId = 0;
currentEventTracking.BookingComments = "currenLocation";

$.ajax({

    url: endpoint + "Event",
    type: "POST",
    data: JSON.stringify(currentEventTracking),
    dataType: "json",
    timeout: 30000,
    contentType: "application/json",
    success: function(promise) {
      console.log("my current location captured !");
      console.log(promise);
    },
    error: function (jqXHR, textStatus, errorThrown) {

      $('body').removeClass('ui-loading'); console.log(errorThrown);
                  alert("There is a technical problem please try again later..");
    }
});

}

function errorFireLocation (error) {

console.log("on going location fire error");
console.log(error);

}

function NavigatePage(destination) {

    var options = {};

    options.allowSamePageTransition = true;
    options.reloadPage = false;
    options.changeHash = true;
    options.transition = "fade";

    $.mobile.changePage(destination, options);

    // incase i forget what the hell i was doing LOL!

    //{
    //    allowSamePageTransition: ,
    //    reloadPage: false,
    //    changeHash: true,
    //    transition: "fade"
    //}

}

// ===== HANDLE EVENT functions

function HomeNavigation () {
  debugger;
  NavigatePage("booking.html");
  localStorage.setItem("homeButtonFired",true);
}

function login() {

    debugger;

    var endpoint = localStorage.getItem("endpoint");

    if (JSON.parse(localStorage.getItem("auth")) == null) {
       password = $("#password").val();
       username =  $("#username").val();
    } else {
      username = JSON.parse(localStorage.getItem("auth")).username;
      password = JSON.parse(localStorage.getItem("auth")).password;
      localStorage.setItem("fromAuth",true);
    }



    $.support.cors = true;
    $('body').addClass('ui-loading');

    console.log(password + " " + username);

        if (password == "" && username == "") {

            alert("Please enter both password and username..");
            $('body').removeClass('ui-loading');
            return;
        }

    var credentials = {};

    credentials.username = username;
    credentials.password = password;
    if(window.cordova.platformId == "browser")
      credentials.uuid = "f3a62c91a1df6d1e";
    else
      credentials.uuid = device.uuid;

    // perform login

    ajaxPostSend ("Login" , successLogin , true , JSON.stringify(credentials))

}

function logout() {



debugger;
if (logoutCount == 3) {
    logoutCount = 0
      if (window.cordova.platformId != "browser") // annoying inconsistent error
        if (device.platform == "Android") {

        endpoint = 'http://goroadapis20170825122713.azurewebsites.net/api/';

        // endpoint for delete endpoint will always be hard coded
        // push notifications only work effieciently in real devices


        // clear storage and controllers rest that need reseting

        var registrationId  = localStorage.getItem("registrationId");

      $.ajax({

          url: endpoint + "register/" + registrationId,
          type: "DELETE",
          timeout: 30000,
          async:false,
          contentType: "application/json",
          success: deletePushRegistration,
          error: function (jqXHR, textStatus, errorThrown) {
            alert("There is a technical problem please try again later..");
            $('body').removeClass('ui-loading'); console.log(errorThrown);
            console.log(errorThrown); }

      });
    // clear storage and controllers rest that need reseting
}
    localStorage.clear();

    if(local)
      endpoint = "http://localhost:51155/api/";
    else
      endpoint = "http://goroadapis20170825122713.azurewebsites.net/api/";

    localStorage.setItem("endpoint", endpoint);
    NavigatePage("login.html");

  } else {
    logoutCount +=1;
    if (logoutCount == 3) {
      alert("If you tap logout again , app will logout");
    }
  }
}

function deletePushRegistration(promise) {
console.log("deleted from Azure");
console.log(promise);

}

/* --------------------------------------------- HANDLE DYNAMIC POST ------------------- */

function ajaxPostSend (endpointName , promiseFunction , asyncType , object) {
  debugger;
  // always declare endpoint incase not globally set!!

    endpoint = localStorage.getItem("endpoint");
    cacheEndpoint  = endpointName;
    cachedObj = JSON.parse(object);

    if(localStorage.getItem("containerOffloaded")) // sort incase of poor connectivity
       cachedObj.Complete = true;

  $.ajax({

      url: endpoint + endpointName,
      type: "POST",
      data: JSON.stringify(cachedObj),
      dataType: "json",
      async:asyncType,
      timeout: 30000,
      contentType: "application/json",
      success: promiseFunction,
      error: errorCache
    });

}

/* --------------------------------------------- HANDLE DYNAMIC POST ------------------- */
function errorCache (jqXHR, textStatus, errorThrown) {

debugger;


  switch (cacheEndpoint) {
   case "Capture":

   if (cachedObj.Status  == "Arrived At Empty Depot")
      {
          localStorage.setItem("containerCache",JSON.stringify(cachedObj));
          successContainertrack();
          alert("Container Details Caputered \n and will be sent when there is proper coverage");
      }
      else if(cachedObj.key == "Pack1")
      {
         localStorage.setItem("VGM1Cache",JSON.stringify(cachedObj));
         successVGM();
         alert("Weights will be sent \n  when there is proper coverage");

      }
      else if (cachedObj.key == "Pack2")
      {// not using else incase for future statement packs
        localStorage.setItem("VGM2Cache",JSON.stringify(cachedObj));
        successVGM();
        alert("Weights at 2nd pack will be sent \n  when there is proper coverage");
      }
      else if (cachedObj.key == "Pack3")
      {// not using else incase for future statement packs
        localStorage.setItem("VGM3Cache",JSON.stringify(cachedObj));
        successVGM();
        alert("Weights at 3rd pack will be sent \n  when there is proper coverage");
      }
      else if (cachedObj.key == "Pack4")
      {// not using else incase for future statement packs
        localStorage.setItem("VGM4Cache",JSON.stringify(cachedObj));
        successVGM();
        alert("Weights at forth pack will be sent \n  when there is proper coverage");
      }
      else if (cachedObj.key == "Pack5")
      {// not using else incase for future statement packs
        localStorage.setItem("VGM5Cache",JSON.stringify(cachedObj));
        successVGM();
        alert("Weights at fifth pack will be sent \n  when there is proper coverage");
      }
     break;

      case "Login":

          if (localStorage.getItem("auth")!= null)
          {
            console.log("authenticated by no signal")
            alert("No Connectivity or poor coverage");
            //NavigatePage("bookings.html");
          }
          else
          {
            console.log("no authed yet");
            alert("Technical Error unable to log you in");
          }

      break;
 }
 if (localStorage.getItem("status") == "Arrived At Terminal")
     alert("Cannot offload container without proper coverage..");
  $('body').removeClass('ui-loading'); console.log(errorThrown);



}


function successLogin(promise) {

    debugger;
    // check if promise is successful

    if (promise.message == "success")
    {
        // store auth

        var auth = {};

        var authState = JSON.parse(localStorage.getItem("fromAuth"));

        if (authState == null) {
        auth.username = $("#username").val();
        auth.password = $("#password").val();

        localStorage.setItem("auth",JSON.stringify(auth));
        promise.loggedIn = true;
        console.log(promise);

        localStorage.setItem("credentials", JSON.stringify(promise));
        NavigatePage("booking.html");

        }

        getLocation();

    }
    else
        alert("Sorry we do not have this driver on our system \n or check credentials enterered");

$('body').removeClass('ui-loading');

}

function onSuccessLocation(position) {

    latitude =  position.coords.latitude;
    longitude  = position.coords.longitude;

    console.log("longitude :" + longitude);
    console.log("latitude : " +  latitude);
}

function onErrorLocation(error) {

    console.log(error);

}

function getLocation() {

    navigator.geolocation.getCurrentPosition(onSuccessLocation, onErrorLocation);
}

function trackEventer(status , bookingComments) {
    debugger;
        $('body').addClass('ui-loading');
    // get endpoint && current booking reference
    endpoint = localStorage.getItem("endpoint");

    var date = new Date(Date.now());
    var bookingAndId = JSON.parse(localStorage.getItem("bookingAndId"));

    getLocation();  // get gps cordinates





    var trackEvent = {};
    if (window.cordova.platformId == "browser")
    {
        trackEvent.UUID = "f3a62c91a1df6d1e";
        trackEvent.GPSCoordinates = "-33.9298105" + "," + "18.5047628";
    }
    else
    {
        // alert(device.uuid)
        trackEvent.UUID = device.uuid;
        trackEvent.GPSCoordinates = latitude + "," + longitude;

    }

    trackEvent.EventName = status;
    inAppState = status;
    trackEvent.BookingReference = bookingAndId.Bookingreference;
    trackEvent.BookingreferenceId = bookingAndId.id;
    trackEvent.BookingComments = bookingComments;
    trackEvent.EventDateTime = date;

    // check for unfired events / commments
    if (JSON.parse(localStorage.getItem("cacheStatusLocation")) == null)
      trackEvent.cachedDataString = "no cache data"
    else
      trackEvent.cachedDataString = localStorage.getItem("cacheStatusLocation");

    statusToCache =  bookingComments;
    // send current event

    $.ajax({

        url: endpoint + "Event",
        type: "POST",
        data: JSON.stringify(trackEvent),
        dataType: "json",
        timeout: 30000,
        contentType: "application/json",
        success: successTrackEvent,
        error: errorLocationCache
    });
}


// ============== HANDLE CACHE STATUS / COMMENT ========= //

function errorLocationCache (jqXHR, textStatus, errorThrown) {

// resort cached data if still present
var date = new Date(Date.now());
if (JSON.parse(localStorage.getItem("cacheStatusLocation")) != null)
  cacheStatusLocation = JSON.parse(localStorage.getItem("cacheStatusLocation"));

  if (localStorage.getItem("fromTerminal") != null)
        localStorage.removeItem("fromTerminal"); // incase there is a stroage but promise failed

  cacheStatusLocation.push(inAppState);
  cacheStatusLocation.push(statusToCache);
  cacheStatusLocation.push(date);

  localStorage.setItem("cacheStatusLocation",JSON.stringify(cacheStatusLocation));
  alert(inAppState + " Will be Fired when you get proper Coverage");

  successTrackEvent();
  $('body').removeClass('ui-loading');
  console.log(errorThrown);

}

// --------------- SUCCESS PROMISES =========

function successTrackEvent(promise) {
debugger;
var tempPromise = promise;
// clear storage
if (inAppState != "In Process Trip Cancelled" || inAppState != "Booking Rejected") {
    if (tempPromise != undefined) { // means its cache promise remove item
        if (JSON.parse(localStorage.getItem("cacheStatusLocation")) != null) {
            localStorage.removeItem("cacheStatusLocation");
            alert("All saved events and comments have been sent..");
        }
        // container cached details
        if (JSON.parse(localStorage.getItem("containerCache"))!= null) {
          wasItChached = true;
          ajaxPostSend("Capture" , successContainertrack, true , localStorage.getItem("containerCache"));
          alert("All Saved Container Details Have been Captured");
          localStorage.removeItem("containerCache");

        }
        // vgm cached details
        if (JSON.parse(localStorage.getItem("VGM1Cache"))!= null) {

           ajaxPostSend("Capture" , successVGM, true , localStorage.getItem("VGM1Cache"));
           alert("All Saved Weights Have been Captured");
           localStorage.removeItem("VGM1Cache");
        }
        // second container pack details
        else if (JSON.parse(localStorage.getItem("VGM2Cache"))!= null) {

           ajaxPostSend("Capture" , successVGM, true , localStorage.getItem("VGM2Cache"));
           alert("All Saved Weights from second pack \nHave been Captured");
           localStorage.removeItem("VGM2Cache");
        }
        else if (JSON.parse(localStorage.getItem("VGM3Cache"))!= null) {

           ajaxPostSend("Capture" , successVGM, true , localStorage.getItem("VGM3Cache"));
           alert("All Saved Weights from thrid pack \nHave been Captured");
           localStorage.removeItem("VGM3Cache");
        }
        // second container pack details
        else if (JSON.parse(localStorage.getItem("VGM4Cache"))!= null) {

           ajaxPostSend("Capture" , successVGM, true , localStorage.getItem("VGM4Cache"));
           alert("All Saved Weights from forth pack \nHave been Captured");
           localStorage.removeItem("VGM4Cache");
        }
    }else if (inAppState == "Booking Accepted") {
  // get faders in
  handleTaskRequest();
  }else if (inAppState == "Booking Rejected") {
    debugger;
    // get faders in
    alert("Please reject booking with proper coverage");
      cleanStorage();
  }
}
  debugger;
    if (inAppState != "Cancelled Task")
      localStorage.setItem("status",inAppState);

    console.log("Perform next task");
    $('body').removeClass('ui-loading');

    // handle events after promise returns
debugger;

    switch (inAppState) {
      case "En Route To Empty Depot":

      //  send comment and do nothing /////  =====>

      if(JSON.parse(localStorage.getItem("fromComment"))) {
        localStorage.removeItem("fromComment");
        console.log("Comment Sent...");
        $("textarea").val("");
        $('body').removeClass('ui-loading');
        alert("Comment Sent");
        return;
      }

      //  send comment and do nothing /////  =====>


      $('#enRouteToEmptyDepotDiv').fadeOut(500);
      $('#arrivedAtEmptyDepotDiv').fadeIn(1000);
      $('#cancelTripDiv').fadeIn(1000);
      $('#backToBooking').fadeOut(500);
      // globally expose driver status element
      //headerStatus.innerHTML = "En Route To Pack House";
      localStorage.setItem("status",inAppState);
      if (JSON.parse(localStorage.getItem("taskAlreadyInProgress")))
          NavigatePage("transportBooking.html");// if in event that task already exits i.e prev tapped
      else
        localStorage.setItem("taskAlreadyInProgress",true);
      break;

      case "Arrived At Empty Depot":

      //  send comment and do nothing /////  =====>

      if(JSON.parse(localStorage.getItem("fromComment"))) {
        localStorage.removeItem("fromComment");
        console.log("Comment Sent...");
        $("textarea").val("");
        $('body').removeClass('ui-loading');
        alert("Comment Sent");
        return;
      }

      //  send comment and do nothing /////  =====>


        localStorage.setItem("status",inAppState);
        // if (JSON.parse(localStorage.getItem("Weighbridge"))) { // handle event for weigh bridge functionality
        //
        //   $("#arrivedAtWeighBridgeDiv").fadeOut(500);
        //   $("#enRouteToWeighBridgeDiv").fadeIn(1000);
        //   localStorage.removeItem("fromWeighBridge");
        // }
        //else

        // conditional / clear weights
        //localStorage.removeItem("VGMinfo");
        //localStorage.removeItem("VGMinfoTwo");

           if (JSON.parse(localStorage.getItem("fromCaptureBookings"))) {

             localStorage.removeItem("fromCaptureBookings");
             $("#arrivedAtPackDepotDiv").fadeOut(500);
             $("#packDepotDiv").fadeIn(1000);

           }
           else

        NavigatePage("captureBookings.html");

        break;
     case "Leaving Empty Depot":

     //  send comment and do nothing /////  =====>

     if(JSON.parse(localStorage.getItem("fromComment"))) {
       localStorage.removeItem("fromComment");
       console.log("Comment Sent...");
       $("textarea").val("");
       $('body').removeClass('ui-loading');
       alert("Comment Sent");
       return;
     }

     //  send comment and do nothing /////  =====>


        localStorage.setItem("status",inAppState);
        NavigatePage("transportBooking.html");

        break;
     case "En Route to Pack Depot":

     //  send comment and do nothing /////  =====>

     if(JSON.parse(localStorage.getItem("fromComment"))) {
       localStorage.removeItem("fromComment");
       console.log("Comment Sent...");
       $("textarea").val("");
       $('body').removeClass('ui-loading');
       alert("Comment Sent");
       return;
     }

     //  send comment and do nothing /////  =====>


     if (JSON.parse(localStorage.getItem("FromSecondPack")) && JSON.parse(localStorage.getItem("Weighbridge"))) {

          localStorage.removeItem("VGMinfo");
          localStorage.removeItem("FromSecondPack");
         NavigatePage("captureBookings.html");

     }
     else if (JSON.parse(localStorage.getItem("fromWeighBridge"))) {
         localStorage.removeItem("fromWeighBridge");
         NavigatePage("captureBookings.html");
       }
     else {

     localStorage.removeItem("VGMinfo");
     $("#packDepotDiv").fadeOut(500);
     $("#arrivedAtPackDepotDiv").fadeIn(1000);
     $("#arrivedAtPackDepot").fadeIn(1000);
    //  cater for to pack decimalPoints
    if (JSON.parse(localStorage.getItem("dualLoad")))
        $("#packdepotOneDiv").fadeIn(1000);
      }

     break;

     case "Arrived At Pack Depot":

     //  send comment and do nothing /////  =====>

     if(JSON.parse(localStorage.getItem("fromComment"))) {
       localStorage.removeItem("fromComment");
       console.log("Comment Sent...");
       $("textarea").val("");
       $('body').removeClass('ui-loading');
       alert("Comment Sent");
       return;
     }

     //  send comment and do nothing /////  =====>


     if (JSON.parse(localStorage.getItem("fromTerminal"))) {

       //NavigatePage("captureBookings.html");
       $("#arrivedAtTerminalDiv").fadeOut(500);
       $("#enRouteToTerminalDiv").fadeIn(1000);
       localStorage.removeItem("fromTerminal");

     }
     else if (JSON.parse(localStorage.getItem("dualLoad")) && JSON.parse(localStorage.getItem("Weighbridge")))
     {
        if (localStorage.getItem("FromSecondPack")) {
          $("#arrivedAtPackDepotTwoDiv").fadeOut(500);
          $("#enrouteTopackDepotTwoDiv").fadeIn(1000);
          localStorage.removeItem("fromWeighBridge"); // conditional check after testing
        }
        else
        NavigatePage("packLoadTwo.html") //
     }
     else if (JSON.parse(localStorage.getItem("dualLoad")) && JSON.parse(localStorage.getItem("VGMinfo")) != null ) {
       // handle dual load functionality
          if (JSON.parse(localStorage.getItem("VGMinfoTwo")) != null) {
                  $("#VGMSectionTwo").css('display', 'none');
                  $("#arrivedAtPackDepotTwoDiv").fadeOut(500);
                  $("#enrouteTopackDepotTwoDiv").fadeIn(1000);

          }
         else if (JSON.parse(localStorage.getItem("FromSecondPack"))) {
            NavigatePage("captureBookings.html");

         }
         else
         NavigatePage("packLoadTwo.html") // ?
     }
     else if (JSON.parse(localStorage.getItem("fromWeighBridge"))) {
       localStorage.removeItem("fromWeighBridge");
       $("#arrivedAtWeighBridgeDiv").fadeOut(500);
       $("#enRouteToWeighBridgeDiv").fadeIn(1000);
     }
     else if (JSON.parse(localStorage.getItem("Weighbridge"))) { // handle weighBridge functionality
       NavigatePage("weighBridge.html") ;
     }
     else {
       // show VGM section STUF F
       $("#VGMSection").fadeIn(1000);
       $("#VGMSection #submit").css('display', 'block');
       $("#arrivedAtPackDepotDiv").css('display', 'none');
     }
       localStorage.setItem("status",inAppState);
        break;

    // conditional event(s)

    case "En Route To Weighbridge":

    //  send comment and do nothing /////  =====>

    if (JSON.parse(localStorage.getItem("fromComment"))) {
      localStorage.removeItem("fromComment");
      console.log("Comment Sent...");
      $("textarea").val("");
      $('body').removeClass('ui-loading');
      alert("Comment Sent");
      return;
    }

    //  send comment and do nothing /////  =====>


    if (JSON.parse(localStorage.getItem("fromCaptureBookings"))) {

      NavigatePage("weighBridge.html");

    } else if (JSON.parse(localStorage.getItem("fromWeighBridge"))) {

      $("#arrivedAtWeighBridgeDiv").fadeOut(500);
      $("#enRouteToWeighBridgeDiv").fadeIn(1000);
      localStorage.removeItem("fromWeighBridge");

    }
    else {
        $("#enRouteToWeighBridgeDiv").fadeOut(500);
        $("#arrivedAtWeighBridgeDiv").fadeIn(1000);
    }

    break;

    case "Arrived At Weighbridge":

    //  send comment and do nothing /////  =====>

    if(JSON.parse(localStorage.getItem("fromComment"))) {
      localStorage.removeItem("fromComment");
      console.log("Comment Sent...");
      $("textarea").val("");
      $('body').removeClass('ui-loading');
      alert("Comment Sent");
      return;
    }

    //  send comment and do nothing /////  =====>


    $("#arrivedAtWeighBridgeDiv").fadeOut(500);
    //$("#weighBridgeSection").fadeIn(1000);

    NavigatePage("captureBookings.html");

    break;

    case "En Route To Second Pack Depot":

    if(JSON.parse(localStorage.getItem("fromComment"))) {
      localStorage.removeItem("fromComment");
      console.log("Comment Sent...");
      $("textarea").val("");
      $('body').removeClass('ui-loading');
      alert("Comment Sent");
      return;
    }
    ///

    if (JSON.parse(localStorage.getItem("dualLoad")) && JSON.parse(localStorage.getItem("Weighbridge")))
   {
     if (JSON.parse(localStorage.getItem("fromWeighBridge"))) {
         localStorage.removeItem("fromWeighBridge");
             NavigatePage("packLoadTwo.html") //
     }else {
       $("#enrouteTopackDepotTwoDiv").fadeOut(500);
       $("#VGMSectionTwo").fadeOut(500);
       $("#arrivedAtPackDepotTwoDiv").fadeIn(1000);
     }

   }
   else {
          localStorage.removeItem("VGMinfoTwo");
          $("#enrouteTopackDepotTwoDiv").fadeOut(500);
          $("#VGMSectionTwo").fadeOut(500);
          $("#arrivedAtPackDepotTwoDiv").fadeIn(1000);
      }
    break;

    case "Arrived At Second Pack Depot":

    //  send comment and do nothing /////  =====>

    if(JSON.parse(localStorage.getItem("fromComment"))) {
      localStorage.removeItem("fromComment");
      console.log("Comment Sent...");
      $("textarea").val("");
      $('body').removeClass('ui-loading');
      alert("Comment Sent");
      return;
    }

    //  send comment and do nothing /////  =====>
    if (JSON.parse(localStorage.getItem("FromThirdPack")))
    {
        localStorage.removeItem("FromThirdPack");
        $("#arrivedAtPackDepotThreeDiv").fadeOut(500);
        $("#VGMSectionThree").fadeOut(500);
        $("#enrouteTopackDepotThreeDiv").fadeIn(1000);
    }
    else if (JSON.parse(localStorage.getItem("trippleLoad"))  && JSON.parse(localStorage.getItem("Weighbridge"))) {
      NavigatePage("packLoadThree.html");
    }
     else if (JSON.parse(localStorage.getItem("dualLoad")) && JSON.parse(localStorage.getItem("Weighbridge")))
    {
       if (JSON.parse(localStorage.getItem("fromWeighBridge"))) {
         localStorage.removeItem("fromWeighBridge");
         $("#arrivedAtWeighBridgeDiv").fadeOut(500);
         $("#enRouteToWeighBridgeDiv").fadeIn(1000);
       }
       else
       NavigatePage("weighBridge.html") //
    } else {

      var originalVGMInfo  = JSON.parse(localStorage.getItem("VGMinfo"));

      $("#arrivedAtPackDepotTwoDiv").fadeOut(500);
      $("#VGMSectionTwo").fadeIn(1000);
      $("#VGMSectionTwo #VGM").val(originalVGMInfo.TareWeight);
      $("#VGMSectionTwo #temptale").val(originalVGMInfo.Temptale);
      $("#weightExludeTwoPack1").val(originalVGMInfo.weightExlude);
      $("#weightIncludeTwoPack1").val(originalVGMInfo.weightInclude)
      $("#resultExcludeTwo").val(originalVGMInfo.VGM);
      $("#resultIncludeTwo").val(originalVGMInfo.CargoWeight);

      }
    break;

    case "En Route To Third Pack Depot":

    //  send comment and do nothing /////  =====>

    if(JSON.parse(localStorage.getItem("fromComment"))) {
      localStorage.removeItem("fromComment");
      console.log("Comment Sent...");
      $("textarea").val("");
      $('body').removeClass('ui-loading');
      alert("Comment Sent");
      return;
    }

    if (JSON.parse(localStorage.getItem("trippleLoad")) && JSON.parse(localStorage.getItem("Weighbridge")))
   {
     if (JSON.parse(localStorage.getItem("fromWeighBridge"))) {
         localStorage.removeItem("fromWeighBridge");
             NavigatePage("packLoadThree.html") //
     }else {
       $("#enrouteTopackDepotThreeDiv").fadeOut(500);
       $("#VGMSectionThree").fadeOut(500);
       $("#arrivedAtPackDepotThreeDiv").fadeIn(1000);
     }

   }
   else {
          localStorage.removeItem("VGMinfoThree");
          $("#enrouteTopackDepotThreeDiv").fadeOut(500);
          $("#VGMSectionThree").fadeOut(500);
          $("#arrivedAtPackDepotThreeDiv").fadeIn(1000);
      }

    break;

    case "Arrived At Third Pack Depot":

    //  send comment and do nothing /////  =====>

    if(JSON.parse(localStorage.getItem("fromComment"))) {
      localStorage.removeItem("fromComment");
      console.log("Comment Sent...");
      $("textarea").val("");
      $('body').removeClass('ui-loading');
      alert("Comment Sent");
      return;
    }
    if (JSON.parse(localStorage.getItem("FromForthPack")))
    {
        localStorage.removeItem("FromForthPack");
        $("#arrivedAtPackDepotFourDiv").fadeOut(500);
        $("#VGMSectionFour").fadeOut(500);
        $("#enrouteTopackDepotFourDiv").fadeIn(1000);
    }
    else if (JSON.parse(localStorage.getItem("fourLoad")) && JSON.parse(localStorage.getItem("Weighbridge")))
   {
        NavigatePage("packLoadFour.html") //
   }
    else if (JSON.parse(localStorage.getItem("trippleLoad")) && JSON.parse(localStorage.getItem("Weighbridge")))
        {
           if (JSON.parse(localStorage.getItem("fromWeighBridge"))) {
             localStorage.removeItem("fromWeighBridge");
             $("#arrivedAtWeighBridgeDiv").fadeOut(500);
             $("#enRouteToWeighBridgeDiv").fadeIn(1000);
           }
           else
           NavigatePage("weighBridge.html") //
        } else {
debugger;
          var originalVGMInfoTwo  = JSON.parse(localStorage.getItem("VGMinfoTwo"));

          var VGMinfo = JSON.parse(localStorage.getItem("VGMinfo"));
          var VGMinfoTwo = JSON.parse(localStorage.getItem("VGMinfoTwo"));

          $("#arrivedAtPackDepotThreeDiv").fadeOut(500);
          $("#VGMSectionThree").fadeIn(1000);
          $("#VGMSectionThree #VGM").val(originalVGMInfoTwo.TareWeight);
          $("#VGMSectionThree #temptale").val(originalVGMInfoTwo.Temptale);
          $("#weightExludeThreePack1").val(VGMinfo.CargoWeight);
          $("#weightIncludeThreePack1").val(VGMinfo.VGM);
          $("#weightExludeThreePack2").val(VGMinfoTwo.CargoWeightTwo);
          $("#weightIncludeThreePack2").val(VGMinfoTwo.VGMTwo);
        //  $("#resultExcludeThree").val(parseFloat(originalVGMInfoTwo.TotalCargoWeight) + parseFloat(originalVGMInfoTwo.TareWeight));
        //  $("#resultIncludeThree").val(originalVGMInfoTwo.TotalVGM);
          }

    break;

    case "En Route To Forth Pack Depot":

        //  send comment and do nothing /////  =====>

        if(JSON.parse(localStorage.getItem("fromComment"))) {
          localStorage.removeItem("fromComment");
          console.log("Comment Sent...");
          $("textarea").val("");
          $('body').removeClass('ui-loading');
          alert("Comment Sent");
          return;
        }

        if (JSON.parse(localStorage.getItem("fourLoad")) && JSON.parse(localStorage.getItem("Weighbridge")))
        {
         if (JSON.parse(localStorage.getItem("fromWeighBridge"))) {
             localStorage.removeItem("fromWeighBridge");
                 NavigatePage("packLoadFour.html") //
         }else {
           $("#enrouteTopackDepotFourDiv").fadeOut(500);
           $("#VGMSectionFour").fadeOut(500);
           $("#arrivedAtPackDepotFourDiv").fadeIn(1000);
         }

        }
        else {
              localStorage.removeItem("VGMinfoFour");
              $("#enrouteTopackDepotFourDiv").fadeOut(500);
              $("#VGMSectionFour").fadeOut(500);
              $("#arrivedAtPackDepotFourDiv").fadeIn(1000);
          }

        break;

    case "Arrived At Forth Pack Depot":

    //  send comment and do nothing /////  =====>

    if(JSON.parse(localStorage.getItem("fromComment"))) {
      localStorage.removeItem("fromComment");
      console.log("Comment Sent...");
      $("textarea").val("");
      $('body').removeClass('ui-loading');
      alert("Comment Sent");
      return;
    }
    if (JSON.parse(localStorage.getItem("FromFifthPack")))
    {
        localStorage.removeItem("FromFifthPack");
        $("#arrivedAtPackDepotFiveDiv").fadeOut(500);
        $("#VGMSectionFive").fadeOut(500);
        $("#enrouteTopackDepotFiveDiv").fadeIn(1000);
    }
    else if (JSON.parse(localStorage.getItem("fiveLoad")) && JSON.parse(localStorage.getItem("Weighbridge")))
   {
        NavigatePage("packLoadFive.html") //
   }
    else if (JSON.parse(localStorage.getItem("fourLoad")) && JSON.parse(localStorage.getItem("Weighbridge")))
    {
      if (JSON.parse(localStorage.getItem("fromWeighBridge"))) {
        localStorage.removeItem("fromWeighBridge");
        $("#arrivedAtWeighBridgeDiv").fadeOut(500);
        $("#enRouteToWeighBridgeDiv").fadeIn(1000);
      }
      else
      NavigatePage("weighBridge.html") //
   } else {

     var originalVGMInfoThree  = JSON.parse(localStorage.getItem("VGMinfoThree"));

     $("#arrivedAtPackDepotFourDiv").fadeOut(500);
     $("#VGMSectionFour").fadeIn(1000);
     $("#VGMSectionFour #VGM").val(originalVGMInfoThree.TareWeight);
     $("#VGMSectionFour #temptale").val(originalVGMInfoThree.Temptale);
     $("#weightExludeFourPack1").val(originalVGMInfoThree.CargoWeight);
     $("#weightIncludeFourPack1").val(originalVGMInfoThree.VGM);
     $("#weightExludeFourPack2").val(originalVGMInfoThree.CargoWeightTwo);
     $("#weightIncludeFourPack2").val(originalVGMInfoThree.VGMTwo);
     $("#weightExludeFourPack3").val(originalVGMInfoThree.CargoWeightThree);
     $("#weightIncludeFourPack3").val(originalVGMInfoThree.VGMThree);
     $("#resultExcludeFour").val(parseFloat(originalVGMInfoThree.TotalCargoWeight) + parseFloat(originalVGMInfoThree.TareWeight));
     $("#resultIncludeFour").val(originalVGMInfoThree.TotalVGM);
     }


    break;

    case "En Route To Fifth Pack Depot":

    //  send comment and do nothing /////  =====>

    if(JSON.parse(localStorage.getItem("fromComment"))) {
      localStorage.removeItem("fromComment");
      console.log("Comment Sent...");
      $("textarea").val("");
      $('body').removeClass('ui-loading');
      alert("Comment Sent");
      return;
    }

    if (JSON.parse(localStorage.getItem("fiveLoad")) && JSON.parse(localStorage.getItem("Weighbridge")))
    {
     if (JSON.parse(localStorage.getItem("fromWeighBridge"))) {
         localStorage.removeItem("fromWeighBridge");
             NavigatePage("packLoadFive.html") //
     }else {
       $("#enrouteTopackDepotFiveDiv").fadeOut(500);
       $("#VGMSectionFive").fadeOut(500);
       $("#arrivedAtPackDepotFiveDiv").fadeIn(1000);
     }

    }
    else {
          localStorage.removeItem("VGMinfoFive");
          $("#enrouteTopackDepotFiveDiv").fadeOut(500);
          $("#VGMSectionFive").fadeOut(500);
          $("#arrivedAtPackDepotFiveDiv").fadeIn(1000);
      }

    break;

    case "Arrived At Fifth Pack Depot":

    //  send comment and do nothing /////  =====>

    if(JSON.parse(localStorage.getItem("fromComment"))) {
      localStorage.removeItem("fromComment");
      console.log("Comment Sent...");
      $("textarea").val("");
      $('body').removeClass('ui-loading');
      alert("Comment Sent");
      return;
    }
    if (JSON.parse(localStorage.getItem("fiveLoad")) && JSON.parse(localStorage.getItem("Weighbridge")))
    {
      if (JSON.parse(localStorage.getItem("fromWeighBridge"))) {
        localStorage.removeItem("fromWeighBridge");
        $("#arrivedAtWeighBridgeDiv").fadeOut(500);
        $("#enRouteToWeighBridgeDiv").fadeIn(1000);
      }
      else
      NavigatePage("weighBridge.html") //
   } else {

     var originalVGMInfofour  = JSON.parse(localStorage.getItem("VGMinfoFour"));

     $("#arrivedAtPackDepotFiveDiv").fadeOut(500);
     $("#VGMSectionFive").fadeIn(1000);
     $("#VGMSectionFive #VGM").val(originalVGMInfofour.TareWeight);
     $("#VGMSectionFive #temptale").val(originalVGMInfofour.Temptale);
     $("#weightExludeFivePack1").val(originalVGMInfofour.CargoWeight);
     $("#weightIncludeFivePack1").val(originalVGMInfofour.VGM);
     $("#weightExludeFivePack2").val(originalVGMInfofour.CargoWeightTwo);
     $("#weightIncludeFivePack2").val(originalVGMInfofour.VGMTwo);
     $("#weightExludeFivePack3").val(originalVGMInfofour.CargoWeightThree);
     $("#weightIncludeFivePack3").val(originalVGMInfofour.VGMThree);
     $("#weightExludeFivePack4").val(originalVGMInfofour.CargoWeightFour);
     $("#weightIncludeFivePack4").val(originalVGMInfofour.VGMFour);
     $("#resultExcludeFive").val(parseFloat(originalVGMInfofour.TotalCargoWeight) + parseFloat(originalVGMInfofour.TareWeight));
     $("#resultIncludeFive").val(originalVGMInfofour.TotalVGM);
   }


    break;



    case "En Route To Terminal":

    //  send comment and do nothing /////  =====>

    if(JSON.parse(localStorage.getItem("fromComment"))) {
      localStorage.removeItem("fromComment");
      console.log("Comment Sent...");
      $("textarea").val("");
      $('body').removeClass('ui-loading');
      alert("Comment Sent");
      return;
    }

    //  send comment and do nothing /////  =====>


      localStorage.setItem("status",inAppState);
      $("#h3Status").val(inAppState);


      if (JSON.parse(localStorage.getItem("fromTerminal"))) {

        $("#arrivedAtTerminalDiv").fadeIn(500);
        $("#enRouteToTerminalDiv").fadeOut(1000);
        $('#containerOffLoadedDiv').fadeOut(1000);
        localStorage.removeItem("fromTerminal");
      } else {
        $("#enRouteToTerminalDiv").fadeOut(500);
        $("#arrivedAtTerminalDiv").fadeIn(1000);
      }

        break;
    case "Arrived At Terminal":

    //  send comment and do nothing /////  =====>

    if(JSON.parse(localStorage.getItem("fromComment"))) {
      localStorage.removeItem("fromComment");
      console.log("Comment Sent...");
      $("textarea").val("");
      $('body').removeClass('ui-loading');
      alert("Comment Sent");
      return;
    }

    //  send comment and do nothing /////  =====>


    localStorage.setItem("status",inAppState);
    $("#h3Status").val(inAppState);

    if (JSON.parse(localStorage.getItem("fromTerminal"))) {

      $('#arrivedAtTerminalDiv').fadeIn(1000);
      $('#containerOffLoadedDiv').fadeOut(1000);
      localStorage.removeItem("fromTerminal");
    } else {

      $('#arrivedAtTerminalDiv').fadeOut(500);
      $('#containerOffLoadedDiv').fadeIn(1000);
    }

        break;
    case "Container Offloaded":

    //  send comment and do nothing /////  =====>

    if(JSON.parse(localStorage.getItem("fromComment"))) {
      localStorage.removeItem("fromComment");
      console.log("Comment Sent...");
      $("textarea").val("");
      $('body').removeClass('ui-loading');
      alert("Comment Sent");
      return;
    }

    //  send comment and do nothing /////  =====>
    var booking = JSON.parse(localStorage.getItem("bookingAndId")).Bookingreference;
    alert("Booking "+ booking +" Complete.")
    localStorage.setItem("containerOffloaded",false); // sort incase of poor connectivity
      cleanStorage();

      NavigatePage("booking.html");

        break;

      // task related events

    case "Cancelled Task":
    //  send comment and do nothing /////  =====>

    if(JSON.parse(localStorage.getItem("fromComment"))) {
      localStorage.removeItem("fromComment");
      console.log("Comment Sent...");
      $("textarea").val("");
      $('body').removeClass('ui-loading');
      alert("Comment Sent");
      return;
    }

    //  send comment and do nothing /////  =====>

    $('#arrivedAtEmptyDepotDiv').fadeOut(500);
    $('#cancelTripDiv').fadeOut(500);

    var storageClean = ["TaskAccpeted","taskAlreadyInProgress" , "status" , "homeButtonFired", "containerInfo" , "booking" , "VGMinfoTwo", "VGMInfoThree" , "VGMInfoFour" , "VGMinfoFive", "TaskAccpeted" , "Weighbridge" , "dualLoad" , "VGM1Cache" , "containerCache" , "FromForthPack", "fiveLoad" , "trippleLoad" , "fourLoad" ,"FromThirdPack" , "cacheStatusLocation" ,"FromFithPack", "VGM2Cache","TaskAccpeted"];
    cleanStorage(storageClean);

      NavigatePage("booking.html");

        break;

    case "In Process Trip Cancelled":

    //  send comment and do nothing /////  =====>

    if(JSON.parse(localStorage.getItem("fromComment"))) {
      localStorage.removeItem("fromComment");
      console.log("Comment Sent...");
      $("textarea").val("");
      $('body').removeClass('ui-loading');
      alert("Comment Sent");
      return;
    }

    //  send comment and do nothing /////  =====>

      $('#quitTrip').fadeOut(500)
      $('#bookingInProgessDiv').fadeOut(500);
      $('#resumeTaskDiv').fadeOut(500);
      var storageClean = ["taskAlreadyInProgress" , "status" , "homeButtonFired", "containerInfo" , "booking" , "VGMinfoTwo", "VGMInfoThree" , "VGMInfoFour" , "VGMinfoFive", "TaskAccpeted" , "Weighbridge" , "dualLoad" , "VGM1Cache" , "containerCache" , "FromForthPack", "fiveLoad" , "trippleLoad" , "fourLoad" ,"FromThirdPack" , "cacheStatusLocation" ,"FromFithPack", "VGM2Cache"];
      cleanStorage(storageClean);
      refreshBookings();

    break;

    case "Booking Accepted":

    //  send comment and do nothing /////  =====>

    if(JSON.parse(localStorage.getItem("fromComment"))) {
      localStorage.removeItem("fromComment");
      console.log("Comment Sent...");
      $("textarea").val("");
      $('body').removeClass('ui-loading');
      alert("Comment Sent");
      return;
    }

    //  send comment and do nothing /////  =====>

    var postData = {};

    var bookingAndId = JSON.parse(localStorage.getItem("bookingAndId"));
    postData.BookingReference = bookingAndId.Bookingreference
    postData.BookingReferenceId = bookingAndId.id;
    postData.DriverNumber = JSON.parse(localStorage.getItem("credentials")).driver_number_with_code;
    postData.Response = inAppState;
    postData.Status = "Booking Request";

      $.ajax({

          url: endpoint + "Capture",
          type: "POST",
          data: JSON.stringify(postData),
          dataType: "json",
          timeout: 30000,
          async:false,
          contentType: "application/json",
          success: handleTaskRequest,
          error: function (jqXHR, textStatus, errorThrown) {
            alert("No Coverage recieved , please try again");
      $('body').removeClass('ui-loading'); console.log(errorThrown);
            console.log(errorThrown); }

      });

    break;

    case "Booking Rejected":

    //  send comment and do nothing /////  =====>

    if(JSON.parse(localStorage.getItem("fromComment"))) {
      localStorage.removeItem("fromComment");
      console.log("Comment Sent...");
      $("textarea").val("");
      $('body').removeClass('ui-loading');
      alert("Comment Sent");
      return;
    }

    //  send comment and do nothing /////  =====>
    if (JSON.parse(localStorage.getItem("refreshBookings"))) {
            localStorage.setItem("refreshBookings",false);
            localStorage.removeItem("status");
    }
    else
      localStorage.setItem("TaskAccpeted",inAppState);

    $("#rejectTask").fadeOut(500);
    $("#acceptTask").fadeOut(500);
    localStorage.setItem("refreshBookings",true);
    NavigatePage("booking.html");

    break;

    }

debugger;
var headerStatus = document.getElementById("h3Status");
headerStatus.innerHTML = inAppState;

}

function successBooking(bookings) {
    debugger;
    console.log(bookings);
    localStorage.setItem("currentBookings", JSON.stringify(bookings.transportBookingData));

    $('body').removeClass('ui-loading');
}

function successRefresh(bookings)
{
  debugger;
  console.log(bookings);
  localStorage.setItem("currentBookings", JSON.stringify(bookings.transportBookingData));
  var bookings = localStorage.getItem("currentBookings");
  var bookingList = $("#bookingList");

  bookingList.html("");
  if (JSON.parse(bookings).length = 0) {
  for (var i = 0; i < bookings.length; i++) {
      bookingList.append("<li class='bookingList' id='" + bookings[i]["ID"] + "' value='" + bookings[i]["bookingRef"] + "'>" + bookings[i]["bookingRef"] + "</li><br>");
  }
}
  NavigatePage("booking.html");
  alert("Bookings Updated");
}

function handleTaskRequest(promise) {

  console.log(promise);

  if (localStorage.getItem("status") == "Booking Accepted") {

  localStorage.setItem("TaskAccpeted",inAppState);
  $("#rejectTask").fadeOut(500);
  $("#acceptTask").fadeOut(500);
  $("#enRouteToEmptyDepotDiv").fadeIn(1000);
  //$("#backToBooking").fadeOut(500);
  localStorage.removeItem("TaskAccpeted");

} else {

  localStorage.removeItem("status"); // is irrelavent since back in booking Screen;
  localStorage.removeItem("TaskAccpeted");

    }
}

function successContainertrack(promise){
debugger;

  console.log(promise);

  ///$('#containerSection input').prop('readonly', true);

  // handle button faders

  $("#containerSection").fadeOut(500);

    if (JSON.parse(localStorage.getItem("Weighbridge")) && JSON.parse(localStorage.getItem("dualLoad"))) // cater for both weigh bridge and dual load functionality
      $('#packDepotDiv').fadeIn(1500);
    // else if (JSON.parse(localStorage.getItem("Weighbridge"))) // cater for weigh Bridge functionality
    //   NavigatePage("weighBridge.html")
    else {
      if(wasItChached == false)
          $('#packDepotDiv').fadeIn(1500);
        }
    $('body').removeClass('ui-loading');
    var errorMgs = document.getElementById("errorMgs").innerHTML = "";
  // then after success promise set tare weightExlude

  debugger;
  var tareWeight = JSON.parse(localStorage.getItem("containerInfo"));
  $('#VGM').val(tareWeight.TareWeight);
  $('#temptale').val(tareWeight.Temptale);


 wasItChached = false; // reset cache state after success promise
}

function captureVGMDetails (object) {

  debugger;

      ajaxPostSend("Capture" , successVGM, true , JSON.stringify(object));
}

function successVGM (promise) {

      console.log(promise);

      var status  = localStorage.getItem("status");

      switch (status) {

        case "Arrived At Terminal":
              debugger;
              trackEventer("Container Offloaded", $("#containerOffLoadedDiv textarea").val());

        break;

        case "Arrived At Pack Depot":
          var dualLoad = JSON.parse(localStorage.getItem("dualLoad"));
          var VGMinfo = {};

          var includesTare = false;
            if ($("#tare option:selected").text() == "Yes")
              includesTare = true;
            else
              includesTare = false;

              VGMinfo.TareWeight = $("#VGM").val(),
              VGMinfo.VGM =  $('#resultExclude').val(),
              VGMinfo.CargoWeight = $('#resultInclude').val(),
              VGMinfo.Temptale = $('#temptale').val(),
              VGMinfo.weightExlude = $("#weightExlude").val(),
              VGMinfo.weightInclude = $("#weightInclude").val(),
              VGMinfo.IncludesTare = includesTare,
              VGMinfo.DriverNumber = JSON.parse(localStorage.getItem("credentials")).driver_number_with_code;

              var containerInfoToChange = JSON.parse(localStorage.getItem("containerInfo"));
              containerInfoToChange.TareWeight = $("#VGM").val();

              // reset container informatoin after handling

              localStorage.setItem("containerInfo",JSON.stringify(containerInfoToChange));

              // var packDepotDiv = document.getElementById('packDepotDiv');
              // packDepotDiv.style.display =  "block";

              $('#VGMSection #submit').fadeOut(500);

            // handle in state for scenarios of dual containers to be loaded and handle other stuff
            localStorage.setItem("VGMinfo",JSON.stringify(VGMinfo));

                if (dualLoad)
                  NavigatePage("packLoadTwo.html");
                else
                  NavigatePage("terminal.html");
        break;

        case "Arrived At Second Pack Depot":

        var VGMinfoTwo = {};

          VGMinfoTwo = JSON.parse(localStorage.getItem("tempVGMInfoTwo")) ;
          localStorage.removeItem("tempVGMInfoTwo");
          localStorage.setItem("VGMinfoTwo",JSON.stringify(VGMinfoTwo));

          var containerInfoToChange = JSON.parse(localStorage.getItem("containerInfo"));
          containerInfoToChange.TareWeight = $("#VGM").val();

          // reset container informatoin after handling

          localStorage.setItem("containerInfo",JSON.stringify(containerInfoToChange));


          $('#VGMSectionTwo #submit').fadeOut(500);

          // handle routes here
          if (JSON.parse(localStorage.getItem("trippleLoad")))
          NavigatePage("packLoadThree.html");
          else
          NavigatePage("terminal.html");
        break;

        case "Arrived At Third Pack Depot":

        var VGMinfoThree = {};

          VGMinfoThree = JSON.parse(localStorage.getItem("tempVGMInfoThree")) ;
          localStorage.removeItem("tempVGMInfoThree");
          localStorage.setItem("VGMinfoThree",JSON.stringify(VGMinfoThree));

          var containerInfoToChange = JSON.parse(localStorage.getItem("containerInfo"));
          containerInfoToChange.TareWeight = $("#VGM").val();

          // reset container informatoin after handling

          localStorage.setItem("containerInfo",JSON.stringify(containerInfoToChange));


          $('#VGMSectionThree #submit').fadeOut(500);

          // handle routes here
          if (JSON.parse(localStorage.getItem("fourLoad")))
          NavigatePage("packLoadFour.html");
          else
          NavigatePage("terminal.html");
        break;

        case "Arrived At Forth Pack Depot":

          var VGMinfoFour = {};

            VGMinfoFour = JSON.parse(localStorage.getItem("tempVGMInfoFour")) ;
            localStorage.removeItem("tempVGMInfoFour");
            localStorage.setItem("VGMinfoFour",JSON.stringify(VGMinfoFour));

            var containerInfoToChange = JSON.parse(localStorage.getItem("containerInfo"));
            containerInfoToChange.TareWeight = $("#VGM").val();

            // reset container informatoin after handling

            localStorage.setItem("containerInfo",JSON.stringify(containerInfoToChange));

            $('#VGMSectionFour #submit').fadeOut(500);

            // handle routes here
            if (JSON.parse(localStorage.getItem("fiveLoad")))
            NavigatePage("packLoadFive.html");
            else
            NavigatePage("terminal.html");
          break;

          case "Arrived At Fifth Pack Depot":

            var VGMinfoFive = {};

              VGMinfoFive = JSON.parse(localStorage.getItem("tempVGMInfoFive")) ;
              localStorage.removeItem("tempVGMInfoFive");
              localStorage.setItem("VGMinfoFive",JSON.stringify(VGMinfoFive));

              var containerInfoToChange = JSON.parse(localStorage.getItem("containerInfo"));
              containerInfoToChange.TareWeight = $("#VGM").val();

              // reset container informatoin after handling

              localStorage.setItem("containerInfo",JSON.stringify(containerInfoToChange));

              $('#VGMSectionFive #submit').fadeOut(500);

              // handle routes here
              NavigatePage("terminal.html");
            break;

        case "Arrived At Weighbridge":

        var VGMinfo = {};

        var includesTare = false;
          if ($("#tare option:selected").text() == "Yes")
            includesTare = true;
          else
            includesTare = false;

            VGMinfo.TareWeight = $("#VGM").val(),
            VGMinfo.VGM =  $('#resultExclude').val(),
            VGMinfo.CargoWeight = $('#resultInclude').val(),
            VGMinfo.Temptale = $('#temptale').val(),
            VGMinfo.weightExlude = $("#weightExlude").val(),
            VGMinfo.weightInclude = $("#weightInclude").val(),
            VGMinfo.IncludesTare = includesTare,
            VGMinfo.DriverNumber = JSON.parse(localStorage.getItem("credentials")).driver_number_with_code;

            var containerInfoToChange = JSON.parse(localStorage.getItem("containerInfo"));
            containerInfoToChange.TareWeight = $("#VGM").val();
            localStorage.setItem("containerInfo",JSON.stringify(containerInfoToChange));
            // reset containerInfo
            // var packDepotDiv = document.getElementById('packDepotDiv');
            // packDepotDiv.style.display =  "block";

            $('#VGMSection #submit').fadeOut(500);

          // handle in state for scenarios of dual containers to be loaded and handle other stuff
          localStorage.setItem("VGMinfo",JSON.stringify(VGMinfo));
          NavigatePage("terminal.html");

        break;

      }

      if (status == "Arrived At Terminal") {
        console.log("alert skipped");
      }
      else {
        var alert = document.getElementById("errorMgs");
        alert.innerHTML = "Successfully updated transport booking";
      }
      //$('#VGMSection input').prop('readonly', true);


      $('body').removeClass('ui-loading');

}

// -------------------------- CONTAINER VALIDATION STUFF -------------------------- //

function changeContainerColor(id)
{

  debugger;

  var containerOne = $("#containerNo").val().toUpperCase();
  var alert = document.getElementById("errorMgs");


  switch (id) {
    case "containerNo":
      if ($('#'+id).val() == "" || $('#'+id).val() == null) {

          alert.innerHTML = "Please Fill in a container number";
          alert.style.color = "red";
          return;
        }else
        {
          if (containerOne.length == 11) { // only validate when there length is 11
            var validConatainer = ISO6346Check(containerOne);
            alert.innerHTML = "";
          }
          else {
            alert.innerHTML = "Container Length must be 11 characters long";
            alert.style.color = "red";
            return;
          }
        }

        if (validConatainer)
        {
          alert.innerHTML = "Valid Container Number";
          alert.style.color = "green";
        }
        else
        {
          alert.innerHTML = containerOne + " is not a valid container number;";
          alert.style.color = "red";
          return;
        }
          break;
        case "sealNo":
        if ($('#'+id).val() == "" || $('#'+id).val() == null) {
          alert.innerHTML = "Please Fill in a seal number";
          alert.style.color = "red";
          return;
        }
          else  {
            alert.innerHTML = "Seal Number added";
            alert.style.color = "green";
          }
          break;

        case "tareWeight":

        if ($('#'+id).val() == "" || $('#'+id).val() == null || $('#'+id).val() == "0") {
          alert.innerHTML = "Please add container Tare weight";
          alert.style.color = "red";
          return;
        }
        else if ($('#'+id).val() < 0) {
          alert.innerHTML = "Tare weight cannot be less then 0";
          alert.style.color = "red";
          return;
        }
        else {
          alert.innerHTML = "Container Tare Weight added";
          alert.style.color = "green";
        }
          break;

          case "temperatureRecordingDevice":

          if ($('#'+id).val() == "" || $('#'+id).val() == null) {
            alert.innerHTML = "Please Add Temperature Recording";
            alert.style.color = "red";
            return;
          }
          else {
            alert.innerHTML = "Temperature Recording Device Added";
            alert.style.color = "green";
          }
            break;

    }
}

function containerRetype() {

  debugger;
  var containerOne = $("#containerNo").val().toUpperCase();
  var containerTwo = $("#containerNoAgain").val().toUpperCase();
  var alert = document.getElementById("errorMgs");

  if (containerOne == "" || undefined) {
    alert.innerHTML = "Please retype a container number";
    alert.style.color = "red";
    return;
  }
  if (containerTwo == containerOne) {

    alert.innerHTML = "Both Container Numbers Are The Same";
    alert.style.color = "green";
  }

  else {

    alert.innerHTML = containerOne + " and " + containerTwo + " are not the same";
    alert.style.color = "red";
    return;
  }

}

function addTare () {

}

function validateContainer(container) {
    debugger;
    endpoint = localStorage.getItem("endpoint");


    var containerNo = container.toUpperCase();
    var containerNoArray = containerNo.split("");
    var validated = false;
    var alert = document.getElementById("errorMgs");
    var retype = $("#containerNoAgain").val();
    var sealNo = $("#sealNo").val().toUpperCase();
    var bookingAndId = JSON.parse(localStorage.getItem("bookingAndId"));
    var status = localStorage.getItem("status");
    var deviceUUID = "";

    // validate containerNo
    if (containerNo == "") {
      alert.innerHTML = "Please Fill in Container Number..";
      alert.style.color = "red";
     return;
   }
   else
      alert.innerHTML = "";

    ISO6346Check(container);
    var validConatainer = ISO6346Check(container);

    console.log(validConatainer);

    // finish off validation

    if (validConatainer != false) {
        if (containerNo != retype.toUpperCase())
        {
            alert.innerHTML = containerNo + " and " + retype + " are not the same..";
            alert.style.color = "red";
            return;
        }
        else {
            // if error message present remove it
            alert.innerHTML = "";
            for (var i = 0; i < containerNoArray.length; i++) {
                if (i < 4) {
                    // validate characters ( alphas  )
                    if (isNaN(containerNoArray[i]) == true) {
                        console.log("Alpha valid")
                        console.log(isNaN(containerNoArray[i]));
                        alert.innerHTML = "";
                        validated = true;
                    }
                    else {
                          console.log("alpha not valid");
                          console.log(isNaN(containerNoArray[i]));
                          alert.innerHTML = containerNoArray[i] + " is not an alpha";
                          alert.style.color = "red";
                          validated = false;
                          return;
                        }
                }
                else {
                    // validate numbers ( alphas  )
                    if (isNaN(containerNoArray[i]) == false) {
                        console.log("number valid");
                        console.log(isNaN(containerNoArray[i]));
                        alert.innerHTML = "";
                        validated = true;
                    }
                    else {

                        console.log("number not valid valid");
                        console.log(isNaN(containerNoArray[i]));
                        alert.innerHTML = containerNoArray[i] + " is not a number";
                        alert.style.color = "red";
                        validated = false;
                        return;
                    }
                }
            }

            if (sealNo == "") {
                alert.innerHTML = "Please Fill in Seal No";
                alert.style.color = "red";
                return;
            }
            else
                alert.innerHTML = "";

            if ($("#tareWeight").val() == "" || $("#tareWeight").val() == undefined ||  $("#tareWeight").val() == "0")
            {
              alert.innerHTML = "Please Fill in tare weight";
              alert.style.color = "red";
              $('body').removeClass('ui-loading')
              return;
            }
            else if ($("#tareWeight").val() < 0)
              {
                alert.innerHTML = "Tare weight cannot be less then 0";
                alert.style.color = "red";
                $('body').removeClass('ui-loading')
                return;
              }
            else
                alert.innerHTML = "";

            if ($("#temperatureRecordingDevice").val() == "" || $("#temperatureRecordingDevice").val() == undefined) {
              alert.innerHTML = "Please fill in temperature recording device";
              alert.style.color = "red";
              $('body').removeClass('ui-loading')
              return;
            }

            else
                alert.innerHTML = "";

            alert.style.color = "green";
            alert.innerHTML = "Ready For Submission and next task :)";
            // for computer testing

            if (window.cordova.platformId == "browser")
              deviceUUID = "f3a62c91a1df6d1e";
            else
              deviceUUID = device.uuid;


            // create object to send to API
                var containerInfo =
                {
                  BookingReference : bookingAndId.Bookingreference,
                  BookingReferenceId: bookingAndId.id,
                  ContainerNo : containerNo,
                  SealNo : sealNo.toUpperCase(),
                  TareWeight : $("#tareWeight").val(),
                  UUID : deviceUUID,
                  Status : status,
                  Temptale : $('#temperatureRecordingDevice').val().toUpperCase(),
                  DriverNumber : JSON.parse(localStorage.getItem("credentials")).driver_number_with_code
                };

                console.log(containerInfo);

          // handle post request && store container information
          localStorage.setItem("containerInfo",JSON.stringify(containerInfo));
            $('body').addClass('ui-loading');
            ajaxPostSend("Capture" , successContainertrack , true , JSON.stringify(containerInfo));

        }
    }
    else
    {
      alert.innerHTML = containerNo + " is not a valid container number";
      alert.style.color = "red";
      return;
    }
}

function validateVGM (id) {

debugger;

var alert = document.getElementById("errorMgs");
var field;

switch (id) {

  case "VGM":

    field = $('#VGM').val();
    if ( field == "" || field == undefined) {

        alert.innerHTML = "Please fill in " + id;
        alert.style.color = "red";
        return;
    }else {
      if (field.length  > 6 ) {

        alert.innerHTML = "VGM must have a maximum of 6 numbers";
        alert.style.color = "red";

        return;

      } else if (field < 0 || field == 0) {

        alert.innerHTML = "Please capture a value greater than 0" ;
        alert.style.color = "red";
        return;
}

       else {

        alert.innerHTML = "Tare weight added";
        alert.style.color = "green";

        }

      }
      break;

  case "temptale":

    field = $('#temptale').val();
    if ( field == "" || field == undefined) {

        alert.innerHTML = "Please fill in " + id;
        alert.style.color = "red";
        return;

    } else {

      alert.innerHTML = id + " added";
      alert.style.color = "green";
    }
      break;

  case "weightExlude":

  field = $('#weightExlude').val();
  if ( field == "") {

      alert.innerHTML = "Please fill in weight excluding amount";
      alert.style.color = "red";
      return;

  } else if (field < 0 || field == 0) {

    alert.innerHTML = "Please capture a value greater than 0" ;
    alert.style.color = "red";
    return;

  }

  else {

    alert.innerHTML = "Weight excluding amount added";
    alert.style.color = "green";
  }
    break;

  case "weightInclude":

  field = $('#weightInclude').val();
  if ( field == "") {

      alert.innerHTML = "Please fill in weight including amount";
      alert.style.color = "red";
      return;

  } else if (field < 0 || field == 0) {

    alert.innerHTML = "Please capture a value greater than 0" ;
    alert.style.color = "red";
    return;

  }
 else {

    alert.innerHTML =  "Weight including amount added";
    alert.style.color = "green";
  }
    break;

    case "weightExludeTwo":

    field = $('#weightExludeTwo').val();
    if ( field == "") {

        alert.innerHTML = "Please fill in weight excluding amount";
        alert.style.color = "red";
        return;

    } else if (field < 0 || field == 0) {

      alert.innerHTML = "Please capture a value greater than 0" ;
      alert.style.color = "red";
      return;


    } else {

      alert.innerHTML = "Weight Excluding Added";
      alert.style.color = "green";
    }
      break;

    case "weightIncludeTwo":

    field = $('#weightIncludeTwo').val();
    if ( field == "") {

        alert.innerHTML = "Please fill in weight including amount";
        alert.style.color = "red";
        return;

    }else if (field < 0 || field == 0) {

      alert.innerHTML = "Please capture a value greater than 0" ;
      alert.style.color = "red";
      return;


    } else {

      alert.innerHTML =  "Weight Including Added";
      alert.style.color = "green";
    }
      break;
}


}

function repopulateContainerStorage () {

  // set the container details again

  var storedContainerInfo = JSON.parse(localStorage.getItem("containerInfo"));
  var alert = document.getElementById("errorMgs");

  // $('#containerSection input').prop('readonly', true);
  // $('#containerSection input').addClass('input-book');

  $("#containerNo").val(storedContainerInfo.ContainerNo);
  $("#containerNoAgain").val(storedContainerInfo.ContainerNo);
  $("#sealNo").val(storedContainerInfo.SealNo);
  $("#tareWeight").val(storedContainerInfo.TareWeight);
  $("#temperatureRecordingDevice").val(storedContainerInfo.Temptale);

  alert.style.color = "green";
  alert.innerHTML = "Ready For Submission and next task :)";


}

function reRenderVGMStorage () {
debugger;
  var VGMStorage = JSON.parse(localStorage.getItem("VGMinfo"));
  var currentStatus = localStorage.getItem("status");
  var divToShow;
  var divToHide;
  var alert = document.getElementById("errorMgs");
      //
      // headerStatus.innerHTML = currentStatus;
      // h3Status.innerHTML = currentStatus;

        divToShow = document.getElementById("containerSection");
        divToShow.style.display = "block";

        divHide = document.getElementById("VGMSection");

        divHide.style.display = "none";
        var storedContainerInfo = JSON.parse(localStorage.getItem("containerInfo"));

        divToShow.style.display = "none";
        divHide.style.display = "block";

      // $("#VGMSection input").prop('readonly', true);
      // $("#VGMSection input").addClass('input-book');

      $("#weightInclude").val(VGMStorage.weightInclude);
      $("#weightExlude").val(VGMStorage.weightExlude);
      $("#resultExclude").val(VGMStorage.VGM);
      $("#resultInclude").val(VGMStorage.CargoWeight);
      $("#temptale").val(VGMStorage.Temptale);
      // $("#tare")[0].checked = (VGMStorage.IncludesTare);

      $("#VGM").val(storedContainerInfo.TareWeight);

      $("#VGMSection #submit").css("display","block");
      $("#packDepotDiv").css("display","none");


      localStorage.removeItem("fromTerminal");
}
// calculation functions ||

function calcExclude() {

    var $num1 = ($.trim($("#weightExlude").val()) != "" && !isNaN($("#weightExlude").val())) ? parseFloat($("#weightExlude").val()) : 0;
    console.log($num1);
    var $num2 = ($.trim($("#VGM").val()) != "" && !isNaN($("#VGM").val())) ? parseFloat($("#VGM").val()) : 0;
    console.log($num2);

    $("#resultInclude").val($num1);
    $("#resultExclude").val($num2 + $num1);
    $("#weightInclude").val($num2 + $num1);

  console.log($("#resultExclude").val($num2 + $num1));

    // second tier weights

    var $num1 = ($.trim($("#weightExludeTwo").val()) != "" && !isNaN($("#weightExludeTwo").val())) ? parseFloat($("#weightExludeTwo").val()) : 0;
    var $num2 = ($.trim($("#VGM").val()) != "" && !isNaN($("#VGM").val())) ? parseFloat($("#VGM").val()) : 0;
    var $num3 = ($.trim($("#weightExludeTwoPack1").val()) != "" && !isNaN($("#weightExludeTwoPack1").val())) ? parseFloat($("#weightExludeTwoPack1").val()) : 0;


    $("#resultIncludeTwo").val($num1+$num3);
    $("#weightIncludeTwo").val($num2 +$num3+$num1);
    console.log($("#resultExcludeTwo").val($num2 + $num1 + $num3));

    // third tier weights

    var $num1 = ($.trim($("#weightExludeThree").val()) != "" && !isNaN($("#weightExludeThree").val())) ? parseFloat($("#weightExludeThree").val()) : 0;
    var $num2 = ($.trim($("#VGM").val()) != "" && !isNaN($("#VGM").val())) ? parseFloat($("#VGM").val()) : 0;
    var $num3 = ($.trim($("#weightExludeThreePack1").val()) != "" && !isNaN($("#weightExludeThreePack1").val())) ? parseFloat($("#weightExludeThreePack1").val()) : 0;
    var $num4 = ($.trim($("#weightExludeThreePack2").val()) != "" && !isNaN($("#weightExludeThreePack2").val())) ? parseFloat($("#weightExludeThreePack2").val()) : 0;

    $("#resultIncludeThree").val($num1+$num4);
    $("#weightIncludeThree").val($num2 + $num1  + $num4);
    console.log($("#resultExcludeThree").val($num2 + $num1 + $num4));

    // fourth tier weights

    var $num1 = ($.trim($("#weightExludeFour").val()) != "" && !isNaN($("#weightExludeFour").val())) ? parseFloat($("#weightExludeFour").val()) : 0;
    var $num2 = ($.trim($("#VGM").val()) != "" && !isNaN($("#VGM").val())) ? parseFloat($("#VGM").val()) : 0;
    var $num3 = ($.trim($("#weightExludeFourPack1").val()) != "" && !isNaN($("#weightExludeFourPack1").val())) ? parseFloat($("#weightExludeFourPack1").val()) : 0;
    var $num4 = ($.trim($("#weightExludeFourPack2").val()) != "" && !isNaN($("#weightExludeFourPack2").val())) ? parseFloat($("#weightExludeFourPack2").val()) : 0;
    var $num5 = ($.trim($("#weightExludeFourPack3").val()) != "" && !isNaN($("#weightExludeFourPack3").val())) ? parseFloat($("#weightExludeFourPack3").val()) : 0;

    $("#resultIncludeFour").val($num1);
    $("#weightIncludeFour").val($num2 + $num1 +$num3 + $num4 + $num5);
    console.log($("#resultExcludeFour").val($num2 + $num1 + $num3 + $num4 + $num5));

    // fifth tier weights

    var $num1 = ($.trim($("#weightExludeFive").val()) != "" && !isNaN($("#weightExludeFive").val())) ? parseFloat($("#weightExludeFive").val()) : 0;
    var $num2 = ($.trim($("#VGM").val()) != "" && !isNaN($("#VGM").val())) ? parseFloat($("#VGM").val()) : 0;
    var $num3 = ($.trim($("#weightExludeFivePack1").val()) != "" && !isNaN($("#weightExludeFivePack1").val())) ? parseFloat($("#weightExludeFivePack1").val()) : 0;
    var $num4 = ($.trim($("#weightExludeFivePack2").val()) != "" && !isNaN($("#weightExludeFivePack2").val())) ? parseFloat($("#weightExludeFivePack2").val()) : 0;
    var $num5 = ($.trim($("#weightExludeFivePack3").val()) != "" && !isNaN($("#weightExludeFivePack3").val())) ? parseFloat($("#weightExludeFivePack3").val()) : 0;
    var $num6 = ($.trim($("#weightExludeFivePack3").val()) != "" && !isNaN($("#weightExludeFivePack3").val())) ? parseFloat($("#weightExludeFivePack3").val()) : 0;

    $("#resultIncludeFive").val($num1);
    $("#weightIncludeFive").val($num2 + $num1 +$num3 + $num4 + $num5 +$num6);
    console.log($("#resultExcludeFive").val($num2 + $num1 + $num3 + $num4 + $num5 +$num6));


}

function calcInclude () {

  var $num1 = ($.trim($("#weightInclude").val()) != "" && !isNaN($("#weightInclude").val())) ? parseFloat($("#weightInclude").val()) : 0;
  console.log($num1);
  var $num2 = ($.trim($("#VGM").val()) != "" && !isNaN($("#VGM").val())) ? parseFloat($("#VGM").val()) : 0;
  console.log($num2);
  //
  $("#resultInclude").val($num1-$num2);
  $("#weightExlude").val($num1-$num2);
  $("#resultExclude").val($num1);
  //
   var alert = document.getElementById("errorMgs");
      if ($("#resultInclude").val() < 0 ||   $("#weightExlude").val() < 0) {

          alert.innerHTML = "Weight cannot be negative";
          alert.style.color = "red";
      console.log("cannot be negative");
      $("#resultInclude").val(0);
      $("#weightExlude").val(0);
    }
    else
       alert.innerHTML = "";

    // second tier weights

    var $num1 = ($.trim($("#weightIncludeTwo").val()) != "" && !isNaN($("#weightIncludeTwo").val())) ? parseFloat($("#weightIncludeTwo").val()) : 0;
    console.log($num1);
    var $num2 = ($.trim($("#VGM").val()) != "" && !isNaN($("#VGM").val())) ? parseFloat($("#VGM").val()) : 0;
    var $num3 = ($.trim($("#weightIncludeTwoPack1").val()) != "" && !isNaN($("#weightIncludeTwoPack1").val())) ? parseFloat($("#weightIncludeTwoPack1").val()) : 0;

    console.log($num2);
    // $("#weightExludeTwo").val($num1 - $num3 - $num2);
    $("#resultIncludeTwo").val($num1 - $num2);
    $("#weightExludeTwo").val($num1 - $num3);
    $("#resultExcludeTwo").val($num1);

        if ($("#resultIncludeTwo").val() < 0 || $("#weightExludeTwo").val() < 0 )  {
        console.log("cannot be negative");
        $("#resultIncludeTwo").val(0);
         $("#weightExludeTwo").val(0);
      }

    // third tier weights

    var $num1 = ($.trim($("#weightIncludeThree").val()) != "" && !isNaN($("#weightIncludeThree").val())) ? parseFloat($("#weightIncludeThree").val()) : 0;
    console.log($num1);
    var $num2 = ($.trim($("#VGM").val()) != "" && !isNaN($("#VGM").val())) ? parseFloat($("#VGM").val()) : 0;
    var $num3 = ($.trim($("#weightIncludeThreePack1").val()) != "" && !isNaN($("#weightIncludeThreePack1").val())) ? parseFloat($("#weightIncludeThreePack1").val()) : 0;
    var $num4 = ($.trim($("#weightIncludeThreePack2").val()) != "" && !isNaN($("#weightIncludeThreePack2").val())) ? parseFloat($("#weightIncludeThreePack2").val()) : 0;

    console.log($num2);
    // $("#weightExludeThree").val($num1 - $num3 - $num2);
    $("#resultIncludeThree").val($num1 - $num2);
    $("#weightExludeThree").val($num1 - $num4);
    $("#resultExcludeThree").val($num1);

        if ($("#resultIncludeThree").val() < 0 || $("#weightExludeThree").val() < 0 )  {
        console.log("cannot be negative");
        $("#resultIncludeThree").val(0);
        $("#weightExludeThree").val(0);
      }

      // forth tier weights

      var $num1 = ($.trim($("#weightIncludeFour").val()) != "" && !isNaN($("#weightIncludeFour").val())) ? parseFloat($("#weightIncludeFour").val()) : 0;
      console.log($num1);
      var $num2 = ($.trim($("#VGM").val()) != "" && !isNaN($("#VGM").val())) ? parseFloat($("#VGM").val()) : 0;
      var $num3 = ($.trim($("#weightIncludeFourPack1").val()) != "" && !isNaN($("#weightIncludeFourPack1").val())) ? parseFloat($("#weightIncludeFourPack1").val()) : 0;
      var $num4 = ($.trim($("#weightIncludeFourPack2").val()) != "" && !isNaN($("#weightIncludeFourPack2").val())) ? parseFloat($("#weightIncludeFourPack2").val()) : 0;
      var $num5 = ($.trim($("#weightIncludeFourPack3").val()) != "" && !isNaN($("#weightIncludeFourPack3").val())) ? parseFloat($("#weightIncludeFourPack3").val()) : 0;

      console.log($num2);
      // $("#weightExludeFour").val($num1 - $num3 - $num2);
      $("#resultIncludeFour").val($num1 - $num2);
    //  $("#weightExludeFour").val($num1 - $num3 - $num2 - $num4 - $num5); -- work on
      $("#resultExcludeFour").val($num1);

          if ($("#resultIncludeFour").val() < 0 || $("#weightExludeFour").val() < 0 )  {
          console.log("cannot be negative");
          $("#resultIncludeFour").val(0);
          $("#weightExludeFour").val(0);
        }

        // Five tier weights

        var $num1 = ($.trim($("#weightIncludeFive").val()) != "" && !isNaN($("#weightIncludeFive").val())) ? parseFloat($("#weightIncludeFive").val()) : 0;
        console.log($num1);
        var $num2 = ($.trim($("#VGM").val()) != "" && !isNaN($("#VGM").val())) ? parseFloat($("#VGM").val()) : 0;
        var $num3 = ($.trim($("#weightIncludeFivePack1").val()) != "" && !isNaN($("#weightIncludeFivePack1").val())) ? parseFloat($("#weightIncludeFivePack1").val()) : 0;
        var $num4 = ($.trim($("#weightIncludeFivePack2").val()) != "" && !isNaN($("#weightIncludeFivePack2").val())) ? parseFloat($("#weightIncludeFivePack2").val()) : 0;
        var $num5 = ($.trim($("#weightIncludeFivePack3").val()) != "" && !isNaN($("#weightIncludeFivePack3").val())) ? parseFloat($("#weightIncludeFivePack3").val()) : 0;
        var $num6 = ($.trim($("#weightIncludeFivePack4").val()) != "" && !isNaN($("#weightIncludeFivePack4").val())) ? parseFloat($("#weightIncludeFivePack4").val()) : 0;

        console.log($num2);
        // $("#weightExludeFive").val($num1 - $num3 - $num2);
        $("#resultIncludeFive").val($num1 - $num3 - $num2 - $num4 - $num5 - $num6);
        $("#weightExludeFive").val($num1 - $num3 - $num2 - $num4 - $num5 - $num6);
        $("#resultExcludeFive").val($num1);

            if ($("#resultIncludeFive").val() < 0 || $("#weightExludeFive").val() < 0 )  {
            console.log("cannot be negative");
            $("#resultIncludeFive").val(0);
            $("#weightExludeFive").val(0);
          }
}

// instances

$(document).on("pageinit", "#index", function () {
//getLocation(); // force fire / intialize coordinates
console.log("pageinit");
// define endpoint
debugger;

if(local)
  endpoint = "http://localhost:51155/api/";
else
  endpoint = 'http://goroadapis20170825122713.azurewebsites.net/api/';
  localStorage.setItem("endpoint",endpoint)
});

// $(document).on("pagebeforeshow","#index",function(){
//
//
// });
//
// $(document).on("pageshow", "#index", function () {
// debugger;
//
// });



$(document).on("pageinit", "#login", function () {
debugger;

console.log("push registration block hit");



          localStorage.getItem("endpoint");

          // if already logged in navigate to bookings page

          var loggedIn = localStorage.getItem("credentials");
          var taskAlreadyInProgress = localStorage.getItem("taskAlreadyInProgress");
          var homeButtonFired = JSON.parse(localStorage.getItem("homeButtonFired"));
          var status = localStorage.getItem("status");
          debugger;

          if (loggedIn != null)
          {
            $("#login").css('display', 'none');
          if (homeButtonFired){
              NavigatePage('booking.html');
          } else {
              if (JSON.parse(taskAlreadyInProgress))
              { // ====================== APP ROUTES / NAVIGATION FROM OUT OF APP STATE =============== //
                switch (status) {

                  case "En Route To Empty Depot":

                  $('#backToBooking').fadeOut(500);
                  NavigatePage("transportBooking.html");
                  console.log(status);

                    break;

                  case "Arrived At Empty Depot":

                  // if (JSON.parse(localStorage.getItem("Weighbridge")) && JSON.parse(localStorage.getItem("containerInfo")) != null) // cater for weigh Bridge functionality
                  //   NavigatePage("views/weighBridge.html");
                  // else
                    NavigatePage('captureBookings.html');

                  break;

                  case "En Route To Weighbridge":
                      NavigatePage('weighBridge.html');

                  break;

                  case "Arrived At Weighbridge":

                  if (JSON.parse(localStorage.getItem("VGMinfo")) == null )
                    NavigatePage('captureBookings.html');
                  else
                    NavigatePage("terminal.html");

                  break;

                  case "En Route to Pack Depot":
                    NavigatePage('captureBookings.html');

                    break;

                  case "Arrived At Pack Depot":

                    if (JSON.parse(localStorage.getItem("dualLoad")) && JSON.parse(localStorage.getItem("Weighbridge")))
                        NavigatePage("packLoadTwo.html")
                    else if (JSON.parse(localStorage.getItem("Weighbridge")))
                        NavigatePage("weighBridge.html") //
                    else  if (JSON.parse(localStorage.getItem("VGMinfo")) == null)
                        NavigatePage('captureBookings.html');
                    else if (JSON.parse(localStorage.getItem("dualLoad")))
                        NavigatePage("packLoadTwo.html");
                    else
                        NavigatePage("terminal.html"); // because event storage has aleady been fired
                  break;

                  case "En Route To Second Pack Depot":
                      NavigatePage("packLoadTwo.html");
                  break;

                  case "Arrived At Second Pack Depot":
                  if (JSON.parse(localStorage.getItem("trippleLoad")) && JSON.parse(localStorage.getItem("Weighbridge"))) {
                      NavigatePage("packLoadThree.html"); // handle tripple and weighBridge functionality
                  }
                  else if (JSON.parse(localStorage.getItem("dualLoad")) && JSON.parse(localStorage.getItem("Weighbridge"))) {
                      NavigatePage("weighBridge.html"); // handle dualload and weighBridge functionality
                  }
                  else if (JSON.parse(localStorage.getItem("VGMinfoTwo")) == null)
                      NavigatePage("packLoadTwo.html");
                  else if (JSON.parse(localStorage.getItem("trippleLoad")))
                      NavigatePage("packLoadThree.html");
                      else
                        NavigatePage("terminal.html");
                  break;

                  case "En Route To Third Pack Depot":
                        NavigatePage("packLoadThree.html");
                    break

                  case "Arrived At Third Pack Depot":
                  if (JSON.parse(localStorage.getItem("fourLoad")))
                  {
                      NavigatePage("packLoadFour.html");
                  }
                  else if (JSON.parse(localStorage.getItem("trippleLoad")) && JSON.parse(localStorage.getItem("Weighbridge"))) {
                      NavigatePage("weighBridge.html"); // handle dualload and weighBridge functionality
                  }
                  else if (JSON.parse(localStorage.getItem("VGMinfoThree")) == null)
                      NavigatePage("packLoadThree.html");
                      else
                      NavigatePage("terminal.html");
                    break

                    case "En Route To Forth Pack Depot":
                          NavigatePage("packLoadFour.html");
                    break

                    case "Arrived At Forth Pack Depot":
                      if (JSON.parse(localStorage.getItem("fiveLoad")))
                      {
                          NavigatePage("packLoadFive.html");
                      }
                      else if (JSON.parse(localStorage.getItem("fourLoad")) && JSON.parse(localStorage.getItem("Weighbridge"))) {
                          NavigatePage("weighBridge.html"); // handle dualload and weighBridge functionality
                      }
                      else if (JSON.parse(localStorage.getItem("VGMinfoFour")) == null)
                          NavigatePage("packLoadFour.html");
                          else
                          NavigatePage("terminal.html");
                      break

                   case "En Route To Fifth Pack Depot":
                        NavigatePage("packLoadFive.html");
                   break;

                   case "Arrived At Fifth Pack Depot":

                   if (JSON.parse(localStorage.getItem("fourLoad")) && JSON.parse(localStorage.getItem("Weighbridge"))) {
                         NavigatePage("weighBridge.html"); // handle dualload and weighBridge functionality
                     }
                     else if (JSON.parse(localStorage.getItem("VGMinfoFive")) == null)
                         NavigatePage("packLoadFive.html");
                         else
                         NavigatePage("terminal.html");
                     break


                   case "En Route To Terminal":
                      NavigatePage('terminal.html');
                      break;

                  case "Arrived At Terminal":
                          NavigatePage('terminal.html');
                          break;

                }

              }
              else if (status == "Booking Accepted")
                  NavigatePage('transportBooking.html');
              else
                NavigatePage('booking.html');
            }
          }

});



$(document).on("pageshow", "#login", function () {
debugger;
console.log("pageshow login hit ?");
// $("#loginNow").click(function(){
//   login();
//   console.log("login");
// });
// $("#goIn").bind('click',function(){
//   login();
//   console.log("login");
// });
$("#signIn").click(function(){
  debugger;
  login();
  console.log("login");
});


// if (JSON.parse(localStorage.getItem("auth")) == null) {
//   login();
//   console.log("reauth")
// }

// re-auth
debugger;
if (window.cordova.platformId != "browser") // annoying inconsistent error
  if (device.platform == "Android") // on a basis that we are Primarily working with Android
      registerForPushNotifications();
      debugger;

});

// $(document).on("pagecreate", "#booking", function() {
//
//
//
// });


$(document).on("pageinit", "#booking", function () {

  debugger;

    if (localStorage.getItem("TaskAccpeted")!= null) { // if a job task has been set get hit endpoint

    var postData = {};

    var bookingAndId = JSON.parse(localStorage.getItem("bookingAndId"));

    postData.BookingReference = bookingAndId.Bookingreference;
    postData.BookingReferenceId = bookingAndId.id;
    postData.DriverNumber = JSON.parse(localStorage.getItem("credentials")).driver_number_with_code;
    postData.Response = inAppState;
    postData.Status = "Booking Request";



      $.ajax({

          url: endpoint + "Capture",
          type: "POST",
          data: JSON.stringify(postData),
          dataType: "json",
          timeout: 30000,
          async:false,
          contentType: "application/json",
          success: handleTaskRequest,
          error: function (jqXHR, textStatus, errorThrown) {
            alert("There is a technical problem please try again later..");
      $('body').removeClass('ui-loading');
      console.log(errorThrown);
            console.log(errorThrown); }

      });

    }

  // if (window.cordova.platformId != "browser") // annoying inconsistent error
  //  if (device.platform == "Android") // on a basis that we are Primarily working with Android
  //     registerForPushNotifications();
  //var watchID = navigator.geolocation.watchPosition(successFireLocation , errorFireLocation ,{ timeout: 300000 , maximumAge: 300000 });
  endpoint = localStorage.getItem("endpoint");
  debugger;

  var driverNameObj = JSON.parse(localStorage.getItem("credentials"));

  var driverName = document.getElementById('driverName');
  var number = document.getElementById('number');
  var mzansi = document.getElementById('mzansi');
  var namibia = document.getElementById('namibia');
  var fullDriverNumber;
  driverName.innerHTML = driverNameObj.driverName;
  // set country code

  if (driverNameObj.country == "South Africa")
  {
    number.innerHTML = "+27 " + driverNameObj.number;
    mzansi.style.display = "block";
    namibia.style.display = "none"; // incase re-displays for some weird reason
    fullDriverNumber ="+27" + driverNameObj.number;
  }
  else
  {
    number.innerHTML = "+264 "+ driverNameObj.number;
    mzansi.style.display = "none";
    namibia.style.display = "block"; // incase re-displays for some weird reason
    fullDriverNumber ="+264" + driverNameObj.number;
  }
  // debugger;


  // get current booking tasks  for specific driver
  var driverData = JSON.parse(localStorage.getItem("credentials"));
  driverData.DriverNumber = fullDriverNumber;


  // reset section based on app state
  if (JSON.parse(localStorage.getItem("currentBookings")) == null || JSON.parse(localStorage.getItem("refreshBookings")) == true) {
    localStorage.setItem("refreshBookings",false);

  $.ajax({

      url: endpoint + "Booking",
      type: "POST",
      data: JSON.stringify(driverData),
      dataType: "json",
      timeout: 30000,
      async:false,
      contentType: "application/json",
      success: successBooking,
      error: function (jqXHR, textStatus, errorThrown) {
        alert("There is a technical problem please try again later..");
  $('body').removeClass('ui-loading'); console.log(errorThrown);
        console.log(errorThrown); }
  })

}

});

$(document).on("pagebeforeshow", "#booking" ,function(){

debugger;
var homeButtonFired  = JSON.parse(localStorage.getItem("homeButtonFired"));
if( homeButtonFired == false || homeButtonFired == null) {
  var divToShow = localStorage.getItem("status");
  if (divToShow != null)
  {
    if (divToShow == "En Route To Pack House")
          NavigatePage("transportBooking.html");
    else if (divToShow == "Booking Accepted") { // coming back to bookings page

          localStorage.removeItem("status"); // make sure storage has been removed
          NavigatePage("booking.html");

    }
    else
          NavigatePage("captureBookings.html");
  }
}

});

$(document).on("pageshow", "#booking", function () {

    debugger;
        localStorage.removeItem("pushNotifier");
    // if booking is already in progress skip this lot
    var divToShow = localStorage.getItem("status");
    var homeButtonFired  = JSON.parse(localStorage.getItem("homeButtonFired"));
    if (divToShow == null || divToShow == false || homeButtonFired == true)
    {
      var bookingNumber = document.getElementById('bookingNumber');
      var bookingsObj = JSON.parse(localStorage.getItem("currentBookings"));
      var recentBooking = localStorage.getItem("newBooking");
      var terminal_description = document.getElementById('terminal_description');
      var container_type = document.getElementById('container_type');
      var bookings = bookingsObj;
      var bookingList = $('#bookingList');
      var recentBookingAlreadySet = false;

      if (bookings.length == 0 || bookings == null) {
          bookingNumber.innerHTML = "No Bookings";
      }
      else
      {
        if (recentBooking == null) // if a recent booking exists
          bookingNumber.innerHTML = bookings.length;
        else
          bookingNumber.innerHTML = bookings.length + 1;

          bookingList.html("");
          for (var i = 0; i < bookings.length; i++) {
              bookingList.append("<li class='bookingList' id='" + bookings[i]["ID"] + "' value='" + bookings[i]["bookingRef"] + "'>" + bookings[i]["bookingRef"] + "</li><br>");
          }
      }

      // check to see if there is a new booking
      if (recentBooking != null)
      {
        var newBooking = JSON.parse(recentBooking);
        bookingList.append("<li class='bookingList' value='" + newBooking.BReference + "'>" + newBooking.BReference +"</li>");
      }
      $('#continueTask').click(function () {
debugger;
var homeButtonFired  = JSON.parse(localStorage.getItem("homeButtonFired")); // recheck storage
          // get reference
          if (homeButtonFired)
          {
            debugger; // if selected reference matches current task

              switch (divToShow) {

                case "Arrived At Empty Depot":
                  if (JSON.parse(localStorage.getItem("Weighbridge")) && JSON.parse(localStorage.getItem("containerInfo"))!= null ) {
                    if(JSON.parse(localStorage.getItem("Weighbridge")) && JSON.parse(localStorage.getItem("dualLoad")))
                        NavigatePage("captureBookings.html");
                      else
                        NavigatePage("weighBridge.html");
                  }else
                  NavigatePage("captureBookings.html");
                  break;

                case "En Route to Pack Depot":
                  if (JSON.parse(localStorage.getItem("VGMinfo"))) // if event has already been fired navigate
                  NavigatePage("terminal.html");
                  else
                  NavigatePage("captureBookings.html");

                  break;

                case "Arrived At Pack Depot":

                if (JSON.parse(localStorage.getItem("dualLoad")) && JSON.parse(localStorage.getItem("Weighbridge"))) {
                      // handle dual load functionality
                      NavigatePage("packLoadTwo.html") // ?
                  }
                  else if (JSON.parse(localStorage.getItem("dualLoad"))) {

                    if (JSON.parse(localStorage.getItem("VGMinfo")) == null)
                      NavigatePage("captureBookings.html");
                    else if (JSON.parse(localStorage.getItem("VGMinfo")) && JSON.parse(localStorage.getItem("VGMinfoTwo")))
                      NavigatePage("terminal.html");
                    else
                      NavigatePage("packLoadTwo.html") //
                  }
                  else if (JSON.parse(localStorage.getItem("Weighbridge")))
                    NavigatePage("weighBridge.html");
                  else if (JSON.parse(localStorage.getItem("VGMinfo"))) // if event has already been fired navigate
                    NavigatePage("terminal.html");
                  else
                    NavigatePage("captureBookings.html");

                break;

                // conditional events

                case "En Route To Second Pack Depot":
                   NavigatePage("packLoadTwo.html");
                break;

                case "Arrived At Second Pack Depot":
                    if (JSON.parse(localStorage.getItem("trippleLoad")))
                    {
                      if (JSON.parse(localStorage.getItem("VGMinfoTwo")) == null)
                        NavigatePage("packLoadTwo.html");
                      else if (JSON.parse(localStorage.getItem("VGMinfoTwo")) && JSON.parse(localStorage.getItem("VGMinfoThree")))
                        NavigatePage("terminal.html");
                      else
                        NavigatePage("packLoadThree.html") //
                    }
                    else if (JSON.parse(localStorage.getItem("dualLoad")) && JSON.parse(localStorage.getItem("Weighbridge"))) {
                    NavigatePage("weighBridge.html");
                    }
                    else
                    NavigatePage("packLoadTwo.html");
                break;

                case "En Route To Third Pack Depot":
                   NavigatePage("packLoadThree.html");
                break;

                case "Arrived At Third Pack Depot":
                if (JSON.parse(localStorage.getItem("fourLoad")))
                {
                  if (JSON.parse(localStorage.getItem("VGMinfoThree")) == null)
                    NavigatePage("packLoadThree.html");
                  else if (JSON.parse(localStorage.getItem("VGMinfoThree")))
                    NavigatePage("terminal.html");
                  else
                    NavigatePage("packLoadFour.html") //
                }
                else if (JSON.parse(localStorage.getItem("trippleLoad")) && JSON.parse(localStorage.getItem("Weighbridge"))) {
                    NavigatePage("weighBridge.html");
                    }
                    else
                    NavigatePage("packLoadThree.html");
                break;

                case "En Route To Forth Pack Depot":
                   NavigatePage("packLoadFour.html");
                break;

                case "Arrived At Forth Pack Depot":
                if (JSON.parse(localStorage.getItem("fiveload")))
                {
                  if (JSON.parse(localStorage.getItem("VGMinfoFour")) == null)
                    NavigatePage("packLoadFour.html");
                  else if (JSON.parse(localStorage.getItem("VGMinfoFour")))
                    NavigatePage("terminal.html");
                  else
                    NavigatePage("packLoadFive.html") //
                }
                else if (JSON.parse(localStorage.getItem("fourLoad")) && JSON.parse(localStorage.getItem("Weighbridge"))) {
                    NavigatePage("weighBridge.html");
                    }
                    else
                    NavigatePage("packLoadFour.html");
                break;

                case "En Route To Fifth Pack Depot":
                   NavigatePage("packLoadFive.html");
                break;

                case "Arrived At Fifth Pack Depot":
                    if (JSON.parse(localStorage.getItem("fiveLoad")) && JSON.parse(localStorage.getItem("Weighbridge"))) {
                    NavigatePage("weighBridge.html");
                    }
                    else
                    NavigatePage("packLoadFive.html");
                break;

                    // conditional events end

                case "En Route To Empty Depot":

                break;

                case "En Route To Weighbridge":
                    NavigatePage("weighBridge.html");
                break;

                case "Arrived At Weighbridge":
                  if (JSON.parse(localStorage.getItem("VGMinfo")) != null)
                    NavigatePage("terminal.html");
                  else
                    NavigatePage("captureBookings.html");

                break;

                case "En Route To Terminal":
                  NavigatePage("terminal.html");
                break;

                case "Arrived At Terminal":
                  NavigatePage("terminal.html");
                break

                case "Container Offloaded":
                  NavigatePage("terminal.html");
                break
              }

              localStorage.removeItem("homeButtonFired");



          } else {

            var referenceToUse = this.innerHTML;
            var bookingReferenceID = this.id;

            var bookingAndId = {};

                bookingAndId.id = bookingReferenceID;
                bookingAndId.Bookingreference = referenceToUse;

            console.log(bookingAndId);
            localStorage.setItem("bookingAndId",JSON.stringify(bookingAndId));
            localStorage.setItem("booking", referenceToUse);

            NavigatePage("transportBooking.html");
          }

        })
      $('li').click(function () {
debugger;
var homeButtonFired  = JSON.parse(localStorage.getItem("homeButtonFired")); // recheck storage
          // get reference
          if (homeButtonFired)
          {
            debugger;
            var veryCurrentBooking = JSON.parse(localStorage.getItem("bookingAndId"));
            if(veryCurrentBooking.Bookingreference == this.innerHTML && this.id == veryCurrentBooking.id) { // if selected reference matches current task

              switch (divToShow) {

                case "Arrived At Empty Depot":
                  if (JSON.parse(localStorage.getItem("Weighbridge")) && JSON.parse(localStorage.getItem("containerInfo"))!= null ) {
                    if(JSON.parse(localStorage.getItem("Weighbridge")) && JSON.parse(localStorage.getItem("dualLoad")))
                        NavigatePage("captureBookings.html");
                      else
                        NavigatePage("weighBridge.html");
                  }else
                  NavigatePage("captureBookings.html");
                  break;

                case "En Route to Pack Depot":
                  if (JSON.parse(localStorage.getItem("VGMinfo"))) // if event has already been fired navigate
                  NavigatePage("terminal.html");
                  else
                  NavigatePage("captureBookings.html");

                  break;

                case "Arrived At Pack Depot":

                if (JSON.parse(localStorage.getItem("dualLoad")) && JSON.parse(localStorage.getItem("Weighbridge"))) {
                      // handle dual load functionality
                      NavigatePage("packLoadTwo.html") // ?
                  }
                  else if (JSON.parse(localStorage.getItem("dualLoad"))) {

                    if (JSON.parse(localStorage.getItem("VGMinfo")) == null)
                      NavigatePage("captureBookings.html");
                    else if (JSON.parse(localStorage.getItem("VGMinfo")) && JSON.parse(localStorage.getItem("VGMinfoTwo")))
                      NavigatePage("terminal.html");
                    else
                      NavigatePage("packLoadTwo.html") //
                  }
                  else if (JSON.parse(localStorage.getItem("Weighbridge")))
                    NavigatePage("weighBridge.html");
                  else if (JSON.parse(localStorage.getItem("VGMinfo"))) // if event has already been fired navigate
                    NavigatePage("terminal.html");
                  else
                    NavigatePage("captureBookings.html");

                break;

                // conditional events

                case "En Route To Second Pack Depot":
                   NavigatePage("packLoadTwo.html");
                break;

                case "Arrived At Second Pack Depot":
                    if (JSON.parse(localStorage.getItem("trippleLoad")))
                    {
                      if (JSON.parse(localStorage.getItem("VGMinfoTwo")) == null)
                        NavigatePage("packLoadTwo.html");
                      else if (JSON.parse(localStorage.getItem("VGMinfoTwo")) && JSON.parse(localStorage.getItem("VGMinfoThree")))
                        NavigatePage("terminal.html");
                      else
                        NavigatePage("packLoadThree.html") //
                    }
                    else if (JSON.parse(localStorage.getItem("dualLoad")) && JSON.parse(localStorage.getItem("Weighbridge"))) {
                    NavigatePage("weighBridge.html");
                    }
                    else
                    NavigatePage("packLoadTwo.html");
                break;

                case "En Route To Third Pack Depot":
                   NavigatePage("packLoadThree.html");
                break;

                case "Arrived At Third Pack Depot":
                if (JSON.parse(localStorage.getItem("fourLoad")))
                {
                  if (JSON.parse(localStorage.getItem("VGMinfoThree")) == null)
                    NavigatePage("packLoadThree.html");
                  else if (JSON.parse(localStorage.getItem("VGMinfoThree")))
                    NavigatePage("terminal.html");
                  else
                    NavigatePage("packLoadFour.html") //
                }
                else if (JSON.parse(localStorage.getItem("trippleLoad")) && JSON.parse(localStorage.getItem("Weighbridge"))) {
                    NavigatePage("weighBridge.html");
                    }
                    else
                    NavigatePage("packLoadThree.html");
                break;

                case "En Route To Forth Pack Depot":
                   NavigatePage("packLoadFour.html");
                break;

                case "Arrived At Forth Pack Depot":
                if (JSON.parse(localStorage.getItem("fiveload")))
                {
                  if (JSON.parse(localStorage.getItem("VGMinfoFour")) == null)
                    NavigatePage("packLoadFour.html");
                  else if (JSON.parse(localStorage.getItem("VGMinfoFour")))
                    NavigatePage("terminal.html");
                  else
                    NavigatePage("packLoadFive.html") //
                }
                else if (JSON.parse(localStorage.getItem("fourLoad")) && JSON.parse(localStorage.getItem("Weighbridge"))) {
                    NavigatePage("weighBridge.html");
                    }
                    else
                    NavigatePage("packLoadFour.html");
                break;

                case "En Route To Fifth Pack Depot":
                   NavigatePage("packLoadFive.html");
                break;

                case "Arrived At Fifth Pack Depot":
                    if (JSON.parse(localStorage.getItem("fiveLoad")) && JSON.parse(localStorage.getItem("Weighbridge"))) {
                    NavigatePage("weighBridge.html");
                    }
                    else
                    NavigatePage("packLoadFive.html");
                break;

                    // conditional events end

                case "En Route To Empty Depot":

                break;

                case "En Route To Weighbridge":
                    NavigatePage("weighBridge.html");
                break;

                case "Arrived At Weighbridge":
                  if (JSON.parse(localStorage.getItem("VGMinfo")) != null)
                    NavigatePage("terminal.html");
                  else
                    NavigatePage("captureBookings.html");

                break;

                case "En Route To Terminal":
                  NavigatePage("terminal.html");
                break;

                case "Arrived At Terminal":
                  NavigatePage("terminal.html");
                break

                case "Container Offloaded":
                  NavigatePage("terminal.html");
                break
              }

              localStorage.removeItem("homeButtonFired");

            } else {
              alert("You are about to start a new Job task and quit the current\ntap Cancel Current Task");
              return;
            }

          } else {

            var referenceToUse = this.innerHTML;
            var bookingReferenceID = this.id;

            var bookingAndId = {};

                bookingAndId.id = bookingReferenceID;
                bookingAndId.Bookingreference = referenceToUse;

            console.log(bookingAndId);
            localStorage.setItem("bookingAndId",JSON.stringify(bookingAndId));
            localStorage.setItem("booking", referenceToUse);

            NavigatePage("transportBooking.html");
          }


      });

    }

    if (homeButtonFired)
    {
      $("#resumeTaskDiv").css('display', 'block');
      $("#bookingInProgessDiv").css('display', 'block');
      var taskInProgress = document.getElementById("taskInProgress");
      taskInProgress.innerHTML = JSON.parse(localStorage.getItem("bookingAndId")).Bookingreference;
      taskInProgress.style.color = "crimson";
      $("#taskInProgress").blink({
        delay :1500
      });
    }

    /// cancel current trip completely

    $('#quitTrip').click(function() {

      trackEventer("In Process Trip Cancelled","In Process Trip Cancelled..");

    });

    // register for push and no fucking white screen for low performance devices !!!


});

$(document).on("pageinit", "#transportBooking", function () {
    debugger

    // var status = localStorage.getItem("status");
    // var buttonStatus = document.getElementById('status');
    // buttonStatus.innerHTML = status;

    // map out reference

});

$(document).on("pageshow", "#transportBooking", function () {

    debugger;

    $('body').removeClass('ui-loading');
    $('#backButtonTransport').click(function() {
      debugger;
    $('body').addClass('ui-loading');
    var status = localStorage.getItem("status");
      if (status != null)
        alert("You cannot go back you have already left the empty depot");
      else
        NavigatePage("booking.html");
    });

    // globally expose driver status element

    var headerStatus = document.getElementById('headerStatus');
    var bookingsToUse = JSON.parse(localStorage.getItem("currentBookings"));
    var booking = localStorage.getItem("booking");
    var driverData = JSON.parse(localStorage.getItem("credentials"));
    var recentBooking = localStorage.getItem("newBooking");
    var recentBookingPrecent;
    var bookingAndId = JSON.parse(localStorage.getItem("bookingAndId"));

    if (recentBooking != null) // check if a recent booking is precent
     recentBookingPrecent = true;
    // map out reference

    for (var i = 0; i < bookingsToUse.length; i++) {
        debugger;
        if (bookingAndId.Bookingreference == bookingsToUse[i]["bookingRef"] && bookingAndId.id == bookingsToUse[i]["ID"])
        {
            var currentBookingObj = {};
            console.log("Map");

            // handle booking information

            $("#transBooking").val(bookingsToUse[i]["bookingRef"]);
            $("#emptyDepot").val(bookingsToUse[i]["emptyDepot"]);
            $("#packingDepot").val(bookingsToUse[i]["packingDepot"]);
            $("#date").val(bookingsToUse[i]["date"]);
            $("#terminal_description").val(bookingsToUse[i]["teriminalDescriptopn"]);
            $("#container_type").val(bookingsToUse[i]["container_type"]);
            $("#genset").val(bookingsToUse[i]["genset"]);
            $("#loadingPointType").val(bookingsToUse[i]["loadingPointType"]);
            $("#dualloadpoints").val(bookingsToUse[i]["dualloadpoints"]);

            if (bookingsToUse[i]["dualloadpoints"] == 0) // hide div handlling points
              $("#dualloadpointsDiv").css('display', 'none');

            currentBookingObj.loadingPointType = bookingsToUse[i]["loadingPointType"];
            currentBookingObj.dualloadpoints = bookingsToUse[i]["dualloadpoints"];
            currentBookingObj.bookingRef = bookingsToUse[i]["bookingRef"];
            currentBookingObj.emptyDepot  = bookingsToUse[i]["emptyDepot"];
            currentBookingObj.packingDepot  = bookingsToUse[i]["packingDepot"];
            currentBookingObj.date  = bookingsToUse[i]["date"];
            currentBookingObj.teriminalDescriptopn  = bookingsToUse[i]["teriminalDescriptopn"];
            currentBookingObj.container_type  = bookingsToUse[i]["container_type"];
            currentBookingObj.genset  = bookingsToUse[i]["genset"];

            var packDepotOneType = document.getElementById('packDepotOneType');

            if (bookingsToUse[i]["packingDepotTwo"] == "None" || bookingsToUse[i]["packingDepotTwo"] == "") { // hide div with second depot
                packDepotOneType.innerHTML = "<img src='../images/icons-png/location-black.png'/> Packing Depot";
                $("#packDepotTwoDiv").css('display', 'none');
                localStorage.setItem("dualLoad",false);
              } else {
                packDepotOneType.innerHTML = "<img src='../images/icons-png/location-black.png'/> Packing Depot One";
                $("#packDepotTwoDiv").css('display', 'block');
                localStorage.setItem("dualLoad",true);
                currentBookingObj.packingDepotTwo  = bookingsToUse[i]["packingDepotTwo"];
              }

              if (bookingsToUse[i]["packingDepotThree"] == "None" || bookingsToUse[i]["packingDepotThree"] == "") { // hide div with third depot
                  $("#packDepotThreeDiv").css('display', 'none');
                  localStorage.setItem("trippleLoad",false);
                } else {
                  $("#packDepotThreeDiv").css('display', 'block');
                 localStorage.setItem("trippleLoad",true);
                  currentBookingObj.packingDepotThree  = bookingsToUse[i]["packingDepotThree"];
                }

                if (bookingsToUse[i]["packingDepotFour"] == "None" || bookingsToUse[i]["packingDepotFour"] == "") { // hide div with forth depot
                    $("#packDepotFourDiv").css('display', 'none');
                    localStorage.setItem("fourLoad",false);
                  } else {
                    $("#packDepotFourDiv").css('display', 'block');
                   localStorage.setItem("fourLoad",true);
                    currentBookingObj.packingDepotFour  = bookingsToUse[i]["packingDepotFour"];
                  }

                  if (bookingsToUse[i]["packingDepotFive"] == "None" || bookingsToUse[i]["packingDepotFive"] == "") { // hide div with fifth depot
                      $("#packDepotFiveDiv").css('display', 'none');
                      localStorage.setItem("fiveLoad",false);
                    } else {
                      $("#packDepotiverDiv").css('display', 'block');
                     localStorage.setItem("fiveLoad",true);
                      currentBookingObj.packingDepotFive  = bookingsToUse[i]["packingDepotFive"];
                    }


              // handle Weighbridge event / functionality for bookings with Weighbridge

            if (bookingsToUse[i]["weighbridge"]) {

              $("#solasMethod").val("Method 1");
              $("#weighbridgeNameDiv").css('display', 'block');
              localStorage.setItem("Weighbridge",true);
              currentBookingObj.weighbridge = bookingsToUse[i]["weighbridge"];
              currentBookingObj.weighbridgeName = bookingsToUse[i]["weighbridgeName"];

            } else {
              $("#solasMethod").val("Method 2");
              $("#weighbridgeNameDiv").css('display', 'none');
              localStorage.setItem("Weighbridge",false);
            }

            // set storage
            localStorage.setItem("currentBookingObj",JSON.stringify(currentBookingObj));

            // additional packs and weighbridges

            $("#weighbridgeName").val(bookingsToUse[i]["weighbridgeName"]);
            $("#packingDepotTwo").val(bookingsToUse[i]["packingDepotTwo"]);
            $("#packingDepotThree").val(bookingsToUse[i]["packingDepotThree"]);
            $("#packingDepotFour").val(bookingsToUse[i]["packingDepotFour"]);
            $("#packingDepotFive").val(bookingsToUse[i]["packingDepotFive"]);

            recentBookingPrecent = false;

            // Handle Cto information
            $("#Exporter").val(bookingsToUse[i]["Exporter"]);
            $("#ClientRef").val(bookingsToUse[i]["Client_Ref"]);
            $("#ContainerOperator").val(bookingsToUse[i]["Container_Operator"]);
            $("#VesselName").val(bookingsToUse[i]["Vessel_Name"]);
            $("#VoyageNumber").val(bookingsToUse[i]["Voyage_Number"]);
            $("#PortOfLoading").val(bookingsToUse[i]["Port_of_Loading"]);
            $("#PortOfDischarge").val(bookingsToUse[i]["Port_of_Discharge"]);

            // Container Settings

            $("#containerSize").val(bookingsToUse[i]["Container_Size"]);
            $("#Commodity").val(bookingsToUse[i]["Commodity"]);
            $("#temperateCode").val(bookingsToUse[i]["Temperature_Code"]);
            $("#temperateSetting").val(bookingsToUse[i]["Temperature_Setting"]);
            $("#VentSettings").val(bookingsToUse[i]["Vent_Settings"]);

        }   // check for new booking
    }

    if (recentBookingPrecent) { // there is a recent booking selected
      if (recentBooking != null) {
        var newBooking = JSON.parse(recentBooking);
        $("#transBooking").val(newBooking.BReference);
        $("#emptyDepot").val(newBooking.EDepot);
        $("#packingDepot").val(newBooking.PDepot);
        $("#date").val(newBooking.Day);
        }
    }

    // has En Route Todepot all ready  / or status fired ?
    var status = localStorage.getItem("status");

    if (status != null) {
      if (status == "En Route To Empty Depot")
      {
            $("#enRouteToEmptyDepotDiv").css('display', 'none');
            $("#arrivedAtEmptyDepotDiv").css('display', 'block');
            $("#cancelTripDiv").css('display', 'block');
            $('#backToBooking').fadeOut(500);
      }
      else if (status == "Booking Accepted") {
        debugger;
            $("#acceptTask, #rejectTask").css('display', 'none');
            $("#enRouteToEmptyDepotDiv").css('display', 'block');

            // repeat above process and repopulate selected booking data
            for (var i = 0; i < bookingsToUse.length; i++) {
                debugger;
                if (bookingAndId.bookingreference == bookingsToUse[i]["bookingRef"] && bookingAndId.id == bookingsToUse["ID"])
                {
                    console.log("Map");
                    //
                    $("#transBooking").val(bookingsToUse[i]["bookingRef"]);
                    $("#emptyDepot").val(bookingsToUse[i]["emptyDepot"]);
                    $("#packingDepot").val(bookingsToUse[i]["packingDepot"]);
                    $("#date").val(bookingsToUse[i]["date"]);
                    $("#terminal_description").val(bookingsToUse[i]["teriminalDescriptopn"]);
                    $("#container_type").val(bookingsToUse[i]["container_type"]);
                    $("#genset").val(bookingsToUse[i]["genset"]);

                    if (bookingsToUse[i]["packingDepotTwo"] == "None") { // hide div with second depot
                        $("#packDepotTwoDiv").css('display', 'none');
                        localStorage.setItem("dualLoad",false);
                      } else {
                        $("#packDepotTwoDiv").css('display', 'block');
                        localStorage.setItem("dualLoad",true);
                      }
                    if (bookingsToUse[i]["packingDepotThree"] == "None") { // hide div with third depot
                          $("#packDepotThreeDiv").css('display', 'none');
                          localStorage.setItem("trippleLoad",false);
                        } else {
                          $("#packDepotThreeDiv").css('display', 'block');
                          localStorage.setItem("trippleLoad",true);
                        }

                      if (bookingsToUse[i]["packingDepotFour"] == "None") { // hide div with third depot
                            $("#packDepotFourDiv").css('display', 'none');
                            localStorage.setItem("fourLoad",false);
                          } else {
                            $("#packDepotFourDiv").css('display', 'block');
                            localStorage.setItem("fourLoad",true);
                          }


                    $("#packingDepotTwo").val(bookingsToUse[i]["packingDepotTwo"])
                    recentBookingPrecent = false;
                }   // check for new booking
            }

        }
    } else if (JSON.parse(localStorage.getItem("handledBooking")) != null) {
        if (JSON.parse(localStorage.getItem("handledBooking")).bookingreference == JSON.parse(localStorage.getItem("bookingAndId")).Bookingreference && JSON.parse(localStorage.getItem("handledBooking")).bookingId == JSON.parse(localStorage.getItem("bookingAndId")).id && JSON.parse(localStorage.getItem("handledFromPush")) == true) {
              $("#acceptTask, #rejectTask").css('display', 'none');
              $("#enRouteToEmptyDepotDiv").css('display', 'block');
        }
    }

    //<<<<< ===========================  WILL USE THIS SECTION FOR HANDLING STACKED BOOKING REFERENCES IN STORAGE    ==================================>>>

  // else if (JSON.parse(localStorage.getItem("pushNotificationRequstInQueue")) != null) {
  //     var pushNotificationRequstInQueue = JSON.parse(localStorage.getItem("pushNotificationRequstInQueue"));
  //       for (var i = 0; i < pushNotificationRequstInQueue.length; i++) {
  //           if (pushNotificationRequstInQueue[i]['BReference'] == localStorage.getItem("booking")) {
  //             $("#acceptTask, #rejectTask").css('display', 'none');
  //             $("#enRouteToEmptyDepotDiv").css('display', 'block');
  //           }
  //       }
  //   }
    //<<<<< ===========================  WILL USE THIS SECTION FOR HANDLING STACKED BOOKING REFERENCES IN STORAGE    =================================>>>


    $('#enRouteToEmptyDepot').click(function () {

        trackEventer("En Route To Empty Depot" , $('#enRouteToEmptyDepotDiv textarea').val());
        console.log("next task");

    });

    // post new event
    $('#arrivedAtEmptyDepot').click(function () {
        debugger;
        trackEventer("Arrived At Empty Depot", $('#arrivedAtEmptyDepotDiv textarea').val());
        console.log("next task");
    });

    // handle cancel task request

    $('#cancelTrip').click(function() {
      debugger;
      trackEventer("Cancelled Task" , $("#cancelTripDiv textarea").val());

    });

    // handle accept and rejection of tasks

    $("#acceptTask").click(function(){
      trackEventer("Booking Accepted" , "Booking Accepted");
    });

    $("#rejectTask").click(function(){
      trackEventer("Booking Rejected" , "Booking Rejected");
    });

    // if task already in progress make sure the correct fields are displatted

      if(JSON.parse(localStorage.getItem("taskAlreadyInProgress"))) {
          $("#acceptTask").css("display","none");
          $("#rejectTask").css("display","none");
          $("#enRouteToEmptyDepotDiv").css("display","none");

    }

// handle information toggler


      $("#informationToggler").on("change",function() {
            debugger;

            var state = this;
            var h3Status = document.getElementById('h3Status');

            if (state.value == "CTO Information") {

                $("#bookingInformation").slideUp('500');
                $("#ctoInformation").slideDown('500');

            } else {

                $("#ctoInformation").slideUp('500');
                $("#bookingInformation").slideDown('500');
            }

            h3Status.innerHTML = state.value;
            console.log("Current State : " + state.value);
      });

      // handling comment sending ONLY !!!


      $("#enRouteToEmptyDepotDiv .sendCmt").click(function() {
        debugger;
        $('body').addClass('ui-loading');
        var status = localStorage.getItem("status");
        localStorage.setItem("fromComment",true);
        trackEventer(status,$("#enRouteToEmptyDepotDiv textarea").val());
      });

      $("#arrivedAtEmptyDepotDiv .sendCmt").click(function() {
        debugger;
        $('body').addClass('ui-loading');
        var status = localStorage.getItem("status");
        localStorage.setItem("fromComment",true);
        trackEventer(status,$("#arrivedAtEmptyDepotDiv textarea").val());
      });

      $("#cancelTripDiv .sendCmt").click(function() {
        debugger;
        $('body').addClass('ui-loading');
        var status = localStorage.getItem("status");
        localStorage.setItem("fromComment",true);
        trackEventer(status,$("#cancelTripDiv textarea").val());
      });


        // handling comment sending ONLY !!!

});

$(document).on("pageinit", "#captureBooking", function () {
    debugger

    var taskAlready = JSON.parse(localStorage.getItem("taskAlreadyInProgress"));
    var status = localStorage.getItem("status");
    var title = document.getElementById('headerStatus');
    var h3Status = document.getElementById('h3Status');
    // title.innerHTML = status;
    // h3Status.innerHTML = status;

    if (taskAlready != true)
      localStorage.setItem("status",  title.innerHTML);


});

$(document).on("pagebeforeshow", "#captureBooking" , function() {

debugger
 // handle the current task the driver is busy with

    var currentStatus = localStorage.getItem("status");
    var divToShow;
    var divToHide;
    var alert = document.getElementById("errorMgs");

    if (currentStatus != null)  {
      switch(currentStatus) {

        case "Arrived At Empty Depot":

        // headerStatus.innerHTML = currentStatus;
        // h3Status.innerHTML = currentStatus;

          divToShow = document.getElementById("containerSection");
          divToShow.style.display = "block";

          divHide = document.getElementById("packDepotDiv");
          divHide.style.display = "none";

        // check if data already stored / submitted

        var storedContainerInfo = JSON.parse(localStorage.getItem("containerInfo"));
        if (storedContainerInfo != null)  { // check if the container localStorage is set

            repopulateContainerStorage();  // not neccessary
            divToShow.style.display = "none";
            divHide.style.display = "block";
        } else {
          localStorage.removeItem("VGMinfo"); // if there is no container information VGM cannot have storage
        }

        // handle stored VGM information

        debugger;

        var VGMStorage = JSON.parse(localStorage.getItem("VGMinfo"));
        if (VGMStorage != null) { // check if the VGM localStorage is set

          divToShow.style.display = "none";
          divHide.style.display = "block";

        // $("#VGMSection input").prop('readonly', true);
        // $("#VGMSection input").addClass('input-book');
        $("#weightExlude").val(VGMStorage.VGM - storedContainerInfo.TareWeight);
        $("#resultExclude").val(VGMStorage.VGM);

        $("#weightInclude").val(parseFloat(VGMStorage.CargoWeight) + parseFloat(storedContainerInfo.TareWeight));
        $("#resultInclude").val(VGMStorage.CargoWeight);

        $("#temptale").val(VGMStorage.Temptale);
        // $("#tare")[0].checked = (VGMStorage.IncludesTare);

        $("#VGMSection #submit").css("display","none");
        $("#packDepotDiv").css("display","block");

        // handle previous task

          if (JSON.parse(localStorage.getItem("fromTerminal")))
          {
            $("#VGMSection #submit").css("display","none");
            $("#packDepotDiv").css("display","block");

            // $("#weightInclude , #temptale , #weightExlude , #VGM").prop('readonly', false);
            // $("#weightInclude , #temptale , #weightExlude , #VGM").removeClass('input-book');

            localStorage.removeItem("fromTerminal"); // clear storage
          }

        }

        if (JSON.parse(localStorage.getItem("fromWeighBridge"))) {

            $("#containerSection").css("display","block");
            divHide.style.display = "none";
            localStorage.removeItem("fromWeighBridge");

        }

            break;

        case "En Route to Pack Depot":


          $("#containerSection").css('display', 'none'); // hide cause already set
          // $("#packDepotDiv").css('display', 'none');
          $("#arrivedAtPackDepotDiv").css('display', 'block');


          break;

          case "Arrived At Pack Depot":

          debugger;

          // check if data is already stored / submitted
          var VGMSection;
          var packDepotDiv;

            VGMSection = document.getElementById("VGMSection");
            VGMSection.style.display = "block";

            packDepotDiv = document.getElementById("packDepotDiv");
            packDepotDiv.style.display = "none";
            $('#containerSection').css('display', 'none');
            var VGMStorage = JSON.parse(localStorage.getItem("VGMinfo"));
            if (VGMStorage != null) { // check if the VGM localStorage is set , if set event has already fired
                  //reRenderVGMStorage();

                  if (JSON.parse(localStorage.getItem("fromTerminal")))
                    reRenderVGMStorage();

                  else if (localStorage.getItem("FromSecondPack"))
                  {
                    reRenderVGMStorage();
                    localStorage.removeItem("FromSecondPack");
                  }
                  else
                    NavigatePage("terminal.html");
                }

          break;

          // conditional events

          case "Arrived At Weighbridge":

          $("#containerSection").css('display', 'none'); // hide cause already set
          $("#VGMSection").css("display","block");

          localStorage.removeItem("fromTerminal");

          var VGMinfo = JSON.parse(localStorage.getItem("VGMinfo"));

          if (localStorage.getItem("VGMinfo")!= null) {

            reRenderVGMStorage();
          }

          break;


          }
      }

// PREVENT ALL FORMS OF NEGATIVE VALUES FROM BEING ENTERED IN ///

$("#VGM , #weightExlude ,#weightInclude ,#resultExclude , #resultInclude, #tareWeight , #weightExludeTwo ,#weightIncludeTwo ,#resultExcludeTwo , #resultIncludeTwo").keypress(function(event) {
  debugger;
  if ( event.which == 45 || event.which == 69 ||  event.which == 188 ||  event.which == 101 || event.which == 44) {
      event.preventDefault();
   }
});

$('#sealNo , #containerNo , #containerNoAgain , #temptale , #temperatureRecordingDevice').keypress(function (e) {
    var regex = new RegExp("^[a-zA-Z0-9]+$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    if (regex.test(str)) {
        return true;
    }

    e.preventDefault();
    return false;
});

// var $decimalPoints = /^\d+(\.\d+)?$/;
// $("#tareWeight,#temperatureRecordingDevice").on('keypress keydown keyup',function() {
//       if(!$(this).val().match($decimalPoints)) {
//         console.log("error cannot proceed");
//       }
//
// });

// disabling touch events and specific keys from being used

$("#temperatureRecordingDevice").keypress(function(event) {
  if(event.which == 69 ||  event.which == 188 || event.which == 44) {
      event.preventDefault();
   }
});


// disable container cut , copy , paste functionality

$('#containerNo , #containerNoAgain').bind("cut copy paste",function(e) {
  debugger;
          console.log("Disabling container cut , copy , paste functionality");
          e.preventDefault();
      });

// binding of clicks

$('#VGMSection #submit').click(function()  {

$('body').addClass('ui-loading'); // set spinner

  debugger;
   var alert = document.getElementById("errorMgs");
   var valid = false;
   var bookingAndId = JSON.parse(localStorage.getItem("bookingAndId"));
   var deviceUUID;

   if(window.cordova.platformId == "browser")
     deviceUUID = "f3a62c91a1df6d1e";
   else
     deviceUUID = device.uuid;

   // set boolean

   // handle default values


      if ($('#weightExlude').val() == ""  ||  $('#resultExclude').val() == "" || $('#resultExclude').val() == "0" || $('#weightExlude').val() == "0") {

        alert.innerHTML = "please fill in all required fields";
        alert.style.color = "red";
        valid = false;
        console.log("please fill in all required fields");
        $('body').removeClass('ui-loading');
        return;
        }


    ///


    if ($('#weightInclude').val() == ""  ||  $('#resultInclude').val() == "" || $('#resultInclude').val() == "0" || $('#weightInclude').val() == "0" || $('#weightExlude').val() == "") {

      alert.innerHTML = "please fill in all required fields";
      alert.style.color = "red";
      valid = false;
      console.log("please fill in all required fields");
      $('body').removeClass('ui-loading');
      return;
    } else if ($('#weightInclude').val() < 0 || $('#weightExlude').val()  < 0 || $('#resultInclude').val() <  0 || $('#resultExclude').val() < 0) {

      alert.innerHTML = "Weight Capturing Cannot be less then 0 or negative";
      alert.style.color = "red";
      valid = false;
      console.log("Weight Capturing Cannot be less then 0 or negative");
      $('body').removeClass('ui-loading');
      return;
    } else
         alert.innerHTML = "";





    ///

   if ($("#VGM").val() == "" || $("#VGM").val() == undefined ||  $("#VGM").val() == "0")
   {
     alert.innerHTML = "Please Fill in tare weight";
     alert.style.color = "red";
     $('body').removeClass('ui-loading')
     return;
   }
   else if ($("#VGM").val() < 0)
     {
       alert.innerHTML = "Tare weight cannot be less then 0";
       alert.style.color = "red";
       $('body').removeClass('ui-loading')
       return;
     }
   else
       alert.innerHTML = "";

   var infoToSend = {

     VGM :  $('#resultExclude').val(),
     CargoWeight : $('#resultInclude').val(),
     Temptale : $('#temptale').val(),
     CargoWeightTwo : "0",
     VGMTwo : "0",
     TareWeight  :$('#VGM').val(),
     weightInclude : $('#weightInclude').val(),
     weightExlude  : $('#weightExlude').val()
   };

   for(var key in infoToSend) {

       if (infoToSend[key] == "" || infoToSend[key] == null)
       {
         alert.innerHTML = "please fill in " + key;
         alert.style.color = "red";
         valid = false;
         console.log("please fill in " + key);
         $('body').removeClass('ui-loading');
         return;
       }
       else
       {
         valid = true;
         //$('body').removeClass('ui-loading');
       }
   }

   // if all fields are set capture in database
   debugger;
   if(valid) {

     infoToSend.UUID = deviceUUID;
     infoToSend.BookingReference = bookingAndId.Bookingreference;
     infoToSend.BookingReferenceId = bookingAndId.id;
     infoToSend.Status = "En Route to Pack Depot";
     infoToSend.Complete = false;
     infoToSend.key = "Pack1";
     infoToSend.ContainerNo =  JSON.parse(localStorage.getItem("containerInfo")).ContainerNo;
     infoToSend.SealNo =  JSON.parse(localStorage.getItem("containerInfo")).SealNo;
     infoToSend.DriverNumber = JSON.parse(localStorage.getItem("credentials")).driver_number_with_code;

     if ($("#tare option:selected").text() == "Yes")
        infoToSend.IncludesTare = true;
    else
        infoToSend.IncludesTare = false;

     captureVGMDetails(infoToSend);

   }


});


    // handle container validation and first tear tracking

    $('#containerSubmit').click(function () { // event to follow Leaving Pack Depot

        console.log();
        debugger;
        var containerNumber = document.getElementById("containerNo");

        validateContainer(containerNumber.value);

    });

    // handle on route to Pack Depot Functionality

    $("#leavingPackDepot").click(function() {

      debugger;

      trackEventer("En Route to Pack Depot" ,$('#packDepotDiv textarea').val()); // event to follow Arrived At Pack Depot

    });


    // handle Arrived At Pack Depot  functionality

    $("#arrivedAtPackDepot").click(function() {

      debugger;

      trackEventer("Arrived At Pack Depot" , $('#arrivedAtPackDepotDiv textarea').val()); // event to follow capturing weights screen
    });


    $("#tare").on("change",function(){
      debugger;
      var tare = this;
      var checked = $( "#tare option:selected" ).text();
      if(checked == "Yes")
      {
        $('#weightIncludeDiv').slideDown('500');
        $('#weightExludeDiv').slideUp('500');
      }
      else
      {
        $('#weightExludeDiv').slideDown('500');
        $('#weightIncludeDiv').slideUp('500');

      }
    });

    // handle auto complete functionality for include and Exclude weights

    $(".minus").keyup(function() { // handle arithmetic events
      debugger;
     calcExclude();
     });


     $(".add").keyup(function() { // handle arithmetic events
       debugger;
      calcInclude();
     });




// handle go to previous task events here

$('#backButtonCaptureScreen').click(function(event) {
  debugger;

  var containerinfoExists = false;
  var currentStatus = localStorage.getItem("status");


  if (JSON.parse(localStorage.getItem("containerInfo")) != null)
       containerinfoExists = true;     // container Info has been stored already don't fire previous event

 if (backButtonCapturealreadyFired > 0 ) {
     backButtonCapturealreadyFired = 0;
     // alert("Tap Back Again To Confirm Clearing recorded valus.");
   return ; // incase of multiple function fire events then reset value
 }

 if (containerinfoExists) {
       switch (currentStatus) {

         case "En Route to Pack Depot":
        //  $("#arrivedAtPackDepotDiv").fadeOut(500);
        //  $("#packDepotDiv").fadeIn(1000);
        localStorage.setItem("fromCaptureBookings",true);
         // fire back to previous event

         var previousStatus = "";
           for (var i = 0; i < events.length; i++) {
             if(currentStatus == events[i]) {
                 previousStatus = events[i - 1];
     trackEventer(previousStatus,"En route to previous step");
               }
           }
         ////
           break;

       case "Arrived At Empty Depot":

       var respond  = confirm("If you go back container and other  details must be resubmitted.");
       if (respond == true) {

       $("#packDepotDiv").fadeOut(500);
       $("#containerSection").fadeIn(1000);
       repopulateContainerStorage();
       localStorage.removeItem("containerInfo");
       backButtonCapturealreadyFired = 1;
     } else
        return
       break;

       case "Arrived At Pack Depot" :

       var respond  = confirm("Weight including and Excluding caputures will be deleted from storage");
       if (respond == true) {

       $("#VGMSection").fadeOut(500);
       $("#arrivedAtPackDepotDiv").fadeIn(1000);

       // fire back to previous event

       var previousStatus = "";
         for (var i = 0; i < events.length; i++) {
           if(currentStatus == events[i]) {
               previousStatus = events[i - 1];
   trackEventer(previousStatus,"En route to previous step");
             }
         }
       }else
          return;

       break;

       case "Arrived At Weighbridge":

       var respond  = confirm("Weight including and Excluding caputures will be deleted from storage");
       if (respond == true) {
            localStorage.setItem("fromCaptureBookings",true);
            trackEventer("En Route To Weighbridge","En Route To Previous Status");
      } else
        return

       break;

       }

     } else { // if no container Storage exists return to transportBooking.html
       var previousStatus = "";
       for (var i = 0; i < events.length; i++) {
             if(currentStatus == events[i]) {
                 previousStatus = events[i - 1];
     trackEventer(previousStatus,"En route to previous step");
               }
           }
     }

   //  event.stopPropagation();
   console.log("backButtonCapturealreadyFired : " + backButtonCapturealreadyFired);
});


// handle dualload catering

if (JSON.parse(localStorage.getItem("dualLoad")))
{
  $("#packdepotOneDiv").css('display', 'block');
  var currentBookingObj = JSON.parse(localStorage.getItem("currentBookingObj"));
  $("#packDepotOne_description").val(currentBookingObj.packingDepot);
  $("#packDepotOneAgain_description").val(currentBookingObj.packingDepot);
}

});

$(document).on("pageshow", "#captureBooking", function () {

$('body').removeClass('ui-loading');
    // globall expose driver status element
    debugger;


   // handle En Route to Pack Depot  functionailty || second tier functionality || tare functionality
   debugger;
   var tareWeightSet = false;
   var tareWeight = JSON.parse(localStorage.getItem("containerInfo"));

   if (JSON.parse(localStorage.getItem("containerInfo")) == null) // then tare weight has been set
     tareWeightSet = false;
  else
     tareWeightSet = true;

  console.log("Tare weight set is : " + tareWeightSet);

   if (tareWeightSet)
   {
     $('#VGM').val(tareWeight.TareWeight);
     $('#VGM').removeClass('input-book');
     $('#temptale').val(tareWeight.Temptale);
     $('#temptale').prop('readonly', true);
     $('#temptale').addClass('input-book');
   }

   $("#VGM").keyup(function(event) {
     debugger;
     /* Act on the event */
    var checked = $( "#tare option:selected" ).text();
     if (checked == "No") {
        calcExclude();
     } else {
        calcInclude();
     }

   });

  //  handle comments only /// ===>

  $("#packDepotDiv .sendCmt").click(function() {
    debugger;
    $('body').addClass('ui-loading');
    var status = localStorage.getItem("status");
    localStorage.setItem("fromComment",true);
    trackEventer(status,$("#packDepotDiv textarea").val());
  });

  $("#arrivedAtPackDepotDiv .sendCmt").click(function() {
    debugger;
    $('body').addClass('ui-loading');
    var status = localStorage.getItem("status");
    localStorage.setItem("fromComment",true);
    trackEventer(status,$("#arrivedAtPackDepotDiv textarea").val());
  });

  // handle comments only // ===>

});

/////==========================> SECOND PACK DEPOT <==================================\\\\\\

$(document).on("pagecreate" , "#packDepotTwo" , function() {

debugger;


});

$(document).on("pageinit" , "#packDepotTwo" , function() {

debugger;


});

$(document).on("pagebeforeshow" , "#packDepotTwo" , function() {

debugger;
var h3Status = document.getElementById("h3Status");
    h3Status.innerHTML = "Left First Pack Depot";

var status = localStorage.getItem("status");

        // intialize click events

        $("#enrouteTopackDepotTwo").bind("click",function() {

          console.log("clicked");

          trackEventer("En Route To Second Pack Depot", $("#enrouteTopackDepotTwoDiv textarea").val());

        });

        $("#arrivedAtPackDepotTwo").bind("click",function() {

          trackEventer("Arrived At Second Pack Depot", $("#arrivedAtPackDepotTwoDiv textarea").val());

        });


$('#VGMSectionTwo #submit').click(function() {

            $('body').addClass('ui-loading');
          var originalVGMInfo  = JSON.parse(localStorage.getItem("VGMinfo"));
          debugger;
           var alert = document.getElementById("errorMgs");
           var valid = false;
           var reference = JSON.parse(localStorage.getItem("bookingAndId")).Bookingreference;
           var deviceUUID;
           var CargoWeightTwo = $('#resultExcludeTwo')[0].value;
           var weightIncludeTwo =   $('#weightIncludeTwo').val();
           var CargoWeightTwo =  $('#resultIncludeTwo').val();
           var weightExludeTwo = $('#weightExludeTwo').val();
           var VGMTwo = $('#resultExcludeTwo').val();
           var weightExludeTwoPack1 = $("#weightExludeTwoPack1").val();
           var weightIncludeTwoPack1 = $("#weightIncludeTwoPack1").val();

           if(window.cordova.platformId == "browser")
             deviceUUID = "f3a62c91a1df6d1e";
           else
             deviceUUID = device.uuid;

           // set boolean

           // handle zero validations

           if ($("#tareTwo option:selected").text() == "No")
            {


              if ($('#weightExludeTwo').val() == ""  ||  $('#resultExcludeTwo').val() == "" || $('#resultExcludeTwo').val() == "0" || $('#weightExludeTwo').val() == "0") {

                alert.innerHTML = "please fill in all required fields";
                alert.style.color = "red";
                valid = false;
                console.log("please fill in all required fields");
                $('body').removeClass('ui-loading');
                return;
                }
                 else
                  alert.innerHtml = "";
            }
          else
           {

             if ($('#weightIncludeTwo').val() == ""  ||  $('#resultIncludeTwo').val() == "" || $('#resultIncludeTwo').val() == "0" || $('#weightExludeTwo').val() == "0") {

               alert.innerHTML = "please fill in all required fields";
               alert.style.color = "red";
               valid = false;
               console.log("please fill in all required fields");
               $('body').removeClass('ui-loading');
               return;
               }
                else
                  alert.innerHtml = "";
           }

          //============================>>

          if ($('#VGM').val() == "" || $('#VGM').val() == "0" || $('#VGM').val() == undefined) {
            alert.innerHTML = "please fill in tare weight";
            alert.style.color = "red";
            valid = false;
            console.log("please fill in tare weight");
            $('body').removeClass('ui-loading');
            return;
          } else
             alert.innerHtml = "";

           //=================================>>

           if ($('#VGM').val() < 0) {
             alert.innerHTML = "Tare weight Cannot be negative";
             alert.style.color = "red";
             valid = false;
             console.log("Tare weight  in tare weight");
             $('body').removeClass('ui-loading');
             return;
           } else
              alert.innerHtml = "";

          // ========================>>

          if ($('#weightIncludeTwo').val() < 0 ||  $('#resultIncludeTwo').val() < 0 || $('#weightExludeTwo').val() < 0 || $("#resultExcludeTwo") < 0) {

            alert.innerHTML = "Weights Cannot Be negative";
            alert.style.color = "red";
            valid = false;
            console.log("please fill in all required fields");
            $('body').removeClass('ui-loading');
            return;
            }
             else
               alert.innerHtml = "";

          // ========================>>

           var infoToSend = {

             TareWeight  :$('#VGM').val(),
             VGM :  weightExludeTwoPack1,
             VGMTwo : VGMTwo,
             weightExludeTwo : weightExludeTwo ,
             CargoWeight : weightIncludeTwoPack1,
             weightIncludeTwo : weightIncludeTwo,
             CargoWeightTwo :CargoWeightTwo,
             Temptale : $('#temptale').val()

           };

           for(var key in infoToSend) {

               if (infoToSend[key] == "" || infoToSend[key] == null)
               {
                 alert.innerHTML = "please fill in " + key;
                 alert.style.color = "red";
                 valid = false;
                 console.log("please fill in " + key);
                 $('body').removeClass('ui-loading');
                 return;
               }
               else
               {
                 valid = true;
                 //$('body').removeClass('ui-loading');
               }
           }

           // if all fields are set capture in database
           debugger;
           if(valid) {

            if ($("#tareTwo option:selected").text() == "Yes")
                infoToSend.IncludesTareTwo = true;
            else
                infoToSend.IncludesTareTwo = false;

             infoToSend.key = "Pack2";
             infoToSend.ContainerNo = JSON.parse(localStorage.getItem("containerInfo")).ContainerNo;
             infoToSend.SealNo =  JSON.parse(localStorage.getItem("containerInfo")).SealNo;
             infoToSend.TotalVGM = (parseFloat(infoToSend.VGM) + parseFloat(infoToSend.VGMTwo));
             infoToSend.TotalCargoWeight = (parseFloat(infoToSend.CargoWeight) + parseFloat(infoToSend.CargoWeightTwo));
             localStorage.setItem("tempVGMInfoTwo",JSON.stringify(infoToSend));
             infoToSend.UUID = deviceUUID;
             infoToSend.BookingReference = reference;
             infoToSend.BookingReferenceId = JSON.parse(localStorage.getItem("bookingAndId")).id;
             infoToSend.Status = "En Route to Pack Depot";
             infoToSend.Complete = false;
             infoToSend.DriverNumber = JSON.parse(localStorage.getItem("credentials")).driver_number_with_code;
             captureVGMDetails(infoToSend);
           }
        });

        // handle packDepotTwo

        switch (status) {

          case "En Route To Second Pack Depot":

              $("#enrouteTopackDepotTwoDiv").css('display', 'none');
              $("#arrivedAtPackDepotTwoDiv").css('display', 'block');

              h3Status.innerHTML = "Arrived At Second Pack Depot";

            break;

          case "Arrived At Second Pack Depot":

             $("#arrivedAtPackDepotTwoDiv").css('display', 'none');
             $("#enrouteTopackDepotTwoDiv").css('display', 'none');
             //
             $("#VGMSectionTwo").css('display', 'block');

             // set previous tare and temperature recording devices values and lock the values

             var VGMinfo = JSON.parse(localStorage.getItem("VGMinfo"));

             if (VGMinfo != null) {

              var containerInfoToChange = JSON.parse(localStorage.getItem("containerInfo"));

              $("#VGMSectionTwo #VGM").val(VGMinfo.TareWeight);
              $("#VGMSectionTwo #temptale").val(VGMinfo.Temptale);
              $("#weightExludeTwoPack1").val(VGMinfo.weightExlude);
              $("#weightIncludeTwoPack1").val(VGMinfo.weightInclude)
              $("#resultExcludeTwo").val(VGMinfo.VGM);
              $("#resultIncludeTwo").val(VGMinfo.CargoWeight);

             $("#VGMSectionTwo #VGM").removeClass('input-book');
             $("#VGMSectionTwo #VGM").prop('readonly', false)
              }

             if (JSON.parse(localStorage.getItem("VGMinfoTwo")) != null) {

               var VGMinfoTwo = JSON.parse(localStorage.getItem("VGMinfoTwo"));
               // if exists set values
               if (VGMinfoTwo.IncludesTare)
                 $("#weightInclude").val(parseFloat(VGMinfoTwo.CargoWeight) + parseFloat(VGMinfoTwo.TareWeight));
               else
                 $("#weightExlude").val(parseFloat(VGMinfoTwo.VGM) - parseFloat(VGMinfoTwo.TareWeight));

               $("#weightExludeTwo").val(VGMinfoTwo.weightExludeTwo);
               $("#resultExcludeTwo").val(VGMinfoTwo.TotalCargoWeight);
               $("#weightIncludeTwo").val(VGMinfoTwo.TotalCargoWeight);
               $("#resultIncludeTwo").val(VGMinfoTwo.weightExludeTwo);
               $("#temptale").val(VGMinfoTwo.Temptale);
             }
          break;
        }

        if (JSON.parse(localStorage.getItem("dualLoad"))) {

          $("#packdepotTwoDiv").css('display', 'block');

          var currentBookingObj = JSON.parse(localStorage.getItem("currentBookingObj"));

          $("#packDepotTwo_description").val(currentBookingObj.packingDepotTwo);

        }
});


$(document).on("pageshow" , "#packDepotTwo" , function() {

debugger;

var status = localStorage.getItem("status");
if (status == "Arrived At Second Pack Depot")
  document.getElementById("h3Status").innerHTML = status;

$('body').removeClass('ui-loading');

$("#backButtonCapture").bind("click",function() {
  // incase exists

  var status = localStorage.getItem("status");
    debugger;

    switch (status) {
      case "Arrived At Second Pack Depot":

      var respond  = confirm("Weight including and Excluding caputures will be deleted from storage");
      if (respond == true) {
         trackEventer("En Route To Second Pack Depot","Previous Task");
         } else
             return;
        break;

      case "En Route To Second Pack Depot":
              localStorage.removeItem("fromTerminal");
              localStorage.setItem("FromSecondPack",true);
              trackEventer("Arrived At Pack Depot","Previous Task");

        break;

      case "Arrived At Pack Depot":

      if (JSON.parse(localStorage.getItem("dualLoad")) && JSON.parse(localStorage.getItem("Weighbridge"))) {

        localStorage.setItem("FromSecondPack",true);
        trackEventer("En Route to Pack Depot","En Route To Previous Task");

      } else {
            localStorage.removeItem("fromTerminal");
            localStorage.setItem("FromSecondPack",true);
            NavigatePage("captureBookings.html");
        }
      break;

    }
// $("#VGM").on("Input", function () {
//   debugger;
//   var value = field.value;
//
//   if (value >= 6)
//
//    return;
//
// });

});

$("#VGMSectionTwo #VGM").keyup(function(event) {
  debugger;
  /* Act on the event */
 var checked = $( "#tareTwo option:selected" ).text();
  if (checked == "No") {
     calcExclude();
  } else {
     calcInclude();
  }

});

$(".minus").keyup(function() { // handle arithmetic events
  debugger;
 calcExclude();
 });

 $(".add").keyup(function() { // handle arithmetic events
   debugger;
  calcInclude();
 });

 $("#tareTwo").on("change",function(){
   debugger;
   var tare = this;
   var checked = $( "#tareTwo option:selected" ).text();
   if(checked == "Yes")
   {
     $('#weightIncludeDivTwo').slideDown('500');
     $('#weightExludeDivTwo').slideUp('500');

   }
   else
   {
     //
     $('#weightExludeDivTwo').slideDown('500');
     $('#weightIncludeDivTwo').slideUp('500');
   }
 });

 // PREVENT ALL FORMS OF NEGATIVE VALUES FROM BEING ENTERED IN ///

 $("#VGM , #weightExludeTwo ,#weightIncludeTwo ,#resultExcludeTwo , #resultIncludeTwo,#weightExludeTwo ,#weightIncludeTwo ,#resultExcludeTwo , #resultIncludeTwo , #temptale , #temperatureRecordingDevice").keypress(function(event) {
   //debugger;
   if ( event.which == 45 || event.which == 69 ||  event.which == 188 || event.which == 44) {
       event.preventDefault();
    }

    $('#temptale').keypress(function (e) {
        var regex = new RegExp("^[a-zA-Z0-9]+$");
        var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (regex.test(str)) {
            return true;
        }

        e.preventDefault();
        return false;
    });


 });

 // handle comment sending

 $("#enrouteTopackDepotTwoDiv .sendCmt").click(function() {
   debugger;
   $('body').addClass('ui-loading');
   var status = localStorage.getItem("status");
   localStorage.setItem("fromComment",true);
   trackEventer(status,$("#enrouteTopackDepotTwoDiv textarea").val());
 });

 $("#arrivedAtPackDepotTwoDiv .sendCmt").click(function() {
   debugger;
   $('body').addClass('ui-loading');
   var status = localStorage.getItem("status");
   localStorage.setItem("fromComment",true);
   trackEventer(status,$("#arrivedAtPackDepotTwoDiv textarea").val());
 });


});



$(document).on("pagecreate" , "#packDepotThree" , function() {

debugger;


});

$(document).on("pageinit" , "#packDepotThree" , function() {

debugger;


});

$(document).on("pagebeforeshow" , "#packDepotThree" , function() {

debugger;
var h3Status = document.getElementById("h3Status");
    h3Status.innerHTML = "Left Second Pack Depot";

var status = localStorage.getItem("status");

        // intialize click events

        $("#enrouteTopackDepotThree").bind("click",function() {

          console.log("clicked");

          trackEventer("En Route To Third Pack Depot", $("#enrouteTopackDepotThreeDiv textarea").val());

        });

        $("#arrivedAtPackDepotThree").bind("click",function() {

          trackEventer("Arrived At Third Pack Depot", $("#arrivedAtPackDepotThreeDiv textarea").val());

        });


$('#VGMSectionThree #submit').click(function() {

            $('body').addClass('ui-loading');
          var originalVGMInfo  = JSON.parse(localStorage.getItem("VGMinfo"));
          debugger;
           var alert = document.getElementById("errorMgs");
           var valid = false;
           var reference = JSON.parse(localStorage.getItem("bookingAndId")).Bookingreference;
           var deviceUUID;

           var weightIncludeThree =   $('#weightIncludeThree').val();
           var CargoWeightThree =  $('#resultIncludeThree').val();
           var weightExludeThree = $('#weightExludeThree').val();
           var VGMThree = $('#resultExcludeThree').val();

           var weightExludeThreePack1 = $("#weightExludeThreePack1").val();
           var weightIncludeThreePack1 = $("#weightIncludeThreePack1").val();

           var weightExludeThreePack2 = $("#weightExludeThreePack2").val();
           var weightIncludeThreePack2 = $("#weightIncludeThreePack2").val();

           if(window.cordova.platformId == "browser")
             deviceUUID = "f3a62c91a1df6d1e";
           else
             deviceUUID = device.uuid;

           // set boolean

           // handle zero validations

           if ($("#tareThree option:selected").text() == "No")
            {


              if ($('#weightExludeThree').val() == ""  ||  $('#resultExcludeThree').val() == "" || $('#resultExcludeThree').val() == "0" || $('#weightExludeThree').val() == "0") {

                alert.innerHTML = "please fill in all required fields";
                alert.style.color = "red";
                valid = false;
                console.log("please fill in all required fields");
                $('body').removeClass('ui-loading');
                return;
                }
                 else
                  alert.innerHtml = "";
            }
          else
           {

             if ($('#weightIncludeThree').val() == ""  ||  $('#resultIncludeThree').val() == "" || $('#resultIncludeThree').val() == "0" || $('#weightExludeThree').val() == "0") {

               alert.innerHTML = "please fill in all required fields";
               alert.style.color = "red";
               valid = false;
               console.log("please fill in all required fields");
               $('body').removeClass('ui-loading');
               return;
               }
                else
                  alert.innerHtml = "";
           }

          //============================>>

          if ($('#VGM').val() == "" || $('#VGM').val() == "0" || $('#VGM').val() == undefined) {
            alert.innerHTML = "please fill in tare weight";
            alert.style.color = "red";
            valid = false;
            console.log("please fill in tare weight");
            $('body').removeClass('ui-loading');
            return;
          } else
             alert.innerHtml = "";

           //=================================>>

           if ($('#VGM').val() < 0) {
             alert.innerHTML = "Tare weight Cannot be negative";
             alert.style.color = "red";
             valid = false;
             console.log("Tare weight  in tare weight");
             $('body').removeClass('ui-loading');
             return;
           } else
              alert.innerHtml = "";

          // ========================>>

          if ($('#weightIncludeThree').val() < 0 ||  $('#resultIncludeThree').val() < 0 || $('#weightExludeThree').val() < 0 || $("#resultExcludeThree") < 0) {

            alert.innerHTML = "Weights Cannot Be negative";
            alert.style.color = "red";
            valid = false;
            console.log("please fill in all required fields");
            $('body').removeClass('ui-loading');
            return;
            }
             else
               alert.innerHtml = "";

          // ========================>>

           var infoToSend = {

             TareWeight  :$('#VGM').val(),
             CargoWeight :  weightExludeThreePack1,
             CargoWeightTwo  : weightExludeThreePack2,
             CargoWeightThree : weightExludeThree,
             resultExcludeThree :VGMThree,
             VGM : weightIncludeThreePack1,
             VGMTwo  : weightIncludeThreePack2,
             VGMThree : weightIncludeThree,
             resultIncludeThree : CargoWeightThree,
             Temptale : $('#temptale').val()

           };

           for(var key in infoToSend) {

               if (infoToSend[key] == "" || infoToSend[key] == null)
               {
                 alert.innerHTML = "please fill in " + key;
                 alert.style.color = "red";
                 valid = false;
                 console.log("please fill in " + key);
                 $('body').removeClass('ui-loading');
                 return;
               }
               else
               {
                 valid = true;
                 //$('body').removeClass('ui-loading');
               }
           }

           // if all fields are set capture in database
           debugger;
           if(valid) {

            if ($("#tareThree option:selected").text() == "Yes")
                infoToSend.IncludesTareThree = true;
            else
                infoToSend.IncludesTareThree = false;

             infoToSend.key = "Pack3";
             infoToSend.ContainerNo = JSON.parse(localStorage.getItem("containerInfo")).ContainerNo;
             infoToSend.SealNo =  JSON.parse(localStorage.getItem("containerInfo")).SealNo;
             infoToSend.TotalVGM = (parseFloat(infoToSend.VGM) + parseFloat(infoToSend.VGMTwo) + parseFloat(infoToSend.VGMThree));
             infoToSend.TotalCargoWeight = (parseFloat(infoToSend.CargoWeight) + parseFloat(infoToSend.CargoWeightTwo) +  parseFloat(infoToSend.CargoWeightThree));
             localStorage.setItem("tempVGMInfoThree",JSON.stringify(infoToSend));
             infoToSend.UUID = deviceUUID;
             infoToSend.BookingReference = reference;
             infoToSend.BookingReferenceId = JSON.parse(localStorage.getItem("bookingAndId")).id;
             infoToSend.Status = "En Route to Pack Depot";
             infoToSend.Complete = false;
             infoToSend.DriverNumber = JSON.parse(localStorage.getItem("credentials")).driver_number_with_code;
             captureVGMDetails(infoToSend);
           }
        });

        // handle packDepotThree
debugger;
        switch (status) {

    case "Arrived At Second Pack Depot":

     $("#enrouteTopackDepotThreeDiv").css('display', 'block');
     $("#arrivedAtPackDepotThreeDiv").css('display', 'none');

     h3Status.innerHTML = "Arrived At Second Pack Depot";

   break;

          case "En Route To Third Pack Depot":

              $("#enrouteTopackDepotThreeDiv").css('display', 'none');
              $("#arrivedAtPackDepotThreeDiv").css('display', 'block');

              h3Status.innerHTML = "Arrived At Third Pack Depot";

            break;

          case "Arrived At Third Pack Depot":

             $("#arrivedAtPackDepotThreeDiv").css('display', 'none');
             $("#enrouteTopackDepotThreeDiv").css('display', 'none');
             //
             $("#VGMSectionThree").css('display', 'block');

             // set previous tare and temperature recording devices values and lock the values

             var VGMinfoThree = JSON.parse(localStorage.getItem("VGMinfoTwo"));

             if (VGMinfoThree != null) {

              var containerInfoToChange = JSON.parse(localStorage.getItem("containerInfo"));

              var originalVGMInfoThree  = JSON.parse(localStorage.getItem("VGMinfoTwo"));

              $("#arrivedAtPackDepotThreeDiv").fadeOut(500);
              $("#VGMSectionThree").fadeIn(1000);
              $("#VGMSectionThree #VGM").val(originalVGMInfoThree.TareWeight);
              $("#VGMSectionThree #temptale").val(originalVGMInfoThree.Temptale);
              $("#weightExludeThreePack1").val(originalVGMInfoThree.CargoWeight);
              $("#weightIncludeThreePack1").val(originalVGMInfoThree.VGM);
              $("#weightExludeThreePack2").val(originalVGMInfoThree.CargoWeightTwo);
              $("#weightIncludeThreePack2").val(originalVGMInfoThree.VGMTwo);
              $("#weightExludeThreePack3").val(originalVGMInfoThree.CargoWeightThree);
              $("#weightIncludeThreePack3").val(originalVGMInfoThree.VGMThree);
              // $("#resultExcludeThree").val(parseFloat(originalVGMInfoThree.TotalCargoWeight) + parseFloat(originalVGMInfoThree.TareWeight));
              // $("#resultIncludeThree").val(originalVGMInfoThree.TotalVGM);
              }
             $("#VGMSectionThree #VGM").removeClass('input-book');
             $("#VGMSectionThree #VGM").prop('readonly', false)

             if (JSON.parse(localStorage.getItem("VGMinfoThree")) != null) {

               var VGMinfoThree = JSON.parse(localStorage.getItem("VGMinfoThree"));

               $("#weightExludeThree").val(VGMinfoThree.CargoWeightThree);
               $("#weightIncludeThree").val(VGMinfoThree.VGMThree);
               $("#resultExcludeThree").val(VGMinfoThree.VGMThree);
               $("#resultIncludeThree").val($("#weightIncludeThree").val()-originalVGMInfoThree.TareWeight);
               $("#temptale").val(VGMinfoThree.Temptale);
             }
          break;
        }

        if (JSON.parse(localStorage.getItem("trippleLoad"))) {

          $("#packdepotThreeDiv").css('display', 'block');

          var currentBookingObj = JSON.parse(localStorage.getItem("currentBookingObj"));

          $("#packDepotThree_description").val(currentBookingObj.packingDepotThree);

        }


});

$(document).on("pageshow" , "#packDepotThree" , function() {

debugger;

var status = localStorage.getItem("status");
if (status == "Arrived At Third Pack Depot")
  document.getElementById("h3Status").innerHTML = status;

$('body').removeClass('ui-loading');

$("#backButtonCapture").bind("click",function() {
  // incase exists

  var status = localStorage.getItem("status");
    debugger;

    switch (status) {
      case "Arrived At Third Pack Depot":

      var respond  = confirm("Weight including and Excluding caputures will be deleted from storage");
      if (respond == true) {
         trackEventer("En Route To Third Pack Depot","Previous Task");
         } else
             return;
        break;

      case "En Route To Third Pack Depot":

              localStorage.setItem("FromThirdPack",true);
              trackEventer("Arrived At Second Pack Depot","Previous Task");

        break;

      case "Arrived At Second Pack Depot":

      if (JSON.parse(localStorage.getItem("trippleLoad")) && JSON.parse(localStorage.getItem("Weighbridge"))) {

        localStorage.setItem("FromThirdPack",true);
        trackEventer("En Route To Second Pack Depot","En Route To Previous Task");

      } else {
            localStorage.removeItem("fromTerminal");
            localStorage.setItem("FromThirdPack",true);
            NavigatePage("packLoadTwo.html");
        }
      break;

    }

});

$("#VGMSectionThree #VGM").keyup(function(event) {
  debugger;
  /* Act on the event */
 var checked = $( "#tareThree option:selected" ).text();
  if (checked == "No") {
     calcExclude();
  } else {
     calcInclude();
  }

});

$(".minus").keyup(function() { // handle arithmetic events
  debugger;
 calcExclude();
 });

 $(".add").keyup(function() { // handle arithmetic events
   debugger;
  calcInclude();
 });

 $("#tareThree").on("change",function(){
   debugger;
   var tare = this;
   var checked = $( "#tareThree option:selected" ).text();
   if(checked == "Yes")
   {
     $('#weightIncludeDivThree').slideDown('500');
     $('#weightExludeDivThree').slideUp('500');

   }
   else
   {
     //
     $('#weightExludeDivThree').slideDown('500');
     $('#weightIncludeDivThree').slideUp('500');
   }
 });

 // PREVENT ALL FORMS OF NEGATIVE VALUES FROM BEING ENTERED IN ///

 $("#VGM , #weightExludeTwo ,#weightIncludeTwo ,#resultExcludeTwo , #resultIncludeTwo,#weightExludeTwo ,#weightIncludeTwo ,#resultExcludeTwo , #resultIncludeTwo , #temptale , #temperatureRecordingDevice").keypress(function(event) {
   //debugger;
   if ( event.which == 45 || event.which == 69 ||  event.which == 188 || event.which == 44) {
       event.preventDefault();
    }

    $('#temptale').keypress(function (e) {
        var regex = new RegExp("^[a-zA-Z0-9]+$");
        var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (regex.test(str)) {
            return true;
        }

        e.preventDefault();
        return false;
    });


 });

 // handle comment sending

 $("#enrouteTopackDepotThreeDiv .sendCmt").click(function() {
   debugger;
   $('body').addClass('ui-loading');
   var status = localStorage.getItem("status");
   localStorage.setItem("fromComment",true);
   trackEventer(status,$("#enrouteTopackDepotThreeDiv textarea").val());
 });

 $("#arrivedAtPackDepotThreeDiv .sendCmt").click(function() {
   debugger;
   $('body').addClass('ui-loading');
   var status = localStorage.getItem("status");
   localStorage.setItem("fromComment",true);
   trackEventer(status,$("#arrivedAtPackDepotThreeDiv textarea").val());
 });


});
$(document).on("pagecreate" , "#packDepotFour" , function() {

debugger;


});

$(document).on("pageinit" , "#packDepotFour" , function() {

debugger;


});

$(document).on("pagebeforeshow" , "#packDepotFour" , function() {

debugger;
var h3Status = document.getElementById("h3Status");
    h3Status.innerHTML = "Left Third Pack Depot";

var status = localStorage.getItem("status");

        // intialize click events

        $("#enrouteTopackDepotFour").bind("click",function() {

          console.log("clicked");

          trackEventer("En Route To Forth Pack Depot", $("#enrouteTopackDepotFourDiv textarea").val());

        });

        $("#arrivedAtPackDepotFour").bind("click",function() {

          trackEventer("Arrived At Forth Pack Depot", $("#arrivedAtPackDepotFourDiv textarea").val());

        });


$('#VGMSectionFour #submit').click(function() {

            $('body').addClass('ui-loading');
          var originalVGMInfo  = JSON.parse(localStorage.getItem("VGMinfo"));
          debugger;
           var alert = document.getElementById("errorMgs");
           var valid = false;
           var reference = JSON.parse(localStorage.getItem("bookingAndId")).Bookingreference;
           var deviceUUID;

           var weightIncludeFour =   $('#weightIncludeFour').val();
           var CargoWeightFour =  $('#resultIncludeFour').val();
           var weightExludeFour = $('#weightExludeFour').val();
           var VGMFour = $('#resultExcludeFour').val();

           var weightExludeFourPack1 = $("#weightExludeFourPack1").val();
           var weightIncludeFourPack1 = $("#weightIncludeFourPack1").val();

           var weightExludeFourPack2 = $("#weightExludeFourPack2").val();
           var weightIncludeFourPack2 = $("#weightIncludeFourPack2").val();

           var weightExludeFourPack3 = $("#weightExludeFourPack3").val();
           var weightIncludeFourPack3 = $("#weightIncludeFourPack3").val();


           if(window.cordova.platformId == "browser")
             deviceUUID = "f3a62c91a1df6d1e";
           else
             deviceUUID = device.uuid;

           // set boolean

           // handle zero validations

           if ($("#tareFour option:selected").text() == "No")
            {


              if ($('#weightExludeFour').val() == ""  ||  $('#resultExcludeFour').val() == "" || $('#resultExcludeFour').val() == "0" || $('#weightExludeFour').val() == "0") {

                alert.innerHTML = "please fill in all required fields";
                alert.style.color = "red";
                valid = false;
                console.log("please fill in all required fields");
                $('body').removeClass('ui-loading');
                return;
                }
                 else
                  alert.innerHtml = "";
            }
          else
           {

             if ($('#weightIncludeFour').val() == ""  ||  $('#resultIncludeFour').val() == "" || $('#resultIncludeFour').val() == "0" || $('#weightExludeFour').val() == "0") {

               alert.innerHTML = "please fill in all required fields";
               alert.style.color = "red";
               valid = false;
               console.log("please fill in all required fields");
               $('body').removeClass('ui-loading');
               return;
               }
                else
                  alert.innerHtml = "";
           }

          //============================>>

          if ($('#VGM').val() == "" || $('#VGM').val() == "0" || $('#VGM').val() == undefined) {
            alert.innerHTML = "please fill in tare weight";
            alert.style.color = "red";
            valid = false;
            console.log("please fill in tare weight");
            $('body').removeClass('ui-loading');
            return;
          } else
             alert.innerHtml = "";

           //=================================>>

           if ($('#VGM').val() < 0) {
             alert.innerHTML = "Tare weight Cannot be negative";
             alert.style.color = "red";
             valid = false;
             console.log("Tare weight  in tare weight");
             $('body').removeClass('ui-loading');
             return;
           } else
              alert.innerHtml = "";

          // ========================>>

          if ($('#weightIncludeFour').val() < 0 ||  $('#resultIncludeFour').val() < 0 || $('#weightExludeFour').val() < 0 || $("#resultExcludeFour") < 0) {

            alert.innerHTML = "Weights Cannot Be negative";
            alert.style.color = "red";
            valid = false;
            console.log("please fill in all required fields");
            $('body').removeClass('ui-loading');
            return;
            }
             else
               alert.innerHtml = "";

          // ========================>>

           var infoToSend = {

             TareWeight  :$('#VGM').val(),
             CargoWeight :  weightExludeFourPack1,
             CargoWeightTwo  : weightExludeFourPack2,
             CargoWeightThree : weightExludeFourPack3,
             CargoWeightFour : weightExludeFour,
             resultExcludeFour :VGMFour,
             VGM : weightIncludeFourPack1,
             VGMTwo  : weightIncludeFourPack2,
             VGMThree: weightIncludeFourPack3,
             VGMFour: weightIncludeFour,
             resultIncludeFour : CargoWeightFour,
             Temptale : $('#temptale').val()

           };

           for(var key in infoToSend) {

               if (infoToSend[key] == "" || infoToSend[key] == null)
               {
                 alert.innerHTML = "please fill in " + key;
                 alert.style.color = "red";
                 valid = false;
                 console.log("please fill in " + key);
                 $('body').removeClass('ui-loading');
                 return;
               }
               else
               {
                 valid = true;
                 //$('body').removeClass('ui-loading');
               }
           }

           // if all fields are set capture in database
           debugger;
           if(valid) {

            if ($("#tareFour option:selected").text() == "Yes")
                infoToSend.IncludesTareFour = true;
            else
                infoToSend.IncludesTareFour = false;

             infoToSend.key = "Pack4";
             infoToSend.ContainerNo = JSON.parse(localStorage.getItem("containerInfo")).ContainerNo;
             infoToSend.SealNo =  JSON.parse(localStorage.getItem("containerInfo")).SealNo;
             infoToSend.TotalVGM = (parseFloat(infoToSend.VGM) + parseFloat(infoToSend.VGMTwo) + parseFloat(infoToSend.VGMThree) + parseFloat(infoToSend.VGMFour));
             infoToSend.TotalCargoWeight = (parseFloat(infoToSend.CargoWeight) + parseFloat(infoToSend.CargoWeightTwo) +  parseFloat(infoToSend.CargoWeightThree) + parseFloat(infoToSend.CargoWeightFour));
             localStorage.setItem("tempVGMInfoFour",JSON.stringify(infoToSend));
             infoToSend.UUID = deviceUUID;
             infoToSend.BookingReference = reference;
             infoToSend.Status = "En Route to Pack Depot";
             infoToSend.Complete = false;
             infoToSend.DriverNumber = JSON.parse(localStorage.getItem("credentials")).driver_number_with_code;
             captureVGMDetails(infoToSend);
           }
        });

        // handle packDepotThree
debugger;
        switch (status) {

    case "Arrived At Third Pack Depot":

     $("#enrouteTopackDepotFourDiv").css('display', 'block');
     $("#arrivedAtPackDepotFourDiv").css('display', 'none');

     h3Status.innerHTML = "Arrived At Third Pack Depot";

   break;

          case "En Route To Forth Pack Depot":

              $("#enrouteTopackDepotFourDiv").css('display', 'none');
              $("#arrivedAtPackDepotFourDiv").css('display', 'block');

              h3Status.innerHTML = "Arrived At Third Pack Depot";

            break;

          case "Arrived At Forth Pack Depot":

             $("#arrivedAtPackDepotFourDiv").css('display', 'none');
             $("#enrouteTopackDepotFourDiv").css('display', 'none');
             //
             $("#VGMSectionFour").css('display', 'block');

             // set previous tare and temperature recording devices values and lock the values

             var originalVGMInfoFour = JSON.parse(localStorage.getItem("VGMinfoThree"));

             if (originalVGMInfoFour != null) {

              var containerInfoToChange = JSON.parse(localStorage.getItem("containerInfo"));

              $("#arrivedAtPackDepotFourDiv").fadeOut(500);
              $("#VGMSectionFour").fadeIn(1000);
              $("#VGMSectionFour #VGM").val(originalVGMInfoFour.TareWeight);
              $("#VGMSectionFour #temptale").val(originalVGMInfoFour.Temptale);
              $("#weightExludeFourPack1").val(originalVGMInfoFour.CargoWeight);
              $("#weightIncludeFourPack1").val(originalVGMInfoFour.VGM);
              $("#weightExludeFourPack2").val(originalVGMInfoFour.CargoWeightTwo);
              $("#weightIncludeFourPack2").val(originalVGMInfoFour.VGMTwo);
              $("#weightExludeFourPack3").val(originalVGMInfoFour.CargoWeightThree);
              $("#weightIncludeFourPack3").val(originalVGMInfoFour.VGMThree);
              $("#resultExcludeFour").val(parseFloat(originalVGMInfoFour.TotalCargoWeight) + parseFloat(originalVGMInfoFour.TareWeight));
              $("#resultIncludeFour").val(originalVGMInfoFour.TotalVGM);

             $("#VGMSectionFour #VGM").removeClass('input-book');
             $("#VGMSectionFour #VGM").prop('readonly', false)
              }
             if (JSON.parse(localStorage.getItem("VGMinfoFour")) != null) {

               var VGMinfoFour = JSON.parse(localStorage.getItem("VGMinfoFour"));

               $("#weightExludeFour").val(VGMinfoFour.CargoWeightFour);
               $("#weightIncludeFour").val(VGMinfoFour.VGMFour);
               $("#resultExcludeFour").val(VGMinfoFour.VGMFour);
               $("#resultIncludeFour").val(VGMinfoFour.CargoWeightFour);
               $("#temptale").val(VGMinfoFour.Temptale);
             }
          break;
        }

        if (JSON.parse(localStorage.getItem("fourLoad"))) {

          $("#packdepotFourDiv").css('display', 'block');

          var currentBookingObj = JSON.parse(localStorage.getItem("currentBookingObj"));

          $("#packDepotFour_description").val(currentBookingObj.packingDepotFour);

        }



});

$(document).on("pageshow" , "#packDepotFour" , function() {

debugger;

var status = localStorage.getItem("status");
if (status == "Arrived At Third Pack Depot")
  document.getElementById("h3Status").innerHTML = status;

$('body').removeClass('ui-loading');

$("#backButtonCapture").bind("click",function() {
  // incase exists

  var status = localStorage.getItem("status");
    debugger;

    switch (status) {
      case "Arrived At Forth Pack Depot":

      var respond  = confirm("Weight including and Excluding caputures will be deleted from storage");
      if (respond == true) {
         trackEventer("En Route To Forth Pack Depot","Previous Task");
         } else
             return;
        break;

      case "En Route To Forth Pack Depot":

              localStorage.setItem("FromThirdPack",true);
              trackEventer("Arrived At Third Pack Depot","Previous Task");

        break;

      case "Arrived At Third Pack Depot":

      if (JSON.parse(localStorage.getItem("fourLoad")) && JSON.parse(localStorage.getItem("Weighbridge"))) {

        localStorage.setItem("FromForthPack",true);
        trackEventer("En Route To Third Pack Depot","En Route To Previous Task");

      } else {
            localStorage.removeItem("fromTerminal");
            localStorage.setItem("FromForthPack",true);
            NavigatePage("packLoadThree.html");
        }
      break;

    }

});

$("#VGMSectionFour #VGM").keyup(function(event) {
  debugger;
  /* Act on the event */
 var checked = $( "#tareFour option:selected" ).text();
  if (checked == "No") {
     calcExclude();
  } else {
     calcInclude();
  }

});

$(".minus").keyup(function() { // handle arithmetic events
  debugger;
 calcExclude();
 });

 $(".add").keyup(function() { // handle arithmetic events
   debugger;
  calcInclude();
 });

 $("#tareFour").on("change",function(){
   debugger;
   var tare = this;
   var checked = $( "#tareFour option:selected" ).text();
   if(checked == "Yes")
   {
     $('#weightIncludeDivFour').slideDown('500');
     $('#weightExludeDivFour').slideUp('500');

   }
   else
   {
     //
     $('#weightExludeDivFour').slideDown('500');
     $('#weightIncludeDivFour').slideUp('500');
   }
 });

 // PREVENT ALL FORMS OF NEGATIVE VALUES FROM BEING ENTERED IN ///

 $("#VGM , #weightExludeTwo ,#weightIncludeTwo ,#resultExcludeTwo , #resultIncludeTwo,#weightExludeTwo ,#weightIncludeTwo ,#resultExcludeTwo , #resultIncludeTwo , #temptale , #temperatureRecordingDevice").keypress(function(event) {
   //debugger;
   if ( event.which == 45 || event.which == 69 ||  event.which == 188 || event.which == 44) {
       event.preventDefault();
    }

    $('#temptale').keypress(function (e) {
        var regex = new RegExp("^[a-zA-Z0-9]+$");
        var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (regex.test(str)) {
            return true;
        }

        e.preventDefault();
        return false;
    });


 });

 // handle comment sending

 $("#enrouteTopackDepotFourDiv .sendCmt").click(function() {
   debugger;
   $('body').addClass('ui-loading');
   var status = localStorage.getItem("status");
   localStorage.setItem("fromComment",true);
   trackEventer(status,$("#enrouteTopackDepotFourDiv textarea").val());
 });

 $("#arrivedAtPackDepotFourDiv .sendCmt").click(function() {
   debugger;
   $('body').addClass('ui-loading');
   var status = localStorage.getItem("status");
   localStorage.setItem("fromComment",true);
   trackEventer(status,$("#arrivedAtPackDepotFourDiv textarea").val());
 });


});
$(document).on("pagecreate" , "#packDepotFive" , function() {

debugger;


});

$(document).on("pageinit" , "#packDepotFive" , function() {

debugger;


});

$(document).on("pagebeforeshow" , "#packDepotFive" , function() {

debugger;
var h3Status = document.getElementById("h3Status");
    h3Status.innerHTML = "Left Forth Pack Depot";

var status = localStorage.getItem("status");

        // intialize click events

        $("#enrouteTopackDepotFive").bind("click",function() {

          console.log("clicked");

          trackEventer("En Route To Fifth Pack Depot", $("#enrouteTopackDepotFiveDiv textarea").val());

        });

        $("#arrivedAtPackDepotFive").bind("click",function() {

          trackEventer("Arrived At Fifth Pack Depot", $("#arrivedAtPackDepotFiveDiv textarea").val());

        });


$('#VGMSectionFive #submit').click(function() {

            $('body').addClass('ui-loading');
          var originalVGMInfo  = JSON.parse(localStorage.getItem("VGMinfo"));
          debugger;
           var alert = document.getElementById("errorMgs");
           var valid = false;
           var reference = JSON.parse(localStorage.getItem("bookingAndId")).Bookingreference;
           var deviceUUID;

           var weightIncludeFive =   $('#weightIncludeFive').val();
           var CargoWeightFive =  $('#resultIncludeFive').val();
           var weightExludeFive = $('#weightExludeFive').val();
           var VGMFive = $('#resultExcludeFive').val();

           var weightExludeFivePack1 = $("#weightExludeFivePack1").val();
           var weightIncludeFivePack1 = $("#weightIncludeFivePack1").val();

           var weightExludeFivePack2 = $("#weightExludeFivePack2").val();
           var weightIncludeFivePack2 = $("#weightIncludeFivePack2").val();

           var weightExludeFivePack3 = $("#weightExludeFivePack3").val();
           var weightIncludeFivePack3 = $("#weightIncludeFivePack3").val();

           var weightExludeFivePack4 = $("#weightExludeFivePack4").val();
           var weightIncludeFivePack4 = $("#weightIncludeFivePack4").val();


           if(window.cordova.platformId == "browser")
             deviceUUID = "f3a62c91a1df6d1e";
           else
             deviceUUID = device.uuid;

           // set boolean

           // handle zero validations

           if ($("#tareFive option:selected").text() == "No")
            {


              if ($('#weightExludeFive').val() == ""  ||  $('#resultExcludeFive').val() == "" || $('#resultExcludeFive').val() == "0" || $('#weightExludeFive').val() == "0") {

                alert.innerHTML = "please fill in all required fields";
                alert.style.color = "red";
                valid = false;
                console.log("please fill in all required fields");
                $('body').removeClass('ui-loading');
                return;
                }
                 else
                  alert.innerHtml = "";
            }
          else
           {

             if ($('#weightIncludeFive').val() == ""  ||  $('#resultIncludeFive').val() == "" || $('#resultIncludeFive').val() == "0" || $('#weightExludeFive').val() == "0") {

               alert.innerHTML = "please fill in all required fields";
               alert.style.color = "red";
               valid = false;
               console.log("please fill in all required fields");
               $('body').removeClass('ui-loading');
               return;
               }
                else
                  alert.innerHtml = "";
           }

          //============================>>

          if ($('#VGM').val() == "" || $('#VGM').val() == "0" || $('#VGM').val() == undefined) {
            alert.innerHTML = "please fill in tare weight";
            alert.style.color = "red";
            valid = false;
            console.log("please fill in tare weight");
            $('body').removeClass('ui-loading');
            return;
          } else
             alert.innerHtml = "";

           //=================================>>

           if ($('#VGM').val() < 0) {
             alert.innerHTML = "Tare weight Cannot be negative";
             alert.style.color = "red";
             valid = false;
             console.log("Tare weight  in tare weight");
             $('body').removeClass('ui-loading');
             return;
           } else
              alert.innerHtml = "";

          // ========================>>

          if ($('#weightIncludeFive').val() < 0 ||  $('#resultIncludeFive').val() < 0 || $('#weightExludeFive').val() < 0 || $("#resultExcludeFive") < 0) {

            alert.innerHTML = "Weights Cannot Be negative";
            alert.style.color = "red";
            valid = false;
            console.log("please fill in all required fields");
            $('body').removeClass('ui-loading');
            return;
            }
             else
               alert.innerHtml = "";

          // ========================>>

           var infoToSend = {

             TareWeight  :$('#VGM').val(),
             CargoWeight :  weightExludeFivePack1,
             CargoWeightTwo  : weightExludeFivePack2,
             CargoWeightThree : weightExludeFivePack3,
             CargoWeightFour : weightExludeFivePack4,
             CargoWeightFive : weightExludeFive,
             resultExcludeFive :VGMFive,
             VGM : weightIncludeFivePack1,
             VGMTwo  : weightIncludeFivePack2,
             VGMThree: weightIncludeFivePack3,
             VGMFour: weightIncludeFivePack4,
             VGMFive: weightIncludeFive,
             resultIncludeFive : CargoWeightFive,
             Temptale : $('#temptale').val()

           };

           for(var key in infoToSend) {

               if (infoToSend[key] == "" || infoToSend[key] == null)
               {
                 alert.innerHTML = "please fill in " + key;
                 alert.style.color = "red";
                 valid = false;
                 console.log("please fill in " + key);
                 $('body').removeClass('ui-loading');
                 return;
               }
               else
               {
                 valid = true;
                 //$('body').removeClass('ui-loading');
               }
           }

           // if all fields are set capture in database
           debugger;
           if(valid) {

            if ($("#tareFive option:selected").text() == "Yes")
                infoToSend.IncludesTareFive = true;
            else
                infoToSend.IncludesTareFive = false;

             infoToSend.key = "Pack5";
             infoToSend.ContainerNo = JSON.parse(localStorage.getItem("containerInfo")).ContainerNo;
             infoToSend.SealNo =  JSON.parse(localStorage.getItem("containerInfo")).SealNo;
             infoToSend.TotalVGM = (parseFloat(infoToSend.VGM) + parseFloat(infoToSend.VGMTwo) + parseFloat(infoToSend.VGMThree) + parseFloat(infoToSend.VGMFive));
             infoToSend.TotalCargoWeight = (parseFloat(infoToSend.CargoWeight) + parseFloat(infoToSend.CargoWeightTwo) +  parseFloat(infoToSend.CargoWeightThree) + parseFloat(infoToSend.CargoWeightFive));
             localStorage.setItem("tempVGMInfoFive",JSON.stringify(infoToSend));
             infoToSend.UUID = deviceUUID;
             infoToSend.BookingReference = reference;
             infoToSend.Status = "En Route to Pack Depot";
             infoToSend.Complete = false;
             infoToSend.DriverNumber = JSON.parse(localStorage.getItem("credentials")).driver_number_with_code;
             captureVGMDetails(infoToSend);
           }
        });

        // handle packDepotThree
debugger;
        switch (status) {

    case "Arrived At Forth Pack Depot":

     $("#enrouteTopackDepotFiveDiv").css('display', 'block');
     $("#arrivedAtPackDepotFiveDiv").css('display', 'none');

     h3Status.innerHTML = "Arrived At Forth Pack Depot";

   break;

          case "En Route To Fifth Pack Depot":

              $("#enrouteTopackDepotFiveDiv").css('display', 'none');
              $("#arrivedAtPackDepotFiveDiv").css('display', 'block');

              h3Status.innerHTML = "Arrived At Forth Pack Depot";

            break;

          case "Arrived At Fifth Pack Depot":

             $("#arrivedAtPackDepotFiveDiv").css('display', 'none');
             $("#enrouteTopackDepotFiveDiv").css('display', 'none');
             //
             $("#VGMSectionFive").css('display', 'block');

             // set previous tare and temperature recording devices values and lock the values

             var originalVGMInfofour = JSON.parse(localStorage.getItem("VGMinfoFour"));

             if (originalVGMInfofour != null) {

              var containerInfoToChange = JSON.parse(localStorage.getItem("containerInfo"));

              $("#arrivedAtPackDepotFiveDiv").fadeOut(500);
              $("#VGMSectionFive").fadeIn(1000);
              $("#VGMSectionFive #VGM").val(originalVGMInfofour.TareWeight);
              $("#VGMSectionFive #temptale").val(originalVGMInfofour.Temptale);
              $("#weightExludeFivePack1").val(originalVGMInfofour.CargoWeight);
              $("#weightIncludeFivePack1").val(originalVGMInfofour.VGM);
              $("#weightExludeFivePack2").val(originalVGMInfofour.CargoWeightTwo);
              $("#weightIncludeFivePack2").val(originalVGMInfofour.VGMTwo);
              $("#weightExludeFivePack3").val(originalVGMInfofour.CargoWeightThree);
              $("#weightIncludeFivePack3").val(originalVGMInfofour.VGMThree);
              $("#weightExludeFivePack4").val(originalVGMInfofour.CargoWeightFour);
              $("#weightIncludeFivePack4").val(originalVGMInfofour.VGMFour);
              $("#resultExcludeFive").val(parseFloat(originalVGMInfofour.TotalCargoWeight) + parseFloat(originalVGMInfofour.TareWeight));
              $("#resultIncludeFive").val(originalVGMInfofour.TotalVGM);

             $("#VGMSectionFive #VGM").removeClass('input-book');
             $("#VGMSectionFive #VGM").prop('readonly', false)
              }
             if (JSON.parse(localStorage.getItem("VGMinfoFive")) != null) {

               var VGMinfoFive = JSON.parse(localStorage.getItem("VGMinfoFive"));

               $("#weightExludeFive").val(VGMinfoFive.CargoWeightFive);
               $("#weightIncludeFive").val(VGMinfoFive.VGMFive);
               $("#resultExcludeFive").val(VGMinfoFive.VGMFive);
               $("#resultIncludeFive").val(VGMinfoFive.CargoWeightFive);
               $("#temptale").val(VGMinfoFive.Temptale);
             }
          break;
        }
debugger;
        if (JSON.parse(localStorage.getItem("fiveLoad"))) {

          $("#packdepotFiveDiv").css('display', 'block');

          var currentBookingObj = JSON.parse(localStorage.getItem("currentBookingObj"));

          $("#packDepotFive_description").val(currentBookingObj.packingDepotFive);

        }



});

$(document).on("pageshow" , "#packDepotFive" , function() {

debugger;

var status = localStorage.getItem("status");
if (status == "Arrived At Third Pack Depot")
  document.getElementById("h3Status").innerHTML = status;

$('body').removeClass('ui-loading');

$("#backButtonCapture").bind("click",function() {
  // incase exists

  var status = localStorage.getItem("status");
    debugger;

    switch (status) {
      case "Arrived At Fifth Pack Depot":

      var respond  = confirm("Weight including and Excluding caputures will be deleted from storage");
      if (respond == true) {
         trackEventer("En Route To Fifth Pack Depot","Previous Task");
         } else
             return;
        break;

      case "En Route To Fifth Pack Depot":

              localStorage.setItem("FromFifthPack",true);
              trackEventer("Arrived At Forth Pack Depot","Previous Task");

        break;

      case "Arrived At Forth Pack Depot":

      if (JSON.parse(localStorage.getItem("fourLoad")) && JSON.parse(localStorage.getItem("Weighbridge"))) {

        localStorage.setItem("FromFifthPack",true);
        trackEventer("En Route To Forth Pack Depot","En Route To Previous Task");

      } else {
            localStorage.removeItem("fromTerminal");
            localStorage.setItem("FromFifthPack",true);
            NavigatePage("packLoadFour.html");
        }
      break;

    }

});

$("#VGMSectionFive #VGM").keyup(function(event) {
  debugger;
  /* Act on the event */
 var checked = $( "#tareFive option:selected" ).text();
  if (checked == "No") {
     calcExclude();
  } else {
     calcInclude();
  }

});

$(".minus").keyup(function() { // handle arithmetic events
  debugger;
 calcExclude();
 });

 $(".add").keyup(function() { // handle arithmetic events
   debugger;
  calcInclude();
 });

 $("#tareFive").on("change",function(){
   debugger;
   var tare = this;
   var checked = $( "#tareFive option:selected" ).text();
   if(checked == "Yes")
   {
     $('#weightIncludeDivFive').slideDown('500');
     $('#weightExludeDivFive').slideUp('500');

   }
   else
   {
     //
     $('#weightExludeDivFive').slideDown('500');
     $('#weightIncludeDivFive').slideUp('500');
   }
 });

 // PREVENT ALL FORMS OF NEGATIVE VALUES FROM BEING ENTERED IN ///

 $("#VGM , #weightExludeTwo ,#weightIncludeTwo ,#resultExcludeTwo , #resultIncludeTwo,#weightExludeTwo ,#weightIncludeTwo ,#resultExcludeTwo , #resultIncludeTwo , #temptale , #temperatureRecordingDevice").keypress(function(event) {
   //debugger;
   if ( event.which == 45 || event.which == 69 ||  event.which == 188 || event.which == 44) {
       event.preventDefault();
    }

    $('#temptale').keypress(function (e) {
        var regex = new RegExp("^[a-zA-Z0-9]+$");
        var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (regex.test(str)) {
            return true;
        }

        e.preventDefault();
        return false;
    });


 });

 // handle comment sending

 $("#enrouteTopackDepotiverDiv .sendCmt").click(function() {
   debugger;
   $('body').addClass('ui-loading');
   var status = localStorage.getItem("status");
   localStorage.setItem("fromComment",true);
   trackEventer(status,$("#enrouteTopackDepotFiveDiv textarea").val());
 });

 $("#arrivedAtPackDepotFiveDiv .sendCmt").click(function() {
   debugger;
   $('body').addClass('ui-loading');
   var status = localStorage.getItem("status");
   localStorage.setItem("fromComment",true);
   trackEventer(status,$("#arrivedAtPackDepotFiveDiv textarea").val());
 });


});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                    END OF DEPOTS FUNCTIONALITY                                                                                                  //
//                                                    WEIGHBRIDGE SECTION COMMENCE                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).on("pageinit" , "#weighBridge" , function() {

debugger;


});

$(document).on("pagebeforeshow" , "#weighBridge" , function() {

debugger;

// handle instances

      $("#enRouteToWeighBridge").bind('click',function() {

      trackEventer("En Route To Weighbridge", $('#enRouteToWeighBridgeDiv textarea').val());

      });

      $("#arrivedAtWeighBridge").bind('click',function() {

        trackEventer("Arrived At Weighbridge", $("#arrivedAtWeighBridgeDiv textarea").val());

      });

      $("#weighBridgeSection #submit").bind('click',function() {


         console.log("fired");
      });

      $('#backButtonCaptureWeigh').click(function(event) {
        debugger;
       var status = localStorage.getItem("status");

       switch (status) {

          case "Arrived At Pack Depot":

            localStorage.removeItem("VGMinfo");
            localStorage.setItem("fromWeighBridge",true);
            trackEventer("En Route to Pack Depot","Previous task");

            break;

          case "En Route To Weighbridge":

          if (JSON.parse(localStorage.getItem("trippleLoad")) && JSON.parse(localStorage.getItem("Weighbridge")))
          {
            localStorage.setItem("fromWeighBridge",true);
            trackEventer("Arrived At Third Pack Depot","En Route To Previous Task")   // go back to Third depot stuff
          }
          else if (JSON.parse(localStorage.getItem("dualLoad")) && JSON.parse(localStorage.getItem("Weighbridge")))
          {
            localStorage.setItem("fromWeighBridge",true);
            trackEventer("Arrived At Second Pack Depot","En Route To Previous Task") // go back to second depot stuff
          } else {
          localStorage.setItem("fromWeighBridge",true);
          trackEventer("Arrived At Pack Depot","Previous task");

        }
        break;

        case "Arrived At Second Pack Depot":

        localStorage.setItem("fromWeighBridge",true);
        trackEventer("En Route To Second Pack Depot","En Route To Previous Task") // go back to second depot stuff

        break;

          case "Arrived At Third Pack Depot":

          localStorage.setItem("fromWeighBridge",true);
          trackEventer("En Route To Third Pack Depot","En Route To Previous Task") // go back to Third depot stuff

          break;

          case "Arrived At Forth Pack Depot":

          localStorage.setItem("fromWeighBridge",true);
          trackEventer("En Route To Forth Pack Depot","En Route To Previous Task") // go back to Third depot stuff

          break;

          case "Arrived At Fifth Pack Depot":

          localStorage.setItem("fromWeighBridge",true);
          trackEventer("En Route To Fifth Pack Depot","En Route To Previous Task") // go back to Third depot stuff

          break;



        }


      });

      if (JSON.parse(localStorage.getItem("fromCaptureBookings"))) {

          $("#enRouteToWeighBridgeDiv").css('display', 'none');
          $("#arrivedAtWeighBridgeDiv").css('display', 'block');
          localStorage.removeItem("fromCaptureBookings");

      }
});

$(document).on("pageshow" , "#weighBridge" , function() {
debugger;


var status = localStorage.getItem("status")

    switch (status) {

      case "En Route To Weighbridge":
        $("#enRouteToWeighBridgeDiv").css('display', 'none');
        $("#arrivedAtWeighBridgeDiv").css('display', 'block');
        localStorage.removeItem("homeButtonFired");
        break;

    }

// if localStorages exists clear out

localStorage.removeItem("VGMinfo");

var status = localStorage.getItem('status');
var h3Status = document.getElementById('h3Status').innerHTML = "Status : " + status;


$('body').removeClass('ui-loading');

// set weighBridge Name

var currentBookings = JSON.parse(localStorage.getItem("currentBookingObj"));
$("#weighbride_description").val(currentBookings.weighbridgeName);


 // handle comment sending section  ///  =====>>>

 $("#enRouteToWeighBridgeDiv .sendCmt").click(function() {
   debugger;
   $('body').addClass('ui-loading');
   var status = localStorage.getItem("status");
   localStorage.setItem("fromComment",true);
   trackEventer(status,$("#enRouteToWeighBridgeDiv textarea").val());
 });

 $("#arrivedAtWeighBridgeDiv .sendCmt").click(function() {
   debugger;
   $('body').addClass('ui-loading');
   var status = localStorage.getItem("status");
   localStorage.setItem("fromComment",true);
   trackEventer(status,$("#arrivedAtWeighBridgeDiv textarea").val());
 });


 // handle comment sending section  ///  =====>>>

});

$(document).on("pageinit", "#terminal", function () {

debugger;

});

$(document).on("pagebeforeshow", "#terminal", function () {

  debugger;

  var status = localStorage.getItem("status");
  var headerStatus = document.getElementById("h3Status");
  headerStatus.innerHTML = status;

  // handling comment sending ONLY !!!

  $("#enRouteToTerminalDiv .sendCmt").click(function() {
    debugger;
    $('body').addClass('ui-loading');
    var status = localStorage.getItem("status");
    localStorage.setItem("fromComment",true);
    trackEventer(status,$("#enRouteToTerminalDiv textarea").val());
  });

  $("#arrivedAtTerminalDiv .sendCmt").click(function() {
    debugger;
    $('body').addClass('ui-loading');
    var status = localStorage.getItem("status");
    localStorage.setItem("fromComment",true);
    trackEventer(status,$("#arrivedAtTerminalDiv textarea").val());
  });

  $("#containerOffLoadedDiv .sendCmt").click(function() {
    debugger;
    $('body').addClass('ui-loading');
    var status = localStorage.getItem("status");
    localStorage.setItem("fromComment",true);
    trackEventer(status,$("#containerOffLoadedDiv textarea").val());
  });

});

$(document).on("pageshow", "#terminal", function () {

  $('body').removeClass('ui-loading');
debugger;

// get terminal description

var bookingsToUse  = JSON.parse(localStorage.getItem("currentBookings"));
var booking = JSON.parse(localStorage.getItem("bookingAndId"));


for (var i = 0; i < bookingsToUse.length; i++) {
    debugger;
    if (booking.Bookingreference == bookingsToUse[i]["bookingRef"] && booking.id == bookingsToUse[i]["ID"])
    {
        console.log("getting terminal description");
        //
        $("#terminal_description").val(bookingsToUse[i]["teriminalDescriptopn"]);
    }   // check for new booking
}

var status = localStorage.getItem("status");
// headerStatus.innerHTML = status;

  switch (status) {

      case "Arrived At Pack Depot":

      $('#enRouteToTerminalDiv').css('display', 'block');

      break;

    case "En Route To Terminal":

        $('#enRouteToTerminalDiv').css('display', 'none');
        $('#arrivedAtTerminalDiv').css('display', 'block');

    break;

    case "Arrived At Terminal":

        $('#enRouteToTerminalDiv').css('display', 'none');
        $('#arrivedAtTerminalDiv').css('display', 'none');
        $('#containerOffLoadedDiv').css('display', 'block');

        break;
  }

  // handle events

  $("#enRouteToTerminal").click(function() {

  trackEventer("En Route To Terminal",  $("#enRouteToTerminalDiv textarea").val());

  });

  $("#arrivedAtTerminal").click(function() {

  trackEventer("Arrived At Terminal" , $("#arrivedAtTerminalDiv textarea").val());

  });

  $("#containerOffLoaded").click(function() {
  debugger;
  // resend object
  $('body').addClass('ui-loading');
  var bookingAndId = JSON.parse(localStorage.getItem("bookingAndId"));
  var finalTrip = {};
  if (JSON.parse(localStorage.getItem("Weighbridge")) == false) {
    if (localStorage.getItem("VGMinfoFive")!= null) {

    }
    else if (localStorage.getItem("VGMinfoFive")!= null)
    {
       finalTrip = JSON.parse(localStorage.getItem("VGMinfoFive"));
       console.log("Send Weights for five loads")
    }
    else if (localStorage.getItem("VGMinfoFour")!= null)
    {
       finalTrip = JSON.parse(localStorage.getItem("VGMinfoFour"));
       console.log("Send Weights for four loads")
    }
    else if (localStorage.getItem("VGMinfoThree")!= null)
    {
       finalTrip = JSON.parse(localStorage.getItem("VGMinfoThree"));
       console.log("Send Weights for three loads")
    }
    else if (localStorage.getItem("VGMinfoTwo")!= null)
    {
        finalTrip = JSON.parse(localStorage.getItem("VGMinfoTwo"));
        console.log("Send Weights for two loads")
    }
    else if (localStorage.getItem("VGMinfo")!= null)
    {
        finalTrip = JSON.parse(localStorage.getItem("VGMinfo"));
        console.log("Send Weights for one load")
    }
  }

      finalTrip.Complete = true;
      finalTrip.UUID = JSON.parse(localStorage.getItem("credentials")).UUID;
      finalTrip.BookingReference = bookingAndId.Bookingreference;
      finalTrip.BookingReferenceId = bookingAndId.id;
      finalTrip.Status = "En Route to Pack Depot";
      localStorage.setItem("containerOffloaded",true); // sort incase of poor connectivity

  ajaxPostSend("Capture" , successVGM , true , JSON.stringify(finalTrip));
  });

  $('#goHome').click(function() {

        NavigatePage("booking.html");
        localStorage.setItem("homeButtonFired",true);
      });

      $('#backButtonCapture').click(function() {
        debugger;
        var currentStatus = localStorage.getItem("status")

        switch (currentStatus) {
          case "Arrived At Pack Depot":

          if (JSON.parse(localStorage.getItem("dualLoad"))) {
              NavigatePage("packLoadTwo.html");
              localStorage.setItem("status","Arrived At Second Pack Depot");
          }
          else
              NavigatePage("captureBookings.html");

          localStorage.setItem("fromTerminal",true);

            break;
          case "Arrived At Second Pack Depot":

            NavigatePage("packLoadTwo.html");
            localStorage.setItem("fromTerminal",true);
          break;

          case "Arrived At Third Pack Depot":

            NavigatePage("packLoadThree.html");
            localStorage.setItem("fromTerminal",true);
          break;

          case "Arrived At Forth Pack Depot":

            NavigatePage("packLoadFour.html");
            localStorage.setItem("fromTerminal",true);
          break;

          case "Arrived At Fifth Pack Depot":

            NavigatePage("packLoadFive.html");
            localStorage.setItem("fromTerminal",true);
          break;

          case "Arrived At Weighbridge":

            localStorage.setItem("fromTerminal",true);
            NavigatePage("captureBookings.html");

          break;

          default:
          localStorage.setItem("fromTerminal",true);
             var currentStatus = localStorage.getItem("status");
             var previousStatus = "";
               for (var i = 0; i < events.length; i++) {
                 if(currentStatus == events[i]) {
                      previousStatus = events[i - 1];
                      trackEventer(previousStatus,"En route to previous step");
                    }
                }
              }
      });

});

$(document).on("init", "#cto", function () {

debugger;

});

$(document).on("pagebeforeshow", "#cto", function () {

debugger;

var ctoInformationObj = JSON.parse(localStorage.getItem("currentBookings"));
var ctoInformation = {};
    ctoInformation = ctoInformationObj[0];
// Handle Cto information
$("#Exporter").val(ctoInformation.Exporter);
$("#ClientRef").val(ctoInformation.Client_Ref);
$("#ContainerOperator").val(ctoInformation.Container_Operator);
$("#VesselName").val(ctoInformation.Vessel_Name);
$("#VoyageNumber").val(ctoInformation.Voyage_Number);
$("#PortOfLoading").val(ctoInformation.Port_of_Loading);
$("#PortOfDischarge").val(ctoInformation.Port_of_Discharge);

// Container Settings

$("#containerSize").val(ctoInformation.Container_Size);
$("#Commodity").val(ctoInformation.Commodity);
$("#temperateCode").val(ctoInformation.Temperature_Code);
$("#temperateSetting").val(ctoInformation.Temperature_Setting);
$("#VentSettings").val(ctoInformation.Vent_Settings);

});

$(document).on("pageshow", "#cto", function () {
debugger

$("#sendCto").click(function(){

// declarations and collections

var ctoInformationObj = JSON.parse(localStorage.getItem("currentBookings"));
var ctoInformation = {};
    ctoInformation = ctoInformationObj[0];

var postData = {};

postData.DriverNumber = JSON.parse(localStorage.getItem("credentials")).driver_number_with_code;
postData.BookingReference = JSON.parse(localStorage.getItem("currentBookingObj")).bookingRef;

postData.Exporter = ctoInformation.Exporter;
postData.Client_Ref = ctoInformation.Client_Ref;
postData.Container_Operator = ctoInformation.Container_Operator;
postData.Vessel_Name = ctoInformation.Vessel_Name;
postData.Voyage_Number = ctoInformation.Voyage_Number;
postData.Port_of_Loading = ctoInformation.Port_of_Loading;
postData.Port_of_Discharge = ctoInformation.Port_of_Discharge;

postData.Status = "Cto";


  debugger;
  $('body').addClass('ui-loading');

  $.ajax({

      url: endpoint + "Capture",
      type: "POST",
      data: JSON.stringify(postData),
      dataType: "json",
      timeout: 30000,
      async:false,
      contentType: "application/json",
      success: emailNotificationSuccess,
      error: function (jqXHR, textStatus, errorThrown) {

        alert("There is a technical problem please try again later..");
        $('body').removeClass('ui-loading'); console.log(errorThrown);
        console.log(errorThrown); }

  });


})

});

$(document).on("pageinit", "#handlePush", function () {

debugger;

});

$(document).on("pagebeforeshow", "#handlePush", function () {

debugger;

var newData = JSON.parse(localStorage.getItem("newBookingRequest"));
// alert("New booking Request");
console.log("Map");
//
$("#transBooking").val(newData.BReference);
$("#emptyDepot").val(newData.emptyDepot);
$("#packingDepot").val(newData.packingDepot);
$("#date").val(newData.date);
$("#terminal_description").val(newData.terminalDescription);
$("#container_type").val(newData.container_type);
$("#genset").val(newData.genset);

if (newData.PackDepotTwo == "None") { // hide div with second depot
    $("#packDepotTwoDiv").css('display', 'none'); //  just for booking purposes dont temper with Storage
    //localStorage.setItem("dualLoad",false);
  } else {
    $("#packDepotTwoDiv").css('display', 'block'); //  just for booking purposes dont temper with Storage
    //localStorage.setItem("dualLoad",true);
  }

  // handle Weighbridge event / functionality for bookings with Weighbridge

if (newData.weighbridge) {
  $("#weighbridgeNameDiv").css('display', 'block'); //  just for booking purposes dont temper with Storage
  // localStorage.setItem("Weighbridge",true);
} else {
  $("#weighbridgeNameDiv").css('display', 'none'); //  just for booking purposes dont temper with Storage
  // localStorage.setItem("Weighbridge",false);
}

$("#weighbridgeName").val(newData.weighbridgeName);
$("#packingDepotTwo").val(newData.packingDepotTwo);

});


$(document).on("pageshow", "#handlePush", function () {

debugger;


var pushBookingObj = localStorage.getItem("newBookingRequest");

$("#acceptTask").click(function() {

  debugger;
  $('body').addClass('ui-loading');

  // stack pushnotifications

pushNotificationRequstInQueue.push(pushBookingObj);
localStorage.setItem("pushNotificationRequstInQueue",JSON.stringify(pushNotificationRequstInQueue));

var bookingAndId = {};
    bookingAndId.bookingreference = JSON.parse(pushBookingObj).BReference;
    bookingAndId.bookingId =  JSON.parse(pushBookingObj).BReferenceId

localStorage.setItem("handledFromPush",true);
localStorage.setItem("handledBooking",JSON.stringify(bookingAndId));
pushNotificationRequst("Booking Accepted");


});

$("#rejectTask").click(function () {

  debugger;
  $('body').addClass('ui-loading');

localStorage.setItem("handledFromPush",false);
pushNotificationRequst("Booking Rejected");

});

$('#noResponse').click(function() {

  debugger;

    $('body').addClass('ui-loading');
pushNotificationRequst("No Response");

});

});

function pushNotificationRequst (respone) {

  var newData = JSON.parse(localStorage.getItem("newBookingRequest"));

  var postData = {};

  postData.BookingReference = newData.BReference;
  postData.BookingReferenceId = newData.BReferenceId;
  postData.DriverNumber = JSON.parse(localStorage.getItem("credentials")).driver_number_with_code;
  postData.Response = respone;
  postData.Status = "Booking Request";

    $.ajax({

        url: endpoint + "Capture",
        type: "POST",
        data: JSON.stringify(postData),
        dataType: "json",
        timeout: 30000,
        async:false,
        contentType: "application/json",
        success: handleTaskRequestPush,
        error: function (jqXHR, textStatus, errorThrown) {
          alert("There is a technical problem please try again later..");
    $('body').removeClass('ui-loading'); console.log(errorThrown);
          console.log(errorThrown); }

    });

}

function handleTaskRequestPush (promise) {
  debugger;
  $('body').removeClass('ui-loading');
console.log(promise);
console.log("Push Notification Handled");

if (JSON.parse(localStorage.getItem('taskAlreadyInProgress')))
  localStorage.setItem("homeButtonFired",true);

localStorage.removeItem("newBookingRequest");

// refreshbookings
localStorage.setItem("refreshBookings",true);
NavigatePage("booking.html");

}

// check mate
