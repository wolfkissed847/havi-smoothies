import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Send } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface RatingModalProps {
  orderId: string;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
}

const RATING_LABELS = {
  th: ['', 'ไม่ดีเลย', 'แย่', 'พอใช้', 'ดีมาก', 'ยอดเยี่ยม!'],
  en: ['', 'Terrible', 'Poor', 'Average', 'Very Good', 'Excellent!'],
};

const RATING_EMOJIS = ['', '😞', '😕', '😊', '😄', '🤩'];

const QUICK_REVIEWS = {
  th: [
    ['น้ำผลไม้สดมาก', 'รสชาติดีเยี่ยม', 'จัดส่งเร็ว', 'บรรจุภัณฑ์ดี'],
    ['รสชาติดีมาก', 'จัดส่งทันเวลา', 'สดชื่นมาก', 'ราคาคุ้มค่า'],
    ['โอเคพอใช้', 'รสชาติใช้ได้', 'มาถึงตรงเวลา', 'พอใจ'],
    ['แย่กว่าที่คิด', 'ส่งช้านิดหน่อย', 'รสชาติไม่สม่ำเสมอ'],
    ['ไม่ประทับใจ', 'ส่งช้ามาก', 'รสชาติผิดหวัง'],
  ],
  en: [
    ['Very fresh juice', 'Excellent taste', 'Fast delivery', 'Great packaging'],
    ['Great taste', 'On-time delivery', 'Very refreshing', 'Worth the price'],
    ['Decent quality', 'Acceptable taste', 'Arrived on time', 'Satisfied'],
    ['Worse than expected', 'Slightly late', 'Inconsistent taste'],
    ['Not impressed', 'Very late', 'Disappointing taste'],
  ],
};

export function RatingModal({ orderId, onClose, onSubmit }: RatingModalProps) {
  const { t, isEn, language } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const lang = isEn ? 'en' : 'th';
  const activeRating = hovered || rating;

  const handleQuickTag = (tag: string) => {
    setReview(prev => prev ? `${prev}, ${tag}` : tag);
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitted(true);
    await new Promise(r => setTimeout(r, 800));
    onSubmit(rating, review);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full max-w-md bg-white dark:bg-[#0d1f35] rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 text-center">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-[#0a2540] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-200 dark:shadow-amber-900/30">
              <Star className="w-7 h-7 text-white fill-white" />
            </div>
            <h3 className="text-gray-800 dark:text-white">{t('writeReview')}</h3>
            <p className="text-gray-400 text-xs mt-1">{orderId}</p>
          </div>

          <div className="px-6 pb-6 space-y-4">
            {/* Star Rating */}
            <div className="text-center">
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= activeRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-200 dark:text-gray-700 fill-gray-200 dark:fill-gray-700'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              {/* Rating label + emoji */}
              <AnimatePresence mode="wait">
                {activeRating > 0 && (
                  <motion.div
                    key={activeRating}
                    initial={{ opacity: 0, y: -6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="flex items-center justify-center gap-1.5"
                  >
                    <span className="text-2xl">{RATING_EMOJIS[activeRating]}</span>
                    <span className={`text-sm font-medium ${
                      activeRating >= 4 ? 'text-amber-500' : activeRating >= 3 ? 'text-[#00BDFE]' : 'text-gray-400'
                    }`}>
                      {RATING_LABELS[lang][activeRating]}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Tags */}
            {rating > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-hidden"
              >
                <p className="text-xs text-gray-400 mb-2">{isEn ? 'Quick tags:' : 'แท็กด่วน:'}</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_REVIEWS[lang][rating - 1].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleQuickTag(tag)}
                      className="px-2.5 py-1 rounded-full border border-[#D8F2FF] dark:border-[#0a2540] text-xs text-gray-500 dark:text-gray-400 hover:border-[#00BDFE] hover:text-[#00BDFE] hover:bg-[#F0FBFF] dark:hover:bg-[#00BDFE]/10 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Review Textarea */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1.5">
                {t('yourReview')} <span className="text-gray-300">{isEn ? '(optional)' : '(ไม่บังคับ)'}</span>
              </label>
              <textarea
                value={review}
                onChange={e => setReview(e.target.value)}
                placeholder={t('reviewPlaceholder')}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] bg-[#F8FBFF] dark:bg-[#030d1a] text-gray-800 dark:text-white text-sm outline-none focus:border-[#00BDFE] transition-colors resize-none"
              />
              <p className="text-right text-xs text-gray-300 mt-1">{review.length}/200</p>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={rating === 0 || submitted}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                rating > 0 && !submitted
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-200 dark:shadow-amber-900/30 hover:shadow-xl'
                  : 'bg-gray-100 dark:bg-[#0a2540] text-gray-400 cursor-not-allowed'
              }`}
            >
              {submitted ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {isEn ? 'Submitting...' : 'กำลังส่ง...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('submitReview')}
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
