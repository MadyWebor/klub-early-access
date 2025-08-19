'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────
type Benefit = { text: string };
type FAQ = { question: string; answer: string };
type SocialLinks = {
  website: string; youtube: string; instagram: string; linkedin: string; facebook: string; x: string;
};

interface WaitlistAPIResponse {
  waitlist: {
    media?: string[];
    bannerVideoUrl?: string | null;
    benefits?: string[];
    socials?: Partial<SocialLinks>;
    faqs?: FAQ[];
  };
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
async function jsonFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const r = await fetch(input, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || j?.message || 'Request failed');
  return j as T;
}

async function uploadForWaitlist(file: File, waitlistId: string): Promise<string> {
  const kind = file.type.startsWith('video') ? 'VIDEO' : 'IMAGE';
  const presign = await jsonFetch<{
    ok: true; uploadUrl: string; publicUrl: string; key: string; context: { target: 'waitlist.media'; kind: 'IMAGE' | 'VIDEO'; waitlistId: string }
  }>('/api/uploads/presign', {
    method: 'POST',
    body: JSON.stringify({ target: 'waitlist.media', kind, waitlistId, filename: file.name, contentType: file.type }),
  });

  const put = await fetch(presign.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
  if (!put.ok) throw new Error('Upload failed');

  await jsonFetch<{ ok: true }>('/api/uploads/commit', {
    method: 'POST',
    body: JSON.stringify({
      key: presign.key,
      publicUrl: presign.publicUrl,
      target: presign.context.target,
      kind: presign.context.kind,
      waitlistId: presign.context.waitlistId,
    }),
  });

  return presign.publicUrl;
}

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

const ensureHttp = (v: string) => {
  const s = v.trim();
  if (!s) return s;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
};

export default function ContentFullSection() {
  const [uploadingMedia, setUploadingMedia] = useState<number[]>([]);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const router = useRouter();

  // identity + flags
  const [waitlistId, setWaitlistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form state
  const [media, setMedia] = useState<string[]>([]);
  const [bannerVideo, setBannerVideo] = useState<string | null>(null);
  const [benefits, setBenefits] = useState<Benefit[]>([{ text: '' }]);
  const [socials, setSocials] = useState<SocialLinks>({
    website: '', youtube: '', instagram: '', linkedin: '', facebook: '', x: '',
  });
  const [faqs, setFaqs] = useState<FAQ[]>([{ question: '', answer: '' }]);

  // touched/errors
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // hydrate
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const mine = await jsonFetch<{ ok: true; waitlist: { id: string } }>('/api/waitlists/mine', { method: 'GET' });
        if (!alive) return;
        setWaitlistId(mine.waitlist.id);

        // Prefer dedicated content endpoint; fallback to main waitlist
        try {
          const c = await jsonFetch<{
            ok: true;
            content: {
              media?: string[];
              bannerVideoUrl?: string | null;
              benefits?: string[];
              socials?: Partial<SocialLinks>;
              faqs?: FAQ[];
            };
          }>(`/api/waitlists/${mine.waitlist.id}/content`, { method: 'GET' });

          if (!alive) return;
          setMedia(c.content.media ?? []);
          setBannerVideo(c.content.bannerVideoUrl ?? null);
          setBenefits((c.content.benefits ?? []).length ? (c.content.benefits ?? []).map((t) => ({ text: t })) : [{ text: '' }]);
          setSocials({
            website: '', youtube: '', instagram: '', linkedin: '', facebook: '', x: '',
            ...(c.content.socials || {}),
          } as SocialLinks);
          setFaqs((c.content.faqs ?? []).length ? (c.content.faqs ?? []) : [{ question: '', answer: '' }]);
        } catch {
          const got = await jsonFetch<WaitlistAPIResponse>(`/api/waitlists/${mine.waitlist.id}`, { method: 'GET' });
          if (!alive) return;
          const w = got?.waitlist ?? {};
          setMedia(w.media ?? []);
          setBannerVideo(w.bannerVideoUrl ?? null);
          setBenefits((w.benefits ?? []).length ? (w.benefits as string[]).map((t) => ({ text: t })) : [{ text: '' }]);
          setSocials({
            website: '', youtube: '', instagram: '', linkedin: '', facebook: '', x: '',
            ...(w.socials || {}),
          } as SocialLinks);
          setFaqs((w.faqs ?? []).length ? (w.faqs as FAQ[]) : [{ question: '', answer: '' }]);
        }
      } catch (e) {
        console.error('Content hydrate failed:', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const computeErrors = React.useCallback(() => {
    const e: Record<string, string> = {};
    if (media.length === 0) e.media = "At least one image/video is required.";
    if (!bannerVideo) e.bannerVideo = "Banner video is required.";
    if (benefits.length === 0 || benefits.some((b) => !b.text.trim()))
      e.benefits = "All benefits must be filled.";
    for (const [key, val] of Object.entries(socials)) {
      if (!String(val || "").trim())
        e[`socials.${key}`] = `${key} link is required.`;
    }
    if (
      faqs.length === 0 ||
      faqs.some((f) => !f.question.trim() || !f.answer.trim())
    )
      e.faqs = "All FAQs must have a question and answer.";
    return e;
  }, [media, bannerVideo, benefits, socials, faqs]);

  const isValid = useMemo(() => Object.keys(computeErrors()).length === 0, [computeErrors]);


  const show = (key: string) => errors[key] && touched[key];

  // uploads
  const handleMediaUpload = async (file: File) => {
    if (!waitlistId) return;
    const tempId = Date.now();
    setUploadingMedia((prev) => [...prev, tempId]);

    try {
      const url = await uploadForWaitlist(file, waitlistId);
      setMedia((prev) => [...prev, url]);
    } finally {
      setUploadingMedia((prev) => prev.filter((id) => id !== tempId));
      setTouched((t) => ({ ...t, media: true }));
    }
  };
  const removeMedia = (idx: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== idx));
    setTouched((t) => ({ ...t, media: true }));
  };
  const handleBannerUpload = async (file: File) => {
    if (!waitlistId) return;
    setUploadingBanner(true);

    try {
      const url = await uploadForWaitlist(file, waitlistId);
      setBannerVideo(url);
    } finally {
      setUploadingBanner(false);
      setTouched((t) => ({ ...t, bannerVideo: true }));
    }
  };
  const onSaveNext = async () => {
    const e = computeErrors();
    setErrors(e);
    if (Object.keys(e).length > 0 || !waitlistId || saving || loading) return;

    try {
      setSaving(true);
      await jsonFetch(`/api/waitlists/${waitlistId}/content`, {
        method: 'PATCH',
        body: JSON.stringify({
          media,
          bannerVideoUrl: bannerVideo,
          benefits: benefits.map((b) => b.text),
          socials,
          faqs,
        }),
      });
      router.refresh();
      router.push('/wait-list/setup/price');
    } catch (e) {
      console.error('Content save failed:', e);
      alert((e as Error).message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const onGoBack = () => router.push('/wait-list/setup/course');

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0A5DBC] border-solid" />
    </div>
  }

  // ────────────────────────────────────────────────────────── UI
  // ⚠️ IMPORTANT: For the scroll to work exactly as desired:
  // 1) Ensure the immediate parent *page* or container gives this section a fixed height (e.g., h-[calc(100vh-...)] or h-full).
  // 2) This component uses `flex-col h-full min-h-0` so the inner card can scroll without pushing the footer.
  return (
    <form className="w-full h-full flex flex-col pb-4">
      <div className='flex flex-col h-[90%] w-full overflow-y-auto overflow-x-hidden gap-4 sm:gap-6 pb-6'>
        <section>
          <h3 className="text-lg font-semibold mb-3">Images & Video</h3>
          {show('media') && <p className="text-red-500 text-sm">{errors.media}</p>}
          <div className="flex flex-wrap gap-3">
            {media.map((m, idx) => {
              const isVideo = /\.(mp4|webm|ogg)$/i.test(m) || m.includes("video");
              return (
                <div
                  key={idx}
                  className="relative w-[120px] h-[120px] rounded-xl overflow-hidden border"
                >
                  {isVideo ? (
                    <video src={m} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={m} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(idx)}
                    className="absolute top-1 right-1 bg-white rounded-full px-1 text-xs"
                    disabled={loading || saving}
                  >
                    ✕
                  </button>
                </div>
              );
            })}

            {/* Skeletons while uploading media */}
            {uploadingMedia.map((id) => (
              <div
                key={id}
                className="w-[120px] h-[120px] rounded-xl bg-gray-200 animate-pulse border"
              />
            ))}

            <label className="w-[120px] h-[120px] flex items-center justify-center border border-dashed border-[#ECECEC] rounded-xl cursor-pointer">
              + Upload
              <input
                type="file"
                className="hidden"
                disabled={loading || saving || !waitlistId}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleMediaUpload(file);
                }}
                onBlur={() => setTouched((t) => ({ ...t, media: true }))}
              />
            </label>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">Banner Video</h3>
          {show('bannerVideo') && <p className="text-red-500 text-sm">{errors.bannerVideo}</p>}
          {bannerVideo ? (
            <div className="relative w-full max-w-md">
              <video src={bannerVideo} controls className="w-full rounded-xl" />
              <button
                type="button"
                onClick={() => setBannerVideo(null)}
                className="absolute top-2 right-2 bg-white rounded-full px-2 text-xs"
                disabled={loading || saving}
              >
                ✕
              </button>
            </div>
          ) : uploadingBanner ? (
            <div className="w-full max-w-md h-[200px] bg-gray-200 animate-pulse rounded-xl" />
          ) : (
            <label className="px-4 py-2 border border-[#ECECEC] rounded-lg cursor-pointer">
              + Upload Banner Video
              <input
                type="file"
                accept="video/*"
                className="hidden"
                disabled={loading || saving || !waitlistId}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleBannerUpload(file);
                }}
                onBlur={() => setTouched((t) => ({ ...t, bannerVideo: true }))}
              />
            </label>
          )}
        </section>
        <section>
          <h3 className="text-lg font-semibold mb-3">Benefits for Subscribers</h3>
          {show('benefits') && <p className="text-red-500 text-sm">{errors.benefits}</p>}
          {benefits.map((b, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                value={b.text}
                disabled={loading || saving}
                onChange={(e) => {
                  const updated = [...benefits];
                  updated[idx].text = e.target.value;
                  setBenefits(updated);
                }}
                onBlur={() => setTouched((t) => ({ ...t, benefits: true }))}
                placeholder="Enter benefit"
                className="flex-1 border border-[#ECECEC] rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => { setBenefits(benefits.filter((_, i) => i !== idx)); setTouched((t) => ({ ...t, benefits: true })); }}
                className="text-red-500"
                disabled={loading || saving}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setBenefits([...benefits, { text: '' }])}
            className="text-sm border border-[#ECECEC] rounded-lg px-3 py-1"
            disabled={loading || saving}
          >
            + Add Benefit
          </button>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">Socials</h3>
          {Object.entries(socials).map(([key, val]) => (
            <div key={key} className="mb-2">
              {show(`socials.${key}`) && <p className="text-red-500 text-sm">{errors[`socials.${key}`]}</p>}
              <input
                type="text"
                value={val}
                disabled={loading || saving}
                onChange={(e) => setSocials({ ...socials, [key]: e.target.value })}
                onBlur={() => {
                  setSocials((prev) => ({
                    ...prev,
                    [key]: ensureHttp(prev[key as keyof SocialLinks]),
                  }));
                  setTouched((t) => ({ ...t, [`socials.${key}`]: true }));
                }}
                placeholder={`Enter ${key} link`}
                className="w-full border border-[#ECECEC] rounded-lg px-3 py-2 text-sm"
              />
            </div>
          ))}
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">FAQs</h3>
          {show('faqs') && <p className="text-red-500 text-sm">{errors.faqs}</p>}
          {faqs.map((faq, idx) => (
            <div key={idx} className="mb-4 border border-[#ECECEC] rounded-xl p-3 flex flex-col gap-2">
              <input
                type="text"
                value={faq.question}
                disabled={loading || saving}
                onChange={(e) => {
                  const updated = [...faqs];
                  updated[idx].question = e.target.value;
                  setFaqs(updated);
                }}
                onBlur={() => setTouched((t) => ({ ...t, faqs: true }))}
                placeholder="Enter question"
                className="w-full border border-[#ECECEC] rounded-lg px-3 py-2 text-sm"
              />
              <textarea
                value={faq.answer}
                disabled={loading || saving}
                onChange={(e) => {
                  const updated = [...faqs];
                  updated[idx].answer = e.target.value;
                  setFaqs(updated);
                }}
                onBlur={() => setTouched((t) => ({ ...t, faqs: true }))}
                placeholder="Enter answer"
                className="w-full border border-[#ECECEC] rounded-lg px-3 py-2 text-sm min-h-[60px]"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setFaqs(faqs.filter((_, i) => i !== idx)); setTouched((t) => ({ ...t, faqs: true })); }}
                  className="text-red-500 text-sm"
                  disabled={loading || saving}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
            className="text-sm border border-[#ECECEC] rounded-lg px-3 py-1"
            disabled={loading || saving}
          >
            + Add FAQ
          </button>
        </section>

      </div>
      {/* </div> */}

      {/* </div> */}
      <div className='flex justify-end w-full h-[10%] border-t border-[#ECECEC] gap-4'>
        <div className='flex flex-col justify-center items-center '>
          <button
            type="button"
            onClick={onGoBack}
            className="w-[90px] sm:w-[100px] h-[35px] sm:h-[44px] border border-[#ECECEC] rounded-[10px] sm:rounded-[15px] flex items-center justify-center text-[#787878] text-[14px] sm:text-[16px] font-[500] leading-[24px]"
          >
            Go back
          </button>
        </div>
        <div className='flex flex-col justify-center items-center'>
          <button
            type="button"
            onClick={onSaveNext}
            disabled={loading || saving || !isValid || !waitlistId}
            className={`w-[110px] sm:w-[126px] h-[35px] sm:h-[44px] rounded-[10px] sm:rounded-[15px] flex items-center justify-center text-white text-[14px] sm:text-[16px] font-[500] leading-[24px] ${loading || saving || !isValid || !waitlistId ? 'bg-[#0A5DBC]/60 cursor-not-allowed' : 'bg-[#0A5DBC]'
              }`}
          >
            {saving ? 'Saving…' : 'Save & Next'}
          </button>
        </div>
      </div>
    </form>
  );
}
