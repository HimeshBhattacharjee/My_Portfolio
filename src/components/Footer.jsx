import { profile, publishedLinks, sections } from "../data";
import BrandMark from "./ui/BrandMark";
import Cosmos from "./ui/Cosmos";
import DownloadCV from "./ui/DownloadCV";
import { ArrowUpRight } from "./ui/Icons";

// The close of the page: the mark and a line about me, the section index, and every way
// to reach me, under the same night sky as the Contact section above it.
const Footer = () => {
    const fullName = `${profile.name.first} ${profile.name.last}`;
    const year = new Date().getFullYear();

    return (
        <footer className="footer" aria-labelledby="footer-title">
            <Cosmos variant="footer" />
            <div className="shell footer__grid">
                <div className="footer__brand">
                    <BrandMark variant="footer" />
                    <div>
                        <p id="footer-title" className="footer__name">
                            {fullName}
                        </p>
                        <p className="label footer__role">
                            <span>Electronics &amp; Communication Engineer</span> <span>· Software Developer</span>
                        </p>
                    </div>
                    <p className="footer__line">{profile.statement}</p>
                </div>

                <nav className="footer__col" aria-label="Footer">
                    <p className="label footer__head">Index</p>
                    <ul>
                        {sections.map((section) => (
                            <li key={section.id}>
                                <a href={`#${section.id}`} className="footer-link">
                                    <span className="label footer-link__num">{section.index}</span>
                                    <span>{section.label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="footer__col">
                    <p className="label footer__head">Connect</p>
                    <ul>
                        {publishedLinks.map((link) => {
                            const external = !link.url.startsWith("mailto:");
                            return (
                                <li key={link.id}>
                                    <a href={link.url} className="footer-link" {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
                                        <span>{link.label}</span>
                                        <ArrowUpRight width={13} height={13} aria-hidden="true" />
                                        {external && <span className="sr-only">(opens in a new tab)</span>}
                                    </a>
                                </li>
                            );
                        })}
                        <li>
                            <DownloadCV variant="footer">CV</DownloadCV>
                        </li>
                    </ul>
                    <p className="label footer__place">{profile.location}</p>
                </div>
            </div>

            <div className="shell">
                <div className="footer__base label">
                    <span>
                        © {year} {fullName}
                    </span>
                    <span className="footer__credit">Built with React, Three.js and Framer Motion</span>
                    <a href="#top" className="footer__top">
                        Back to top
                        <span className="footer__top-arrow" aria-hidden="true" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;