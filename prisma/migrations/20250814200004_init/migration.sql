-- CreateEnum
CREATE TYPE "public"."OnboardingStatus" AS ENUM ('profile', 'course', 'content', 'price', 'completed');

-- CreateEnum
CREATE TYPE "public"."MediaKind" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "public"."SubscriberStatus" AS ENUM ('LEAD', 'PAID', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."PaymentProvider" AS ENUM ('RAZORPAY', 'STRIPE', 'CASHFREE', 'PAYTM', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('UPI', 'CARD', 'NETBANKING', 'WALLET', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "username" VARCHAR(32),
    "fullName" TEXT,
    "handle" TEXT,
    "bio" TEXT,
    "onboardingStatus" "public"."OnboardingStatus" NOT NULL DEFAULT 'profile',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Authenticator" (
    "credentialID" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,

    CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId","credentialID")
);

-- CreateTable
CREATE TABLE "public"."OnboardingProgress" (
    "userId" TEXT NOT NULL,
    "profileDone" BOOLEAN NOT NULL DEFAULT false,
    "courseDone" BOOLEAN NOT NULL DEFAULT false,
    "contentDone" BOOLEAN NOT NULL DEFAULT false,
    "priceDone" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OnboardingProgress_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."Waitlist" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "courseBio" TEXT,
    "about" TEXT,
    "slug" TEXT,
    "thumbnailUrl" TEXT,
    "bannerVideoUrl" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "priceAmount" INTEGER,
    "launchDate" TIMESTAMP(3),
    "buttonLabel" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WaitlistMedia" (
    "id" TEXT NOT NULL,
    "waitlistId" TEXT NOT NULL,
    "kind" "public"."MediaKind" NOT NULL,
    "url" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WaitlistMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WaitlistBenefit" (
    "id" TEXT NOT NULL,
    "waitlistId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WaitlistBenefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WaitlistSocial" (
    "waitlistId" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "youtubeUrl" TEXT,
    "instagramUrl" TEXT,
    "linkedinUrl" TEXT,
    "facebookUrl" TEXT,
    "xUrl" TEXT,

    CONSTRAINT "WaitlistSocial_pkey" PRIMARY KEY ("waitlistId")
);

-- CreateTable
CREATE TABLE "public"."WaitlistFaq" (
    "id" TEXT NOT NULL,
    "waitlistId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WaitlistFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subscriber" (
    "id" TEXT NOT NULL,
    "waitlistId" TEXT NOT NULL,
    "fullName" TEXT,
    "email" TEXT NOT NULL,
    "priceAmount" INTEGER,
    "currency" TEXT,
    "status" "public"."SubscriberStatus" NOT NULL DEFAULT 'LEAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "waitlistId" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "provider" "public"."PaymentProvider" NOT NULL,
    "method" "public"."PaymentMethod",
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "externalId" TEXT,
    "orderId" TEXT,
    "receipt" TEXT,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "capturedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_handle_key" ON "public"."User"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON "public"."Authenticator"("credentialID");

-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_slug_key" ON "public"."Waitlist"("slug");

-- CreateIndex
CREATE INDEX "Waitlist_ownerId_idx" ON "public"."Waitlist"("ownerId");

-- CreateIndex
CREATE INDEX "WaitlistMedia_waitlistId_kind_idx" ON "public"."WaitlistMedia"("waitlistId", "kind");

-- CreateIndex
CREATE INDEX "WaitlistBenefit_waitlistId_idx" ON "public"."WaitlistBenefit"("waitlistId");

-- CreateIndex
CREATE INDEX "WaitlistFaq_waitlistId_idx" ON "public"."WaitlistFaq"("waitlistId");

-- CreateIndex
CREATE INDEX "Subscriber_waitlistId_status_idx" ON "public"."Subscriber"("waitlistId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_waitlistId_email_key" ON "public"."Subscriber"("waitlistId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_subscriberId_key" ON "public"."Payment"("subscriberId");

-- CreateIndex
CREATE INDEX "Payment_waitlistId_status_idx" ON "public"."Payment"("waitlistId", "status");

-- CreateIndex
CREATE INDEX "Payment_provider_externalId_idx" ON "public"."Payment"("provider", "externalId");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Authenticator" ADD CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnboardingProgress" ADD CONSTRAINT "OnboardingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Waitlist" ADD CONSTRAINT "Waitlist_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WaitlistMedia" ADD CONSTRAINT "WaitlistMedia_waitlistId_fkey" FOREIGN KEY ("waitlistId") REFERENCES "public"."Waitlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WaitlistBenefit" ADD CONSTRAINT "WaitlistBenefit_waitlistId_fkey" FOREIGN KEY ("waitlistId") REFERENCES "public"."Waitlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WaitlistSocial" ADD CONSTRAINT "WaitlistSocial_waitlistId_fkey" FOREIGN KEY ("waitlistId") REFERENCES "public"."Waitlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WaitlistFaq" ADD CONSTRAINT "WaitlistFaq_waitlistId_fkey" FOREIGN KEY ("waitlistId") REFERENCES "public"."Waitlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscriber" ADD CONSTRAINT "Subscriber_waitlistId_fkey" FOREIGN KEY ("waitlistId") REFERENCES "public"."Waitlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "public"."Subscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_waitlistId_fkey" FOREIGN KEY ("waitlistId") REFERENCES "public"."Waitlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
