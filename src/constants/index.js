import {
    htmlcssjs,
    aiml,
    cppy,
    javascript,
    typescript,
    html,
    css,
    reactjs,
    cpp,
    tailwind,
    nodejs,
    mongodb,
    git,
    flask,
    py,
    gurukul,
    future,
    nexus_ai,
    foodbot,
    ocr,
    threejs,
} from "../assets";

export const navLinks = [
    {
        id: "about",
        title: "About",
    },
    {
        id: "work",
        title: "Academics",
    },
    {
        id: "skills",
        title: "Skills",
    },
    {
        id: "projects",
        title: "Projects",
    },
    {
        id: "contact",
        title: "Contact",
    },
];

const services = [
    {
        title: "C++ & Python",
        icon: cppy,
    },
    {
        title: "HTML, CSS & Javascript",
        icon: htmlcssjs,
    },
    {
        title: "AI/ML Enthusiast",
        icon: aiml,
    },
    {
        title: "React Developer",
        icon: reactjs,
    },
];

const technologies = [
    {
        name: "C++",
        icon: cpp,
    },
    {
        name: "Python",
        icon: py,
    },
    {
        name: "HTML 5",
        icon: html,
    },
    {
        name: "CSS 3",
        icon: css,
    },
    {
        name: "JavaScript",
        icon: javascript,
    },
    {
        name: "TypeScript",
        icon: typescript,
    },
    {
        name: "React JS",
        icon: reactjs,
    },
    {
        name: "Tailwind CSS",
        icon: tailwind,
    },
    {
        name: "Three JS",
        icon: threejs,
    },
    {
        name: "Node JS",
        icon: nodejs,
    },
    {
        name: "MongoDB",
        icon: mongodb,
    },
    {
        name: "git",
        icon: git,
    },
    {
        name: "Flask",
        icon: flask,
    },
];

const experiences = [
    {
        title: "Class X",
        company_name: "Gurukul Vidya Mandir Secondary School",
        icon: gurukul,
        iconBg: "#383E56",
        date: "April 2018 - March 2019",
        points: [
            "Stood 2nd all over school with a score of 93.4% in ICSE. Felicitated for achieving the highest marks in 3 subjects.",
            "Secured 2nd position in Intra-school Chess competition.",
            "Actively participated in various extracurricular activities such as singing and also performed as the lead character in the Bengali act 'Abak Jalpan'.",
        ],
    },
    {
        title: "Class XII",
        company_name: "Gurukul Vidya Mandir Secondary School",
        icon: gurukul,
        iconBg: "#383E56",
        date: "April 2020 - March 2021",
        points: [
            "Majored in Physics, Chemistry, Maths and Computer Application",
            "Scored 95% in ISC, securing the 1st position all over the school.",
        ],
    },
    {
        title: "B.Tech in Electronics & Communication Engineering",
        company_name: "Future Institute of Engineering and Management",
        icon: future,
        iconBg: "#383E56",
        date: "Aug 2021 - Present",
        points: [
            "Up to 6th semester, maintained a CGPA of 8.79.",
            "Completed industrial training from Ardent Computech on Data Science, Artificial Intelligence, and Machine Learning using Python.",
            "Secured 1st position for writing the poem 'Unchosen Path' in 1st Year, which was showcased in the Department Wall Magazine.",
            "Led the winning team in the Inter College Project Competition, Invitare, organized by the ECE Department, FIEM in 2nd Year.",
        ],
    },
];

const testimonials = [
    {
        testimonial:
            "Himesh's passion for coding is unmatched; he's always the go-to person for solving complex problems.",
        name: "Debolina Saha",
        designation: "CEO",
        company: "Amazon",
        image: "https://randomuser.me/api/portraits/women/4.jpg",
    },
    {
        testimonial:
            "Collaborating with Himesh is a pleasure—his creativity and technical expertise always bring projects to the next level.",
        name: "Arup Roy",
        designation: "COO",
        company: "Google",
        image: "https://randomuser.me/api/portraits/men/5.jpg",
    },
    {
        testimonial:
            "Himesh's dedication to his work and his ability to think outside the box make him a true asset in any team.",
        name: "Priyanka Bal",
        designation: "CTO",
        company: "Apple",
        image: "https://randomuser.me/api/portraits/women/6.jpg",
    },
];

const projects = [
    {
        name: "AI Model - Nexus",
        description:
            "Developed and implemented an AI model with the help of Python libraries and Arduino IDE to enable several important task automations on a laptop/ computer with inbuilt voice and gesture control",
        tags: [
            {
                name: "python",
                color: "blue-text-gradient",
            },
            {
                name: "arduino",
                color: "green-text-gradient",
            },
            {
                name: "openai",
                color: "pink-text-gradient",
            },
        ],
        image: nexus_ai,
        source_code_link: "https://github.com/",
    },
    {
        name: "Pasinda Food Bot - Fenyx",
        description:
            "Built an AI chatbot using Python and Dialogflow and an intuitive web interface to facilitate food order and delivery tracking using chatbot",
        tags: [
            {
                name: "html",
                color: "blue-text-gradient",
            },
            {
                name: "css",
                color: "pink-text-gradient",
            },
            {
                name: "python",
                color: "orange-text-gradient",
            },
            {
                name: "dialogflow",
                color: "white-text-gradient",
            },
            {
                name: "sql",
                color: "green-text-gradient",
            },
        ],
        image: foodbot,
        source_code_link: "https://github.com/HimeshBhattacharjee/Pasinda_FoodBot.git",
    },
    {
        name: "Text OCR - AIScribe",
        description:
            "Developed an OCR software project using Python, Google Colab, and Streamlit. The project efficiently performs OCR on JPG and PNG images, accurately extracting and recognizing handwritten text and digits.",
        tags: [
            {
                name: "colab",
                color: "blue-text-gradient",
            },
            {
                name: "python",
                color: "green-text-gradient",
            },
            {
                name: "streamlit",
                color: "orange-text-gradient",
            },
        ],
        image: ocr,
        source_code_link: "https://github.com/HimeshBhattacharjee/All-Text-Digit-OCR.git",
    },
];

export { services, technologies, experiences, testimonials, projects };