-- Update coin IDs for coins without contract_address
-- Change from 'chain:ticker:address' to 'chain:address'
UPDATE coins 
SET id = chain || ':' || address
WHERE contract_address IS NULL OR contract_address = ''; 