import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const workflow = [
  'Run tusq init in a supported repo.',
  'Scan routes with tusq scan .',
  'Review the generated tusq.manifest.json.',
  'Approve capabilities in the manifest, then compile.',
  'Serve compiled tools over a local describe-only MCP endpoint.',
];

const surfaceItems = [
  'Express support',
  'Fastify support',
  'NestJS support',
  'Route discovery',
  'Manifest generation',
  'Manual approval flow',
  'Approved tool compilation',
  'Describe-only MCP serve',
];

export default function Home(): ReactNode {
  return (
    <Layout
      title="tusq.dev"
      description="Open-source capability compiler CLI for turning supported Node.js SaaS routes into reviewed manifests and describe-only MCP tools.">
      <main className={styles.pageShell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Open-source CLI</p>
          <h1 className={styles.heroTitle}>
            Turn a supported Node.js SaaS backend into a reviewed MCP-ready capability surface.
          </h1>
          <p className={styles.lede}>
            tusq.dev v0.1.0 scans Express, Fastify, and NestJS codebases, generates a reviewable{' '}
            <code>tusq.manifest.json</code>, compiles approved capabilities into strict JSON tool
            definitions, and serves them through a local describe-only MCP endpoint.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.buttonPrimary} to="/docs/getting-started">
              Open Docs
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
              It discovers supported API routes and auth hints from code, then converts that output
              into a capability manifest your team can inspect before exposing anything.
            </p>
          </article>
          <article className={styles.card}>
            <h2>What it ships</h2>
            <p>
              From the manifest, tusq.dev compiles approved capabilities into JSON tool definitions
              and serves them through a local MCP surface. V1 is describe-only, not live execution.
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
      </main>
    </Layout>
  );
}
