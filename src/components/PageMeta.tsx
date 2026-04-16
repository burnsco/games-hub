import { Helmet } from "react-helmet-async";

type PageMetaProps = {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
};

export function PageMeta({ title, description, ogTitle, ogDescription }: PageMetaProps) {
  const documentTitle = `${title} | Games Hub`;
  return (
    <Helmet>
      <title>{documentTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={ogTitle ?? documentTitle} />
      <meta property="og:description" content={ogDescription ?? description} />
    </Helmet>
  );
}
