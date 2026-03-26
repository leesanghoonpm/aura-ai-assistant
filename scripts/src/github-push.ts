import { execSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const OWNER = "leesanghoonpm";
const REPO = "aura-ai-assistant";
const BRANCH = "main";
const WORKSPACE_ROOT = "/home/runner/workspace";

const IDENTITY_TOKEN = execSync(
  "replit identity create --audience https://connectors.replit.com",
  { encoding: "utf-8" }
).trim();

const PROXY_BASE = "https://connectors.replit.com/api/v2/proxy";

async function githubRequest(path: string, method = "GET", body?: unknown) {
  const url = `${PROXY_BASE}${path}`;
  const response = await fetch(url, {
    method,
    headers: {
      "X-Replit-Token": `repl ${IDENTITY_TOKEN}`,
      "Connector-Name": "github",
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  try {
    return { status: response.status, data: JSON.parse(text) };
  } catch {
    return { status: response.status, data: text };
  }
}

const IGNORE_PATTERNS = [
  "node_modules",
  ".git",
  "dist",
  ".local",
  "pnpm-lock.yaml",
  ".replit-artifact",
  "tsconfig.tsbuildinfo",
  "attached_assets",
  ".cache",
  ".upm",
  "tmp",
  ".config",
  ".nix-profile",
  "__pycache__",
  ".pythonlibs",
];

function shouldIgnore(filePath: string): boolean {
  const parts = filePath.split("/");
  return parts.some((part) =>
    IGNORE_PATTERNS.some((pat) => part === pat || part.startsWith(pat))
  );
}

function collectFiles(dir: string, files: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return files;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relPath = relative(WORKSPACE_ROOT, fullPath);
    if (shouldIgnore(relPath)) continue;
    let stat;
    try {
      stat = statSync(fullPath);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      collectFiles(fullPath, files);
    } else if (stat.size < 1_000_000) {
      files.push(fullPath);
    } else {
      console.log(`  ⏭ Skipping large file: ${relPath} (${(stat.size / 1024).toFixed(0)}KB)`);
    }
  }
  return files;
}

async function main() {
  // Step 1: Initialize the empty repository by creating a README via Contents API
  console.log("🔄 Initializing empty repository...");

  let baseCommitSha: string;
  let baseTreeSha: string;

  // Step 2: Get the base commit SHA (handle empty repo case)
  let refResult = await githubRequest(
    `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`
  );

  // If repo is empty (409), create initial commit via Contents API
  if (refResult.status === 409 || !refResult.data?.object?.sha) {
    console.log("  Repo is empty — creating initial commit via Contents API...");
    const initContent = Buffer.from(
      `# AURA — AI Personal Assistant\n\nAI 기반 개인 비서 서비스\n`
    ).toString("base64");

    const { status: initStatus, data: initData } = await githubRequest(
      `/repos/${OWNER}/${REPO}/contents/README.md`,
      "PUT",
      {
        message: "chore: initialize repository",
        content: initContent,
      }
    );

    if (initStatus !== 201) {
      console.error("❌ Failed to initialize repo:", initData);
      process.exit(1);
    }
    console.log("  ✓ Initial commit created");
    await new Promise((r) => setTimeout(r, 2000));

    // Re-fetch the ref
    refResult = await githubRequest(
      `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`
    );
  }

  baseCommitSha = refResult.data?.object?.sha;
  if (!baseCommitSha) {
    console.error("❌ Could not get base commit SHA:", refResult.data);
    process.exit(1);
  }
  console.log("✓ Base commit SHA:", baseCommitSha);

  // Step 3: Get the base tree
  const { data: commitData } = await githubRequest(
    `/repos/${OWNER}/${REPO}/git/commits/${baseCommitSha}`
  );
  const baseTreeSha2 = commitData?.tree?.sha;
  baseTreeSha = baseTreeSha2;
  console.log("✓ Base tree SHA:", baseTreeSha);

  // Step 4: Collect files
  console.log("\n🔍 Collecting files...");
  const files = collectFiles(WORKSPACE_ROOT);
  console.log(`Found ${files.length} files to upload`);

  // Step 5: Create blobs in parallel batches
  console.log("\n📦 Creating blobs (parallel)...");
  const treeEntries: { path: string; mode: string; type: string; sha: string }[] = [];
  let successCount = 0;
  let failCount = 0;
  const CONCURRENCY = 4;

  async function createBlob(content: string, encoding: "utf-8" | "base64", retries = 3): Promise<{ status: number; data: unknown }> {
    for (let attempt = 0; attempt < retries; attempt++) {
      const result = await githubRequest(
        `/repos/${OWNER}/${REPO}/git/blobs`,
        "POST",
        { content, encoding }
      );
      if (result.status !== 429) return result;
      // Wait before retry: 2s, 4s, 8s
      await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, attempt)));
    }
    return { status: 429, data: { message: "Rate limited after retries" } };
  }

  async function processFile(filePath: string) {
    const relPath = relative(WORKSPACE_ROOT, filePath);
    let content: string;
    let encoding: "utf-8" | "base64";

    try {
      const buf = readFileSync(filePath);
      if (buf.includes(0)) {
        content = buf.toString("base64");
        encoding = "base64";
      } else {
        content = buf.toString("utf-8");
        encoding = "utf-8";
      }
    } catch {
      failCount++;
      return;
    }

    const { status, data } = await createBlob(content, encoding);

    if (status !== 201) {
      console.error(`  ❌ ${relPath}: ${(data as { message?: string })?.message || status}`);
      failCount++;
      return;
    }

    treeEntries.push({ path: relPath, mode: "100644", type: "blob", sha: (data as { sha: string }).sha });
    successCount++;
    if (successCount % 30 === 0) {
      process.stdout.write(`  ✓ ${successCount}/${files.length} files uploaded...\n`);
    }
  }

  // Process in chunks of CONCURRENCY
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const chunk = files.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(processFile));
  }
  console.log(`  ✓ ${successCount} blobs created, ${failCount} skipped`);

  // Step 6: Create tree
  console.log("\n🌳 Creating tree...");
  const { status: treeStatus, data: treeResult } = await githubRequest(
    `/repos/${OWNER}/${REPO}/git/trees`,
    "POST",
    {
      base_tree: baseTreeSha,
      tree: treeEntries,
    }
  );

  if (treeStatus !== 201) {
    console.error("❌ Failed to create tree:", treeResult);
    process.exit(1);
  }
  console.log("✓ Tree SHA:", treeResult.sha);

  // Step 7: Create commit
  console.log("\n💾 Creating commit...");
  const { status: newCommitStatus, data: newCommitData } = await githubRequest(
    `/repos/${OWNER}/${REPO}/git/commits`,
    "POST",
    {
      message:
        "feat: AURA AI Personal Assistant — Full Implementation\n\nPRD 기반 AI 개인 비서 서비스\n\n✨ Features:\n- 모닝 브리핑 대시보드 (날씨, 일정, 뉴스, AI 인사이트)\n- 스마트 메일 관리 (AI 분류, 요약, 답장 초안)\n- 할일 칸반 보드 (To Do / In Progress / Done)\n- 뉴스 & 인사이트 허브\n- 스마트 리마인더\n- AI 챗봇 인터페이스\n\n🛠 Stack:\n- Frontend: React + Vite + Framer Motion (Toss-style design)\n- Backend: Express 5 + PostgreSQL + Drizzle ORM\n- API: OpenAPI 3.1 + Orval codegen\n- UI: Shadcn/ui + Tailwind CSS",
      tree: treeResult.sha,
      parents: [baseCommitSha],
    }
  );

  if (newCommitStatus !== 201) {
    console.error("❌ Failed to create commit:", newCommitData);
    process.exit(1);
  }
  console.log("✓ Commit SHA:", newCommitData.sha);

  // Step 8: Update ref
  console.log("\n🚀 Pushing to GitHub...");
  const { status: updateRefStatus, data: updateRefData } = await githubRequest(
    `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
    "PATCH",
    {
      sha: newCommitData.sha,
      force: true,
    }
  );

  if (updateRefStatus === 200) {
    console.log(`\n✅ 완료! 코드가 GitHub에 성공적으로 올라갔어요.`);
    console.log(`🔗 https://github.com/${OWNER}/${REPO}`);
  } else {
    console.error("❌ Failed to update ref:", updateRefData);
    process.exit(1);
  }
}

main().catch(console.error);
