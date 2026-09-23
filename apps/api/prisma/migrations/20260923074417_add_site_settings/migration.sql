-- CreateEnum
CREATE TYPE "NameDisplayMode" AS ENUM ('FANTASY', 'REAL');

-- CreateTable
CREATE TABLE "site_settings" (
    "id" VARCHAR(20) NOT NULL DEFAULT 'main',
    "hero_title" VARCHAR(180) NOT NULL DEFAULT 'Diversão organizada, contas transparentes.',
    "hero_description" VARCHAR(500) NOT NULL DEFAULT 'Acompanhe as contribuições, despesas e o saldo do grupo de forma simples e segura.',
    "banner_url" VARCHAR(1000) NOT NULL DEFAULT '/banner.jpeg',
    "show_goal" BOOLEAN NOT NULL DEFAULT true,
    "name_display_mode" "NameDisplayMode" NOT NULL DEFAULT 'FANTASY',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);
