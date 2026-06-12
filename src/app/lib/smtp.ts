import net from "net";
import tls from "tls";

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
};

type SendMailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const encodeHeader = (value: string) =>
  /[^\x20-\x7e]/.test(value)
    ? `=?UTF-8?B?${Buffer.from(value).toString("base64")}?=`
    : value;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const dotStuff = (value: string) =>
  value.replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");

const readResponse = (socket: net.Socket | tls.TLSSocket) =>
  new Promise<string>((resolve, reject) => {
    let data = "";

    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const onData = (chunk: Buffer) => {
      data += chunk.toString("utf8");
      const lines = data.split(/\r?\n/).filter(Boolean);
      const lastLine = lines[lines.length - 1];

      if (lastLine && /^\d{3} /.test(lastLine)) {
        cleanup();
        resolve(data);
      }
    };

    socket.on("data", onData);
    socket.once("error", onError);
  });

const assertResponse = async (
  socket: net.Socket | tls.TLSSocket,
  expectedCodes: number[],
) => {
  const response = await readResponse(socket);
  const code = Number(response.slice(0, 3));

  if (!expectedCodes.includes(code)) {
    throw new Error(`SMTP error: ${response.trim()}`);
  }
};

const writeCommand = async (
  socket: net.Socket | tls.TLSSocket,
  command: string,
  expectedCodes: number[],
) => {
  socket.write(`${command}\r\n`);
  await assertResponse(socket, expectedCodes);
};

const connect = (config: SmtpConfig) =>
  new Promise<net.Socket | tls.TLSSocket>((resolve, reject) => {
    const onError = (error: Error) => reject(error);

    if (config.port === 465) {
      const socket = tls.connect(
        config.port,
        config.host,
        { servername: config.host },
        () => resolve(socket),
      );
      socket.once("error", onError);
      return;
    }

    const socket = net.connect(config.port, config.host, () => resolve(socket));
    socket.once("error", onError);
  });

const upgradeToTls = (
  socket: net.Socket,
  host: string,
): Promise<tls.TLSSocket> =>
  new Promise((resolve, reject) => {
    const secureSocket = tls.connect({ socket, servername: host }, () =>
      resolve(secureSocket),
    );

    secureSocket.once("error", reject);
  });

const createMessage = (
  from: string,
  options: SendMailOptions,
  boundary: string,
) =>
  [
    `From: ${from}`,
    `To: ${options.to}`,
    `Subject: ${encodeHeader(options.subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    options.text,
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    options.html,
    "",
    `--${boundary}--`,
    "",
  ].join("\r\n");

export const getSmtpConfig = (): SmtpConfig | null => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !port || !user || !password) return null;

  return { host, port, user, password };
};

export const sendMail = async (options: SendMailOptions) => {
  const config = getSmtpConfig();

  if (!config) {
    throw new Error("SMTP is not configured");
  }

  const socket = await connect(config);

  try {
    await assertResponse(socket, [220]);
    await writeCommand(socket, `EHLO ${config.host}`, [250]);

    const activeSocket =
      config.port !== 465
        ? await (async () => {
            await writeCommand(socket, "STARTTLS", [220]);
            const secureSocket = await upgradeToTls(
              socket as net.Socket,
              config.host,
            );
            await writeCommand(secureSocket, `EHLO ${config.host}`, [250]);
            return secureSocket;
          })()
        : socket;

    await writeCommand(activeSocket, "AUTH LOGIN", [334]);
    await writeCommand(
      activeSocket,
      Buffer.from(config.user).toString("base64"),
      [334],
    );
    await writeCommand(
      activeSocket,
      Buffer.from(config.password).toString("base64"),
      [235],
    );
    await writeCommand(activeSocket, `MAIL FROM:<${config.user}>`, [250]);
    await writeCommand(activeSocket, `RCPT TO:<${options.to}>`, [250, 251]);
    await writeCommand(activeSocket, "DATA", [354]);

    const boundary = `leadnest-${Date.now().toString(36)}`;
    const message = createMessage(
      config.user,
      {
        ...options,
        html: options.html,
        text: options.text,
      },
      boundary,
    );

    activeSocket.write(`${dotStuff(message)}\r\n.\r\n`);
    await assertResponse(activeSocket, [250]);
    await writeCommand(activeSocket, "QUIT", [221]);
  } finally {
    socket.end();
  }
};

export const buildResetEmail = (resetUrl: string) => {
  const safeUrl = escapeHtml(resetUrl);

  return {
    subject: "Reset your LeadNest password",
    text: [
      "We received a request to reset your LeadNest password.",
      "",
      `Open this link to continue: ${resetUrl}`,
      "",
      "This link expires in 30 minutes. If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: [
      "<p>We received a request to reset your LeadNest password.</p>",
      `<p><a href="${safeUrl}">Reset your password</a></p>`,
      "<p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>",
    ].join(""),
  };
};
