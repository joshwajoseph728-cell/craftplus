import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Sparkles, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
        <Sparkles className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold font-display">404 â€” Page Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm">
        The link you followed may be broken, or the page may have been removed.
      </p>
      <Link to="/feed">
        <Button variant="gradient" size="sm">
          <Home className="w-4 h-4 mr-1.5" />
          <span>Back to Feed</span>
        </Button>
      </Link>
    </div>
  );
};

