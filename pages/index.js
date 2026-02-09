import { useMemo, useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // text collapse
  const [showFullTitle, setShowFullTitle] = useState(false);

  // filter type
  const [filter, setFilter] = useState("all"); // all|video|audio|image

  const medias = useMemo(() => {
    const list = data?.medias || [];
    if (filter === "all") return list;
    return list.filter((m) => m.type === filter);
  }, [data, filter]);

  async function getMedia() {
    setLoading(true);
    setError("");
    setData(null);
    setShowFullTitle(false);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      // IMPORTANT: handle non-json response biar gak error "Unexpected end of JSON"
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw "API tidak mengembalikan JSON (cek struktur pages/api).";
      }

      if (!res.ok || json.error) throw json.error || "Gagal mengambil media";
      setData(json);
    } catch (e) {
      setError(e.toString());
    }

    setLoading(false);
  }

  const title = data?.title || "";
  const titleTooLong = title.length > 220;
  const shortTitle = titleTooLong ? title.slice(0, 220) + "..." : title;

  function shortUrl(u) {
    if (!u) return "";
    return u.length > 60 ? u.slice(0, 60) + "..." : u;
  }

  return (
    <div className="wrap">
      <h1 className="h1">Auto Downloader</h1>
      <p className="p">
        Support TikTok, IG, FB, X, YT, Threads, Pinterest, Snapchat, Spotify,
        SoundCloud
      </p>

      <input
        className="input"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste link..."
      />

      <button className="btnMain" onClick={getMedia} disabled={loading}>
        {loading ? "Loading..." : "Get Media"}
      </button>

      {error && <div className="err">❌ {error}</div>}

      {data && (
        <div className="card">
          <h2 className="h2">Result</h2>

          <div className="meta">
            <b>Title:</b>{" "}
            {title ? (
              <>
                {showFullTitle ? title : shortTitle}
                {titleTooLong && (
                  <span
                    className="seeMore"
                    onClick={() => setShowFullTitle((v) => !v)}
                  >
                    {showFullTitle ? " Sembunyikan" : " Lihat selengkapnya"}
                  </span>
                )}
              </>
            ) : (
              "-"
            )}
          </div>

          <div className="meta">
            <b>Source:</b>{" "}
            <a className="link" href={data.source} target="_blank" rel="noreferrer">
              {shortUrl(data.source)}
            </a>
          </div>

          {/* Filter */}
          <div className="filters">
            {["all", "video", "image", "audio"].map((t) => (
              <button
                key={t}
                className={filter === t ? "chip active" : "chip"}
                onClick={() => setFilter(t)}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* LIST MEDIA */}
          <div className="list">
            {medias.map((m, i) => (
              <div className="item" key={i}>
                <div className="info">
                  <div className="type">
                    {m.type.toUpperCase()}
                    {m.quality ? <span className="q"> ({m.quality})</span> : null}
                  </div>
                  <div className="small">{shortUrl(m.url)}</div>
                </div>

                <div className="actions">
                  {/* PREVIEW: buka url asli */}
                  <a
                    className="btn preview"
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Preview
                  </a>

                  {/* DOWNLOAD: paksa lewat proxy */}
                  <a
                    className="btn download"
                    href={`/api/proxy?url=${encodeURIComponent(m.url)}&filename=${encodeURIComponent(
                      `${m.type}${m.quality ? "-" + m.quality : ""}`
                    )}`}
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}

            {!medias.length && <div className="empty">Tidak ada media.</div>}
          </div>
        </div>
      )}

      <div className="foot">Built with Next.js + Vercel 🚀</div>

      <style jsx>{`
        .wrap {
          max-width: 720px;
          margin: 20px auto;
          padding: 18px;
          font-family: Arial, sans-serif;
        }
        .h1 {
          margin: 0;
          font-size: 32px;
        }
        .p {
          margin-top: 10px;
          color: #444;
          line-height: 1.5;
        }
        .input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 10px;
          outline: none;
          margin-top: 14px;
          font-size: 14px;
        }
        .btnMain {
          margin-top: 12px;
          padding: 12px 18px;
          border-radius: 12px;
          border: none;
          background: #111;
          color: #fff;
          font-weight: bold;
        }
        .btnMain:disabled {
          opacity: 0.6;
        }
        .err {
          margin-top: 14px;
          color: #b91c1c;
          font-weight: bold;
        }
        .card {
          margin-top: 18px;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
        }
        .h2 {
          margin: 0 0 10px 0;
        }
        .meta {
          margin-top: 10px;
          line-height: 1.5;
        }
        .seeMore {
          color: #2563eb;
          cursor: pointer;
          font-weight: bold;
        }
        .link {
          color: #2563eb;
          text-decoration: none;
          word-break: break-word;
        }
        .link:hover {
          text-decoration: underline;
        }
        .filters {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .chip {
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid #ccc;
          background: #fff;
          cursor: pointer;
          font-size: 13px;
        }
        .chip.active {
          background: #111;
          color: white;
          border-color: #111;
        }
        .list {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .item {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .info {
          flex: 1;
          min-width: 220px;
        }
        .type {
          font-weight: bold;
        }
        .q {
          font-weight: normal;
          color: #666;
          font-size: 12px;
        }
        .small {
          font-size: 12px;
          color: #666;
          word-break: break-word;
          margin-top: 4px;
        }
        .actions {
          display: flex;
          gap: 10px;
        }
        .btn {
          padding: 9px 14px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: bold;
          font-size: 13px;
          color: white;
        }
        .btn.preview {
          background: #2563eb;
        }
        .btn.download {
          background: #16a34a;
        }
        .empty {
          color: #666;
          padding: 10px 0;
        }
        .foot {
          margin-top: 18px;
          text-align: center;
          color: #777;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
