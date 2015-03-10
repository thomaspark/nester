(function() {
  var stats = {};
  var strict = true;
  var editor = CodeMirror(document.getElementById("editor"), {
    mode: "xml",
    htmlMode: true,
    lineNumbers: true,
    tabSize: 2,
    theme: "monokai"
  });

  editor.setSize("100%", "100%");
  handlers();

  $.get("./sample.html", function(data) {
    editor.setValue(data);
    analyze(data);
  });

  function analyze(data) {
    stats.elements = {};
    stats.count = 0;
    stats.types = 0;
    stats.internal = 0;
    stats.depth = 0;
    stats.max = 0;
    stats.indents = 0;
    stats.entropy = 0;
    stats.halstead = 0;

    if (strict) {
      try {
        $($.parseXML(data)).children().each(function() {
          traverse(this, 0);
        });
      } catch(err) {
        console.log(err);
        $("#metrics").html("<h2><i class='fa fa-exclamation-triangle'></i> Invalid XML</h2>");
        return;
      }
    } else {
      $($.parseHTML(data)).each(function() {
        traverse(this, 0);
      });
    }

    for (var e in stats.elements) {
      stats.count += stats.elements[e];
      stats.types += 1;
    }

    loc(data);
    indents(data);
    halstead();

    var metrics = $("#metrics");
    metrics.empty();
    metrics.append("<p>Lines of Code<br>" + stats.length + "</p>");
    metrics.append("<p>Elements<br>" + stats.count + "</p>");
    metrics.append("<p>Element Types<br>" + stats.types + "</p>");
    metrics.append("<p>Internal Elements<br>" + stats.internal + "</p>");
    metrics.append("<p>Max Depth<br>" + stats.max + "</p>");
    metrics.append("<p>Total Depth<br>" + stats.depth + "</p>");
    metrics.append("<p>Total Indents<br>" + stats.indents + "</p>");
    metrics.append("<p>Halstead Volume<br>" + stats.halstead.toFixed(1) + "</p>");
  }

  function traverse(elem, level) {

    if (elem.tagName === undefined) {
      return;
    }

    stats.depth += level;

    if ($(elem).children().length > 0) {
      stats.internal += 1;
    }

    if (level > stats.max) {
      stats.max = level;
    }

    if (stats.elements[elem.tagName]) {
      stats.elements[elem.tagName] += 1;
    } else {
      stats.elements[elem.tagName] = 1;
    }

    $(elem).children().each(function() {
      traverse(this, level+1);
    });
  }

  function loc(data) {
    stats.length = data.split(/\r*\n/).length;
  }

  function indents(data) {
    var lines = data.split("\n");
    lines.forEach(function(line) {
      var index = 0;
      while (line.charAt(index++) === "\t") {
        stats.indents++;
      }
    });
  }

  function halstead() {
    stats.halstead = stats.count * Math.log2(stats.types);
  }

  function handlers() {

    $("#analyze").click(function() {
      var data = editor.getValue();
      analyze(data);
    });

    $("#mode").on("click", ".btn:not(.active)", function() {
      $("#mode .btn").toggleClass("active");
      if ($(this).attr("id") === "strict") {
        strict = true;
      } else {
        strict = false;
      }
    });
  }

})();