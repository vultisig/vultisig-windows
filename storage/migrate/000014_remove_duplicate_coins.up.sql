DELETE FROM Coins
WHERE
    id IN (
        SELECT
            c1.id
        FROM
            Coins c1
            JOIN Coins c2 ON c1.chain = c2.chain
            AND c1.address = c2.address
            AND c1.public_key_ecdsa = c2.public_key_ecdsa
            AND LOWER(c1.contract_address) = LOWER(c2.contract_address)
            AND c1.id != c2.id
            AND (
                (
                    c1.contract_address != LOWER(c1.contract_address)
                    AND c2.contract_address = LOWER(c2.contract_address)
                )
                OR (
                    (
                        (
                            c1.contract_address = LOWER(c1.contract_address)
                            AND c2.contract_address = LOWER(c2.contract_address)
                        )
                        OR (
                            c1.contract_address != LOWER(c1.contract_address)
                            AND c2.contract_address != LOWER(c2.contract_address)
                        )
                    )
                    AND c1.id > c2.id
                )
            )
    );
