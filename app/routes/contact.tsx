import type {MetaFunction} from 'react-router';
import {useState} from 'react';

export const meta: MetaFunction = () => {
  return [{title: 'FlashBind | Contact Us'}];
};

export default function ContactPage() {
  const [status, setStatus] = useState<'' | 'submitting' | 'succeeded' | 'error'>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    const form = e.currentTarget;
    const data = new FormData(form);
    
    fetch(form.action, {
      method: form.method,
      body: data,
      headers: {
        'Accept': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        setStatus('succeeded');
        form.reset();
      } else {
        response.json().then(data => {
            if (Object.prototype.hasOwnProperty.call(data, 'message')) {
              alert("Error: " + data.message);
            } else {
              alert("Oops! There was a problem submitting your form.");
            }
            setStatus('error');
          }).catch(() => {
            alert("Error parsing response.");
            setStatus('error');
          });
        }
      }).catch(error => {
        console.error("Fetch Network Error:", error);
        alert("Network Error: Could not connect. Please check your internet connection.");
        setStatus('error');
      });
    };
    return (
      <div className="min-h-screen bg-[#FDFCF8] relative overflow-hidden flex items-center justify-center py-24">
        {/* Background glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[10%] -left-[10%] w-[500px] h-[500px] bg-[#F5F4EE] rounded-full blur-[100px] opacity-80"></div>
          <div className="absolute bottom-[10%] -right-[10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
        </div>
  
        <div className="container mx-auto px-6 max-w-lg relative z-10">
          <div className="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] border-2 border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Contact Us</h1>
              <p className="text-slate-500 text-lg">
                Have questions about bulk encoding, white-labeling, or anything else? Send us a message and we'll get right back to you.
              </p>
            </div>
  
            {status === 'succeeded' ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-2xl text-center">
                <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                <p>Thanks for reaching out. We'll get back to you shortly.</p>
                <button 
                  onClick={() => setStatus('')}
                  className="mt-6 px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form action="https://api.web3forms.com/submit" method="POST" encType="multipart/form-data" onSubmit={handleSubmit} className="space-y-6">
                <input type="hidden" name="access_key" value="4fe03905-e3fa-46e8-a387-364c3763d0ad" />
                <input type="hidden" name="subject" value="New Contact/Design Request from FlashBind" />
                <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />
                
                {status === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-semibold">
                    Oops! There was a problem submitting your form. Please try again.
                  </div>
                )}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="you@company.com"
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all outline-none text-slate-900"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900">
                  Do you already have a design ready?
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="has_design" 
                      value="yes" 
                      checked={hasDesign === 'yes'}
                      onChange={(e) => setHasDesign(e.target.value)}
                      className="w-4 h-4 text-[#1E3A8A] focus:ring-[#1E3A8A] border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700">Yes, I have a design</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="has_design" 
                      value="no" 
                      checked={hasDesign === 'no'}
                      onChange={(e) => setHasDesign(e.target.value)}
                      className="w-4 h-4 text-[#1E3A8A] focus:ring-[#1E3A8A] border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700">No, I need one</span>
                  </label>
                </div>
              </div>

              {hasDesign === 'yes' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label htmlFor="design_attachment" className="block text-sm font-bold text-slate-900 mb-2">
                    Attach Your Design
                  </label>
                  <input
                    type="file"
                    id="design_attachment"
                    name="attachment"
                    accept="image/*,.pdf,.ai,.eps,.psd"
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#1E3A8A]/10 file:text-[#1E3A8A] hover:file:bg-[#1E3A8A]/20 transition-all cursor-pointer border border-slate-200 rounded-xl bg-white/50"
                  />
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    Upload your logo or design (PNG, JPG, PDF, AI). 
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="message" className="block text-sm font-bold text-slate-900 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="How can we help you?"
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all outline-none text-slate-900 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-[#1E3A8A] hover:scale-[1.02] shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Or email us directly at <a href="mailto:info@flashbind.com" className="text-[#1E3A8A] font-bold hover:underline">info@flashbind.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
