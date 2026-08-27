import { motion } from "framer-motion";
import { ArrowDownRight } from "lucide-react";
import Button from "../../components/common/Button";

export default function Hero() {
  return (
    <section className="hero-bg relative flex min-h-screen min-h-[100svh] items-center justify-center overflow-hidden">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/65" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-7xl px-4 text-center sm:px-6 lg:px-10"
      >
        <h1
          className="
            heading
            mx-auto
            max-w-full
            text-[clamp(3rem,14vw,5.75rem)]
            leading-[0.92]
            uppercase
            md:text-[clamp(5.75rem,10vw,7rem)]
            xl:whitespace-nowrap
            xl:text-[clamp(4.5rem,12.5vw,11rem)]
            xl:leading-none
          "
        >
          REACH YOUR <span className="block text-accent xl:inline">PEAK</span>
        </h1>

        <Button href="#about" className="mt-7 w-full max-w-60 sm:mt-10 sm:w-auto sm:max-w-none">
          Explore FitOps
          <ArrowDownRight
            className="ml-3 inline-block h-5 w-5"
            strokeWidth={2.5}
          />
        </Button>
      </motion.div>
    </section>
  );
}
