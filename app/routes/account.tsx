import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/account';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const email = context.session.get('userEmail');
  
  if (!email) {
    throw new Error('Please log in to view your account.');
  }

  // We no longer fetch from customerAccount API. 
  // We can just return basic mock details or fetch from Supabase if needed.
  return remixData(
    {customer: { firstName: '', email }},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  return (
    <div className="bg-slate-50 w-full font-sans flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <main className="w-full max-w-4xl">
        <Outlet context={{customer}} />
      </main>
    </div>
  );
}
