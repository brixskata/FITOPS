import { motion } from 'framer-motion'
import SectionTitle from '../../components/common/SectionTitle'
import aboutOne from '../../assets/images/about/about-1.webp'
import aboutTwo from '../../assets/images/about/about-2.webp'

export default function About() {
  return (
    <section
      id="about"
      className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center lg:gap-24 lg:px-10 lg:py-32"
    >
      <div>
        <SectionTitle
          eyebrow="About FitOps"
          title={
            <>
              Built for those who
              <br />
              <span className="text-accent">show up.</span>
            </>
          }
        />
        <p className="mt-8 max-w-lg text-base leading-8 text-gray-300">
          FitOps is a space for focused training, real community, and lasting results. Whether
          you are starting fresh or pushing toward your next personal best, everything you need
          is here.
        </p>
        <p className="mt-5 max-w-lg text-base leading-8 text-gray-300">
          Our coaches, equipment, and people keep you moving forward—one strong session at a time.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <motion.img
          loading="lazy"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3 }}
          src={aboutOne}
          alt="Athlete training in the gym"
          className="mt-12 h-72 w-full object-cover sm:h-96"
        />
        <motion.img
          loading="lazy"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3 }}
          src={aboutTwo}
          alt="Strength training equipment"
          className="h-72 w-full object-cover sm:h-96"
        />
      </div>
    </section>
  )
}
