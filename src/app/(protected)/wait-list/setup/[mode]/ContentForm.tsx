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
    slug?: string
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

// Labels for socials
const SOCIAL_LABELS: Record<keyof SocialLinks, string> = {
  website: 'Website',
  youtube: 'YouTube',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  x: 'Twitter (X)',
};

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

const ensureHttp = (v: string) => {
  const s = v.trim();
  if (!s) return s;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
};

const renderMedia = (url: string, isBanner = false) => {
  const videoFile = /\.(mp4|mov|avi|webm|ogg)$/i.test(url);
  const youtube = /youtu(\.be|be\.com)/i.test(url);
  const vimeo = /vimeo/i.test(url);
  const isIframe = youtube || vimeo;

  if (videoFile) {
    // Direct video file
    return <video src={url} controls className={`w-full ${isBanner ? 'h-[300px]' : 'h-full'} object-cover rounded-xl`} />;
  }

  if (isIframe) {
    // YouTube / Vimeo embed
    let embedUrl = url;

    if (youtube) {
      const videoIdMatch = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
      const videoId = videoIdMatch ? videoIdMatch[1] : '';
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (vimeo) {
      const videoIdMatch = url.match(/vimeo\.com\/(\d+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : '';
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }

    return (
      <iframe
        src={embedUrl}
        className={`w-full ${isBanner ? 'h-[300px]' : 'h-full'} rounded-xl`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  // Fallback for images
  return <img src={url} alt="" className={`w-full ${isBanner ? 'h-[300px]' : 'h-full'} object-cover rounded-xl`} />;
};

export default function ContentFullSection({ status }: { status: string }) {
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
  const [saveAttempted, setSaveAttempted] = useState(false);

  // Modal states (for media & banner)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<'media' | 'banner' | null>(null);
  const [modalTab, setModalTab] = useState<'upload' | 'embed'>('upload');
  const [embedUrl, setEmbedUrl] = useState('');
  const [modalUploadingFiles, setModalUploadingFiles] = useState<boolean>(false);
  const [slug, setSlug] = useState<string | null>('')

  // hydrate
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const mine = await jsonFetch<{ ok: true; waitlist: { id: string, slug: string } }>('/api/waitlists/mine', { method: 'GET' });
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
          setSlug(mine.waitlist.slug)
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
    // FAQs optional by design
    return e;
  }, [media, bannerVideo, benefits, socials, faqs]);

  // valid only for enabling/disabling UI decisions but Save is allowed even if invalid
  const isValid = useMemo(() => Object.keys(computeErrors()).length === 0, [computeErrors]);

  const show = (key: string) => Boolean(errors[key] && (touched[key] || saveAttempted));

  // ───────────────────────────────── Upload handlers / Modal behavior
  const handleMediaUpload = async (file: File) => {
    if (!waitlistId) return;
    const tempId = Date.now() + Math.random();
    setUploadingMedia((prev) => [...prev, tempId]);

    try {
      const url = await uploadForWaitlist(file, waitlistId);
      setMedia((prev) => [...prev, url]);
    } catch (err) {
      console.error('Media upload failed', err);
      alert((err as Error)?.message || 'Upload failed');
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
    } catch (err) {
      console.error('Banner upload failed', err);
      alert((err as Error)?.message || 'Upload failed');
    } finally {
      setUploadingBanner(false);
      setTouched((t) => ({ ...t, bannerVideo: true }));
    }
  };

  // Modal openers
  const openModalFor = (target: 'media' | 'banner') => {
    setModalTarget(target);
    setModalTab('upload');
    setEmbedUrl('');
    setModalOpen(true);
  };

  // When user chooses embed url in modal
  const confirmEmbed = () => {
    const raw = embedUrl.trim();
    if (!raw) {
      alert('Please enter a valid URL');
      return;
    }
    const url = ensureHttp(raw);
    if (modalTarget === 'media') {
      setMedia((prev) => [...prev, url]);
      setTouched((t) => ({ ...t, media: true }));
    } else if (modalTarget === 'banner') {
      setBannerVideo(url);
      setTouched((t) => ({ ...t, bannerVideo: true }));
    }
    closeModal();
  };

  // When user chooses files to upload in modal
  const handleModalFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!waitlistId) {
      alert('Waitlist ID not ready');
      return;
    }
    setModalUploadingFiles(true);
    try {
      // allow multiple
      for (const f of Array.from(files)) {
        if (modalTarget === 'media') {
          await handleMediaUpload(f);
        } else if (modalTarget === 'banner') {
          // For banner only keep the last uploaded file
          const url = await uploadForWaitlist(f, waitlistId);
          setBannerVideo(url);
          setTouched((t) => ({ ...t, bannerVideo: true }));
        }
      }
    } finally {
      setModalUploadingFiles(false);
      closeModal();
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalTarget(null);
    setEmbedUrl('');
    setModalTab('upload');
  };

  // ────────────────────────────────────────────────────────── Save & Navigation
  const onSaveNext = async (isStatus: boolean) => {
    setSaveAttempted(true);
    const e = computeErrors();
    setErrors(e);

    // mark all fields as touched so errors show up visually
    const newTouched: Record<string, boolean> = { ...touched };
    newTouched.media = true;
    newTouched.bannerVideo = true;
    newTouched.benefits = true;
    for (const k of Object.keys(socials)) {
      newTouched[`socials.${k}`] = true;
    }
    newTouched.faqs = true;
    setTouched(newTouched);

    if (Object.keys(e).length > 0 || !waitlistId || saving || loading) {
      // don't proceed
      return;
    }

    try {
      setSaving(true);

      // ⬇️ Skip sending FAQs if all are blank
      const cleanFaqs = faqs.filter(f => f.question.trim() && f.answer.trim());

      await jsonFetch(`/api/waitlists/${waitlistId}/content`, {
        method: 'PATCH',
        body: JSON.stringify({
          media,
          bannerVideoUrl: bannerVideo,
          benefits: benefits.map((b) => b.text),
          socials,
          faqs: cleanFaqs.length > 0 ? cleanFaqs : undefined,
        }),
      });
      router.refresh();
      if (!isStatus) {
        router.replace('/wait-list/setup/price');
      } else {
        router.replace('/wait-list/' + slug);
      }
    } catch (err) {
      console.error('Content save failed:', err);
      alert((err as Error).message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const onGoBack = () => { status === 'completed' ? router.push('/dashboard') : router.push('/wait-list/setup/course') };

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0A5DBC] border-solid" />
    </div>
  }

  // helpers
  const isVideoUrl = (u: string) =>
    /\.(mp4|mov|avi|webm|ogg)$/i.test(u) || /youtu(\.be|be\.com)/i.test(u) || /vimeo/i.test(u);

  return (
    <form className="w-full h-full flex flex-col pb-4">
      <div className='flex flex-col h-[90%] w-full overflow-y-auto overflow-x-hidden gap-4 sm:gap-6 pb-6'>
        <section>
          <h3 className="text-lg font-semibold mb-3">Images & Video</h3>
          {show('media') && <p className="text-red-500 text-sm">{errors.media}</p>}
          <div className="flex flex-wrap gap-3">
            {media.map((m, idx) => (
              <div
                key={idx}
                className="relative w-[120px] h-[120px] rounded-xl overflow-hidden border"
              >
                {renderMedia(m)} {/* <-- use renderMedia here */}
                <button
                  type="button"
                  onClick={() => removeMedia(idx)}
                  className="cursor-pointer absolute top-1 right-1 bg-white rounded-full px-1 text-xs"
                  disabled={loading || saving}
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Skeletons while uploading media */}
            {uploadingMedia.map((id) => (
              <div
                key={id}
                className="w-[120px] h-[120px] rounded-xl bg-gray-200 animate-pulse border"
              />
            ))}

            {/* Upload tile opens modal */}

            {/* <button
              type="button"
              onClick={() => openModalFor('media')}
              className="w-[120px] h-[120px] flex items-center justify-center border border-dashed border-[#ECECEC] rounded-xl cursor-pointer text-sm"
              disabled={loading || saving || !waitlistId}
            >
              + Upload
            </button> */}
          </div>
          <button
            type="button"
            onClick={() => openModalFor('media')}

            className="text-sm mt-2 cursor-pointer border bg-[#0A5DBC] text-white border-[#ECECEC] rounded-lg px-3 py-2"
            disabled={loading || saving}
          >
            + Add New
          </button>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">Banner Video</h3>
          {show('bannerVideo') && <p className="text-red-500 text-sm">{errors.bannerVideo}</p>}
          {bannerVideo ? (
            <div className="relative w-full max-w-md">
              {renderMedia(bannerVideo, true)} {/* <-- renderMedia handles banner as well */}
              <button
                type="button"
                onClick={() => setBannerVideo(null)}
                className="cursor-pointer absolute top-2 right-2 bg-white rounded-full px-2 text-xs"
                disabled={loading || saving}
              >
                ✕
              </button>
            </div>
          ) : uploadingBanner ? (
            <div className="w-full max-w-md h-[200px] bg-gray-200 animate-pulse rounded-xl" />
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <button
                type="button"
                onClick={() => openModalFor('banner')}
                className="text-[12px] sm:text-[16px] text-center px-4 py-2 border border-[#ECECEC] w-full sm:w-auto rounded-lg cursor-pointer h-[200px]"
                disabled={loading || saving || !waitlistId}
              >
                + Upload / Embed Banner Video
              </button>
              <p className="text-sm text-[#6b6b6b]">Supported: video files or embed URLs (YouTube, Vimeo, direct mp4, etc.)</p>
            </div>
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
                className="text-red-500 cursor-pointer"
                disabled={loading || saving}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setBenefits([...benefits, { text: '' }])}
            className="text-sm cursor-pointer border bg-[#0A5DBC] text-white border-[#ECECEC] rounded-lg px-3 py-2"
            disabled={loading || saving}
          >
            + Add Benefit
          </button>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">Socials</h3>
          {Object.entries(socials).map(([key, val]) => (
            <div key={key} className="mb-2">
              <label className="block text-sm font-medium mb-1 capitalize">
                {SOCIAL_LABELS[key as keyof SocialLinks] ?? key}
              </label>
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
                placeholder={`Enter ${SOCIAL_LABELS[key as keyof SocialLinks] ?? key} link`}
                className="w-full border border-[#ECECEC] rounded-lg px-3 py-2 text-sm"
              />
            </div>
          ))}
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">FAQs (optional)</h3>
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
                  className="text-red-500 text-sm cursor-pointer"
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
            className="text-sm cursor-pointer border text-white border-[#ECECEC] bg-[#0A5DBC] rounded-lg px-3 py-2"
            disabled={loading || saving}
          >
            + Add FAQ
          </button>
        </section>
      </div>

      <div className='flex justify-end w-full h-[10%] border-t border-[#ECECEC] gap-4 px-4 py-3'>
        <div className='flex flex-col justify-center items-center '>
          <button
            type="button"
            onClick={onGoBack}
            className="w-[90px] cursor-pointer sm:w-[100px] h-[35px] sm:h-[44px] border border-[#ECECEC] rounded-[10px] sm:rounded-[15px] flex items-center justify-center text-[#787878] text-[14px] sm:text-[16px] font-[500] leading-[24px]"
            disabled={loading || saving}
          >
            Go back
          </button>
        </div>
        {status === 'completed' &&
          <div className='flex flex-col justify-center items-center'>
            <button
              type="button"
              onClick={() => onSaveNext(true)}
              disabled={loading || saving}
              // disabled={loading || saving || !isValid || !waitlistId}
              className={`w-[110px] sm:w-[126px] h-[35px] sm:h-[44px] rounded-[10px] sm:rounded-[15px] flex items-center justify-center text-white text-[14px] sm:text-[16px] font-[500] leading-[24px] ${loading || saving ? 'bg-[#0A5DBC]/60 cursor-not-allowed' : 'bg-[#0A5DBC]'
                }`}
            >
              {saving ? 'Publishing...' : 'Publish'}
            </button></div>}
        <div className='flex flex-col justify-center items-center'>
          <button
            type="button"
            onClick={() => onSaveNext(false)}
            disabled={loading || saving}
            className={`w-[110px] cursor-pointer sm:w-[126px] h-[35px] sm:h-[44px] rounded-[10px] sm:rounded-[15px] flex items-center justify-center text-white text-[14px] sm:text-[16px] font-[500] leading-[24px] ${loading || saving ? 'bg-[#0A5DBC]/60 cursor-not-allowed' : 'bg-[#0A5DBC]'
              }`}
          >
            {saving ? 'Saving…' : 'Save & Next'}
          </button>
        </div>
      </div>

      {/* --------------------------- Modal --------------------------- */}
      {modalOpen && modalTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          <div className="fixed inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative z-10 bg-white rounded-lg shadow-lg w-[min(720px,95%)] max-h-[90vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">{modalTarget === 'media' ? 'Add Media' : 'Banner Video'}</h4>
              <button type="button" onClick={closeModal} className="cursor-pointer text-sm px-2 py-1">Close</button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setModalTab('upload')}
                className={`px-3 cursor-pointer py-2 rounded ${modalTab === 'upload' ? 'bg-[#0A5DBC] text-white' : 'bg-gray-100'}`}
              >
                Upload
              </button>
              <button
                type="button"
                onClick={() => setModalTab('embed')}
                className={`px-3 cursor-pointer py-2 rounded ${modalTab === 'embed' ? 'bg-[#0A5DBC] text-white' : 'bg-gray-100'}`}
              >
                Embed URL
              </button>
            </div>

            {modalTab === 'upload' ? (
              <div className='border border-dashed border-gray-300 p-3 rounded-[8px] relative'>
                {modalUploadingFiles ? (
                  <div className="w-full h-24 flex flex-col items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#0A5DBC] border-solid" />
                    <p className="text-sm text-[#6b6b6b]">Uploading…</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm mb-3">Select file{modalTarget === 'media' ? 's' : ''} to upload.</p>
                    <input
                      type="file"
                      multiple={modalTarget === 'media'}
                      accept={modalTarget === 'banner' ? 'video/*' : undefined}
                      onChange={(e) => handleModalFiles(e.target.files)}
                      className="mb-4"
                      disabled={modalUploadingFiles || modalTarget === null}
                    />
                    <div className="text-sm text-[#6b6b6b]">
                      For banner, upload a video file. For media, you can upload images or videos.
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Embed tab remains the same
              <div>
                <p className="text-sm mb-3">{modalTarget === 'media' ? 'Paste an image or video URL to embed it.' : 'Paste a banner video URL (YouTube, Vimeo, mp4 link).'}</p>
                <input
                  type="text"
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-[#ECECEC] rounded-lg px-3 py-2 mb-3"
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={closeModal} className="px-3 py-2 cursor-pointer rounded border">Cancel</button>
                  <button type="button" onClick={confirmEmbed} className="px-3 py-2 cursor-pointer rounded bg-[#0A5DBC] text-white">Add</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
