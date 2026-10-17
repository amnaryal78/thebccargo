-- The admin Inquiries tab offers "Contacted" and "Quoted"; the enum must accept them.
ALTER TYPE inquiry_status ADD VALUE IF NOT EXISTS 'contacted';
ALTER TYPE inquiry_status ADD VALUE IF NOT EXISTS 'quoted';
