import Link from "next/link";

type ProjectCardProps = {
  title: string;
  description: string;
  tags: string[];
  href: string;
};

export function ProjectCard({
  title,
  description,
  tags,
  href,
}: ProjectCardProps) {
  return (
    <article className="group rounded-md border border-[oklch(92.2%_0_0)] bg-[oklch(100%_0_0)] p-6 transition duration-300 hover:-translate-y-1 hover:border-[oklch(87%_0_0)] hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-[oklch(14.5%_0_0)]">{title}</h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[oklch(43.9%_0_0)]">
            {description}
          </p>
        </div>
        <span className="text-[oklch(87%_0_0)] transition duration-300 group-hover:translate-x-1 group-hover:text-[oklch(37.1%_0_0)]">
          -&gt;
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-[oklch(92.2%_0_0)] px-2 py-1 text-xs text-[oklch(55.6%_0_0)]"
          >
            {tag}
          </span>
        ))}
      </div>

      <Link
        href={href}
        className="mt-8 inline-flex items-center text-sm font-semibold text-[oklch(14.5%_0_0)] transition duration-300 hover:text-[oklch(43.9%_0_0)]"
      >
        Discuss this type of work
      </Link>
    </article>
  );
}
