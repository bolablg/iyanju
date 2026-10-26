import { ButtonLink, Eyebrow } from "@/components/ui";
export default function NotFound() {
  return (
    <div className="container not-found">
      <span className="error-number" aria-hidden="true">
        404
      </span>
      <Eyebrow>A SMALL DETOUR</Eyebrow>
      <h1>
        This page hasn’t
        <br />
        <em>found its place.</em>
      </h1>
      <p>
        The link may have changed, or the page may not exist. There’s still
        something useful back at the start.
      </p>
      <ButtonLink href="/">Back to iYanJu</ButtonLink>
    </div>
  );
}
