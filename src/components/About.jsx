import React from 'react';
import { Tilt } from 'react-tilt';
import { motion } from 'framer-motion';
import { styles } from '../style';
import { services } from '../constants';
import { fadeIn, textVariant } from '../utils/motion';
import { SectionWrapper } from '../hoc';

const ServiceCard = ({ index, title, icon }) => {
  return (
    <Tilt className="xs:w-[250px] w-full">
      <motion.div
        variants={fadeIn("right", "spring", 0.5 * index, 0.75)}
        className="w-full bg-gradient-to-t from-purple-700 to-indigo p-[1px] rounded-[20px] shadow-card">
        <div options={{ max: 45, scale: 1, speed: 450 }}
          className="bg-tertiary-100 rounded-[20px] py-5 px-12
        min-h-[280px] flex justify-evenly items-center flex-col">
          <img src={icon} alt={title} className="w-16 h-16 object-contain" />
          <h3 className="text-darkblue text-[20px] font-bold
        text-center">{title}</h3>
        </div>
      </motion.div>
    </Tilt>
  )
}


const About = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>Introduction</p>
        <h2 className={styles.sectionHeadText}>Overview</h2>
      </motion.div>
      <motion.p
        variants={fadeIn("", "", 0.1, 1)}
        className="mt-4 text-secondary text-[17px] max-w-3xl leading-[30px]">
        I'm a dedicated coding lover with a deep passion for AI/ML and technology.
        My journey is driven by curiosity and a commitment to creating powerful yet simple solutions.
        With strong skills in C++ and Python, and hands-on experience with frameworks like React Three Fiber
        and tools like OpenCV, I excel at optimizing code and solving complex problems.
        I'm always exploring new technologies and pushing the boundaries of what's possible.
        Check out my portfolio, and if you're interested in collaboration or tech discussions, fell free to connect!
      </motion.p>

      <div className="mt-20 flex flex-wrap gap-10">
        {services.map((service, index) => (
          <ServiceCard key={service.title} index={index} {...service} />
        ))}
      </div>
    </>
  )
}

export default SectionWrapper(About, "about")