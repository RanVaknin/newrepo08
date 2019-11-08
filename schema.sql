DROP TABLE IF EXISTS location_table;

CREATE TABLE location_table (
    id SERIAL PRIMARY KEY,
    search_query TEXT,
    formatted_query TEXT,
    longitude FLOAT,
    latitude FLOAT
);