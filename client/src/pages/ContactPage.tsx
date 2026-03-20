import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';

const faqs = [
  {
    q: 'Làm sao để đăng tin cho thuê?',
    a: 'Đăng ký tài khoản và chọn "Đăng tin cho thuê" trên thanh menu. Hiện tại HomeSpot đang miễn phí hoàn toàn trong 6 tháng đầu.',
  },
  {
    q: 'Chi phí đăng tin như thế nào?',
    a: '🎉 Miễn phí 100% trong 6 tháng đầu! Sau đó sẽ có các gói trả phí với nhiều tính năng nổi bật.',
  },
  {
    q: 'Tôi có thể chỉnh sửa tin đã đăng không?',
    a: 'Có, bạn có thể chỉnh sửa thông tin bài đăng bất kỳ lúc nào trong trang quản lý của mình.',
  },
  {
    q: 'Có giới hạn số lượng tin đăng không?',
    a: 'Trong thời gian khuyến mãi 6 tháng đầu, bạn có thể đăng không giới hạn số lượng tin.',
  },
  {
    q: 'Dữ liệu cá nhân của tôi có được bảo mật không?',
    a: 'Hoàn toàn bảo mật. Chúng tôi cam kết tuân thủ quy định bảo vệ dữ liệu cá nhân và không chia sẻ thông tin của bạn cho bên thứ ba.',
  },
];

const ContactPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-20 px-6 relative overflow-hidden"
      >
        <img
          src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1600&q=80"
          alt="Vietnam cityscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(2,44,34,0.92) 0%, rgba(6,78,59,0.88) 50%, rgba(6,95,70,0.85) 100%)' }} />
        <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight relative z-10">
          Liên hệ với chúng tôi
        </h1>
        <p className="text-white/70 text-sm max-w-md mx-auto leading-relaxed relative z-10">
          Có câu hỏi về dịch vụ cho thuê bất động sản? Đội ngũ HomeSpot luôn sẵn sàng hỗ trợ bạn 24/7
        </p>
      </motion.div>

      {/* Contact Section: Info + Form */}
      <div className="max-w-6xl mx-auto px-6 -mt-8 pb-10 relative z-10">
        <div className="flex gap-8 flex-col lg:flex-row">

          {/* Left — Contact Info */}
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:w-[380px] flex-shrink-0"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-5">Thông tin liên hệ</h2>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-4">
                CÔNG TY TNHH HOMESPOT
              </p>
              <div className="flex flex-col gap-5">
                <div className="flex gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Địa chỉ</p>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                      Tầng 5, số 31 Tân Đà, Phường Thanh Khê, Thành phố Đà Nẵng, Việt Nam
                    </p>
                  </div>
                </div>
                <div className="flex gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Điện thoại</p>
                    <p className="text-xs text-slate-500 mt-0.5">0862994779</p>
                  </div>
                </div>
                <div className="flex gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Email</p>
                    <p className="text-xs text-slate-500 mt-0.5">support@homespot.vn</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — Contact Form */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1"
          >
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Gửi tin nhắn cho chúng tôi</h2>
              <p className="text-sm text-slate-500 mb-6">
                Điền thông tin bên dưới và chúng tôi sẽ phản hồi sớm nhất có thể
              </p>
              <form className="flex flex-col gap-5">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Họ và tên <span className="text-red-400">*</span>
                    </label>
                    <input type="text" placeholder="Nhập họ và tên của bạn" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-700/10 transition-all" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Số điện thoại <span className="text-red-400">*</span>
                    </label>
                    <input type="tel" placeholder="0912 345 678" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-700/10 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email <span className="text-red-400">*</span></label>
                  <input type="email" placeholder="email@example.com" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-700/10 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tiêu đề <span className="text-red-400">*</span></label>
                  <input type="text" placeholder="Chủ đề bạn muốn trao đổi" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-700/10 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nội dung <span className="text-red-400">*</span></label>
                  <textarea rows={5} placeholder="Mô tả chi tiết vấn đề bạn gặp phải hoặc câu hỏi cần hỗ trợ..." className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-700/10 transition-all resize-none" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Gửi tin nhắn
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── FAQ Section (full-width, below form) ─── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="max-w-6xl mx-auto px-6 pb-16"
      >
        <div className="flex gap-12 flex-col lg:flex-row">
          {/* Left — Title + "Still have questions?" */}
          <div className="lg:w-[380px] flex-shrink-0 flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mb-4 uppercase tracking-wide">
                Hỗ trợ
              </span>
              <h2 className="text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                Câu hỏi<br />thường gặp
              </h2>
            </div>

            {/* "Still have questions?" card */}
            <div className="mt-8 rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)' }}>
              <h3 className="text-lg font-bold mb-2">Vẫn còn câu hỏi?</h3>
              <p className="text-white/70 text-xs leading-relaxed mb-4">
                Không tìm thấy câu trả lời? Gửi email cho chúng tôi và chúng tôi sẽ phản hồi sớm nhất!
              </p>
              <a
                href="mailto:support@homespot.vn"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-800 text-xs font-bold rounded-lg hover:bg-white/90 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Gửi email
              </a>
            </div>
          </div>

          {/* Right — FAQ Accordion */}
          <div className="flex-1 flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className={`bg-white rounded-2xl border transition-all duration-300 ${
                  openFaq === i ? 'border-emerald-200 shadow-md shadow-emerald-100/50' : 'border-slate-100 shadow-sm'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-[15px] font-semibold text-slate-800 leading-snug">
                    {faq.q}
                  </span>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    openFaq === i ? 'bg-emerald-700 rotate-180' : 'bg-slate-100'
                  }`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-4 h-4 transition-colors ${openFaq === i ? 'text-white' : 'text-emerald-700'}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ContactPage;
