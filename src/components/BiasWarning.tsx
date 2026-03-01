"use client";

interface BiasWarningProps {
  htfBias: string;
  currentDirection: string;
}

export default function BiasWarning({ htfBias, currentDirection }: BiasWarningProps) {
  if (htfBias === "NEUTRAL" || currentDirection === htfBias) return null;

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="text-red-400 text-2xl flex-shrink-0">!</div>
        <div>
          <h4 className="text-red-400 font-bold text-sm uppercase tracking-wider">
            Counter-Trend Warning
          </h4>
          <p className="text-red-300 text-sm mt-1">
            You are about to trade <strong>{currentDirection}</strong> against the HTF bias
            of <strong>{htfBias}</strong>. Counter-trend trades have a significantly lower
            win rate. Are you sure this setup justifies going against the higher timeframe direction?
          </p>
          <div className="mt-3 text-xs text-red-400/80 space-y-1">
            <p>Ask yourself before entering:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Is there a clear structural break on the daily?</li>
              <li>Am I trading a reaction, not a reversal?</li>
              <li>Would I take this trade if the HTF was aligned?</li>
              <li>Am I in FOMO or revenge mode?</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
