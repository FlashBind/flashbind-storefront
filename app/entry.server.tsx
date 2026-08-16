import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN || context.env.PUBLIC_STORE_DOMAIN || 'sx8eip-td.myshopify.com',
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  
  // Append img-src to allow base64 data URIs and Unsplash placeholders
  let customHeader = header;
  if (!customHeader.includes('img-src')) {
    customHeader += `; img-src 'self' data: https://cdn.shopify.com https://images.unsplash.com;`;
  } else {
    customHeader = customHeader.replace('img-src', "img-src data: https://images.unsplash.com ");
  }

  // Allow Google Fonts styles
  if (!customHeader.includes('style-src')) {
    customHeader += `; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;`;
  } else {
    customHeader = customHeader.replace('style-src', "style-src https://fonts.googleapis.com ");
  }

  // Allow Google Fonts fonts
  if (!customHeader.includes('font-src')) {
    customHeader += `; font-src 'self' https://fonts.gstatic.com;`;
  } else {
    customHeader = customHeader.replace('font-src', "font-src https://fonts.gstatic.com ");
  }

  // Allow AJAX to Web3Forms
  if (!customHeader.includes('connect-src')) {
    customHeader += `; connect-src 'self' https://api.web3forms.com;`;
  } else {
    customHeader = customHeader.replace('connect-src', "connect-src https://api.web3forms.com ");
  }
  
  // Allow form actions to Web3Forms (fallback)
  if (!customHeader.includes('form-action')) {
    customHeader += `; form-action 'self' https://api.web3forms.com;`;
  } else {
    customHeader = customHeader.replace('form-action', "form-action https://api.web3forms.com ");
  }
  responseHeaders.set('Content-Security-Policy', customHeader);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
