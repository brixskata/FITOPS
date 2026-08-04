import SectionTitle from '../../components/common/SectionTitle'
import testimonialOne from '../../assets/images/testimonials/testimonial-1.webp'
import testimonialTwo from '../../assets/images/testimonials/testimonial-2.webp'
import testimonialThree from '../../assets/images/testimonials/testimonial-3.webp'

const testimonials = [
  {
    quote: 'FitOps gave me the structure and confidence to become stronger than I thought possible.',
    name: 'Maya R.',
    detail: 'Member since 2021',
    image: testimonialOne,
  },
  {
    quote: 'The best part is the people. Every workout feels like you are part of something bigger.',
    name: 'Andre T.',
    detail: 'Member since 2022',
    image: testimonialTwo,
  },
  {
    quote: 'No egos, no shortcuts—just great coaching and a place that makes me want to come back.',
    name: 'Jess L.',
    detail: 'Member since 2023',
    image: testimonialThree,
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
      <SectionTitle
        eyebrow="Testimonials"
        title={
          <>
            Real people.
            <br />
            <span className="text-accent">Real work.</span>
          </>
        }
      />
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {testimonials.map((item) => (
          <article key={item.name} className="flex flex-col justify-between border border-white/10 p-7">
            <div>
              <p className="text-4xl leading-none text-accent">“</p>
              <p className="mt-4 text-lg leading-8 text-gray-200">{item.quote}</p>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <img
                loading="lazy"
                src={item.image}
                alt={item.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-bold uppercase tracking-wide">{item.name}</p>
                <p className="mt-1 text-xs text-gray-500">{item.detail}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
