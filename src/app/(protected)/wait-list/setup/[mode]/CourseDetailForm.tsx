'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { stat } from 'fs';

export type CourseDetails = {
  title: string;
  bioHtml: string;
  aboutHtml: string;
  slug: string;
  thumbnailUrl?: string | null;
  trustedBy?: number | null;
};

type CourseErrors = Partial<
  Record<'title' | 'bioHtml' | 'aboutHtml' | 'slug' | 'thumbnailUrl' | 'trustedBy', string>
>;

async function jsonFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const r = await fetch(input, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || j?.message || 'Request failed');
  return j as T;
}

const stripHtml = (s: string) =>
  (s || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

async function uploadImageForWaitlist(file: File, waitlistId: string): Promise<string> {
  const presign = await jsonFetch<{
    ok: true; uploadUrl: string; publicUrl: string; key: string; context: { target: 'waitlist.media'; kind: 'IMAGE' | 'VIDEO'; waitlistId: string }
  }>('/api/uploads/presign', {
    method: 'POST',
    body: JSON.stringify({ target: 'waitlist.media', kind: 'IMAGE', waitlistId, filename: file.name, contentType: file.type }),
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

function Editor({
  label,
  html,
  onHtml,
  placeholder,
  disabled,
  error,
  onBlur,
}: {
  label: string;
  html: string;
  onHtml: (next: string) => void;
  placeholder: string;
  disabled?: boolean;
  error?: string;
  onBlur?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastRangeRef = useRef<Range | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerHTML !== html) ref.current.innerHTML = html || '';
  }, [html]);

  const saveSel = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const r = sel.getRangeAt(0);
    if (ref.current && ref.current.contains(r.commonAncestorContainer)) lastRangeRef.current = r;
  };
  const restoreSel = () => {
    const r = lastRangeRef.current; const sel = window.getSelection();
    if (!r || !sel) return false;
    sel.removeAllRanges(); sel.addRange(r); return true;
  };
  const commit = () => { if (ref.current) onHtml(ref.current.innerHTML); };

  const highlight = () => {
    if (!ref.current || disabled) return;
    ref.current.focus();
    if (!restoreSel()) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;
    if (!ref.current.contains(range.commonAncestorContainer)) return;
    const frag = range.cloneContents();
    const mark = document.createElement('mark');
    mark.setAttribute('data-hl', '1');
    mark.appendChild(frag);
    range.deleteContents();
    range.insertNode(mark);
    range.setStartAfter(mark);
    range.setEndAfter(mark);
    sel.removeAllRanges();
    sel.addRange(range);
    commit(); saveSel();
  };

  const clearHighlights = () => {
    if (!ref.current || disabled) return;
    ref.current.querySelectorAll('mark').forEach((m) => {
      const parent = m.parentNode as Node;
      while (m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m);
    });
    commit();
  };

  const onPaste: React.ClipboardEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const sel = window.getSelection();
    if (!sel) return;
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      commit(); saveSel();
    }
  };

  const borderClass = error
    ? 'border-red-300 focus-within:ring-2 focus-within:ring-red-200'
    : 'border-[#ECECEC] focus-within:ring-2 focus-within:ring-[#0A5DBC]/20';

  const editorId = React.useId();
  const errId = `${editorId}-error`;

  return (
    <div className="w-full">
      <label className="block text-[12px] text-[#787878] mb-2" htmlFor={editorId}>{label}</label>

      <div className={`rounded-[12px] border overflow-hidden ${borderClass}`}>
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#ECECEC] bg-[#FAFAFA]">
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={highlight} disabled={disabled}
            className=" cursor-pointer h-8 px-3 rounded-[10px] border border-[#ECECEC] text-[12px] disabled:opacity-50">
            Highlight
          </button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={clearHighlights} disabled={disabled}
            className="cursor-pointer h-8 px-3 rounded-[10px] border border-[#ECECEC] text-[12px] disabled:opacity-50">
            Clear
          </button>
          <span className="ml-auto text-[11px] text-[#9a9a9a]">Only highlight is enabled</span>
        </div>

        <div className="relative">
          {(!html || html.replace(/<[^>]+>/g, '').trim().length === 0) && (
            <span className="pointer-events-none absolute left-3 top-2.5 text-[#9a9a9a] text-[13px]">{placeholder}</span>
          )}
          <div
            id={editorId}
            ref={ref}
            className="min-h-[84px] max-h-[220px] overflow-y-auto px-3 py-2 outline-none text-[14px]"
            contentEditable={!disabled}
            suppressContentEditableWarning
            aria-label={label}
            aria-invalid={!!error}
            aria-describedby={error ? errId : undefined}
            role="textbox"
            spellCheck
            tabIndex={0}
            onInput={() => { commit(); saveSel(); }}
            onKeyUp={saveSel}
            onMouseUp={saveSel}
            onFocus={saveSel}
            onBlur={onBlur}
            onPaste={onPaste}
          />
        </div>
      </div>

      {error ? (
        <p id={errId} className="mt-1 text-[12px] text-red-600">{error}</p>
      ) : (
        <p className="mt-1 text-[11px] text-[#9a9a9a]">
        </p>
      )}
    </div>
  );
}


export default function CourseDetailsSection({ status }: { status: string }) {
  const router = useRouter();
  const [uploadingImage, setUploadingImage] = useState(false);


  const [waitlistId, setWaitlistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [state, setState] = useState<CourseDetails>({
    title: '',
    bioHtml: '',
    aboutHtml: '',
    slug: '',
    thumbnailUrl: '',
    trustedBy: 0,
  });

  const [touched, setTouched] = useState<Record<keyof CourseDetails, boolean>>({
    title: false,
    bioHtml: false,
    aboutHtml: false,
    slug: false,
    thumbnailUrl: false,
    trustedBy: false,
  });

  const [showErrors, setShowErrors] = useState(false);

  const setField = <K extends keyof CourseDetails>(k: K, v: CourseDetails[K]) => {
    setState((s) => ({ ...s, [k]: v }));
  };


  // hydrate from API (mine → details)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        // Ensure waitlist exists
        const mine = await jsonFetch<{ ok: true; waitlist: { id: string } }>('/api/waitlists/mine', { method: 'GET' });
        if (!alive) return;
        setWaitlistId(mine.waitlist.id);

        // Get details
        const got = await jsonFetch<{
          ok: true; waitlist: {
            id: string; title?: string; bioHtml?: string; aboutHtml?: string; slug?: string; thumbnailUrl?: string | null; trustedBy?:number | null
          }
        }>(`/api/waitlists/${mine.waitlist.id}`, { method: 'GET' });
        if (!alive) return;

        const next: CourseDetails = {
          title: got.waitlist.title ?? '',
          bioHtml: got.waitlist.bioHtml ?? '',
          aboutHtml: got.waitlist.aboutHtml ?? '',
          slug: got.waitlist.slug ?? '',
          thumbnailUrl: (got.waitlist.thumbnailUrl ?? '') as string,
          trustedBy:got.waitlist.trustedBy ?? 0
        };

        // Only prefill if server has anything (so we don't clobber fresh edits)
        const hasAny =
          stripHtml(next.title).length > 0 ||
          !!next.slug ||
          stripHtml(next.bioHtml).length > 0 ||
          stripHtml(next.aboutHtml).length > 0 ||
          !!next.thumbnailUrl;

        if (hasAny) setState(next);
      } catch (e) {
        console.error('Hydrate failed:', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const inputBorder = (hasError: boolean) =>
    `w-full h-[84px] rounded-[12px] border px-3 py-2 text-[14px] outline-none resize-none ${hasError
      ? 'border-red-300 ring-2 ring-red-200'
      : 'border-[#ECECEC] focus:ring-2 focus:ring-[#0A5DBC]/20'
    }`;

  // Upload handler for thumbnail
  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (!waitlistId) return;
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setUploadingImage(true);
      const url = await uploadImageForWaitlist(f, waitlistId);
      setField('thumbnailUrl', url);
    } catch (err) {
      console.error(err);
      alert((err as Error).message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Slug generator (very simple random string)
  const randomSlug = () => {
    const words = ['fit', 'health', 'mind', 'energy', 'course', 'life', 'wellness'];
    const slug = `${words[Math.floor(Math.random() * words.length)]}-${Math.random().toString(36).substring(2, 6)
      }`;
    setField('slug', slug);
  };

  const errors: CourseErrors = useMemo(() => {
    const e: CourseErrors = {};
    const title = stripHtml(state.title || '');
    if (title.length === 0) e.title = 'Course title is required.';

    const bioText = stripHtml(state.bioHtml || '');
    if (bioText.length === 0) e.bioHtml = 'Course bio is required.';

    const aboutText = stripHtml(state.aboutHtml || '');
    if (aboutText.length === 0) e.aboutHtml = 'About course is required.';

    if (!state.slug || state.slug.trim().length === 0) e.slug = 'Slug is required.';
    else {
      const ok = /^[a-z0-9-]{3,}$/.test(state.slug) && !/^[-]|[-]$/.test(state.slug);
      if (!ok) e.slug = 'Use 3+ chars: lowercase letters, numbers, and hyphens (no leading/trailing hyphen).';
    }

    if (!state.thumbnailUrl || String(state.thumbnailUrl).trim().length === 0) {
      e.thumbnailUrl = 'Course thumbnail is required.';
    }

    if (state.trustedBy === null || state.trustedBy === undefined || state.trustedBy < 1) {
      e.trustedBy = 'Enter a number ≥ 1';
    }

    return e;
  }, [state]);

  const isValid = Object.keys(errors).length === 0;

  // ✅ now errors only show after Save is pressed
  const showErr = (field: keyof CourseErrors) => showErrors && !!errors[field];

  // … inputBorder, randomSlug, onPickFile stay unchanged …

  const onSaveAndNext = async (isStatus:boolean) => {
    // ✅ trigger error display
    setShowErrors(true);

    if (loading || saving || !isValid || !waitlistId) return;

    try {
      setSaving(true);
      await jsonFetch(`/api/waitlists/${waitlistId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: state.title,
          bioHtml: state.bioHtml,
          aboutHtml: state.aboutHtml,
          slug: state.slug,
          thumbnailUrl: state.thumbnailUrl || '',
          trustedBy: state.trustedBy ?? 0,
        }),
      });
      router.refresh();
      if(!isStatus){
        router.replace('/wait-list/setup/content');
      }else{
        router.replace('/wait-list/'+state.slug);
      }
    } catch (e) {
      console.error(e);
      alert((e as Error).message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const onGoBack = () => {status === 'completed' ? router.push('/dashboard'): router.push('/profile') };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0A5DBC] border-solid" />
      </div>
    );
  }


  return (
    <form className="w-full h-full flex flex-col pb-4">
      <div className='flex flex-col h-[90%] w-full overflow-y-auto overflow-x-hidden gap-4 sm:gap-6 p-3 pb-6'>

        <div>
          <label className="block text-[12px] text-[#787878] mb-2">Course Thumbnail</label>
          <div className="flex items-start gap-3">
            <div
              className={`w-[108px] h-[108px] rounded-[16px] overflow-hidden flex items-center justify-center ${showErr('thumbnailUrl') ? 'border border-red-300 ring-2 ring-red-200' : 'border border-[#ECECEC]'
                } bg-[#F6F6F6]`}
            >
              {uploadingImage ? (
                <div className="w-full h-full rounded-[15px] bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-gray-300" />
                </div>
              ) : state.thumbnailUrl ? (
                <img
                  src={state.thumbnailUrl as string}
                  alt="Course thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[12px] text-[#9a9a9a]">200×200</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="thumbFile"
                  className="cursor-pointer h-[36px] px-4 rounded-[10px] border border-[#ECECEC] inline-flex items-center text-[13px]"
                >
                  + Upload new
                </label>
                <input
                  id="thumbFile"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={onPickFile}
                  onBlur={() => setTouched((t) => ({ ...t, thumbnailUrl: true }))}
                  disabled={loading || saving}
                />
                {state.thumbnailUrl ? (
                  <button
                    type="button"
                    onClick={() => { setField('thumbnailUrl', ''); }}
                    className="h-[36px] px-4 rounded-[10px] border border-[#ECECEC] text-[13px] text-red-600"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              {showErr('thumbnailUrl') && (
                <p className="text-[12px] text-red-600">{errors.thumbnailUrl}</p>
              )}
              <p className="text-[11px] text-[#9a9a9a]">200 × 200 px size recommended · JPG / PNG / WEBP</p>
            </div>
          </div>
        </div>

        {/* <div> */}
        <Editor
          label="Course Title"
          html={state.title}
          onHtml={(v) => setField('title', v)}
          placeholder="Your step by step guide to taking control of your health"
          disabled={loading || saving}
          error={showErr('title') ? errors.title : undefined}
        // onBlur={() => setTouched((t) => ({ ...t, title: true }))}
        />
        <div>
          <label className="block text-[12px] text-[#787878] mb-2">Course Bio</label>
          <textarea
            disabled={loading || saving}
            value={state.bioHtml}
            onChange={(e) => setField('bioHtml', e.target.value)}
            // onBlur={() => setTouched((t) => ({ ...t, bioHtml: true }))}
            placeholder="Your guide to getting rid of Acid Reflux in 30 days"
            aria-invalid={showErr('bioHtml')}
            aria-describedby={showErr('bioHtml') ? 'err-bioHtml' : undefined}
            className={inputBorder(showErr('bioHtml'))}
          />
          {showErr('bioHtml') && (
            <p id="err-bioHtml" className="mt-1 text-[12px] text-red-600">{errors.bioHtml}</p>
          )}
        </div>

        <Editor
          label="About Course"
          html={state.aboutHtml}
          onHtml={(v) => setField('aboutHtml', v)}
          placeholder="Be one of the first to get exclusive, early-access to this groundbreaking course. Sign up now."
          disabled={loading || saving}
          error={showErr('aboutHtml') ? errors.aboutHtml : undefined}
        // onBlur={() => setTouched((t) => ({ ...t, aboutHtml: true }))}
        />

        <div>
          <label className="block text-[12px] text-[#787878] mb-2">
            Trusted By (number of people)
          </label>
          <div className="flex items-stretch">
            {/* <span className="select-none inline-flex items-center px-3 rounded-l-[12px] border border-r-0 border-[#ECECEC] bg-[#FAFAFA] text-[13px] text-[#787878]">
              Trusted by
            </span> */}
            <input
              type="number"
              min={1}
              disabled={loading || saving}
              value={state.trustedBy ?? ''}
              onChange={(e) => setField('trustedBy', e.target.value ? parseInt(e.target.value, 10) : null)}
              // onBlur={() => setTouched((t) => ({ ...t, trustedBy: true }))}
              placeholder="1000"
              aria-invalid={showErr('trustedBy')}
              aria-describedby={showErr('trustedBy') ? 'err-trustedBy' : undefined}
              className={`flex-1 h-[44px] border rounded-[12px] px-3 text-[14px] outline-none
    ${showErr('trustedBy')
                  ? 'border-red-300 ring-2 ring-red-200'
                  : 'border-[#ECECEC] focus:ring-2 focus:ring-[#0A5DBC]/20'
                }
    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
  `}
            />
            {/* <span className="select-none inline-flex items-center px-3 rounded-r-[12px] border border-l-0 border-[#ECECEC] bg-[#FAFAFA] text-[13px] text-[#787878]">
              people
            </span> */}
          </div>
          {showErr("trustedBy") && (
            <p id="err-trustedBy" className="mt-1 text-[12px] text-red-600">
              {errors.trustedBy}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[12px] text-[#787878] mb-2">Slug (public URL for your waitlist page)</label>
          <label className="block  sm:hidden text-[11px] text-[#787878] mb-2 bg-[#FAFAFA] w-fit p-1">{window.location.origin}/wait-list/</label>
          <div className="flex items-stretch">
            <span className="hidden sm:inline-flex select-none items-center px-3 rounded-l-[12px] border border-r-0 border-[#ECECEC] bg-[#FAFAFA] text-[13px] text-[#787878]">
              {window.location.origin}/wait-list/
            </span>
              <input
              disabled={loading || saving}
              value={state.slug}
              onChange={(e) => setField('slug', e.target.value.replace(/[^a-z0-9-]/g, '').toLowerCase())}
              // onBlur={() => setTouched((t) => ({ ...t, slug: true }))}
              placeholder="fitwithdranjali"
              aria-invalid={showErr('slug')}
              aria-describedby={showErr('slug') ? 'err-slug' : undefined}
              className={`flex-1 h-[44px] rounded-l-[12px] sm:rounded-l-none sm:rounded-r-none border sm:border-l-0 border-r-0 px-3 text-[14px] outline-none ${showErr('slug') ? 'border-red-300 ring-2 ring-red-200' : 'border-[#ECECEC] focus:ring-2 focus:ring-[#0A5DBC]/20'
                }`}
            />
          
            <button
              type="button"
              onClick={() => {
                setTouched((t) => ({ ...t, slug: true }));
                randomSlug();
              }}
              className="px-3 rounded-r-[12px] border border-l-0 border-[#ECECEC] bg-white"
              title="Generate"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path d="M21 12a9 9 0 1 1-2.64-6.36" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M21 5v5h-5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
          {showErr('slug') && (
            <p id="err-slug" className="mt-1 text-[12px] text-red-600">{errors.slug}</p>
          )}
        </div>


      </div>
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
         {status === 'completed'&&<button
            type="button"
            onClick={()=>onSaveAndNext(true)}
            disabled={loading || saving}
            // disabled={loading || saving || !isValid || !waitlistId}
            className={`w-[110px] sm:w-[126px] h-[35px] sm:h-[44px] rounded-[10px] sm:rounded-[15px] flex items-center justify-center text-white text-[14px] sm:text-[16px] font-[500] leading-[24px] ${loading || saving ? 'bg-[#0A5DBC]/60 cursor-not-allowed' : 'bg-[#0A5DBC]'
              }`}
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>}
        </div>
        <div className='flex flex-col justify-center items-center'>
          <button
            type="button"
            onClick={()=>onSaveAndNext(false)}
            disabled={loading || saving}
            // disabled={loading || saving || !isValid || !waitlistId}
            className={`w-[110px] sm:w-[126px] h-[35px] sm:h-[44px] rounded-[10px] sm:rounded-[15px] flex items-center justify-center text-white text-[14px] sm:text-[16px] font-[500] leading-[24px] ${loading || saving ? 'bg-[#0A5DBC]/60 cursor-not-allowed' : 'bg-[#0A5DBC]'
              }`}
          >
            {saving ? 'Saving…' : 'Save & Next'}
          </button>
        </div>
      </div>
    </form>
  );
}
