-- Revert coin IDs for coins without contract_address
-- Change from 'chain:address' back to 'chain:ticker:address'
UPDATE coins 
SET id = chain || ':' || ticker || ':' || address
WHERE contract_address IS NULL OR contract_address = ''; 