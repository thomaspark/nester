(function(){
  var task = $.url().param("task") ? $.url().param("task") : "html.html";
  var p = $.url().param("p") ? $.url().param("p") : "test";
  var anchor;
  var cursor;
  var current = $(".xselectable-selected");
  var lassoed = [];
  var startTime;
  var operations = [];
  var attempt = 0;

  $.ajax({
    url : "./study/lang/" + task.split(".").pop() + ".html",
    dataType: "html",
    success : function (data) {
      $("#instructions").html(data);
      $("#instructions-modal").fadeIn();
    }
  });

  $.ajax({
    url : "./study/tasks/" + task,
    dataType: "text",
    success : function (data) {
      loadBlocks(data);
     }
  });

  function loadBlocks(code) {
    var format = detectIndent(code);
    var token = (format.type == "space") ? " " : "\t";
    var amount = format.amount;
    var blanks = 0;

    code.split("\n").forEach(function(elem, index) {
      var i = 0;
      var level = 0;
      var block = $("<span></span>");

      if (/\S/.test(elem)) {
        while (elem.charAt(i++) === token) {
          level++;
        }

        level = level / amount;

        block.text(elem).data({"position": 0, "line": index - blanks, "level": level}).addClass("block");
      } else {
        blanks = blanks + 1;
        block.text("_").addClass("blank");
      }

      var line = $("<div></div>").append(block);
      line.appendTo("#code");
    });
  }

  $(".indent").click(function() {
    indent();
    operations.push("button indent");
  });

  $(".outdent").click(function() {
    outdent();
    operations.push("button unindent");
  });

  $(".instructions").click(function() {
    $("#instructions-modal").fadeIn();
    operations.push("button instructions");
  });

  $(".close").click(function() {
    $(".modal").fadeOut();
    $("body").trigger("start");
  });

  $(".modal").click(function(e) {
    if (!$(e.target).hasClass("modal-inner")) {
      $(".modal").fadeOut();
      $("body").trigger("start");
    }
  }).children().click(function(e) {
    return false;
  });

  $("body").on("start", function() {
    if (startTime === undefined) {
      startTime = new Date();
    }
  });

  $(".submit").click(function() {
    var total = $(".block").length;
    var missed = 0;
    var missedRelative = 0;
    var missedDirection = 0;
    var missedLines = [];
    var missedRelativeLines = [];
    var missedDirectionLines = [];

    var solution = [];
    var answer = [];

    var level, position, prevLevel, prevPosition;
    var time = new Date() - startTime;

    attempt = attempt + 1;

    $(".block").each(function(index, element) {
      level = $(this).data("level");
      position = $(this).data("position");

      solution.push(level);
      answer.push(position);

      if (position !== level) {
        missed = missed + 1;
        missedLines.push(index + 1);
      }

      if (index > 0) {
        var changeLevel = (prevLevel - level);
        var changePosition = (prevPosition - position);


        if (changePosition !== changeLevel) {
          missedRelative = missedRelative + 1;
          missedRelativeLines.push(index + 1);

          if ((changePosition * changeLevel) <= 0) {
            missedDirection = missedDirection + 1;
            missedDirectionLines.push(index + 1);
          }
        }
      }

      prevLevel = level;
      prevPosition = position;
    });

    var score = 100 * (total - missedDirection - (0.5 * (missedRelative - missedDirection))) / total;

    Parse.initialize("ZnD1UEJA3BdRNhaAJ6awIcbR6CC9TtQ1rwxUYVRh","JkbOI0eiIKdoxmcSTTj5RrpfvvtPwnf8PuOz3VCD");

    var Record = Parse.Object.extend("Record");
    var record = new Record();
    record.set('participant', p);
    record.set('task', task);
    record.set('lines', total);
    record.set('time', time/1000);
    record.set('attempt', attempt);
    record.set('missed', missedDirection);
    record.set('solution', solution);
    record.set('answer', answer);
    record.set('operations', operations);
    record.save();


    $("#score").empty();
    operations = [];

    if (missedDirection > 0) {
      $("#score").append("<p><i class='fa fa-exclamation-triangle'></i></p><h2>You have one or more errors.</h2><p>Find and correct them.</p>");
    } else {
      $("#score").append("<p><i class='fa fa-check-circle'></i></p><h2>You have successfully completed the task.</h2><p>You may now close this tab.</p>");
    }

    $("#score-modal").fadeIn();
  });

  $("#code").xselectable({
    filter: ".block"
  })
    .bind("xselectableselecting",
    function(e, ui) {
      lassoed.push($(ui.selecting).data("line"));

      if (e.shiftKey && current.length) {
        cursor = $(ui.selecting).data("line");

        if (anchor > cursor) {
          current.addClass("xselectable-selected");
          $(".block").slice(cursor, anchor+1).addClass("xselectable-selected");
        } else {
          current.addClass("xselectable-selected");
          $(".block").slice(anchor, cursor+1).addClass("xselectable-selected");
        }
      }
    })
    .bind("xselectableunselecting",
    function(e, ui) {
      lassoed.pop();
      cursor = $(ui.unselecting).data("line");
    })
    .bind("xselectablestop",
    function(e, ui) {
      if (e.shiftKey) {
        operations.push("shift-drag " + lassoed.length);
      } else if (e.metaKey || e.ctrlKey) {
        operations.push("control-drag " + lassoed.length);
      } else {
        operations.push("drag " + lassoed.length);
      }

      if (lassoed.length == 1) {
        anchor = cursor = lassoed.pop();
      } else if (lassoed.length > 1) {
        cursor = lassoed.pop();
        anchor = lassoed[0];
      }

      current = $(".xselectable-selected");
      lassoed = [];
  });

  $("#code").on("click", function(e, ui) {

    if ($(e.target).hasClass("block")) {

      cursor = $(e.target).data("line");

      if (e.shiftKey && current.length) {
        operations.push("shift-click");

        if (anchor > cursor) {
          current.addClass("xselectable-selected");
          $(".block").slice(cursor, anchor+1).addClass("xselectable-selected");
        } else {
          current.addClass("xselectable-selected");
          $(".block").slice(anchor, cursor+1).addClass("xselectable-selected");
        }
      } else if (e.metaKey || e.ctrlKey) {
        operations.push("control-click");

        $(e.target).toggleClass("xselectable-selected");

      } else {
        $(".xselectable-selected").removeClass("xselectable-selected");
        $(e.target).addClass("xselectable-selected");
        cursor = anchor = $(e.target).data("line");
        lassoed[0] = cursor;
        operations.push("click");
      }
    } else {

      if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
        $(".xselectable-selected").removeClass("xselectable-selected");
        operations.push("click deselect");
      }
    }
  });

  $(document).keydown(function(e) {

    var first, last;

    if ((e.which == 9 && e.shiftKey) || e.which == 37 || e.which == 8) {
      // shift-tab or left arrow or delete
      e.preventDefault();
      outdent();

      if (e.which == 9) {
        operations.push("key shift-tab");
      } else {
        operations.push("key left-arrow");
      }
    } else if (e.which == 9 || e.which == 39 || e.which == 32) {
      // tab or right arrow or space
      e.preventDefault();
      indent();

      if (e.which == 9) {
        operations.push("key tab");
      } else if (e.which == 39) {
        operations.push("key right-arrow");
      } else {
        operations.push("key space");
      }
    } else if (e.which == 27 || (e.which == 68 && e.ctrlKey) || (e.which == 68 && e.metaKey)) {
      // escape or ctrl-d or command-d

      e.preventDefault();
      cursor = anchor = null;
      $(".xselectable-selected").removeClass("xselectable-selected");

      if (e.which == 27) {
        operations.push("key escape");
      } else if (e.ctrlKey) {
        operations.push("key control-d");
      } else {
        operations.push("key command-d");
      }
    } else if ((e.which == 65 && e.ctrlKey) || (e.which == 65 && e.metaKey)) {
      // ctrl-a or command-a

      e.preventDefault();
      anchor = 0;
      cursor = $(".block").length - 1;
      $(".block").addClass("xselectable-selected");

      if (e.ctrlKey) {
        operations.push("key control-a");
      } else {
        operations.push("key command-a");
      }
    } else if (e.which == 38) {
      // up arrow
      e.preventDefault();

      first = $(".xselectable-selected").first().data("line");
      last = $(".xselectable-selected").last().data("line");

      if (e.shiftKey) {

        operations.push("key shift-up-arrow");

        if (cursor <= anchor) {
          if (cursor > 0) {
            cursor = cursor - 1;
            $(".block").eq(cursor).addClass("xselectable-selected");
            checkTop(cursor);
          }
        } else {
          $(".block").eq(cursor).removeClass("xselectable-selected");
          cursor = cursor - 1;
          checkTop(cursor);
        }
      } else {

        operations.push("key up-arrow");

        if ($(".xselectable-selected").length) {
          $(".xselectable-selected").removeClass("xselectable-selected");

          if (cursor > 0) {
            anchor = cursor = cursor - 1;
            $(".block").eq(cursor).addClass("xselectable-selected");
            checkTop(cursor);
          } else {
            $(".block").eq(cursor).addClass("xselectable-selected");
          }
        } else {
          $(".block").last().addClass("xselectable-selected");
          anchor = cursor = $(".block").length - 1;
          checkBottom(cursor);
        }
      }
    } else if (e.which == 40) {
      // down arrow
      e.preventDefault();

      last = $(".xselectable-selected").last().data("line");

      if (e.shiftKey) {

        operations.push("key shift-down-arrow");

        if (cursor >= anchor) {
          if (cursor < $(".block").length) {
            cursor = cursor + 1;
            $(".block").eq(cursor).addClass("xselectable-selected");
            checkBottom(cursor);
          }
        } else {
          $(".block").eq(cursor).removeClass("xselectable-selected");
          cursor = cursor + 1;
          checkTop(cursor);
        }
      } else {

        operations.push("key down-arrow");

        if ($(".xselectable-selected").length) {
          $(".xselectable-selected").removeClass("xselectable-selected");

          if (cursor < $(".block").length - 1) {
            anchor = cursor = cursor + 1;
            $(".block").eq(cursor).addClass("xselectable-selected");
            checkBottom(cursor);
          } else {
            $(".block").eq(cursor).addClass("xselectable-selected");
          }
        } else {
          $(".block").first().addClass("xselectable-selected");
          anchor = cursor = 0;
          checkTop(cursor);
        }
      }
    }

    current = $(".xselectable-selected");
  });

  function indent() {
    $(".xselectable-selected").each(function() {
      var position = $(this).data("position");
      $(this).data("position", position + 1);
      $(this).before("<span class=\"tab\"></span>");
    });
  }

  function outdent() {
    $(".xselectable-selected").each(function() {
      if ($(this).prev().hasClass("tab")) {
        var position = $(this).data("position");
        $(this).data("position", position - 1);
        $(this).prev().remove();
      }
    });
  }

  function checkTop(cursor) {
    var parent = $("#code").outerHeight();
    var height = $(".block").eq(cursor).outerHeight();
    var top = $(".block").eq(cursor).position().top;
    var offset = height * cursor;

    if (top < 0) {
      $("#code").animate({scrollTop: offset}, 100);
    }
  }

  function checkBottom(cursor) {
    var parent = $("#code").outerHeight();
    var height = $(".block").eq(cursor).outerHeight();
    var top = $(".block").eq(cursor).position().top;
    var offset = (height* (cursor+5) - parent);

    if ((top + height) > parent) {
      $("#code").animate({scrollTop: offset+40}, 100);
    }
  }

})();

