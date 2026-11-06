import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set([
  "media.themoviedb.org",
  "image.tmdb.org",
  "i.pinimg.com",
]);

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "missing url" }, { status: 400 });
  }
  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }
  if (!ALLOWED_HOSTS.has(target.hostname)) {
    return NextResponse.json({ error: "host not allowed" }, { status: 403 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        Referer: `https://${target.hostname}/`,
      },
      cache: "force-cache",
    });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: `upstream ${upstream.status}` },
        { status: 502 }
      );
    }
    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const buf = await upstream.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
