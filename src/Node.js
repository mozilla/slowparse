  // ### DOM Node Shim
  //
  // This represents a superficial form of a DOM node which contains most of
  // the properties that a regular DOM node would contain, but only the ones
  // needed by slowparse.
module.exports = (function(){
  "use strict";

  var voidHtmlElements = require("./voidHtmlElements");

  function Node(nodeType, nodeName, nodeValue, namespaceURI) {
    this.nodeType = nodeType;
    this.nodeValue = nodeValue || "";
    this.namespaceURI = namespaceURI || "";
    this.parentNode = false;
    this.nextSibling = false;
    this.isVoid = voidHtmlElements.indexOf(nodeName) > -1;
    this.childNodes = [];
    this.attributes = [];
    this._attributeMap = {};
    switch(this.nodeType) {
      case Node.ELEMENT_NODE:
        this.nodeName = nodeName.toUpperCase();
        break;
      case Node.ATTRIBUTE_NODE:
        this.nodeName = nodeName.toLowerCase();
        break;
      default:
        this.nodeName = nodeName;
    }
  }

  Node.prototype = {
    // Add a node to the current node as a child
    appendChild: function(node) {
      var lastChild = this.childNodes.slice(-1)[0];
      if(lastChild) {
        lastChild.nextSibling = node;
      }

      node.parentNode = this;
      this.childNodes.push(node);
    },
    // Create a deep copy of the current node
    clone: function() {
      var node = new Node(this.nodeType, this.nodeName, this.nodeValue, this.namespaceURI);
      node.nextSibling = this.nextSibling ? this.nextSibling.clone() : false;
      node.isVoid = this.isVoid;
      node.childNodes = this.childNodes.map(function(childNode) {
        return childNode.clone();
      });
      node.attributes = this.attributes.map(function(attribute) {
        return attribute.clone();
      });
      node._attributeMap = this._attributeMap;

      return node;
    },
    // Get the attribute value of an element node
    getAttribute: function(name) {
      return this.nodeType === Node.ELEMENT_NODE && this._attributeMap[name.toLowerCase()];
    }
  };

  Object.defineProperties(Node.prototype, {
    "innerHTML": {
      get: function() {
        if(this.nodeType !== Node.ELEMENT_NODE) {
          return null;
        }

        var innerHTML = "";

        this.childNodes.forEach(function(childNode) {
          innerHTML += childNode.outerHTML || "";
        });

        return innerHTML;
      }
    },
    "outerHTML": {
      get: function() {
        if(this.nodeType === Node.ATTRIBUTE_NODE) {
          return null;
        }
        if(this.nodeType === Node.COMMENT_NODE) {
          return "<!--" + this.nodeValue + "-->";
        }
        if(this.nodeType !== Node.ELEMENT_NODE) {
          return this.nodeValue;
        }

        var attributes = this._attributeMap;
        var attributeStr = "";
        attributeStr = Object.keys(attributes).map(function(attrName) {
          return attrName + '="' + attributes[attrName] + '"';
        }).join(" ");
        if(attributeStr.length > 0) {
          attributeStr = " " + attributeStr;
        }

        var nodeName = this.nodeName.toLowerCase();
        var openingTag = "<" + nodeName + attributeStr + ">";
        var closingTag = this.isVoid ? "" : "</" + nodeName + ">";

        return openingTag + (this.innerHTML || "") + closingTag;
      }
    }
  });

  // Different node type constants
  Node.ELEMENT_NODE = 1;
  Node.ATTRIBUTE_NODE = 2;
  Node.TEXT_NODE = 3;
  Node.COMMENT_NODE = 8;
  Node.DOCUMENT_FRAGMENT_NODE = 11;

  return Node;
}());
