
const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });

const formatMessage = (value = "") =>
  escapeHtml(value).replace(/\r?\n/g, "<br />");

const emailLayout = (content, previewText = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FeedLink</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f6f4;font-family:Arial,Helvetica,sans-serif;color:#26352c;">
  <div style="display:none;font-size:1px;color:#f3f6f4;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${escapeHtml(previewText)}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f6f4;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border-radius:14px;overflow:hidden;">
          
          <tr>
            <td style="background:#176b45;padding:30px 36px;text-align:left;">
              <div style="font-size:27px;font-weight:700;letter-spacing:-0.5px;color:#ffffff;">
                FeedLink<span style="color:#b9e8ca;">.</span>
              </div>
              <div style="margin-top:7px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#d8f0e1;">
                Connecting food. Reducing waste.
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 36px 30px;">
              ${content}
            </td>
          </tr>

          <tr>
            <td style="padding:24px 36px;background:#f7faf8;border-top:1px solid #e8eee9;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#526258;">
                Together, we can make a difference.
              </p>
              <p style="margin:0;font-size:12px;color:#89958d;">
                © ${new Date().getFullYear()} FeedLink. All rights reserved.
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#a0aaa3;">
                This is an automated email from FeedLink.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const adminNotificationEmail = ({
  name,
  email,
  subject,
  message,
  contactId,
}) => {
  const content = `
    <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#258052;">
      Admin notification
    </p>

    <h1 style="margin:0 0 12px;font-size:25px;line-height:1.3;color:#1d3327;">
      New contact message received
    </h1>

    <p style="margin:0 0 26px;font-size:14px;line-height:1.7;color:#68776d;">
      Someone has submitted a new message through the FeedLink website.
      Here are the details.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f6faf7;border:1px solid #e4eee7;border-radius:10px;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 5px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#849188;">Sender</p>
          <p style="margin:0 0 17px;font-size:15px;font-weight:600;color:#263a2e;">${escapeHtml(name)}</p>

          <p style="margin:0 0 5px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#849188;">Email address</p>
          <p style="margin:0 0 17px;font-size:14px;color:#176b45;">${escapeHtml(email)}</p>

          <p style="margin:0 0 5px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#849188;">Subject</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#263a2e;">${escapeHtml(subject)}</p>
        </td>
      </tr>
    </table>

    <h3 style="margin:26px 0 10px;font-size:15px;color:#263a2e;">Message details</h3>

    <div style="padding:18px;background:#ffffff;border:1px solid #e8eee9;border-radius:9px;font-size:14px;line-height:1.8;color:#526258;">
      ${formatMessage(message)}
    </div>

    <p style="margin:22px 0 0;font-size:11px;color:#9aa59d;">
      Contact ID: ${escapeHtml(contactId)}
    </p>
  `;

  return emailLayout(content, `New contact message from ${name}`);
};

const visitorConfirmationEmail = ({ name, subject }) => {
  const content = `
    <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#258052;">
      Message received
    </p>

    <h1 style="margin:0 0 14px;font-size:27px;line-height:1.3;color:#1d3327;">
      Thank you for reaching out!
    </h1>

    <p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#526258;">
      Hello <strong style="color:#263a2e;">${escapeHtml(name)}</strong>,
    </p>

    <p style="margin:0 0 22px;font-size:14px;line-height:1.8;color:#68776d;">
      Thank you for contacting FeedLink. We have successfully received your message.
      Our team will review your inquiry and get back to you as soon as possible.
    </p>

    <div style="padding:18px 20px;background:#f2f8f4;border-left:4px solid #258052;border-radius:6px;">
      <p style="margin:0 0 7px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#7a8b80;">
        Your submitted subject
      </p>
      <p style="margin:0;font-size:15px;font-weight:600;color:#263a2e;">
        ${escapeHtml(subject)}
      </p>
    </div>

    <p style="margin:24px 0 0;font-size:14px;line-height:1.8;color:#68776d;">
      We appreciate your interest in FeedLink and your support for reducing food waste.
    </p>

    <p style="margin:25px 0 0;font-size:14px;line-height:1.7;color:#526258;">
      Warm regards,<br />
      <strong style="color:#176b45;">FeedLink Team</strong>
    </p>
  `;

  return emailLayout(content, "We have received your message. Thank you for contacting FeedLink.");
};

const visitorReplyEmail = ({ name, reply, originalMessage }) => {
  const content = `
    <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#258052;">
      Response from our team
    </p>

    <h1 style="margin:0 0 14px;font-size:26px;line-height:1.3;color:#1d3327;">
      We've got back to you!
    </h1>

    <p style="margin:0 0 22px;font-size:14px;line-height:1.8;color:#68776d;">
      Hello <strong style="color:#263a2e;">${escapeHtml(name)}</strong>,
      <br />
      Thank you for contacting FeedLink. Our team has responded to your inquiry.
    </p>

    <div style="padding:22px;background:#f2f8f4;border:1px solid #e1eee5;border-radius:10px;">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#258052;">
        FeedLink team response
      </p>
      <div style="font-size:14px;line-height:1.9;color:#34483b;">
        ${formatMessage(reply)}
      </div>
    </div>

    <h3 style="margin:26px 0 10px;font-size:14px;color:#263a2e;">
      Your original message
    </h3>

    <div style="padding:16px 18px;background:#fafbfa;border:1px solid #e9eeea;border-radius:8px;font-size:13px;line-height:1.8;color:#77847a;">
      ${formatMessage(originalMessage)}
    </div>

    <p style="margin:25px 0 0;font-size:14px;line-height:1.7;color:#526258;">
      Best regards,<br />
      <strong style="color:#176b45;">FeedLink Team</strong>
    </p>
  `;

  return emailLayout(content, "FeedLink has replied to your contact message.");
};

module.exports = {
  adminNotificationEmail,
  visitorConfirmationEmail,
  visitorReplyEmail,
};
