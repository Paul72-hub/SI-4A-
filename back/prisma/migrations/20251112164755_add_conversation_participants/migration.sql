-- DropForeignKey
ALTER TABLE "conversation_participant" DROP CONSTRAINT "conversation_participant_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "conversation_participant" DROP CONSTRAINT "conversation_participant_user_id_fkey";

-- AddForeignKey
ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("conversation_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
