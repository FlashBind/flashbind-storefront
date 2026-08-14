import type { ActionFunctionArgs } from 'react-router';
import { redirect } from 'react-router';

export async function action({ context }: ActionFunctionArgs) {
  // Clear the user's session data
  context.session.unset('userEmail');
  context.session.unset('access_token');
  
  // Commit the cleared session to the cookie and redirect to home
  return redirect('/', {
    headers: {
      'Set-Cookie': await context.session.commit(),
    },
  });
}

// Redirect if someone accidentally visits /logout via GET
export async function loader() {
  return redirect('/');
}
