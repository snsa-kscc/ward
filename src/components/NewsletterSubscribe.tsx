import { actions } from "astro:actions";
import { useActionState, useRef } from "react";
import { experimental_withState as withState } from "@astrojs/react/actions";

export function NewsletterSubscribe({
  button,
  lang,
}: {
  button: string;
  lang: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    // async () => {
    //   const formData = new FormData(formRef.current!);
    //   const { data, error } = await actions.newsletterSubscribe(formData);
    //   return {
    //     data,
    //     error,
    //   };
    // },
    withState(actions.newsletterSubscribe),
    {
      data: { success: false },
      error: undefined,
    },
  );

  return (
    <div>
      <form action={action} ref={formRef}>
        <label htmlFor="email">
          {lang === "hr" ? "Email" : "Email"}
          <span className="text-red-500">*</span>
        </label>
        <input
          name="email"
          type="email"
          placeholder="your@email.com"
          required
        />
        <button type="submit" disabled={pending}>
          {button}
        </button>
      </form>
      <p className="text-center text-sm text-red-500">
        {state?.error?.message &&
          (lang === "hr" ? "Nešto je pošlo po krivu" : "Something went wrong")}
      </p>
      <p className="text-center text-sm text-green-500">
        {state?.data?.success
          ? lang === "hr"
            ? "Hvala na pretplati!"
            : "Thanks for subscribing!"
          : ""}
      </p>
      {pending && (
        <p className="text-center text-sm text-blue-500">
          {lang === "hr" ? "Pokušavamo se prijaviti" : "Trying to sign up"}
        </p>
      )}
    </div>
  );
}
