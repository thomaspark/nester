function check(user) {
  if (user.level >= 1) {
    return true;
  }
  if (user.level < 1) {
    return false;
  }
}

function count(user, history) {
  if (user.level < 1) {
    return;
  }
  for (var i = 0; i < history.length; i++) {
    if (history[i] == user.name) {
      user.history.push(history[i]);
    }
  }
}

if (visits.length === 0) {
  alert("welcome!");
}