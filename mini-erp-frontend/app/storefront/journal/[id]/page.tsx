"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ArticleDetailPage() {
  const params = useParams();
  
  return (
    <div className="bg-sf-background min-h-screen antialiased">
      {/* Hero Image */}
      <div className="max-w-[1440px] mx-auto px-5 md:px-16 pt-8 pb-12">
        <div className="w-full aspect-[21/9] md:aspect-[21/8] bg-sf-surface-container rounded-2xl overflow-hidden relative">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiphz7kMlrx-HZLL4ByS_Bch0EjBfysPm5ZoG03jxRZe3z5mshipBNX03xuginZ6J1hrj_TcYgrBHEYBvy9ozHTZPFeUmXjzJJ6py1WiZNaPOO6uSsJZjvNW01xJojtRlRIa7YNnOhibNBvk42TGLEXy98oFO7L3Q4_jAS0akNaI4T4pyWMxtiTYBsqIwLFAvRkjsEa4cKk_d2H1yJsVriCHDXjEjFPYEZBoVJb1YB0Yrq4-2Sfs2j" 
            alt="The Art of Root-to-Stem Cooking"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-5 pb-20">
        
        {/* Article Header */}
        <header className="text-center mb-12">
          <div className="font-sf-body text-sf-label-caps uppercase text-[#e9bd54] tracking-widest font-bold mb-4">
            SUSTAINABILITY
          </div>
          <h1 className="font-sf-display text-[40px] md:text-[56px] leading-[1.1] text-sf-primary font-bold mb-6">
            The Art of Root-to-Stem Cooking
          </h1>
          <div className="font-sf-body text-sf-body-md text-sf-on-surface-variant">
            By <span className="font-semibold text-sf-on-surface">Sarah Jenkins</span> &nbsp;&bull;&nbsp; Oct 24, 2023
          </div>
        </header>

        {/* Article Body */}
        <div className="prose prose-lg max-w-none font-sf-body text-sf-on-surface-variant leading-relaxed space-y-8">
          <p className="text-[18px]">
            In our modern culinary landscape, we've grown accustomed to discarding the less "desirable" parts of our produce. We toss carrot tops, peel away broccoli stalks, and compost beet greens without a second thought. However, a growing movement is challenging this wasteful habit: <strong>root-to-stem cooking</strong>.
          </p>
          
          <p className="text-[18px]">
            Much like the "nose-to-tail" philosophy in meat consumption, root-to-stem advocates for utilizing every edible part of a plant. This approach isn't just about reducing waste—though that is a significant and crucial benefit—it's also about discovering new flavors, textures, and nutritional profiles that we've been missing out on.
          </p>

          {/* Inline Image */}
          <figure className="my-12">
            <div className="rounded-xl overflow-hidden border border-sf-surface-variant">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDg4_NB8rfxWsO77VDlJGiP1LWpKukVcx2Z30bZK3VGIBJsCYmoBR9sLtbRPuC0RP545DXUuYFrzylFVko81CUU9WjSIUPjtZ1fyTuIr2-3mmsB0K95WsQNvX6HtILf5HOdJTdB3R5Z8XD9fq8zrAEwkW_C2n2OelizPVZnZff3ZuPDa_gg6DzUTB8fd39U2HpBuw4UCaenDQPzjeCZfBKdrGEWqqh2qyku76BZbAHWFdym2QWTsOEO" 
                alt="Fresh harvested beet greens"
                className="w-full h-auto"
              />
            </div>
            <figcaption className="text-center mt-4 font-sf-body text-sm text-sf-on-surface-variant/70 italic">
              Fresh harvested beet greens. Photo by Alex Martin
            </figcaption>
          </figure>

          <h2 className="font-sf-display text-[32px] text-sf-primary font-bold mt-16 mb-6">
            Embrace the Entirety
          </h2>
          
          <p className="text-[18px]">
            Consider the humble radish. While the crisp, peppery red globe is the star of the show, its leafy green tops are entirely edible and pack a nutritional punch. They have a slightly fuzzy texture when raw, which disappears upon cooking, making them a perfect substitute for spinach or kale in sautés and soups.
          </p>

          <blockquote className="my-10 pl-6 border-l-4 border-[#ff914d] italic text-[22px] font-sf-display text-sf-primary leading-snug">
            "The creativity required to utilize the entirety of a vegetable often leads to the most memorable and innovative dishes in my kitchen."
            <footer className="text-sm font-sf-body text-sf-on-surface-variant mt-3 not-italic font-semibold">— Chef Thomas Keller</footer>
          </blockquote>

          <p className="text-[18px]">
            Starting your root-to-stem journey doesn't require a culinary degree. It simply requires a shift in perspective. Here are a few easy ways to begin incorporating more of your vegetables into your meals:
          </p>

          <ul className="space-y-4 my-8 pl-2">
            <li className="flex items-start gap-4">
              <span className="material-symbols-outlined text-[#ff914d] mt-1 text-[20px]">check_circle</span>
              <span className="text-[18px]"><strong>Carrot Tops:</strong> Blend them into a vibrant pesto with walnuts, garlic, olive oil, and parmesan cheese.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="material-symbols-outlined text-[#ff914d] mt-1 text-[20px]">check_circle</span>
              <span className="text-[18px]"><strong>Broccoli Stalks:</strong> Peel the tough outer layer, then julienne the tender core for slaws or slice into rounds for stir-fries.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="material-symbols-outlined text-[#ff914d] mt-1 text-[20px]">check_circle</span>
              <span className="text-[18px]"><strong>Potato Peels:</strong> Toss with olive oil, salt, and paprika, then roast until crispy for a delicious snack.</span>
            </li>
          </ul>

          <p className="text-[18px]">
            By rethinking what we consider "scraps," we can stretch our grocery budget, reduce our environmental footprint, and expand our culinary horizons. The next time you prep vegetables, take a moment to consider if that stem, leaf, or peel might just be the secret ingredient your dish needs.
          </p>
        </div>

        {/* Footer Tags & Share */}
        <div className="mt-16 pt-8 border-t border-sf-surface-variant flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex gap-3">
            <span className="px-4 py-2 border border-sf-surface-variant rounded-full font-sf-body text-sf-label-caps uppercase tracking-widest text-sf-on-surface hover:bg-sf-surface-container-low cursor-pointer transition-colors">
              SUSTAINABILITY
            </span>
            <span className="px-4 py-2 border border-sf-surface-variant rounded-full font-sf-body text-sf-label-caps uppercase tracking-widest text-sf-on-surface hover:bg-sf-surface-container-low cursor-pointer transition-colors">
              COOKING TIPS
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="font-sf-body text-sm font-semibold uppercase tracking-wider text-sf-on-surface-variant">Share</span>
            <button className="w-10 h-10 rounded-full bg-sf-surface-container flex items-center justify-center text-sf-primary hover:bg-[#ff914d] hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">link</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-sf-surface-container flex items-center justify-center text-sf-primary hover:bg-[#ff914d] hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </button>
          </div>
        </div>
      </article>

      {/* More from The Journal */}
      <section className="bg-sf-surface-container-lowest py-20 border-t border-sf-surface-variant">
        <div className="max-w-[1440px] mx-auto px-5 md:px-16">
          <div className="flex justify-between items-end mb-10">
            <h2 className="font-sf-display text-[32px] text-sf-primary font-bold">
              More from The Journal
            </h2>
            <Link href="/storefront/journal" className="font-sf-body text-sf-label-caps uppercase tracking-widest font-bold text-[#ff914d] hover:text-[#e67e3a] transition-colors flex items-center gap-1">
              VIEW ALL <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Link href="/storefront/journal/2" className="group block">
              <div className="aspect-[4/3] rounded-xl overflow-hidden mb-6 bg-sf-surface-container">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4P4dhdUCvawESHxa7ebsy2jL1A67ANY4CZAvP_xzfAbjy-ndLf_Iyd3IzUgPV6jGfmUSqHrca4uetm2JXErTbm2CwhJDwCA0humx1ymqXgdumNUxDfuWIBCST5bq6VOhGgZG9-gsZPQf62Tb81ICTf4_C0YtgaVAEus8b248l0WbLjw3gCCOscfZ1twlsTNtwBlP9ddOHiqBqg-7caVB517Qeohy0ufRxwetUnHAt7Vnm-DLq19y-" 
                  alt="Slow Mornings"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="font-sf-body text-sf-label-caps uppercase tracking-widest text-[#e9bd54] font-bold mb-3">RECIPES</div>
              <h3 className="font-sf-display text-xl text-sf-primary font-bold mb-3 group-hover:text-[#ff914d] transition-colors">
                Slow Mornings: The Perfect Olive Oil & Rosemary Sourdough
              </h3>
              <p className="font-sf-body text-sf-on-surface-variant line-clamp-2">
                Embrace the slowness of weekend mornings with this deeply satisfying sourdough recipe...
              </p>
            </Link>

            {/* Card 2 */}
            <Link href="/storefront/journal/3" className="group block">
              <div className="aspect-[4/3] rounded-xl overflow-hidden mb-6 bg-sf-surface-container">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDg4_NB8rfxWsO77VDlJGiP1LWpKukVcx2Z30bZK3VGIBJsCYmoBR9sLtbRPuC0RP545DXUuYFrzylFVko81CUU9WjSIUPjtZ1fyTuIr2-3mmsB0K95WsQNvX6HtILf5HOdJTdB3R5Z8XD9fq8zrAEwkW_C2n2OelizPVZnZff3ZuPDa_gg6DzUTB8fd39U2HpBuw4UCaenDQPzjeCZfBKdrGEWqqh2qyku76BZbAHWFdym2QWTsOEO" 
                  alt="Minimizing Waste"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="font-sf-body text-sf-label-caps uppercase tracking-widest text-[#e9bd54] font-bold mb-3">SUSTAINABILITY</div>
              <h3 className="font-sf-display text-xl text-sf-primary font-bold mb-3 group-hover:text-[#ff914d] transition-colors">
                Minimizing Waste: A Practical Guide to the Zero-Waste Pantry
              </h3>
              <p className="font-sf-body text-sf-on-surface-variant line-clamp-2">
                Transitioning to a zero-waste lifestyle doesn't happen overnight. It's a journey of small, intentional choices...
              </p>
            </Link>

            {/* Card 3 */}
            <Link href="/storefront/journal/4" className="group block">
              <div className="aspect-[4/3] rounded-xl overflow-hidden mb-6 bg-sf-surface-container">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiphz7kMlrx-HZLL4ByS_Bch0EjBfysPm5ZoG03jxRZe3z5mshipBNX03xuginZ6J1hrj_TcYgrBHEYBvy9ozHTZPFeUmXjzJJ6py1WiZNaPOO6uSsJZjvNW01xJojtRlRIa7YNnOhibNBvk42TGLEXy98oFO7L3Q4_jAS0akNaI4T4pyWMxtiTYBsqIwLFAvRkjsEa4cKk_d2H1yJsVriCHDXjEjFPYEZBoVJb1YB0Yrq4-2Sfs2j" 
                  alt="Farmers Regenerating Our Land"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="font-sf-body text-sf-label-caps uppercase tracking-widest text-[#e9bd54] font-bold mb-3">GROWERS</div>
              <h3 className="font-sf-display text-xl text-sf-primary font-bold mb-3 group-hover:text-[#ff914d] transition-colors">
                The Art of Soil: Meet the Farmers Regenerating Our Land
              </h3>
              <p className="font-sf-body text-sf-on-surface-variant line-clamp-2">
                Discover the profound impact of regenerative agriculture through the stories of local farmers...
              </p>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
