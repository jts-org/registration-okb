/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

import { postRegistration } from '../services/Api';

// Robust helper to post a registration and extract a numeric id from common response shapes.
export async function register(registrationData, role, operation) {
  const resp = await postRegistration(registrationData, role, operation);

  // Parse response safely
  let body;
  if (resp instanceof Response) {
    try {
      body = await resp.json();
    } catch (jsonErr) {
      try {
        body = await resp.text();
      } catch (textErr) {
        body = null;
      }
    }
  } else {
    body = resp;
  }

  // Extract numeric id from common shapes
  let id = -1;

  if (body == null) {
    id = -1;
  } else if (typeof body === 'number') {
    id = body;
  } else if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      if (parsed != null && parsed.id != null && !Number.isNaN(Number(parsed.id))) {
        id = Number(parsed.id);
      } else if (typeof parsed === 'number') {
        id = parsed;
      }
    } catch (e) {
      const maybe = Number(body);
      if (!Number.isNaN(maybe)) id = maybe;
    }
  } else if (typeof body === 'object') {
    if (body.id != null && !Number.isNaN(Number(body.id))) {
      id = Number(body.id);
    } else if (body.data && body.data.id != null && !Number.isNaN(Number(body.data.id))) {
      id = Number(body.data.id);
    } else {
      for (const v of Object.values(body)) {
        if (typeof v === 'number') { id = v; break; }
        if (typeof v === 'string' && !Number.isNaN(Number(v))) { id = Number(v); break; }
      }
    }
  }

  return id;
}

export default register;
