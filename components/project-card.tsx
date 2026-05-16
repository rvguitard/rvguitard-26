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
    <article className="group rounded-md border border-neutral-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-neutral-950">{title}</h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-600">
            {description}
          </p>
        </div>
        <span className="text-neutral-300 transition duration-300 group-hover:translate-x-1 group-hover:text-neutral-700">
          -&gt;
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-500"
          >
            {tag}
          </span>
        ))}
      </div>

      <Link
        href={href}
        className="mt-8 inline-flex items-center text-sm font-semibold text-neutral-950 transition duration-300 hover:text-neutral-600"
      >
        Discuss this type of work
      </Link>
    </article>
  );
}
