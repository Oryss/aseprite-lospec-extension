CREATE TABLE palettes
(
    internal_id         SERIAL PRIMARY KEY,
    internal_created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    internal_updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    id                  VARCHAR(255) NOT NULL UNIQUE,
    tags                TEXT[],
    colors              TEXT[],
    downloads           INTEGER,
    hidden              BOOLEAN,
    featured            BOOLEAN,
    is_new              BOOLEAN,
    likes               INTEGER,
    comments            INTEGER,
    approval            VARCHAR(255),
    title               VARCHAR(255),
    hashtag             VARCHAR(255),
    description         TEXT,
    creator             BOOLEAN,
    slug                VARCHAR(255),
    published_at        TIMESTAMP,
    user_name           VARCHAR(255),
    user_slug           VARCHAR(255),
    number_of_colors    INTEGER,
    created_at          TIMESTAMP,
    updated_at          TIMESTAMP,
    v                   INTEGER,
    colors_array        TEXT[],
    min_width           FLOAT,
    height              FLOAT,
    thumbnail_width     FLOAT
);

CREATE OR REPLACE FUNCTION palettes_insert_trigger()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.internal_created_at = NOW();
    NEW.internal_updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION palettes_update_trigger()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.internal_updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_created_at_on_insert
    BEFORE INSERT
    ON palettes
    FOR EACH ROW
EXECUTE PROCEDURE palettes_insert_trigger();

CREATE TRIGGER set_created_at_on_update
    BEFORE UPDATE
    ON palettes
    FOR EACH ROW
EXECUTE PROCEDURE palettes_insert_trigger();
