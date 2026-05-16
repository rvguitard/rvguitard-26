type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
        {eyebrow}
      </p>
      <h2 className="max-w-2xl text-3xl font-semibold leading-tight text-neutral-950 sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
