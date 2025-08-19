'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
async function jsonFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const r = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || j?.message || 'Request failed');
  return j as T;
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const toMinor = (amt: string) => {
  // accepts "79", "79.5", "79.50"
  const n = Number(amt.replace(/[^\d.]/g, ''));
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
};
const fromMinor = (minor?: number | null) =>
  typeof minor === 'number' ? (minor / 100).toString() : '';

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────
export default function PriceSection() {
  const router = useRouter();

  // ids & flags
  const [waitlistId, setWaitlistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form state
  const [currency, setCurrency] = useState('INR');
  const [priceInput, setPriceInput] = useState(''); // human string in rupees
  const [launchDate, setLaunchDate] = useState<string>(''); // yyyy-mm-dd
  const [buttonLabel, setButtonLabel] = useState<string>(''); // e.g. "Join for Rs. 79"

  // touched/errors
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // hydrate
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const mine = await jsonFetch<{ ok: true; waitlist: { id: string } }>(
          '/api/waitlists/mine'
        );
        if (!alive) return;
        setWaitlistId(mine.waitlist.id);

        const got = await jsonFetch<{
          ok: true;
          price: {
            currency?: string;
            priceAmount?: number | null; // minor
            launchDate?: string | null;  // ISO
            buttonLabel?: string | null;
            published?: boolean;
          };
        }>(`/api/waitlists/${mine.waitlist.id}/price`, { method: 'GET' });

        if (!alive) return;
        setCurrency(got.price.currency || 'INR');
        setPriceInput(fromMinor(got.price.priceAmount));
        setLaunchDate(
          got.price.launchDate ? got.price.launchDate.slice(0, 10) : ''
        );
        setButtonLabel(got.price.buttonLabel || '');
      } catch (e) {
        console.error('Price hydrate failed:', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const computeErrors = React.useCallback(() => {
    const e: Record<string, string> = {};
    const minor = toMinor(priceInput);
    if (!priceInput.trim() || minor <= 0) e.price = 'Enter a valid price.';
    if (!/^[A-Z]{3}$/.test(currency)) e.currency = 'Use a 3-letter currency code.';
    if (!launchDate) e.launchDate = 'Select a launch date.';
    if (!buttonLabel.trim()) e.buttonLabel = 'Button label is required.';
    return e;
  }, [priceInput, currency, launchDate, buttonLabel]);

  const isValid = useMemo(
    () => Object.keys(computeErrors()).length === 0,
    [computeErrors]
  );

  const show = (key: string) => errors[key] && touched[key];

  const saveOrPublish = async (publish: boolean) => {
    const e = computeErrors();
    setErrors(e);
    if (Object.keys(e).length > 0 || !waitlistId || saving || loading) return;

    try {
      setSaving(true);
      await jsonFetch(`/api/waitlists/${waitlistId}/price`, {
        method: 'PATCH',
        body: JSON.stringify({
          currency,
          priceAmount: clamp(toMinor(priceInput), 1, 10_000_000_000), // guardrails
          launchDate, // yyyy-mm-dd
          buttonLabel,
          publish,
        }),
      });

      router.refresh();
      router.push(publish ? '/dashboard' : '/wait-list/setup/price');
    } catch (e) {
      console.error('Price save failed:', e);
      alert((e as Error).message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const onGoBack = () => router.push('/wait-list/setup/content');

  return (
    <section className="w-full h-full flex flex-col min-h-0">
      {/* scrollable body */}
      <div className="flex-col flex w-full h-[90%] overflow-y-auto">
        <div className="w-full min-h-0 h-full overflow-y-auto overflow-x-hidden p-3 sm:p-4 overscroll-contain scrollbar-gutter-stable">
          <div className="mx-auto w-full max-w-[640px] flex flex-col gap-6">
            <div>
              <label className="text-sm font-medium">Course Price</label>
              <div className="mt-2 mb-2 text-[12px] flex items-center gap-2 bg-[#FFF8E1] border border-[#FFE8A3] rounded-md px-2 py-1">
                <span>ⓘ</span>
                <span>We recommend keeping it under Rs. 150</span>
              </div>

              {/* amount */}
              <div className="flex gap-2">
                <div className="w-[90px]">
                  <input
                    type="text"
                    value={currency}
                    disabled={loading || saving}
                    onChange={(e) =>
                      setCurrency(e.target.value.toUpperCase().slice(0, 3))
                    }
                    onBlur={() => setTouched((t) => ({ ...t, currency: true }))}
                    placeholder="INR"
                    className="w-full border border-[#ECECEC] rounded-lg px-3 py-2 text-sm text-center"
                  />
                  {show('currency') && (
                    <p className="text-red-500 text-xs mt-1">{errors.currency}</p>
                  )}
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#787878]">
                      Rs.
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={priceInput}
                      disabled={loading || saving}
                      onChange={(e) => setPriceInput(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, price: true }))}
                      placeholder="79"
                      className="w-full border border-[#ECECEC] rounded-lg pl-10 pr-3 py-2 text-sm"
                    />
                  </div>
                  {show('price') && (
                    <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                  )}
                </div>
              </div>
            </div>

            {/* date */}
            <div>
              <label className="text-sm font-medium">Course launch date</label>
              <div className="mt-2">
                <input
                  type="date"
                  value={launchDate}
                  disabled={loading || saving}
                  onChange={(e) => setLaunchDate(e.target.value)}
                  onBlur={() =>
                    setTouched((t) => ({ ...t, launchDate: true }))
                  }
                  className="w-full border border-[#ECECEC] rounded-lg px-3 py-2 text-sm"
                />
                {show('launchDate') && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.launchDate}
                  </p>
                )}
              </div>
            </div>

            {/* button label */}
            <div>
              <label className="text-sm font-medium">Button Label</label>
              <input
                type="text"
                value={buttonLabel}
                disabled={loading || saving}
                onChange={(e) => setButtonLabel(e.target.value)}
                onBlur={() =>
                  setTouched((t) => ({ ...t, buttonLabel: true }))
                }
                placeholder="Join for Rs. 79"
                className="mt-2 w-full border border-[#ECECEC] rounded-lg px-3 py-2 text-sm"
              />
              {show('buttonLabel') && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.buttonLabel}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* sticky footer */}
      <div className="w-full h-[10%] border-t border-[#ECECEC] pt-4 mt-4 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-[640px] flex items-center justify-between">
          <button
            type="button"
            onClick={onGoBack}
            className="w-[100px] h-[44px] border border-[#ECECEC] rounded-[15px] flex items-center justify-center text-[#787878] text-[14px] font-[500]"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={() => saveOrPublish(true)}
            disabled={loading || saving || !isValid || !waitlistId}
            className={`w-[150px] h-[44px] rounded-[15px] flex items-center justify-center text-white text-[14px] font-[500] ${
              loading || saving || !isValid || !waitlistId
                ? 'bg-[#0A5DBC]/60 cursor-not-allowed'
                : 'bg-[#0A5DBC]'
            }`}
          >
            {saving ? 'Publishing…' : 'Publish Waitlist'}
          </button>
        </div>
      </div>
    </section>
  );
}
