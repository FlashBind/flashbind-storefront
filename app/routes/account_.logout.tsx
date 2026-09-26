import {redirect} from 'react-router';
import type {Route} from './+types/account_.logout';
import {assertSameOrigin} from '~/utils/requestSecurity.server';

// if we don't implement this, /account/logout will get caught by account.$.tsx to do login
export async function loader() {
  return redirect('/');
}

export async function action({request, context}: Route.ActionArgs) {
  // Resource route: not covered by React Router's own Origin check.
  assertSameOrigin(request);
  return context.customerAccount.logout();
}
