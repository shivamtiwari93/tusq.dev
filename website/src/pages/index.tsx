import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const workflow = [
  'Run tusq init in a supported repo.',
  'Scan routes with tusq scan .',
  'Review the generated tusq.manifest.json.',
  'Approve capabilities in the manifest, then compile.',
  'Serve compiled tools over a local describe-only MCP endpoint and inspect schema, examples, and constraints.',
];

const surfaceItems = [
  'Express, Fastify, NestJS',
  'Reviewable manifest',
  'Manual approval flow',
  'Approved tool JSON',
  'Route provenance',
  'Auth hints',
  'Side-effect class',
  'Sensitivity marker',
  'Redaction policy',
  'Examples and constraints',
  'Describe-only MCP',
  'Repo-local trial path',
];

const postV010Items = [
  {
    title: 'Execution mode with policy gates',
    detail:
      'Add an opt-in execution path for approved tools with explicit policy controls and audit traces.',
  },
  {
    title: 'Broader framework adapters',
    detail:
      'Expand route and schema extraction beyond Express, Fastify, and NestJS while preserving manifest review quality.',
  },
  {
    title: 'Approval ergonomics',
    detail:
      'Reduce manual manifest editing with stronger review UX while keeping explicit human approval in the loop.',
  },
];

export default function Home(): ReactNode {
  return (
    <Layout
      title="tusq.dev"
      description="Open-source capability compiler CLI for turning supported Node.js APIs into reviewed manifests, approved tool definitions, and a describe-only MCP surface.">
      <main className={styles.pageShell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>For existing Node.js SaaS teams</p>
          <h1 className={styles.heroTitle}>
            Expose supported Node.js product behavior to AI systems without skipping review.
          </h1>
          <p className={styles.lede}>
            tusq.dev v0.1.0 gives Express, Fastify, and NestJS teams a reviewed path from
            supported product code to a local describe-only MCP surface.
          </p>
          <p className={styles.launchNote}>
            Proof path: scan a supported repo, inspect <code>tusq.manifest.json</code>, approve
            what should be exposed, compile approved tool JSON, then inspect the local
            describe-only MCP output. The review chain keeps provenance,{' '}
            <code>side_effect_class</code>, <code>sensitivity_class</code>, <code>auth_hints</code>
            , optional approval trail, <code>redaction</code>, and downstream{' '}
            <code>examples</code> / <code>constraints</code> visible before exposure.
          </p>
          <p className={styles.launchNote}>
            Best fit: teams with a real Express, Fastify, or NestJS service already in code. Not
            this launch: hosted execution, live MCP actions, or unsupported frameworks.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.buttonPrimary} to="/docs/getting-started">
              Try It Locally
            </Link>
            <Link className={styles.buttonGhost} to="/docs/roadmap">
              View Post-v0.1.0 Roadmap
            </Link>
            <Link className={styles.buttonGhost} to="/blog">
              Read Launch Posts
            </Link>
          </div>
        </section>

        <section className={styles.gridBand}>
          <article className={styles.card}>
            <h2>Who it is for</h2>
            <p>
              Existing SaaS teams already shipping product logic on Express, Fastify, or NestJS and
              needing a reviewed way to make that logic AI-visible.
            </p>
          </article>
          <article className={styles.card}>
            <h2>What you can verify</h2>
            <p>
              In one session you can go from supported repo to reviewable manifest, approved tool
              JSON, and a local describe-only MCP surface with inspectable metadata and usage
              context.
            </p>
          </article>
          <article className={styles.card}>
            <h2>Where V1 stops</h2>
            <p>
              V1 does not execute live product actions. It returns schemas, examples, constraints,
              and redaction guidance for inspection, not hosted execution.
            </p>
          </article>
        </section>

        <section className={styles.split}>
          <div>
            <p className={styles.eyebrow}>Workflow</p>
            <h2>Codebase in. Capability surface out.</h2>
          </div>
          <ol className={styles.steps}>
            {workflow.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className={styles.surface}>
          <p className={styles.eyebrow}>Current V1 surface</p>
          <h2>What ships in v0.1.0.</h2>
          <div className={styles.surfaceGrid}>
            {surfaceItems.map((item) => (
              <div className={styles.surfaceItem} key={item}>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.gridBand}>
          <article className={styles.card}>
            <h2>Post-v0.1.0 improvements</h2>
            <p>These are roadmap targets, not currently shipped behavior.</p>
          </article>
          {postV010Items.map((item) => (
            <article className={styles.card} key={item.title}>
              <h2>{item.title}</h2>
              <p>{item.detail}</p>
            </article>
          ))}
        </section>
      </main>
    </Layout>
  );
}
