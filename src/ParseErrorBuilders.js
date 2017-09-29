// `ParseErrorBuilders` contains Factory functions for all our types of
// parse errors, indexed by error type.
//
// Each public factory function returns a `parseInfo` object, sans the
// `type` property. For more information on each type of error,
// see the [error specification][].
//
//   [error specification]: spec/
module.exports = (function() {
  "use strict";

  var ParseErrorBuilders = {
    /* Create a new object that has the properties of both arguments
     * and return it. */
    _combine: function(a, b) {
      var obj = {}, name;
      for (name in a) {
        obj[name] = a[name];
      }
      for (name in b) {
        obj[name] = b[name];
      }
      return obj;
    },
    // These are HTML errors.
    UNCLOSED_TAG: function(parser, token) {
      var currentNode = parser.domBuilder.currentNode,
          openTag = this._combine({
            name: currentNode.nodeName.toLowerCase()
          }, currentNode.parseInfo.openTag);
      return {
        openTag: openTag,
        cursor: openTag.start,
        token : token
      };
    },
    INVALID_TAG_NAME: function(tagName, token) {
      var openTag = this._combine({
            name: tagName
          }, token.interval);
      return {
        openTag: openTag,
        cursor: openTag.start,
        highlight: token.interval
      };
    },
    MISSING_CLOSING_TAG_NAME: function(token, openTagName, autocloseWarnings) {
      var openTag = this._combine({
            name: openTagName
          }, token.interval);

      if (autocloseWarnings) {
        var tag = autocloseWarnings[0];
        openTag = this._combine({
            name: tag.tagName
          }, tag.parseInfo.openTag);
      }

      return {
        openTag: openTag,
        cursor: token.interval.start
      };
    },
    UNEXPECTED_CLOSE_TAG: function(parser, closeTagName, token) {
      var closeTag = this._combine({
            name: closeTagName
          }, token.interval);
      return {
        closeTag: closeTag,
        cursor: closeTag.start,
        token : token
      };
    },
    ORPHAN_CLOSE_TAG: function(parser, openTagName, closeTagName, token) {
      var openTag = this._combine({
            name: openTagName
          }, parser.domBuilder.currentNode.parseInfo.openTag),
          closeTag = this._combine({
            name: closeTagName
          }, token.interval);
      return {
        highlight: token.interval,
        openTag: openTag,
        closeTag: closeTag,
        cursor: closeTag.start
      };
    },
    MISMATCHED_CLOSE_TAG_DUE_TO_EARLIER_AUTO_CLOSING: function(parser, closeTagName, token) {
      var warnings = parser.domBuilder.currentNode.closeWarnings,
          tag = warnings[0],
          closeTag = this._combine({
            name: closeTagName
          }, token.interval);
      return {
        highlight: token.interval,
        openTag: tag.parseInfo.openTag,
        closeTag: closeTag,
        cursor: closeTag.start
      };
    },
    MISMATCHED_CLOSE_TAG: function(parser, openTagName, closeTagName, token) {
      var openTag = this._combine({
            name: openTagName
          }, parser.domBuilder.currentNode.parseInfo.openTag),
          closeTag = this._combine({
            name: closeTagName
          }, token.interval);
      return {
        token: token,
        openTag: openTag,
        closeTag: closeTag,
        cursor: closeTag.start
      };
    },
    ATTRIBUTE_IN_CLOSING_TAG: function(parser) {
      console.log("ATTRIBUTE_IN_CLOSING_TAG");
      console.log(parser);
      console.log(parser.domBuilder.currentNode);

      var currentNode = parser.domBuilder.currentNode;
      var end = parser.stream.pos;

      if (!parser.stream.end()) {
        end = parser.stream.makeToken().interval.start;
      }
      var closeTag = {
        name: currentNode.nodeName.toLowerCase(),
        start: currentNode.parseInfo.closeTag.start,
        end: end
      };
      return {
        closeTag: closeTag,
        cursor: closeTag.start,
        highlight : {
          start : closeTag.start,
          end : closeTag.end
        }
      };
    },
    CLOSE_TAG_FOR_VOID_ELEMENT: function(parser, closeTagName, token) {

      var closeTag = this._combine({
            name: closeTagName
          }, token.interval);
      return {
        closeTag: closeTag,
        cursor: closeTag.start,
        highlight : token.interval
      };
    },
    UNTERMINATED_COMMENT: function(token) {
      var commentStart = token.interval.start;
      return {
        start: commentStart,
        cursor: commentStart,
        token : token
      };
    },
    UNTERMINATED_ATTR_VALUE: function(parser, nameTok, token) {
      var currentNode = parser.domBuilder.currentNode,
          openTag = this._combine({
            name: currentNode.nodeName.toLowerCase()
          }, currentNode.parseInfo.openTag),
          valueTok = parser.stream.makeToken(),
          attribute = {
            name: {
              value: nameTok.value,
              start: nameTok.interval.start,
              end: nameTok.interval.end
            },
            value: {
              start: valueTok.interval.start
            }
          };
      return {
        openTag: openTag,
        attribute: attribute,
        cursor: attribute.value.start,
        token : token
      };
    },
    UNQUOTED_ATTR_VALUE: function(parser, token) {
      var pos = parser.stream.pos;
      if (!parser.stream.end()) {
        pos = parser.stream.makeToken().interval.start;
      }
      return {
        start: pos,
        cursor: pos,
        token : token
      };
    },
    INVALID_ATTR_NAME: function(parser, attrToken) {
      return {
        start: attrToken.interval.start,
        end: attrToken.interval.end,
        highlight : {
          start : attrToken.interval.start,
          end : attrToken.interval.end
        },
        attribute: {
          name: {
            value: attrToken.value
          }
        },
        cursor: attrToken.interval.start
      };
    },
    MULTIPLE_ATTR_NAMESPACES: function(parser, attrToken) {
      return {
        start: attrToken.interval.start,
        end: attrToken.interval.end,
        attribute: {
          name: {
            value: attrToken.value
          }
        },
        cursor: attrToken.interval.start,
        token : token
      };
    },
    UNSUPPORTED_ATTR_NAMESPACE: function(parser, attrToken, token) {
      return {
        start: attrToken.interval.start,
        end: attrToken.interval.end,
        attribute: {
          name: {
            value: attrToken.value
          }
        },
        cursor: attrToken.interval.start,
        token : token
      };
    },
    UNBOUND_ATTRIBUTE_VALUE: function(parser, valueToken, token) {
      return {
        value: valueToken.value,
        interval: valueToken.interval,
        cursor: valueToken.interval.start,
        token : token
      };
    },
    UNTERMINATED_OPEN_TAG: function(parser, token) {
      var currentNode = parser.domBuilder.currentNode,
          openTag = {
            start: currentNode.parseInfo.openTag.start,
            end: parser.stream.pos,
            name: currentNode.nodeName.toLowerCase()
          };
      return {
        openTag: openTag,
        cursor: openTag.start,
        token : token
      };
    },
    SELF_CLOSING_NON_VOID_ELEMENT: function(parser, tagName, token) {
      var start = parser.domBuilder.currentNode.parseInfo.openTag.start,
          end = parser.stream.makeToken().interval.end;
      return {
        name: tagName,
        start: start,
        end: end,
        cursor: start,
        token : token
      };
    },
    UNTERMINATED_CLOSE_TAG: function(parser, token) {
      var currentNode = parser.domBuilder.currentNode;
      var end = parser.stream.pos;
      if (!parser.stream.end()) {
        end = parser.stream.makeToken().interval.start;
      }
      var closeTag = {
            name: currentNode.nodeName.toLowerCase(),
            start: currentNode.parseInfo.closeTag.start,
            end: end
          };
      return {
        closeTag: closeTag,
        cursor: closeTag.start,
        token : token
      };
    },
    //Special error type for a http link does not work in a https page
    HTTP_LINK_FROM_HTTPS_PAGE: function(parser, nameTok, valueTok, token) {
      var currentNode = parser.domBuilder.currentNode,
          openTag = this._combine({
            name: currentNode.nodeName.toLowerCase()
          }, currentNode.parseInfo.openTag),
          attribute = {
            name: {
              value: nameTok.value,
              start: nameTok.interval.start,
              end: nameTok.interval.end
            },
            value: {
              start: valueTok.interval.start + 1,
              end: valueTok.interval.end - 1
            }
          };
      return {
        openTag: openTag,
        attribute: attribute,
        cursor: attribute.value.start,
        token : token
      };
    },
    // These are CSS errors.
    UNKOWN_CSS_KEYWORD: function(parser, start, end, value, token) {
      return {
        cssKeyword: {
          start: start,
          end: end,
          value: value
        },
        cursor: start,
        token : token
      };
    },
    MISSING_CSS_SELECTOR: function(parser, start, end, token) {
      return {
        cssBlock: {
          start: start,
          end: end
        },
        cursor: start,
        token : token
      };
    },
    UNFINISHED_CSS_SELECTOR: function(parser, start, end, selector, token) {
      return {
        cssSelector: {
          start: start,
          end: end,
          selector: selector
        },
        cursor: start,
        token : token
      };
    },
    MISSING_CSS_BLOCK_OPENER: function(parser, start, end, selector) {
      console.log("MISSING_CSS_BLOCK_OPENER");
      console.log(parser);

      return {
        cssSelector: {
          start: start,
          end: end,
          selector: selector
        },
        cursor: start
      };
    },
    INVALID_CSS_PROPERTY_NAME: function(parser, start, end, property) {
      return {
        cssProperty: {
          start: start,
          end: end,
          property: property
        },
        cursor: start,
        highlight : {
          start: start,
          end: end
        }
      };
    },
    MISSING_CSS_PROPERTY: function(parser, start, end, selector, token) {
      return {
        cssSelector: {
          start: start,
          end: end,
          selector: selector
        },
        cursor: start,
        token : token
      };
    },
    UNFINISHED_CSS_PROPERTY: function(parser, start, end, property, token) {
      return {
        cssProperty: {
          start: start,
          end: end,
          property: property
        },
        cursor: start,
        token : token
      };
    },
    MISSING_CSS_VALUE: function(parser, start, end, property, token) {
      return {
        cssProperty: {
          start: start,
          end: end,
          property: property
        },
        cursor: start,
        token : token
      };
    },
    UNFINISHED_CSS_VALUE: function(parser, start, end, value, token) {
      return {
        cssValue: {
          start: start,
          end: end,
          value: value
        },
        cursor: start,
        token : token
      };
    },
    CSS_MIXED_ACTIVECONTENT: function(parser, property, propertyStart, value, valueStart, valueEnd, token) {
      var cssProperty = {
            property: property,
            start: propertyStart,
            end: propertyStart + property.length
          },
          cssValue = {
            value: value,
            start: valueStart,
            end: valueEnd
          };
      return {
        cssProperty: cssProperty,
        cssValue: cssValue,
        cursor: cssValue.start,
        token : token
      };
    },
    MISSING_CSS_BLOCK_CLOSER: function(parser, start, end, value) {
      return {
        cssValue: {
          start: start,
          end: end,
          value: value
        },
        cursor: start,
        highlight: {
          start: start,
          end: end
        }
      };
    },
    UNCAUGHT_CSS_PARSE_ERROR: function(parser, start, end, msg, token) {
      return {
        error: {
          start: start,
          end: end,
          msg: msg
        },
        cursor: start,
        token : token
      };
    },
    UNTERMINATED_CSS_COMMENT: function(start, token) {
      return {
        start: start,
        cursor: start,
        token : token
      };
    },
    HTML_CODE_IN_CSS_BLOCK: function(parser, start, end, token) {
      return {
        html: {
          start: start,
          end: end
        },
        cursor: start,
        token : token
      };
    }
  };
  return ParseErrorBuilders;

}());
