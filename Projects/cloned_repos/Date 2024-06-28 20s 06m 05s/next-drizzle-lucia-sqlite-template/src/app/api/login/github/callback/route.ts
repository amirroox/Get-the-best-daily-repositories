import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { createGithubUserUseCase } from "@/use-cases/users";
import { setSession } from "@/app/api/login/google/callback/route";
import { getAccountByGithubIdUseCase } from "@/use-cases/accounts";
import { github } from "@/lib/auth";
import { afterLoginUrl } from "@/app-config";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("github_oauth_state")?.value ?? null;
  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const tokens = await github.validateAuthorizationCode(code);
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    const githubUser: GitHubUser = await githubUserResponse.json();

    const existingAccount = await getAccountByGithubIdUseCase(githubUser.id);

    if (existingAccount) {
      await setSession(existingAccount.userId);
      return new Response(null, {
        status: 302,
        headers: {
          Location: afterLoginUrl,
        },
      });
    }

    const userId = await createGithubUserUseCase(githubUser);
    await setSession(userId);
    return new Response(null, {
      status: 302,
      headers: {
        Location: afterLoginUrl,
      },
    });
  } catch (e) {
    console.error(e);
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }
}

export interface GitHubUser {
  id: string;
  login: string;
  avatar_url: string;
  email: string;
}
