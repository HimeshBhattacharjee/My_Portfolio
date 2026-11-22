import { cv } from "../../data";
import { DownloadIcon } from "./Icons";

// The one way to download the résumé, used in the hero, the navigation, the phone menu and
// the contact list and the footer. The file is a byte-identical copy of the supplied PDF.
const VARIANTS = {
    button: "btn btn--ghost",
    nav: "nav-cv label",
    menu: "btn btn--primary",
    row: "index__row contact-link",
    footer: "footer-link",
};

const DownloadCV = ({ variant = "button", className = "", children = "Download CV" }) => (
    <a
        href={cv.href}
        download={cv.filename}
        type="application/pdf"
        className={`${VARIANTS[variant]} ${className}`}
        aria-label={`Download CV, PDF, ${cv.size}`}
    >
        {variant === "row" ? (
            <>
                <span>{children}</span>
                <span className="label contact-link__display">PDF · {cv.size}</span>
                <DownloadIcon width={15} height={15} />
            </>
        ) : (
            <>
                {children}
                <DownloadIcon width={variant === "nav" ? 14 : 16} height={variant === "nav" ? 14 : 16} />
            </>
        )}
    </a>
);

export default DownloadCV;