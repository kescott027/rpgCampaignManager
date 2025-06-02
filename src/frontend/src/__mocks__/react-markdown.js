const React = require("react");

module.exports = (props) => {
  return <div data-testid="markdown">{props.children}</div>;
};
