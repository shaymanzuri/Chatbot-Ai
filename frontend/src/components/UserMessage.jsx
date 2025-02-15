import PropTypes from "prop-types";

const propTypes = {
    text: PropTypes.string,
  };

export default function UserMessage({ text }) {
  return (
    <div className="message-container">
      <div className="user-message">{text}</div>
    </div>
  );
}


UserMessage.propTypes = propTypes;
