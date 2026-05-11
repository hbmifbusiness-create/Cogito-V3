import React from "react";
import { BarChart, Link as LinkIcon, ArrowLeft } from "lucide-react";

export function AnalyticsView({ entity, onBack }: any) {
  return (
    <div
      className="h-full overflow-y-auto p-8 custom-scrollbar"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:opacity-70 transition-all border"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-color)",
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <h2
            className="text-2xl font-black uppercase tracking-tighter"
            style={{ color: "var(--accent)" }}
          >
            Analytics / {entity.name}
          </h2>
        </div>

        <div
          className="rounded-2xl border p-8 space-y-6"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart style={{ color: "var(--accent)" }} size={24} />
              <h3 className="font-bold text-xl uppercase tracking-wider">
                Social Integrations
              </h3>
            </div>
            <button
              className="text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors shadow-sm"
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              <LinkIcon size={16} /> Connect Account
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Instagram" },
              { name: "TikTok" },
              { name: "YouTube" },
              { name: "Facebook Pages" },
              { name: "X (Twitter)" },
              { name: "Website Analytics" },
            ].map((platform) => (
              <div
                key={platform.name}
                className="p-6 rounded-xl border flex flex-col justify-between"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <div>
                  <div
                    className="text-xs uppercase tracking-widest mb-2 font-bold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {platform.name}
                  </div>
                  <div className="text-2xl font-black">Not Connected</div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="p-4 rounded-xl border flex gap-4"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--accent)",
            }}
          >
            <div
              className="shrink-0 p-2 rounded-lg"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <BarChart size={16} style={{ color: "var(--accent-text)" }} />
            </div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--accent)" }}>AI Insight:</strong>{" "}
              Connect your accounts to start generating engagement summaries and
              campaign performance metrics based on your workspace tasks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
