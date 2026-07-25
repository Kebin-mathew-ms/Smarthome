ALTER TABLE companies ADD COLUMN cover_image VARCHAR(255) NULL AFTER logo;

ALTER TABLE company_settings ADD COLUMN about_us TEXT NULL AFTER company_status;
ALTER TABLE company_settings ADD COLUMN mission TEXT NULL AFTER about_us;
ALTER TABLE company_settings ADD COLUMN vision TEXT NULL AFTER mission;
ALTER TABLE company_settings ADD COLUMN emergency_service BOOLEAN NOT NULL DEFAULT FALSE AFTER vision;
ALTER TABLE company_settings ADD COLUMN website VARCHAR(255) NULL AFTER emergency_service;
ALTER TABLE company_settings ADD COLUMN google_maps_location TEXT NULL AFTER website;
ALTER TABLE company_settings ADD COLUMN social_media_json TEXT NULL AFTER google_maps_location;

