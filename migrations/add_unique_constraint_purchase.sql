-- ============================================
-- MIGRATION SEGURA: Adicionar UNIQUE constraint para idempotência
-- Tabela: tracking_sqd_cas_lp1_vsl_hackermillon_purchase
-- ============================================
-- 
-- ETAPAS:
-- 1) Criar provider NULL (sem DEFAULT)
-- 2) Backfill provider='perfectpay' usando critérios do raw_data e flow_token
-- 3) Backfill restante provider='flow'
-- 4) Verificar duplicatas antes de criar constraint
-- 5) ALTER provider SET NOT NULL
-- 6) Criar UNIQUE(provider, flow_order_id) e índice
-- ============================================

-- ============================================
-- ETAPA 1: Criar coluna provider inicialmente NULL (sem DEFAULT)
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracking_sqd_cas_lp1_vsl_hackermillon_purchase' 
    AND column_name = 'provider'
  ) THEN
    ALTER TABLE tracking_sqd_cas_lp1_vsl_hackermillon_purchase 
    ADD COLUMN provider VARCHAR(20) NULL; -- NULL inicialmente, sem DEFAULT
    
    RAISE NOTICE '✅ ETAPA 1: Coluna provider criada (NULL)';
  ELSE
    RAISE NOTICE '⚠️ ETAPA 1: Coluna provider já existe';
  END IF;
END $$;

-- ============================================
-- ETAPA 2: Backfill provider='perfectpay' usando critérios do raw_data e flow_token
-- ============================================
-- Identifica Perfect Pay por:
-- - raw_data contém campos específicos do Perfect Pay (sale_code, sale_status_enum_key, etc.)
-- - flow_token é NULL ou vazio (Perfect Pay não usa flow_token)
-- - flow_order_id começa com 'perfect_' ou contém código do Perfect Pay
-- IMPORTANTE: Corrige mesmo se provider já estiver setado como 'flow' indevidamente
UPDATE tracking_sqd_cas_lp1_vsl_hackermillon_purchase 
SET provider = 'perfectpay'
WHERE (provider IS NULL OR provider = 'flow')
  AND (
    -- Critério 1: raw_data contém campos do Perfect Pay
    (
      raw_data IS NOT NULL 
      AND (
        raw_data::text LIKE '%sale_code%' 
        OR raw_data::text LIKE '%sale_status_enum_key%'
        OR raw_data::text LIKE '%sale_amount%'
        OR raw_data::text LIKE '%customer%'
      )
    )
    OR
    -- Critério 2: flow_token é NULL/vazio E flow_order_id não começa com 'order_'
    (
      (flow_token IS NULL OR flow_token = '')
      AND flow_order_id IS NOT NULL
      AND flow_order_id NOT LIKE 'order_%'
    )
    OR
    -- Critério 3: flow_order_id começa com 'perfect_'
    (
      flow_order_id LIKE 'perfect_%'
    )
  );

DO $$
DECLARE
  perfectpay_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO perfectpay_count
  FROM tracking_sqd_cas_lp1_vsl_hackermillon_purchase
  WHERE provider = 'perfectpay';
  
  RAISE NOTICE '✅ ETAPA 2: Backfill Perfect Pay concluído - % registros marcados como perfectpay', perfectpay_count;
END $$;

-- ============================================
-- ETAPA 3: Backfill restante provider='flow'
-- ============================================
UPDATE tracking_sqd_cas_lp1_vsl_hackermillon_purchase 
SET provider = 'flow'
WHERE provider IS NULL;

DO $$
DECLARE
  flow_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO flow_count
  FROM tracking_sqd_cas_lp1_vsl_hackermillon_purchase
  WHERE provider = 'flow';
  
  RAISE NOTICE '✅ ETAPA 3: Backfill Flow concluído - % registros marcados como flow', flow_count;
END $$;

-- ============================================
-- ETAPA 4: Verificar duplicatas antes de criar constraint
-- ============================================
-- Se houver duplicatas, a constraint falhará
-- Esta query deve retornar 0 rows para prosseguir
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT 
      provider,
      flow_order_id,
      COUNT(*) as count
    FROM tracking_sqd_cas_lp1_vsl_hackermillon_purchase
    WHERE provider IS NOT NULL
      AND flow_order_id IS NOT NULL
    GROUP BY provider, flow_order_id
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    RAISE EXCEPTION '❌ ETAPA 4 FALHOU: Há % duplicatas na tabela. Resolva antes de criar constraint. Execute: SELECT provider, flow_order_id, COUNT(*) FROM tracking_sqd_cas_lp1_vsl_hackermillon_purchase WHERE provider IS NOT NULL AND flow_order_id IS NOT NULL GROUP BY provider, flow_order_id HAVING COUNT(*) > 1;', duplicate_count;
  ELSE
    RAISE NOTICE '✅ ETAPA 4: Nenhuma duplicata encontrada - pode prosseguir';
  END IF;
END $$;

-- ============================================
-- ETAPA 5: Tornar provider NOT NULL após backfill
-- ============================================
DO $$
BEGIN
  -- Verifica se há registros NULL antes de tornar NOT NULL
  IF EXISTS (
    SELECT 1 FROM tracking_sqd_cas_lp1_vsl_hackermillon_purchase 
    WHERE provider IS NULL
  ) THEN
    RAISE EXCEPTION '❌ ETAPA 5 FALHOU: Ainda há registros com provider NULL. Verifique o backfill.';
  ELSE
    ALTER TABLE tracking_sqd_cas_lp1_vsl_hackermillon_purchase 
    ALTER COLUMN provider SET NOT NULL;
    
    RAISE NOTICE '✅ ETAPA 5: Coluna provider definida como NOT NULL';
  END IF;
END $$;

-- ============================================
-- ETAPA 6: Criar UNIQUE constraint e índice
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_provider_flow_order_id'
  ) THEN
    ALTER TABLE tracking_sqd_cas_lp1_vsl_hackermillon_purchase
    ADD CONSTRAINT unique_provider_flow_order_id 
    UNIQUE (provider, flow_order_id);
    
    RAISE NOTICE '✅ ETAPA 6: Constraint UNIQUE(provider, flow_order_id) criada com sucesso';
  ELSE
    RAISE NOTICE '⚠️ ETAPA 6: Constraint unique_provider_flow_order_id já existe';
  END IF;
END $$;

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_provider_flow_order_id 
ON tracking_sqd_cas_lp1_vsl_hackermillon_purchase(provider, flow_order_id);

RAISE NOTICE '✅ Índice idx_provider_flow_order_id criado';

-- ============================================
-- VERIFICAÇÃO FINAL: Constraint criada
-- ============================================
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'tracking_sqd_cas_lp1_vsl_hackermillon_purchase'::regclass
AND conname = 'unique_provider_flow_order_id';

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- constraint_name: unique_provider_flow_order_id
-- constraint_type: u (unique)
-- constraint_definition: UNIQUE (provider, flow_order_id)
-- ============================================
