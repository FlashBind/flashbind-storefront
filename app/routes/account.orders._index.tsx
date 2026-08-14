import {
  Link,
  useLoaderData,
  useSearchParams,
} from 'react-router';
import type {Route} from './+types/account.orders._index';
import {
  Money,
  getPaginationVariables,
} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Orders'}];
};


const CUSTOMER_ORDERS_QUERY_ADMIN = `
  query CustomerOrdersAdmin($query: String!, $first: Int, $after: String) {
    customers(first: 1, query: $query) {
      edges {
        node {
          orders(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
            nodes {
              id
              name
              createdAt
              displayFinancialStatus
              displayFulfillmentStatus
              totalPriceSet {
                presentmentMoney {
                  amount
                  currencyCode
                }
              }
            }
            pageInfo {
              hasPreviousPage
              hasNextPage
              endCursor
              startCursor
            }
          }
        }
      }
    }
  }
`;

export async function loader({request, context}: Route.LoaderArgs) {
  const { adminApi, env } = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  // Get the authenticated user email from the session
  const userEmail = context.session.get('userEmail');

  if (!userEmail) {
    throw new Error('Please log in again to view your orders.');
  }

  // Query Shopify Admin API for customers matching this email
  const isForward = 'first' in paginationVariables;
  const first = isForward ? paginationVariables.first : undefined;
  const last = !isForward ? paginationVariables.last : undefined;
  const after = isForward ? paginationVariables.endCursor : undefined;
  const before = !isForward ? paginationVariables.startCursor : undefined;

  const { data, errors } = await adminApi(CUSTOMER_ORDERS_QUERY_ADMIN, {
    query: `email:${userEmail}`,
    first,
    last,
    after,
    before,
  });

  if (errors?.length) {
    console.error('Admin API Error:', errors);
    throw new Error('Error fetching orders from Shopify.');
  }

  const customerNode = data?.customers?.edges?.[0]?.node;
  
  if (!customerNode) {
    // If no Shopify customer exists yet for this email, return empty orders
    return { orders: { nodes: [], pageInfo: { hasNextPage: false, hasPreviousPage: false } } };
  }

  const adminOrders = customerNode.orders;

  // Map Admin API order format to Storefront API format so the UI doesn't break
  const mappedOrders = {
    nodes: adminOrders.nodes.map((o: any) => ({
      id: o.id,
      orderNumber: o.name.replace('#', ''),
      processedAt: o.createdAt,
      totalPrice: o.totalPriceSet.presentmentMoney,
      financialStatus: o.displayFinancialStatus,
      fulfillmentStatus: o.displayFulfillmentStatus,
    })),
    pageInfo: adminOrders.pageInfo,
  };

  return { orders: mappedOrders };
}

export default function Orders() {
  const { orders } = useLoaderData<typeof loader>();

  return (
    <div className="bg-white flex flex-col items-center justify-center rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 p-8 w-full min-h-[50vh]">
      <div className="py-6 w-full max-w-2xl flex-1 flex flex-col justify-center">
        <div aria-live="polite">
          {orders?.nodes.length ? (
            <PaginatedResourceSection connection={orders}>
              {({node: order}: {node: any}) => <OrderItem key={order.id} order={order} />}
            </PaginatedResourceSection>
          ) : (
            <EmptyOrders />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-4 h-full">
      <div className="mb-8">
        <svg className="w-16 h-16 text-slate-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">No orders yet</h3>
      <p className="text-base text-slate-600 mb-10 max-w-md mx-auto leading-relaxed">
        When you place orders, they will appear here. Start exploring our premium products!
      </p>
      <Link 
        to="/products" 
        className="inline-block bg-slate-900 text-white font-bold py-3 px-8 rounded-lg hover:bg-[#1E3A8A] hover:scale-105 hover:shadow-[0_0_25px_rgba(30,58,138,0.4)] transition-all duration-300 shadow-md"
      >
        Start Shopping
      </Link>
    </div>
  );
}

function OrderItem({order}: {order: any}) {
  return (
    <Link 
      to={`/account/orders/${btoa(order.id)}`} 
      className="block bg-white border border-slate-200 p-5 rounded-2xl mb-4 hover:border-blue-300 hover:shadow-md transition-all group"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex flex-col gap-1 mb-4 sm:mb-0">
          <span className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            Order #{order.orderNumber}
          </span>
          <span className="text-slate-500 text-sm font-medium">
            Placed on {new Date(order.processedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        
        <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
          <div className="font-bold text-lg text-slate-900">
            <Money data={order.totalPrice} />
          </div>
          <div className="flex gap-2 text-xs font-bold tracking-wide">
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
              {order.financialStatus}
            </span>
            {order.fulfillmentStatus && (
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md">
                {order.fulfillmentStatus}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
