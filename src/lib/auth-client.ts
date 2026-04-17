import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
    fetchOptions: {
        onError(context) {
            if (context.error.message?.includes("Failed to get session") || context.error.status === 401) {
                alert("Session Expired, Reloading");
                window.location.reload();
            }
        }
    }
});
