import type {MetaFunction} from 'react-router';

export const meta: MetaFunction = () => {
  return [{title: 'FlashBind | Review Stands'}];
};

export default function ReviewStandsPage() {
  return (
    <div className="container mx-auto px-6 py-24 min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-extrabold text-slate-900 mb-6">Review Stands</h1>
      <p className="text-xl text-slate-500 max-w-2xl">This is a placeholder page for Review Stands.</p>
    </div>
  );
}
