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
    stats.unique = 0;

    if (strict) {
      try {
        $($.parseXML(data)).children().each(function() {
          traverse(this, 0);
        });
      } catch(err) {
        console.log(err);
        $("#metrics").html("<p>Invalid XML</p>");
        return;
      }
    } else {
      $($.parseHTML(data)).each(function() {
        traverse(this, 0);
      });
    }

    for (var e in stats.elements) {
      stats.count += stats.elements[e];
      stats.unique += 1;
      // console.log(stats.elements[e], e);
    }

    loc(data);

    var metrics = $("#metrics");
    metrics.empty();
    metrics.append("<p>Lines of Code<br>" + stats.length + "</p>");
    metrics.append("<p>Element Count<br>" + stats.count + "</p>");
    metrics.append("<p>Unique Element Count<br>" + stats.unique + "</p>");
    metrics.append("<p>McCabe's Cyclomatic Complexity<br>" + "0" + "</p>");
    metrics.append("<p>Halstead Metric<br>" + "0" + "</p>");
    metrics.append("<p>Average Breadth<br>" + "0" + "</p>");
    metrics.append("<p>Average Depth<br>" + "0" + "</p>");
    metrics.append("<p>Internal Nodes<br>" + "0" + "</p>");
    metrics.append("<p>Nesting Metric<br>" + "0" + "</p>");
    metrics.append("<p>Entropy<br>" + "0" + "</p>");


  }

  function traverse(elem, level) {

    if (elem.tagName === undefined) {
      return;
    }

    console.log(elem.tagName, level);

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