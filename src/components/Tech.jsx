import { BallCanvas } from "./canvas";
import { styles } from '../style';
import { motion } from 'framer-motion';
import { SectionWrapper } from "../hoc";
import { textVariant } from '../utils/motion';
import { technologies } from "../constants";

const Tech = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>My Expertise</p>
        <h2 className={styles.sectionHeadText}>Tech Stacks</h2>
      </motion.div>
      <div className="flex flex-row flex-wrap
    justify-center gap-10">
        {technologies.map((technology) => (
          <div className="w-28 h-28" key={technology.name}>
            <BallCanvas icon={technology.icon} />
          </div>
        ))}
      </div>
    </>
  )
}

export default SectionWrapper(Tech, "skills")