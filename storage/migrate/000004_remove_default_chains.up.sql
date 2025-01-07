CREATE TABLE settings_new (
    language TEXT NOT NULL,
    currency TEXT NOT NULL
);

INSERT INTO settings_new (language, currency)
SELECT language, currency FROM settings;

DROP TABLE settings;
ALTER TABLE settings_new RENAME TO settings; 