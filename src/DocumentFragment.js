  // ### DocumentFragment Shim
  //
  // A representation of a document fragment that can be normally generated
  // by calling `document.createDocumentFragment`. Since the document fragment
  // is itself a node, it inherits all properties of a node.
module.exports = (function(){
  "use strict";

  var Node = require("./Node");

  function DocumentFragment() {
    this.node = new Node(Node.DOCUMENT_FRAGMENT_NODE, "#document-fragment");
    this.node._ownerDocument = this;
  }

  DocumentFragment.prototype = {
    createTextNode: function(data) {
      return new Node(Node.TEXT_NODE, "#text", data);
    },
    createElementNS: function(namespaceURI, qualifiedName) {
      return new Node(Node.ELEMENT_NODE, qualifiedName, false, namespaceURI);
    },
    createElement: function(tagName) {
      return this.createElementNS(false, tagName);
    },
    createComment: function(data) {
      return new Node(Node.COMMENT_NODE, "#comment", data);
    },
    createAttribute: function(name) {
      return new Node(Node.ATTRIBUTE_NODE, name);
    }
  };

  return DocumentFragment;
}());
