import { useListGallery } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Gallery() {
  const { data: images, isLoading } = useListGallery();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary">Our Gallery</h1>
        <p className="mt-4 text-muted-foreground text-lg">A Visual Feast Of Our Favorite Creations, From Intimate Date Nights To Massive Wedding Grazing Tables.</p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="break-inside-avoid">
              <Skeleton className="w-full h-64 rounded-2xl mb-6" style={{ height: Math.floor(Math.random() * 200 + 200) + 'px' }} />
            </div>
          ))
        ) : (
          images?.map((image) => (
            <div key={image.id} className="break-inside-avoid relative group overflow-hidden rounded-2xl bg-muted mb-6">
              <img 
                src={image.url} 
                alt={image.caption} 
                className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">{image.category}</span>
                <p className="text-white font-medium">{image.caption}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
