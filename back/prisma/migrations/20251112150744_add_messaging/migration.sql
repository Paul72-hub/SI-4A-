-- CreateEnum
CREATE TYPE "conversation_type" AS ENUM ('GENERAL', 'COURS', 'ALERT');

-- CreateTable
CREATE TABLE "conversation" (
    "conversation_id" SERIAL NOT NULL,
    "sujet" VARCHAR(160) NOT NULL,
    "type" "conversation_type" NOT NULL DEFAULT 'GENERAL',
    "cours_id" INTEGER,
    "created_by" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("conversation_id")
);

-- CreateTable
CREATE TABLE "message" (
    "message_id" SERIAL NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "auteur_id" INTEGER,
    "contenu" TEXT NOT NULL,
    "piece_jointe_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "message_pkey" PRIMARY KEY ("message_id")
);

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "cours"("cours_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("conversation_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_auteur_id_fkey" FOREIGN KEY ("auteur_id") REFERENCES "app_user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
