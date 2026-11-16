// Lee la pestaña HORARIO (CSV) y calcula quién está en turno. Horas en RD (UTC-4).
(function (g) {
  function parseCsv(t) {
    const rows = []; let r = [], c = '', q = false;
    for (let i = 0; i < t.length; i++) {
      const ch = t[i];
      if (q) { if (ch === '"') { if (t[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
      else if (ch === '"') q = true;
      else if (ch === ',') { r.push(c); c = ''; }
      else if (ch === '\n') { r.push(c); rows.push(r); r = []; c = ''; }
      else if (ch !== '\r') c += ch;
    }
    r.push(c); rows.push(r); return rows;
  }
  const DAYS = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
  const TIME = /(\d{1,2}):(\d{2})\s*(AM|PM)\s*A\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i;
  const mins = (h, m, ap) => ((Number(h) % 12) + (/PM/i.test(ap) ? 12 : 0)) * 60 + Number(m);

  function parseBlocks(csv) {
    const rows = parseCsv(csv), heads = [];
    rows.forEach((row, i) => {
      const found = [];
      for (let c = 0; c < row.length; c++) { const m = norm(row[c]).match(/^(LUNES|MARTES|MIERCOLES|JUEVES|VIERNES|SABADO|DOMINGO)\s+(\d{1,2})$/); if (m) found.push({ c, wd: DAYS.indexOf(m[1]), day: Number(m[2]) }); }
      if (found.length >= 5) heads.push({ i, found });
    });
    const out = [];
    heads.forEach((h, k) => {
      const endRow = k + 1 < heads.length ? heads[k + 1].i : rows.length;
      h.found.forEach(f => {
        const shifts = []; let pend = null;
        for (let r = h.i + 1; r < endRow; r++) {
          const raw = String(rows[r][f.c] || '').trim(); if (!raw) continue;
          const tm = raw.match(TIME);
          if (tm) { pend = { s: mins(tm[1], tm[2], tm[3]), e: mins(tm[4], tm[5], tm[6]) }; continue; }
          const n = norm(raw);
          if (/^LIBRE/.test(n)) { pend = null; continue; }
          if (/\((R|V)\)/.test(n)) { pend = null; continue; }               // reposo / vacaciones
          if (!pend) continue;
          const name = n.replace(/\([^)]*\)/g, '').replace(/\b(DEP\/RET|RET\/DEP|RETIROS|DEPOSITOS)\b/g, '').trim();
          if (name) shifts.push({ name, s: pend.s, e: pend.e });
          pend = null;
        }
        out.push({ wd: f.wd, day: f.day, shifts, row: h.i });
      });
    });
    return out;
  }

  // Turnos de una fecha RD (YYYY-MM-DD) como intervalos absolutos [ini, fin) en ms
  function intervals(blocks, dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number), base = Date.UTC(y, m - 1, d, 4);
    const wd = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
    const matches = blocks.filter(b => b.wd === wd && b.day === d);
    const blk = matches[matches.length - 1]; if (!blk) return null;
    return blk.shifts.map(s => {
      let dur = s.e - s.s; if (dur <= 0) dur += 1440;
      if (dur > 720) dur = s.s >= 720 ? 1440 - s.s : 480;                  // errata tipo "04:00 PM A 12:00 PM"
      return { name: s.name, a: base + s.s * 6e4, b: base + (s.s + dur) * 6e4, s: s.s, e: (s.s + dur) % 1440 };
    });
  }

  function onShift(blocks, now) {
    const rd = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santo_Domingo' });
    const today = rd.format(new Date(now)), yest = rd.format(new Date(now - 864e5));
    const list = [...(intervals(blocks, yest) || []), ...(intervals(blocks, today) || [])];
    return { has: !!(intervals(blocks, today)), list: list.filter(x => now >= x.a && now < x.b), all: intervals(blocks, today) || [] };
  }
  g.PD_SCHED = { parseCsv, parseBlocks, intervals, onShift };
})(window);
