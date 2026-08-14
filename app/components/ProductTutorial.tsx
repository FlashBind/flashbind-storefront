import {Link} from 'react-router';
import { useRef, useState } from 'react';

const TUTORIAL_DATA: Record<string, any> = {
  'google-review-stand': {
    title: 'How FlashBind Works',
    description: 'Get your smart stand set up in seconds. No apps to download, no batteries to charge. Just tap and boost your reviews.',
    steps: [
      {
        title: 'Tap',
        description: 'Customer taps the stand with their smartphone. Our built-in NFC chip instantly communicates—no app required.',
      },
      {
        title: 'Connect',
        description: 'They are instantly routed to your exact Google Review page without having to search or type anything.',
      },
      {
        title: 'Boost',
        description: 'Watch your 5-star reviews multiply with zero friction, leading to more customers and higher local rankings.',
      }
    ],
    dashboardTitle: 'Manage Your Links',
    dashboardDesc: 'Update your review link anytime, anywhere. Our intuitive dashboard makes it easy to keep information up to date.',
    dashboardPoints: [
      { title: 'Update instantly', desc: 'Change the destination URL on the fly.' },
      { title: 'Secure cloud storage', desc: 'Your links are safely stored in the cloud.' },
      { title: 'Track performance', desc: 'Monitor how many taps your stand receives.' }
    ]
  },
  'nfc-restaurant-menu-stand': {
    title: 'How FlashBind Works',
    description: 'Get your digital menu set up in seconds. No apps to download, no QR codes to squint at. Just tap and view.',
    steps: [
      {
        title: 'Tap',
        description: 'Diners simply tap the table stand with their smartphone. The menu opens instantly on their device.',
      },
      {
        title: 'Upload',
        description: 'Instantly link the stand to your live digital menu URL or upload a PDF from your free dashboard.',
      },
      {
        title: 'Serve',
        description: 'Guests browse the menu contact-free, instantly. Update your menu anytime without re-printing.',
      }
    ],
    dashboardTitle: 'Menu Management',
    dashboardDesc: 'Manage your digital menus anytime, anywhere. Update specials or prices instantly without re-printing.',
    dashboardPoints: [
      { title: 'Update instantly', desc: 'Change the menu link or PDF on the fly.' },
      { title: 'Secure cloud storage', desc: 'Your menus are safely stored in the cloud.' },
      { title: 'Track performance', desc: 'Monitor how many times your menu is viewed.' }
    ]
  },
  'guest-wi-fi-hub': {
    title: 'How FlashBind Works',
    description: 'Get your Wi-Fi Hub set up in seconds. Stop spelling out long passwords and get guests connected instantly.',
    steps: [
      {
        title: 'Tap',
        description: 'Guests tap the hub with their smartphone to instantly prompt a connection to your secure Wi-Fi network.',
      },
      {
        title: 'Configure',
        description: 'You securely input your network credentials into the dashboard once. The hub encrypts and stores the data.',
      },
      {
        title: 'Connect',
        description: 'Guests join your network instantly without typing a password, improving their experience at your venue.',
      }
    ],
    dashboardTitle: 'Network Settings',
    dashboardDesc: 'Manage your Wi-Fi settings securely. Update your password anytime without needing to replace the hub.',
    dashboardPoints: [
      { title: 'Update instantly', desc: 'Change your Wi-Fi password on the fly.' },
      { title: 'Encrypted storage', desc: 'Your credentials are encrypted and secure.' },
      { title: 'No more signs', desc: 'Never write a password on a chalkboard again.' }
    ]
  },
  'smart-pet-collar-tag': {
    title: 'How FlashBind Works',
    description: 'Get your smart tag set up in seconds. No apps to download, no batteries to charge. Just tap and protect.',
    steps: [
      {
        title: 'Tap',
        description: 'Simply tap your smartphone to the FlashBind tag. Our built-in NFC chip instantly communicates with any modern smartphone.',
      },
      {
        title: 'Setup',
        description: 'Create your account in seconds and fill out your pet\'s profile. Add photos, medical info, and emergency contacts securely.',
      },
      {
        title: 'Protect',
        description: 'Attach the tag to your pet\'s collar. If they ever get lost, anyone who finds them can tap the tag to see their profile.',
      }
    ],
    dashboardTitle: 'Total Control in Your Pocket',
    dashboardDesc: 'Manage your pet\'s profile anytime, anywhere. Our intuitive dashboard makes it easy to keep information up to date.',
    dashboardPoints: [
      { title: 'Update info instantly', desc: 'Change phone numbers or medical info on the fly.' },
      { title: 'Secure cloud storage', desc: 'Your data is encrypted and safely stored in the cloud.' },
      { title: 'Emergency contact alerts', desc: 'Ensure multiple trusted contacts can be reached.' }
    ]
  },
  'default': {
    title: 'How FlashBind Works',
    description: 'Get your smart product set up in seconds. No apps to download, no batteries to charge. Just tap and go.',
    steps: [
      {
        title: 'Tap',
        description: 'Tap the product with any modern smartphone. Our built-in NFC chip instantly communicates—no app required.',
      },
      {
        title: 'Setup',
        description: 'Create your account in seconds and set your destination URL or profile information securely.',
      },
      {
        title: 'Update',
        description: 'Change the link or information anytime from your free dashboard. It updates instantly in real-time.',
      }
    ],
    dashboardTitle: 'Total Control in Your Pocket',
    dashboardDesc: 'Manage your product settings anytime, anywhere. Our intuitive dashboard makes it easy to keep information up to date.',
    dashboardPoints: [
      { title: 'Update instantly', desc: 'Change your destination link on the fly.' },
      { title: 'Secure cloud storage', desc: 'Your settings are encrypted and safely stored.' },
      { title: 'Track performance', desc: 'Monitor how many times your product is tapped.' }
    ]
  }
};

export function ProductTutorial({ productHandle }: { productHandle: string }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  let key = 'default';
  if (productHandle.includes('pet')) key = 'smart-pet-collar-tag';
  else if (TUTORIAL_DATA[productHandle]) key = productHandle;
  
  const content = TUTORIAL_DATA[key];

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const width = carouselRef.current.offsetWidth;
      const newStep = Math.round(scrollLeft / width);
      setActiveStep(newStep);
    }
  };

  // SVG Icons for the 3 steps
  const SVGs = [
    (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 md:w-10 md:h-10">
        <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
        <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
        <path d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8" />
        <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
      </svg>
    ),
    (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 md:w-10 md:h-10">
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
      </svg>
    ),
    (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 md:w-10 md:h-10">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        <path d="M14.05 2a9 9 0 0 1 8 7.94" />
        <path d="M14.05 6A5 5 0 0 1 18 10" />
      </svg>
    )
  ];

  return (
    <div className="w-full bg-[#FDFCF8] relative overflow-hidden mt-0 pt-12 pb-32">
      {/* Background blobs for premium feel */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] opacity-70"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-[100px] opacity-60"></div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        {/* Header Section */}
        <div className="text-center mb-32">
          <div className="inline-block mb-6 px-6 py-3 rounded-full border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 text-[#1E3A8A] text-sm font-bold tracking-widest uppercase">
            Simple & Secure
          </div>
          <h2 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
            {content.title}
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            {content.description}
          </p>
          {key === 'smart-pet-collar-tag' && (
            <Link
              to="/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-10 py-5 bg-[#1E3A8A] text-white font-bold rounded-full hover:bg-blue-700 hover:scale-105 shadow-[0_10px_30px_rgba(30,58,138,0.3)] transition-all duration-300 text-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Live Demo
            </Link>
          )}
        </div>

        {/* 3-Step Process Section */}
        <div className="relative mb-24 md:mb-40 group/carousel">
          <div 
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex md:grid md:grid-cols-3 gap-6 md:gap-12 overflow-x-auto snap-x snap-mandatory pb-4 md:pb-0 px-6 md:px-0 -mx-6 md:mx-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style dangerouslySetInnerHTML={{__html: `
              .snap-x::-webkit-scrollbar { display: none; }
            `}} />
            
            {content.steps.map((step: any, index: number) => (
              <div key={index} className="w-[85vw] md:w-auto flex-shrink-0 snap-center bg-white/80 backdrop-blur-xl p-8 md:p-16 rounded-3xl md:rounded-[3rem] border border-slate-100 shadow-[0_8px_40px_rgb(0,0,0,0.06)] hover:-translate-y-3 transition-transform duration-300 group">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-[#1E3A8A]/10 text-[#1E3A8A] rounded-2xl md:rounded-[1.5rem] flex items-center justify-center mb-6 md:mb-10 group-hover:scale-110 transition-transform duration-300">
                  {SVGs[index]}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 md:mb-6">{step.title}</h3>
                <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          
          {/* Pagination Dots (Mobile Only) */}
          <div className="flex justify-center gap-2 mt-6 md:hidden">
            {[0, 1, 2].map((step) => (
              <div 
                key={step} 
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${activeStep === step ? 'bg-[#1E3A8A]' : 'bg-slate-300'}`} 
              />
            ))}
          </div>
        </div>

        {/* Dashboard Teaser Section */}
        <div className="bg-slate-900 rounded-3xl md:rounded-[4rem] p-8 md:p-24 relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#1E3A8A] rounded-full blur-[150px] opacity-50 pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-20 relative z-10">
            <div className="w-full lg:w-1/2">
              <div className="inline-block mb-6 md:mb-8 px-4 py-2 md:px-6 md:py-3 rounded-full border border-white/20 bg-white/10 text-white text-xs md:text-sm font-bold tracking-widest uppercase">
                Dashboard Preview
              </div>
              <h3 className="text-3xl md:text-6xl font-extrabold text-white tracking-tight mb-6 md:mb-10 leading-tight">
                {content.dashboardTitle}
              </h3>
              <p className="text-lg md:text-xl text-slate-300 mb-8 md:mb-12 leading-relaxed">
                {content.dashboardDesc}
              </p>
              
              <ul className="space-y-6 md:space-y-10">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mt-1">
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div className="ml-4 md:ml-6">
                    <h4 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">{content.dashboardPoints[0].title}</h4>
                    <p className="text-base md:text-lg text-slate-400">{content.dashboardPoints[0].desc}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mt-1">
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div className="ml-4 md:ml-6">
                    <h4 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">{content.dashboardPoints[1].title}</h4>
                    <p className="text-base md:text-lg text-slate-400">{content.dashboardPoints[1].desc}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mt-1">
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div className="ml-4 md:ml-6">
                    <h4 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">{content.dashboardPoints[2].title}</h4>
                    <p className="text-base md:text-lg text-slate-400">{content.dashboardPoints[2].desc}</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="w-full lg:w-1/2">
              <div className="relative w-full aspect-[4/3] bg-slate-800 rounded-2xl md:rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center p-4 md:p-8 mt-6 lg:mt-0">
                {/* Abstract Dashboard UI Representation */}
                <div className="w-full h-full border border-white/5 rounded-xl md:rounded-2xl bg-slate-800/50 p-4 md:p-8 flex flex-col gap-4 md:gap-6">
                  <div className="flex items-center gap-4 md:gap-6 border-b border-white/5 pb-4 md:pb-6">
                    <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-slate-700"></div>
                    <div className="flex-1">
                      <div className="h-4 md:h-5 w-1/3 bg-slate-700 rounded mb-2 md:mb-3"></div>
                      <div className="h-3 md:h-4 w-1/4 bg-slate-600 rounded"></div>
                    </div>
                  </div>
                  <div className="flex gap-4 md:gap-6 h-full">
                    <div className="w-1/3 flex flex-col gap-4 md:gap-5">
                      <div className="h-16 md:h-24 w-full bg-slate-700 rounded-lg md:rounded-xl"></div>
                      <div className="h-16 md:h-24 w-full bg-slate-700 rounded-lg md:rounded-xl"></div>
                    </div>
                    <div className="flex-1 bg-slate-700 rounded-lg md:rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
