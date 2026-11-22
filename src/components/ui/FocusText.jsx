import { useRef } from "react";
import { useFocusText } from "../../hooks/useFocusText";

// A block of writing that responds to where it sits in the viewport (see useFocusText).
// Renders a plain element, so it can wrap any paragraph, heading or group.
const FocusText = ({ as: Tag = "div", className = "", children, ...rest }) => {
    const ref = useRef(null);
    useFocusText(ref);
    return (
        <Tag ref={ref} className={`focus-text ${className}`} {...rest}>
            {children}
        </Tag>
    );
};

export default FocusText;