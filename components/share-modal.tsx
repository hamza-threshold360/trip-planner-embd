'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { theme } from '@/lib/theme';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
}

export function ShareModal({ open, onOpenChange, shareUrl }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="p-0 overflow-hidden bg-white border-0"
        style={{ maxWidth: '420px', width: '90vw', borderRadius: '16px' }}
      >
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Share your plan</h2>
          <p className="text-sm text-gray-500 mb-5">Copy the link below to share your trip.</p>

          <div className="flex items-center border border-gray-200 px-4 py-3 gap-3" style={{ borderRadius: theme.borderRadius.md }}>
            <span className="flex-1 text-sm text-gray-400 break-all leading-relaxed">{shareUrl}</span>
            <button
              onClick={handleCopy}
              className="text-sm font-semibold flex-shrink-0 transition-colors"
              style={{ color: copied ? theme.accentHover : theme.accent }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <button
            onClick={() => onOpenChange(false)}
            className="w-full mt-5 py-3 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: theme.accent, borderRadius: theme.borderRadius.md }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.accentHover)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.accent)}
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
