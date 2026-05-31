import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { FaBug, FaCopy, FaEnvelope, FaTimes } from 'react-icons/fa';
import { SUPPORT_EMAIL, SUPPORT_FORM_ENDPOINT, SUPPORT_SUBJECT_PREFIX } from '../config/support';

const Fab = styled.button`
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 60;
  border: none;
  border-radius: 999px;
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(8px);
  -webkit-tap-highlight-color: transparent;

  &:active {
    transform: scale(0.98);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 70;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
`;

const Panel = styled.div`
  width: min(760px, 96vw);
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
  color: #0b1b2b;
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.25rem;
`;

const SubTitle = styled.p`
  margin: 6px 0 0 0;
  opacity: 0.85;
  line-height: 1.35;
`;

const Close = styled.button`
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: rgba(0, 0, 0, 0.04);
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  color: #0b1b2b;

  &:active {
    transform: scale(0.98);
  }
`;

const Textarea = styled.textarea`
  margin-top: 14px;
  width: 100%;
  min-height: 160px;
  resize: vertical;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.16);
  padding: 12px 12px;
  font-size: 1rem;
  line-height: 1.3;
  box-sizing: border-box;
`;

const Input = styled.input`
  margin-top: 10px;
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.16);
  padding: 12px 12px;
  font-size: 1rem;
  line-height: 1.2;
  box-sizing: border-box;
`;

const HiddenInput = styled.input`
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
`;

const Actions = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: rgba(0, 0, 0, 0.04);
  border-radius: 999px;
  padding: 10px 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  color: #0b1b2b;

  &[data-primary='true'] {
    background: #4dabf7;
    border-color: rgba(0, 0, 0, 0.12);
    color: #04223a;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const PillRow = styled.div`
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Pill = styled.div`
  background: rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 900;
  font-size: 0.9rem;
`;

const Small = styled.div`
  margin-top: 10px;
  font-size: 0.92rem;
  opacity: 0.8;
  line-height: 1.35;
`;

function safeString(v) {
  if (v == null) return '';
  return String(v);
}

function buildSupportText({ gameId, operation, note }) {
  const now = new Date();
  const ua = safeString(navigator?.userAgent);
  const lang = safeString(navigator?.language);
  const url = safeString(window?.location?.href);
  const size = `${window?.innerWidth ?? ''}x${window?.innerHeight ?? ''}`;

  const lines = [
    `Juego: ${safeString(gameId)}`,
    operation ? `Modo/Categoría: ${safeString(operation)}` : null,
    `URL: ${url}`,
    `Pantalla: ${size}`,
    `Idioma: ${lang}`,
    `Fecha: ${now.toISOString()}`,
    '',
    'Describe el problema:',
    safeString(note || ''),
    '',
    'Datos técnicos:',
    ua,
  ].filter(Boolean);

  return lines.join('\n');
}

function buildMailto({ subject, body }) {
  const to = SUPPORT_EMAIL ? encodeURIComponent(SUPPORT_EMAIL) : '';
  const q = new URLSearchParams();
  q.set('subject', subject);
  q.set('body', body.length > 1800 ? `${body.slice(0, 1800)}\n\n(Contenido recortado)` : body);
  return `mailto:${to}?${q.toString()}`;
}

async function sendSupportForm({ endpoint, payload }) {
  try {
    const q = new URLSearchParams();
    Object.entries(payload).forEach(([k, v]) => {
      const value = safeString(v).trim();
      if (value) q.set(k, value);
    });

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: q.toString(),
    });

    const status = res.status;
    if (!res.ok) return { ok: false, status, data: null };

    try {
      const data = await res.json();
      if (data?.errors?.length) return { ok: false, status, data };
      if (data?.ok === true) return { ok: true, status, data };
      if (data?.success === true) return { ok: true, status, data };
      return { ok: true, status, data };
    } catch {
      return { ok: true, status, data: null };
    }
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', 'true');
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

const SupportFab = ({ gameId, operation }) => {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [sendError, setSendError] = useState('');
  const [sendInfo, setSendInfo] = useState('');
  const [copied, setCopied] = useState(false);

  const subject = useMemo(() => {
    const g = safeString(gameId) || 'juego';
    return `${SUPPORT_SUBJECT_PREFIX} (${g})`;
  }, [gameId]);

  const body = useMemo(() => buildSupportText({ gameId, operation, note }), [gameId, note, operation]);
  const canSendViaForm = Boolean(SUPPORT_FORM_ENDPOINT);

  const onCopy = useCallback(async () => {
    const ok = await copyText(body);
    setCopied(ok);
    setTimeout(() => setCopied(false), 1200);
  }, [body]);

  const onSendEmail = useCallback(() => {
    window.location.href = buildMailto({ subject, body });
  }, [body, subject]);

  const onSendBrowser = useCallback(async () => {
    if (!canSendViaForm || sending) return;
    if (honeypot) return;

    setSending(true);
    setSendResult(null);
    setSendError('');
    setSendInfo('');
    const res = await sendSupportForm({
      endpoint: SUPPORT_FORM_ENDPOINT,
      payload: {
        _subject: subject,
        name: safeString(fromName),
        email: safeString(fromEmail),
        _replyto: safeString(fromEmail),
        message: body.length > 20000 ? `${body.slice(0, 20000)}\n\n(Contenido recortado)` : body,
      },
    });
    setSending(false);
    setSendResult(res.ok ? 'ok' : 'error');
    if (!res.ok) {
      const statusPart = res.status ? ` (HTTP ${res.status})` : '';
      const errors = res.data?.errors?.length ? ` ${res.data.errors.map((e) => safeString(e?.message)).filter(Boolean).join(' · ')}` : '';
      setSendError(`No se ha podido enviar${statusPart}.${errors}`.trim());
      return;
    }

    setSendInfo(`Enviado (HTTP ${res.status || 200})`);
    setTimeout(() => {
      setSendResult(null);
      setSendInfo('');
    }, 2500);
  }, [body, canSendViaForm, fromEmail, fromName, honeypot, sending, subject]);

  const onOpen = useCallback(() => {
    setOpen(true);
    setSendResult(null);
    setSendError('');
    setSending(false);
    setSendInfo('');
  }, []);

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  const onResetResult = useCallback(() => {
    setSendResult(null);
    setSendError('');
    setSendInfo('');
  }, []);

  return (
    <>
      <Fab type="button" onClick={onOpen}>
        <FaBug /> Soporte
      </Fab>
      {open && (
        <Overlay onMouseDown={onClose}>
          <Panel onMouseDown={(e) => e.stopPropagation()}>
            <TopRow>
              <div>
                <Title>Reportar problema / feedback</Title>
                <SubTitle>
                  Escribe qué ha pasado y cómo reproducirlo. Puedes enviar desde el navegador o copiar el texto.
                </SubTitle>
              </div>
              <Close type="button" onClick={onClose}>
                <FaTimes /> Cerrar
              </Close>
            </TopRow>

            <PillRow>
              <Pill>Juego: {safeString(gameId)}</Pill>
              {operation && <Pill>Modo: {safeString(operation)}</Pill>}
              {!SUPPORT_EMAIL && <Pill>Email de soporte: sin configurar</Pill>}
              {!canSendViaForm && <Pill>Envío desde navegador: sin configurar</Pill>}
            </PillRow>

            <HiddenInput
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            <Input
              value={fromEmail}
              onChange={(e) => {
                setFromEmail(e.target.value);
                onResetResult();
              }}
              placeholder="Tu email (opcional, para poder responderte)"
              inputMode="email"
              autoComplete="email"
            />

            <Input
              value={fromName}
              onChange={(e) => {
                setFromName(e.target.value);
                onResetResult();
              }}
              placeholder="Tu nombre (opcional)"
              autoComplete="name"
            />

            <Textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                onResetResult();
              }}
              placeholder="Ejemplo: En el nivel 3, al pulsar Comprobar, se queda en blanco. Pasos: 1) ... 2) ... Resultado esperado: ... Resultado actual: ..."
            />

            <Actions>
              <Button
                type="button"
                data-primary="true"
                onClick={canSendViaForm ? onSendBrowser : onSendEmail}
                disabled={sending || (canSendViaForm && !note.trim())}
              >
                <FaEnvelope />{' '}
                {canSendViaForm
                  ? sending
                    ? 'Enviando...'
                    : sendResult === 'ok'
                      ? 'Enviado'
                      : sendResult === 'error'
                        ? 'Reintentar'
                        : 'Enviar'
                  : 'Abrir correo'}
              </Button>
              <Button type="button" onClick={onCopy}>
                <FaCopy /> {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </Actions>

            {sendResult === 'error' && (
              <Small>
                {sendError || 'No se ha podido enviar. Prueba con “Copiar”.'}
              </Small>
            )}

            {sendResult === 'ok' && sendInfo && <Small>{sendInfo}</Small>}

            <Small>
              El mensaje incluye automáticamente: juego, URL, tamaño de pantalla, idioma, fecha y navegador.
            </Small>
          </Panel>
        </Overlay>
      )}
    </>
  );
};

export default SupportFab;
