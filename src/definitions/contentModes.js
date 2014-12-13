var htmlElements = require("./htmlElements");

module.exports = {
  mayElementContain: function(parentTag, childTag) {
    parentTag = parentTag.toLowerCase();
    childTag = childTag.toLowerCase();

    var pdef = htmlElements[parentTag],
        perms = pdef.permitted,
        cdef = htmlElements[childTag];

    // void elements don't allow any content!
    if(perms === false) return false;

    // Specifically allowed?
    if(perms.indexOf(childTag) > -1) return true;

    // Generically allowed?
    var modes = cdef.mode;
    for(var i=0, last=modes.length,mode; i<last; i++) {
      mode = modes[i];
      // specific?
      if(perms.indexOf(mode) > -1) return true;
      // generic?
      if(mode === "phrasing" && perms.indexOf("flow") > -1) return true;
    }

    // this element may not be used in this parent element
    return false;
  }
};
