-- ============================================================================
-- COMPLETE MULTI-TENANT MIGRATION
-- Run this entire file in your Neon SQL Editor (on your database branch)
-- ============================================================================
--
-- This migration will:
-- 1. Create organizations table
-- 2. Update users table with organization foreign key
-- 3. Create article_classifications table
-- 4. Insert Biclou Prestige organization
-- 5. Link existing users to Biclou
-- 6. Migrate existing article classifications
-- 7. Clean up old columns from articles table
-- 8. Verify the migration
--
-- WARNING: Make sure you're running this on your DATABASE BRANCH, not production!
-- ============================================================================

-- ============================================================================
-- STEP 1: Create organizations table
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  company_context TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);
CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations(is_active);

COMMENT ON TABLE organizations IS 'Stores company/organization information for multi-tenant dashboard';
COMMENT ON COLUMN organizations.company_context IS 'The business context used for article classification (replaces company_case.txt file)';

-- ============================================================================
-- STEP 2: Update users table
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'organization'
  ) THEN
    ALTER TABLE users RENAME COLUMN organization TO organization_legacy;
  END IF;
END $$;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);

COMMENT ON COLUMN users.organization_id IS 'Foreign key linking user to their organization/company';

-- ============================================================================
-- STEP 3: Create article_classifications table
-- ============================================================================
CREATE TABLE IF NOT EXISTS article_classifications (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  classification VARCHAR(50),
  explanation TEXT,
  advice TEXT,
  reasoning TEXT,
  status VARCHAR(50) DEFAULT 'PENDING',
  starred BOOLEAN DEFAULT FALSE,

  classification_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_article_org UNIQUE(article_id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_article_classifications_article_id ON article_classifications(article_id);
CREATE INDEX IF NOT EXISTS idx_article_classifications_organization_id ON article_classifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_article_classifications_status ON article_classifications(status);
CREATE INDEX IF NOT EXISTS idx_article_classifications_classification ON article_classifications(classification);
CREATE INDEX IF NOT EXISTS idx_article_classifications_starred ON article_classifications(starred);
CREATE INDEX IF NOT EXISTS idx_article_classifications_date ON article_classifications(classification_date);

COMMENT ON TABLE article_classifications IS 'Stores article classifications per organization (multi-tenant support)';

-- ============================================================================
-- STEP 4: Insert Biclou Prestige organization with company context
-- ============================================================================
INSERT INTO organizations (name, company_context, is_active)
VALUES (
  'Biclou Prestige',
  'Case Biclou Prestige
Biclou Prestige SARL, or Biclou for short, is a road bike manufacturer founded in 1960 in France by Louis Levieux. Over the years, Biclou has become a well-known brand, supplying bikes at the forefront of professional cycling. For more than fifty years, the company was run by the Levieux family. However, in 2012, it underwent a management buyout led by Véronique Vitessier. With a focus on increasing market share, Vitessier aimed to preserve Biclou''s innovative spirit while expanding its range with more affordable models to boost sales and attract a broader audience.

Overall, Vitessier''s vision for Biclou turned out to be a success. It now sells road bikes to a range of consumers, from elite cyclists to amateur enthusiasts. During the COVID-19 pandemic, the company experienced a surge in demand, particularly in Western Europe, as more consumers took up cycling—both for its health benefits and as a way to make use of newfound flexibility from remote work. However, already in 2023, demand in Western Europe started plateauing and is now returning to pre-COVID-19 levels. In addition, in Southern and Eastern Europe, Biclou has struggled to gain traction, where lower-cost alternatives dominate. Expanding into these regions is a key priority, aligning with Vitessier''s strategy to grow market share.

To reach consumers, Biclou relies on a network of retailers. Retailers stock a range of models, from the entry-level Pétard Mouillé to the mid-range Chasse Patate to the high-performance Échappée Royale series, catering to cyclists of all levels. Beyond amateur riders, Biclou has also cemented its reputation in professional cycling through its sponsorship of Cofidis, a UCI WorldTour team known for its relentless breakaway attempts, particularly in French races. As the team''s official bike sponsor since 1980, Biclou provides cutting-edge racing bikes designed in close collaboration with Cofidis riders and technical staff. Vitessier considers this partnership a cornerstone of Biclou''s brand, reinforcing its identity as a high-performance innovator while showcasing its engineering on the sport''s biggest stages. With the sponsorship contract running until 2026, Biclou remains committed to refining its bikes to meet the evolving demands of professional racing, hoping to secure an extension and maintain its presence in the peloton for years to come.

Biclou''s demand is split between two main groups: Cofidis and consumer sales. While Cofidis accounts for only a small portion of total production output, its orders receive priority handling, with deliveries required within 72 hours. Demand from Cofidis remains relatively stable throughout the year, with predictable peaks before the Giro d''Italia, Tour de France, and Vuelta a España, as well as during new model rollouts. Consumer demand, in contrast, is more volatile, following a seasonal pattern with peak sales in spring and early summer, tapering off in autumn and winter. To anticipate demand, Biclou relies on quantitative forecasting models that analyse historical sales trends, adjusted by manual input from the sales team. These adjustments reflect expected industry trends, large sports events, and insights from retailer conversations, ensuring forecasts align with anticipated market conditions. Once final demand predictions are set by the sales team, the operations team uses them to plan production schedules and procurement.

Biclou''s supply chain:
Biclou''s road bikes are assembled in France, but their production depends on a carefully selected network of suppliers. Road bike producers, like Biclou, rely on complex global supply chains for materials and components. Most modern road bikes use lightweight materials (e.g., carbon composites and aluminium alloys) for their frames and components sourced from specialized suppliers around the world. Many Tier-1 suppliers rely on Tier-2 and Tier-3 suppliers, meaning disruptions at any level can impact final production and assembly in France. Lead times are extremely long, with some components needing to be ordered many months in advance to ensure availability. The cycling industry is heavily clustered in East Asia where many parts are manufactured. Taiwan is the premier hub of original equipment manufacturers – the city of Taichung and surrounding area host hundreds of bike industry factories. Taiwan alone has over 900 bicycle-related companies, employing more than 32,000 people.

Frame production:
Biclou''s entry-level Pétard Mouillé is built using aluminium alloy frames sourced from Niuaero in China. Biclou''s mid-range Chasse Patate and high-performance Échappée Royale rely on advanced carbon fibre frames. These are sourced from two of the largest Original Equipment Manufacturers (OEMs) in the industry: Kenstone Metal and Giant Manufacturing, both located in Taiwan. Giant Manufacturing not only sells under their own brand but also produce frames on contract for many Western brands.

High-end frame factories source prepreg carbon fibre (carbon sheets pre-impregnated with resin) from Japanese firms like Toray, Toho Tenax, and Mitsubishi Rayon, which dominate the global carbon fibre market. Prepreg carbon sheets are precisely cut and layered into moulds based on Biclou''s specifications. The carbon layers are baked in autoclaves under high pressure to create a strong, lightweight structure. The cured frames undergo precision CNC machining, sanding, and drilling to prepare for assembly. Frames are weighed, impact-tested, and scanned for imperfections before shipment to France.

Component sourcing:
Biclou sources most components from Asia. Shimano has been a key supply partner of Biclou. Before 2020, it was Biclou''s only supplier of groupsets – consisting of the shifters, derailleurs, crankset, chain, cassette, and brakes. Shimano has had roughly 70% of the global market share in bike gears and brakes. It produces components across a network of factories in Japan, Singapore, Malaysia, and China, ensuring volume supply. During COVID-19 its production got severely disrupted, causing headaches for Biclou''s production planning. Since then, Biclou also sources some groupsets from SRAM (USA) and recently started discussions with Campagnolo (Italy).

Some other key supply partnerships include DT Swiss (Taiwan) and Mavic (France) for wheelsets, Schwalbe (Germany) and Maxxis (Taiwan) for tires, and Selle Royal (Italy) and Velo Enterprise (Taiwan) for saddles and handlebars. Biclou further sources numerous smaller components – headsets and bearings, braking rotors and pads for disc brake models, cables and housing and bar tape. Even these smaller items often trace back to a few sources worldwide. For example, most ball bearings in bikes come from manufacturers in Germany specializing in precision bearings.

Biclou''s production:
Once frames and components arrive in France, Biclou takes over the final steps of production at its facility. Biclou''s production team installs drivetrains, handlebars, wheelsets, and braking systems, transforming bare frames into fully functional bikes. Before shipping, every bike undergoes a comprehensive check, including gear shifting precision, brake performance and alignment, and frame integrity and weight verification. For consumer models, a random sample is pulled for full structural testing to ensure consistency. Unlike consumer bikes, Cofidis team frames arrive unpainted and receive their official team livery in France. Biclou''s facility applies custom paint jobs and sponsor decals. It also makes team-specific modifications (e.g., cockpit adjustments).

Biclou maintains a small-scale workshop where its engineering team tests new designs before production. This setup allows for material and aerodynamics prototyping, validating new frame geometries, and component fit testing to ensure compatibility between different supplier parts. It also supports pre-production evaluations, allowing Biclou to refine designs before committing to large-scale manufacturing runs in East Asia. By keeping engineering, testing, and quality control in-house, Biclou ensures its bikes meet the highest performance standards while benefiting from the specialized manufacturing expertise of its suppliers.

Organizational structure:
Biclou''s executive board is tightly involved in both strategic direction and day-to-day operations. Véronique Vitessier serves as CEO and largest shareholder, supported by a Chief Commercial Officer (CCO), Chief Operations Officer (COO), and Chief Financial Officer (CFO)—all of whom also hold shares following the management buyout. The COO is responsible for production and supply chain operations, overseeing Biclou''s 400-person production team, a 6-person procurement team handling global supplier coordination, and a logistics and inventory unit ensuring material flows align with assembly schedules. The CCO leads a 25-person sales and marketing team, managing retailer partnerships, customer service, and brand positioning, while also overseeing the 20-person R&D team, which focuses on product development. The CFO manages financial strategy, budgeting, and cost control, leading a 25-person finance team, while also overseeing a 5-person sustainability unit focused on sustainability initiatives and regulatory compliance. Corporate support functions, including HR, legal, and IT, report directly to the CEO.

Biclou''s relationship with Cofidis is managed across multiple teams and roles. The CCO oversees sponsorship agreements, ensuring the partnership strengthens Biclou''s brand and aligns with its marketing strategy. The R&D team works closely with Cofidis riders and mechanics, incorporating race feedback into future product innovation. The COO ensures that team bikes are delivered on schedule, coordinating with production to meet professional-level specifications.

The executive board meets formally on a biweekly basis, with additional strategy sessions scheduled around major developments, such as new product launches. These meetings serve as a checkpoint to align production schedules with sales forecasts, evaluate financial performance, and discuss ongoing R&D efforts. In practice, however, the lines between functions are often blurred – issues that arise in production quickly affect sales, and financial constraints shape operational decisions.

Board meeting themes:
Recent board meetings have been dominated by concerns over potential supply chain disruptions, inefficient production, sustainability, and the Cofidis contract. During the COVID-era, port shutdowns, factory closures and shipping delays slowed the flow of carbon fiber frames and components. Shortly after, the Suez Canal blockage caused further disruptions, leaving shipments of tires and wheelsets stranded for weeks. More recently, Houthi rebel attacks on container ships in the Red Sea have forced rerouted shipping around the Cape of Good Hope, increasing both transit times and costs for shipments.',
  true
)
ON CONFLICT (name) DO UPDATE
SET company_context = EXCLUDED.company_context;

-- ============================================================================
-- STEP 5: Link all existing users to Biclou Prestige organization
-- ============================================================================
UPDATE users
SET organization_id = (SELECT id FROM organizations WHERE name = 'Biclou Prestige')
WHERE organization_id IS NULL;

-- ============================================================================
-- STEP 6: Migrate existing article classifications
-- ============================================================================
INSERT INTO article_classifications (
  article_id,
  organization_id,
  classification,
  explanation,
  advice,
  reasoning,
  status,
  starred,
  classification_date,
  created_at
)
SELECT
  id,
  (SELECT id FROM organizations WHERE name = 'Biclou Prestige'),
  classification,
  explanation,
  advice,
  reasoning,
  status,
  starred,
  classification_date,
  NOW()
FROM articles
WHERE classification IS NOT NULL
ON CONFLICT (article_id, organization_id) DO NOTHING;

-- ============================================================================
-- STEP 7: Clean up articles table (remove old classification columns)
-- ============================================================================
ALTER TABLE articles
DROP COLUMN IF EXISTS classification,
DROP COLUMN IF EXISTS explanation,
DROP COLUMN IF EXISTS advice,
DROP COLUMN IF EXISTS reasoning,
DROP COLUMN IF EXISTS starred,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS classification_date;

COMMENT ON TABLE articles IS 'Stores raw articles from RSS feeds (organization-agnostic)';

-- ============================================================================
-- STEP 8: Verify the migration
-- ============================================================================
SELECT
  'Organizations' as table_name,
  COUNT(*) as row_count
FROM organizations
UNION ALL
SELECT
  'Users with organization',
  COUNT(*)
FROM users
WHERE organization_id IS NOT NULL
UNION ALL
SELECT
  'Article Classifications',
  COUNT(*)
FROM article_classifications
UNION ALL
SELECT
  'Articles (should match classifications)',
  COUNT(*)
FROM articles;

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Update Python classification scripts (LLM.py, etc.)
-- 2. Update dashboard API routes to filter by organization
-- 3. Update auth to include organization_id in session
-- ============================================================================
