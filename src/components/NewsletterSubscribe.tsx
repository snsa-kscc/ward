import { actions } from "astro:actions";
import { useRef, useEffect, useActionState } from "react";
import { experimental_withState as withState } from "@astrojs/react/actions";
import { useToast } from "@/hooks/use-toast";

export function NewsletterSubscribe({
  button,
  lang,
}: {
  button: string;
  lang: string;
}) {
  const { toast } = useToast();
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

  useEffect(() => {
    if (state?.error?.message) {
      toast({
        title: lang === "hr" ? "Greška" : "Error",
        description:
          lang === "hr" ? "Nešto je pošlo po krivu" : "Something went wrong",
        variant: "destructive",
      });
    }
    if (state?.data?.success) {
      toast({
        title: lang === "hr" ? "Uspjeh" : "Success",
        description:
          lang === "hr" ? "Hvala na pretplati!" : "Thanks for subscribing!",
        variant: "default",
      });
    }
  }, [state]);

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
          className="w-full rounded-md border-2 border-zinc-300 bg-zinc-100 p-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button type="submit" disabled={pending}>
          {pending ? (lang === "hr" ? "Šaljem..." : "Submitting...") : button}
        </button>
      </form>
    </div>
  );
}
