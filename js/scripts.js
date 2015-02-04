(function(){
  var task = $.url().param("task") ? $.url().param("task") : "html1.html";
  var anchor;
  var cursor;
  var current = $(".ui-selected");
  var lassoed = [];
  var startTime;

  $.ajax({
    url : "./instructions/" + task.split(".").pop() + ".html",
    dataType: "html",
    success : function (data) {
      $("#instructions").html(data);
    }
  });

  $.ajax({
    url : "./tasks/" + task,
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
  });

  $(".outdent").click(function() {
    outdent();
  });

  $(".instructions").click(function() {
    $("#instructions-modal").fadeIn();
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
    var missedLines = [];
    var missedRelative = 0;
    var missedRelativeLines = [];
    var level, position, prevLevel, prevPosition;
    var missedDirection = 0;
    var missedDirectionLines = [];
    var time = new Date() - startTime;

    $(".block").each(function(index, element) {
      level = $(this).data("level");
      position = $(this).data("position");

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

    $("#score").empty();
    $("#score").append("<div>Absolute score: " + (total - missed) + " out of " + total + "</div>");
    $("#score").append("<div>Missed lines: " + missedLines.toString() + "</div>");
    $("#score").append("<hr>");
    $("#score").append("<div>Relative score: " + (total - missedRelative) + " out of " + total + "</div>");
    $("#score").append("<div>Missed lines: " + missedRelativeLines.toString() + "</div>");
    $("#score").append("<hr>");
    $("#score").append("<div>Polarity score: " + (total - missedDirection) + " out of " + total + "</div>");
    $("#score").append("<div>Missed lines: " + missedDirectionLines.toString() + "</div>");
    $("#score").append("<hr>");
    $("#score").append("<div>Weighted score: " + (total - (missedRelative - missedDirection) - (0.5 * missedDirection)) + " out of " + total + "</div>");
    $("#score").append("<div>Missed lines: " + missedRelativeLines.toString() + "</div>");
    $("#score").append("<hr>");
    $("#score").append("Time: " + time/1000 + " seconds");

    $("#score-modal").fadeIn();
  });

  $("#code").selectable({
    filter: ".block",
    selecting: function(e, ui) {
      lassoed.push($(ui.selecting).data("line"));

      if (e.shiftKey && current.length) {
        cursor = $(ui.selecting).data("line");

        if (anchor > cursor) {
          current.addClass("ui-selected");
          $(".block").slice(cursor, anchor+1).addClass("ui-selected");
        } else {
          current.addClass("ui-selected");
          $(".block").slice(anchor, cursor+1).addClass("ui-selected");
        }
      }
    },
    unselecting: function(e, ui) {
      lassoed.pop();
      cursor = $(ui.unselecting).data("line");
    },
    stop: function() {
      console.log(lassoed);
      if (lassoed.length == 1) {
        anchor = cursor = lassoed.pop();
      } else if (lassoed.length > 1) {
        cursor = lassoed.pop();
        anchor = lassoed[0];
      }

      current = $(".ui-selected");
      lassoed = [];
    }
  });

  $(document).keydown(function(e) {

    var first, last;

    if ((e.which == 9 && e.shiftKey) || e.which == 37 || e.which == 8) {
      // shift-tab or left arrow or delete
      e.preventDefault();
      outdent();
    } else if (e.which == 9 || e.which == 39 || e.which == 32) {
      // tab or right arrow or space
      e.preventDefault();
      indent();
    } else if (e.which == 27 || (e.which == 68 && e.ctrlKey) || (e.which == 68 && e.metaKey)) {
      // escape or ctrl-d or command-d

      e.preventDefault();
      cursor = anchor = null;
      $(".ui-selected").removeClass("ui-selected");
    } else if ((e.which == 65 && e.ctrlKey) || (e.which == 65 && e.metaKey)) {
      // ctrl-a or command-a

      e.preventDefault();
      anchor = 0;
      cursor = $(".block").length - 1;
      $(".block").addClass("ui-selected");
    } else if (e.which == 38) {
      // up arrow
      e.preventDefault();

      first = $(".ui-selected").first().data("line");
      last = $(".ui-selected").last().data("line");

      if (e.shiftKey) {

        if (cursor <= anchor) {
          if (cursor > 0) {
            cursor = cursor - 1;
            $(".block").eq(cursor).addClass("ui-selected");
            checkTop(cursor);
          }
        } else {
          $(".block").eq(cursor).removeClass("ui-selected");
          cursor = cursor - 1;
          checkTop(cursor);
        }
      } else {
        if ($(".ui-selected").length) {
          $(".ui-selected").removeClass("ui-selected");

          if (cursor > 0) {
            anchor = cursor = cursor - 1;
            $(".block").eq(cursor).addClass("ui-selected");
            checkTop(cursor);
          } else {
            anchor = cursor = null;
          }
        } else {
          $(".block").last().addClass("ui-selected");
          anchor = cursor = $(".block").length - 1;
          checkTop(cursor);
        }
      }
    } else if (e.which == 40) {
      // down arrow
      e.preventDefault();

      last = $(".ui-selected").last().data("line");

      if (e.shiftKey) {
        if (cursor >= anchor) {
          if (cursor < $(".block").length) {
            cursor = cursor + 1;
            $(".block").eq(cursor).addClass("ui-selected");
            checkBottom(cursor);
          }
        } else {
          $(".block").eq(cursor).removeClass("ui-selected");
          cursor = cursor + 1;
          checkTop(cursor);
        }
      } else {
        if ($(".ui-selected").length) {
          $(".ui-selected").removeClass("ui-selected");

          if (cursor < $(".block").length - 1) {
            anchor = cursor = cursor + 1;
            $(".block").eq(cursor).addClass("ui-selected");
            checkBottom(cursor);
          } else {
            anchor = cursor = null;
          }
        } else {
          $(".block").first().addClass("ui-selected");
          anchor = cursor = 0;
          checkBottom(cursor);
        }
      }
    }

    current = $(".ui-selected");
  });

  function indent() {
    $(".ui-selected").each(function() {
      var position = $(this).data("position");
      $(this).data("position", position + 1);
      $(this).before("<span class=\"tab\"></span>");
    });
  }

  function outdent() {
    $(".ui-selected").each(function() {
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

    if (top < height) {
      $("#code").animate({scrollTop: top});
    }
  }

  function checkBottom(cursor) {
    var parent = $("#code").outerHeight();
    var height = $(".block").eq(cursor).outerHeight();
    var bottom = $(".block").eq(cursor).position().top;

    if (bottom > parent) {
      $("#code").animate({scrollTop: bottom});
    }
  }

})();

