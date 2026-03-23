"use client";

import { motion } from "framer-motion";
import { stagger, fadeUp } from "@/components/ui/motion";

const REVIEWS = [
  {
    id: 1,
    name: "Ahmed Raza",
    city: "Lahore",
    rating: 5,
    text: "Got the Royal Chronograph Black — absolutely amazing quality. The packaging was super professional too. Payment via JazzCash was seamless. Highly recommend!",
    watch: "Royal Chronograph Black",
    avatar: "AR",
  },
  {
    id: 2,
    name: "Fatima Khan",
    city: "Karachi",
    rating: 5,
    text: "The Rose Gold Ladies watch was my wedding anniversary gift. My husband ordered from MaxWatches — it arrived on time and the watch is absolutely gorgeous. Thank you!",
    watch: "Rose Gold Diamond Ladies",
    avatar: "FK",
  },
  {
    id: 3,
    name: "Usman Ali",
    city: "Islamabad",
    rating: 5,
    text: "The SmartPro X5 heart rate monitor is incredibly accurate. I use it daily at the gym. Build quality is excellent and the price is very reasonable. COD availability was a big plus.",
    watch: "SmartPro X5",
    avatar: "UA",
  },
  {
    id: 4,
    name: "Sara Malik",
    city: "Faisalabad",
    rating: 5,
    text: "The Classic Minimalist White watch is perfect for the office. Lightweight, stylish, and affordable. Got a delivery update within an hour — customer service is top notch!",
    watch: "Classic Minimalist White",
    avatar: "SM",
  },
  {
    id: 5,
    name: "Bilal Hassan",
    city: "Peshawar",
    rating: 5,
    text: "Took the ProDiver 300M to the beach — rock solid. The water resistance claim is 100% true. EasyPaisa payment was smooth. The whole experience is 10/10.",
    watch: "ProDiver 300M",
    avatar: "BH",
  },
  {
    id: 6,
    name: "Zainab Mirza",
    city: "Multan",
    rating: 4,
    text: "The Pearl Ceramic Ladies watch is beautiful and arrived faster than expected. Packaging was very premium. Definitely order from here — you won&apos;t be disappointed.",
    watch: "Pearl Ceramic White Ladies",
    avatar: "ZM",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-[#c9a84c]" : "text-[#d2d2d7]"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function ReviewsSection() {
  return (
    <section className="py-20 bg-[#f5f5f7]">
      <div className="max-w-[1200px] mx-auto px-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium text-[#c9a84c] mb-2 uppercase tracking-wider">
            Customer Reviews
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f] mb-3">
            What Our Customers Say
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className="w-5 h-5 text-[#c9a84c]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[15px] font-semibold text-[#1d1d1f]">4.9</span>
            <span className="text-sm text-[#6e6e73]">· 2,400+ reviews</span>
          </div>
        </motion.div>

        {/* Reviews grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {REVIEWS.map((review) => (
            <motion.div
              key={review.id}
              variants={fadeUp}
              className="bg-white rounded-2xl p-6 border border-[#d2d2d7]/60 hover:shadow-md transition-shadow duration-300"
            >
              {/* Stars */}
              <StarRating rating={review.rating} />

              {/* Review text */}
              <p className="text-[#1d1d1f] text-[15px] leading-relaxed mt-3 mb-4">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Watch tag */}
              <p className="text-xs text-[#c9a84c] font-medium bg-[#c9a84c]/10 rounded-full px-2.5 py-1 inline-block mb-4">
                ⌚ {review.watch}
              </p>

              {/* Reviewer */}
              <div className="flex items-center gap-3 border-t border-[#f5f5f7] pt-4">
                <div className="w-9 h-9 rounded-full bg-[#1d1d1f] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {review.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1d1d1f]">{review.name}</p>
                  <p className="text-xs text-[#6e6e73]">{review.city}, Pakistan</p>
                </div>
                <svg className="ml-auto w-5 h-5 text-[#34c759]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
