import React from 'react';

export default function About() {
  return (
    <div className="flex-1 w-full">
      {/* Hero */}
      <section className="relative py-24 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070')] bg-cover bg-center opacity-20 mix-blend-multiply"></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">Our Story</h1>
          <p className="text-xl text-primary-foreground/90 leading-relaxed">
            Bridging the gap between rural purity and urban convenience. Bringing the village to the city.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg prose-emerald mx-auto">
            <h2 className="font-serif text-3xl text-primary font-bold mb-6">The PindBazaar Promise</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              In a world of mass-produced, chemically processed foods, we yearned for the taste of our childhood — the pure desi ghee that filled the house with its aroma, the unadulterated honey straight from the comb, and the rich, natural oils pressed traditionally. We realized that city dwellers were paying premium prices for "organic" labels that lacked true authenticity.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              PindBazaar was born from a simple idea: what if we could connect the honest, hardworking farmers of our villages directly with families in the city? What if we could guarantee purity not through expensive certifications, but through transparent, direct sourcing?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
              <img 
                src="https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=2070" 
                alt="Village Farming" 
                className="rounded-2xl shadow-lg w-full h-64 object-cover"
              />
              <img 
                src="https://images.unsplash.com/photo-1628183204961-39644eab8bce?q=80&w=2070" 
                alt="Desi Ghee Preparation" 
                className="rounded-2xl shadow-lg w-full h-64 object-cover"
              />
            </div>

            <h3 className="font-serif text-2xl text-primary font-bold mb-4">Uncompromising Quality</h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              We travel to remote villages to find the best producers. We don't negotiate on quality. When you buy from PindBazaar, you are not just buying a product; you are supporting a rural ecosystem and preserving traditional methods of food preparation that are slowly being lost to industrialization.
            </p>

            <div className="bg-secondary/50 p-8 rounded-2xl border my-12 text-center">
              <h4 className="font-serif text-xl font-bold mb-2">Our Mission</h4>
              <p className="text-muted-foreground italic">
                "To provide every household with access to 100% pure, natural, and authentic village foods while empowering rural communities."
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
