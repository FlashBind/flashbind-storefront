import type {MetaFunction} from 'react-router';

export const meta: MetaFunction = () => {
  return [{title: 'FlashBind | Pet Tags'}];
};

export default function PetTagsPage() {
  return (
    <div className="container mx-auto px-6 py-24 min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-extrabold text-slate-900 mb-6">Pet Tags</h1>
      <p className="text-xl text-slate-500 max-w-2xl">This is a placeholder page for Pet Tags.</p>
    </div>
  );
}
