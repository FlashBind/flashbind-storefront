import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/blogs.$blogHandle.$articleHandle';
import {Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `FlashBind | ${data?.article.title ?? ''} article`}];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articleByHandle) {
    // Return a mock article instead of throwing 404 for demo purposes
    let mockTitle = articleHandle.split('-').map(word => word.toLowerCase() === 'seo' ? 'SEO' : word.toLowerCase() === 'nfc' ? 'NFC' : word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    let mockImageUrl = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2000&auto=format&fit=crop";
    let mockPublishedAt = new Date().toISOString();

    if (articleHandle === 'google-review-seo') {
      mockTitle = "How to Boost Your Local SEO with Google Review Stands";
      mockImageUrl = "/seo_blog_featured.png";
      mockPublishedAt = "2026-10-18T00:00:00Z";
    } else if (articleHandle === 'nfc-hospitality') {
      mockTitle = "Why NFC is Replacing QR Codes in Hospitality";
      mockImageUrl = "/nfc_blog_featured_new.png";
      mockPublishedAt = "2026-10-24T00:00:00Z";
    } else if (articleHandle === 'smart-pet-tags') {
      mockTitle = "Why Smart Pet Tags are the New Standard for Pet Safety";
      mockImageUrl = "/pet_tags_blog_featured.png";
      mockPublishedAt = "2026-10-05T00:00:00Z";
    }

    const mockArticle = {
      handle: articleHandle,
      title: mockTitle,
      publishedAt: mockPublishedAt,
      author: { name: "FlashBind Team" },
      contentHtml: `<p>Placeholder</p>`,
      image: {
        url: mockImageUrl,
        altText: mockTitle
      },
      blog: { handle: blogHandle }
    };
    
    return { article: mockArticle as any };
  }

  redirectIfHandleIsLocalized(
    request,
    {
      handle: articleHandle,
      data: blog.articleByHandle,
    },
    {
      handle: blogHandle,
      data: blog,
    },
  );

  const article = blog.articleByHandle;

  return {article};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Article() {
  const {article} = useLoaderData<typeof loader>();
  const {title, image, contentHtml, author} = article;

  const publishedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  // Determine which image to show
  const displayImage = image?.url ? image.url : "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2000&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-[#FDFCF8] pt-32 pb-16 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] -left-[10%] w-[800px] h-[800px] bg-[#F5F4EE] rounded-full blur-[120px] opacity-80"></div>
      </div>
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="mb-12 text-center max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-sm font-bold tracking-widest uppercase">
            Article
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight text-center">
            {title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-slate-500 font-medium w-full text-center">
            <time dateTime={article.publishedAt}>{publishedDate}</time> 
            <span>&middot;</span>
            <address className="not-italic">{author?.name}</address>
          </div>
        </div>

        {/* Hero Image - 21:9 Aspect Ratio */}
        <div className="mb-16 rounded-2xl overflow-hidden shadow-lg border border-slate-200 aspect-[21/9] bg-slate-100">
          <img 
            src={displayImage} 
            alt={image?.altText || title} 
            className="w-full h-full object-cover" 
          />
        </div>
        
        {/* White Content Card constrained to max-w-3xl */}
        <div className="bg-white/90 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white max-w-3xl mx-auto">
          {article.handle === 'nfc-hospitality' ? (
            <div className="text-gray-800 text-lg leading-relaxed space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Redefining the Guest Experience</h2>
              <p>
                The hospitality industry is built on seamless experiences. Yet, for the last few years, we've forced guests to navigate a clunky digital hurdle before they can even order a drink: the QR code. Itâ€™s time for an upgrade.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pt-6">The Problem with QR Code Fatigue</h2>
              <p>
                Weâ€™ve all been there. You sit down at a dimly lit restaurant, pull out your phone, open the camera, and try to focus on a scratched sticker stuck to the table. Maybe the glare is too harsh, or the camera won't focus. When it finally works, you're prompted to accept cookies, download a PDF, or pinch-and-zoom around a poorly formatted webpage. 
              </p>
              <p>
                While QR codes served a purpose during the shift to contactless dining, they introduce unnecessary friction. In an industry where every second of staff time counts, technology should be invisible and instantaneous.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pt-6">Enter the Tap-and-Go Era</h2>
              <p>
                Near Field Communication (NFC) is the exact same technology that powers Apple Pay and Google Wallet. It requires zero camera apps, no focusing, and no hunting for good lighting. A guest simply taps the top of their smartphone against an NFC-enabled hub, and the intended digital destination opens instantly on their screen.
              </p>
              <p>
                Top-tier restaurants, hotels, and bars are now tearing up their QR stickers and replacing them with premium, physical NFC touchpoints. Here is why the shift is happening so fast:
              </p>
              
              <ul className="list-disc pl-8 space-y-3">
                <li><strong>Faster Table Turns:</strong> Guests access the menu the second they sit down, completely eliminating the wait time for a server to drop off physical menus or explain a clunky app.</li>
                <li><strong>A Premium Aesthetic:</strong> Instead of peeling stickers, venues are utilizing sleek acrylic menu stands or custom-engraved hubs that blend seamlessly with high-end decor.</li>
                <li><strong>Dynamic Updating:</strong> 86'd a menu item? Changed the price of the special? The digital destination tied to the NFC chip can be updated from the cloud in seconds without ever replacing the physical stand.</li>
              </ul>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pt-6">Skyrocketing Local SEO with Frictionless Reviews</h2>
              <p>
                Beyond just menus, NFC is solving one of the biggest marketing hurdles for local businesses: capturing Google Reviews. Happy customers are rarely motivated to manually search for your business on Google just to leave a five-star rating. 
              </p>
              <p>
                By placing a Smart Review Stand at the host stand or checkout counter, staff can simply ask, <em>"Did you enjoy your meal? A quick tap here really helps us out."</em> The tap instantly bypasses the search process, dropping the customer directly onto the five-star review submission page. It turns a multi-step chore into a single-second favor.
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pt-6">The Future is Frictionless</h2>
              <p>
                Customers judge your brand by the quality of their interactions with it. Upgrading to NFC technology signals that a venue values its guests' time and embraces modern convenience. Itâ€™s no longer just about going digital; itâ€™s about making the digital experience as effortless as possible.
              </p>
            </div>
          ) : article.handle === 'google-review-seo' ? (
            <div className="text-gray-800 text-lg leading-relaxed space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">The Secret Weapon for Local Search</h2>
              <p>
                If you run a local brick-and-mortar business, you already know that Google is the ultimate battleground. When a potential customer searches for "best coffee near me" or "dentist in town," they don't scroll past the first three results. They look at the "Local Pack"â€”the top three map listingsâ€”and they make their decision based on one metric: the stars.
              </p>
              <p>
                But getting into those top three spots isn't just about having a website. Google's local search algorithm heavily prioritizes businesses with a high volume of recent, positive, and authentic reviews. 
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pt-6">The Friction Problem</h2>
              <p>
                Here is the frustrating reality of running a business: people are lazy. Your customers might love your service, but asking them to manually pull out their phone, open the Google app, search for your business name, navigate to the review tab, and type out a response is a massive ask. 
              </p>
              <p>
                Because of this friction, businesses usually only get reviews from the extremes: customers who are absolutely thrilled, or customers who are furious. The silent majority of happy, satisfied customers leave without ever boosting your local SEO.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pt-6">Bridging the Gap with NFC Technology</h2>
              <p>
                This is where physical NFC (Near Field Communication) endpoints completely change the game. By placing a Smart Google Review Stand at your point of sale, host stand, or reception desk, you eliminate 100% of the digital friction.
              </p>
              <p>
                When staff finish a positive interaction, they simply ask, <em>"We're so glad you had a great experience! Would you mind giving us a quick tap?"</em> The customer taps their phone to the acrylic stand, and their screen instantly opens directly to your Google Review submission form. 
              </p>
              
              <ul className="list-disc pl-8 space-y-3">
                <li><strong>Skyrocketing Review Velocity:</strong> Google monitors how fast you get reviews. A steady stream of daily tap-and-go reviews signals to the algorithm that your business is highly active and relevant.</li>
                <li><strong>Higher Conversion Rates:</strong> By asking for the review while the customer is physically in the store and highly engaged, conversion rates jump from a dismal 2% (via email follow-ups) to over 30%.</li>
                <li><strong>Capturing the Silent Majority:</strong> When the process takes two seconds, the everyday happy customer is suddenly willing to leave you that crucial 5-star rating.</li>
              </ul>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pt-6">Stop Leaving SEO to Chance</h2>
              <p>
                Search Engine Optimization doesn't always have to mean paying thousands of dollars to agencies for backlink campaigns. For local hospitality and retail venues, the most powerful SEO tool you have is the voice of your customers. 
              </p>
              <p>
                By bridging the physical world with your digital reputation using a Smart Review Stand, you take control of your local rankings, dominate the map pack, and drive passive foot traffic to your door for years to come.
              </p>
            </div>
          ) : article.handle === 'smart-pet-tags' ? (
            <div className="text-gray-800 text-lg leading-relaxed space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">A Modern Solution to an Age-Old Problem</h2>
              <p>
                Every pet owner's worst nightmare is looking at an open door and realizing their furry friend has gone missing. For decades, the standard protocol has been a simple metal tag engraved with a phone number. But in today's digital age, we can do much better.
              </p>
              <p>
                Enter the Smart Pet Tag: a revolutionary, NFC-enabled upgrade that gives finders instant access to a wealth of crucial information with a single tap of their smartphone.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pt-6">Beyond Just a Phone Number</h2>
              <p>
                A traditional engraved tag only has room for a name and a phone number. If your pet is found but you're unable to answer the phone, the finder is stuck. Smart Pet Tags solve this by linking directly to a dynamic digital profile that can be updated in real-time.
              </p>
              
              <ul className="list-disc pl-8 space-y-3">
                <li><strong>Multiple Contacts:</strong> Include secondary phone numbers for spouses, neighbors, or your local vet.</li>
                <li><strong>Medical Needs:</strong> Instantly alert the finder if your pet needs daily medication or has severe allergies.</li>
                <li><strong>Behavioral Notes:</strong> Let people know if your dog is friendly but skittish, or if they should avoid sudden movements.</li>
              </ul>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pt-6">The Magic of Passive GPS Tracking</h2>
              <p>
                While bulky GPS collars require constant charging and monthly subscriptions, Smart Pet Tags work seamlessly without batteries. Many advanced tags automatically capture the GPS location of the finder's phone the moment the tag is scanned, sending you an instant notification with a map pin of exactly where your pet was found.
              </p>
              <p>
                It's time to ditch the clunky, noisy metal tags that wear out over time. Upgrade to a modern, durable, and infinitely updatable Smart Pet Tag and give yourself the ultimate peace of mind.
              </p>
            </div>
          ) : (
            <div
              dangerouslySetInnerHTML={{__html: contentHtml}}
              className="prose prose-lg mx-auto text-gray-800"
            />
          )}
        </div>

        {/* Go Back Link */}
        <div className="mt-12 text-center pb-8">
          <Link 
            to="/blog" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/80 backdrop-blur shadow-sm border border-slate-200 text-slate-600 font-medium hover:text-[#1E3A8A] hover:border-[#1E3A8A]/30 hover:shadow-md transition-all duration-300 group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform">â†</span> 
            Back to Journal
          </Link>
        </div>
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog#field-blog-articlebyhandle
const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      articleByHandle(handle: $articleHandle) {
        handle
        title
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
    }
  }
` as const;
