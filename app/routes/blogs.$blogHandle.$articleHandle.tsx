import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/blogs.$blogHandle.$articleHandle';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `FlashBind | ${data?.article.title ?? ''} article`}];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData();

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
      mockTitle = 'Make It Easier for Customers to Find Your Google Review Page';
      mockImageUrl = "/seo_blog_featured.png";
      mockPublishedAt = '2026-09-05T00:00:00Z';
    } else if (articleHandle === 'nfc-hospitality') {
      mockTitle = 'NFC and QR Codes in Hospitality: When to Use Each';
      mockImageUrl = "/nfc_blog_featured_new.png";
      mockPublishedAt = '2026-09-05T00:00:00Z';
    } else if (articleHandle === 'smart-pet-tags') {
      mockTitle = 'What an NFC Pet Tag Can—and Cannot—Do';
      mockImageUrl = "/pet_tags_blog_featured.png";
      mockPublishedAt = '2026-09-05T00:00:00Z';
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
function loadDeferredData() {
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
                Hospitality works best when guests can find what they need quickly. NFC and QR codes are two useful ways to open a digital menu without requiring a dedicated app.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pt-6">Different Ways to Open the Same Destination</h2>
              <p>
                QR codes are familiar and work well when they are clearly printed and easy to scan. NFC offers another route: a compatible phone can open the same destination after a tap. The destination itself still needs to be mobile-friendly.
              </p>
              <p>
                A venue can use NFC on its own or alongside a QR code. The right choice depends on the setting, the physical design, and what guests are most comfortable using.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pt-6">Enter the Tap-and-Go Era</h2>
              <p>
                Near Field Communication is also used in familiar contactless interactions such as mobile payments. With FlashBind, a compatible phone reads the tag and opens the configured web destination; no FlashBind app is required.
              </p>
              <p>
                A thoughtfully placed NFC touchpoint can help in several practical ways:
              </p>
              
              <ul className="list-disc pl-8 space-y-3">
                <li><strong>Direct access:</strong> Guests can open the linked menu without searching for the venue online.</li>
                <li><strong>A Premium Aesthetic:</strong> Instead of peeling stickers, venues are utilizing sleek acrylic menu stands or custom-engraved hubs that blend seamlessly with high-end decor.</li>
                <li><strong>Editable destination:</strong> The link associated with a FlashBind tag can be changed without replacing the physical product.</li>
              </ul>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pt-6">A Shorter Route to a Public Review Form</h2>
              <p>
                The same tap-to-open interaction can link to a business&apos;s public Google review form. This reduces the number of steps compared with asking a customer to search for the business manually.
              </p>
              <p>
                Businesses should request honest feedback without offering incentives or selectively asking only satisfied customers. A stand improves access to the public form; it does not guarantee that a customer will leave a review or affect search rankings.
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pt-6">The Future is Frictionless</h2>
              <p>
                NFC is a convenient option, not a replacement for good service or an accessible website. Used clearly and honestly, it can make a digital destination easier to reach at the relevant moment.
              </p>
            </div>
          ) : article.handle === 'google-review-seo' ? (
            <div className="text-gray-800 text-lg leading-relaxed space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Reduce the Steps to Your Review Form</h2>
              <p>
                Public reviews can help prospective customers understand other people&apos;s experiences with a business. The most reliable approach is to make the review form easy to find and invite customers to leave honest feedback.
              </p>
              <p>
                A FlashBind review stand opens the Google review destination configured by the business. It does not promise a particular number of reviews or a search-ranking result.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pt-6">The Friction Problem</h2>
              <p>
                Manually finding a business listing and its review form takes several steps. Some customers may be more willing to respond when the destination is immediately available at the counter or reception desk.
              </p>
              <p>
                The goal is simply to shorten that path while leaving the decision and the content of the review entirely with the customer.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pt-6">Bridging the Gap with NFC Technology</h2>
              <p>
                A physical NFC touchpoint at a point of sale, host stand, or reception desk can open the configured public review form on a compatible phone.
              </p>
              <p>
                Staff can neutrally invite customers to share honest feedback. The customer taps the stand and chooses whether to complete the public form.
              </p>
              
              <ul className="list-disc pl-8 space-y-3">
                <li><strong>Fewer navigation steps:</strong> The tap opens the configured review destination directly.</li>
                <li><strong>Clear placement:</strong> The prompt is visible at the moment a customer is already interacting with the business.</li>
                <li><strong>Editable link:</strong> The business can update the destination through FlashBind if the review URL changes.</li>
              </ul>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pt-6">Set Honest Expectations</h2>
              <p>
                A review stand is a convenience tool. It should be used to request honest reviews from customers without incentives, pressure, or filtering based on sentiment.
              </p>
              <p>
                Outcomes depend on the customer experience and whether customers choose to respond. FlashBind makes the public destination easier to reach; it cannot guarantee reviews, rankings, or sales.
              </p>
            </div>
          ) : article.handle === 'smart-pet-tags' ? (
            <div className="text-gray-800 text-lg leading-relaxed space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">A Modern Solution to an Age-Old Problem</h2>
              <p>
                Every pet owner&apos;s worst nightmare is looking at an open door and realizing their furry friend has gone missing. For decades, the standard protocol has been a simple metal tag engraved with a phone number. But in today&apos;s digital age, we can do much better.
              </p>
              <p>
                An NFC pet tag gives a finder a simple way to open a public pet profile on a compatible smartphone.
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pt-6">Beyond Just a Phone Number</h2>
              <p>
                A traditional engraved tag has limited space. A FlashBind pet tag links to a profile where the owner can keep the pet&apos;s name, contact information, and relevant notes current.
              </p>
              
              <ul className="list-disc pl-8 space-y-3">
                <li><strong>Owner contact:</strong> Show the phone number and email address the owner chooses to publish.</li>
                <li><strong>Pet details:</strong> Share the pet&apos;s name, breed, and age where provided.</li>
                <li><strong>Important notes:</strong> Add a short public message for the finder.</li>
              </ul>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 pt-6">What the Tag Does Not Do</h2>
              <p>
                FlashBind&apos;s NFC pet tag is not a GPS tracker and does not continuously report a pet&apos;s location. It is a passive tag: a finder must tap it with a compatible phone and use the contact information shown on the profile.
              </p>
              <p>
                The profile can be updated without replacing the NFC tag. Owners should still keep their pet microchipped where appropriate and use identification methods that fit their circumstances.
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
            <span className="transform group-hover:-translate-x-1 transition-transform">&larr;</span> 
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
