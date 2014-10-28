// https://github.com/sindresorhus/detect-indent

function detectIndent(str) {
  var INDENT_RE = /^(?:( )+|\t+)/;

  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }

  // used to if tabs or spaces are the most used
  var t = 0;
  var s = 0;

  // remember the indentation used for the previous line
  var prev = 0;

  // remember how much a given indentation size was used
  var indents = {};

  str.split(/\n/g).forEach(function (line) {
    if (!line) {
      // ignore empty lines
      return;
    }

    var matches = line.match(INDENT_RE);

    var indent;
    if (!matches) {
      indent = 0;
    } else {
      indent = matches[0].length;

      if (matches[1]) {
        // spaces were used
        s++;
      } else {
        // tabs were used
        t++;
      }
    }

    var diff = Math.abs(indent - prev);
    prev = indent;

    if (diff) {
      // an indent or deindent has been detected
      indents[diff] = (indents[diff] || 0) + 1;
    }
  });

  // find most frequent indentation
  var amount = 0;
  var max = 0;
  var n;
  for (var diff in indents) {
    n = indents[diff];
    if (n > max) {
      max = n;
      amount = +diff;
    }
  }

  var type;
  var actual;
  if (!amount) {
    type = null;
    actual = '';
  } else if (s >= t) {
    type = 'space';
  } else {
    type = 'tab';
  }

  return {
    amount: amount,
    type: type
  };
}
