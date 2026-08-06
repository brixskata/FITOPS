import { motion } from "framer-motion";
import { ArrowDownRight } from "lucide-react";
import Button from "../../components/common/Button";

export default function Hero() {
  return (
    <section className="hero-bg relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/65" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 px-6 text-center"
      >
        <h1
          className="
            heading
            whitespace-nowrap
            text-[clamp(4.5rem,13vw,11rem)]
            leading-none
            uppercase
          "
        >
          REACH YOUR <span className="text-accent">PEAK</span>
        </h1>

        <Button href="#about" className="mt-10">
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