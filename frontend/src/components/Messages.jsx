import { useEffect,useRef } from "react";

const TextWithNewlines = ({ texts }) => {
  // Ensure texts is an array
  if (!Array.isArray(texts)) {
    return null; // or some default value or error message
  }

  return (
    <div>
      {texts.map((text, index) => (
        <div key={index}>
          {text.split('\n').map((line, lineIndex) => (
            <React.Fragment key={lineIndex}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
};


// eslint-disable-next-line react/prop-types
export default function Messages({ messages }) {
  const el = useRef(null);

  // const splitSegments =splitText(rs)
  useEffect(() => {
    el.current.scrollIntoView({ block: "end", behavior: "smooth" });
  });
  return (
    <div className="messages">
      {messages}
      <div id={"el"} ref={el} />
    </div>
  );
}
