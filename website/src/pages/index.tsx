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
  'Express support',
  'Fastify support',
  'NestJS support',
  'Route discovery',
  'Manifest generation',
  'Visible governance metadata',
  'Approval trail support',
  'Reviewable redaction policy',
  'Examples and constraints',
  'Manual approval flow',
  'Approved tool compilation',
  'Describe-only MCP serve',
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
          <p className={styles.eyebrow}>Open-source CLI</p>
          <h1 className={styles.heroTitle}>
            Turn a supported Node.js SaaS backend into a reviewed, inspectable capability surface.
          </h1>
          <p className={styles.lede}>
            tusq.dev v0.1.0 scans Express, Fastify, and NestJS codebases, generates a reviewable{' '}
            <code>tusq.manifest.json</code>, compiles approved capabilities into strict JSON tool
            definitions, and serves them through a local describe-only MCP endpoint that clients
            can inspect. The review chain keeps provenance, <code>side_effect_class</code>,{' '}
            <code>sensitivity_class</code>, <code>auth_hints</code>, optional approval trail, and{' '}
            <code>redaction</code> visible before exposure, while describe-only{' '}
            <code>examples</code> and <code>constraints</code> stay inspectable at runtime.
          </p>
          <p className={styles.launchNote}>
            Try it locally from the repo on a supported codebase. Current launch flow: clone the
            repo, install locally, run <code>tusq scan</code>, review the manifest, approve what
            you want exposed, then compile and serve. Best fit: teams with a real Express,
            Fastify, or NestJS service, not teams expecting hosted execution or live MCP actions.
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
            <h2>What it does</h2>
            <p>
              It discovers supported API routes and inferred auth hints from code, then converts
              that output into a capability manifest your team can inspect before exposing anything.
              Reviewers get concrete metadata, not just a generic governance claim: approval state,
              optional approval trail, provenance, classification fields, redaction policy, plus
              explicit downstream usage context.
            </p>
          </article>
          <article className={styles.card}>
            <h2>What it ships</h2>
            <p>
              From the manifest, tusq.dev compiles approved capabilities into JSON tool definitions
              and serves them through a local describe-only MCP surface. V1 returns schemas,
              example payloads, constraints, and redaction guidance for inspection, not live
              execution.
            </p>
          </article>
          <article className={styles.card}>
            <h2>Why it matters</h2>
            <p>
              Incumbent SaaS companies should not lose to AI-native competitors just because their
              product logic is trapped behind old interfaces.
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
