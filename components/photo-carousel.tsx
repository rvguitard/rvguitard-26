import Image from "next/image";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const withBasePath = (path: string) => `${basePath}${path}`;

const photos = [
  {
    alt: "Rock smiling by Mount Fuji in Japan",
    caption: "Cycling Fujikawaguchiko",
    objectPosition: "38% 50%",
    src: "/photos/japan.webp",
  },
  {
    alt: "A misty lighthouse view in Vancouver",
    caption: "Vancouver island",
    objectPosition: "50% 50%",
    src: "/photos/vancouver.webp",
  },
  {
    alt: "Tuna the dog sitting in a laundry basket",
    caption: "Laundry assistant, Tuna",
    objectPosition: "52% 42%",
    src: "/photos/tuna.webp",
  },
   {
    alt: "Our wedding!",
    caption: "August 3, 2024",
    objectPosition: "52% 42%",
    src: "/photos/wedding.png",
  },
];

const carouselPhotos = [...photos, ...photos];

export function PhotoCarousel() {
  return (
    <div className="photo-carousel" aria-label="Personal photos">
      <div className="photo-carousel-track">
        {carouselPhotos.map((photo, index) => (
          <figure
            className="photo-card"
            key={`${photo.src}-${index}`}
            tabIndex={0}
          >
            <Image
              src={withBasePath(photo.src)}
              alt={photo.alt}
              width={233}
              height={146}
              style={{ objectPosition: photo.objectPosition }}
            />
            <figcaption>{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
