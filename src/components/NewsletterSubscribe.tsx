import { actions } from "astro:actions";
import { useRef, useEffect, useActionState } from "react";
import { withState } from "@astrojs/react/actions";
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
    <form action={action} ref={formRef} className="flex items-end gap-4">
      <input
        name="email"
        type="email"
        placeholder={lang === "hr" ? "Vaš email" : "Your email"}
        required
        className="w-full border-0 border-b-2 border-zinc-300 bg-transparent p-2 text-slate-100 focus:outline-hidden"
      />
      <button
        type="submit"
        disabled={pending}
        className="~px-6/10 ~py-2/3 rounded-full bg-slate-100 text-base text-slate-800 duration-300 hover:bg-slate-400 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {pending ? (lang === "hr" ? "Šaljem" : "Sending") : button}
      </button>
    </form>
  );
}
