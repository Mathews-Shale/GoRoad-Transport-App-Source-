var appVersion = '2018.02.02-BETA';

function registerForPushNotifications() {

    debugger;

    //handle device registration
//  if (localStorage.getItem("registrationId") == null) azure stuff
//     getRegistrationId(); azure stuff

// var hubPath = "goroadnotifications"; azure stuff
// var connect = "Endpoint=sb://goroadnotificationnamespace.servicebus.windows.net/;SharedAccessKeyName=DefaultListenSharedAccessSignature;SharedAccessKey=hWwDcMxqAsYhqN6KJFqw3OES+fA3wU9Xfn4TsCHFXzo="; azure stuff

var push = PushNotification.init({
    // notificationHubPath: hubPath,
    // connectionString: connect,
    android: {
        sound: true,
        senderID: 452781348361
    },
    ios: {
        alert: 'true',
        badge: true,
        sound: 'false'
    }
});

push.on('registration', function (data) {

    //console.log(data.azureRegId + "----------------- line 21");
       sendHandler(data.registrationId);

    });


push.on('notification', function (data) {

    console.log(data);
    handleNotification(data);
    //alert(data.title + "\n\n" + data.message);
    // console.log(data.title);
    // console.log(data.count);
    // console.log(data.sound);
    // console.log(data.image);
    // console.log(data.additionalData);
});

}

function sendHandler (token) {

    var endpoint = localStorage.getItem("endpoint");
    var deviceRegistration = {};
    var deviceInfo = [];
    // var driverNumber;
    // var driverNameObj = JSON.parse(localStorage.getItem("credentials"));
    //
    // if (driverNameObj.country == "South Africa")
    //     driverNumber = "+27"+driverNameObj.number;
    // else
    //     driverNumber = "+264"+driverNameObj.number;
    //
    // console.log(driverNumber);
    //
    // var driverNumber = JSON.parse(localStorage.getItem("credentials")).driver_number_with_code;
    // var driverNumberUse = driverNumber.substr(1);
    // console.log(driverNumberUse);
    // deviceInfo.push(driverNumberUse);
    console.log(token);

    // deviceInfo.push(device.manufacturer.replace(/ /g,''));
    // deviceInfo.push(device.model.replace(/ /g,''));
    // deviceInfo.push(device.version.replace(/ /g,''));
    // //deviceInfo.push(device.serial.replace(/ /g,''));
    // deviceInfo.push(device.uuid);
    //deviceInfo.push(driverNameObj.driverName);
  //  deviceRegistration.Tags = deviceInfo;
    deviceRegistration.appVersion = appVersion;
    deviceRegistration.Handle = token;
    deviceRegistration.OSVersion = device.version;
    deviceRegistration.UUID = device.uuid;
    deviceRegistration.model = device.model;
    deviceRegistration.manufacturer = device.manufacturer;

    switch(device.platform) {

      case "Android":
        deviceRegistration.Platform = "gcm";
        break;
      case "IOS":
        deviceRegistration.Platform = "apns";
        break;
    }
console.log(deviceRegistration);



var devicedata = JSON.stringify(deviceRegistration);

localStorage.setItem('deviceRegistration',devicedata);


var id = localStorage.getItem("registrationId");

$.ajax({
    // url: endpoint + "Register/" + id,
    url: endpoint + "Register" ,
    type: "POST",
    data:devicedata,
    dataType: "json",
    async:true,
    timeout:30000,
    contentType: "application/json"
    // success: successHandler,
    // error: function (jqXHR, textStatus, errorThrown) { DAN MOD fingers Crossed
    //
    //    console.log(errorThrown);console.log(jqXHR);console.log(textStatus); }
});

}

// function successHandler(response) {
//   debugger;
//   localStorage.setItem("handlerSet","Yes");
//   console.log(response);
// }

function getRegistrationId() {

  console.log("Your " + device.manufacturer + " " + device.model + " has been registered for push notifications..");


console.log("getting ID");

var endpoint = localStorage.getItem("endpoint");

  $.ajax({
      url: endpoint + "Register",
      type: "POST",
      data: "",
      dataType: "json",
      async:true,
      timeout: 15000,
      contentType: "application/json",
      success: successRegistration,
      error: function (jqXHR, textStatus, errorThrown) {   console.log(errorThrown); }
  });

}

function successRegistration(id) {


    // set registration id for storage
  if (localStorage.getItem("registrationId") == null) {
      localStorage.setItem("registrationId",id);
      console.log(id + "sending handler to register device on azure");
      //sendHandler(id);
   }

    else
    console.log("RegistrationId already done");

    return id;
}

function handleNotification (data) {

  // set new booking data in storage
  var bookingObject = data.additionalData.additional_data.booking_reference;
  localStorage.setItem("newBookingRequest",JSON.stringify(bookingObject));

  alert(data.title);

  // define routes for coldstate
   if(data.title.substring(0,19) == "New Booking Request")
     NavigatePage("file:///android_asset/www/views/handlePush.html");
   else if (data.title.substring(0,18) == "Booking Reassigned")
   {
     localStorage.setItem("refreshBookings",true); // bookings to refresh
     NavigatePage("file:///android_asset/www/views/booking.html");
   }

//   console.log(data);
    //   console.log(data);
    //
    //   // check if user is logged in
    //   var loggedIn = localStorage.getItem("credentials");
    //   // if (loggedIn != null)
    //   // {
    //   //   NavigatePage("../")
    //   // }
    // var popup = confirm(data.title + "\n\n" + data.message);
    // var taskResponce = "";
    // debugger;
    //
    // if (popup)
    // {
    //   taskResponce = "Booking Accepted";
    //   alert(taskResponce);
    // }
    //
    //  else {
    //
    //   taskResponce = "Booking Rejected";
    //   alert(taskResponce);
    //  }
    //
    //
    //
    // var postData = {};
    //
    // postData.BookingReference = bookingObject.BReference;
    // postData.DriverNumber = JSON.parse(localStorage.getItem("credentials")).driver_number_with_code;
    // postData.Response = taskResponce;
    // postData.Status = "Booking Request";
    //
    //
    //   $.ajax({
    //
    //       url: endpoint + "Capture",
    //       type: "POST",
    //       data: JSON.stringify(postData),
    //       dataType: "json",
    //       timeout: 15000,
    //       async:false,
    //       contentType: "application/json",
    //       success: handleTaskRequestPush,
    //       error: function (jqXHR, textStatus, errorThrown) {
    //         alert("There is a technical problem please try again later..");
    //   $('body').removeClass('ui-loading'); console.log(errorThrown);
    //         console.log(errorThrown); }
    //
    //   });
}
//
// function handleTaskRequestPush (promise) {
//
// console.log(promise);
//
// }
