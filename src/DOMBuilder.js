  // ### The DOM Builder
  //
  // The DOM builder is used to construct a DOM representation of the
  // HTML/CSS being parsed. Each node contains a `parseInfo` expando
  // property that contains information about the text extents of the
  // original source code that the DOM element maps to.
  //
  // The DOM builder is given a single document DOM object that will
  // be used to create all necessary DOM nodes.
module.exports = (function(){
  "use strict";

  var DocumentFragment = require("./DocumentFragment");

  function DOMBuilder(disallowActiveAttributes) {
    this.fragment = new DocumentFragment();
    this.currentNode = this.fragment.node;
    this.contexts = [];
    this.disallowActiveAttributes = disallowActiveAttributes;
  }

  DOMBuilder.prototype = {
    // This method pushes a new element onto the DOM builder's stack.
    // The element is appended to the currently active element and is
    // then made the new currently active element.
    pushElement: function(tagName, parseInfo, nameSpace) {
      var node = (nameSpace ? this.fragment.createElementNS(nameSpace, tagName)
                            : this.fragment.createElement(tagName));
      node.parseInfo = parseInfo;
      this.currentNode.appendChild(node);
      this.currentNode = node;
    },
    // This method pops the current element off the DOM builder's stack,
    // making its parent element the currently active element.
    popElement: function() {
      this.currentNode = this.currentNode.parentNode;
    },
    popElements: function(n) {
      while (n>0) {
        this.currentNode = this.currentNode.parentNode;
        n--;
      }
    },
    // record the cursor position for a context change (text/html/css/script)
    pushContext: function(context, position) {
      this.contexts.push({
        context: context,
        position: position
      });
    },
    // This method appends an HTML comment node to the currently active
    // element.
    comment: function(data, parseInfo) {
      var comment = this.fragment.createComment('');
      comment.nodeValue = data;
      comment.parseInfo = parseInfo;
      this.currentNode.appendChild(comment);
    },
    // This method appends an attribute to the currently active element.
    attribute: function(name, value, parseInfo) {
      var attrNode = this.fragment.createAttribute(name);
      attrNode.parseInfo = parseInfo;
      if (this.disallowActiveAttributes && name.substring(0,2).toLowerCase() === "on") {
        attrNode.nodeValue = "";
      } else {
        attrNode.nodeValue = value;
      }
      this.currentNode.attributes.push(attrNode);
      this.currentNode._attributeMap[attrNode.nodeName] = attrNode.nodeValue;
    },
    // This method appends a text node to the currently active element.
    text: function(text, parseInfo) {
      var textNode = this.fragment.createTextNode(text);
      textNode.parseInfo = parseInfo;
      this.currentNode.appendChild(textNode);
    }
  };

  return DOMBuilder;

}());
