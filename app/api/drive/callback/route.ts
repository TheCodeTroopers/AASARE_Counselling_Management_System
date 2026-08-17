import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/integrations/supabase/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  // Decode the state payload (btoa(encodeURIComponent(JSON))) that carries the
  // logged-in user's supabase token + email, so we can resolve the correct
  // counsellor server-side.
  let stateToken = "";
  let stateEmail = "";
  if (state) {
    try {
      const parsed = JSON.parse(decodeURIComponent(atob(state)));
      stateToken = parsed.token || "";
      stateEmail = parsed.email || "";
    } catch {
      // Ignore malformed state
    }
  }

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
      console.log("[Drive Callback] Exchanging code for tokens with redirectUri:", redirectUri);
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
      console.log("[Drive Callback] Token exchange response:", {
        hasAccess: Boolean(tokenData.access_token),
        hasRefresh: Boolean(tokenData.refresh_token),
        error: tokenData.error,
        error_description: tokenData.error_description,
      });

      if (!tokenData.access_token) {
        const errMsg = tokenData.error_description || tokenData.error || "Failed to exchange OAuth code for access token";
        console.error("[Drive Callback Error]", errMsg);
        return new NextResponse(
          `<html><body><script>window.opener?.postMessage({ type: 'GOOGLE_DRIVE_AUTH_ERROR', error: '${errMsg}' }, '*');</script><h2 style="color:red;">Google OAuth Error: ${errMsg}</h2><p>Please check your Redirect URI in Google Cloud Console.</p></body></html>`,
          { headers: { "content-type": "text/html" } },
        );
      }

      const { encryptPayload } = await import("@/lib/crypto");
      const { createDriveFolder } = await import("@/lib/google-drive");
      const { createClient } = await import("@supabase/supabase-js");

      const SUPABASE_URL =
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.SUPABASE_URL ||
        "https://vgsyirselvakpjcfwfgi.supabase.co";
      const SUPABASE_KEY =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.SUPABASE_PUBLISHABLE_KEY;

      if (!SUPABASE_KEY) {
        return NextResponse.json("SUPABASE_KEY not found", { status: 500 });
      }

      const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
        global: {
          headers: stateToken && !process.env.SUPABASE_SERVICE_ROLE_KEY
            ? { Authorization: `Bearer ${stateToken}` }
            : undefined,
        },
        auth: {
          storage: undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      const encAccessToken = encryptPayload({ token: tokenData.access_token });
      const encRefreshToken = tokenData.refresh_token
        ? encryptPayload({ token: tokenData.refresh_token })
        : null;

      let userId: string | null = null;
      let userEmail = stateEmail || "counsellor@sode-edu.in";

      if (stateToken) {
        const { data: authData } = await supabase.auth.getUser(stateToken);
        userId = authData?.user?.id || null;
        if (authData?.user?.email) userEmail = authData.user.email;
      }

      console.log("[Drive Callback] Creating drive folder for user:", userEmail, "userId:", userId);
      const folder = await createDriveFolder(
        tokenData.access_token,
        "AASARE Counselling Case Sheets",
      );
      console.log("[Drive Callback] Folder created:", folder);

      const { data: dbData, error: dbErr } = await supabase
        .from("drive_connections")
        .upsert(
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
        )
        .select("*");

      if (dbErr) {
        console.error("[Drive Callback Error] Supabase DB upsert failed:", dbErr);
        return new NextResponse(
          `<html><body><script>window.opener?.postMessage({ type: 'GOOGLE_DRIVE_AUTH_ERROR', error: '${dbErr.message}' }, '*');</script><h2 style="color:red;">Database Error: ${dbErr.message}</h2><p>Could not save connection details to Supabase.</p></body></html>`,
          { headers: { "content-type": "text/html" } },
        );
      }

      console.log("[Drive Callback Success] Saved connection to DB:", dbData);
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
