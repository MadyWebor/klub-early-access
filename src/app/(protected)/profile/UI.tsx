'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ProfileCreateSchema,
  ProfileUpdateSchema,
} from "@/lib/validators/profile";

type Profile = {
  id: string;
  email: string | null;
  image: string | null;
  name: string | null;
  handle: string | null;
  bio: string | null;
  onboardingStatus: "profile" | "course" | "content" | "price" | "completed";
  createdAt: string;
  updatedAt: string;
};

type Field = "fullName" | "handle" | "bio" | "image";
type Errors = Partial<Record<Field | "form", string>>;

function Alert({
  kind = "error",
  message,
  onClose,
}: {
  kind?: "error" | "success";
  message: string;
  onClose?: () => void;
}) {
  const isError = kind === "error";
  return (
    <div
      role="alert"
      aria-live="polite"
      className={[
        "mt-4 w-full rounded-xl border px-4 py-3 text-sm",
        isError
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border">
          {isError ? "!" : "✓"}
        </span>
        <div className="flex-1">{message}</div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="ml-2 rounded-md px-2 py-1 text-xs hover:bg-black/5"
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}

// simple helper to avoid `any` in catches
function errorMessage(e: unknown, fallback: string) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try { return JSON.stringify(e); } catch {}
  return fallback;
}

export default function Profile() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null)[0];

  const [onboardingStatus, setOnboardingStatus] =
    useState<Profile["onboardingStatus"]>("profile");

  const [fullName, setFullName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");

  // validation + alert state
  const [errors, setErrors] = useState<Errors>({});
  const [alertMsg, setAlertMsg] = useState<string>(""); // general/server error
  const [alertKind, setAlertKind] = useState<"error" | "success">("error");

  async function uploadFileToStorage(file: File) {
    try {
      setUploading(true);

      // 1) ask server for presigned URL
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          kind: file.type.startsWith("video/") ? "VIDEO" : (file.type.startsWith("image/") ? "IMAGE" : "FILE"),
          target: "user.image",
        }),
      });
      const presigned = await presignRes.json();
      if (!presignRes.ok || !presigned.ok) {
        throw new Error(presigned?.error?.message || "Failed to presign");
      }

      // 2) PUT directly to storage
      const putRes = await fetch(presigned.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!putRes.ok) throw new Error(`Upload failed with ${putRes.status}`);

      // 3) Commit into DB (update User.image)
      const commitRes = await fetch("/api/uploads/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: presigned.key,
          publicUrl: presigned.publicUrl,
          kind: presigned.context.kind,
          target: "user.image",
        }),
      });
      const committed = await commitRes.json();
      if (!commitRes.ok || !committed.ok) {
        throw new Error(committed?.error?.message || "Commit failed");
      }

      // 4) update UI
      setImage(presigned.publicUrl);
      clearFieldError("image");
      setAlertKind("success");
      setAlertMsg("Image uploaded.");
    } catch (e: unknown) {
      setAlertKind("error");
      setAlertMsg(errorMessage(e, "Upload failed."));
    } finally {
      setUploading(false);
    }
  }

  // helper: clear one field error
  const clearFieldError = (field: Field) =>
    setErrors((e) => ({ ...e, [field]: undefined }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/profile", { method: "GET" });
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error?.message || "Failed to load profile");
        }
        if (cancelled) return;

        const p: Profile | null = data.profile ?? null;
        if (p) {
          setOnboardingStatus(p.onboardingStatus);
          setFullName(p.name ?? "");
          setHandle(p.handle ?? "");
          setBio(p.bio ?? "");
          setImage(p.image ?? "");
        }
      } catch (err: unknown) {
        setAlertKind("error");
        setAlertMsg(errorMessage(err, "Could not load your profile."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAlertMsg("");
    setErrors({}); // reset

    const payload = { fullName, handle, bio, image: image || undefined };
    const schema =
      onboardingStatus === "profile" ? ProfileCreateSchema : ProfileUpdateSchema;

    const result = schema.safeParse(payload);
    if (!result.success) {
      const f = result.error.flatten();
      setErrors({
        fullName: f.fieldErrors.fullName?.[0],
        handle: f.fieldErrors.handle?.[0],
        bio: f.fieldErrors.bio?.[0],
        image: f.fieldErrors.image?.[0],
        form: f.formErrors?.[0],
      });
      if (f.formErrors?.[0]) {
        setAlertKind("error");
        setAlertMsg(f.formErrors[0]);
      }
      return;
    }

    setSaving(true);
    try {
      const method = onboardingStatus === "profile" ? "POST" : "PATCH";
      const res = await fetch("/api/profile", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        const serverFieldErrors: Partial<Record<Field, string>> = data?.errors || {};
        setErrors((prev) => ({ ...prev, ...serverFieldErrors }));

        const msg =
          data?.error?.message ||
          serverFieldErrors.handle ||
          serverFieldErrors.fullName ||
          serverFieldErrors.bio ||
          serverFieldErrors.image ||
          "Failed to save profile";
        throw new Error(msg);
      }

      if (data.profile?.handle) setHandle(data.profile.handle);

      const next: string = data.next ?? "/wait-list/setup/course";
      setAlertKind("success");
      setAlertMsg("Profile saved successfully.");
      router.push(next);
    } catch (err: unknown) {
      setAlertKind("error");
      setAlertMsg(errorMessage(err, "Something went wrong while saving."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full min-h-[100vh] bg-white flex items-center justify-center">
      <div className="w-[90%] max-w-[680px] px-3 sm:px-6 md:px-8 py-6 sm:py-8">
        {/* Top badge */}
        <div className="w-full flex justify-end">
          <div className="w-fit h-[34px] rounded-[10px] border border-[#D4E4F3] bg-[#E6EFF8] flex px-[10px] py-[5px] text-[#0A5DBC] gap-[6px]">
            <div className="flex items-center justify-center">
              <div className="w-[12px] h-[12px] rounded-full bg-[#0A5DBC]" />
            </div>
            <div className="flex items-center justify-center">
              <span className="text-[12px] font-medium">Early Access</span>
            </div>
          </div>
        </div>

        {/* Papyrus Container */}
        <div className="mt-6 w-full rounded-[20px] bg-[url('/papyrus.png')] bg-cover bg-center shadow-md">
          <div className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 md:p-8 text-[#2A2A2A]">
            {/* Heading */}
            <div>
              <span className="font-semibold leading-tight text-[20px] sm:text-[22px] md:text-[26px]">
                Let&apos;s <span className="text-[#0A5DBC]">Setup your profile</span>
              </span>
              <p className="mt-2 sm:mt-3 text-[#787878] font-[500] text-[14px] sm:text-[15px] md:text-[16px]">
                Personalize how you will appear to people on Klub
              </p>
            </div>

            {/* Global alert (server/form errors) */}
            {alertMsg ? (
              <Alert
                kind={alertKind}
                message={alertMsg}
                onClose={() => setAlertMsg("")}
              />
            ) : null}

            {/* Avatar + Edit */}
            <div className="w-full flex justify-center">
              <div className="relative w-[72px] h-[72px] sm:w-[85px] sm:h-[85px] border-2 rounded-[15px] border-[#000000] p-[2px] bg-white shadow">
                <div className="w-full h-full rounded-[15px] overflow-hidden">
                  <img
                    src={image || "/user.jpg"}
                    alt="Profile"
                    width={240}
                    height={280}
                    className="w-full h-full object-cover"
                  />
                </div>

                <button
                  type="button"
                  className="absolute bottom-[-18px] right-1 sm:right-[-30px] flex items-center gap-1 px-[8px] py-[4px] bg-white rounded-[10px] border border-[#DADADA] text-[12px] sm:text-[13px] md:text-[14px] font-medium hover:bg-gray-100 transition shadow"
                  onClick={() => document.getElementById("avatar-file")?.click()}
                >
                  <svg
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    stroke="#fff"
                    className="text-black"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7.5 21H3v-4.5L16.732 3.732z"
                    />
                  </svg>
                  {uploading ? "Uploading..." : "Edit"}
                </button>
                <input
                  id="avatar-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFileToStorage(file);
                    e.currentTarget.value = ""; // allow re-select same file
                  }}
                />
              </div>
            </div>

            {/* Form */}
            <form
              className="mt-6 sm:mt-7 flex flex-col gap-3 sm:gap-4"
              onSubmit={onSubmit}
              noValidate
            >
              {/* Full name */}
              <div className="flex flex-col gap-1">
                <label
                  className="text-[12px] sm:text-[13px] md:text-[14px] font-[500] text-[#444] opacity-60 mb-1"
                  htmlFor="fullName"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) clearFieldError("fullName");
                  }}
                  disabled={loading || saving}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  className={[
                    "w-full h-[44px] sm:h-[46px] bg-white rounded-[15px] indent-5 text-[14px] font-[500] text-[#2A2A2A] border outline-none transition",
                    errors.fullName
                      ? "border-red-400 focus:border-red-500"
                      : "border-[#ECECEC] focus:border-[#0A5DBC]",
                  ].join(" ")}
                />
                {errors.fullName ? (
                  <p id="fullName-error" className="text-xs text-red-600 mt-1">
                    {errors.fullName}
                  </p>
                ) : null}
              </div>

              {/* Handle / Username */}
              <div className="flex flex-col gap-1">
                <label
                  className="text-[12px] sm:text-[13px] md:text-[14px] font-[500] text-[#444] opacity-60 mb-1"
                  htmlFor="handle"
                >
                  Username
                </label>
                <input
                  id="handle"
                  name="handle"
                  type="text"
                  placeholder="Enter your username"
                  value={handle}
                  onChange={(e) => {
                    setHandle(e.target.value);
                    if (errors.handle) clearFieldError("handle");
                  }}
                  disabled={loading || saving}
                  aria-invalid={!!errors.handle}
                  aria-describedby={errors.handle ? "handle-error" : undefined}
                  className={[
                    "w-full h-[44px] sm:h-[46px] bg-white rounded-[15px] indent-5 text-[14px] font-[500] text-[#2A2A2A] border outline-none transition",
                    errors.handle
                      ? "border-red-400 focus:border-red-500"
                      : "border-[#ECECEC] focus:border-[#0A5DBC]",
                  ].join(" ")}
                />
                {errors.handle ? (
                  <p id="handle-error" className="text-xs text-red-600 mt-1">
                    {errors.handle}
                  </p>
                ) : null}
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1">
                <label
                  className="text-[12px] sm:text-[13px] md:text-[14px] font-[500] text-[#444] opacity-60 mb-1"
                  htmlFor="bio"
                >
                  Enter your bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us something about you"
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    if (errors.bio) clearFieldError("bio");
                  }}
                  disabled={loading || saving}
                  aria-invalid={!!errors.bio}
                  aria-describedby={errors.bio ? "bio-error" : undefined}
                  className={[
                    "w-full h-[96px] sm:h-[110px] py-[10px] bg-white rounded-[15px] indent-5 text-[14px] font-[500] text-[#2A2A2A] border outline-none transition resize-none",
                    errors.bio
                      ? "border-red-400 focus:border-red-500"
                      : "border-[#ECECEC] focus:border-[#0A5DBC]",
                  ].join(" ")}
                />
                {errors.bio ? (
                  <p id="bio-error" className="text-xs text-red-600 mt-1">
                    {errors.bio}
                  </p>
                ) : null}
              </div>

              {/* (Optional) Image URL errors */}
              {errors.image ? (
                <p id="image-error" className="text-xs text-red-600 -mt-2">
                  {errors.image}
                </p>
              ) : null}

              {/* CTA */}
              <button
                className="mt-1 w-full h-[44px] sm:h-[46px] bg-[#0A5DBC] rounded-[15px] flex items-center justify-center disabled:opacity-60"
                type="submit"
                disabled={loading || saving}
              >
                <span className="text-white font-[500] text-[15px] sm:text-[16px] leading-[24px]">
                  {saving ? "Saving..." : "Next"}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
