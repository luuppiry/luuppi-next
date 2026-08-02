// POST a multipart/form-data request with:
//   - "file"          the PDF to process (required)
//   - "coverRange"    cpdf page range for the cover section (optional,
//                      default "1")
//   - "contentRange"  cpdf page range for the content section that gets
//                      2-up imposed (optional, default "2-~2")
//   - "backRange"     cpdf page range for the back section (optional,
//                      default "end")

import { auth } from '@/auth';
import { logger } from '@/libs/utils/logger';
import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';

export const runtime = 'nodejs';
export const maxDuration = 60;

const execFileAsync = promisify(execFile);

// Loose allowlist for cpdf page-range syntax: digits, commas, spaces,
// hyphens, tildes (used for "from the end", e.g. "~1"), and the literal
// word "end". This is intentionally permissive about valid cpdf syntax
// while blocking anything that isn't a page-range token, since these
// values are passed as-is to execFile args (not through a shell, so no
// injection risk either way — but validating gives callers a clear 400
// instead of an opaque cpdf error).
const PAGE_RANGE_PATTERN = /^[0-9,\-~\s]*(end)?[0-9,\-~\s]*$/i;

function parseRange(
  formData: FormData,
  field: string,
  defaultValue: string,
): string {
  const raw = formData.get(field);
  if (raw === null) return defaultValue;
  if (typeof raw !== 'string' || raw.trim() === '') {
    throw new Error(`'${field}' must be a non-empty string if provided.`);
  }
  const value = raw.trim();
  if (!PAGE_RANGE_PATTERN.test(value)) {
    throw new Error(
      `'${field}' contains an invalid page range: "${value}". ` +
        'Expected cpdf page-range syntax, e.g. "1", "2-5", "2-~1", or "end".',
    );
  }
  return value;
}

async function run(cmd: string, args: string[], cwd: string) {
  try {
    const { stdout, stderr } = await execFileAsync(cmd, args, { cwd });
    return { stdout, stderr };
  } catch (err) {
    if (err instanceof Error) {
      const message =
        (err as unknown as { stderr: unknown })?.stderr ||
        err?.message ||
        String(err);
      throw new Error(`Command failed: ${cmd} ${args.join(' ')}\n${message}`, {
        cause: err,
      });
    }
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const searchParams = req.nextUrl.searchParams;
  const lang = searchParams.get('lang') || 'fi';
  const dictionary = await getDictionary(lang as 'fi' | 'en');

  const user = session?.user;

  if (!user || !user.isLuuppiHato) {
    logger.error('User not found in session');
    return NextResponse.json(
      { message: dictionary.api.unauthorized, isError: true },
      { status: 401 },
    );
  }

  const hasHatoRole = await prisma.rolesOnUsers.findFirst({
    where: {
      entraUserUuid: user.entraUserUuid,
      strapiRoleUuid: process.env.NEXT_PUBLIC_LUUPPI_HATO_ID!,
      OR: [{ expiresAt: { gte: new Date() } }, { expiresAt: null }],
    },
  });

  if (!hasHatoRole) {
    logger.error('User does not have the required role');
    return NextResponse.json(
      { message: dictionary.api.unauthorized, isError: true },
      { status: 401 },
    );
  }

  let workDir: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        // eslint-disable-next-line quotes
        { error: "Missing 'file' field (expected a PDF upload)." },
        { status: 400 },
      );
    }

    if (file.type && file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Uploaded file must be a PDF.' },
        { status: 400 },
      );
    }

    let coverRange: string;
    let contentRange: string;
    let backRange: string;
    try {
      coverRange = parseRange(formData, 'coverRange', '1');
      contentRange = parseRange(formData, 'contentRange', '2-~2');
      backRange = parseRange(formData, 'backRange', 'end');
    } catch (err: unknown) {
      if (err instanceof Error) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }

      return NextResponse.json(
        { error: 'Unknown error occured' },
        { status: 400 },
      );
    }

    // Create an isolated temp working directory per request.
    workDir = await mkdtemp(path.join(tmpdir(), 'pdf-process-'));

    const inputPath = path.join(workDir, 'input.pdf');
    const coverPath = path.join(workDir, 'cover.pdf');
    const contentPath = path.join(workDir, 'content.pdf');
    const content2upPath = path.join(workDir, 'content_2up.pdf');
    const backPath = path.join(workDir, 'back.pdf');
    const finalRawPath = path.join(workDir, 'final_raw.pdf');
    const finalCompressedPath = path.join(workDir, 'final_compressed.pdf');

    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, bytes);

    await run('cpdf', [inputPath, coverRange, '-o', coverPath], workDir);
    await run('cpdf', [inputPath, contentRange, '-o', contentPath], workDir);
    await run(
      'cpdf',
      ['-impose-xy', '2 1', contentPath, '-o', content2upPath],
      workDir,
    );
    await run('cpdf', [inputPath, backRange, '-o', backPath], workDir);

    await run(
      'cpdf',
      [coverPath, content2upPath, backPath, '-o', finalRawPath],
      workDir,
    );

    await run(
      'gs',
      [
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        '-dPDFSETTINGS=/ebook',
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        `-sOutputFile=${finalCompressedPath}`,
        finalRawPath,
      ],
      workDir,
    );

    const output = await readFile(finalCompressedPath);

    return new NextResponse(new Uint8Array(output), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="final_compressed.pdf"',
      },
    });
  } catch (err: unknown) {
    logger.error('PDF processing failed:', err);

    return NextResponse.json(
      {
        error:
          (err as { message: unknown })?.message ?? 'PDF processing failed.',
      },
      { status: 500 },
    );
  } finally {
    if (workDir) {
      await rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
