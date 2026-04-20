import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';

const root = process.cwd();
const cli = path.join(root, 'bin', 'tusq.js');

function runCli(args, { cwd, expectedStatus = 0 } = {}) {
  const result = spawnSync('node', [cli, ...args], {
    cwd,
    encoding: 'utf8'
  });

  if (result.status !== expectedStatus) {
    const details = [
      `Command failed: node ${cli} ${args.join(' ')}`,
      `Expected status: ${expectedStatus}`,
      `Actual status: ${result.status}`,
      `STDOUT:\n${result.stdout}`,
      `STDERR:\n${result.stderr}`
    ].join('\n\n');
    throw new Error(details);
  }

  return result;
}

async function copyFixture(name, destination) {
  const source = path.join(root, 'tests', 'fixtures', name);
  await fs.cp(source, destination, { recursive: true });
}

async function readJson(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

function requestRpc(port, payload) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        method: 'POST',
        host: '127.0.0.1',
        port,
        path: '/',
        headers: {
          'content-type': 'application/json'
        }
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

async function waitForReady(proc, timeoutMs = 6000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (Date.now() - started > timeoutMs) {
        clearInterval(timer);
        reject(new Error('Timed out waiting for serve command to start'));
      }
    }, 100);

    proc.stdout.on('data', (chunk) => {
      if (String(chunk).includes('server listening')) {
        clearInterval(timer);
        resolve();
      }
    });

    proc.on('exit', (code) => {
      clearInterval(timer);
      reject(new Error(`serve exited early with code ${code}`));
    });
  });
}

async function run() {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'tusq-smoke-'));
  const expressProject = path.join(tmpRoot, 'express');
  const fastifyProject = path.join(tmpRoot, 'fastify');
  const nestProject = path.join(tmpRoot, 'nest');

  await copyFixture('express-sample', expressProject);
  await copyFixture('fastify-sample', fastifyProject);
  await copyFixture('nest-sample', nestProject);

  runCli(['help'], { cwd: root });
  runCli(['version'], { cwd: root });
  runCli(['does-not-exist'], { cwd: root, expectedStatus: 1 });
  const invalidFlag = runCli(['scan', '--bad-flag'], { cwd: root, expectedStatus: 1 });
  if (!invalidFlag.stdout.includes('Usage: tusq scan')) {
    throw new Error('Expected command usage help for invalid flag');
  }

  runCli(['scan', '.', '--framework', 'express'], { cwd: tmpRoot, expectedStatus: 1 });

  runCli(['init'], { cwd: expressProject });
  runCli(['init'], { cwd: expressProject });

  const scanResult = runCli(['scan', '.', '--format', 'json'], { cwd: expressProject });
  const scanJson = JSON.parse(scanResult.stdout);
  if (!scanJson.route_count || scanJson.route_count < 2) {
    throw new Error('Expected at least two routes in express scan output');
  }

  runCli(['manifest', '--verbose'], { cwd: expressProject });
  const manifestPath = path.join(expressProject, 'tusq.manifest.json');
  const manifest = await readJson(manifestPath);
  if (!manifest.capabilities.every((capability) => capability.sensitivity_class === 'unknown')) {
    throw new Error('Expected manifest capabilities to include sensitivity_class=unknown in V1');
  }
  manifest.capabilities[0].approved = true;
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  runCli(['compile', '--dry-run', '--verbose'], { cwd: expressProject });
  runCli(['compile', '--verbose'], { cwd: expressProject });
  const compiledToolPath = path.join(expressProject, 'tusq-tools', `${manifest.capabilities[0].name}.json`);
  const compiledTool = await readJson(compiledToolPath);
  if (compiledTool.sensitivity_class !== 'unknown') {
    throw new Error('Expected compiled tool to include sensitivity_class=unknown');
  }
  runCli(['review', '--verbose'], { cwd: expressProject });

  runCli(['init'], { cwd: fastifyProject });
  runCli(['scan', '.', '--verbose'], { cwd: fastifyProject });

  runCli(['init'], { cwd: nestProject });
  runCli(['scan', '.', '--verbose'], { cwd: nestProject });

  const port = 32155;
  const serveProc = spawn('node', [cli, 'serve', '--port', String(port)], {
    cwd: expressProject,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  await waitForReady(serveProc);

  const listResponse = await requestRpc(port, {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  });

  if (!listResponse.result || !Array.isArray(listResponse.result.tools) || listResponse.result.tools.length === 0) {
    throw new Error(`tools/list did not return tools: ${JSON.stringify(listResponse)}`);
  }

  const firstTool = listResponse.result.tools[0];
  if (firstTool.sensitivity_class !== 'unknown') {
    throw new Error(`Expected tools/list sensitivity_class=unknown: ${JSON.stringify(firstTool)}`);
  }
  if (!Array.isArray(firstTool.auth_hints)) {
    throw new Error(`Expected tools/list auth_hints array: ${JSON.stringify(firstTool)}`);
  }
  const callResponse = await requestRpc(port, {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: firstTool.name
    }
  });

  if (!callResponse.result || !callResponse.result.schema) {
    throw new Error(`tools/call did not return schema: ${JSON.stringify(callResponse)}`);
  }
  if (callResponse.result.sensitivity_class !== 'unknown') {
    throw new Error(`Expected tools/call sensitivity_class=unknown: ${JSON.stringify(callResponse)}`);
  }
  if (!Array.isArray(callResponse.result.auth_hints)) {
    throw new Error(`Expected tools/call auth_hints array: ${JSON.stringify(callResponse)}`);
  }

  const stop = new Promise((resolve, reject) => {
    serveProc.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`serve exited with non-zero code ${code}`));
      }
    });
  });

  serveProc.kill('SIGINT');
  await stop;

  console.log('Smoke tests passed');
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
