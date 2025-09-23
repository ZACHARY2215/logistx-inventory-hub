-- Add 'Other' category if it doesn't exist
INSERT INTO categories (name, description) 
VALUES ('Other', 'Miscellaneous items that don''t fit other categories')
ON CONFLICT (name) DO NOTHING;