const crypto = require('crypto');

/**
 * GET /api/chat/ice-servers
 *
 * Returns fresh ICE server config with time-limited TURN credentials.
 *
 * Uses the coturn "use-auth-secret" mechanism:
 *   username = "<unix_timestamp_expiry>:<userId>"
 *   password = base64(HMAC-SHA1(TURN_SECRET, username))
 *
 * These credentials expire after TURN_CREDENTIAL_TTL_HOURS (default: 1h).
 * Even if intercepted they are useless after expiry.
 *
 * Required in backend/.env:
 *   TURN_SECRET=<your_static_auth_secret from turnserver.conf>
 *   TURN_HOST=<your EC2 public IP or domain>
 *
 * Optional:
 *   TURN_PORT=3478
 *   TURN_TLS_PORT=5349
 *   TURN_REALM=curalync.rishurajput.com
 *   TURN_CREDENTIAL_TTL_HOURS=1
 */
exports.getIceServers = (req, res) => {
  const secret  = process.env.TURN_SECRET;
  const host    = process.env.TURN_HOST;
  const port    = process.env.TURN_PORT     || '3478';
  const tlsPort = process.env.TURN_TLS_PORT || '5349';
  const ttlHours = parseInt(process.env.TURN_CREDENTIAL_TTL_HOURS || '1', 10);

  // ── Self-hosted TURN (coturn) ─────────────────────────────────────────────
  if (secret && host) {
    const userId  = req.user?._id?.toString() || req.user?.id?.toString() || 'anon';
    const expiry  = Math.floor(Date.now() / 1000) + ttlHours * 3600;
    const username = `${expiry}:${userId}`;
    const password = crypto
      .createHmac('sha1', secret)
      .update(username)
      .digest('base64');

    const iceServers = [
      // STUN (free, no auth needed)
      { urls: `stun:${host}:${port}` },
      // TURN UDP — fastest path
      { urls: `turn:${host}:${port}?transport=udp`,  username, credential: password },
      // TURN TCP — fallback when UDP is blocked
      { urls: `turn:${host}:${port}?transport=tcp`,  username, credential: password },
      // TURN TLS — firewall-friendly (port 443 alternative)
      { urls: `turns:${host}:${tlsPort}?transport=tcp`, username, credential: password },
    ];

    console.log(`[ICE] Generated TURN credentials for ${userId}, expires in ${ttlHours}h`);
    return res.json({ iceServers });
  }

  // ── Fallback: Metered.ca (if configured) ─────────────────────────────────
  if (process.env.METERED_API_KEY) {
    const appName = process.env.METERED_APP_NAME || 'global';
    const url = `https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${process.env.METERED_API_KEY}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    return fetch(url, { signal: controller.signal })
      .then(r => { clearTimeout(timeout); return r.json(); })
      .then(iceServers => res.json({ iceServers }))
      .catch(err => {
        console.warn('[ICE] Metered fetch failed:', err.message);
        returnStunOnly(res);
      });
  }

  // ── STUN-only fallback ────────────────────────────────────────────────────
  return returnStunOnly(res);
};

function returnStunOnly(res) {
  console.warn('[ICE] No TURN server configured — returning STUN-only. Cross-network calls will fail.');
  return res.json({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
    warning: 'No TURN server — add TURN_SECRET + TURN_HOST to backend/.env',
  });
}
