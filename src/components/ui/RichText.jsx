import { Fragment } from "react";

// Renders a content string in which **double asterisks** mark emphasis. Content stays plain
// text in the data files; presentation decides what emphasis looks like.
const RichText = ({ text }) =>
    String(text)
        .split(/(\*\*[^*]+\*\*)/g)
        .filter(Boolean)
        .map((part, index) =>
            part.startsWith("**") && part.endsWith("**") ? (
                <strong key={index}>{part.slice(2, -2)}</strong>
            ) : (
                <Fragment key={index}>{part}</Fragment>
            ),
        );

export default RichText;