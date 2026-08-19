import React, { useState, useEffect } from 'react';

export default function FeedbackLanding() {
  const [showForm, setShowForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tagId, setTagId] = useState<string | null>(null);

  const googleReviewUrl = 'https://search.google.com/local/writereview?placeid=ChIJOQAp_yjZ5EYR3oelja4fpIk';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('tag_id');
    if (id) {
      setTagId(id);
    }
  }, []);

  const handleGoogleReview = () => {
    window.location.href = googleReviewUrl;
  };

  const handleContactManagement = () => {
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);
    try {
      /* 
       * SUPABASE INTEGRATION:
       * Uncomment the following lines when your Supabase client is ready.
       */
      // const { error } = await supabase
      //   .from('private_feedback')
      //   .insert([{ tag_id: tagId, feedback_text: feedbackText }]);
      // if (error) throw error;

      await new Promise(resolve => setTimeout(resolve, 800));
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Įvyko klaida. Prašome pabandyti dar kartą.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F4F5F7] text-[#313131] flex flex-col items-center justify-center p-4 sm:p-6 font-sans selection:bg-[#E51C23] selection:text-white">
      {/* Background Decor (Subtle gradient top) */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#313131] to-[#F4F5F7] opacity-5 pointer-events-none"></div>

      {/* Main Card Container */}
      <div className="w-full max-w-[420px] bg-white rounded-[28px] shadow-[0_20px_40px_rgb(0,0,0,0.06)] overflow-hidden relative z-10">
        
        {/* Brand Accent Top Line */}
        <div className="h-2 w-full bg-[#E51C23]"></div>

        {/* Header Section */}
        <div className="px-8 pt-10 pb-6 text-center">
          {/* Official Image Logo */}
          <div className="flex items-center justify-center mb-6 mt-3">
            <img 
              src="/melga-logo.png" 
              alt="Melga" 
              className="h-24 sm:h-[100px] w-auto object-contain"
            />
          </div>
          
          <h2 className="text-[24px] font-extrabold text-[#1A1A1A] mb-2.5 leading-tight tracking-tight">
            Dėkojame, kad renkatės mus!
          </h2>
          <p className="text-gray-500 text-[15px] leading-relaxed font-medium">
            Kaip vertinate mūsų aptarnavimą?
          </p>
        </div>

        {/* Content Section */}
        <div className="px-8 pb-10">
          {!showForm && !isSuccess ? (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Button 1: Public Review (Brand Red) */}
              <button
                onClick={handleGoogleReview}
                className="group relative w-full h-[56px] px-6 rounded-2xl bg-[#E51C23] text-white font-bold text-[16.5px] shadow-[0_6px_16px_rgba(229,28,35,0.25)] hover:bg-[#D3181E] hover:shadow-[0_8px_20px_rgba(229,28,35,0.35)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out"></div>
                <svg className="w-[22px] h-[22px] relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <span className="relative z-10">Palikti atsiliepimą Google</span>
              </button>

              {/* Button 2: Private Feedback (Clean White/Gray) */}
              <button
                onClick={handleContactManagement}
                className="group w-full h-[56px] px-6 rounded-2xl bg-white text-[#313131] font-semibold text-[16.5px] border-2 border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-gray-50 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 shadow-sm"
              >
                <div className="w-[22px] h-[22px] flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-[#E51C23]/10 transition-colors">
                  <svg className="w-[14px] h-[14px] text-[#313131] group-hover:text-[#E51C23] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span>Susisiekti su vadovais</span>
              </button>
            </div>
          ) : isSuccess ? (
            /* Success State */
            <div className="flex flex-col items-center justify-center py-6 text-center animate-in zoom-in-95 fade-in duration-500">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-[#E51C23]/10 rounded-full scale-150 animate-pulse"></div>
                <div className="w-16 h-16 bg-[#E51C23] rounded-full flex items-center justify-center relative z-10 shadow-[0_8px_20px_rgba(229,28,35,0.3)]">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#313131] mb-2 tracking-tight">Ačiū!</h3>
              <p className="text-gray-500 text-center px-2 leading-relaxed text-[15px] font-medium">
                Jūsų žinutė sėkmingai perduota padalinio vadovui.
              </p>
            </div>
          ) : (
            /* Private Feedback Form */
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 fade-in duration-400">
              <div className="relative">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Parašykite, kaip galėtume tobulėti..."
                  className="w-full h-36 p-5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-[#313131] placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#E51C23] focus:ring-4 focus:ring-[#E51C23]/10 resize-none transition-all text-[15px] leading-relaxed font-medium"
                  autoFocus
                  required
                />
              </div>
              
              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-3.5 rounded-xl bg-white border-2 border-gray-200 text-gray-500 font-bold hover:bg-gray-50 hover:text-[#313131] hover:border-gray-300 transition-all active:scale-[0.98]"
                >
                  Atšaukti
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !feedbackText.trim()}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-[#E51C23] text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#D3181E] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(229,28,35,0.2)]"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    "Siųsti žinutę"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Footer text */}
      <div className="mt-8 flex flex-col items-center gap-2 text-gray-400 text-[11px] font-bold tracking-widest uppercase relative z-10">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Saugi ir konfidenciali sistema
        </div>
      </div>
    </div>
  );
}
