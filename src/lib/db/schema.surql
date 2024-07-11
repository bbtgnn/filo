DEFINE TABLE IF NOT EXISTS block SCHEMAFULL;

DEFINE FIELD text ON TABLE block TYPE string;
DEFINE FIELD i ON block TYPE int DEFAULT 0;
DEFINE FIELD j ON block TYPE int DEFAULT 0;

--

-- DEFINE TABLE IF NOT EXISTS link SCHEMAFULL; -- seems like it's not needed

DEFINE FIELD in ON TABLE link TYPE record<block>;
DEFINE FIELD out ON TABLE link TYPE record<block>;
DEFINE FIELD i ON TABLE link TYPE int;
DEFINE FIELD j ON TABLE link TYPE int;

--

DEFINE EVENT coordinates_update ON TABLE link
WHEN ($before.i IS NOT $after.i OR $before.j IS NOT $after.j)
THEN {
    -- improve here
    -- prendo tutti i blocchi e i link da cui .out dipende
    -- e calcolo la posizione finale
    let $block_in = (SELECT * FROM ONLY $after.in);
    let $i_new = $block_in.i + $after.i;
    let $j_new = $block_in.j + $after.j;

    UPDATE $after.out SET i = $i_new, j = $j_new;
};