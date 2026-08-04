import { motion } from 'framer-motion'
import SectionTitle from '../../components/common/SectionTitle'
import offerOne from '../../assets/images/offers/offer-1.webp'
import offerTwo from '../../assets/images/offers/offer-2.webp'
import offerThree from '../../assets/images/offers/offer-3.webp'

const offers = [
  {
    title: 'Strength',
    image: offerOne,
    text: 'Build power with purposeful coaching and serious equipment.',
  },
  {
    title: 'Conditioning',
    image: offerTwo,
    text: 'Improve your engine with training that meets you where you are.',
  },
  {
    title: 'Community',
    image: offerThree,
    text: 'Find a crew that makes every session worth showing up for.',
  },
]

export default function Offer() {
  return (
    <section id="offers" className="bg-[#181818] px-6 py-24 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="What we offer"
          title={
            <>
              More than a
              <br />
              <span className="text-accent">workout.</span>
            </>
          }
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {offers.map((offer, index) => (
            <motion.article
              key={offer.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="h-64 overflow-hidden">
                <img
                  loading="lazy"
                  src={offer.image}
                  alt={offer.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="border-b border-white/15 py-6">
                <p className="mb-3 text-xs font-bold text-accent">0{index + 1}</p>
                <h3 className="heading text-3xl uppercase italic">{offer.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">{offer.text}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
