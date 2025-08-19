'use client';

import React, { useEffect, useState } from 'react';
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

  const [waitlistId, setWaitlistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form state
  const [currency, setCurrency] = useState('INR');
  const [priceInput, setPriceInput] = useState('');
  const [launchDate, setLaunchDate] = useState('');
  const [buttonLabel, setButtonLabel] = useState('');

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
            priceAmount?: number | null;
            launchDate?: string | null;
            buttonLabel?: string | null;
            published?: boolean;
          };
        }>(`/api/waitlists/${mine.waitlist.id}/price`);

        if (!alive) return;
        setCurrency(got.price.currency || 'INR');
        setPriceInput(fromMinor(got.price.priceAmount));
        setLaunchDate(got.price.launchDate?.slice(0, 10) || '');
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

  // compute validation errors
  const computeErrors = () => {
    const e: Record<string, string> = {};
    const minor = toMinor(priceInput);
    if (!priceInput.trim() || minor <= 0) e.price = 'Enter a valid price.';
    if (!/^[A-Z]{3}$/.test(currency)) e.currency = 'Use a 3-letter currency code.';
    if (!launchDate) e.launchDate = 'Select a launch date.';
    if (!buttonLabel.trim()) e.buttonLabel = 'Button label is required.';
    return e;
  };

  // always derive errors from state
  React.useEffect(() => {
    setErrors(computeErrors());
  }, [priceInput, currency, launchDate, buttonLabel]);

  const isValid = Object.keys(errors).length === 0;

  const show = (key: string) => errors[key] && touched[key];

  const saveOrPublish = async (publish: boolean) => {
    if (!waitlistId || saving || loading || !isValid) return;
    try {
      setSaving(true);
      await jsonFetch(`/api/waitlists/${waitlistId}/price`, {
        method: 'PATCH',
        body: JSON.stringify({
          currency,
          priceAmount: clamp(toMinor(priceInput), 1, 10_000_000_000),
          launchDate,
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

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0A5DBC] border-solid" />
      </div>
    );
  }

  const onGoBack = () => router.push('/wait-list/setup/content');

  return (
    <form className="w-full h-full flex flex-col pb-4">
      <div className="flex flex-col h-[90%] w-full overflow-y-auto overflow-x-hidden gap-4 sm:gap-6 pb-6">
        <label className="text-sm font-medium">Course Price</label>
        <div className="mt-2 mb-2 text-[12px] flex items-center gap-2 bg-[#FFF8E1] border border-[#FFE8A3] rounded-md px-2 py-1">
          <span>ⓘ</span>
          <span>We recommend keeping it under Rs. 150</span>
        </div>

        <div className="flex gap-2">
          <div className="w-[90px]">
            <input
              type="text"
              value={currency}
              disabled={loading || saving}
              onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 3))}
              onBlur={() => setTouched((t) => ({ ...t, currency: true }))}
              placeholder="INR"
              className="w-full border border-[#ECECEC] rounded-lg px-3 py-2 text-sm text-center"
            />
            {show('currency') && (
              <p className="text-red-500 text-xs mt-1">{errors.currency}</p>
            )}
          </div>

          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#787878]">Rs.</span>
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
            {show('price') && (
              <p className="text-red-500 text-xs mt-1">{errors.price}</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Course launch date</label>
          <div className="mt-2">
            <input
              type="date"
              value={launchDate}
              disabled={loading || saving}
              onChange={(e) => setLaunchDate(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, launchDate: true }))}
              className="w-full border border-[#ECECEC] rounded-lg px-3 py-2 text-sm"
            />
            {show('launchDate') && (
              <p className="text-red-500 text-xs mt-1">{errors.launchDate}</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Button Label</label>
          <input
            type="text"
            value={buttonLabel}
            disabled={loading || saving}
            onChange={(e) => setButtonLabel(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, buttonLabel: true }))}
            className="w-full border border-[#ECECEC] rounded-lg px-3 py-2 text-sm"
            placeholder="Join for Rs. 79"
          />
          {show('buttonLabel') && (
            <p className="text-red-500 text-xs mt-1">{errors.buttonLabel}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end w-full h-[10%] border-t border-[#ECECEC] gap-4">
        <div className="flex flex-col justify-center items-center">
          <button
            type="button"
            onClick={onGoBack}
            className="w-[90px] sm:w-[100px] h-[35px] sm:h-[44px] border border-[#ECECEC] rounded-[10px] sm:rounded-[15px] flex items-center justify-center text-[#787878] text-[14px] sm:text-[16px] font-[500] leading-[24px]"
          >
            Go back
          </button>
        </div>

        <div className="flex flex-col justify-center items-center">
          <button
            type="button"
            onClick={() => saveOrPublish(true)}
            disabled={loading || saving || !isValid || !waitlistId}
            className={`w-[110px] sm:w-[126px] h-[35px] sm:h-[44px] rounded-[10px] sm:rounded-[15px] flex items-center justify-center text-white text-[14px] sm:text-[16px] font-[500] leading-[24px] ${loading || saving || !isValid || !waitlistId
              ? 'bg-[#0A5DBC]/60 cursor-not-allowed'
              : 'bg-[#0A5DBC]'
              }`}
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>

      </div>
    </form>
  );
}
