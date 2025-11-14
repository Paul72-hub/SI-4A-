CREATE TABLE "conversation_participant" (
    "participant_id" SERIAL PRIMARY KEY,
    "conversation_id" INTEGER NOT NULL REFERENCES "conversation"("conversation_id") ON DELETE CASCADE,
    "user_id" INTEGER NOT NULL REFERENCES "app_user"("user_id") ON DELETE CASCADE,
    "added_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX "conversation_participant_unique"
ON "conversation_participant" ("conversation_id", "user_id");
