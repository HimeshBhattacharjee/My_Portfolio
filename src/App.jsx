import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import { About, Contact, Expertise, Footer, Hero, Journey, Navbar, Recognition, Work } from "./components";
import { useAnchorScroll } from "./hooks/useAnchorScroll";

const App = () => {
    useAnchorScroll();

    return (
        // LazyMotion loads only the animation features the site uses (variants, enter/exit,
        // in-view). `strict` throws if a full `motion.*` component is used by mistake.
        <LazyMotion features={domAnimation} strict>
            <MotionConfig reducedMotion="user">
                <a href="#main" className="skip-link">
                    Skip to content
                </a>
                <Navbar />
                <main id="main">
                    <Hero />
                    <Work />
                    <Journey />
                    <About />
                    <Expertise />
                    <Recognition />
                    <Contact />
                </main>
                <Footer />
            </MotionConfig>
        </LazyMotion>
    );
};

export default App;