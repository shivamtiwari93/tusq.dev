import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

export default function NotFoundPage(): ReactNode {
  return (
    <Layout title="Page Not Found" description="The requested page does not exist.">
      <main
        style={{
          width: 'min(920px, calc(100% - 32px))',
          margin: '32px auto 56px',
          padding: '34px',
          border: '1px solid rgba(30, 27, 24, 0.14)',
          borderRadius: '28px',
          background: 'rgba(255, 252, 245, 0.84)',
        }}>
        <p
          style={{
            margin: '0 0 10px',
            color: '#8f2d16',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontSize: '0.76rem',
            fontWeight: 700,
          }}>
          tusq.dev
        </p>
        <h1 style={{marginTop: 0, fontFamily: 'Fraunces, serif'}}>Page not found.</h1>
        <p style={{color: '#665a4a'}}>
          The route you requested does not exist on the tusq.dev docs site.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            marginTop: '8px',
            minHeight: '44px',
            alignItems: 'center',
            padding: '0 18px',
            borderRadius: '999px',
            border: '1px solid rgba(30, 27, 24, 0.14)',
            background: 'linear-gradient(135deg, #cb4f2d 0%, #8f2d16 100%)',
            color: '#fff7ef',
            textDecoration: 'none',
            fontWeight: 700,
          }}>
          Back to homepage
        </Link>
      </main>
    </Layout>
  );
}
