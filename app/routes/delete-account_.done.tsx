import {Link} from 'react-router';
import type {MetaFunction} from 'react-router';

export const meta: MetaFunction = () => [{title: 'FlashBind | Account deleted'}];

export default function AccountDeletedPage() {
  return (
    <div className="min-h-[60vh] bg-gray-50 py-24">
      <div className="container mx-auto px-6 max-w-xl text-center">
        <h1 className="text-3xl font-medium text-slate-900 tracking-tighter mb-4">Your account has been deleted</h1>
        <p className="text-slate-600 mb-8">Your login and your products&apos; information have been erased. Thank you for using FlashBind.</p>
        <Link to="/" className="inline-flex items-center justify-center min-h-[48px] px-8 rounded-full bg-[#1E3A8A] text-white font-bold">
          Back to the homepage
        </Link>
      </div>
    </div>
  );
}
