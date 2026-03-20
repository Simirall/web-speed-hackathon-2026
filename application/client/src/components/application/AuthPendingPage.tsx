import { Helmet } from "react-helmet";

interface Props {
  title: string;
  message: string;
}

export const AuthPendingPage = ({ title, message }: Props) => {
  return (
    <>
      <Helmet>
        <title>{title} - CaX</title>
      </Helmet>
      <section className="space-y-3 px-6 py-12 text-center">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-cax-brand-soft" />
        <p className="text-lg font-bold">アカウント確認中です</p>
        <p className="text-cax-text-muted text-sm">{message}</p>
      </section>
    </>
  );
};
