// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

-- DEFINE TABLE IF NOT EXISTS block SCHEMAFULL;

-- DEFINE FIELD text ON TABLE block TYPE string;

---

-- DEFINE TABLE IF NOT EXISTS dimension SCHEMAFULL;

-- DEFINE FIELD vector ON TABLE dimension TYPE string;

--

-- DEFINE TABLE IF NOT EXISTS link SCHEMAFULL; -- seems like it's not needed

-- DEFINE FIELD in ON TABLE link TYPE record<block>;
-- DEFINE FIELD out ON TABLE link TYPE record<block>;
-- DEFINE FIELD dimension ON TABLE link TYPE record<dimension>;
-- DEFINE FIELD sign ON TABLE link TYPE number; -- has to be -1 or 1

--

-- DEFINE EVENT coordinates_update ON TABLE link
-- WHEN ($before.dimension IS NOT $after.dimension OR $before.sign IS NOT $after.sign)
-- THEN {
--     -- improve here
--     -- prendo tutti i blocchi e i link da cui .out dipende
--     -- e calcolo la posizione finale
--     let $block_in = (SELECT * FROM ONLY $after.in);
--     let $d_new = $block_in[$after.dimension] + 1 * $after.sign
--     -- let $i_new = $block_in.i + $after.i;
--     -- let $j_new = $block_in.j + $after.j;

--     UPDATE $after.out SET i = $i_new, j = $j_new;
-- };