function ISO6346Check(con) {
  if (!con || con == "" || con.length != 11) {
    console.log("Container Lengh must be 11 characters.. wtf ;)");
    return false;
  }
  con = con.toUpperCase();
  var re = /^[A-Z]{4}\d{7}/;
  if (re.test(con)) {
    var sum = 0;
    for (i = 0; i < 10; i++) {
      var n = con.substr(i, 1);
      if (i < 4) {
        n = "0123456789A?BCDEFGHIJK?LMNOPQRSTU?VWXYZ".indexOf(con.substr(i, 1));
      }
      n *= Math.pow(2, i); //2的i次方
      sum += n;
    }
    if (con.substr(0, 4) == "HLCU") {
      sum -= 2;
    }
    sum %= 11;
    sum %= 10; //余数为10的取0A
    return sum == con.substr(10);
  } else {
    return false; //不匹配正则表达式
  }
}
