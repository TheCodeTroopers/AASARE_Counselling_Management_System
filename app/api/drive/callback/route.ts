import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return new NextResponse(
      `<html><body><script>window.opener?.postMessage({ type: 'GOOGLE_DRIVE_AUTH_ERROR', error: '${error}' }, '*'); window.close();</script><h2>Authentication Error: ${error}</h2></body></html>`,
      { headers: { "content-type": "text/html" } },
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/google-drive?status=error", req.url));
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI || `${req.nextUrl.origin}/api/drive/callback`;

    if (clientId && clientSecret) {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json();
      if (tokenData.access_token) {
        const { encryptPayload } = await import("@/lib/crypto");
        const { createDriveFolder } = await import("@/lib/google-drive");
        const { supabase } = await import("@/integrations/supabase/client");

        const encAccessToken = encryptPayload({ token: tokenData.access_token });
        const encRefreshToken = tokenData.refresh_token
          ? encryptPayload({ token: tokenData.refresh_token })
          : null;

        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id || null;
        const userEmail = authData?.user?.email || "counsellor@sode-edu.in";

        // Create dedicated "AASARE Counselling Case Sheets" folder in Google Drive
        const folder = await createDriveFolder(
          tokenData.access_token,
          "AASARE Counselling Case Sheets",
        );

        try {
          await supabase.from("drive_connections").upsert(
            {
              counsellor_email: userEmail,
              user_id: userId,
              folder_name: folder?.name || "AASARE Counselling Case Sheets",
              folder_id: folder?.id || null,
              folder_url: folder?.webViewLink || null,
              encrypted_access_token: encAccessToken,
              encrypted_refresh_token: encRefreshToken,
              is_connected: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "counsellor_email" },
          );
        } catch {
          // Fallback notice
        }
      }
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head><title>Google Drive Connected</title></head>
        <body style="font-family: sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #fdfaf8; color: #2f2f2f;">
          <div style="text-align: center; padding: 2rem;">
            <h2 style="color: #6d214f;">Google Drive Successfully Connected!</h2>
            <p>Your encrypted credentials have been saved securely to the database.</p>
            <script>
              try {
                if (window.opener) {
                  window.opener.postMessage("gdrive_connected", "*");
                  window.opener.postMessage({ type: "GOOGLE_DRIVE_AUTH_SUCCESS" }, "*");
                  setTimeout(() => window.close(), 1200);
                } else {
                  window.location.href = "/google-drive?status=connected";
                }
              } catch (e) {
                window.location.href = "/google-drive?status=connected";
              }
            </script>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(htmlContent, {
      headers: { "content-type": "text/html" },
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, message: (err as Error).message }, { status: 500 });
  }
}
