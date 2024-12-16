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
    <form action={action} ref={formRef} className="flex items-end gap-4">
      <input
        name="email"
        type="email"
        placeholder={lang === "hr" ? "Vaš email" : "Your email"}
        required
        className="w-full border-0 border-b-2 border-zinc-300 bg-transparent p-2 text-white focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-slate-100 font-bold text-slate-800 duration-300 ~text-xl/2xl ~px-10/16 ~py-2/6 hover:bg-slate-400 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {pending ? (lang === "hr" ? "Šaljem..." : "Submitting...") : button}
      </button>
    </form>
  );
}
