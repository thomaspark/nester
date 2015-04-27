var utilities = {

  checkStatus: function(user) {
    if (user.level >= 2) {
      status = "admin";
      return status;
    }
    if (user.level < 1) {
      status = "guest";
      return status;
    }
  },

  setPrivs: function(user) {
    if (checkStatus(user) === "guest") {
      privs = null;
      return;
    }
    privs.read = true;
    privs.write = true;
    privs.remove = true;
    privs.execute = true;
  },

  outputData: function(user) {
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

};