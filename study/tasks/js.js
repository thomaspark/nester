(function(){

  function checkStatus(user) {
    if (user.level >= 2) {
      status = "admin";
      return status;
    }
    if (user.level < 1) {
      status = "guest";
      return status;
    }
  }

  function setPrivs(user) {
    if (checkStatus(user) === "guest") {
      privs = null;
      return;
    }
    privs.read = true;
    privs.write = true;
    privs.remove = true;
    privs.execute = true;
  }

  function outputData(user) {
    if (user) {
      var data = user.data;
      if (data) {
        for (var d in data) {
          var output = d + ": " + data[d];
          console.log(output);
        }
      }
    }
  }

})();