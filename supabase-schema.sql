-- organizations: (id, name, subscription_status).
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subscription_status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- clients: (id, org_id, name, org_nr, risk_profile, materiality_threshold).
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    org_nr TEXT NOT NULL,
    risk_profile JSONB DEFAULT '{}',
    materiality_threshold NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- audit_workpapers: (id, client_id, type [RISK, AML, ENTRY, MEMO], title, content_json, integrity_hash, created_by).
CREATE TABLE IF NOT EXISTS audit_workpapers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('RISK', 'AML', 'ENTRY', 'MEMO')),
    title TEXT NOT NULL,
    content_json JSONB DEFAULT '{}',
    integrity_hash TEXT,
    created_by UUID, -- REFERENCES auth.users(id) - assuming standard auth
    created_at TIMESTAMPTZ DEFAULT now()
);

-- audit_trails: (id, event_type, metadata, timestamp) - Immutability is key.
CREATE TABLE IF NOT EXISTS audit_trails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- Immutability for audit_trails
CREATE OR REPLACE FUNCTION protect_audit_trails()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit trails are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_trails_immutability ON audit_trails;
CREATE TRIGGER audit_trails_immutability
BEFORE UPDATE OR DELETE ON audit_trails
FOR EACH ROW EXECUTE FUNCTION protect_audit_trails();

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_workpapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trails ENABLE ROW LEVEL SECURITY;

-- Note: RLS Policies usually require 'profiles' or similar to link auth.uid() to org_id.
-- Basic organization-based policy (example):
-- CREATE POLICY org_access ON clients FOR ALL USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- Allow anonymous/authenticated inserts for the demo
CREATE POLICY "Allow public insert on audit_workpapers" 
ON audit_workpapers FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public select on audit_workpapers" 
ON audit_workpapers FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on audit_trails" 
ON audit_trails FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public select on audit_trails" 
ON audit_trails FOR SELECT 
USING (true);

-- Enable Real-time replication
-- Run these in Supabase SQL Editor:
-- alter publication supabase_realtime add table audit_workpapers;
-- alter publication supabase_realtime add table audit_trails;
