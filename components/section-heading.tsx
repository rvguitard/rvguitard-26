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
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-[oklch(70.8%_0_0)]">
        {eyebrow}
      </p>
      <h2 className="max-w-2xl text-3xl font-semibold leading-tight text-[oklch(14.5%_0_0)] sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-7 text-[oklch(43.9%_0_0)] sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
