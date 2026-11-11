-- Raise the securing amount from 2x rent to 3x rent for every home.
-- Cheapest home (rent 745) secures at 2235, most expensive (rent 1700)
-- secures at 5100. Rents and inspection fees are untouched.
UPDATE properties SET securing = rent * 3;
