ALTER TABLE pitch_decks ADD COLUMN IF NOT EXISTS investor_type TEXT;
ALTER TABLE pitch_decks ADD COLUMN IF NOT EXISTS funding_amount TEXT;
ALTER TABLE pitch_decks ADD COLUMN IF NOT EXISTS current_stage TEXT;
ALTER TABLE pitch_decks ADD COLUMN IF NOT EXISTS traction TEXT;
