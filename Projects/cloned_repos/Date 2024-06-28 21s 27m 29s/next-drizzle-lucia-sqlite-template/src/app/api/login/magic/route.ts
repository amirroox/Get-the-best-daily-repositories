import { afterLoginUrl } from "@/app-config";
import { setSession } from "@/app/api/login/google/callback/route";
import { loginWithMagicLinkUseCase } from "@/use-cases/magic-link";

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/sign-in",
        },
      });
    }

    const user = await loginWithMagicLinkUseCase(token);

    await setSession(user.id);

    return new Response(null, {
      status: 302,
      headers: {
        Location: afterLoginUrl,
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/sign-in/magic/error",
      },
    });
  }
}
