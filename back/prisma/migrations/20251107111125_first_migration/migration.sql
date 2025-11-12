-- CreateEnum
CREATE TYPE "cheval_status" AS ENUM ('AVAILABLE', 'REST', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "cheval_sexe" AS ENUM ('HONGRE', 'JUMENT', 'ETALON');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('CAVALIER', 'MONITEUR', 'DIRECTEUR');

-- CreateEnum
CREATE TYPE "cours_status" AS ENUM ('PLANNED', 'CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "cheval" (
    "cheval_id" SERIAL NOT NULL,
    "nom" VARCHAR(80) NOT NULL,
    "sexe" "cheval_sexe" NOT NULL,
    "race" VARCHAR(80),
    "numero_sire" VARCHAR(20),
    "date_naissance" DATE,
    "taille_cm" SMALLINT,
    "poids_kg" SMALLINT,
    "robe" VARCHAR(80),
    "image_url" TEXT,
    "statut" "cheval_status" NOT NULL DEFAULT 'AVAILABLE',
    "commentaires" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cheval_pkey" PRIMARY KEY ("cheval_id")
);

-- CreateTable
CREATE TABLE "app_user" (
    "user_id" SERIAL NOT NULL,
    "prenom" VARCHAR(60) NOT NULL,
    "nom" VARCHAR(60) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "mot_de_passe_hash" TEXT NOT NULL,
    "telephone" VARCHAR(30),
    "role" "user_role" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "cours" (
    "cours_id" SERIAL NOT NULL,
    "titre" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "debut" TIMESTAMPTZ(6) NOT NULL,
    "fin" TIMESTAMPTZ(6) NOT NULL,
    "cheval_id" INTEGER,
    "cavalier_id" INTEGER,
    "moniteur_id" INTEGER,
    "statut" "cours_status" NOT NULL DEFAULT 'PLANNED',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cours_pkey" PRIMARY KEY ("cours_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cheval_numero_sire_key" ON "cheval"("numero_sire");

-- CreateIndex
CREATE UNIQUE INDEX "app_user_email_key" ON "app_user"("email");

-- AddForeignKey
ALTER TABLE "cours" ADD CONSTRAINT "cours_cavalier_id_fkey" FOREIGN KEY ("cavalier_id") REFERENCES "app_user"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cours" ADD CONSTRAINT "cours_cheval_id_fkey" FOREIGN KEY ("cheval_id") REFERENCES "cheval"("cheval_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cours" ADD CONSTRAINT "cours_moniteur_id_fkey" FOREIGN KEY ("moniteur_id") REFERENCES "app_user"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;
